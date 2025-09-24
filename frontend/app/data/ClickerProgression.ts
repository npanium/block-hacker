import { LucideIcon } from "lucide-react";

// Types
interface Currency {
  soul: number;
  gods: number;
}

interface GameStats {
  clickDamage: number;
  passiveIncome: number;
  autoClickRate: number;
  bulletCount: number;
  currencyMultiplier: number;
  autoSatellites: number;
  specialEffects: string[];
}

interface SkillEffect {
  onPurchase?: (gameState: any) => void;
  onBlockDestroy?: (blockData: any, gameState: any) => number; // Returns bonus currency
  onClick?: (gameState: any) => void;
  passive?: (gameState: any) => number; // Returns passive income
  modifyStats?: (stats: GameStats) => GameStats;
}

interface SkillData {
  id: string;
  name: string;
  description: string;
  cost: Currency;
  prerequisites: string[];
  tier: number;
  branch: string;
  isGoal?: boolean;
  icon?: LucideIcon;
  effect?: SkillEffect;
  purchased?: boolean;
}

// Skill effects implementation
const skillEffects: Record<string, SkillEffect> = {
  // Tier 1 - Basic skills
  "packet-injection-1": {
    modifyStats: (stats) => ({
      ...stats,
      clickDamage: stats.clickDamage * 1.5,
    }),
    onPurchase: (gameState) => {
      console.log("Basic packet injection activated - 50% more click damage");
    },
  },

  "hash-buffer-1": {
    onBlockDestroy: (blockData, gameState) =>
      Math.floor(blockData.baseReward * 0.25),
    onPurchase: (gameState) => {
      console.log("Hash buffer initialized - 25% bonus currency from blocks");
    },
  },

  "basic-firewall": {
    modifyStats: (stats) => ({
      ...stats,
      passiveIncome: stats.passiveIncome + 1,
    }),
    passive: (gameState) => 1,
    onPurchase: (gameState) => {
      console.log("Basic firewall deployed - +1 soul/sec passive income");
    },
  },

  "network-scanner": {
    onBlockDestroy: (blockData, gameState) => {
      // 10% chance for double rewards
      return Math.random() < 0.1 ? blockData.baseReward : 0;
    },
    onPurchase: (gameState) => {
      console.log(
        "Network scanner online - 10% chance for double block rewards"
      );
    },
  },

  // Tier 2 - Enhanced skills
  "rapid-exploit": {
    modifyStats: (stats) => ({
      ...stats,
      autoClickRate: Math.max(stats.autoClickRate, 0.5),
    }),
    onPurchase: (gameState) => {
      console.log("Rapid exploit deployed - Auto-click every 2 seconds");
    },
  },

  "precise-targeting": {
    modifyStats: (stats) => ({ ...stats, bulletCount: stats.bulletCount + 1 }),
    onPurchase: (gameState) => {
      console.log("Precision targeting activated - +1 bullet per click");
    },
  },

  "hash-cracking": {
    modifyStats: (stats) => ({
      ...stats,
      currencyMultiplier: stats.currencyMultiplier * 1.5,
    }),
    onPurchase: (gameState) => {
      console.log("Hash cracking enabled - 50% more currency from all sources");
    },
  },

  "blockchain-analysis": {
    onBlockDestroy: (blockData, gameState) => {
      // Show block integrity visually and give bonus for low-integrity blocks
      if (blockData.integrity <= 1) {
        return Math.floor(blockData.baseReward * 0.5);
      }
      return 0;
    },
    onPurchase: (gameState) => {
      console.log(
        "Blockchain analysis active - Bonus currency for weak blocks"
      );
    },
  },

  "mining-rig": {
    modifyStats: (stats) => ({
      ...stats,
      passiveIncome: stats.passiveIncome + 5,
    }),
    passive: (gameState) => 5,
    onPurchase: (gameState) => {
      console.log("Mining rig constructed - +5 soul/sec passive income");
    },
  },

  "ddos-shield": {
    modifyStats: (stats) => ({
      ...stats,
      specialEffects: [...stats.specialEffects, "explosion"],
    }),
    onBlockDestroy: (blockData, gameState) => {
      // Destroyed blocks damage adjacent blocks
      return 0; // Implement explosion logic in game
    },
    onPurchase: (gameState) => {
      console.log(
        "DDoS shield active - Destroyed blocks explode, damaging neighbors"
      );
    },
  },

  "botnet-control": {
    modifyStats: (stats) => ({
      ...stats,
      autoSatellites: stats.autoSatellites + 1,
    }),
    onPurchase: (gameState) => {
      console.log("Botnet established - +1 auto-firing satellite");
    },
  },

  "ssl-bypass": {
    modifyStats: (stats) => ({ ...stats, clickDamage: stats.clickDamage * 2 }),
    onPurchase: (gameState) => {
      console.log("SSL bypass enabled - Double click damage");
    },
  },

  // Tier 3 - Elite skills
  "zero-day-arsenal": {
    modifyStats: (stats) => ({ ...stats, bulletCount: stats.bulletCount + 2 }),
    onClick: (gameState) => {
      // Every 10th click fires a special piercing shot
      gameState.clickCount = (gameState.clickCount || 0) + 1;
      if (gameState.clickCount % 10 === 0) {
        // Implement piercing shot logic
        console.log("Zero-day exploit fired - piercing shot!");
      }
    },
    onPurchase: (gameState) => {
      console.log(
        "Zero-day arsenal loaded - +2 bullets per click, every 10th click pierces"
      );
    },
  },

  "transaction-sniper": {
    onClick: (gameState) => {
      // Auto-target the weakest block
      // Implement in game logic
    },
    onPurchase: (gameState) => {
      console.log(
        "Transaction sniper online - Clicks auto-target weakest blocks"
      );
    },
  },

  "quantum-cracker": {
    modifyStats: (stats) => ({
      ...stats,
      clickDamage: stats.clickDamage * 3,
      specialEffects: [...stats.specialEffects, "quantum"],
    }),
    onPurchase: (gameState) => {
      console.log(
        "Quantum cracker deployed - Triple damage with quantum effects"
      );
    },
  },

  "asic-farm": {
    modifyStats: (stats) => ({
      ...stats,
      passiveIncome: stats.passiveIncome + 50,
    }),
    passive: (gameState) => 50,
    onPurchase: (gameState) => {
      console.log("ASIC farm operational - +50 soul/sec passive income");
    },
  },

  // Advanced combinations
  "blockchain-destroyer": {
    modifyStats: (stats) => ({
      ...stats,
      clickDamage: stats.clickDamage * 5,
      specialEffects: [...stats.specialEffects, "destroyer"],
    }),
    onClick: (gameState) => {
      // Chance to instantly destroy any block
      if (Math.random() < 0.05) {
        console.log("Blockchain destroyer activated - instant kill!");
        // Implement instant kill logic
      }
    },
    onPurchase: (gameState) => {
      console.log(
        "Blockchain destroyer online - 5x damage, 5% instant kill chance"
      );
    },
  },

  "crypto-oracle": {
    onBlockDestroy: (blockData, gameState) => {
      // Predict and show future block spawns
      return Math.floor(blockData.baseReward * 2); // Double rewards
    },
    onPurchase: (gameState) => {
      console.log("Crypto oracle awakened - Double currency and future sight");
    },
  },
};

