import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { AirdropService } from "../lib/airdropService";

export const useAirdrop = () => {
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropResult, setAirdropResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  const airdropService = new AirdropService();

  const requestAirdrop = useCallback(
    async (blocksDestroyed: number, aggregationId: string, proofData: any) => {
      if (!address) {
        setError("Wallet not connected");
        return null;
      }

      setIsAirdropping(true);
      setError(null);
      setAirdropResult(null);

      try {
        const result = await airdropService.requestAirdrop({
          playerAddress: address,
          blocksDestroyed,
          aggregationId,
          proofData,
        });

        setAirdropResult(result);
        return result;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsAirdropping(false);
      }
    },
    [address, airdropService]
  );

  return {
    requestAirdrop,
    isAirdropping,
    airdropResult,
    error,
    clearError: () => setError(null),
  };
};
