export function getStoredNumber(key: string, fallback = 0): number {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function setStoredNumber(key: string, value: number): void {
  window.localStorage.setItem(key, String(value));
}

export function getStoredBoolean(key: string, fallback = false): boolean {
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
}

export function setStoredBoolean(key: string, value: boolean): void {
  window.localStorage.setItem(key, String(value));
}
