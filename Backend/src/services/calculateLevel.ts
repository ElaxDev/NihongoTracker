export function calculateLevel(xp: number) {
  const xpVar = 0.07; // This variable controls the amount of xp required per level
  const xpDiff = 1.75; // This variable controls how fast the difference between levels grow

  return Math.floor(Math.pow(xp, 1 / xpDiff) * xpVar);
}
