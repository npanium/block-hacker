import { GameProvider } from "../Components/GameContext";
import SatelliteGame from "../Components/SatelliteGame";

export default function BlockHackerPage() {
  return (
    <GameProvider>
      <div className="flex">
        <div className="w-full">
          <SatelliteGame />
        </div>
      </div>
    </GameProvider>
  );
}
