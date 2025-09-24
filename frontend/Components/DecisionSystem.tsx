"use client";

import React from "react";
import { DecisionChoice, PlayerDecisionState } from "../app/types/DecisionTree";
import {
  getAvailableChoices,
  determinePathAlignment,
} from "../app/data/DecisionData";
import DecisionNode from "./DecisionNode";

interface DecisionSystemProps {
  playerState: PlayerDecisionState;
  totalBlocksDestroyed: number;
  currency: { soul: number; gods: number };
  onChoiceSelect: (choice: DecisionChoice) => void;
}

const DecisionSystem: React.FC<DecisionSystemProps> = ({
  playerState,
  totalBlocksDestroyed,
  currency,
  onChoiceSelect,
}) => {
  const availableChoices = getAvailableChoices(
    playerState,
    totalBlocksDestroyed
  );

  const canAffordChoice = (choice: DecisionChoice): boolean => {
    if (choice.cost.soul && currency.soul < choice.cost.soul) return false;
    if (choice.cost.gods && currency.gods < choice.cost.gods) return false;
    return true;
  };

  const getPathStatusColor = () => {
    switch (playerState.pathAlignment) {
      case "evil":
        return "text-red-400 border-red-600";
      case "redemption":
        return "text-blue-400 border-blue-600";
      default:
        return "text-purple-400 border-purple-600";
    }
  };

  const getPathStatusText = () => {
    const evilPoints = playerState.evilPoints;
    const redemptionPoints = playerState.redemptionPoints;

    switch (playerState.pathAlignment) {
      case "evil":
        return `Dark Path (Evil: ${evilPoints}, Good: ${redemptionPoints})`;
      case "redemption":
        return `Light Path (Good: ${redemptionPoints}, Evil: ${evilPoints})`;
      default:
        return `Neutral Path (Evil: ${evilPoints}, Good: ${redemptionPoints})`;
    }
  };

  if (availableChoices.length === 0) {
    return null; // No choices available, component is hidden
  }

  return (
    <div className="w-full bg-gray-900/95 border-t-2 border-cyan-600 backdrop-blur">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div>
          <h3 className="text-cyan-400 font-bold text-lg">EVOLUTION CHOICES</h3>
          <p className="text-gray-400 text-sm">Choose your path forward</p>
        </div>

        {/* Path Status */}
        <div className={`px-3 py-1 border rounded ${getPathStatusColor()}`}>
          <div className="text-sm font-mono">{getPathStatusText()}</div>
        </div>
      </div>

      {/* Available Choices Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableChoices.map((choice) => (
            <DecisionNode
              key={choice.id}
              choice={choice}
              canAfford={canAffordChoice(choice)}
              onSelect={() => onChoiceSelect(choice)}
            />
          ))}
        </div>
      </div>

      {/* Current Weapon Upgrades Display */}
      {(playerState.weaponUpgrades.autoBullets ||
        playerState.weaponUpgrades.piercingBullets ||
        playerState.weaponUpgrades.explosiveBullets) && (
        <div className="px-4 pb-4">
          <div className="bg-gray-800/50 border border-gray-600 rounded p-3">
            <h4 className="text-cyan-300 font-semibold mb-2">
              Active Weapon Systems:
            </h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {playerState.weaponUpgrades.autoBullets && (
                <span className="bg-red-900/30 text-red-300 px-2 py-1 rounded">
                  🤖 Auto-Fire
                </span>
              )}
              {playerState.weaponUpgrades.piercingBullets && (
                <span className="bg-orange-900/30 text-orange-300 px-2 py-1 rounded">
                  ⚡ Piercing (x{playerState.weaponUpgrades.pierceCount})
                </span>
              )}
              {playerState.weaponUpgrades.explosiveBullets && (
                <span className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded">
                  💥 Explosive (radius:{" "}
                  {playerState.weaponUpgrades.explosionRadius})
                </span>
              )}
              {playerState.weaponUpgrades.damageMultiplier > 1 && (
                <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                  🔥 {playerState.weaponUpgrades.damageMultiplier.toFixed(1)}x
                  Damage
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionSystem;
