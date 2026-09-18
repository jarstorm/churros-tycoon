// Shared perspective geometry for the day simulation scene.
// Depth is expressed as t: 0 = far (at the horizon), 1 = near (bottom of the scene).

export const HORIZON_RATIO = 0.44;

export function horizonY(height: number): number {
  return Math.round(height * HORIZON_RATIO);
}

export function laneY(height: number, t: number): number {
  const hy = horizonY(height);
  return hy + (height - hy) * t;
}

export function laneScale(t: number): number {
  return 0.5 + 0.5 * t;
}

// Distance from the bottom of the scene to a lane's floor line.
export function laneBottom(height: number, t: number): number {
  return height - laneY(height, t);
}
