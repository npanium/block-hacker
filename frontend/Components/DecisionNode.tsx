"use client";

import React from "react";
import { DecisionChoice } from "../app/types/DecisionTree";

interface DecisionNodeProps {
  choice: DecisionChoice;
  canAfford: boolean;
  onSelect: (choiceId: string) => void;
}

const DecisionNode: React.FC<DecisionNodeProps> = ({
  choice,
  canAfford,
  onSelect,
}) => {
  const handleClick = () => {
    if (canAfford) {
      onSelect(choice.id);
    }
  };

  const getPathColor = () => {
    if (choice.effects.evilPoints && choice.effects.evilPoints > 0) {
      return "border-red-500 hover:border-red-400 text-red-400";
    }
    if (
      choice.effects.redemptionPoints &&
      choice.effects.redemptionPoints > 0
    ) {
      return "border-blue-500 hover:border-blue-400 text-blue-400";
    }
    return "border-purple-500 hover:border-purple-400 text-purple-400";
  };

  const getCostText = () => {
    const costs = [];
    if (choice.cost.soul) costs.push(`${choice.cost.soul} souls`);
    if (choice.cost.gods) costs.push(`${choice.cost.gods} gods`);
    return costs.join(", ");
  };

  const getEffectsText = () => {
    const effects = [];
    if (choice.effects.enableAutoBullets) effects.push("Auto-fire");
    if (choice.effects.enablePiercingBullets) effects.push("Piercing");
    if (choice.effects.enableExplosiveBullets) effects.push("Explosive");
    if (
      choice.effects.damageMultiplier &&
      choice.effects.damageMultiplier !== 1
    ) {
      effects.push(`${choice.effects.damageMultiplier}x damage`);
    }
    if (choice.effects.bulletCountBonus)
      effects.push(`+${choice.effects.bulletCountBonus} bullets`);
    if (choice.effects.fireRateBonus)
      effects.push(
        `+${(choice.effects.fireRateBonus * 100).toFixed(0)}% fire rate`
      );

    return effects.length > 0 ? effects.join(", ") : "Special abilities";
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canAfford}
      className={`
        relative bg-gray-900/90 border-2 rounded-lg p-4 min-h-[120px] w-full
        transition-all duration-300 transform hover:scale-105
        ${
          canAfford
            ? getPathColor() + " cursor-pointer hover:shadow-lg"
            : "border-gray-600 text-gray-500 cursor-not-allowed"
        }
        ${!canAfford ? "opacity-60" : "opacity-100"}
      `}
    >
      {/* Choice Icon */}
      <div className="text-3xl mb-2">{choice.icon}</div>

      {/* Choice Title */}
      <div className="font-bold text-lg mb-1">{choice.title}</div>

      {/* Choice Description */}
      <div className="text-sm text-gray-300 mb-2">{choice.description}</div>

      {/* Effects Preview */}
      <div className="text-xs text-gray-400 mb-2">{getEffectsText()}</div>

      {/* Cost */}
      <div className="absolute bottom-2 left-4 text-xs font-mono">
        Cost: {getCostText()}
      </div>

      {/* Path Indicator */}
      {choice.effects.evilPoints && choice.effects.evilPoints > 0 && (
        <div className="absolute top-2 right-2 text-xs bg-red-900/50 px-2 py-1 rounded text-red-300">
          Evil +{choice.effects.evilPoints}
        </div>
      )}

      {choice.effects.redemptionPoints &&
        choice.effects.redemptionPoints > 0 && (
          <div className="absolute top-2 right-2 text-xs bg-blue-900/50 px-2 py-1 rounded text-blue-300">
            Good +{choice.effects.redemptionPoints}
          </div>
        )}

      {/* Affordability Indicator */}
      {!canAfford && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-lg">
          <div className="text-red-400 font-bold">INSUFFICIENT FUNDS</div>
        </div>
      )}
    </button>
  );
};

export default DecisionNode;
