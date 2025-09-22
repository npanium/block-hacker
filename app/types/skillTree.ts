import { ComponentType } from "react";

export type SkillBranch =
  | "speed"
  | "data"
  | "power"
  | "network"
  | "advanced"
  | "synergy"
  | "hybrid"
  | "goal"
  | "secret"
  | "ultimate";

export interface SkillData {
  id: string;
  name: string;
  description: string;
  cost: {
    soul: number;
    gods: number;
  };
  prerequisites: string[];
  tier: number;
  branch: SkillBranch;
  isGoal?: boolean;
  icon?: ComponentType<any>;
  isHidden?: boolean;
}

export interface Credits {
  soul: number;
  gods: number;
}

export interface SkillNodeData extends SkillData {
  isUnlocked: boolean;
  isAvailable: boolean;
  onUnlock: (skillId: string) => void;
}

export type SkillStatus = "locked" | "available" | "unlocked";

export interface NodePosition {
  x: number;
  y: number;
}

export interface SkillTreeConfig {
  nodeWidth: number;
  nodeSpacing: number;
  tierSpacing: number;
}
