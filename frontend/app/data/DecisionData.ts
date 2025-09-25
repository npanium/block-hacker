// app/data/DecisionData.ts
import { DecisionChoice, DecisionStage } from "../types/DecisionTree";

export const DECISION_STAGES: DecisionStage[] = [
  {
    id: 1,
    title: "Initial Approach",
    description: "Choose your hacking philosophy",
    requiredProgress: 50, // blocks destroyed to unlock
    choices: [
      {
        id: "tech_precision",
        title: "Precision Systems",
        description: "Focus on accurate, controlled attacks",
        icon: "🎯",
        cost: { soul: 100 },
        effects: {
          damageMultiplier: 1.5,
          spaceshipConfig: "technical",
          redemptionPoints: 1,
        },
      },
      {
        id: "tech_automation",
        title: "Automated Systems",
        description: "Let machines do the work",
        icon: "🤖",
        cost: { soul: 150 },
        effects: {
          enableAutoBullets: true,
          fireRateBonus: 0.5,
          spaceshipConfig: "technical",
          evilPoints: 1,
        },
      },
      {
        id: "social_influence",
        title: "Social Engineering",
        description: "Manipulate through deception",
        icon: "🎭",
        cost: { soul: 120 },
        effects: {
          bulletCountBonus: 1,
          spaceshipConfig: "social",
          evilPoints: 1,
        },
      },
      {
        id: "crew_cooperation",
        title: "Team Coordination",
        description: "Strength through unity",
        icon: "👥",
        cost: { soul: 130 },
        effects: {
          bulletCountBonus: 2,
          spaceshipConfig: "crew",
          redemptionPoints: 1,
        },
      },
    ],
  },
  {
    id: 2,
    title: "Combat Methods",
    description: "How will you engage targets?",
    requiredProgress: 200,
    choices: [
      {
        id: "piercing_rounds",
        title: "Piercing Ammunition",
        description: "Bullets that penetrate multiple targets",
        icon: "⚡",
        cost: { soul: 300 },
        effects: {
          enablePiercingBullets: true,
          pierceCount: 3,
          damageMultiplier: 0.8, // Slightly less damage but hits multiple
          evilPoints: 2,
        },
        requirements: { currentStage: 2 },
      },
      {
        id: "explosive_rounds",
        title: "Explosive Ammunition",
        description: "Bullets that explode on impact",
        icon: "💥",
        cost: { soul: 400 },
        effects: {
          enableExplosiveBullets: true,
          explosionRadius: 25,
          damageMultiplier: 1.5,
          evilPoints: 3,
        },
        requirements: { currentStage: 2 },
      },
      {
        id: "targeted_strikes",
        title: "Surgical Precision",
        description: "Precise strikes on critical systems",
        icon: "🔬",
        cost: { soul: 250 },
        effects: {
          damageMultiplier: 2.0,
          redemptionPoints: 2,
        },
        requirements: { currentStage: 2 },
      },
      {
        id: "defensive_systems",
        title: "Protective Protocols",
        description: "Shield innocent data from collateral damage",
        icon: "🛡️",
        cost: { soul: 280 },
        effects: {
          damageMultiplier: 1.2,
          // Special effect: prevents accidental damage to "civilian" blocks
          redemptionPoints: 3,
        },
        requirements: { currentStage: 2 },
      },
    ],
  },
  {
    id: 3,
    title: "Power Escalation",
    description: "Embrace greater power, but at what cost?",
    requiredProgress: 500,
    choices: [
      {
        id: "mass_automation",
        title: "Full Automation",
        description: "Continuous automatic targeting systems",
        icon: "🌪️",
        cost: { soul: 600 },
        effects: {
          enableAutoBullets: true,
          fireRateBonus: 1.5,
          bulletCountBonus: 3,
          evilPoints: 3,
        },
        requirements: {
          currentStage: 3,
          hasChoice: ["tech_automation", "piercing_rounds"],
        },
      },
      {
        id: "chain_explosions",
        title: "Chain Reaction Systems",
        description: "Explosions trigger more explosions",
        icon: "☢️",
        cost: { soul: 800 },
        effects: {
          enableExplosiveBullets: true,
          explosionRadius: 40,
          damageMultiplier: 2.0,
          // Special: explosions can trigger other explosions
          evilPoints: 4,
        },
        requirements: {
          currentStage: 3,
          hasChoice: ["explosive_rounds"],
        },
      },
      {
        id: "guardian_protocol",
        title: "Guardian Systems",
        description: "Protect the innocent while fighting corruption",
        icon: "🕊️",
        cost: { soul: 500 },
        effects: {
          damageMultiplier: 1.8,
          bulletCountBonus: 1,
          // Special: bonus points for protecting civilian blocks
          redemptionPoints: 4,
        },
        requirements: {
          currentStage: 3,
          hasChoice: ["targeted_strikes", "defensive_systems"],
        },
      },
      {
        id: "ethical_hacking",
        title: "White Hat Protocols",
        description: "Use power responsibly for the greater good",
        icon: "⚖️",
        cost: { soul: 450 },
        effects: {
          damageMultiplier: 1.5,
          fireRateBonus: 0.8,
          redemptionPoints: 3,
        },
        requirements: {
          currentStage: 3,
        },
      },
    ],
  },
  {
    id: 4,
    title: "Path of Power",
    description: "The final choice approaches…",
    requiredProgress: 1000,
    choices: [
      {
        id: "ultimate_destruction",
        title: "Maximum Firepower",
        description: "Embrace total digital domination",
        icon: "👹",
        cost: { soul: 1200 },
        effects: {
          enableAutoBullets: true,
          enablePiercingBullets: true,
          enableExplosiveBullets: true,
          damageMultiplier: 3.0,
          bulletCountBonus: 5,
          fireRateBonus: 2.0,
          explosionRadius: 60,
          pierceCount: 5,
          spaceshipConfig: "overlord",
          evilPoints: 5,
        },
        requirements: {
          currentStage: 4,
          pathAlignment: "evil",
        },
      },
      {
        id: "controlled_power",
        title: "Balanced Approach",
        description: "Power with restraint and wisdom",
        icon: "⚛️",
        cost: { soul: 800 },
        effects: {
          damageMultiplier: 2.5,
          bulletCountBonus: 2,
          fireRateBonus: 1.2,
          spaceshipConfig: "digitalGod",
          redemptionPoints: 2,
        },
        requirements: {
          currentStage: 4,
        },
      },
      {
        id: "guardian_ascension",
        title: "Digital Guardian",
        description: "Become protector of the digital realm",
        icon: "✨",
        cost: { soul: 1000 },
        effects: {
          damageMultiplier: 2.2,
          bulletCountBonus: 3,
          fireRateBonus: 1.5,
          // Special: healing abilities for corrupted blocks
          spaceshipConfig: "transcendent",
          redemptionPoints: 5,
        },
        requirements: {
          currentStage: 4,
          pathAlignment: "redemption",
        },
      },
    ],
  },
  {
    id: 5,
    title: "Final Transformation",
    description: "Your ultimate destiny",
    requiredProgress: 2000,
    choices: [
      {
        id: "shadow_king",
        title: "Shadow King",
        description: "Rule the digital underworld with fear",
        icon: "🖤",
        cost: { gods: 1 },
        effects: {
          spaceshipConfig: "shadowKing",
          damageMultiplier: 4.0,
          evilPoints: 10,
        },
        requirements: {
          currentStage: 5,
          pathAlignment: "evil",
        },
      },
      {
        id: "system_controller",
        title: "System Controller",
        description: "Become one with the digital infrastructure",
        icon: "🏗️",
        cost: { gods: 1 },
        effects: {
          spaceshipConfig: "systemController",
          damageMultiplier: 3.5,
        },
        requirements: {
          currentStage: 5,
        },
      },
      {
        id: "redeemed_legend",
        title: "Redeemed Legend",
        description: "Transform from hacker to hero",
        icon: "🤍",
        cost: { gods: 1 },
        effects: {
          spaceshipConfig: "redeemedLegend",
          damageMultiplier: 3.0,
          redemptionPoints: 10,
        },
        requirements: {
          currentStage: 5,
          pathAlignment: "redemption",
        },
      },
    ],
  },
];

