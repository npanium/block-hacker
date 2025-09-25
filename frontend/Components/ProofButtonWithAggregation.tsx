import { useAccount } from "wagmi";
import {
  useGameProofWithAggregation,
  ProofStatus,
} from "../app/hooks/useGameProofWithAggregation";
import { useEffect, useState } from "react";
import { useGameContext } from "./GameContext";

interface ProofButtonProps {
  startTime: number;
  totalClicks: number;
  onProofGenerated: (proof: any) => void;
}

interface SessionDataDisplay {
  playerAddress: string;
  startTimestamp: number;
  endTimestamp: number;
  blocksDestroyed: number;
  decisionsMade: number[];
  finalSoulTokens: number;
  totalClicks: number;
  version: number;
}

export const ProofButtonWithAggregation: React.FC<ProofButtonProps> = ({
  startTime,
  totalClicks,
  onProofGenerated,
}) => {
  const { address } = useAccount();
  const {
    generateProofWithAggregation,
    isGenerating,
    progress,
    proofResult,
    error,
    client,
  } = useGameProofWithAggregation();

  const { currency, totalBlocksDestroyed, playerDecisionState } =
    useGameContext();

  const [serviceHealth, setServiceHealth] = useState<string>("checking...");
  const [showRequestData, setShowRequestData] = useState(false);
  const [requestData, setRequestData] = useState<SessionDataDisplay | null>(
    null
  );

  // Check service health on mount
  useEffect(() => {
    client
      .checkHealth()
      .then((health) => setServiceHealth(health.status))
      .catch(() => setServiceHealth("offline"));
  }, [client]);

  // Helper function to map choice IDs to numbers (same as in hook)
  const getDecisionIdNumber = (choiceId: string): number => {
    const choiceMap: Record<string, number> = {
      tech_precision: 1,
      tech_automation: 2,
      social_influence: 3,
      crew_cooperation: 4,
      piercing_rounds: 5,
      explosive_rounds: 6,
      targeted_strikes: 7,
      defensive_systems: 8,
      mass_automation: 9,
      chain_explosions: 10,
      guardian_protocol: 11,
      ethical_hacking: 12,
      ultimate_destruction: 13,
      controlled_power: 14,
      guardian_ascension: 15,
      shadow_king: 16,
      system_controller: 17,
      redeemed_legend: 18,
    };

    return choiceMap[choiceId] || 0;
  };

  const handleGenerateProof = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // Prepare the data that will be sent
    const decisionIds = playerDecisionState.selectedChoices.map(
      (choiceId: string) => {
        return getDecisionIdNumber(choiceId);
      }
    );

    const sessionData: SessionDataDisplay = {
      playerAddress: address,
      startTimestamp: Math.floor(startTime / 1000),
      endTimestamp: Math.floor(Date.now() / 1000),
      blocksDestroyed: totalBlocksDestroyed,
      decisionsMade: decisionIds,
      finalSoulTokens: currency.soul,
      totalClicks,
      version: 1,
    };

    // Store for display and log to console
    setRequestData(sessionData);
    console.log("=== PROOF REQUEST DATA ===");
    console.log(JSON.stringify(sessionData, null, 2));
    console.log("==========================");

    const proof = await generateProofWithAggregation(
      address,
      startTime,
      totalClicks
    );
    if (proof) {
      console.log("=== PROOF RESPONSE DATA ===");
      console.log(JSON.stringify(proofResult, null, 2));
      console.log("===========================");

      onProofGenerated({
        proof: proof.proof,
        journal: proof.journal,
        imageId: proof.image_id,
        tokensEarned:
          proof.verification_result?.tokens_earned || totalBlocksDestroyed,
        executionTimeMs: proof.execution_time_ms,
        proofVerified: proof.proof_verified,
        // Aggregation data - use the exact field names from your Rust response
        relayerJobId: proof.relayer_job_id,
        txHash: proof.tx_hash,
        blockHash: proof.block_hash,
        aggregationId: proof.aggregation_id,
        domainId: proof.domain_id,
        aggregationDetails: proof.aggregation_details, // This now has proper typing
        verification_result: {
          is_valid: proof.proof_verified || true,
          tokens_earned: totalBlocksDestroyed,
        },
      });
    }
  };

  const getStatusColor = (status: ProofStatus) => {
    switch (status) {
      case "idle":
        return "text-gray-400";
      case "generating_proof":
        return "text-blue-400";
      case "submitting_to_relayer":
        return "text-yellow-400";
      case "waiting_for_aggregation":
        return "text-purple-400";
      case "completed":
        return "text-green-400";
      case "error":
        return "text-red-400";
    }
  };

  const getButtonText = () => {
    if (!isGenerating) return "Generate Proof & Aggregate";

    switch (progress.status) {
      case "generating_proof":
        return "Generating Proof...";
      case "submitting_to_relayer":
        return "Submitting to Relayer...";
      case "waiting_for_aggregation":
        return "Waiting for Aggregation...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-4 border border-cyan-600 rounded-lg bg-gray-900/50">
      <div className="text-xs text-gray-400">
        RISC0 Service:{" "}
        <span
          className={`font-bold ${
            serviceHealth === "healthy" ? "text-green-400" : "text-red-400"
          }`}
        >
          {serviceHealth}
        </span>
      </div>

      {/* Request Data Display Toggle */}
      <div className="mb-3">
        <button
          onClick={() => setShowRequestData(!showRequestData)}
          className="text-xs text-cyan-400 hover:text-cyan-300 underline"
        >
          {showRequestData ? "Hide" : "Show"} Request Data
        </button>

        {showRequestData && requestData && (
          <div className="mt-2 p-3 bg-gray-800 rounded text-xs font-mono text-green-400 max-h-40 overflow-y-auto border border-gray-600">
            <div className="text-cyan-400 font-bold mb-2">Data to be sent:</div>
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(requestData, null, 2)}
            </pre>
          </div>
        )}

        {/* Show current game state even before generating proof */}
        {!requestData && (
          <div className="mt-2 text-xs text-gray-400">
            <div>
              Current session: {Math.floor((Date.now() - startTime) / 1000)}s
            </div>
            <div>Blocks destroyed: {totalBlocksDestroyed}</div>
            <div>Soul tokens: {currency.soul}</div>
            <div>
              Decisions made: {playerDecisionState.selectedChoices.length}
            </div>
            <div>Total clicks: {totalClicks}</div>
          </div>
        )}
      </div>

      <button
        onClick={handleGenerateProof}
        disabled={isGenerating || !address || serviceHealth !== "healthy"}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors min-w-[200px]"
      >
        {getButtonText()}
      </button>

      {/* Progress bar */}
      {isGenerating && (
        <div className="w-full max-w-md">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status message */}
      <div
        className={`text-xs text-center max-w-md ${getStatusColor(
          progress.status
        )}`}
      >
        {progress.message}
      </div>

      {error && (
        <div className="text-red-400 text-xs max-w-md text-center p-2 bg-red-900/20 rounded">
          Error: {error}
        </div>
      )}

      {/* Results display */}
      {proofResult && proofResult.verification_result && (
        <div className="text-green-400 text-xs text-center p-3 bg-green-900/20 rounded max-w-md">
          <div className="font-bold">Proof Generated Successfully!</div>
          <div>
            Tokens verified: {proofResult.verification_result.tokens_earned}
          </div>
          <div>Generation time: {proofResult.execution_time_ms}ms</div>

          {proofResult.relayer_job_id && (
            <div className="mt-2 pt-2 border-t border-green-700">
              <div>Relayer Job: {proofResult.relayer_job_id}</div>
              {proofResult.tx_hash && (
                <div>TX Hash: {proofResult.tx_hash.slice(0, 10)}...</div>
              )}
              {proofResult.aggregation_id && (
                <div>Aggregation ID: {proofResult.aggregation_id}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Aggregation info */}
      {progress.status === "waiting_for_aggregation" && (
        <div className="text-purple-300 text-xs text-center p-2 bg-purple-900/20 rounded max-w-md">
          <div>🔄 Aggregation typically takes 2-5 minutes</div>
          <div>
            The proof is being bundled with others for on-chain verification
          </div>
        </div>
      )}

      {/* Console log reminder */}
      <div className="text-xs text-gray-500">
        💡 Check browser console for detailed request/response data
      </div>
    </div>
  );
};
