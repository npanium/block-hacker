import { useState, useCallback } from "react";
import { Credits, SkillData } from "@/app/types/skillTree";

export const useSkillTree = (
  initialCredits: Credits = { soul: 50000, gods: 5000 }
) => {
  const [credits, setCredits] = useState<Credits>(initialCredits);
  const [unlockedSkills, setUnlockedSkills] = useState<Set<string>>(new Set());

  const isSkillAvailable = useCallback(
    (skill: SkillData): boolean => {
      if (unlockedSkills.has(skill.id)) {
        return false;
      }

      // Check if all prerequisites are unlocked
      const prerequisitesMet = skill.prerequisites.every((prereqId: any) =>
        unlockedSkills.has(prereqId)
      );

      // Check if player has enough credits
      const soulNeeded = skill.cost.soul || 0;
      const godsNeeded = skill.cost.gods || 0;
      const hasSoulCredits = credits.soul >= soulNeeded;
      const hasGodsCredits = credits.gods >= godsNeeded;
      const canAfford = hasSoulCredits && hasGodsCredits;

      return prerequisitesMet && canAfford;
    },
    [unlockedSkills, credits]
  );

  const handleSkillUnlock = useCallback(
    (skillId: string, skill: SkillData) => {
      if (!skill || !isSkillAvailable(skill)) {
        return;
      }

      // Deduct credits
      setCredits((prev: any) => ({
        soul: prev.soul - (skill.cost.soul || 0),
        gods: prev.gods - (skill.cost.gods || 0),
      }));

      // Unlock skill
      setUnlockedSkills((prev) => {
        const newSet = new Set(prev);
        newSet.add(skillId);
        return newSet;
      });
    },
    [isSkillAvailable]
  );

  const isSkillUnlocked = useCallback(
    (skillId: string): boolean => {
      return unlockedSkills.has(skillId);
    },
    [unlockedSkills]
  );

  return {
    credits,
    unlockedSkills,
    isSkillAvailable,
    isSkillUnlocked,
    handleSkillUnlock,
    setCredits,
    setUnlockedSkills,
  };
};
