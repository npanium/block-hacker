// host/src/main.rs
use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Result};
use risc0_zkvm::{default_prover, ExecutorEnv};
use serde::{Deserialize, Serialize};
use std::time::Instant;

// Import guest code
use methods::{METHOD_ELF, METHOD_ID};

mod relayer_client;
use log::info;
use relayer_client::RelayerClient;

// Game session data structure
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, Hash)]
pub struct GameSession {
    pub player_address: [u8; 20], // Ethereum address as bytes
    pub start_timestamp: u64,     // Unix timestamp when game started
    pub end_timestamp: u64,       // Unix timestamp when game ended
    pub blocks_destroyed: u32,    // Total blocks destroyed in session
    pub decisions_made: Vec<u8>,  // Decision IDs made during session
    pub final_soul_tokens: u64,   // Final soul token balance
    pub total_clicks: u32,        // Total clicks made
    pub version: u8,              // Circuit version for future compatibility
}

// Game verification output
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct VerificationResult {
    pub player_address: [u8; 20],
    pub tokens_earned: u64,
    pub session_hash: [u8; 32],
    pub is_valid: bool,
}

#[derive(Debug, Deserialize)]
struct ProofRequest {
    player_address: String,
    start_timestamp: u64,
    end_timestamp: u64,
    blocks_destroyed: u32,
    decisions_made: Vec<u8>,
    final_soul_tokens: u64,
    total_clicks: u32,
    version: u8,
}

#[derive(Debug, Serialize)]
struct ProofResponse {
    success: bool,
    proof_verified: bool,
    execution_time_ms: u128,
    proof: Option<String>,   // Hex-encoded CBOR receipt
    journal: Option<String>, // Hex-encoded journal
    image_id: String,        // Hex-encoded image ID
    verification_result: Option<VerificationResult>,
    // Relayer fields
    relayer_job_id: Option<String>,
    tx_hash: Option<String>,
    block_hash: Option<String>,
    aggregation_id: Option<u32>,
    error: Option<String>,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    verifier_image_id: String,
    version: String,
}

impl ProofRequest {
    fn to_game_session(&self) -> Result<GameSession, String> {
        // Convert hex string to bytes
        let address_hex = self.player_address.trim_start_matches("0x");
        let address_bytes =
            hex::decode(address_hex).map_err(|e| format!("Invalid address format: {}", e))?;

        if address_bytes.len() != 20 {
            return Err("Address must be 20 bytes".to_string());
        }

        let mut player_address = [0u8; 20];
        player_address.copy_from_slice(&address_bytes);

        Ok(GameSession {
            player_address,
            start_timestamp: self.start_timestamp,
            end_timestamp: self.end_timestamp,
            blocks_destroyed: self.blocks_destroyed,
            decisions_made: self.decisions_made.clone(),
            final_soul_tokens: self.final_soul_tokens,
            total_clicks: self.total_clicks,
            version: self.version,
        })
    }
}

