export const GameHeader: React.FC = () => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-center text-green-400">
      <h1 className="text-3xl md:text-4xl font-bold m-0 bg-gradient-to-r from-green-400 via-blue-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
        NEXUS TRANSCENDENT
      </h1>
      <div className="text-sm text-gray-400 mt-1 tracking-widest font-mono">
        Cosmic Skill Tree
      </div>
    </div>
  );
};
