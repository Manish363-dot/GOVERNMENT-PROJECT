import { api } from '@/services/api';

/**
 * Converts Devanagari numerals (०-९) to standard ASCII digits (0-9) so numbers stay in 123 format.
 */
export function toAsciiDigits(value?: string | null): string {
  if (!value) return '';
  return value.replace(/[\u0966-\u096F]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x0966 + 48)
  );
}

/**
 * Explicit click-only English-to-Hindi transliteration for filter/form inputs.
 * Preserves numeric values in 123 (ASCII) format.
 */
export async function transliterateToHindiManual(value: string): Promise<string> {
  const trimmed = (value || '').trim();
  if (!trimmed) return value;

  try {
    const res = await api.post<{ success: boolean; hindi: string }>('/rental/transliterate', {
      text: trimmed,
    });
    if (res && res.hindi && res.hindi.trim()) {
      return toAsciiDigits(res.hindi.trim());
    }
  } catch (err) {
    console.warn('Transliteration failed', err);
  }

  return toAsciiDigits(value);
}

/**
 * Normalizes and translates built-in admin display titles across Hindi & English,
 * stripping redundant "(जिला पंचायत अल्मोड़ा)" / "(Zila Panchayat Almora)" suffixes.
 */
export function formatAdminDisplayName(
  rawName: string | undefined | null,
  isHi: boolean,
  isSubAdmin = false
): string {
  const cleaned = (rawName || '')
    .replace(/\s*\((?:जिला\s+पंचायत\s+अल्मोड़ा|ज़िला\s+पंचायत\s+अल्मोड़ा|Zila\s+Panchayat\s+Almora)\)\s*/gi, '')
    .trim();

  const lower = cleaned.toLowerCase();
  if (
    !cleaned ||
    cleaned === 'मुख्य प्रशासनिक अधिकारी' ||
    cleaned === 'मुख्य प्रशासक' ||
    lower === 'super administrator' ||
    lower === 'chief administrative officer'
  ) {
    return isSubAdmin
      ? isHi
        ? 'उप-प्रशासक'
        : 'Sub Administrator'
      : isHi
        ? 'मुख्य प्रशासनिक अधिकारी'
        : 'Chief Administrative Officer';
  }

  if (cleaned === 'उप-प्रशासक' || lower === 'sub administrator' || lower === 'sub admin') {
    return isHi ? 'उप-प्रशासक' : 'Sub Administrator';
  }

  return toAsciiDigits(cleaned);
}
