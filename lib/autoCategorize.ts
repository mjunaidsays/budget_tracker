import { Category, CategoryCorrectionRule, TransactionType } from './types';

const STOPWORDS = new Set([
  'the', 'and', 'for', 'from', 'with', 'this', 'that', 'was', 'were',
  'purchase', 'payment', 'transaction', 'store', 'shop', 'inc', 'llc',
]);

/** Lowercase, strip punctuation/digits, split, drop stopwords/short tokens, dedupe. */
export function extractKeywords(description: string): string[] {
  const tokens = description
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
  return Array.from(new Set(tokens));
}

/**
 * Deterministic keyword match against the user's own accumulated correction
 * rules, ranked by confirmation count. No AI/ML — pure substring/token lookup.
 * Returns null when there's no match yet (first-time users, unseen merchants).
 */
export function suggestCategory(
  description: string,
  rules: CategoryCorrectionRule[],
  type: TransactionType
): { category: Category; confidence: number } | null {
  const tokens = extractKeywords(description);
  if (tokens.length === 0) return null;

  const candidates = rules.filter(r => r.type === type && tokens.includes(r.keyword));
  if (candidates.length === 0) return null;

  const best = [...candidates].sort((a, b) => b.hits - a.hits)[0];
  return { category: best.category, confidence: Math.min(best.hits / 5, 1) };
}
