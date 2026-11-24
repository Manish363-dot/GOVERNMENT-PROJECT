/**
 * Utility to convert numerical Indian currency amounts into Hindi words
 * e.g., 1800 -> "एक हजार आठ सौ रुपये मात्र"
 */

const ONES_HINDI = [
  '', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
  'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
  'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस',
  'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस', 'चालीस',
  'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास', 'पचास',
  'इक्यावन', 'बावन', 'तिरेपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ', 'साठ',
  'इकसठ', 'बासठ', 'तिरेसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सड़सठ', 'अड़सठ', 'उनहत्तर', 'सत्तर',
  'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उनासी', 'अस्सी',
  'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी', 'नब्बे',
  'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पंचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'
];

export function amountToHindiWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) {
    return 'शून्य रुपये मात्र';
  }

  const rounded = Math.round(num);
  let n = rounded;
  let words = '';

  // Crores (करोड़)
  const crore = Math.floor(n / 10000000);
  if (crore > 0) {
    words += `${convertTwoDigits(crore)} करोड़ `;
    n %= 10000000;
  }

  // Lakhs (लाख)
  const lakh = Math.floor(n / 100000);
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} लाख `;
    n %= 100000;
  }

  // Thousands (हजार)
  const thousand = Math.floor(n / 1000);
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} हजार `;
    n %= 1000;
  }

  // Hundreds (सौ)
  const hundred = Math.floor(n / 100);
  if (hundred > 0) {
    words += `${ONES_HINDI[hundred]} सौ `;
    n %= 100;
  }

  // Remaining 1-99
  if (n > 0) {
    words += `${ONES_HINDI[n]} `;
  }

  return `${words.trim()} रुपये मात्र`;
}

function convertTwoDigits(val: number): string {
  if (val <= 0) return '';
  if (val < 100) return ONES_HINDI[val] || '';
  const h = Math.floor(val / 100);
  const rem = val % 100;
  return `${ONES_HINDI[h]} सौ ${ONES_HINDI[rem] || ''}`.trim();
}

