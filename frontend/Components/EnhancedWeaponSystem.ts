// Components/EnhancedWeaponSystem.ts
import {
  Bullet,
  SpaceshipProperties,
  Position,
  PlanetBlock,
  Particle,
} from "../app/types/SpaceshipTypes";
import { PlayerDecisionState } from "../app/types/DecisionTree";

export class EnhancedWeaponSystem {
  private config: SpaceshipProperties;
  private playerState: PlayerDecisionState;
  private animationTime: number = 0;
  private BLOCK_SIZE: number = 8;

  constructor(config: SpaceshipProperties, playerState: PlayerDecisionState) {
    this.config = config;
    this.playerState = playerState;
  }

  updateConfig(config: SpaceshipProperties) {
    this.config = config;
  }

  updatePlayerState(playerState: PlayerDecisionState) {
    this.playerState = playerState;
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

    // Calculate total stats
    const configBullets = this.config.weapon.bulletCount || 1;
    const upgradeBullets = this.playerState.weaponUpgrades.bulletCountBonus;
    const totalBulletCount =
      configBullets + additionalBulletCount + upgradeBullets;

    const configDamage = this.config.weapon.damage || 1;
    const upgradeDamage = this.playerState.weaponUpgrades.damageMultiplier;
    const totalDamage = (configDamage + additionalDamage) * upgradeDamage;

    for (let i = 0; i < totalBulletCount; i++) {
      const spreadAngle =
        totalBulletCount > 1 ? (i - (totalBulletCount - 1) / 2) * 0.15 : 0;
      const vx = (directionX / distance) * 6;
      const vy = (directionY / distance) * 6;

      const bullet: Bullet = {
        x: bulletStartX,
        y: bulletStartY,
        vx: vx * Math.cos(spreadAngle) - vy * Math.sin(spreadAngle),
        vy: vx * Math.sin(spreadAngle) + vy * Math.cos(spreadAngle),
        size: 3,
        damage: totalDamage,
        type: this.config.weapon.type,
      };

      // Add special properties based on upgrades
      if (this.playerState.weaponUpgrades.piercingBullets) {
        (bullet as any).piercing = true;
        (bullet as any).pierceCount =
          this.playerState.weaponUpgrades.pierceCount;
        (bullet as any).pierceRemaining =
          this.playerState.weaponUpgrades.pierceCount;
      }

      if (this.playerState.weaponUpgrades.explosiveBullets) {
        (bullet as any).explosive = true;
        (bullet as any).explosionRadius =
          this.playerState.weaponUpgrades.explosionRadius;
      }

      bullets.push(bullet);
    }

    return bullets;
  }

  // Process bullet collisions with enhanced effects
  processBulletCollisions(
    bullets: Bullet[],
    blocks: PlanetBlock[],
    createParticles: (
      x: number,
      y: number,
      color: string,
      isExplosion?: boolean
    ) => Particle[]
  ): { destroyedBlocks: number; particlesToAdd: Particle[] } {
    let destroyedBlocks = 0;
    let particlesToAdd: Particle[] = [];

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      let bulletRemoved = false;

      for (let j = 0; j < blocks.length; j++) {
        const block = blocks[j];
        if (!block.destroyed) {
          const blockCenterX = block.x + this.BLOCK_SIZE / 2;
          const blockCenterY = block.y + this.BLOCK_SIZE / 2;
          const dx = bullet.x - blockCenterX;
          const dy = bullet.y - blockCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.BLOCK_SIZE / 2) {
            // Hit detected
            const damage = bullet.damage || 1;
            block.integrity -= damage;

            // Handle explosive bullets
            if ((bullet as any).explosive) {
              const explosionParticles = this.createExplosion(
                blockCenterX,
                blockCenterY,
                (bullet as any).explosionRadius,
                blocks,
                createParticles
              );
              particlesToAdd.push(...explosionParticles.particles);
              destroyedBlocks += explosionParticles.destroyedCount;
            }

            // Handle piercing bullets
            if (
              (bullet as any).piercing &&
              (bullet as any).pierceRemaining > 0
            ) {
              (bullet as any).pierceRemaining -= 1;

              // Don't remove bullet if it still has pierces left
              if ((bullet as any).pierceRemaining > 0) {
                // Create hit particles but keep bullet
                const hitParticles = createParticles(
                  block.x,
                  block.y,
                  this.getBlockColor(block)
                );
                particlesToAdd.push(...hitParticles);

                if (block.integrity <= 0) {
                  block.destroyed = true;
                  destroyedBlocks++;
                }
                continue; // Don't remove bullet, continue to next block
              }
            }

            // Regular hit - remove bullet
            bullets.splice(i, 1);
            bulletRemoved = true;

            if (block.integrity <= 0) {
              block.destroyed = true;
              destroyedBlocks++;
              const destroyParticles = createParticles(
                block.x,
                block.y,
                "#FF073A"
              );
              particlesToAdd.push(...destroyParticles);
            } else {
              const hitParticles = createParticles(
                block.x,
                block.y,
                this.getBlockColor(block)
              );
              particlesToAdd.push(...hitParticles);
            }

            break; // Hit something, stop checking other blocks for this bullet
          }
        }
      }

