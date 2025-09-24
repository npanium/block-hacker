import SatelliteGame from "../Components/SatelliteGame";
import { Providers } from "./providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function BlockHackerPage() {
  return (
    <Providers>
      <div className="flex">
        <div className="w-full">
          <SatelliteGame />
        </div>
      </div>
    </Providers>
  );
}
