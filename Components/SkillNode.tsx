import { Handle, Position } from "@xyflow/react";
import { SkillNodeData, SkillStatus } from "@/app/types/skillTree";
import { StatusIcon } from "./StatusIcon";
import { useGameContext } from "./GameContext";

interface SkillNodeProps {
  data: SkillNodeData;
}

export const SkillNode: React.FC<SkillNodeProps> = ({ data }) => {
  const { purchaseSkill, canPurchaseSkill, currency } = useGameContext();
  const {
    name,
    description,
    cost,
    id,
    branch,
    isGoal,
    icon: IconComponent,
  } = data;

  const isUnlocked = data.isUnlocked;
  const isAvailable = canPurchaseSkill(id);

  const handleClick = async (event: React.MouseEvent) => {
    console.log(`${name} clicked`);
    event.preventDefault();
    event.stopPropagation();

    if (isAvailable && !isUnlocked) {
      const success = await purchaseSkill(id);

      if (success) {
        // Optional: Show purchase success feedback
        console.log(`Successfully purchased ${name}!`);
      } else {
        // Optional: Show purchase failure feedback
        console.log(`Failed to purchase ${name}`);
      }
    }
  };

  const getBranchStyles = () => {
    const baseClasses =
      "w-50 min-h-30 rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 text-white font-mono relative overflow-hidden backdrop-blur-sm";

    let branchClasses = "";
    switch (branch) {
      case "speed":
        branchClasses =
          "border-red-700 bg-gradient-to-br from-red-50/20 to-red-600/20";
        break;
      case "data":
        branchClasses =
          "border-purple-700 bg-gradient-to-br from-purple-50/20 to-purple-600/20";
        break;
      case "power":
        branchClasses =
          "border-orange-600 bg-gradient-to-br from-orange-50/20 to-orange-500/20";
        break;
      case "network":
        branchClasses =
          "border-green-700 bg-gradient-to-br from-green-50/20 to-green-600/20";
        break;
      case "advanced":
        branchClasses =
          "border-pink-700 border-4 bg-gradient-to-br from-pink-50/20 to-pink-700/20";
        break;
      case "synergy":
        branchClasses =
          "border-indigo-600 border-4 bg-gradient-to-br from-indigo-50/20 to-indigo-600/20";
        break;
      case "hybrid":
        branchClasses =
          "border-lime-600 border-8 bg-gradient-to-br from-lime-50/20 to-lime-600/20";
        break;
      case "secret":
        branchClasses =
          "border-pink-600 border-8 bg-gradient-to-br from-purple-900/40 to-pink-700/40 shadow-2xl shadow-pink-500/50";
        break;
      case "ultimate":
        branchClasses =
          "border-orange-500 border-12 bg-gradient-to-br from-black/80 to-gray-800/80 shadow-2xl shadow-orange-500/80 animate-pulse";
        break;
      default:
        branchClasses =
          "border-gray-600 bg-gradient-to-br from-gray-50/20 to-gray-600/20";
    }

    let statusClasses = "";
    if (isUnlocked) {
      statusClasses = "shadow-lg shadow-green-400/30 cursor-default";
    } else if (isAvailable) {
      statusClasses =
        "cursor-pointer animate-pulse shadow-lg shadow-orange-400/40 hover:scale-105";
    } else {
      statusClasses = "opacity-60 cursor-not-allowed";
    }

    let goalClasses = "";
    if (isGoal) {
      goalClasses = "border-8 min-h-35 shadow-2xl shadow-yellow-500/50";
    }

    return `${baseClasses} ${branchClasses} ${statusClasses} ${goalClasses}`;
  };

  const getStatus = (): SkillStatus => {
    if (isUnlocked) return "unlocked";
    if (isAvailable) return "available";
    return "locked";
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "transparent", border: "none" }}
      />

      <div
        className={getBranchStyles()}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        style={{ pointerEvents: "all" }}
      >
        <div className="flex justify-between items-start mb-3 gap-3">
          {IconComponent && (
            <IconComponent
              className={`mr-2 drop-shadow-lg ${
                isGoal
                  ? "text-yellow-400 drop-shadow-yellow-400/80"
                  : branch === "ultimate"
                  ? "text-orange-500 drop-shadow-orange-500/100 animate-pulse"
                  : ""
              }`}
              size={24}
            />
          )}
          <h3
            className={`text-sm font-bold m-0 leading-tight flex-1 uppercase tracking-wide`}
          >
            {name}
          </h3>
          {!isUnlocked && (
            <div className="flex flex-col gap-1">
              {cost.soul && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md text-center min-w-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg ${
                    currency.soul >= cost.soul ? "" : "opacity-50"
                  }`}
                >
                  {cost.soul}S
                </span>
              )}
              {cost.gods && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md text-center min-w-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg ${
                    currency.gods >= (cost.gods || 0) ? "" : "opacity-50"
                  }`}
                >
                  {cost.gods}G
                </span>
              )}
            </div>
          )}
        </div>

        {isUnlocked && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-400 to-green-600 text-black text-center text-xs font-bold py-1 uppercase tracking-wider">
            ✓ UNLOCKED
          </div>
        )}

        <div className="absolute top-2 right-2 drop-shadow-lg">
          <StatusIcon
            status={
              isUnlocked ? "unlocked" : isAvailable ? "available" : "locked"
            }
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "transparent", border: "none" }}
      />
    </>
  );
};