// Main progression class
export class ClickerProgression {
  private gameState: any;
  private skills: Map<string, SkillData>;
  private currentStats: GameStats;

  constructor(initialGameState: any) {
    this.gameState = initialGameState;
    this.skills = new Map();
    this.currentStats = {
      clickDamage: 1,
      passiveIncome: 0,
      autoClickRate: 0,
      bulletCount: 1,
      currencyMultiplier: 1,
      autoSatellites: 0,
      specialEffects: [],
    };
  }

  // Add skill to the system
  addSkill(skillData: SkillData): void {
    const skillWithEffect = {
      ...skillData,
      effect: skillEffects[skillData.id],
      purchased: false,
    };
    this.skills.set(skillData.id, skillWithEffect);
  }

  // Check if skill can be purchased
  canPurchase(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || skill.purchased) return false;

    // Check prerequisites
    const prereqsMet = skill.prerequisites.every((prereqId) => {
      const prereq = this.skills.get(prereqId);
      return prereq?.purchased === true;
    });

    // Check currency
    const hasEnoughCurrency =
      this.gameState.currency.soul >= skill.cost.soul &&
      this.gameState.currency.gods >= (skill.cost.gods || 0);

    return prereqsMet && hasEnoughCurrency;
  }

  // Purchase skill - this is the function you'll connect to buttons
  purchaseSkill = async (skillId: string): Promise<boolean> => {
    if (!this.canPurchase(skillId)) return false;

    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Deduct currency
    this.gameState.currency.soul -= skill.cost.soul;
    this.gameState.currency.gods -= skill.cost.gods || 0;

    // Mark as purchased
    skill.purchased = true;

    // Apply effects
    if (skill.effect?.onPurchase) {
      skill.effect.onPurchase(this.gameState);
    }

    // Recalculate stats
    this.recalculateStats();

    // You can add API calls here later
    // await this.syncToBackend(skillId);

    return true;
  };

  getCurrency = (): { soul: number; gods: number } => {
    return { ...this.gameState.currency };
  };
  // Recalculate all stats based on purchased skills
  private recalculateStats(): void {
    this.currentStats = {
      clickDamage: 1,
      passiveIncome: 0,
      autoClickRate: 0,
      bulletCount: 1,
      currencyMultiplier: 1,
      autoSatellites: 0,
      specialEffects: [],
    };

    this.skills.forEach((skill) => {
      if (skill.purchased && skill.effect?.modifyStats) {
        this.currentStats = skill.effect.modifyStats(this.currentStats);
      }
    });
  }

  // Handle click event - call this on satellite clicks
  handleClick = (): void => {
    this.skills.forEach((skill) => {
      if (skill.purchased && skill.effect?.onClick) {
        skill.effect.onClick(this.gameState);
      }
    });
  };

  // Handle block destruction - call this when blocks are destroyed
  handleBlockDestroy = (blockData: any): number => {
    let bonusCurrency = 0;

    this.skills.forEach((skill) => {
      if (skill.purchased && skill.effect?.onBlockDestroy) {
        bonusCurrency += skill.effect.onBlockDestroy(blockData, this.gameState);
      }
    });

    return Math.floor(bonusCurrency * this.currentStats.currencyMultiplier);
  };

  // Get passive income per second
  getPassiveIncome = (): number => {
    let income = 0;

    this.skills.forEach((skill) => {
      if (skill.purchased && skill.effect?.passive) {
        income += skill.effect.passive(this.gameState);
      }
    });

    return Math.floor(income * this.currentStats.currencyMultiplier);
  };

  // Getters for current stats
  getStats = (): GameStats => ({ ...this.currentStats });
  getSkills = (): SkillData[] => Array.from(this.skills.values());
  getPurchasedSkills = (): SkillData[] =>
    Array.from(this.skills.values()).filter((skill) => skill.purchased);
}
