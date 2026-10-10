/** Normalize a destination without decoding its own query string a second time. */
export function normalizeDestination(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  let target = value.trim();

  // Some interstitials encode the entire destination more than once.
  for (let i = 0; i < 3 && /^https?%(?:25)*3a/i.test(target); i++) {
    try {
      target = decodeURIComponent(target);
    } catch {
      return null;
    }
  }

  if (target.startsWith('//')) target = `https:${target}`;
  const hostWithPort = /^(?:localhost|(?:[a-z\d-]+\.)+[a-z\d-]+):\d+(?:[/?#]|$)/i.test(target);
  if (!/^[a-z][a-z\d+.-]*:/i.test(target) || hostWithPort) target = `https://${target}`;

  try {
    const url = new URL(target);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname ? target : null;
  } catch {
    return null;
  }
}

/** URLSearchParams performs the outer query decoding; preserve the destination's encoding. */
export function getDestination(url, parameter, { base64 = false, decodeBase64 = atob } = {}) {
  let target = url.searchParams.get(parameter);
  if (!target) return null;
  if (base64) {
    try {
      target = decodeBase64(target);
    } catch {
      return null;
    }
  }
  return normalizeDestination(target);
}

/** Split adjacent links found in article text, trimming separators between them. */
export function splitMultiURLs(text) {
  if (!/^https?:/.test(text)) return [];
  return (text.match(/https?:.*?(?=https?:|$)/g) ?? [])
    .map((url) => url.replace(/[@:%_+~#?&=,$^*]+$/, ''))
    .filter(Boolean);
}
