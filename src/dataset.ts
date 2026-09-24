import { readFile } from 'node:fs/promises';
import { QUESTIONS } from './judgments.ts';
import type { Gold, Scenario } from './types.ts';

export async function loadDataset() {
  const read = async (name: string) => JSON.parse(await readFile(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
  const cases: Scenario[] = await read('cases');
  const variants: Scenario[] = await read('variants');
  const gold: Record<string, Gold> = await read('gold');
  if (cases.length !== 20) throw new Error('Expected exactly 20 base cases');
  const ids = new Set<string>();
  for (const s of [...cases, ...variants]) {
    if (ids.has(s.id)) throw new Error(`Duplicate case ${s.id}`);
    ids.add(s.id);
    const g = gold[s.baseId];
    if (!g || !['CLEAR', 'QUESTION', 'INSPECT', 'DENY'].includes(g.correctAction)) throw new Error(`Missing gold for ${s.id}`);
    if (!s.observable?.interview?.question || !s.observable?.interview?.answer || !s.observable?.profile?.type) throw new Error(`Invalid observable ${s.id}`);
    if (!g.rationaleJa || !g.evidenceRefs.length || Object.keys(g.expected).sort().join() !== Object.keys(QUESTIONS).sort().join()) throw new Error(`Incomplete gold ${s.id}`);
    for (const [id, q] of Object.entries(QUESTIONS)) {
      const e = g.expected[id];
      if (q.type === 'noul' && typeof e !== 'boolean') throw new Error(`Invalid gold boolean ${s.id}/${id}`);
      if (q.type === 'choice' && !Object.keys(q.criteria!).includes(String(e))) throw new Error(`Invalid gold choice ${s.id}/${id}`);
      if (q.type === 'score' && (!Number.isInteger(e) || Number(e) < 0 || Number(e) >= (q.criteria as string[]).length)) throw new Error(`Invalid gold score ${s.id}/${id}`);
    }
  }
  for (const s of cases) if (s.variant !== 'base' || s.id !== s.baseId) throw new Error(`Invalid base ${s.id}`);
  for (const s of variants) if (!cases.some(b => b.id === s.baseId) || s.variant === 'base') throw new Error(`Invalid variant ${s.id}`);
  const counts = Object.fromEntries(['CLEAR', 'QUESTION', 'INSPECT', 'DENY'].map(a => [a, cases.filter(s => gold[s.id].correctAction === a).length]));
  if (Object.values(counts).some(n => n !== 5)) throw new Error('Base classes must have five cases each');
  return { cases, variants, gold, counts };
}

// Order variant changes byte order, not evidence content. Arrays retain semantic order.
export function reverseKeys(value: any): any {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).reverse().map(([k, v]) => [k, reverseKeys(v)]));
  return value;
}
