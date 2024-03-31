export function calculateLevel(level: number) {
  const xpVar = 0.07; // This variable controls the amount of xp required per level
  const xpDiff = 1.75; // This variable controls how fast the difference between levels grow

  return Math.floor(Math.pow(level / xpVar, xpDiff));
}