      // Remove bullet if it went off-screen (but not if it was already removed by collision)
      if (!bulletRemoved) {
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
          bullets.splice(i, 1);
        }
      }
    }

    return { destroyedBlocks, particlesToAdd };
  }

  // Create explosion effect
  private createExplosion(
    centerX: number,
    centerY: number,
    radius: number,
    blocks: PlanetBlock[],
    createParticles: (
      x: number,
      y: number,
      color: string,
      isExplosion?: boolean
    ) => Particle[]
  ): { particles: Particle[]; destroyedCount: number } {
    let particles: Particle[] = [];
    let destroyedCount = 0;

    // Damage all blocks within explosion radius
    for (const block of blocks) {
      if (block.destroyed) continue;

      const blockCenterX = block.x + this.BLOCK_SIZE / 2;
      const blockCenterY = block.y + this.BLOCK_SIZE / 2;
      const distance = Math.sqrt(
        (blockCenterX - centerX) ** 2 + (blockCenterY - centerY) ** 2
      );

      if (distance <= radius) {
        // Damage falls off with distance
        const damageFalloff = 1 - distance / radius;
        const explosionDamage = Math.max(
          1,
          this.playerState.weaponUpgrades.damageMultiplier * damageFalloff
        );

        block.integrity -= explosionDamage;

        if (block.integrity <= 0) {
          block.destroyed = true;
          destroyedCount++;
          const destroyParticles = createParticles(
            block.x,
            block.y,
            "#FF073A",
            true
          );
          particles.push(...destroyParticles);
        } else {
          const hitParticles = createParticles(
            block.x,
            block.y,
            this.getBlockColor(block),
            true
          );
          particles.push(...hitParticles);
        }
      }
    }

    // Create explosion visual effect particles
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const distance = Math.random() * radius;
      const speed = Math.random() * 4 + 2;

      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color: "#FF6B00",
        size: Math.random() * 4 + 2,
      });
    }

    return { particles, destroyedCount };
  }

  private getBlockColor(block: PlanetBlock): string {
    const integrity = block.integrity / block.maxIntegrity;
    if (integrity > 0.66) return "#00FF41";
    if (integrity > 0.33) return "#FFD700";
    return "#FF073A";
  }

  drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]) {
    for (const bullet of bullets) {
      ctx.save();

      // Enhanced visuals for special bullets
      if ((bullet as any).explosive) {
        ctx.shadowColor = "#FF6B00";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#FF6B00";

        // Pulsing effect for explosive bullets
        const pulse = Math.sin(this.animationTime * 8) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;

        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if ((bullet as any).piercing) {
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#00FFFF";

        // Elongated shape for piercing bullets
        const angle = Math.atan2(bullet.vy, bullet.vx);
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          bullet.size * 3,
          bullet.size * 0.7,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      } else {
        // Standard bullet rendering
        ctx.shadowColor = this.config.weapon.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.config.weapon.color;

        if (this.config.weapon.type === "laser") {
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
          const quantum = Math.sin(this.animationTime * 5) * 0.5 + 0.5;
          ctx.shadowColor = `hsl(${quantum * 360}, 100%, 50%)`;
          ctx.fillStyle = `hsl(${quantum * 360}, 100%, 70%)`;
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Bright center for most bullet types
      if (!(bullet as any).explosive) {
        ctx.shadowBlur = 3;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        const centerRadius = Math.max(0.5, bullet.size / 2);
        ctx.arc(bullet.x, bullet.y, centerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Update bullets (movement only - collisions handled separately)
  updateBullets(
    bullets: Bullet[],
    canvasWidth: number,
    canvasHeight: number
  ): Bullet[] {
    const activeBullets: Bullet[] = [];

    for (const bullet of bullets) {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // Keep bullets that are still on screen
      if (
        bullet.x >= 0 &&
        bullet.x <= canvasWidth &&
        bullet.y >= 0 &&
        bullet.y <= canvasHeight
      ) {
        activeBullets.push(bullet);
      }
    }

    return activeBullets;
  }

  // Auto-firing system
  shouldAutoFire(): boolean {
    return this.playerState.weaponUpgrades.autoBullets;
  }

  getAutoFireRate(): number {
    const baseRate = this.config.weapon.fireRate || 1;
    const upgradeRate = this.playerState.weaponUpgrades.fireRateBonus || 0;
    return baseRate + upgradeRate;
  }

  // Get total effective damage including all bonuses
  getTotalDamage(): number {
    const baseDamage = this.config.weapon.damage || 1;
    const multiplier = this.playerState.weaponUpgrades.damageMultiplier;
    return baseDamage * multiplier;
  }

  // Get total bullet count including all bonuses
  getTotalBulletCount(): number {
    const baseBullets = this.config.weapon.bulletCount || 1;
    const bonus = this.playerState.weaponUpgrades.bulletCountBonus;
    return baseBullets + bonus;
  }

  // Check if weapon has special abilities
  hasSpecialAbilities(): boolean {
    return (
      this.playerState.weaponUpgrades.autoBullets ||
      this.playerState.weaponUpgrades.piercingBullets ||
      this.playerState.weaponUpgrades.explosiveBullets
    );
  }

  // Get weapon status for UI display
  getWeaponStatus(): {
    damage: number;
    bulletCount: number;
    fireRate: number;
    specialAbilities: string[];
  } {
    const specialAbilities: string[] = [];

    if (this.playerState.weaponUpgrades.autoBullets)
      specialAbilities.push("Auto-Fire");
    if (this.playerState.weaponUpgrades.piercingBullets)
      specialAbilities.push(
        `Piercing (${this.playerState.weaponUpgrades.pierceCount})`
      );
    if (this.playerState.weaponUpgrades.explosiveBullets)
      specialAbilities.push(
        `Explosive (${this.playerState.weaponUpgrades.explosionRadius})`
      );

    return {
      damage: this.getTotalDamage(),
      bulletCount: this.getTotalBulletCount(),
      fireRate: this.getAutoFireRate(),
      specialAbilities,
    };
  }
}
