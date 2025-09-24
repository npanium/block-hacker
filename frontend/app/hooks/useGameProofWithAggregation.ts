import { useState, useCallback } from "react";
import {
  Risc0Client,
  GameSessionData,
  ProofResponse,
} from "../lib/risc0-client";
import { useGameContext } from "@/Components/GameContext";

export type ProofStatus =
  | "idle"
  | "generating_proof"
  | "submitting_to_relayer"
  | "waiting_for_aggregation"
  | "completed"
  | "error";

export interface ProofProgress {
  status: ProofStatus;
  message: string;
  progress: number; // 0-100
}

export const useGameProofWithAggregation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProofProgress>({
    status: "idle",
    message: "Ready to generate proof",
    progress: 0,
  });
  const [proofResult, setProofResult] = useState<ProofResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { currency, totalBlocksDestroyed, playerDecisionState } =
    useGameContext();

  const client = new Risc0Client();

  const generateProofWithAggregation = useCallback(
    async (
      playerAddress: string,
      startTime: number,
      totalClicks: number
    ): Promise<ProofResponse | null> => {
      setIsGenerating(true);
      setError(null);
      setProofResult(null);

      try {
        // Step 1: Check service health
        setProgress({
          status: "generating_proof",
          message: "Checking service health...",
          progress: 5,
        });

        await client.checkHealth();

        // Step 2: Prepare session data
        setProgress({
          status: "generating_proof",
          message: "Preparing game session data...",
          progress: 10,
        });

        const decisionIds = playerDecisionState.selectedChoices.map(
          (choiceId) => {
            return getDecisionIdNumber(choiceId);
          }
        );

        const sessionData: GameSessionData = {
          playerAddress,
          startTimestamp: Math.floor(startTime / 1000),
          endTimestamp: Math.floor(Date.now() / 1000),
          blocksDestroyed: totalBlocksDestroyed,
          decisionsMade: decisionIds,
          finalSoulTokens: currency.soul,
          totalClicks,
          version: 1,
        };

        // Step 3: Generate RISC0 proof and submit to aggregator
        setProgress({
          status: "generating_proof",
          message: "Generating RISC0 proof... (this may take 30-60 seconds)",
          progress: 20,
        });

        const startProofTime = Date.now();
        const result = await client.generateProofAndAggregate(sessionData);

        // Check if proof was generated successfully
        if (!result.verification_result?.is_valid) {
          throw new Error("Game session validation failed in circuit");
        }

        setProgress({
          status: "submitting_to_relayer",
          message: "RISC0 proof generated successfully!",
          progress: 50,
        });

        // If we have a relayer job ID, the proof was submitted for aggregation
        if (result.relayer_job_id) {
          setProgress({
            status: "waiting_for_aggregation",
            message: "Proof submitted to zkVerify. Waiting for aggregation...",
            progress: 60,
          });

          // Check if aggregation is already complete
          if (result.aggregation_id && result.tx_hash) {
            setProgress({
              status: "completed",
              message: `Proof aggregated successfully! TX: ${result.tx_hash.slice(
                0,
                10
              )}...`,
              progress: 100,
            });
          } else {
            // Aggregation is still in progress
            setProgress({
              status: "waiting_for_aggregation",
              message: "Aggregation in progress. This can take 2-5 minutes...",
              progress: 80,
            });
          }
        } else {
          // No relayer submission, but RISC0 proof is valid
          setProgress({
            status: "completed",
            message: "RISC0 proof generated (relayer submission skipped)",
            progress: 100,
          });
        }

        setProofResult(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        setProgress({
          status: "error",
          message: `Error: ${errorMessage}`,
          progress: 0,
        });
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [currency, totalBlocksDestroyed, playerDecisionState, client]
  );

  return {
    generateProofWithAggregation,
    isGenerating,
    progress,
    proofResult,
    error,
    client,
  };
};

function getDecisionIdNumber(choiceId: string): number {
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
}
