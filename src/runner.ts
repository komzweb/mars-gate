import { createHash } from 'node:crypto';
import { mkdir, writeFile, appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildState, decide, QUESTIONS, POLICY, POLICY_VERSION, THRESHOLDS } from './judgments.ts';
import { reverseKeys, loadDataset } from './dataset.ts';
import { buildRequest, config, estimateCost, invoke, normalizeUsage } from './providers.ts';
import { consistency, consistencyByVariantType, repeatability, summarize } from './report.ts';
import type { Answers, Provider, RunRecord, Scenario, Usage } from './types.ts';

export const hash = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex');
export type RunOptions = { suite: 'base' | 'all' | 'consistency'; providers: Provider[]; offline: boolean; limit?: number; outputRoot?: string; onRecord?: (r: RunRecord) => void };
export type RepeatabilityOptions = { caseId: string; repeats: number; providers: Provider[]; offline: boolean; outputRoot?: string; onRecord?: (r: RunRecord) => void };

function matchGold(answers: Answers, expected: Record<string, boolean | string | number>) {
  return Object.fromEntries(Object.entries(expected).map(([id, expectedValue]) => {
    const a = answers[id];
    const actual = a.type === 'noul' ? a.noul! >= 0.5 : a.type === 'choice' ? a.choice : Number(Object.entries(a.probabilities!).sort((x, y) => y[1] - x[1])[0][0]);
    return [id, actual === expectedValue];
  }));
}

// This fixed response deliberately ignores both input and gold. Never a model simulation.
export function fixtureAnswers(provider: Provider): Answers {
  const a: Answers = Object.fromEntries(Object.entries(QUESTIONS).filter(([, q]) => q.type === 'noul').map(([id]) => [id, { type: 'noul', noul: 0.1 }]));
  a.answer_completeness = { type: 'choice', choice: 'complete', probabilities: { complete: 1, partial: 0, evasive: 0 } };
  a.anomaly_severity = { type: 'score', score: 0, probabilities: { '0': 1, '1': 0, '2': 0 } };
  if (provider === 'jev') {
    a.answer_completeness.confidence = 1;
    a.anomaly_severity.confidence = 1;
    a.anomaly_severity.legend = { '0': 'no harmful effect established', '1': 'non-dangerous interference', '2': 'dangerous capability established' };
  }
  return a;
}

export function fixtureFetch(provider: Provider): typeof fetch {
  return (async () => new Response(JSON.stringify(provider === 'jev'
    ? { model: 'OFFLINE-FIXTURE-NOT-JEV', answers: fixtureAnswers(provider), usage: { input_tokens: 100, output_tokens: 20 } }
    : { model: 'OFFLINE-FIXTURE-NOT-LLM', choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(fixtureAnswers(provider)) } }], usage: { prompt_tokens: 100, completion_tokens: 20, prompt_tokens_details: { cached_tokens: 0 } } }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
}

