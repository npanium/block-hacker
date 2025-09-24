"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGameContext } from "./GameContext";
import {
  SpaceshipProperties,
  GameState,
  Position,
  Bullet,
  PlanetBlock,
  Particle,
  Companion,
} from "../types/SpaceshipTypes";
import { spaceshipConfigs } from "../app/config/SpaceshipConfigs";
import { SpaceshipRenderer } from "./SpaceshipRenderer";
// import { WeaponSystem } from "./WeaponSystem";
import { ParticleSystem } from "./ParticleSystem";
import { EnhancedWeaponSystem } from "./EnhancedWeaponSystem";
import DecisionSystem from "./DecisionSystem";
import { DecisionChoice } from "@/app/types/DecisionTree";
import { determinePathAlignment } from "@/app/data/DecisionData";

const SatelliteGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const {
    gameStats,
    currency,
    setCurrency,
    totalBlocksDestroyed,
    setTotalBlocksDestroyed,
    playerDecisionState,
    setPlayerDecisionState,
  } = useGameContext();

  const [gameScore, setGameScore] = useState<number>(0);
  const [selectedConfig, setSelectedConfig] = useState<string>("default");
  const [currentConfig, setCurrentConfig] = useState<SpaceshipProperties>(
    spaceshipConfigs.default
  );

  // Game systems
  const spaceshipRenderer = useRef<SpaceshipRenderer>(
    new SpaceshipRenderer(spaceshipConfigs.default)
  );
  const enhancedWeaponSystem = useRef<EnhancedWeaponSystem>(
    new EnhancedWeaponSystem(spaceshipConfigs.default, playerDecisionState)
  );
  const particleSystem = useRef<ParticleSystem>(
    new ParticleSystem(spaceshipConfigs.default)
  );

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BLOCK_SIZE = 8;
  const PLANET_RADIUS = 80;
  const PLANET_CENTER: Position = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };

  // Game state refs
  const gameStateRef = useRef<GameState>({
    angle: 0,
    orbitSpeed: 0.015,
    orbitRadius: 200,
    bullets: [] as Bullet[],
    planetBlocks: [] as PlanetBlock[],
    particles: [] as Particle[],
    satellite: { x: 0, y: 0, size: 20 },
    jetParticles: [] as Particle[],
    companions: [] as Companion[],
    animationTime: 0,
  });

  // Handle config change
  const handleConfigChange = (configName: string) => {
    setSelectedConfig(configName);
    const newConfig = spaceshipConfigs[configName];
    setCurrentConfig(newConfig);

    // Update all systems with new config
    spaceshipRenderer.current.updateConfig(newConfig);
    enhancedWeaponSystem.current.updateConfig(newConfig);
    particleSystem.current.updateConfig(newConfig);
  };

  // Initialize planet blocks
  const initializePlanet = () => {
    const blocks: PlanetBlock[] = [];
    const halfSize = PLANET_RADIUS;
    const rotationAngle = Math.PI / 4;

    for (let x = -halfSize; x <= halfSize; x += BLOCK_SIZE) {
      for (let y = -halfSize; y <= halfSize; y += BLOCK_SIZE) {
        if (Math.abs(x) + Math.abs(y) <= halfSize) {
          const rotatedX =
            x * Math.cos(rotationAngle) - y * Math.sin(rotationAngle);
          const rotatedY =
            x * Math.sin(rotationAngle) + y * Math.cos(rotationAngle);

          const integrity = Math.floor(Math.random() * 3) + 1;

          blocks.push({
            x: PLANET_CENTER.x + rotatedX,
            y: PLANET_CENTER.y + rotatedY,
            integrity: integrity,
            maxIntegrity: integrity,
            destroyed: false,
          });
        }
      }
    }

    gameStateRef.current.planetBlocks = blocks;
  };

  // Update satellite position and companions
  const updateSatellite = () => {
    const gameState = gameStateRef.current;
    gameState.animationTime += 0.1;

    // Update animation time in all systems
    spaceshipRenderer.current.setAnimationTime(gameState.animationTime);
    enhancedWeaponSystem.current.setAnimationTime(gameState.animationTime);

    // Update main satellite
    gameState.satellite.x =
      PLANET_CENTER.x + Math.cos(gameState.angle) * gameState.orbitRadius;
    gameState.satellite.y =
      PLANET_CENTER.y + Math.sin(gameState.angle) * gameState.orbitRadius;
    gameState.satellite.size = 20 * currentConfig.size;
    gameState.angle += gameState.orbitSpeed;

    // Update companions if enabled
    if (currentConfig.companions.enabled) {
      const companionCount = currentConfig.companions.count;
      const companions = gameState.companions;

      // Initialize companions if needed
      if (companions.length !== companionCount) {
        gameState.companions = [];
        for (let i = 0; i < companionCount; i++) {
          companions.push({
            x: 0,
            y: 0,
            angle: (Math.PI * 2 * i) / companionCount,
            size: 20 * currentConfig.companions.size,
          });
        }
      }

      // Update companion positions
      companions.forEach((companion: any, i: any) => {
        const satelliteX = gameState.satellite.x;
        const satelliteY = gameState.satellite.y;

        companion.angle += currentConfig.companions.orbitSpeed * 0.01;
        companion.x =
          satelliteX +
          Math.cos(companion.angle) * currentConfig.companions.orbitDistance;
        companion.y =
          satelliteY +
          Math.sin(companion.angle) * currentConfig.companions.orbitDistance;
      });
    } else {
      gameState.companions = [];
    }

    // Create trail particles
    const newTrailParticles = particleSystem.current.createTrailParticles(
      gameState.satellite,
      gameState.angle
    );
    gameState.jetParticles.push(...newTrailParticles);

    // Limit trail particles length
    if (gameState.jetParticles.length > currentConfig.trail.length) {
      gameState.jetParticles.splice(
        0,
        gameState.jetParticles.length - currentConfig.trail.length
      );
    }
  };

  // Create bullets
  const createBullet = () => {
    const gameState = gameStateRef.current;

    // Get additional stats from game progression
    const additionalDamage = gameStats.clickDamage - 1; // Base damage is 1
    const additionalBulletCount = gameStats.bulletCount - 1; // Base bullet count is 1

    const newBullets = enhancedWeaponSystem.current.createBullets(
      gameState.satellite,
      gameState.angle,
      PLANET_CENTER,
      additionalDamage,
      additionalBulletCount
    );

    gameState.bullets.push(...newBullets);
  };

  // Update bullets and handle collisions
  const updateBullets = () => {
    const gameState = gameStateRef.current;

    // Update bullet positions
    for (const bullet of gameState.bullets) {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
    }

    // Process collisions with enhanced weapon system
    const createParticlesFn = (
      x: number,
      y: number,
      color: string,
      isExplosion = false
    ) => {
      return particleSystem.current.createDestructionParticles(
        x,
        y,
        color,
        BLOCK_SIZE
      );
    };

    const collisionResult =
      enhancedWeaponSystem.current.processBulletCollisions(
        gameState.bullets,
        gameState.planetBlocks,
        createParticlesFn
      );

    // Add new particles
    gameState.particles.push(...collisionResult.particlesToAdd);

    // Update counters
    if (collisionResult.destroyedBlocks > 0) {
      setTotalBlocksDestroyed((prev) => prev + collisionResult.destroyedBlocks);
      setGameScore((prev) => prev + collisionResult.destroyedBlocks);
      setCurrency((prev) => ({
        soul: prev.soul + collisionResult.destroyedBlocks,
        gods: prev.gods,
      }));
    }

    const remainingBlocks = gameState.planetBlocks.filter(
      (block: any) => !block.destroyed
    );
    if (remainingBlocks.length === 0) {
      initializePlanet(); // Regenerate the planet
    }
    // Clean up off-screen bullets
    gameState.bullets = gameState.bullets.filter(
      (bullet: { x: number; y: number }) =>
        bullet.x >= 0 &&
        bullet.x <= CANVAS_WIDTH &&
        bullet.y >= 0 &&
        bullet.y <= CANVAS_HEIGHT
    );

    // Update particles
    gameState.particles = particleSystem.current.updateParticles(
      gameState.particles
    );
    gameState.jetParticles = particleSystem.current.updateTrailParticles(
      gameState.jetParticles
    );
  };

  // Draw cyberpunk planet blocks
  const drawPlanet = (ctx: CanvasRenderingContext2D) => {
    const { planetBlocks } = gameStateRef.current;

    for (const block of planetBlocks) {
      if (!block.destroyed) {
        const integrity = block.integrity / block.maxIntegrity;

        let color, glowColor;
        if (integrity > 0.66) {
          color = "#00FF41";
          glowColor = "#00FF41";
        } else if (integrity > 0.33) {
          color = "#FFD700";
          glowColor = "#FFD700";
        } else {
          color = "#FF073A";
          glowColor = "#FF073A";
        }

        ctx.save();

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;

        ctx.translate(block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = (Math.cos(angle) * BLOCK_SIZE) / 2;
          const y = (Math.sin(angle) * BLOCK_SIZE) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 3;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        const coreRadius = Math.max(0.5, (BLOCK_SIZE / 4) * integrity); // Prevent zero radius
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  };

  // Draw orbit
  const drawOrbit = (ctx: CanvasRenderingContext2D) => {
    const { orbitRadius } = gameStateRef.current;
    ctx.save();
    ctx.strokeStyle = "#0A2A2A";
    ctx.lineWidth = 0.2;
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 1;
    ctx.beginPath();
    ctx.arc(PLANET_CENTER.x, PLANET_CENTER.y, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  // Draw background
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = "#0A1A2A";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Game loop
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000511";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background elements
    drawBackground(ctx);
    drawOrbit(ctx);

    // Update game state
    updateSatellite();
    updateBullets();

    // Draw game objects
    drawPlanet(ctx);
    particleSystem.current.drawDestructionParticles(
      ctx,
      gameStateRef.current.particles
    );
    particleSystem.current.drawTrailParticles(
      ctx,
      gameStateRef.current.jetParticles
    );
    spaceshipRenderer.current.drawSatellite(
      ctx,
      gameStateRef.current.satellite,
      gameStateRef.current.angle,
      gameStateRef.current.companions
    );
    enhancedWeaponSystem.current.drawBullets(ctx, gameStateRef.current.bullets);

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    createBullet();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    createBullet();
  };

  // Initialize game
  useEffect(() => {
    initializePlanet();
    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Add this new useEffect for decision-based auto-shooting
  useEffect(() => {
    if (playerDecisionState.weaponUpgrades.autoBullets) {
      const autoFireRate = enhancedWeaponSystem.current.getAutoFireRate();
      const interval = setInterval(() => {
        createBullet();
      }, 1000 / Math.max(0.1, autoFireRate)); // Prevent division by zero

      return () => clearInterval(interval);
    }
  }, [playerDecisionState.weaponUpgrades.autoBullets, currentConfig]);

  // Auto-clicking
  useEffect(() => {
    if (gameStats.autoClickRate > 0) {
      const interval = setInterval(() => {
        createBullet();
      }, 1000 / gameStats.autoClickRate);

      return () => clearInterval(interval);
    }
  }, [gameStats.autoClickRate, currentConfig]);

  useEffect(() => {
    enhancedWeaponSystem.current.updatePlayerState(playerDecisionState);
  }, [playerDecisionState]);

  const handleChoiceSelect = (choice: DecisionChoice) => {
    const cost = choice.cost;

    // Check if player can afford it
    if (cost.soul && currency.soul < cost.soul) return;
    if (cost.gods && currency.gods < cost.gods) return;

    // Deduct cost - you'll need to add setCurrency to your GameContext
    // For now, we'll assume you add this to GameContext later
    setCurrency((prev) => ({
      soul: prev.soul - (cost.soul || 0),
      gods: prev.gods - (cost.gods || 0),
    }));
    // Apply effects
    const newPlayerState = { ...playerDecisionState };
    const effects = choice.effects;

    // Update weapon upgrades
    if (effects.enableAutoBullets)
      newPlayerState.weaponUpgrades.autoBullets = true;
    if (effects.enablePiercingBullets)
      newPlayerState.weaponUpgrades.piercingBullets = true;
    if (effects.enableExplosiveBullets)
      newPlayerState.weaponUpgrades.explosiveBullets = true;
    if (effects.damageMultiplier)
      newPlayerState.weaponUpgrades.damageMultiplier *=
        effects.damageMultiplier;
    if (effects.bulletCountBonus)
      newPlayerState.weaponUpgrades.bulletCountBonus +=
        effects.bulletCountBonus;
    if (effects.fireRateBonus)
      newPlayerState.weaponUpgrades.fireRateBonus += effects.fireRateBonus;
    if (effects.explosionRadius)
      newPlayerState.weaponUpgrades.explosionRadius = effects.explosionRadius;
    if (effects.pierceCount)
      newPlayerState.weaponUpgrades.pierceCount = effects.pierceCount;

    // Update path points
    if (effects.evilPoints) newPlayerState.evilPoints += effects.evilPoints;
    if (effects.redemptionPoints)
      newPlayerState.redemptionPoints += effects.redemptionPoints;

    // Update path alignment
    newPlayerState.pathAlignment = determinePathAlignment(
      newPlayerState.evilPoints,
      newPlayerState.redemptionPoints
    );

    // Add to selected choices
    newPlayerState.selectedChoices.push(choice.id);

    // Update spaceship config if specified
    if (effects.spaceshipConfig) {
      handleConfigChange(effects.spaceshipConfig);
    }

    // Update stage progression
    const totalChoices = newPlayerState.selectedChoices.length;
    if (totalChoices >= 5) newPlayerState.currentStage = 2;
    if (totalChoices >= 10) newPlayerState.currentStage = 3;
    if (totalChoices >= 15) newPlayerState.currentStage = 4;
    if (totalChoices >= 20) newPlayerState.currentStage = 5;

    console.log("Before update:", playerDecisionState.weaponUpgrades);
    console.log("Choice effects:", effects);

    setPlayerDecisionState(newPlayerState);

    console.log("Choice applied:", choice.title, "New state:", newPlayerState);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-900 font-mono">
      {/* Spaceship Configuration Selector */}
      <div className="absolute top-4 left-4 text-cyan-400 text-sm z-10 leading-tight border border-cyan-600 bg-gray-900/90 px-3 py-2 rounded backdrop-blur">
        <div className="text-cyan-300 mb-2">SPACESHIP CONFIG</div>
        <select
          value={selectedConfig}
          onChange={(e) => handleConfigChange(e.target.value)}
          className="bg-gray-800 border border-cyan-600 text-cyan-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-cyan-300"
        >
          <option value="default">Default</option>
          <option value="technical">🔧 Technical</option>
          <option value="social">🎭 Social</option>
          <option value="crew">👥 Crew</option>
          <option value="solo">🥷 Solo</option>
          <option value="systemController">🏗️ System Controller</option>
          <option value="digitalGod">⚛️ Digital God</option>
          <option value="criminalEmperor">👑 Criminal Emperor</option>
          <option value="overlord">👹 Overlord</option>
        </select>

        <div className="text-xs mt-2 border-t border-gray-700 pt-2">
          <div>Shape: {currentConfig.shape}</div>
          <div>Size: {currentConfig.size.toFixed(1)}x</div>
          <div>Trail: {currentConfig.trail.type}</div>
          <div>Damage: {currentConfig.weapon.damage}x</div>
          <div>Bullets: {currentConfig.weapon.bulletCount}</div>
          {currentConfig.companions.enabled && (
            <div>Companions: {currentConfig.companions.count}</div>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 text-green-400 text-lg z-10 font-bold border border-green-600 bg-gray-900/80 px-3 py-2 rounded backdrop-blur">
        <div className="text-green-300 text-sm">TXNs HACKED</div>
        <div className="text-2xl text-center">{gameScore}</div>
        <div className="text-purple-300 text-sm">Souls: {currency.soul}</div>
        {currency.gods > 0 && (
          <div className="text-yellow-300 text-sm">Gods: {currency.gods}</div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 text-cyan-400 text-sm z-10 leading-tight border border-cyan-600 bg-gray-900/80 px-3 py-2 rounded backdrop-blur">
        <div className="text-cyan-300 mb-1">GAME STATS</div>
        <div className="text-xs">Base Damage: {gameStats.clickDamage}x</div>
        <div className="text-xs">
          Total Damage:{" "}
          {currentConfig.weapon.damage + (gameStats.clickDamage - 1)}x
        </div>
        <div className="text-xs">Base Bullets: {gameStats.bulletCount}</div>
        <div className="text-xs">
          Total Bullets:{" "}
          {currentConfig.weapon.bulletCount + (gameStats.bulletCount - 1)}
        </div>
        {gameStats.autoClickRate > 0 && (
          <div className="text-xs">Auto: {gameStats.autoClickRate}/sec</div>
        )}
      </div>

      <div className="flex flex-col max-w-screen-md">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          className="border-2 border-cyan-600 shadow-lg shadow-cyan-500/20 cursor-crosshair bg-gray-900"
        />
        <DecisionSystem
          playerState={playerDecisionState}
          totalBlocksDestroyed={totalBlocksDestroyed}
          currency={currency}
          onChoiceSelect={handleChoiceSelect}
        />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-500 text-xs opacity-70">
        NEURAL LINK ESTABLISHED • MODULAR SPACESHIP SYSTEM ACTIVE
      </div>
    </div>
  );
};

export default SatelliteGame;
