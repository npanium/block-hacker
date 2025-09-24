// "use client";
// import React, { useState, useCallback } from "react";
// import {
//   AlertTriangle,
//   Zap,
//   Users,
//   Shield,
//   Skull,
//   Star,
//   Crown,
// } from "lucide-react";

// // ===== TYPES =====
// interface GameState {
//   soul: number;
//   gods: number;
//   heat: number;
//   pathScores: {
//     solo: number;
//     crew: number;
//     chaos: number;
//     balance: number;
//   };
//   currentTier: number;
//   upgrades: string[];
//   level: number;
//   xp: number;
//   xpToNext: number;
// }

// interface Upgrade {
//   id: string;
//   name: string;
//   description: string;
//   soulCost?: number;
//   godsCost?: number;
//   path: "solo" | "crew" | "chaos" | "balance";
//   pathWeight: number;
//   tier: number;
//   effects: {
//     soulMultiplier?: number;
//     fireRate?: number;
//     heatReduction?: number;
//     specialAbility?: string;
//   };
//   visual: {
//     icon: React.ReactNode;
//     color: string;
//     description: string;
//   };
// }

// // ===== UPGRADE DEFINITIONS =====
// const UPGRADES: Upgrade[] = [
//   // TIER 1 - SOUL CURRENCY (Always 4 options)
//   {
//     id: "laptop",
//     name: "Hacker Laptop",
//     description: "Faster hacking, better rewards",
//     soulCost: 500,
//     path: "solo",
//     pathWeight: 2,
//     tier: 1,
//     effects: { soulMultiplier: 2 },
//     visual: {
//       icon: <Zap className="w-6 h-6" />,
//       color: "bg-blue-600",
//       description: "Rocket becomes sleek black with blue glow",
//     },
//   },
//   {
//     id: "burner_phone",
//     name: "Burner Phone",
//     description: "Recruit helpers, social engineering",
//     soulCost: 400,
//     path: "crew",
//     pathWeight: 2,
//     tier: 1,
//     effects: { soulMultiplier: 1.5, specialAbility: "show_weak_points" },
//     visual: {
//       icon: <Users className="w-6 h-6" />,
//       color: "bg-green-600",
//       description: "Communication array appears, highlights weak squares",
//     },
//   },
//   {
//     id: "overclock",
//     name: "Overclocked Rig",
//     description: "Maximum power, high risk",
//     soulCost: 600,
//     path: "chaos",
//     pathWeight: 2,
//     tier: 1,
//     effects: { soulMultiplier: 3, specialAbility: "chaos_sparks" },
//     visual: {
//       icon: <Skull className="w-6 h-6" />,
//       color: "bg-red-600",
//       description: "Rocket sparks with electricity, larger and more aggressive",
//     },
//   },
//   {
//     id: "vpn_suite",
//     name: "VPN Security Suite",
//     description: "Stay hidden, reduce heat",
//     soulCost: 300,
//     path: "balance",
//     pathWeight: 2,
//     tier: 1,
//     effects: { soulMultiplier: 1.2, heatReduction: 0.5 },
//     visual: {
//       icon: <Shield className="w-6 h-6" />,
//       color: "bg-purple-600",
//       description: "Stealth field around rocket, semi-transparent",
//     },
//   },

