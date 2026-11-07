import raw from '@/data/hisn.json';

import { matches } from '@/lib/arabic';

export type Category = {
  id: number;
  title: string;
  shortTitle: string;
  featured: boolean;
};

export type Zekr = {
  id: number;
  categoryId: number;
  text: string;
  plainText: string;
  source: string;
  repeat: number;
};

const data = raw as unknown as { categories: Category[]; adhkar: Zekr[] };

export const categories: Category[] = data.categories;
export const adhkar: Zekr[] = data.adhkar;

export const categoriesById = new Map<number, Category>(categories.map((c) => [c.id, c]));
export const adhkarById = new Map<number, Zekr>(adhkar.map((z) => [z.id, z]));

const byCategory = new Map<number, Zekr[]>();
for (const zekr of adhkar) {
  const list = byCategory.get(zekr.categoryId);
  if (list) list.push(zekr);
  else byCategory.set(zekr.categoryId, [zekr]);
}

export function getCategoryZekr(categoryId: number): Zekr[] {
  return byCategory.get(categoryId) ?? [];
}

export function getCategory(categoryId: number): Category | undefined {
  return categoriesById.get(categoryId);
}

/** Position of a zekr inside its chapter (0-based) plus the chapter list. */
export function getZekrPosition(zekr: Zekr): { index: number; list: Zekr[] } {
  const list = getCategoryZekr(zekr.categoryId);
  return { index: list.findIndex((item) => item.id === zekr.id), list };
}

/** First zekr of the next chapter that has content, for auto-advance at chapter end. */
export function getNextChapterFirstZekr(categoryId: number): Zekr | undefined {
  const start = categories.findIndex((category) => category.id === categoryId);
  if (start === -1) return undefined;
  for (let index = start + 1; index < categories.length; index += 1) {
    const list = getCategoryZekr(categories[index].id);
    if (list.length > 0) return list[0];
  }
  return undefined;
}

/** Quick access chapters shown on the home screen. */
export const QUICK_CATEGORY_IDS = [27, 28, 29, 1] as const;

export const TOTAL_ZEKR = adhkar.length;
export const TOTAL_CATEGORIES = categories.length;

export function chapterProgress(
  categoryId: number,
  progress: Record<string, number>
): { done: number; total: number } {
  const list = getCategoryZekr(categoryId);
  const done = list.filter((zekr) => (progress[String(zekr.id)] ?? 0) >= zekr.repeat).length;
  return { done, total: list.length };
}

export type SearchResult =
  | { kind: 'category'; category: Category }
  | { kind: 'zekr'; zekr: Zekr };

export function searchAll(query: string, limit = 80): SearchResult[] {
  const needle = query.trim();
  if (needle.length < 2) return [];

  const results: SearchResult[] = [];

  for (const category of categories) {
    if (matches(`${category.title} ${category.shortTitle}`, needle)) {
      results.push({ kind: 'category', category });
    }
  }
  for (const zekr of adhkar) {
    if (results.length >= limit) break;
    if (matches(zekr.plainText, needle)) {
      results.push({ kind: 'zekr', zekr });
    }
  }
  return results.slice(0, limit);
}
