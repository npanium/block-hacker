import { useAirdrop } from "../app/hooks/useAirdrop";

interface AirdropButtonProps {
  proofResult: {
    aggregationId?: number;
    verification_result?: {
      is_valid: boolean;
    };
    tokensEarned: number;
  } | null;
  blocksDestroyed: number;
}

export const AirdropButton: React.FC<AirdropButtonProps> = ({
  proofResult,
  blocksDestroyed,
}) => {
  const { requestAirdrop, isAirdropping, airdropResult, error } = useAirdrop();
  console.log("[AirdropButton] proofResult: ", proofResult);
  const handleAirdrop = async () => {
    console.log("[AirdropButton] handleAirdrop called");
    if (!proofResult?.aggregationId) return;

    await requestAirdrop(
      blocksDestroyed,
      proofResult.aggregationId.toString(),
      proofResult
    );
  };

  console.log(
    `[AirdropButton] aggregation Id: ${proofResult?.aggregationId}, isAirdropping: ${isAirdropping}`
  );
  if (airdropResult) {
    return (
      <div className="bg-green-900/50 border border-green-500 rounded px-4 py-2">
        <div className="text-green-400 text-sm">
          ✅ {airdropResult.tokensAwarded} Tokens Airdropped!
        </div>
        <div className="text-xs text-green-300 mt-1">
          TX:{" "}
          <a
            href={`https://horizen-explorer-testnet.appchain.base.org/tx/${airdropResult.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-200"
          >
            {airdropResult.txHash.slice(0, 10)}...
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAirdrop}
        disabled={!proofResult?.aggregationId || isAirdropping}
        className={`px-4 py-2 rounded text-sm font-bold border ${
          isAirdropping
            ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-purple-900 border-purple-500 text-purple-300 hover:bg-purple-800 hover:border-purple-400"
        }`}
      >
        {isAirdropping ? "Sending Tokens..." : "🪂 Claim Token Airdrop"}
      </button>

      {error && <div className="text-red-400 text-xs">Error: {error}</div>}

      <div className="text-xs text-cyan-400">
        Expected: ~{proofResult?.tokensEarned} tokens
      </div>
    </div>
  );
};
