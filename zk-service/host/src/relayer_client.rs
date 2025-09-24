use anyhow::{anyhow, Result};
use log::info;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use tokio::time::{sleep, Duration};

#[derive(Serialize, Debug)]
pub struct RelayerSubmitRequest {
    #[serde(rename = "proofType")]
    pub proof_type: String,
    #[serde(rename = "vkRegistered")]
    pub vk_registered: bool,
    #[serde(rename = "chainId")]
    pub chain_id: u32,
    #[serde(rename = "proofOptions")]
    pub proof_options: ProofOptions,
    #[serde(rename = "proofData")]
    pub proof_data: ProofData,
}

#[derive(Serialize, Debug)]
pub struct ProofOptions {
    pub version: String,
}

#[derive(Serialize, Debug)]
pub struct ProofData {
    pub proof: String,
    #[serde(rename = "publicSignals")]
    pub public_signals: String,
    pub vk: String,
}

#[derive(Deserialize, Debug)]
pub struct RelayerSubmitResponse {
    #[serde(rename = "jobId")]
    pub job_id: String,
    #[serde(rename = "optimisticVerify")]
    pub optimistic_verify: String,
}

#[derive(Deserialize, Debug)]
pub struct RelayerStatusResponse {
    #[serde(rename = "jobId")]
    pub job_id: String,
    pub status: String,
    #[serde(rename = "statusId")]
    pub status_id: u32,
    #[serde(rename = "txHash")]
    pub tx_hash: Option<String>,
    #[serde(rename = "blockHash")]
    pub block_hash: Option<String>,
    #[serde(rename = "aggregationId")]
    pub aggregation_id: Option<u32>,
    #[serde(rename = "aggregationDetails")]
    pub aggregation_details: Option<AggregationDetails>,
}

#[derive(Deserialize, Debug)]
pub struct AggregationDetails {
    pub receipt: String,
    #[serde(rename = "receiptBlockHash")]
    pub receipt_block_hash: String,
    pub root: String,
    pub leaf: String,
    #[serde(rename = "leafIndex")]
    pub leaf_index: u32,
    #[serde(rename = "numberOfLeaves")]
    pub number_of_leaves: u32,
    #[serde(rename = "merkleProof")]
    pub merkle_proof: Vec<String>,
}

pub struct RelayerClient {
    client: Client,
    api_url: String,
    api_key: String,
}

impl RelayerClient {
    pub fn new() -> Result<Self> {
        let api_url = "https://relayer-api.horizenlabs.io/api/v1".to_string();
        let api_key = env::var("RELAYER_API_KEY")
            .map_err(|_| anyhow!("RELAYER_API_KEY environment variable not set"))?;

        Ok(RelayerClient {
            client: Client::new(),
            api_url,
            api_key,
        })
    }

    pub async fn submit_proof_with_aggregation(
        &self,
        proof: String,
        journal: String,
        image_id: String,
        chain_id: u32,
    ) -> Result<RelayerSubmitResponse> {
        let params = RelayerSubmitRequest {
            proof_type: "risc0".to_string(),
            vk_registered: true,
            chain_id,
            proof_options: ProofOptions {
                version: "V2_3".to_string(),
            },
            proof_data: ProofData {
                proof,
                public_signals: journal,
                vk: image_id,
            },
        };

        // Log the exact request being sent
        info!("=== RELAYER REQUEST ===");
        info!("URL: {}/submit-proof/{}", self.api_url, self.api_key);
        info!("Request body: {}", serde_json::to_string_pretty(&params)?);
        info!("=======================");

        let response = self
            .client
            .post(&format!("{}/submit-proof/{}", self.api_url, self.api_key))
            .json(&params)
            .send()
            .await?;

        let status = response.status();
        info!("Response status: {}", status);

        if !status.is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(anyhow!("HTTP error! status: {}, body: {}", status, text));
        }

        let response_text = response.text().await?;
        info!("Response body: {}", response_text);

        let response_data: RelayerSubmitResponse = serde_json::from_str(&response_text)?;

        if response_data.optimistic_verify != "success" {
            return Err(anyhow!("Proof verification failed, check proof artifacts"));
        }

        Ok(response_data)
    }

    pub async fn poll_until_aggregated(&self, job_id: &str) -> Result<RelayerStatusResponse> {
        info!("Polling for job aggregation: {}", job_id);

        loop {
            let response = self
                .client
                .get(&format!(
                    "{}/job-status/{}/{}",
                    self.api_url, self.api_key, job_id
                ))
                .send()
                .await?;

            if !response.status().is_success() {
                let status = response.status();
                let text = response.text().await.unwrap_or_default();
                return Err(anyhow!("HTTP error! status: {}, body: {}", status, text));
            }

            let job_status: RelayerStatusResponse = response.json().await?;

            info!("Job status: {}", job_status.status);

            match job_status.status.as_str() {
                "Aggregated" => {
                    info!("Job aggregated successfully");
                    return Ok(job_status);
                }
                "Failed" => {
                    return Err(anyhow!("Relayer job failed"));
                }
                _ => {
                    info!("Waiting for job to be aggregated...");
                    sleep(Duration::from_secs(20)).await; // 20 seconds as per docs
                }
            }
        }
    }
}