//   // TIER 2 - EVOLVED OPTIONS (Always 4 options)
//   {
//     id: "gaming_rig",
//     name: "Gaming Battlestation",
//     description: "Dual cannon, rapid fire",
//     soulCost: 5000,
//     path: "solo",
//     pathWeight: 3,
//     tier: 2,
//     effects: { fireRate: 2, soulMultiplier: 4 },
//     visual: {
//       icon: <Zap className="w-6 h-6" />,
//       color: "bg-blue-700",
//       description: "Rocket gets dual cannons, RGB lighting effects",
//     },
//   },
//   {
//     id: "crew_partner",
//     name: "Recruit Partner",
//     description: "AI companion rocket assists you",
//     soulCost: 4500,
//     path: "crew",
//     pathWeight: 3,
//     tier: 2,
//     effects: { soulMultiplier: 3, specialAbility: "companion_rocket" },
//     visual: {
//       icon: <Users className="w-6 h-6" />,
//       color: "bg-green-700",
//       description: "Smaller rocket appears and follows your movements",
//     },
//   },
//   {
//     id: "chaos_framework",
//     name: "Attack Framework",
//     description: "Chain explosions, fear effects",
//     soulCost: 6000,
//     path: "chaos",
//     pathWeight: 3,
//     tier: 2,
//     effects: { soulMultiplier: 5, specialAbility: "chain_explosions" },
//     visual: {
//       icon: <Skull className="w-6 h-6" />,
//       color: "bg-red-700",
//       description: "Explosive rounds, blocks show fear animations",
//     },
//   },
//   {
//     id: "business_license",
//     name: "Business License",
//     description: "Legitimate front, diplomatic immunity",
//     soulCost: 3500,
//     path: "balance",
//     pathWeight: 3,
//     tier: 2,
//     effects: { soulMultiplier: 2.5, heatReduction: 1.0 },
//     visual: {
//       icon: <Shield className="w-6 h-6" />,
//       color: "bg-purple-700",
//       description: "Official markings, some blocks become friendly",
//     },
//   },

//   // TIER 3 - ENDGAME (Premium GODS currency)
//   {
//     id: "quantum_computer",
//     name: "Quantum Core",
//     description: "Reality-breaking computational power",
//     godsCost: 10,
//     path: "solo",
//     pathWeight: 5,
//     tier: 3,
//     effects: { soulMultiplier: 10, specialAbility: "quantum_bullets" },
//     visual: {
//       icon: <Star className="w-6 h-6" />,
//       color: "bg-gradient-to-r from-purple-600 to-pink-600",
//       description: "Rocket becomes crystalline, bullets pierce reality",
//     },
//   },
//   {
//     id: "digital_nation",
//     name: "Digital Nation",
//     description: "Command a virtual army",
//     godsCost: 15,
//     path: "crew",
//     pathWeight: 5,
//     tier: 3,
//     effects: { soulMultiplier: 8, specialAbility: "rocket_swarm" },
//     visual: {
//       icon: <Crown className="w-6 h-6" />,
//       color: "bg-gradient-to-r from-green-600 to-blue-600",
//       description: "Multiple companion rockets, formation flying",
//     },
//   },
//   {
//     id: "reality_hack",
//     name: "Reality Hack",
//     description: "Break the simulation itself",
//     godsCost: 20,
//     path: "chaos",
//     pathWeight: 5,
//     tier: 3,
//     effects: { soulMultiplier: 15, specialAbility: "reality_glitch" },
//     visual: {
//       icon: <Skull className="w-6 h-6" />,
//       color: "bg-gradient-to-r from-red-600 to-black",
//       description: "Space distorts around rocket, reality breaks",
//     },
//   },
//   {
//     id: "global_influence",
//     name: "Global Influence",
//     description: "Become a world power",
//     godsCost: 12,
//     path: "balance",
//     pathWeight: 5,
//     tier: 3,
//     effects: { soulMultiplier: 12, specialAbility: "diplomatic_immunity" },
//     visual: {
//       icon: <Crown className="w-6 h-6" />,
//       color: "bg-gradient-to-r from-purple-600 to-gold",
//       description: "Official escort ships, world recognition",
//     },
//   },
// ];

// // ===== MAIN COMPONENT =====
// export default function HackerUI() {
//   const [gameState, setGameState] = useState<GameState>({
//     soul: 250000,
//     gods: 500,
//     heat: 25,
//     pathScores: { solo: 0, crew: 0, chaos: 0, balance: 0 },
//     currentTier: 1,
//     upgrades: [],
//     level: 1,
//     xp: 0,
//     xpToNext: 100,
//   });

//   const [gameObjects, setGameObjects] = useState({
//     blocksDestroyed: 0,
//     currentBlockSize: 4, // 2x2 = 4 squares
//     currentBlockType: "individual",
//     soulPerSecond: 1,
//     baseReward: 10,
//   });

//   const [selectedUpgrade, setSelectedUpgrade] = useState<Upgrade | null>(null);
//   const [purchaseLog, setPurchaseLog] = useState<string[]>([]);

