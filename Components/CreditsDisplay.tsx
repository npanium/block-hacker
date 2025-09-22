import { Credits } from "@/app/types/skillTree";

interface CreditsDisplayProps {
  credits: Credits;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits }) => {
  return (
    <div className="absolute top-4 left-4 z-50 flex gap-5 bg-gradient-to-br from-black/80 to-gray-900/80 p-4 rounded-xl font-mono border border-green-400 shadow-xl shadow-green-400/30 backdrop-blur-md">
      <div className="flex items-center gap-2 text-green-400 font-bold text-lg">
        <span className="text-gray-400 drop-shadow-lg">$SOUL:</span>
        <span className="text-green-400 drop-shadow-lg animate-pulse">
          {credits.soul}
        </span>
      </div>
      <div className="flex items-center gap-2 text-green-400 font-bold text-lg">
        <span className="text-gray-400 drop-shadow-lg">$GODS:</span>
        <span className="text-green-400 drop-shadow-lg animate-pulse">
          {credits.gods}
        </span>
      </div>
    </div>
  );
};
