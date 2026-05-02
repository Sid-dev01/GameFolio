export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function deviceMemory(): number {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return nav.deviceMemory ?? 8;
}
