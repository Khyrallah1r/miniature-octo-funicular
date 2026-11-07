const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Converts any number of western digits into Arabic-Indic digits. */
export function arNum(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u06DF\u06E0-\u06E8\u06EA-\u06ED]/;

/** Folds Arabic orthography so search ignores diacritics and letter variants. */
function foldChar(ch: string): string {
  switch (ch) {
    case 'أ':
    case 'إ':
    case 'آ':
    case 'ٱ':
      return 'ا';
    case 'ى':
      return 'ي';
    case 'ة':
      return 'ه';
    case 'ؤ':
      return 'و';
    case 'ئ':
      return 'ي';
    default:
      return ch;
  }
}

export function normalizeArabic(text: string): string {
  let out = '';
  for (const ch of text) {
    if (MARKS.test(ch)) continue;
    out += foldChar(ch);
  }
  return out.replace(/\s+/g, ' ').trim().toLowerCase();
}

export type FoldedText = {
  folded: string;
  /** For each folded character, its index inside the original string. */
  map: number[];
};

export function foldWithMap(text: string): FoldedText {
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (MARKS.test(ch)) continue;
    const next = foldChar(ch);
    for (const piece of next) {
      folded += piece;
      map.push(i);
    }
  }
  return { folded, map };
}

export type MatchRange = { start: number; end: number };

/** Finds every occurrence of `query` inside `text`, returning original indices. */
export function findMatches(text: string, query: string): MatchRange[] {
  const needle = normalizeArabic(query);
  if (needle.length < 2) return [];
  const { folded, map } = foldWithMap(text);
  const haystack = folded.toLowerCase();
  const ranges: MatchRange[] = [];
  let from = 0;
  while (from <= haystack.length - needle.length) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) break;
    const start = map[at];
    const end = map[at + needle.length - 1] + 1;
    ranges.push({ start, end });
    from = at + needle.length;
    if (ranges.length >= 40) break;
  }
  return ranges;
}

export function matches(text: string, query: string): boolean {
  const needle = normalizeArabic(query);
  if (!needle) return true;
  return normalizeArabic(text).includes(needle);
}

/** Short excerpt around the first match, for search results. */
export function excerpt(text: string, query: string, max = 130): string {
  const range = findMatches(text, query)[0];
  if (!range) return text.slice(0, max);
  const from = Math.max(0, range.start - 40);
  const to = Math.min(text.length, from + max);
  return `${from > 0 ? '…' : ''}${text.slice(from, to)}${to < text.length ? '…' : ''}`;
}
