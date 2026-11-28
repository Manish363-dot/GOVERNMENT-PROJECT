/**
 * Normalizes Devanagari digits (०-९) to standard ASCII digits (0-9) so numbers stay in 123 format.
 */
export function normalizeDigitsToAscii(text: string): string {
  if (!text || typeof text !== 'string') return text || '';
  return text.replace(/[\u0966-\u096F]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x0966 + 48));
}

/**
 * Transliterates English text phonetically into Devanagari (Hindi) script.
 * Preserves ASCII digits (0-9 / 123 format) and uses Google Input Tools API with offline fallback.
 */
export async function transliterateToHindi(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = normalizeDigitsToAscii(text).trim();

  // If text already has no English alphabet letters, return with ASCII digits intact
  if (!/[a-zA-Z]/.test(trimmed)) {
    return trimmed;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(trimmed)}&itc=hi-t-i0-und&num=1`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return trimmed;
    const data = (await res.json()) as any;

    if (data && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
      const converted = data[1]
        .map((item: any) => ((item[1] && item[1][0]) ? item[1][0] : item[0]))
        .join('');
      return normalizeDigitsToAscii(converted || trimmed);
    }
  } catch (err) {
    // Graceful fallback to original text if offline or connection fails
    return trimmed;
  }

  return trimmed;
}
