export interface GameSessionData {
  playerAddress: string;
  startTimestamp: number;
  endTimestamp: number;
  blocksDestroyed: number;
  decisionsMade: number[];
  finalSoulTokens: number;
  totalClicks: number;
  version: number;
}

export interface VerificationResult {
  player_address: number[];
  tokens_earned: number;
  session_hash: number[];
  is_valid: boolean;
}
export interface AggregationDetails {
  receipt: string;
  receipt_block_hash: string;
  root: string;
  leaf: string;
  leaf_index: number;
  number_of_leaves: number;
  merkle_proof: string[];
}
export interface ProofResponse {
  success: boolean;
  proof_verified: boolean;
  execution_time_ms: number;
  proof?: string; // Hex-encoded CBOR receipt (0x prefixed)
  journal?: string; // Hex-encoded journal (0x prefixed)
  image_id: string; // Hex-encoded image ID
  verification_result?: VerificationResult;
  // Relayer/Aggregation fields
  relayer_job_id?: string;
  tx_hash?: string;
  block_hash?: string;
  aggregation_id?: number;
  domain_id?: number;
  aggregation_details?: AggregationDetails;
  error?: string;
}

export interface HealthResponse {
  status: string;
  verifier_image_id: string;
  version: string;
}

export class Risc0Client {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8080") {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getImageId(): Promise<{ image_id: string; image_id_bytes: number[] }> {
    const response = await fetch(`${this.baseUrl}/image-id`);
    if (!response.ok) {
      throw new Error(`Failed to get image ID: ${response.statusText}`);
    }
    return response.json();
  }

  async generateProofAndAggregate(
    sessionData: GameSessionData
  ): Promise<ProofResponse> {
    const response = await fetch(`${this.baseUrl}/prove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_address: sessionData.playerAddress,
        start_timestamp: sessionData.startTimestamp,
        end_timestamp: sessionData.endTimestamp,
        blocks_destroyed: sessionData.blocksDestroyed,
        decisions_made: sessionData.decisionsMade,
        final_soul_tokens: sessionData.finalSoulTokens,
        total_clicks: sessionData.totalClicks,
        version: sessionData.version,
      }),
    });

    if (!response.ok) {
      throw new Error(`Proof generation failed: ${response.statusText}`);
    }

    const result: ProofResponse = await response.json();

    if (!result.success) {
      throw new Error(`Proof generation failed: ${result.error}`);
    }

    return result;
  }
}
