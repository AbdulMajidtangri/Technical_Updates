/**
 * Safe JSON fetch for client components — never throws, never logs.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<{ ok: boolean, status: number, data: unknown | null }>}
 */
export async function fetchJsonSafe(url, options) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();

    if (!text) {
      return { ok: response.ok, status: response.status, data: null };
    }

    try {
      return { ok: response.ok, status: response.status, data: JSON.parse(text) };
    } catch {
      return { ok: false, status: response.status, data: null };
    }
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export default fetchJsonSafe;
