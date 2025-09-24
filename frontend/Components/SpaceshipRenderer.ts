// components/SpaceshipRenderer.ts
import {
  SpaceshipProperties,
  Satellite,
  Companion,
  GameState,
} from "../app/types/SpaceshipTypes";

export class SpaceshipRenderer {
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

  drawSatellite(
    ctx: CanvasRenderingContext2D,
    satellite: Satellite,
    angle: number,
    companions: Companion[]
  ) {
    // Draw companions first
    companions.forEach((companion) => {
      this.drawCompanion(ctx, companion);
    });

    ctx.save();
    ctx.translate(satellite.x, satellite.y);

    const orbitalTangent = angle + Math.PI / 2;
    ctx.rotate(orbitalTangent);

    // Apply transparency
    ctx.globalAlpha = this.config.transparency;

    // Apply special effects
    if (this.config.specialEffects.cloaking) {
      ctx.globalAlpha *= 0.6 + 0.4 * Math.sin(this.animationTime * 2);
    }

    if (this.config.specialEffects.energyField) {
      ctx.shadowColor = this.config.glowColor;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = this.config.glowColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, satellite.size * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = this.config.transparency;
    }

    // Outer glow
    ctx.shadowColor = this.config.outline.color;
    ctx.shadowBlur =
      this.config.outline.thickness * this.config.outline.glowIntensity;
    ctx.fillStyle = this.config.primaryColor;

    // Draw shape based on configuration
    this.drawShapeByType(ctx, satellite);

    // Draw surface patterns
    this.drawSurfacePatterns(ctx, satellite);

    // Draw special effects decorations
    this.drawSpecialEffects(ctx, satellite);

    ctx.restore();
  }