//   // ===== HELPER FUNCTIONS =====
//   const getDominantPath = useCallback(() => {
//     const { pathScores } = gameState;
//     return Object.keys(pathScores).reduce((a, b) =>
//       pathScores[a as keyof typeof pathScores] >
//       pathScores[b as keyof typeof pathScores]
//         ? a
//         : b
//     );
//   }, [gameState.pathScores]);

//   const getCurrentTierUpgrades = useCallback(() => {
//     // Simple tier-based filtering first
//     const allUpgrades = UPGRADES.filter(
//       (upgrade) =>
//         upgrade.tier === gameState.currentTier &&
//         !gameState.upgrades.includes(upgrade.id)
//     );

//     // Get dominant path for priority
//     const dominantPath = getDominantPath();

//     // Apply discounts and priority without strict prerequisites for now
//     const influencedUpgrades = allUpgrades.map((upgrade) => {
//       const pathInvestment = gameState.pathScores[upgrade.path] || 0;
//       const isAligned = upgrade.path === dominantPath;

//       // Calculate discount based on path investment
//       const discount = Math.min(pathInvestment * 0.15, 0.6); // Up to 60% discount

//       // Calculate priority
//       let priority = 100;
//       if (isAligned) priority += 50;
//       if (pathInvestment > 0) priority += 30;
//       if (pathInvestment > 5) priority += 20; // Big bonus for heavy investment

//       return {
//         ...upgrade,
//         priority,
//         discount,
//         pathInvestment,
//       };
//     });

//     // Sort by priority and return all available (no artificial limit)
//     return influencedUpgrades.sort((a, b) => b.priority - a.priority);
//   }, [gameState, getDominantPath]);

//   // Helper function for discount calculation
//   const calculatePathDiscount = (upgrade: any, pathScores: any) => {
//     const pathInvestment = pathScores[upgrade.path] || 0;
//     const discount = Math.min(pathInvestment * 0.15, 0.6); // Up to 60% discount
//     return discount;
//   };

//   const getDiscountedCost = useCallback(
//     (upgrade: any) => {
//       const discount = calculatePathDiscount(upgrade, gameState.pathScores);
//       if (upgrade.soulCost) {
//         return Math.floor(upgrade.soulCost * (1 - discount));
//       }
//       if (upgrade.godsCost) {
//         return Math.floor(upgrade.godsCost * (1 - discount));
//       }
//       return 0;
//     },
//     [gameState.pathScores]
//   );

//   const canAfford = useCallback(
//     (upgrade: Upgrade) => {
//       const soulAffordable =
//         !upgrade.soulCost || gameState.soul >= upgrade.soulCost;
//       const godsAffordable =
//         !upgrade.godsCost || gameState.gods >= upgrade.godsCost;
//       return soulAffordable && godsAffordable;
//     },
//     [gameState.soul, gameState.gods]
//   );

//   // ===== PURCHASE LOGIC =====
//   const purchaseUpgrade = useCallback(
//     (upgrade: Upgrade) => {
//       if (!canAfford(upgrade)) return;

//       setGameState((prev) => {
//         const newState = { ...prev };

//         // Deduct currency
//         if (upgrade.soulCost) newState.soul -= upgrade.soulCost;
//         if (upgrade.godsCost) newState.gods -= upgrade.godsCost;

//         // Add upgrade
//         newState.upgrades = [...prev.upgrades, upgrade.id];

//         // Update path scores
//         newState.pathScores = {
//           ...prev.pathScores,
//           [upgrade.path]: prev.pathScores[upgrade.path] + upgrade.pathWeight,
//         };

//         // Update tier if needed (every 3-4 upgrades)
//         const totalUpgrades = newState.upgrades.length;
//         newState.currentTier = Math.floor(totalUpgrades / 3) + 1;

//         return newState;
//       });

//       // Apply upgrade effects to game mechanics
//       setGameObjects((prev) => {
//         const newObjects = { ...prev };

//         if (upgrade.effects.soulMultiplier) {
//           newObjects.soulPerSecond *= upgrade.effects.soulMultiplier;
//           newObjects.baseReward *= upgrade.effects.soulMultiplier;
//         }

