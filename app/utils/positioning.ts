import {
  SkillData,
  NodePosition,
  SkillTreeConfig,
} from "@/app/types/skillTree";

const config: SkillTreeConfig = {
  nodeWidth: 200,
  nodeSpacing: 240,
  tierSpacing: 180,
};

export const calculateNodePosition = (
  skill: SkillData,
  skillsByTier: Record<number, SkillData[]>,
  unlockedSkills: Set<string>
): NodePosition => {
  const { tier } = skill;
  const skills = skillsByTier[tier];
  const index = skills.indexOf(skill);

  // Hide dimensional breach until all prerequisites are unlocked
  if (skill.id === "dimensional-breach") {
    const allPrereqsUnlocked = skill.prerequisites.every((prereqId: any) =>
      unlockedSkills.has(prereqId)
    );
    if (!allPrereqsUnlocked) {
      return { x: -10000, y: -10000 }; // Hide off-screen
    }
  }

  if (skill.id === "nexus-transcendent") {
    if (!unlockedSkills.has("dimensional-breach")) {
      return { x: -10000, y: -10000 }; // Hide off-screen
    }
  }

  let xOffset: number;
  let yOffset: number;

  switch (tier) {
    case 1:
      // Tier 1: 4 starting skills in a row
      xOffset = (index - 1.5) * config.nodeSpacing;
      yOffset = 0;
      break;

    case 2:
      // Tier 2: 8 skills, 2 under each tier 1 skill
      const parentIndex = Math.floor(index / 2);
      const childIndex = index % 2;
      xOffset =
        (parentIndex - 1.5) * config.nodeSpacing +
        (childIndex - 0.5) * (config.nodeSpacing * 0.6);
      yOffset = config.tierSpacing;
      break;

    case 3:
      // Tier 3: 8 skills, spread out
      xOffset = (index - 3.5) * (config.nodeSpacing * 0.8);
      yOffset = config.tierSpacing * 2;
      break;

    case 4:
      // Tier 4: Advanced combinations and synergies
      if (skill.branch === "advanced") {
        const advancedIndex = skills
          .filter((s) => s.branch === "advanced")
          .indexOf(skill);
        xOffset = (advancedIndex - 1.5) * config.nodeSpacing * 1.2;
        yOffset = config.tierSpacing * 3;
      } else {
        const synergyIndex = skills
          .filter((s) => s.branch === "synergy")
          .indexOf(skill);
        xOffset = (synergyIndex - 1.5) * config.nodeSpacing * 1.2;
        yOffset = config.tierSpacing * 3.5;
      }
      break;

    case 5:
      // Tier 5: 4 hybrid skills
      xOffset = (index - 1.5) * config.nodeSpacing * 1.5;
      yOffset = config.tierSpacing * 4.5;
      break;

    case 6:
      // Tier 6: Goals and secret
      if (skill.branch === "goal") {
        const goalIndex = skills
          .filter((s) => s.branch === "goal")
          .indexOf(skill);
        xOffset = (goalIndex - 1.5) * config.nodeSpacing * 1.3;
        yOffset = config.tierSpacing * 5.5;
      } else {
        // Secret skill
        xOffset = 0;
        yOffset = config.tierSpacing * 6;
      }
      break;

    case 7:
      // Tier 7: Final goals and ultimate
      if (skill.branch === "ultimate") {
        xOffset = 0;
        yOffset = config.tierSpacing * 7.5;
      } else {
        const goalIndex = skills
          .filter((s) => s.branch === "goal")
          .indexOf(skill);
        xOffset = (goalIndex - 1.5) * config.nodeSpacing * 1.5;
        yOffset = config.tierSpacing * 6.5;
      }
      break;

    default:
      // Default positioning
      xOffset = (index - (skills.length - 1) / 2) * config.nodeSpacing;
      yOffset = (tier - 1) * config.tierSpacing;
      break;
  }

  return { x: xOffset, y: yOffset };
};

export const groupSkillsByTier = (
  skills: SkillData[]
): Record<number, SkillData[]> => {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.tier]) acc[skill.tier] = [];
    acc[skill.tier].push(skill);
    return acc;
  }, {} as Record<number, SkillData[]>);
};
