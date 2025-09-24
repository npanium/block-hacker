// app/types/DecisionTree.ts

export interface DecisionChoice {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: {
    soul?: number;
    gods?: number;
  };
  effects: {
    // Weapon upgrades
    enableAutoBullets?: boolean;
    enablePiercingBullets?: boolean;
    enableExplosiveBullets?: boolean;
    damageMultiplier?: number;
    bulletCountBonus?: number;
    fireRateBonus?: number;
    explosionRadius?: number;
    pierceCount?: number;

    // Visual changes
    spaceshipConfig?: string;

    // Path tracking
    evilPoints?: number;
    redemptionPoints?: number;

    // Unlocks
    unlocksSkills?: string[];
    unlocksUpgrades?: string[];
  };
  requirements?: {
    blocksDestroyed?: number;
    currentStage?: number;
    hasChoice?: string[];
    pathAlignment?: "neutral" | "evil" | "redemption";
  };
}

export interface DecisionStage {
  id: number;
  title: string;
  description: string;
  choices: DecisionChoice[];
  requiredProgress: number; // blocks destroyed to unlock this stage
}

export interface PlayerDecisionState {
  currentStage: number;
  selectedChoices: string[];
  evilPoints: number;
  redemptionPoints: number;
  pathAlignment: "neutral" | "evil" | "redemption";
  unlockedChoices: string[];
  weaponUpgrades: {
    autoBullets: boolean;
    piercingBullets: boolean;
    explosiveBullets: boolean;
    damageMultiplier: number;
    bulletCountBonus: number;
    fireRateBonus: number;
    explosionRadius: number;
    pierceCount: number;
  };
}

export interface DecisionSystemState {
  stages: DecisionStage[];
  playerState: PlayerDecisionState;
  availableChoices: DecisionChoice[];
}