//         // Path-specific effects
//         switch (upgrade.path) {
//           case "solo":
//             newObjects.baseReward *= 1.5; // Solo gets better individual rewards
//             break;
//           case "crew":
//             newObjects.soulPerSecond *= 1.3; // Crew gets passive income bonus
//             break;
//           case "chaos":
//             newObjects.baseReward *= 2; // Chaos gets explosive rewards but more risk
//             break;
//           case "balance":
//             // Balance reduces heat generation (implemented in heat system)
//             break;
//         }

//         return newObjects;
//       });

//       // Log the purchase with effects
//       const logMessage = `🚀 ${
//         upgrade.name
//       } purchased! Path: ${upgrade.path.toUpperCase()}, Effect: ${JSON.stringify(
//         upgrade.effects
//       )}`;
//       setPurchaseLog((prev) => [logMessage, ...prev.slice(0, 4)]);

//       console.log("UPGRADE PURCHASED:", {
//         upgrade: upgrade.name,
//         path: upgrade.path,
//         effects: upgrade.effects,
//         newPathScores: gameState.pathScores,
//       });
//     },
//     [canAfford, gameState.pathScores]
//   );

//   // ===== GAME MECHANICS =====
//   // Simulate passive income and block destruction
//   React.useEffect(() => {
//     const interval = setInterval(() => {
//       setGameState((prev) => ({
//         ...prev,
//         soul: prev.soul + gameObjects.soulPerSecond,
//       }));

//       setGameObjects((prev) => ({
//         ...prev,
//         blocksDestroyed: prev.blocksDestroyed + 1,
//       }));
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [gameObjects.soulPerSecond]);

//   // Simulate block type progression
//   React.useEffect(() => {
//     const { blocksDestroyed } = gameObjects;
//     let blockType = "individual";
//     let blockSize = 4;

//     if (blocksDestroyed > 10) {
//       blockType = "business";
//       blockSize = 16; // 4x4
//     }
//     if (blocksDestroyed > 50) {
//       blockType = "corporate";
//       blockSize = 36; // 6x6
//     }
//     if (blocksDestroyed > 200) {
//       blockType = "government";
//       blockSize = 100; // 10x10
//     }

//     setGameObjects((prev) => ({
//       ...prev,
//       currentBlockType: blockType,
//       currentBlockSize: blockSize,
//     }));
//   }, [gameObjects.blocksDestroyed]);

//   // ===== RENDER HELPERS =====
//   const getPathColor = (path: string) => {
//     const colors = {
//       solo: "text-blue-400",
//       crew: "text-green-400",
//       chaos: "text-red-400",
//       balance: "text-purple-400",
//     };
//     return colors[path as keyof typeof colors] || "text-gray-400";
//   };

//   const getHeatColor = () => {
//     if (gameState.heat < 30) return "bg-green-500";
//     if (gameState.heat < 60) return "bg-yellow-500";
//     if (gameState.heat < 80) return "bg-orange-500";
//     return "bg-red-500";
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6">
//       {/* Header Stats */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//           BLOCKCHAIN HACKER
//         </h1>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//           {/* Currency */}
//           <div className="bg-gray-800 p-4 rounded-lg">
//             <div className="text-sm text-gray-400">SOUL</div>
//             <div className="text-2xl font-bold text-blue-400">
//               {gameState.soul.toLocaleString()}
//             </div>
//           </div>

//           <div className="bg-gray-800 p-4 rounded-lg">
//             <div className="text-sm text-gray-400">GODS</div>
//             <div className="text-2xl font-bold text-yellow-400">
//               {gameState.gods.toLocaleString()}
//             </div>
//           </div>

//           {/* Level Progress */}
//           <div className="bg-gray-800 p-4 rounded-lg">
//             <div className="text-sm text-gray-400">LEVEL</div>
//             <div className="text-2xl font-bold">{gameState.level}</div>
//             <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
//               <div
//                 className="bg-blue-500 h-2 rounded-full transition-all duration-300"
//                 style={{
//                   width: `${(gameState.xp / gameState.xpToNext) * 100}%`,
//                 }}
//               ></div>
//             </div>
//           </div>

//           {/* Heat Meter */}
//           <div className="bg-gray-800 p-4 rounded-lg">
//             <div className="text-sm text-gray-400 flex items-center gap-1">
//               <AlertTriangle className="w-4 h-4" />
//               HEAT
//             </div>
//             <div className="text-2xl font-bold">{gameState.heat}/100</div>
//             <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
//               <div
//                 className={`h-2 rounded-full transition-all duration-300 ${getHeatColor()}`}
//                 style={{ width: `${gameState.heat}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>

