import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadDataset, reverseKeys } from '../src/dataset.ts';
import { buildState, decide, QUESTIONS, validateAnswers } from '../src/judgments.ts';
import { buildRequest, config, estimateCost, invoke, parseAnswers } from '../src/providers.ts';
import { fixtureAnswers, fixtureFetch, run, readRecords } from '../src/runner.ts';
import { consistency, summarize } from '../src/report.ts';
import type { Answers } from '../src/types.ts';

test('20 balanced bases, three variant families and shared truth; species never determines labels', async () => {
  const d = await loadDataset();
  assert.deepEqual(d.counts, { CLEAR: 5, QUESTION: 5, INSPECT: 5, DENY: 5 });
  assert.equal(d.variants.length, 12);
  assert.equal(new Set(d.variants.map(v => v.baseId)).size, 3);
  for (const action of Object.keys(d.counts)) assert.equal(new Set(d.cases.filter(s => d.gold[s.id].correctAction === action).map(s => s.observable.profile.type)).size, 3);
  for (const v of d.variants.filter(v => v.variant === 'species-swap')) {
    const base = structuredClone(d.cases.find(s => s.id === v.baseId)!);
    assert.notEqual(base.observable.profile.type, v.observable.profile.type);
    base.observable.profile.type = v.observable.profile.type;
    assert.deepEqual(base.observable, v.observable);
  }
});

test('gold, metadata, ids and rationales cannot reach either provider', async () => {
  const d = await loadDataset();
  const polluted = { ...d.cases[0], groundTruth: { correctAction: 'SECRET_GOLD_MARKER' }, difficulty: 'SECRET_DIFFICULTY' };
  const state = buildState(polluted);
  for (const provider of ['jev', 'llm'] as const) {
    const text = JSON.stringify(buildRequest(provider, 'test-model', state));
    assert.ok(!text.includes('SECRET_'));
    assert.ok(!text.includes(d.gold[polluted.id].rationaleJa));
    assert.ok(!text.includes(polluted.id));
  }
  const j: any = buildRequest('jev', 'test', state);
  const l: any = buildRequest('llm', 'test', state);
  assert.deepEqual(JSON.parse(l.messages[1].content), { state: j.state, questions: j.questions });
  const ordered = reverseKeys(state);
  assert.deepEqual(state, ordered);
  assert.notEqual(JSON.stringify(state), JSON.stringify(ordered));
});

test('human-review proposed atomic labels and action rules are compatible for all 20 cases', async () => {
  const { gold } = await loadDataset();
  for (const [caseId, g] of Object.entries(gold)) {
    const a = fixtureAnswers('jev');
    for (const [id, expected] of Object.entries(g.expected)) {
      if (QUESTIONS[id].type === 'noul') a[id].noul = expected ? 1 : 0;
      else if (QUESTIONS[id].type === 'choice') {
        a[id].choice = String(expected);
        a[id].probabilities = Object.fromEntries(Object.keys(a[id].probabilities!).map(k => [k, Number(k === expected)]));
      } else {
        a[id].score = Number(expected);
        a[id].probabilities = Object.fromEntries(Object.keys(a[id].probabilities!).map(k => [k, Number(Number(k) === expected)]));
      }
    }
    assert.equal(decide(a).action, g.correctAction, caseId);
  }
});

test('policy boundaries: uncertainty is not denial; physical concern outranks incomplete answer', () => {
  const a = fixtureAnswers('jev');
  a.prohibited_shutdown.noul = 0.84;
  assert.equal(decide(a).action, 'QUESTION');
  a.physical_concern.noul = 0.65;
  assert.equal(decide(a).action, 'INSPECT');
  a.prohibited_shutdown.noul = 0.85;
  assert.equal(decide(a).action, 'DENY');
  const b = fixtureAnswers('jev');
  b.material_contradiction.noul = 0.9; b.explanation_supported.noul = 0.8;
  assert.equal(decide(b).action, 'CLEAR');
  b.explanation_supported.noul = 0.79;
  assert.equal(decide(b).action, 'QUESTION');
});

test('invalid distributions, truncated output and refusals do not produce actions', () => {
  const a = fixtureAnswers('jev'); a.prohibited_shutdown.noul = NaN;
  assert.throws(() => validateAnswers(a, 'jev'));
  const b = fixtureAnswers('jev'); b.answer_completeness.probabilities!.partial = 0.9;
  assert.throws(() => validateAnswers(b, 'jev'));
  const c = fixtureAnswers('jev'); delete c.anomaly_severity.confidence;
  assert.throws(() => validateAnswers(c, 'jev'));
  assert.throws(() => parseAnswers('llm', { choices: [{ finish_reason: 'length', message: { content: '{}' } }] }));
  assert.throws(() => parseAnswers('llm', { choices: [{ finish_reason: 'stop', message: { refusal: 'refused' } }] }));
  assert.equal(fixtureAnswers('llm').answer_completeness.confidence, undefined);
});

test('cost separates ordinary, cached, cache-write and output tokens', () => {
  assert.equal(estimateCost({ inputTokens: 1000, cachedInputTokens: 300, cacheWriteTokens: 200, outputTokens: 100, reasoningTokens: 50 }, { input: 0.4, cachedInput: 0.1, cacheWrite: 0.5, output: 1.6 }), 0.00049);
  assert.equal(estimateCost({ inputTokens: 1000, cachedInputTokens: 0, cacheWriteTokens: 0, outputTokens: 1000, reasoningTokens: 0 }, { input: 0.042, cachedInput: 0, cacheWrite: 0, output: 0 }), 0.000042);
});

