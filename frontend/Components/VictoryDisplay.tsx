import { TrophyIcon } from "lucide-react";
import { SkillData } from "@/app/types/SkillTree";

interface VictoryDisplayProps {
  unlockedGoals: SkillData[];
}

export const VictoryDisplay: React.FC<VictoryDisplayProps> = ({
  unlockedGoals,
}) => {
  if (unlockedGoals.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-50 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 p-4 rounded-xl border-2 border-yellow-400 shadow-xl shadow-yellow-400/50 backdrop-blur-md text-yellow-400 font-mono max-w-xs">
      <h3 className="m-0 mb-3 text-sm text-center drop-shadow-lg flex items-center justify-center gap-2">
        <TrophyIcon size={20} />
        ASCENSION PATHS UNLOCKED
      </h3>
      <div className="flex flex-col gap-2">
        {unlockedGoals.map((goal) => (
          <div
            key={goal.id}
            className="text-xs p-2 bg-yellow-400/10 rounded-md text-center animate-pulse flex items-center justify-center gap-2"
          >
            {goal.icon && <goal.icon size={16} />}
            {goal.name}
          </div>
        ))}
      </div>
    </div>
  );
};
