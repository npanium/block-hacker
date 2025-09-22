"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGameContext } from "./GameContext";

interface Position {
  x: number;
  y: number;
}

interface Satellite extends Position {
  size: number;
}

interface Bullet extends Position {
  vx: number;
  vy: number;
  size: number;
}

interface PlanetBlock extends Position {
  integrity: number;
  maxIntegrity: number;
  destroyed: boolean;
}

interface Particle extends Position {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const SatelliteGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const {
    score,
    setScore,
    handleClick: gameHandleClick,
    handleBlockDestroy,
    gameStats,
    currency,
  } = useGameContext();

  const [gameScore, setGameScore] = useState<number>(0);
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BLOCK_SIZE = 8;
  const PLANET_RADIUS = 80;
  const PLANET_CENTER: Position = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };

  // Game state refs
  const gameStateRef = useRef({
    angle: 0,
    orbitSpeed: 0.015,
    orbitRadius: 200,
    bullets: [] as Bullet[],
    planetBlocks: [] as PlanetBlock[],
    particles: [] as Particle[],
    satellite: { x: 0, y: 0, size: 20 } as Satellite,
    jetParticles: [] as Particle[],
  });

  // Initialize planet blocks with varying integrity
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

          // Random integrity levels (1-3)
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

  // Update satellite position
  const updateSatellite = () => {
    const { angle, orbitRadius, orbitSpeed } = gameStateRef.current;
    gameStateRef.current.satellite.x =
      PLANET_CENTER.x + Math.cos(angle) * orbitRadius;
    gameStateRef.current.satellite.y =
      PLANET_CENTER.y + Math.sin(angle) * orbitRadius;
    gameStateRef.current.angle += orbitSpeed;

    // Add jet stream particles from the back of the satellite triangle
    const satellite = gameStateRef.current.satellite;

    // Calculate orbital tangent (direction satellite is moving)
    const orbitalTangent = angle - Math.PI / 2;

    // Position jet stream at the back of the triangle
    const backOfTriangle = {
      x: satellite.x + Math.cos(orbitalTangent) * (satellite.size * 1.4), // Adjust this multiplier
      y: satellite.y + Math.sin(orbitalTangent) * (satellite.size * 1.4),
    };

    // Create narrow jet stream particles from the back
    for (let i = 0; i < 3; i++) {
      const distance = 5 + i * 6; // Staggered distances behind back of triangle
      const jetX = backOfTriangle.x - Math.cos(orbitalTangent) * distance;
      const jetY = backOfTriangle.y - Math.sin(orbitalTangent) * distance;

      gameStateRef.current.jetParticles.push({
        x: jetX + (Math.random() - 0.5) * 1.5, // Very narrow spread
        y: jetY + (Math.random() - 0.5) * 2.5,
        vx: -Math.cos(orbitalTangent) * (1.2 - i * 0.2),
        vy: -Math.sin(orbitalTangent) * (1.2 - i * 0.2),
        life: 20 + i * 10,
        maxLife: 30 + i * 4,
        color: "#00FFFF",
        size: 2.5 - i * 0.3,
      });
    }

    // Limit jet particles
    if (gameStateRef.current.jetParticles.length > 45) {
      gameStateRef.current.jetParticles.splice(0, 8);
    }
  };

  // Create bullet from the side of the satellite
  const createBullet = () => {
    const { satellite, angle } = gameStateRef.current;
    const orbitalTangent = angle - Math.PI / 2;
    const sideOffset = satellite.size / 3;
    const bulletStartX =
      satellite.x + Math.cos(orbitalTangent + Math.PI / 2) * sideOffset;
    const bulletStartY =
      satellite.y + Math.sin(orbitalTangent + Math.PI / 2) * sideOffset;

    const directionX = PLANET_CENTER.x - bulletStartX;
    const directionY = PLANET_CENTER.y - bulletStartY;
    const distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );

    // Create multiple bullets based on progression
    const bulletCount = gameStats.bulletCount;
    for (let i = 0; i < bulletCount; i++) {
      const spreadAngle = (i - bulletCount / 2) * 0.1; // Small spread for multiple bullets
      const vx = (directionX / distance) * 6;
      const vy = (directionY / distance) * 6;

      gameStateRef.current.bullets.push({
        x: bulletStartX,
        y: bulletStartY,
        vx: vx * Math.cos(spreadAngle) - vy * Math.sin(spreadAngle),
        vy: vx * Math.sin(spreadAngle) + vy * Math.cos(spreadAngle),
        size: 3,
      });
    }
  };

  // Create destruction particles
  const createDestructionParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = Math.random() * 3 + 2;

      gameStateRef.current.particles.push({
        x: x + BLOCK_SIZE / 2,
        y: y + BLOCK_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40,
        maxLife: 40,
        color: color,
        size: Math.random() * 3 + 1,
      });
    }
  };

  // Update bullets and particles
  const updateBullets = () => {
    const { bullets, planetBlocks, particles, jetParticles } =
      gameStateRef.current;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      if (
        bullet.x < 0 ||
        bullet.x > CANVAS_WIDTH ||
        bullet.y < 0 ||
        bullet.y > CANVAS_HEIGHT
      ) {
        bullets.splice(i, 1);
        continue;
      }

      for (let j = 0; j < planetBlocks.length; j++) {
        const block = planetBlocks[j];
        if (!block.destroyed) {
          const blockCenterX = block.x + BLOCK_SIZE / 2;
          const blockCenterY = block.y + BLOCK_SIZE / 2;
          const dx = bullet.x - blockCenterX;
          const dy = bullet.y - blockCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < BLOCK_SIZE / 2) {
            // Apply damage based on progression stats
            const damage = gameStats.clickDamage;
            block.integrity -= damage;
            bullets.splice(i, 1);

            const getBlockColor = (integrity: number, maxIntegrity: number) => {
              const ratio = integrity / maxIntegrity;
              if (ratio > 0.66) return "#00FF41";
              if (ratio > 0.33) return "#FFD700";
              return "#FF073A";
            };

            if (block.integrity <= 0) {
              block.destroyed = true;
              setGameScore((prev) => prev + 1);

              // Use progression system for rewards
              const blockData = {
                baseReward: 2, // Base currency per block
                integrity: block.integrity,
                maxIntegrity: block.maxIntegrity,
              };
              handleBlockDestroy(blockData);

              createDestructionParticles(block.x, block.y, "#FF073A");
            } else {
              createDestructionParticles(
                block.x,
                block.y,
                getBlockColor(block.integrity, block.maxIntegrity)
              );
            }
            break;
          }
        }
      }
    }
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Update jet particles
    for (let i = jetParticles.length - 1; i >= 0; i--) {
      const particle = jetParticles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
      particle.vx *= 0.95;
      particle.vy *= 0.95;

      if (particle.life <= 0) {
        jetParticles.splice(i, 1);
      }
    }
  };

  // Draw glowing triangle satellite
  const drawSatellite = (ctx: CanvasRenderingContext2D) => {
    const { satellite, angle } = gameStateRef.current;

    ctx.save();
    ctx.translate(satellite.x, satellite.y);

    // Rotate satellite to face the direction of orbital movement
    const orbitalTangent = angle + Math.PI / 2;
    ctx.rotate(orbitalTangent);

    // Outer glow
    ctx.shadowColor = "#FF007F";
    ctx.shadowBlur = 2;
    ctx.fillStyle = "#FF007F";

    // Draw triangle pointing in direction of movement
    ctx.beginPath();
    ctx.moveTo(satellite.size / 2, 0); // Point forward
    ctx.lineTo(-satellite.size / 2, satellite.size / 3); // Back bottom
    ctx.lineTo(-satellite.size / 2, -satellite.size / 3); // Back top
    ctx.closePath();
    ctx.fill();

    // Inner bright triangle
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#FF007F";
    ctx.beginPath();
    ctx.moveTo(satellite.size / 3, 0); // Point forward
    ctx.lineTo(-satellite.size / 3, satellite.size / 4); // Back bottom
    ctx.lineTo(-satellite.size / 3, -satellite.size / 4); // Back top
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Draw cyberpunk planet blocks
  const drawPlanet = (ctx: CanvasRenderingContext2D) => {
    const { planetBlocks } = gameStateRef.current;

    for (const block of planetBlocks) {
      if (!block.destroyed) {
        const integrity = block.integrity / block.maxIntegrity;

        // Color based on integrity
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

        // Glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;

        // Draw hexagon-like shape
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

        // Inner core
        ctx.shadowBlur = 3;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, (BLOCK_SIZE / 4) * integrity, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  };

  // Draw neon bullets
  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    const { bullets } = gameStateRef.current;

    for (const bullet of bullets) {
      ctx.save();
      ctx.shadowColor = "#FF6701";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#FF9D00";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fill();

      // Bright center
      ctx.shadowBlur = 3;
      ctx.fillStyle = "#FF6701";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Draw particles
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const { particles, jetParticles } = gameStateRef.current;

    // Draw jet particles as stretched triangular streak
    ctx.save();
    for (let i = jetParticles.length - 1; i >= 0; i--) {
      const particle = jetParticles[i];
      const alpha = (particle.life / particle.maxLife) * 0.8;
      const nextParticle = jetParticles[i + 1];

      if (nextParticle && alpha > 0.1) {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#FFFFFF";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 3;
        ctx.lineWidth = particle.size * alpha;

        // Draw line segment between consecutive particles for smooth streak
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(nextParticle.x, nextParticle.y);
        ctx.stroke();

        // Draw particle as small circle
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * alpha * 0.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    ctx.restore();

    // Draw destruction particles
    for (const particle of particles) {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Draw orbit with cyberpunk style
  const drawOrbit = (ctx: CanvasRenderingContext2D) => {
    const { orbitRadius } = gameStateRef.current;
    ctx.save();
    ctx.strokeStyle = "#0A2A2A";
    ctx.lineWidth = 0.2;
    // ctx.setLineDash([10, 10]);
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 1;
    ctx.beginPath();
    ctx.arc(PLANET_CENTER.x, PLANET_CENTER.y, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  // Draw cyberpunk grid background
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = "#0A1A2A";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Vertical lines
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines
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

    // Update game objects
    updateSatellite();
    updateBullets();

    // Draw game objects
    drawPlanet(ctx);
    drawParticles(ctx);
    drawSatellite(ctx);
    drawBullets(ctx);

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    createBullet();
    gameHandleClick(); // Trigger progression system click effects
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    createBullet();
    gameHandleClick();
  };

  useEffect(() => {
    initializePlanet();
    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameStats.autoClickRate > 0) {
      const interval = setInterval(() => {
        createBullet();
      }, 1000 / gameStats.autoClickRate);

      return () => clearInterval(interval);
    }
  }, [gameStats.autoClickRate]);

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-900 font-mono">
      <div className="absolute top-4 left-4 text-cyan-400 text-sm z-10 leading-tight border border-cyan-600 bg-gray-900/80 px-3 py-2 rounded backdrop-blur">
        <div className="text-cyan-300 mb-1">BLOCK HACKER</div>
        <div className="text-xs">CLICK TO HACK</div>
        <div className="text-xs mt-1">Damage: {gameStats.clickDamage}x</div>
        {gameStats.bulletCount > 1 && (
          <div className="text-xs">Multi-shot: {gameStats.bulletCount}</div>
        )}
      </div>

      <div className="absolute top-4 right-4 text-green-400 text-lg z-10 font-bold border border-green-600 bg-gray-900/80 px-3 py-2 rounded backdrop-blur">
        <div className="text-green-300 text-sm">BLOCKS HACKED</div>
        <div className="text-2xl text-center">{score}</div>
        <div className="text-purple-300 text-sm">Souls: {currency.soul}</div>
        {currency.gods > 0 && (
          <div className="text-yellow-300 text-sm">Gods: {currency.gods}</div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        className="border-2 border-cyan-600 shadow-lg shadow-cyan-500/20 cursor-crosshair bg-gray-900"
      />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-500 text-xs opacity-70">
        NEURAL LINK ESTABLISHED • BLOCKCHAIN EXPLOITATION ACTIVE
      </div>
    </div>
  );
};

export default SatelliteGame;