test('default LLM is GPT-5.6 Luna at medium effort with current pricing', () => {
  const names = ['LLM_MODEL', 'LLM_REASONING_EFFORT', 'LLM_INPUT_USD_PER_MILLION', 'LLM_CACHED_INPUT_USD_PER_MILLION', 'LLM_CACHE_WRITE_USD_PER_MILLION', 'LLM_OUTPUT_USD_PER_MILLION'];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    const c = config('llm');
    assert.equal(c.model, 'gpt-5.6-luna');
    assert.equal(c.reasoningEffort, 'medium');
    assert.deepEqual(c.price, { input: 0.20, cachedInput: 0.02, cacheWrite: 0.25, output: 1.20 });
    const request: any = buildRequest('llm', c.model, { test: true }, c.reasoningEffort);
    assert.equal(request.reasoning_effort, 'medium');
    assert.equal(request.temperature, undefined);
    assert.equal(request.messages[0].role, 'developer');
  } finally {
    for (const name of names) saved[name] === undefined ? delete process.env[name] : process.env[name] = saved[name]!;
  }
});

test('LLM model, effort and pricing remain configurable', () => {
  const values = { LLM_MODEL: 'future-model', LLM_REASONING_EFFORT: 'high', LLM_INPUT_USD_PER_MILLION: '2', LLM_CACHED_INPUT_USD_PER_MILLION: '0.2', LLM_CACHE_WRITE_USD_PER_MILLION: '2.5', LLM_OUTPUT_USD_PER_MILLION: '12' };
  const saved = Object.fromEntries(Object.keys(values).map(name => [name, process.env[name]]));
  try {
    Object.assign(process.env, values);
    const c = config('llm');
    assert.equal(c.model, 'future-model');
    assert.equal(c.reasoningEffort, 'high');
    assert.deepEqual(c.price, { input: 2, cachedInput: 0.2, cacheWrite: 2.5, output: 12 });
  } finally {
    for (const name of Object.keys(values)) saved[name] === undefined ? delete process.env[name] : process.env[name] = saved[name]!;
  }
});

test('HTTP 429 retries are retained with raw bodies and incomplete billing flagged', async () => {
  let calls = 0;
  const c = { ...config('jev'), key: 'test-key' };
  const f = (async () => ++calls === 1 ? new Response('{"error":"rate limited"}', { status: 429, headers: { 'retry-after': '0' } }) : fixtureFetch('jev')('https://unused.invalid')) as typeof fetch;
  const result = await invoke(c, {}, f);
  assert.equal(result.attempts.length, 2);
  assert.equal(result.attempts[0].rawText, '{"error":"rate limited"}');
  assert.equal(result.error, null);
  assert.ok(result.answers);
  assert.equal(result.costComplete, false);
  assert.ok(result.latencyMs >= result.attempts[0].latencyMs);
});

test('network ambiguity and invalid JSON are saved without a fake action or silent retry', async () => {
  let calls = 0;
  const fail = (async () => { calls++; throw new Error('connection lost'); }) as typeof fetch;
  const r = await invoke(config('jev'), {}, fail);
  assert.equal(calls, 1); assert.equal(r.answers, null); assert.equal(r.estimatedCostUsd, null);
  const bad = await invoke(config('jev'), {}, (async () => new Response('not json', { status: 200 })) as typeof fetch);
  assert.equal(bad.answers, null); assert.equal(bad.attempts[0].rawText, 'not json');
});

test('full offline integration persists 64 records and 24 variant comparisons without using gold to predict', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mars-gate-test-'));
  try {
    const r = await run({ suite: 'all', providers: ['jev', 'llm'], offline: true, outputRoot: dir });
    const saved = await readRecords(r.directory);
    assert.equal(saved.length, 64);
    assert.equal(consistency(saved).length, 24);
    assert.deepEqual(summarize(saved).map(s => [s.attempted, s.correct, s.errors]), [[20, 5, 0], [20, 5, 0]]);
    assert.ok(saved.every(s => s.mode === 'offline-fixture' && s.attempts[0].rawText));
    for (const s of saved) assert.deepEqual(s.answers, fixtureAnswers(s.provider));
    for (const s of saved.filter(s => s.provider === 'jev')) assert.equal(s.stateHash, saved.find(x => x.caseId === s.caseId && x.provider === 'llm')!.stateHash);
    const manifest = JSON.parse(await readFile(join(r.directory, 'manifest.json'), 'utf8'));
    assert.equal(manifest.complete, true);
    assert.ok(manifest.providers.every((p: any) => !('key' in p)));
    const llm = manifest.providers.find((p: any) => p.provider === 'llm');
    assert.equal(llm.requestedModel, 'gpt-5.6-luna');
    assert.equal(llm.resolvedModel, 'OFFLINE-FIXTURE-NOT-LLM');
    assert.deepEqual(llm.resolvedModels, ['OFFLINE-FIXTURE-NOT-LLM']);
    assert.equal(llm.reasoningEffort, 'medium');
    assert.deepEqual({ input: llm.pricingAssumptions.input, cachedInput: llm.pricingAssumptions.cachedInput, cacheWrite: llm.pricingAssumptions.cacheWrite, output: llm.pricingAssumptions.output }, { input: 0.2, cachedInput: 0.02, cacheWrite: 0.25, output: 1.2 });
    const summaries = summarize(saved);
    assert.ok(summaries.every(s => s.atomicTotalAllAttempts === 160));
    assert.ok(summaries.every(s => Object.keys(s.atomicByJudgment).length === 8));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