export async function run(options: RunOptions) {
  const data = await loadDataset();
  let selected: Scenario[];
  if (options.suite === 'consistency') selected = [...data.cases.filter(s => data.variants.some(v => v.baseId === s.id)), ...data.variants];
  else selected = options.suite === 'all' ? [...data.cases, ...data.variants] : data.cases;
  if (options.limit) selected = selected.slice(0, options.limit);
  const configs = options.providers.map(config);
  if (!options.offline) for (const c of configs) if (!c.key) throw new Error(`Missing ${c.provider === 'jev' ? 'TYPESAFE_API_KEY' : 'OPENAI_API_KEY'}. Set locally in .env. No requests made.`);
  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${options.offline ? 'offline-fixture' : 'live'}-${createHash('sha256').update(String(Math.random())).digest('hex').slice(0, 6)}`;
  const directory = join(options.outputRoot || 'results', runId);
  await mkdir(directory, { recursive: true });
  const manifest = {
    schemaVersion: 1, runId, mode: options.offline ? 'offline-fixture' : 'live', startedAt: new Date().toISOString(), nodeVersion: process.version,
    suite: options.suite, caseIds: selected.map(s => s.id), policyVersion: POLICY_VERSION, policy: POLICY, questions: QUESTIONS, thresholds: THRESHOLDS,
    datasetHash: hash({ selected, gold: data.gold }), judgmentHash: hash({ QUESTIONS, POLICY, THRESHOLDS }),
    providers: configs.map(c => ({ provider: c.provider, requestedModel: c.model, resolvedModel: null, resolvedModels: [], reasoningEffort: c.reasoningEffort, pricingAssumptions: c.pricingAssumptions })),
    execution: 'sequential cases; provider order alternates per case; no application cache; max two HTTP attempts; no retry after ambiguous network failure',
    probabilitySemantics: 'Jev Noul is P(yes); Choice/Score confidence is stored only for Jev. LLM probabilities are generated self estimates. No final action probability is inferred.',
    pricingCheckedAt: '2026-09-22', goldStatus: 'author-proposed, pending independent human review', complete: false,
  };
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(join(directory, 'dataset-snapshot.json'), JSON.stringify({ cases: selected, gold: data.gold }, null, 2));
  const records: RunRecord[] = [];
  let stopForAuth = false;
  for (let index = 0; index < selected.length && !stopForAuth; index++) {
    const s = selected[index];
    const state = s.variant === 'information-order' ? reverseKeys(buildState(s)) : buildState(s);
    const ordered = index % 2 ? [...configs].reverse() : configs;
    for (const c of ordered) {
      const request = buildRequest(c.provider, c.model, state, c.reasoningEffort);
      const startedAt = new Date().toISOString();
      const response = await invoke(c, request, options.offline ? fixtureFetch(c.provider) : fetch);
      const g = data.gold[s.baseId];
      const decision = response.answers ? decide(response.answers) : null;
      const atomicMatches = response.answers ? matchGold(response.answers, g.expected) : null;
      const record: RunRecord = { schemaVersion: 1, runId, mode: options.offline ? 'offline-fixture' : 'live', caseId: s.id, baseId: s.baseId, variant: s.variant, provider: c.provider, modelRequested: c.model, reasoningEffort: c.reasoningEffort,
        stateHash: hash(state), request, groundTruth: g, decision, correct: decision ? decision.action === g.correctAction : null, atomicMatches,
        status: response.answers ? 'ok' : 'error', startedAt, firstAttemptLatencyMs: response.attempts[0].latencyMs, ...response };
      records.push(record);
      await appendFile(join(directory, 'records.jsonl'), JSON.stringify(record) + '\n');
      options.onRecord?.(record);
      if (response.attempts.some(a => [401, 402, 403].includes(a.status!))) stopForAuth = true;
    }
  }
  const summary = { mode: manifest.mode, base: summarize(records), consistency: consistency(records), consistencyByVariantType: consistencyByVariantType(records), allRequests: records.length, knownCostAllRequestsUsd: records.reduce((sum, r) => sum + (r.estimatedCostUsd ?? 0), 0), costComplete: records.every(r => r.costComplete), complete: records.length === selected.length * configs.length };
  await writeFile(join(directory, 'summary.json'), JSON.stringify(summary, null, 2));
  const resolvedModels = Object.fromEntries(configs.map(c => [c.provider, [...new Set(records.filter(r => r.provider === c.provider && r.modelResolved).map(r => r.modelResolved))]]));
  const finalProviders = configs.map(c => ({ provider: c.provider, requestedModel: c.model, resolvedModel: resolvedModels[c.provider].length === 1 ? resolvedModels[c.provider][0] : null, resolvedModels: resolvedModels[c.provider], reasoningEffort: c.reasoningEffort, pricingAssumptions: c.pricingAssumptions }));
  await writeFile(join(directory, 'manifest.json'), JSON.stringify({ ...manifest, providers: finalProviders, finishedAt: new Date().toISOString(), complete: summary.complete }, null, 2));
  return { directory, records, summary };
}

export async function runRepeatability(options: RepeatabilityOptions) {
  const data = await loadDataset();
  const scenario = data.cases.find(s => s.id === options.caseId && s.variant === 'base');
  if (!scenario) throw new Error(`Unknown base case: ${options.caseId}`);
  const configs = options.providers.map(config);
  if (!options.offline) for (const c of configs) if (!c.key) throw new Error(`Missing ${c.provider === 'jev' ? 'TYPESAFE_API_KEY' : 'OPENAI_API_KEY'}. Set locally in .env. No requests made.`);
  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-repeatability-${options.offline ? 'offline-fixture' : 'live'}-${createHash('sha256').update(String(Math.random())).digest('hex').slice(0, 6)}`;
  const directory = join(options.outputRoot || 'results', runId);
  await mkdir(directory, { recursive: true });
  const state = buildState(scenario);
  const manifest = { schemaVersion: 1, runId, experiment: 'repeatability', excludedFromBaseBenchmark: true, mode: options.offline ? 'offline-fixture' : 'live', startedAt: new Date().toISOString(), nodeVersion: process.version,
    caseId: scenario.id, repeatCount: options.repeats, stateHash: hash(state), policyVersion: POLICY_VERSION, policy: POLICY, questions: QUESTIONS, thresholds: THRESHOLDS,
    datasetHash: hash({ scenario, gold: data.gold[scenario.baseId] }), judgmentHash: hash({ QUESTIONS, POLICY, THRESHOLDS }),
    providers: configs.map(c => ({ provider: c.provider, requestedModel: c.model, resolvedModel: null, resolvedModels: [], reasoningEffort: c.reasoningEffort, pricingAssumptions: c.pricingAssumptions })),
    execution: 'same serialized state and questions for every repetition; sequential repetitions; provider order alternates; max two HTTP attempts; no retry after ambiguous network failure', highProbabilityDefinition: `P(Yes) >= ${THRESHOLDS.deny} (the frozen DENY threshold)`, complete: false };
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(join(directory, 'dataset-snapshot.json'), JSON.stringify({ case: scenario, gold: data.gold[scenario.baseId] }, null, 2));
  const records: RunRecord[] = [];
  let stopForAuth = false;
  for (let repeatIndex = 1; repeatIndex <= options.repeats && !stopForAuth; repeatIndex++) {
    const ordered = repeatIndex % 2 ? configs : [...configs].reverse();
    for (const c of ordered) {
      const request = buildRequest(c.provider, c.model, state, c.reasoningEffort);
      const startedAt = new Date().toISOString();
      const response = await invoke(c, request, options.offline ? fixtureFetch(c.provider) : fetch);
      const g = data.gold[scenario.baseId];
      const decision = response.answers ? decide(response.answers) : null;
      const record: RunRecord = { schemaVersion: 1, runId, mode: options.offline ? 'offline-fixture' : 'live', repeatIndex, caseId: scenario.id, baseId: scenario.baseId, variant: 'base', provider: c.provider, modelRequested: c.model, reasoningEffort: c.reasoningEffort,
        stateHash: hash(state), request, groundTruth: g, answers: response.answers, decision, correct: decision ? decision.action === g.correctAction : null, atomicMatches: response.answers ? matchGold(response.answers, g.expected) : null,
        status: response.answers ? 'ok' : 'error', startedAt, firstAttemptLatencyMs: response.attempts[0].latencyMs, ...response };
      records.push(record);
      await appendFile(join(directory, 'records.jsonl'), JSON.stringify(record) + '\n');
      options.onRecord?.(record);
      if (response.attempts.some(a => [401, 402, 403].includes(a.status!))) stopForAuth = true;
    }
  }
  const summary = { experiment: 'repeatability', excludedFromBaseBenchmark: true, caseId: scenario.id, repeatCount: options.repeats, highProbabilityThreshold: THRESHOLDS.deny, providers: repeatability(records, THRESHOLDS.deny), crossProviderSameRepeatAgreementRate: (() => { const pairs = Array.from({ length: options.repeats }, (_, i) => records.filter(r => r.repeatIndex === i + 1 && r.status === 'ok')); const comparable = pairs.filter(p => p.length === configs.length && configs.length === 2); return comparable.length ? comparable.filter(p => p[0].decision!.action === p[1].decision!.action).length / comparable.length : null; })(), complete: records.length === options.repeats * configs.length };
  await writeFile(join(directory, 'summary.json'), JSON.stringify(summary, null, 2));
  const resolvedModels = Object.fromEntries(configs.map(c => [c.provider, [...new Set(records.filter(r => r.provider === c.provider && r.modelResolved).map(r => r.modelResolved))]]));
  const providers = configs.map(c => ({ provider: c.provider, requestedModel: c.model, resolvedModel: resolvedModels[c.provider].length === 1 ? resolvedModels[c.provider][0] : null, resolvedModels: resolvedModels[c.provider], reasoningEffort: c.reasoningEffort, pricingAssumptions: c.pricingAssumptions }));
  await writeFile(join(directory, 'manifest.json'), JSON.stringify({ ...manifest, providers, finishedAt: new Date().toISOString(), complete: summary.complete }, null, 2));
  return { directory, records, summary };
}