// Health check endpoint
async fn health() -> Result<HttpResponse> {
    let image_id_bytes: Vec<u8> = METHOD_ID
        .into_iter()
        .flat_map(|v| v.to_le_bytes().into_iter())
        .collect();

    let response = HealthResponse {
        status: "healthy".to_string(),
        verifier_image_id: hex::encode(&image_id_bytes),
        version: "1.0.0".to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}

// Main proving endpoint
async fn prove_game_session(req: web::Json<ProofRequest>) -> Result<HttpResponse> {
    let start_time = Instant::now();

    println!("Received proof request: {:?}", req);

    // Convert request to game session
    let game_session = match req.to_game_session() {
        Ok(session) => session,
        Err(e) => {
            return Ok(HttpResponse::BadRequest().json(ProofResponse {
                success: false,
                proof_verified: false,
                execution_time_ms: start_time.elapsed().as_millis(),
                proof: None,
                journal: None,
                image_id: hex::encode(
                    METHOD_ID
                        .into_iter()
                        .flat_map(|v| v.to_le_bytes().into_iter())
                        .collect::<Vec<_>>(),
                ),
                verification_result: None,
                relayer_job_id: None,
                tx_hash: None,
                block_hash: None,
                aggregation_id: None,
                error: Some(e),
            }));
        }
    };

    // Create executor environment
    let env = match ExecutorEnv::builder().write(&game_session).unwrap().build() {
        Ok(env) => env,
        Err(e) => {
            return Ok(HttpResponse::InternalServerError().json(ProofResponse {
                success: false,
                proof_verified: false,
                execution_time_ms: start_time.elapsed().as_millis(),
                proof: None,
                journal: None,
                image_id: hex::encode(
                    METHOD_ID
                        .into_iter()
                        .flat_map(|v| v.to_le_bytes().into_iter())
                        .collect::<Vec<_>>(),
                ),
                verification_result: None,
                relayer_job_id: None,
                tx_hash: None,
                block_hash: None,
                aggregation_id: None,
                error: Some(format!("Failed to create executor environment: {}", e)),
            }));
        }
    };

    // Generate proof
    println!("Starting proof generation...");
    let prover = default_prover();
    let prove_info = match prover.prove(env, METHOD_ELF) {
        Ok(prove_info) => prove_info,
        Err(e) => {
            return Ok(HttpResponse::InternalServerError().json(ProofResponse {
                success: false,
                proof_verified: false,
                execution_time_ms: start_time.elapsed().as_millis(),
                proof: None,
                journal: None,
                image_id: hex::encode(
                    METHOD_ID
                        .into_iter()
                        .flat_map(|v| v.to_le_bytes().into_iter())
                        .collect::<Vec<_>>(),
                ),
                verification_result: None,
                relayer_job_id: None,
                tx_hash: None,
                block_hash: None,
                aggregation_id: None,
                error: Some(format!("Proof generation failed: {}", e)),
            }));
        }
    };

    let receipt = prove_info.receipt;

    // Verify the proof
    let proof_verified = receipt.verify(METHOD_ID).is_ok();

    println!(
        "Proof generated successfully in {}ms",
        start_time.elapsed().as_millis()
    );

    // Extract verification result from journal
    let verification_result: VerificationResult = match receipt.journal.decode() {
        Ok(result) => result,
        Err(e) => {
            return Ok(HttpResponse::InternalServerError().json(ProofResponse {
                success: false,
                proof_verified,
                execution_time_ms: start_time.elapsed().as_millis(),
                proof: None,
                journal: None,
                image_id: hex::encode(
                    METHOD_ID
                        .into_iter()
                        .flat_map(|v| v.to_le_bytes().into_iter())
                        .collect::<Vec<_>>(),
                ),
                verification_result: None,
                relayer_job_id: None,
                tx_hash: None,
                block_hash: None,
                aggregation_id: None,
                error: Some(format!("Failed to decode journal: {}", e)),
            }));
        }
    };

    // Serialize receipt using CBOR (like your previous implementation)
    let mut bin_receipt = Vec::new();
    if let Err(e) = ciborium::into_writer(&receipt, &mut bin_receipt) {
        return Ok(HttpResponse::InternalServerError().json(ProofResponse {
            success: false,
            proof_verified,
            execution_time_ms: start_time.elapsed().as_millis(),
            proof: None,
            journal: None,
            image_id: hex::encode(
                METHOD_ID
                    .into_iter()
                    .flat_map(|v| v.to_le_bytes().into_iter())
                    .collect::<Vec<_>>(),
            ),
            verification_result: None,
            relayer_job_id: None,
            tx_hash: None,
            block_hash: None,
            aggregation_id: None,
            error: Some(format!("Failed to serialize receipt: {}", e)),
        }));
    }

    // Create hex-encoded responses matching your format
    let proof_hex = "0x".to_owned() + &hex::encode(&bin_receipt);
    let journal_hex = "0x".to_owned() + &hex::encode(&receipt.journal.bytes.as_slice());
    let image_id_hex = hex::encode(
        METHOD_ID
            .into_iter()
            .flat_map(|v| v.to_le_bytes().into_iter())
            .collect::<Vec<_>>(),
    );
    // Submit to zkVerify relayer
    let relayer_client = match RelayerClient::new() {
        Ok(client) => client,
        Err(e) => {
            return Ok(HttpResponse::Ok().json(ProofResponse {
                success: true,
                proof_verified,
                execution_time_ms: start_time.elapsed().as_millis(),
                proof: Some(proof_hex),
                journal: Some(journal_hex),
                image_id: image_id_hex,
                verification_result: Some(verification_result),
                relayer_job_id: None,
                tx_hash: None,
                block_hash: None,
                aggregation_id: None,
                error: Some(format!("Failed to create relayer client: {}", e)),
            }));
        }
    };
    let chain_id = 845320009; // Horizen testnet

    let mut relayer_job_id = None;
    let mut tx_hash = None;
    let mut block_hash = None;
    let mut aggregation_id = None;

    match relayer_client
        .submit_proof_with_aggregation(
            proof_hex.clone(),
            journal_hex.clone(),
            format!("0x{}", image_id_hex),
            chain_id,
        )
        .await
    {
        Ok(submit_response) => {
            println!("✅ Relayer submission successful: {:?}", submit_response);
            relayer_job_id = Some(submit_response.job_id.clone());

            // Poll for aggregation
            match relayer_client
                .poll_until_aggregated(&submit_response.job_id)
                .await
            {
                Ok(status_response) => {
                    println!("✅ Aggregation completed: {:?}", status_response);
                    tx_hash = status_response.tx_hash;
                    block_hash = status_response.block_hash;
                    aggregation_id = status_response.aggregation_id;
                    info!("Proof successfully aggregated and published");
                }
                Err(e) => {
                    println!("❌ Aggregation polling failed: {}", e);
                }
            }
        }
        Err(e) => {
            println!("❌ Relayer submission failed: {}", e);
        }
    }

    // Update the final response to include relayer data
    Ok(HttpResponse::Ok().json(ProofResponse {
        success: true,
        proof_verified,
        execution_time_ms: start_time.elapsed().as_millis(),
        proof: Some(proof_hex),
        journal: Some(journal_hex),
        image_id: image_id_hex,
        verification_result: Some(verification_result),
        relayer_job_id,
        tx_hash,
        block_hash,
        aggregation_id,
        error: None,
    }))
}

// Get verifier image ID endpoint
async fn get_image_id() -> Result<HttpResponse> {
    #[derive(Serialize)]
    struct ImageIdResponse {
        image_id: String,
        image_id_bytes: Vec<u8>,
    }

    let image_id_bytes: Vec<u8> = METHOD_ID
        .into_iter()
        .flat_map(|v| v.to_le_bytes().into_iter())
        .collect();

    Ok(HttpResponse::Ok().json(ImageIdResponse {
        image_id: hex::encode(&image_id_bytes),
        image_id_bytes,
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    env_logger::init();
    let image_id_bytes: Vec<u8> = METHOD_ID
        .into_iter()
        .flat_map(|v| v.to_le_bytes().into_iter())
        .collect();

    println!("Starting RISC0 Game Verifier Service");
    println!("Verifier Image ID: {}", hex::encode(&image_id_bytes));

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .route("/health", web::get().to(health))
            .route("/prove", web::post().to(prove_game_session))
            .route("/image-id", web::get().to(get_image_id))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
