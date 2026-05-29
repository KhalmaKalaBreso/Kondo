const PREFIX = "kondo:";

export function saveStorage(key, value) {
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
}

export function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(`${PREFIX}${key}`);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function removeStorage(key) {
  localStorage.removeItem(`${PREFIX}${key}`);
}
