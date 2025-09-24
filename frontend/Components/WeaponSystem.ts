// components/WeaponSystem.ts
import {
  Bullet,
  SpaceshipProperties,
  Position,
} from "../app/types/SpaceshipTypes";

export class WeaponSystem {
  private config: SpaceshipProperties;
  private animationTime: number = 0;

  constructor(config: SpaceshipProperties) {
    this.config = config;
  }

  updateConfig(config: SpaceshipProperties) {
    this.config = config;
  }

  setAnimationTime(time: number) {
    this.animationTime = time;
  }

  createBullets(
    satellite: { x: number; y: number; size: number },
    angle: number,
    targetCenter: Position,
    additionalDamage: number = 0,
    additionalBulletCount: number = 0
  ): Bullet[] {
    const bullets: Bullet[] = [];
    const orbitalTangent = angle - Math.PI / 2;
    const sideOffset = satellite.size / 3;
    const bulletStartX =
      satellite.x + Math.cos(orbitalTangent + Math.PI / 2) * sideOffset;
    const bulletStartY =
      satellite.y + Math.sin(orbitalTangent + Math.PI / 2) * sideOffset;

    const directionX = targetCenter.x - bulletStartX;
    const directionY = targetCenter.y - bulletStartY;
    const distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );

    // Total bullet count from config + upgrades
    const totalBulletCount =
      this.config.weapon.bulletCount + additionalBulletCount;
    // Total damage from config + upgrades
    const totalDamage = this.config.weapon.damage + additionalDamage;

    for (let i = 0; i < totalBulletCount; i++) {
      const spreadAngle =
        totalBulletCount > 1 ? (i - (totalBulletCount - 1) / 2) * 0.15 : 0;
      const vx = (directionX / distance) * 6;
      const vy = (directionY / distance) * 6;

      bullets.push({
        x: bulletStartX,
        y: bulletStartY,
        vx: vx * Math.cos(spreadAngle) - vy * Math.sin(spreadAngle),
        vy: vx * Math.sin(spreadAngle) + vy * Math.cos(spreadAngle),
        size: 3,
        damage: totalDamage,
        type: this.config.weapon.type,
      });
    }

    return bullets;
  }

  drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]) {
    for (const bullet of bullets) {
      ctx.save();
      ctx.shadowColor = this.config.weapon.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.config.weapon.color;

      if (this.config.weapon.type === "laser") {
        // Laser style - elongated
        const angle = Math.atan2(bullet.vy, bullet.vx);
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          bullet.size * 2,
          bullet.size * 0.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      } else if (this.config.weapon.type === "quantum") {
        // Quantum style - shifting colors
        const quantum = Math.sin(this.animationTime * 5) * 0.5 + 0.5;
        ctx.shadowColor = `hsl(${quantum * 360}, 100%, 50%)`;
        ctx.fillStyle = `hsl(${quantum * 360}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.config.weapon.type === "shadow") {
        // Shadow style - dark with red edges
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = "#FF0000";
        ctx.fillStyle = "#800000";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.config.weapon.type === "chaos") {
        // Chaos style - erratic effects
        const chaos =
          Math.sin(this.animationTime * 8 + bullet.x * 0.01) * 0.5 + 0.5;
        ctx.shadowBlur = 5 + chaos * 10;
        ctx.beginPath();
        ctx.arc(
          bullet.x,
          bullet.y,
          bullet.size * (0.8 + chaos * 0.4),
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        // Default energy style
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright center for most weapon types
      if (this.config.weapon.type !== "shadow") {
        ctx.shadowBlur = 3;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        const centerRadius = Math.max(0.5, bullet.size / 2); // Prevent zero radius
        ctx.arc(bullet.x, bullet.y, centerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
