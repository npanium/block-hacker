import { Edge } from "@xyflow/react";
import { SkillData } from "@/app/types/skillTree";

interface EdgeGenerationParams {
  skill: SkillData;
  unlockedSkills: Set<string>;
  isSkillAvailable: (skill: SkillData) => boolean;
}

export const generateEdgesForSkill = ({
  skill,
  unlockedSkills,
  isSkillAvailable,
}: EdgeGenerationParams): Edge[] => {
  const edges: Edge[] = [];

  skill.prerequisites.forEach((prereqId: any) => {
    const isConnectionUnlocked = unlockedSkills.has(skill.id);
    const isPrereqUnlocked = unlockedSkills.has(prereqId);
    const isSkillAvailableNow = isSkillAvailable(skill);

    edges.push({
      id: `${prereqId}-${skill.id}`,
      source: prereqId,
      target: skill.id,
      sourceHandle: "bottom",
      targetHandle: "top",
      type: "default",
      animated: isSkillAvailableNow && !isConnectionUnlocked,
      style: {
        stroke: isConnectionUnlocked
          ? "#4ade80"
          : isPrereqUnlocked && isSkillAvailableNow
          ? "#fbbf24"
          : "#475569",
        strokeWidth: skill.branch === "ultimate" ? 5 : skill.isGoal ? 4 : 3,
        strokeDasharray: isConnectionUnlocked ? "none" : "5,5",
        filter:
          skill.branch === "ultimate"
            ? "drop-shadow(0 0 10px #ff6d00)"
            : "none",
      },
      markerEnd: {
        type: "arrowclosed",
        color: isConnectionUnlocked
          ? "#4ade80"
          : isPrereqUnlocked && isSkillAvailableNow
          ? "#fbbf24"
          : "#475569",
      },
    });
  });

  return edges;
};
