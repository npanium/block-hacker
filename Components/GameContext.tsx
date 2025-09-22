"use client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { ClickerProgression } from "../app/data/ClickerProgression";
import { skillsData } from "@/app/data/skillsData";

interface GameContextType {
  // Game stats
  currency: { soul: number; gods: number };
  setCurrency: (currency: { soul: number; gods: number }) => void;
  score: number;
  setScore: (score: number) => void;

  // Progression system
  progression: ClickerProgression | null;

  // Skill system
  unlockedSkills: Set<string>;
  isSkillUnlocked: (skillId: string) => boolean;

  // Game actions
  handleClick: () => void;
  handleBlockDestroy: (blockData: any) => number;
  purchaseSkill: (skillId: string) => Promise<boolean>;
  canPurchaseSkill: (skillId: string) => boolean;

  // Game stats for rendering
  gameStats: {
    clickDamage: number;
    passiveIncome: number;
    bulletCount: number;
    autoSatellites: number;
    specialEffects: string[];
    autoClickRate: number;
  };
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = useState({ soul: 100, gods: 0 }); // Start with some currency
  const [score, setScore] = useState(0);
  const [unlockedSkills, setUnlockedSkills] = useState<Set<string>>(new Set());
  const progressionRef = useRef<ClickerProgression | null>(null);
  const [gameStats, setGameStats] = useState({
    clickDamage: 1,
    passiveIncome: 0,
    bulletCount: 1,
    autoSatellites: 0,
    specialEffects: [] as string[],
    autoClickRate: 0,
  });

  // Initialize progression system
  useEffect(() => {
    const gameState = {
      currency,
      setCurrency,
      score,
      setScore,
      clickCount: 0,
    };

    const progression = new ClickerProgression(gameState);

    // Add all skills to the progression system
    skillsData.forEach((skill) => {
      progression.addSkill({
        ...skill,
        cost: {
          soul: skill.cost.soul,
          gods: skill.cost.gods,
        },
        icon: skill.icon as any,
        purchased: false,
      });
    });

    progressionRef.current = progression;
    updateUnlockedSkills();
  }, []);

  // Passive income timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (progressionRef.current) {
        const passiveIncome = progressionRef.current.getPassiveIncome();
        if (passiveIncome > 0) {
          setCurrency((prev) => ({
            ...prev,
            soul: prev.soul + passiveIncome,
          }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update game stats when progression changes
  const updateGameStats = () => {
    if (progressionRef.current) {
      setGameStats(progressionRef.current.getStats());
    }
  };

  // Update unlocked skills from progression system
  const updateUnlockedSkills = () => {
    if (progressionRef.current) {
      const purchasedSkills = progressionRef.current.getPurchasedSkills();
      const skillIds = purchasedSkills.map((skill) => skill.id);
      setUnlockedSkills(new Set(skillIds));
    }
  };

  const handleClick = () => {
    if (progressionRef.current) {
      progressionRef.current.handleClick();
    }
  };

  const handleBlockDestroy = (blockData: any) => {
    if (progressionRef.current) {
      const bonusCurrency =
        progressionRef.current.handleBlockDestroy(blockData);
      const baseCurrency = blockData.baseReward || 1;
      const totalCurrency = baseCurrency + bonusCurrency;

      setCurrency((prev) => ({
        ...prev,
        soul: prev.soul + totalCurrency,
      }));

      return totalCurrency;
    }
    return blockData.baseReward || 1;
  };

  const purchaseSkill = async (skillId: string): Promise<boolean> => {
    if (progressionRef.current) {
      const success = await progressionRef.current.purchaseSkill(skillId);
      if (success) {
        setCurrency(progressionRef.current.getCurrency());
        updateGameStats();
        updateUnlockedSkills(); // Update unlocked skills after purchase
      }
      return success;
    }
    return false;
  };

  const canPurchaseSkill = (skillId: string): boolean => {
    if (progressionRef.current) {
      return progressionRef.current.canPurchase(skillId);
    }
    return false;
  };

  const isSkillUnlocked = (skillId: string): boolean => {
    return unlockedSkills.has(skillId);
  };

  return (
    <GameContext.Provider
      value={{
        currency,
        setCurrency,
        score,
        setScore,
        progression: progressionRef.current,
        unlockedSkills,
        isSkillUnlocked,
        handleClick,
        handleBlockDestroy,
        purchaseSkill,
        canPurchaseSkill,
        gameStats,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};