// Helper function to determine path alignment based on points
export function determinePathAlignment(
  evilPoints: number,
  redemptionPoints: number
): "neutral" | "evil" | "redemption" {
  const pointDifference = evilPoints - redemptionPoints;

  if (pointDifference >= 3) return "evil";
  if (pointDifference <= -3) return "redemption";
  return "neutral";
}

// Helper function to get available choices for current state
export function getAvailableChoices(
  playerState: any,
  totalBlocksDestroyed: number
): DecisionChoice[] {
  const availableChoices: DecisionChoice[] = [];

  for (const stage of DECISION_STAGES) {
    // Check if stage is unlocked
    // console.log("[Decision Data] totalBlocksDestroyed: ", totalBlocksDestroyed);
    if (totalBlocksDestroyed >= stage.requiredProgress) {
      for (const choice of stage.choices) {
        // Skip if already selected
        if (playerState.selectedChoices.includes(choice.id)) continue;

        // Check requirements
        if (choice.requirements) {
          const req = choice.requirements;

          // Check stage requirement
          if (req.currentStage && playerState.currentStage < req.currentStage)
            continue;

          // Check prerequisite choices
          if (req.hasChoice) {
            const hasAllPrereqs = req.hasChoice.every((choiceId) =>
              playerState.selectedChoices.includes(choiceId)
            );
            if (!hasAllPrereqs) continue;
          }

          // Check path alignment
          if (
            req.pathAlignment &&
            playerState.pathAlignment !== req.pathAlignment
          )
            continue;
        }

        availableChoices.push(choice);
      }
    }
  }

  return availableChoices;
}
