// Web replacement for expo-secure-store. Same async-shaped API as the mobile
// app's secureStorage so every consumer (authStore, zustand persist middlewares)
// is a zero-call-site-change swap. localStorage is not XSS-proof the way
// SecureStore is — acceptable for parity now, flagged as a known fidelity gap.
export async function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore — non-fatal, token will simply need to be re-issued next launch
  }
}

export async function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function getJSON(key) {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setJSON(key, value) {
  await setItem(key, JSON.stringify(value));
}
