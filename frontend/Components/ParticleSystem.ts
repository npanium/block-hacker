// components/ParticleSystem.ts
import { Particle, SpaceshipProperties } from "../app/types/SpaceshipTypes";

export class ParticleSystem {
  private config: SpaceshipProperties;

  constructor(config: SpaceshipProperties) {
    this.config = config;
  }

  updateConfig(config: SpaceshipProperties) {
    this.config = config;
  }

  createTrailParticles(
    satellite: { x: number; y: number; size: number },
    angle: number
  ): Particle[] {
    if (!this.config.trail.enabled) return [];

    const particles: Particle[] = [];
    const orbitalTangent = angle - Math.PI / 2;

    const backOfTriangle = {
      x: satellite.x + Math.cos(orbitalTangent) * (satellite.size * 1.4),
      y: satellite.y + Math.sin(orbitalTangent) * (satellite.size * 1.4),
    };

    for (let i = 0; i < this.config.trail.particleCount; i++) {
      const distance = 5 + i * 6;
      const jetX = backOfTriangle.x - Math.cos(orbitalTangent) * distance;
      const jetY = backOfTriangle.y - Math.sin(orbitalTangent) * distance;

      particles.push({
        x: jetX + (Math.random() - 0.5) * 1.5,
        y: jetY + (Math.random() - 0.5) * 2.5,
        vx: -Math.cos(orbitalTangent) * (1.2 - i * 0.2),
        vy: -Math.sin(orbitalTangent) * (1.2 - i * 0.2),
        life: 20 + i * 10,
        maxLife: 30 + i * 4,
        color: this.config.trail.color,
        size: Math.max(0.5, 2.5 - i * 0.3), // Prevent zero size
      });
    }

    return particles;
  }

  createDestructionParticles(
    x: number,
    y: number,
    color: string,
    blockSize: number
  ): Particle[] {
    const particles: Particle[] = [];

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = Math.random() * 3 + 2;

      particles.push({
        x: x + blockSize / 2,
        y: y + blockSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40,
        maxLife: 40,
        color: color,
        size: Math.max(1, Math.random() * 3 + 1), // Prevent zero size
      });
    }

    return particles;
  }

  updateParticles(particles: Particle[]): Particle[] {
    const activeParticles: Particle[] = [];

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      if (particle.life > 0) {
        activeParticles.push(particle);
      }
    }

    return activeParticles;
  }

  updateTrailParticles(jetParticles: Particle[]): Particle[] {
    const activeParticles: Particle[] = [];

    for (const particle of jetParticles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= Math.max(0.1, this.config.trail.fadeSpeed * 10); // Prevent negative fade
      particle.vx *= 0.95;
      particle.vy *= 0.95;

      if (particle.life > 0) {
        activeParticles.push(particle);
      }
    }

    return activeParticles;
  }

  drawTrailParticles(ctx: CanvasRenderingContext2D, jetParticles: Particle[]) {
    if (!this.config.trail.enabled) return;

    ctx.save();

    for (let i = jetParticles.length - 1; i >= 0; i--) {
      const particle = jetParticles[i];
      const alpha = Math.max(0, (particle.life / particle.maxLife) * 0.8); // Prevent negative alpha
      const nextParticle = jetParticles[i + 1];

      if (nextParticle && alpha > 0.1) {
        ctx.globalAlpha = alpha;

        if (this.config.trail.type === "code") {
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 3;
          ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
        } else if (this.config.trail.type === "energy") {
          ctx.strokeStyle = particle.color;
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 8;
          ctx.lineWidth = Math.max(0.1, particle.size * alpha); // Prevent zero line width

          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(nextParticle.x, nextParticle.y);
          ctx.stroke();
        } else if (this.config.trail.type === "shadow") {
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 2;
          ctx.beginPath();
          const radius = Math.max(0.5, particle.size * alpha * 0.5); // Prevent zero radius
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.config.trail.type === "chaos") {
          ctx.strokeStyle = particle.color;
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 5;
          ctx.lineWidth = Math.max(0.1, particle.size * alpha * 1.5); // Prevent zero line width

          // Chaotic trail with random offsets
          const chaosX = particle.x + (Math.random() - 0.5) * 2;
          const chaosY = particle.y + (Math.random() - 0.5) * 2;

          ctx.beginPath();
          ctx.moveTo(chaosX, chaosY);
          ctx.lineTo(nextParticle.x, nextParticle.y);
          ctx.stroke();
        } else {
          // Default particle trail
          ctx.strokeStyle = particle.color;
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 3;
          ctx.lineWidth = Math.max(0.1, particle.size * alpha); // Prevent zero line width

          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(nextParticle.x, nextParticle.y);
          ctx.stroke();

          ctx.beginPath();
          const radius = Math.max(0.1, particle.size * alpha * 0.2); // Prevent zero radius
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  drawDestructionParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) {
    for (const particle of particles) {
      const alpha = Math.max(0, particle.life / particle.maxLife); // Prevent negative alpha
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      const radius = Math.max(0.5, particle.size * alpha); // Prevent zero radius
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
