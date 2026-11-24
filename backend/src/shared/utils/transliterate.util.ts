/**
 * Transliterates English text phonetically into Devanagari (Hindi) script
 * Uses Google Input Tools API with instant fallback for offline/errors.
 */
export async function transliterateToHindi(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = text.trim();

  // If text already has no English alphabet letters, return as is
  if (!/[a-zA-Z]/.test(trimmed)) {
    return text;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(trimmed)}&itc=hi-t-i0-und&num=1`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return text;
    const data = (await res.json()) as any;

    if (data && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
      const converted = data[1]
        .map((item: any) => ((item[1] && item[1][0]) ? item[1][0] : item[0]))
        .join('');
      return converted || text;
    }
  } catch (err) {
    // Graceful fallback to original text if offline or connection fails
    return text;
  }

  return text;
}
