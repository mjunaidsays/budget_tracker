'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category, CategoryCorrectionRule, TransactionType } from '@/lib/types';
import { suggestCategory, extractKeywords } from '@/lib/autoCategorize';

function toRule(row: Record<string, unknown>): CategoryCorrectionRule {
  return {
    id:         row.id as string,
    keyword:    row.keyword as string,
    category:   row.category as Category,
    type:       row.type as TransactionType,
    hits:       Number(row.hits),
    lastUsedAt: row.last_used_at as string,
  };
}

/** Local, deterministic learning store: no AI, just keyword -> category hit counts. */
export function useCategoryRules() {
  const [rules,     setRules]     = useState<CategoryCorrectionRule[]>([]);
  const [isLoading,  setIsLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('category_correction_rules').select('*');
    setRules((data ?? []).map(toRule));
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const recordCorrection = useCallback(
    async (description: string, category: Category, type: TransactionType) => {
      const keywords = extractKeywords(description);
      if (keywords.length === 0) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const keyword of keywords) {
        const { data: existing } = await supabase
          .from('category_correction_rules')
          .select('id, hits, category')
          .eq('user_id', user.id)
          .eq('keyword', keyword)
          .eq('type', type)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('category_correction_rules')
            .update({
              category,
              hits: existing.category === category ? Number(existing.hits) + 1 : 1,
              last_used_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('category_correction_rules').insert({
            user_id: user.id,
            keyword,
            category,
            type,
            hits: 1,
          });
        }
      }

      await fetchRules();
    },
    [fetchRules]
  );

  const suggest = useCallback(
    (description: string, type: TransactionType) => suggestCategory(description, rules, type),
    [rules]
  );

  return { rules, isLoading, fetchRules, recordCorrection, suggest };
}