export async function repriceRun(sourceDirectory: string, outputRoot = 'results/derived') {
  const rawRecords = await readFile(join(sourceDirectory, 'records.jsonl'), 'utf8');
  const records = await readRecords(sourceDirectory);
  const configs = Object.fromEntries((['jev', 'llm'] as Provider[]).map(p => [p, config(p)]));
  const repriced = records.map(r => {
    const usages = r.attempts.map(a => normalizeUsage(r.provider, a.rawResponse));
    const known = usages.filter((u): u is Usage => u !== null);
    const usage = known.length ? known.reduce((sum, u) => ({ inputTokens: sum.inputTokens + u.inputTokens, cachedInputTokens: sum.cachedInputTokens + u.cachedInputTokens, cacheWriteTokens: sum.cacheWriteTokens + u.cacheWriteTokens, outputTokens: sum.outputTokens + u.outputTokens, reasoningTokens: sum.reasoningTokens + u.reasoningTokens }), { inputTokens: 0, cachedInputTokens: 0, cacheWriteTokens: 0, outputTokens: 0, reasoningTokens: 0 }) : null;
    return { caseId: r.caseId, provider: r.provider, originalEstimatedCostUsd: r.estimatedCostUsd, usageFromRawResponse: usage, correctedEstimatedCostUsd: usage ? estimateCost(usage, configs[r.provider].price) : null, costComplete: usages.every(u => u !== null) };
  });
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-base-v1-cache-write-correction`;
  const directory = join(outputRoot, id);
  await mkdir(directory, { recursive: true });
  const output = { schemaVersion: 1, correction: 'GPT-5.6 Luna cache_write_tokens priced at $0.25 per million tokens', sourceRunDirectory: sourceDirectory, sourceRecordsSha256: createHash('sha256').update(rawRecords).digest('hex'), generatedAt: new Date().toISOString(), sourceRecordsModified: false,
    pricingAssumptions: Object.fromEntries((['jev', 'llm'] as Provider[]).map(p => [p, configs[p].pricingAssumptions])), records: repriced,
    byProvider: (['jev', 'llm'] as Provider[]).map(provider => { const rows = repriced.filter(r => r.provider === provider); return { provider, recordCount: rows.length, usage: rows.reduce((sum, r) => ({ inputTokens: sum.inputTokens + (r.usageFromRawResponse?.inputTokens ?? 0), cachedInputTokens: sum.cachedInputTokens + (r.usageFromRawResponse?.cachedInputTokens ?? 0), cacheWriteTokens: sum.cacheWriteTokens + (r.usageFromRawResponse?.cacheWriteTokens ?? 0), outputTokens: sum.outputTokens + (r.usageFromRawResponse?.outputTokens ?? 0), reasoningTokens: sum.reasoningTokens + (r.usageFromRawResponse?.reasoningTokens ?? 0) }), { inputTokens: 0, cachedInputTokens: 0, cacheWriteTokens: 0, outputTokens: 0, reasoningTokens: 0 }), originalEstimatedCostUsd: rows.reduce((n, r) => n + (r.originalEstimatedCostUsd ?? 0), 0), correctedEstimatedCostUsd: rows.reduce((n, r) => n + (r.correctedEstimatedCostUsd ?? 0), 0), costComplete: rows.every(r => r.costComplete) }; }) };
  await writeFile(join(directory, 'corrected-summary.json'), JSON.stringify(output, null, 2));
  return { directory, output };
}

export async function readRecords(directory: string): Promise<RunRecord[]> {
  const raw = await readFile(join(directory, 'records.jsonl'), 'utf8');
  return raw.trim().split('\n').filter(Boolean).map((line, i) => {
    try { return JSON.parse(line); } catch { throw new Error(`Invalid JSONL record ${i + 1}; possible interrupted write`); }
  });
}