//         {/* Path Scores */}
//         <div className="bg-gray-800 p-4 rounded-lg">
//           <div className="text-sm text-gray-400 mb-2">PATH PROGRESSION</div>
//           <div className="grid grid-cols-4 gap-4">
//             {Object.entries(gameState.pathScores).map(([path, score]) => (
//               <div key={path} className="text-center">
//                 <div className={`text-lg font-bold ${getPathColor(path)}`}>
//                   {score}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase">{path}</div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-2 text-sm text-gray-400">
//             Dominant Path:{" "}
//             <span className={`font-bold ${getPathColor(getDominantPath())}`}>
//               {getDominantPath().toUpperCase()}
//             </span>
//           </div>
//           {/* Game Mechanics Display */}
//           <div className="bg-gray-800 p-4 rounded-lg">
//             <div className="text-sm text-gray-400 mb-2">GAME MECHANICS</div>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 Blocks Destroyed:{" "}
//                 <span className="text-green-400">
//                   {gameObjects.blocksDestroyed}
//                 </span>
//               </div>
//               <div>
//                 Current Block:{" "}
//                 <span className="text-blue-400">
//                   {gameObjects.currentBlockType}
//                 </span>
//               </div>
//               <div>
//                 Block Size:{" "}
//                 <span className="text-yellow-400">
//                   {gameObjects.currentBlockSize} squares
//                 </span>
//               </div>
//               <div>
//                 SOUL/sec:{" "}
//                 <span className="text-purple-400">
//                   {gameObjects.soulPerSecond.toFixed(1)}
//                 </span>
//               </div>
//               <div>
//                 Base Reward:{" "}
//                 <span className="text-green-400">
//                   {gameObjects.baseReward.toFixed(0)}
//                 </span>
//               </div>
//               <div>
//                 Total Upgrades:{" "}
//                 <span className="text-blue-400">
//                   {gameState.upgrades.length}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Current Tier Upgrades - Always 4 Options */}
//         <div className="mb-8">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-xl font-bold">
//               TIER {gameState.currentTier} UPGRADES
//             </h2>
//             <div className="text-sm text-gray-400">
//               Available: {getCurrentTierUpgrades().length} • Dominant:{" "}
//               <span className={getPathColor(getDominantPath())}>
//                 {getDominantPath().toUpperCase()}
//               </span>
//             </div>
//           </div>

//           <div className="grid grid-cols-4 gap-3">
//             {getCurrentTierUpgrades().map((upgrade) => {
//               const discountedCost = getDiscountedCost(upgrade);
//               const originalCost = upgrade.soulCost || upgrade.godsCost || 0;
//               const hasDiscount = discountedCost < originalCost;
//               const pathBonus = gameState.pathScores[upgrade.path] > 0;

//               return (
//                 <button
//                   key={upgrade.id}
//                   onClick={() =>
//                     purchaseUpgrade({
//                       ...upgrade,
//                       soulCost: upgrade.soulCost ? discountedCost : undefined,
//                       godsCost: upgrade.godsCost ? discountedCost : undefined,
//                     })
//                   }
//                   disabled={
//                     !canAfford({
//                       ...upgrade,
//                       soulCost: upgrade.soulCost ? discountedCost : undefined,
//                       godsCost: upgrade.godsCost ? discountedCost : undefined,
//                     })
//                   }
//                   className={`p-4 rounded-lg border-2 transition-all duration-200 text-left relative ${canAfford(
//                     {
//                       ...upgrade,
//                       soulCost: upgrade.soulCost ? discountedCost : undefined,
//                       godsCost: upgrade.godsCost ? discountedCost : undefined,
//                     }
//                   )} ${
//                     upgrade.path === getDominantPath() ? "border-blue-400" : ""
//                   }`}
//                 >
//                   {/* Path Bonus Indicator */}
//                   {pathBonus && (
//                     <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
//                   )}

//                   {/* Discount Badge */}
//                   {hasDiscount && (
//                     <div className="absolute top-1 left-1 bg-green-600 text-xs px-1 rounded text-white">
//                       -{Math.round((1 - discountedCost / originalCost) * 100)}%
//                     </div>
//                   )}

