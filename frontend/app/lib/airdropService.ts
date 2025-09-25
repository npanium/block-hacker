export class AirdropService {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  async requestAirdrop(params: {
    playerAddress: string;
    blocksDestroyed: number;
    aggregationId: string;
    proofData: any;
  }) {
    const response = await fetch(`${this.baseUrl}/airdrop-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        proofVerified: params.proofData?.verification_result?.is_valid || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Airdrop request failed");
    }

    return response.json();
  }
}
