// File: app/api/airdrop-tokens/route.ts (App Router)
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { keccak256, encodePacked } from "viem";
import { abi } from "@/ABI/GameTokens.json";

// Configuration
const CONTRACT_ADDRESS = process.env.GAME_TOKEN_CONTRACT_ADDRESS!;
const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.AIRDROP_PRIVATE_KEY!;

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

interface AirdropRequest {
  playerAddress: string;
  blocksDestroyed: number;
  aggregationId: string;
  proofVerified: boolean;
  proofData?: {
    aggregationId?: number;
    domainId?: number;
    aggregationDetails?: {
      leaf: string;
      leafIndex: number;
      numberOfLeaves: number;
      merkleProof: string[];
    };
    verification_result?: {
      is_valid: boolean;
      session_hash: number[];
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AirdropRequest = await req.json();
    const {
      playerAddress,
      blocksDestroyed,
      aggregationId,
      proofVerified,
      proofData,
    } = body;

    // Validate request - now including zkVerify data
    if (!playerAddress || !blocksDestroyed || !aggregationId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["playerAddress", "blocksDestroyed", "aggregationId"],
        },
        { status: 400 }
      );
    }

    // Check for zkVerify aggregation details
    if (!proofData?.aggregationDetails) {
      return NextResponse.json(
        {
          error: "Missing zkVerify aggregation details",
        },
        { status: 400 }
      );
    }

    const aggregationDetails = proofData.aggregationDetails;

    // Validate zkVerify data
    if (
      !aggregationDetails.merkleProof ||
      !aggregationDetails.leafIndex ||
      !aggregationDetails.numberOfLeaves
    ) {
      return NextResponse.json(
        {
          error: "Incomplete zkVerify aggregation data",
        },
        { status: 400 }
      );
    }

    // Validate Ethereum address
    if (!ethers.isAddress(playerAddress)) {
      return NextResponse.json(
        {
          error: "Invalid Ethereum address",
        },
        { status: 400 }
      );
    }

    // Create unique proof hash to prevent replay attacks
    const proofHash = keccak256(
      encodePacked(
        ["address", "uint256", "string", "uint256"],
        [
          playerAddress as `0x${string}`,
          BigInt(blocksDestroyed),
          aggregationId,
          BigInt(Date.now()),
        ]
      )
    );

    console.log(`Processing airdrop for ${playerAddress}:`);
    console.log(`- Blocks destroyed: ${blocksDestroyed}`);
    console.log(`- Aggregation ID: ${aggregationId}`);
    console.log(`- Proof hash: ${proofHash}`);

    // Check if proof already used
    const isProofUsed = await contract.isProofUsed(proofHash);
    if (isProofUsed) {
      return NextResponse.json(
        {
          error: "Proof already used",
          proofHash,
        },
        { status: 409 }
      );
    }

    // Calculate expected reward
    const expectedReward = await contract.calculateReward(blocksDestroyed);
    console.log(
      `Expected reward: ${ethers.formatEther(expectedReward)} tokens`
    );

    // Execute airdrop transaction
    console.log("Executing airdrop transaction with zkVerify verification...");
    const { leaf, leafIndex, numberOfLeaves, merkleProof } =
      proofData.aggregationDetails;

    const tx = await contract.airdropTokens(
      playerAddress,
      blocksDestroyed,
      aggregationId,
      proofHash,
      // zkVerify parameters - you'll need to determine these values
      proofData.domainId, // domain_id
      proofData.aggregationId, // aggregation_id as number
      merkleProof, // merkle_path
      numberOfLeaves, // leaf_count
      leafIndex, // index
      leaf // public_inputs_hash (the leaf is the computed hash)
    );

    console.log(`Transaction sent: ${tx.hash}`);
    console.log("Waiting for confirmation...");

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Parse events to get actual token amount
    const airdropEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "TokensAirdropped";
      } catch {
        return false;
      }
    });

    let tokensAwarded = expectedReward;
    if (airdropEvent) {
      const parsed = contract.interface.parseLog(airdropEvent);
      tokensAwarded = parsed?.args?.tokensAwarded || expectedReward;
    }

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      playerAddress,
      blocksDestroyed,
      tokensAwarded: ethers.formatEther(tokensAwarded),
      aggregationId,
      proofHash,
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (error: any) {
    console.error("Airdrop error:", error);

    // Handle specific contract errors
    if (error.message?.includes("Proof already used")) {
      return NextResponse.json(
        {
          error: "Proof already used for airdrop",
        },
        { status: 409 }
      );
    }

    if (error.message?.includes("insufficient funds")) {
      return NextResponse.json(
        {
          error:
            "Airdrop service temporarily unavailable - insufficient gas funds",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Airdrop failed",
        message: error.message?.substring(0, 200),
      },
      { status: 500 }
    );
  }
}
