// types/SpaceshipTypes.ts
export interface Position {
  x: number;
  y: number;
}

export interface Satellite extends Position {
  size: number;
}

export interface Bullet extends Position {
  vx: number;
  vy: number;
  size: number;
  damage?: number;
  type?: string;
}

export interface PlanetBlock extends Position {
  integrity: number;
  maxIntegrity: number;
  destroyed: boolean;
}

export interface Particle extends Position {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Companion extends Position {
  angle: number;
  size: number;
}

export interface SpaceshipProperties {
  shape: "triangle" | "angular" | "fluid" | "enlarged" | "ghostly";
  size: number;
  transparency: number;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  outline: {
    enabled: boolean;
    color: string;
    thickness: number;
    glowIntensity: number;
  };
  surfacePattern:
    | "none"
    | "circuits"
    | "spirals"
    | "holographic"
    | "shadow"
    | "demonic"
    | "angelic";
  patternOpacity: number;
  patternAnimation:
    | "static"
    | "flowing"
    | "pulsing"
    | "morphing"
    | "flickering";
  trail: {
    enabled: boolean;
    type:
      | "none"
      | "code"
      | "particles"
      | "shadow"
      | "energy"
      | "divine"
      | "chaos";
    color: string;
    length: number;
    fadeSpeed: number;
    particleCount: number;
  };
  companions: {
    enabled: boolean;
    count: number;
    type: "drones" | "fleet" | "strings";
    size: number;
    orbitDistance: number;
    orbitSpeed: number;
    formation: "circular" | "triangular" | "scattered";
  };
  specialEffects: {
    cloaking: boolean;
    targeting: boolean;
    morphing: boolean;
    energyField: boolean;
    crown: boolean;
    wings: boolean;
    horns: boolean;
    aura: boolean;
  };
  weapon: {
    type: "laser" | "energy" | "quantum" | "shadow" | "divine" | "chaos";
    color: string;
    chargeEffect: boolean;
    muzzleFlash: boolean;
    damage: number;
    bulletCount: number;
    fireRate: number;
  };
}

export interface GameState {
  angle: number;
  orbitSpeed: number;
  orbitRadius: number;
  bullets: Bullet[];
  planetBlocks: PlanetBlock[];
  particles: Particle[];
  satellite: Satellite;
  jetParticles: Particle[];
  companions: Companion[];
  animationTime: number;
}