  private drawShapeByType(ctx: CanvasRenderingContext2D, satellite: Satellite) {
    const size = satellite.size;

    if (this.config.shape === "angular") {
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(-size / 2, size / 3);
      ctx.lineTo(-size / 4, 0);
      ctx.lineTo(-size / 2, -size / 3);
      ctx.closePath();
      ctx.fill();
    } else if (this.config.shape === "fluid") {
      const morph = Math.sin(this.animationTime) * 0.3;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(-size / 2, size / 3 + morph * 5);
      ctx.lineTo(-size / 2, -size / 3 - morph * 5);
      ctx.closePath();
      ctx.fill();
    } else if (this.config.shape === "ghostly") {
      const flicker = this.config.specialEffects.cloaking
        ? 0.3 + 0.4 * Math.random()
        : 1;
      ctx.globalAlpha *= flicker;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(-size / 2, size / 3);
      ctx.lineTo(-size / 2, -size / 3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Default triangle
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(-size / 2, size / 3);
      ctx.lineTo(-size / 2, -size / 3);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawSurfacePatterns(
    ctx: CanvasRenderingContext2D,
    satellite: Satellite
  ) {
    if (this.config.surfacePattern === "none") return;

    const size = satellite.size;
    ctx.globalAlpha = this.config.patternOpacity;
    ctx.strokeStyle = this.config.secondaryColor;
    ctx.lineWidth = 1;

    if (this.config.surfacePattern === "circuits") {
      ctx.beginPath();
      ctx.moveTo(-size / 4, -size / 6);
      ctx.lineTo(size / 6, -size / 6);
      ctx.lineTo(size / 6, size / 6);
      ctx.lineTo(-size / 4, size / 6);
      ctx.stroke();

      if (this.config.patternAnimation === "flowing") {
        const flowOffset = (this.animationTime * 2) % (size / 2);
        ctx.fillStyle = this.config.secondaryColor;
        ctx.beginPath();
        const radius = Math.max(1, 2); // Prevent zero radius
        ctx.arc(-size / 4 + flowOffset, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.config.surfacePattern === "spirals") {
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 4;
        const radius = ((i / 20) * size) / 4;
        const x = Math.cos(angle + this.animationTime) * radius;
        const y = Math.sin(angle + this.animationTime) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  private drawSpecialEffects(
    ctx: CanvasRenderingContext2D,
    satellite: Satellite
  ) {
    const size = satellite.size;

    if (this.config.specialEffects.crown) {
      // Isolate the crown's transformations
      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 10;
      ctx.beginPath();

      // Base of crown (left to right)
      const baseY = -size / 3;
      const baseLeft = -size / 2.5;
      const baseRight = size / 2.5;

      // Peak heights (center tallest, decreasing outward)
      const centerPeakHeight = -size / 1.1; // Tallest
      const innerPeakHeight = -size / 1.3; // Medium
      const outerPeakHeight = -size / 1.5; // Shortest

      // Peak positions (evenly spaced)
      const peakWidth = (baseRight - baseLeft) / 5; // 5 peaks = 4 intervals

      // Start at bottom left
      ctx.moveTo(baseLeft, baseY);

      // Peak 1 (leftmost - shortest)
      ctx.lineTo(baseLeft + peakWidth * 0.5, outerPeakHeight);
      ctx.lineTo(baseLeft + peakWidth, baseY);

      // Peak 2 (left-center - medium)
      ctx.lineTo(baseLeft + peakWidth * 1.5, innerPeakHeight);
      ctx.lineTo(baseLeft + peakWidth * 2, baseY);

      // Peak 3 (center - tallest)
      ctx.lineTo(baseLeft + peakWidth * 2.5, centerPeakHeight);
      ctx.lineTo(baseLeft + peakWidth * 3, baseY);

      // Peak 4 (right-center - medium)
      ctx.lineTo(baseLeft + peakWidth * 3.5, innerPeakHeight);
      ctx.lineTo(baseLeft + peakWidth * 4, baseY);

      // Peak 5 (rightmost - shortest)
      ctx.lineTo(baseRight - peakWidth * 0.5, outerPeakHeight);
      ctx.lineTo(baseRight, baseY);

      // Close the crown base
      ctx.lineTo(baseRight, baseY + size / 6); // Crown thickness
      ctx.lineTo(baseLeft, baseY + size / 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (this.config.specialEffects.horns) {
      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#FF0000";
      ctx.shadowColor = "#FF0000";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;

      // Left horn - curves to the right (inward)
      ctx.beginPath();
      ctx.moveTo(-size / 4, -size / 3);
      // Create curved path using quadratic curve
      ctx.quadraticCurveTo(
        -size / 6, // control point x
        -size / 0.8, // control point y (much higher for length)
        size / 8, // end point x (curves inward to the right)
        -size / 0.75 // end point y
      );
      ctx.quadraticCurveTo(
        size / 6, // control point x for the hook
        -size / 0.7, // control point y for the hook
        size / 10, // end point x (slight hook at the end)
        -size / 0.8 // end point y
      );
      // Draw back down to create horn thickness
      ctx.quadraticCurveTo(
        size / 12, // control point x
        -size / 0.85, // control point y
        -size / 8, // end point x (back toward the base)
        -size / 0.9 // end point y
      );
      ctx.quadraticCurveTo(
        -size / 8, // control point x
        -size / 0.95, // control point y
        -size / 6, // end point x (back to base area)
        -size / 3 // end point y
      );
      ctx.closePath();
      ctx.fill();

      // Right horn - curves to the left (inward)
      ctx.beginPath();
      ctx.moveTo(size / 4, -size / 3);
      // Create curved path using quadratic curve (mirror of left)
      ctx.quadraticCurveTo(
        size / 6, // control point x
        -size / 0.8, // control point y (much higher for length)
        -size / 8, // end point x (curves inward to the left)
        -size / 0.75 // end point y
      );
      ctx.quadraticCurveTo(
        -size / 6, // control point x for the hook
        -size / 0.7, // control point y for the hook
        -size / 10, // end point x (slight hook at the end)
        -size / 0.8 // end point y
      );
      // Draw back down to create horn thickness
      ctx.quadraticCurveTo(
        -size / 12, // control point x
        -size / 0.85, // control point y
        size / 8, // end point x (back toward the base)
        -size / 0.9 // end point y
      );
      ctx.quadraticCurveTo(
        size / 8, // control point x
        -size / 0.95, // control point y
        size / 6, // end point x (back to base area)
        -size / 3 // end point y
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    if (this.config.specialEffects.wings) {
      ctx.strokeStyle = "#FFFFFF";
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2;

      // Left wing
      ctx.beginPath();
      ctx.moveTo(-size / 3, size / 6);
      ctx.quadraticCurveTo(-size, 0, -size / 3, -size / 6);
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(size / 3, size / 6);
      ctx.quadraticCurveTo(size, 0, size / 3, -size / 6);
      ctx.stroke();
    }
  }

  drawCompanion(ctx: CanvasRenderingContext2D, companion: Companion) {
    ctx.save();
    ctx.translate(companion.x, companion.y);
    ctx.rotate(companion.angle);

    ctx.globalAlpha = 0.8;
    ctx.shadowColor = this.config.glowColor;
    ctx.shadowBlur = 5;
    ctx.fillStyle = this.config.primaryColor;

    const size = companion.size;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(-size / 2, size / 3);
    ctx.lineTo(-size / 2, -size / 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
