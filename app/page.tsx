import { GameProvider } from "../Components/GameContext";
import { SkillTree } from "../Components/SkillTree";
import SatelliteGame from "../Components/SatelliteGame";

export default function BlockHackerPage() {
  return (
    <GameProvider>
      <div className="flex">
        <div className="w-1/2">
          <SatelliteGame />
        </div>
        <div className="w-1/2">
          <SkillTree />
        </div>
      </div>
    </GameProvider>
  );
}