//                   {/* Icon and Path */}
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className={`p-1.5 rounded ${upgrade.visual.color}`}>
//                       {React.cloneElement(
//                         upgrade.visual.icon as React.ReactElement,
//                         { className: "w-4 h-4" }
//                       )}
//                     </div>
//                     <div
//                       className={`text-xs font-bold ${getPathColor(
//                         upgrade.path
//                       )}`}
//                     >
//                       {upgrade.path.toUpperCase()}
//                     </div>
//                   </div>

//                   {/* Name */}
//                   <div className="font-bold text-sm mb-1">{upgrade.name}</div>

//                   {/* Cost with discount */}
//                   <div className="text-xs mb-2">
//                     {upgrade.soulCost && (
//                       <div>
//                         <span className="text-blue-400 font-bold">
//                           {discountedCost.toLocaleString()} SOUL
//                         </span>
//                         {hasDiscount && (
//                           <span className="text-gray-500 line-through ml-1 text-xs">
//                             {originalCost.toLocaleString()}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                     {upgrade.godsCost && (
//                       <div>
//                         <span className="text-yellow-400 font-bold">
//                           {discountedCost} GODS
//                         </span>
//                         {hasDiscount && (
//                           <span className="text-gray-500 line-through ml-1 text-xs">
//                             {originalCost}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {/* Quick Effect */}
//                   <div className="text-xs text-gray-400">
//                     {upgrade.effects.soulMultiplier &&
//                       `${upgrade.effects.soulMultiplier}x SOUL`}
//                     {upgrade.effects.fireRate &&
//                       `${upgrade.effects.fireRate}x Fire Rate`}
//                     {upgrade.effects.specialAbility &&
//                       upgrade.effects.specialAbility.replace("_", " ")}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Tier Progress Bar */}
//           <div className="mt-4 bg-gray-800 p-3 rounded-lg">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-gray-400">Tier Progress</span>
//               <span className="text-sm text-gray-400">
//                 {gameState.upgrades.length % 4}/4 upgrades to next tier
//               </span>
//             </div>
//             <div className="w-full bg-gray-700 rounded-full h-2">
//               <div
//                 className="bg-purple-500 h-2 rounded-full transition-all duration-300"
//                 style={{
//                   width: `${((gameState.upgrades.length % 4) / 4) * 100}%`,
//                 }}
//               ></div>
//             </div>
//           </div>
//         </div>

//         {/* Purchase Log - Functional Focus */}
//         {purchaseLog.length > 0 && (
//           <div className="mb-4 bg-gray-800 p-3 rounded-lg">
//             <h3 className="font-bold mb-2 text-sm">UPGRADE EFFECTS LOG</h3>
//             <div className="space-y-1">
//               {purchaseLog.slice(0, 3).map((log, index) => (
//                 <div key={index} className="text-xs text-green-400 font-mono">
//                   {log}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Strategic Progression Status */}
//         <div className="bg-black p-3 rounded-lg">
//           <h3 className="font-bold mb-2 text-sm">STRATEGIC STATUS</h3>
//           <div className="text-xs text-green-400 font-mono space-y-1">
//             <div>
//               Dominant Path:{" "}
//               <span className="text-yellow-400">
//                 {getDominantPath().toUpperCase()}
//               </span>{" "}
//               (Score:{" "}
//               {
//                 gameState.pathScores[
//                   getDominantPath() as keyof typeof gameState.pathScores
//                 ]
//               }
//               )
//             </div>
//             <div>
//               Tier: {gameState.currentTier} | Next Tier:{" "}
//               {3 - (gameState.upgrades.length % 3)} upgrades remaining
//             </div>
//             <div>Available Options: {getCurrentTierUpgrades().length}</div>
//             <div>
//               Path Distribution: Solo({gameState.pathScores.solo}) Crew(
//               {gameState.pathScores.crew}) Chaos({gameState.pathScores.chaos})
//               Balance({gameState.pathScores.balance})
//             </div>
//             <div>
//               Currency Growth: SOUL +{gameObjects.soulPerSecond}/sec, Rewards:{" "}
//               {gameObjects.baseReward} per block
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
