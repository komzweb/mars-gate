import type { RunRecord } from './types.ts';

function classification(answer: any) {
  if (answer.type === 'noul') return String(answer.noul >= 0.5);
  if (answer.type === 'choice') return answer.choice;
  return String(Object.entries(answer.probabilities as Record<string, number>).sort((a, b) => b[1] - a[1])[0][0]);
}

function numericStats(values: number[]) {
  return values.length ? { min: Math.min(...values), max: Math.max(...values), mean: values.reduce((a, b) => a + b, 0) / values.length } : { min: null, max: null, mean: null };
}

export function summarize(records: RunRecord[]) {
  return ['jev', 'llm'].map(provider => {
    const rows = records.filter(r => r.provider === provider && r.variant === 'base');
    const ok = rows.filter(r => r.status === 'ok');
    const times = ok.map(r => r.latencyMs).sort((a, b) => a - b);
    const percentile = (p: number) => times.length ? times[Math.max(0, Math.ceil(times.length * p) - 1)] : null;
    const costs = rows.filter(r => r.estimatedCostUsd !== null);
    const judgmentIds = [...new Set(rows.flatMap(r => Object.keys(r.groundTruth.expected)))];
    const atomicByJudgment = Object.fromEntries(judgmentIds.map(id => {
      const successful = ok.filter(r => r.atomicMatches && id in r.atomicMatches);
      const correct = successful.filter(r => r.atomicMatches![id]).length;
      return [id, { attempted: rows.length, successful: successful.length, correct, accuracyAllAttempts: rows.length ? correct / rows.length : null, accuracySuccessful: successful.length ? correct / successful.length : null }];
    }));
    const atomicCorrect = ok.reduce((sum, r) => sum + Object.values(r.atomicMatches ?? {}).filter(Boolean).length, 0);
    const atomicTotalAllAttempts = rows.reduce((sum, r) => sum + Object.keys(r.groundTruth.expected).length, 0);
    const atomicTotalSuccessful = ok.reduce((sum, r) => sum + Object.keys(r.atomicMatches ?? {}).length, 0);
    return { provider, attempted: rows.length, successful: ok.length, errors: rows.length - ok.length, correct: ok.filter(r => r.correct).length,
      accuracyAllAttempts: rows.length ? ok.filter(r => r.correct).length / rows.length : null,
      atomicCorrect, atomicTotalAllAttempts, atomicTotalSuccessful,
      atomicAccuracyAllAttempts: atomicTotalAllAttempts ? atomicCorrect / atomicTotalAllAttempts : null,
      atomicAccuracySuccessful: atomicTotalSuccessful ? atomicCorrect / atomicTotalSuccessful : null,
      atomicByJudgment,
      p50Ms: percentile(0.5), p95Ms: percentile(0.95), estimatedCostUsd: costs.length ? costs.reduce((n, r) => n + r.estimatedCostUsd!, 0) : null,
      costComplete: rows.length > 0 && rows.every(r => r.costComplete), inputTokens: rows.reduce((n, r) => n + (r.usage?.inputTokens ?? 0), 0), cachedInputTokens: rows.reduce((n, r) => n + (r.usage?.cachedInputTokens ?? 0), 0), cacheWriteTokens: rows.reduce((n, r) => n + (r.usage?.cacheWriteTokens ?? 0), 0), outputTokens: rows.reduce((n, r) => n + (r.usage?.outputTokens ?? 0), 0), reasoningTokens: rows.reduce((n, r) => n + (r.usage?.reasoningTokens ?? 0), 0),
    };
  });
}

export function consistency(records: RunRecord[]) {
  return records.filter(r => r.variant !== 'base').map(r => {
    const b = records.find(x => x.provider === r.provider && x.caseId === r.baseId && x.variant === 'base');
    const comparable = r.status === 'ok' && b?.status === 'ok';
    const deltas: Record<string, any> = {};
    if (comparable) for (const [id, a] of Object.entries(r.answers!)) {
      const original = b!.answers![id];
      if (a.type === 'noul') deltas[id] = { deltaPYes: a.noul! - original.noul!, thresholdFlip: (a.noul! >= 0.5) !== (original.noul! >= 0.5) };
      else deltas[id] = { probabilityL1: Object.keys(a.probabilities!).reduce((sum, k) => sum + Math.abs(a.probabilities![k] - original.probabilities![k]), 0), ...(a.type === 'choice' ? { choiceChanged: a.choice !== original.choice } : { scoreDelta: a.score! - original.score! }), ...(r.provider === 'jev' ? { confidenceDelta: a.confidence! - original.confidence! } : {}) };
    }
    return { provider: r.provider, caseId: r.caseId, baseId: r.baseId, variantType: r.variant, comparable, actionChanged: comparable ? r.decision!.action !== b!.decision!.action : null, baseAction: b?.decision?.action ?? null, variantAction: r.decision?.action ?? null, groundTruthAction: r.groundTruth.correctAction, groundTruthMaintained: comparable ? r.decision!.action === r.groundTruth.correctAction : null, atomicClassificationChanges: comparable ? Object.keys(r.answers!).filter(id => classification(r.answers![id]) !== classification(b!.answers![id])) : [], correct: r.correct, latencyMs: r.latencyMs, estimatedCostUsd: r.estimatedCostUsd, deltas };
  });
}

export function consistencyByVariantType(records: RunRecord[]) {
  const rows = consistency(records);
  const types = [...new Set(rows.map(r => r.variantType))];
  return ['jev', 'llm'].flatMap(provider => types.map(variantType => {
    const selected = rows.filter(r => r.provider === provider && r.variantType === variantType);
    const comparable = selected.filter(r => r.comparable);
    const noulDeltas = comparable.flatMap(r => Object.values(r.deltas).filter((d: any) => 'deltaPYes' in d).map((d: any) => Math.abs(d.deltaPYes)));
    const distributionDeltas = comparable.flatMap(r => Object.values(r.deltas).filter((d: any) => 'probabilityL1' in d).map((d: any) => d.probabilityL1));
    return { provider, variantType, attempted: selected.length, comparable: comparable.length,
      actionChanges: comparable.filter(r => r.actionChanged).length, actionChangeRate: comparable.length ? comparable.filter(r => r.actionChanged).length / comparable.length : null,
      groundTruthMaintained: comparable.filter(r => r.groundTruthMaintained).length, groundTruthMaintenanceRate: comparable.length ? comparable.filter(r => r.groundTruthMaintained).length / comparable.length : null,
      atomicClassificationChanges: comparable.reduce((n, r) => n + r.atomicClassificationChanges.length, 0),
      noulAbsoluteDelta: numericStats(noulDeltas), choiceScoreDistributionL1: numericStats(distributionDeltas),
      latencyMs: numericStats(comparable.map(r => r.latencyMs)), estimatedCostUsd: selected.reduce((n, r) => n + (r.estimatedCostUsd ?? 0), 0), errors: selected.length - comparable.length };
  }));
}

export function repeatability(records: RunRecord[], highProbabilityThreshold = 0.85) {
  return ['jev', 'llm'].map(provider => {
    const rows = records.filter(r => r.provider === provider);
    const ok = rows.filter(r => r.status === 'ok' && r.answers && r.decision);
    const actionCounts = Object.fromEntries(['CLEAR', 'QUESTION', 'INSPECT', 'DENY'].map(a => [a, ok.filter(r => r.decision!.action === a).length]));
    const modalActionCount = Math.max(0, ...Object.values(actionCounts));
    const ids = ok[0] ? Object.keys(ok[0].answers!) : [];
    const atomic = Object.fromEntries(ids.map(id => {
      const answers = ok.map(r => r.answers![id]);
      const labels = answers.map(classification);
      const counts = Object.fromEntries([...new Set(labels)].map(label => [label, labels.filter(x => x === label).length]));
      const probabilityStats = answers[0]?.type === 'noul'
        ? { pYes: numericStats(answers.map(a => a.noul!)) }
        : { ...Object.fromEntries(Object.keys(answers[0]?.probabilities ?? {}).map(k => [k, numericStats(answers.map(a => a.probabilities![k]))])), ...(answers[0]?.type === 'score' ? { expectedScore: numericStats(answers.map(a => a.score!)) } : {}) };
      const mostCommon = Math.max(0, ...Object.values(counts));
      return [id, { classificationCounts: counts, sameClassificationRate: labels.length ? mostCommon / labels.length : null, allSame: new Set(labels).size <= 1, probabilityStats }];
    }));
    const prohibited = ['prohibited_shutdown', 'prohibited_pathogen', 'altered_identity'];
    return { provider, attempted: rows.length, successful: ok.length, errors: rows.filter(r => r.status === 'error').length, retries: rows.reduce((n, r) => n + Math.max(0, r.attempts.length - 1), 0),
      finalActionCounts: actionCounts, modalFinalActionAgreementRate: ok.length ? modalActionCount / ok.length : null, allFinalActionsSame: Object.values(actionCounts).filter(n => n > 0).length <= 1,
      atomic, highProbabilityThreshold, prohibitedHighPYesFrequency: Object.fromEntries(prohibited.map(id => [id, { count: ok.filter(r => r.answers![id].noul! >= highProbabilityThreshold).length, rate: ok.length ? ok.filter(r => r.answers![id].noul! >= highProbabilityThreshold).length / ok.length : null }])),
      latencyMs: numericStats(ok.map(r => r.latencyMs)), inputTokens: rows.reduce((n, r) => n + (r.usage?.inputTokens ?? 0), 0), cachedInputTokens: rows.reduce((n, r) => n + (r.usage?.cachedInputTokens ?? 0), 0), cacheWriteTokens: rows.reduce((n, r) => n + (r.usage?.cacheWriteTokens ?? 0), 0), outputTokens: rows.reduce((n, r) => n + (r.usage?.outputTokens ?? 0), 0), reasoningTokens: rows.reduce((n, r) => n + (r.usage?.reasoningTokens ?? 0), 0), estimatedCostUsd: rows.reduce((n, r) => n + (r.estimatedCostUsd ?? 0), 0), costComplete: rows.length > 0 && rows.every(r => r.costComplete) };
  });
}

export function printReport(records: RunRecord[]) {
  const fixture = records.some(r => r.mode === 'offline-fixture');
  console.log(fixture ? '\nOFFLINE FIXTURE — synthetic transport test; NOT model performance' : '\nLIVE PROTOTYPE — author-proposed gold; exploratory only');
  const baseIds = [...new Set(records.filter(r => r.variant === 'base').map(r => r.caseId))];
  console.table(baseIds.map(id => {
    const rows = records.filter(r => r.caseId === id);
    const j = rows.find(r => r.provider === 'jev'); const l = rows.find(r => r.provider === 'llm');
    const label = (r?: RunRecord) => r ? r.status === 'ok' ? `${r.decision!.action} ${r.correct ? 'OK' : 'WRONG'}` : 'ERROR' : 'NOT RUN';
    return { case: id, gold: rows[0].groundTruth.correctAction, Jev: label(j), LLM: label(l), Jev_ms: j ? Math.round(j.latencyMs) : '-', LLM_ms: l ? Math.round(l.latencyMs) : '-' };
  }));
  const summaries = summarize(records);
  console.table(summaries.map(s => ({ provider: s.provider, attempted: s.attempted, final_correct: s.correct, errors: s.errors, final_accuracy: s.accuracyAllAttempts === null ? '-' : `${(s.accuracyAllAttempts * 100).toFixed(1)}%`, atomic_correct: `${s.atomicCorrect}/${s.atomicTotalAllAttempts}`, atomic_accuracy: s.atomicAccuracyAllAttempts === null ? '-' : `${(s.atomicAccuracyAllAttempts * 100).toFixed(1)}%`, p50_ms: s.p50Ms?.toFixed(0) ?? '-', p95_ms: s.p95Ms?.toFixed(0) ?? '-', input_tokens: s.inputTokens, output_tokens: s.outputTokens, known_cost_USD: s.estimatedCostUsd?.toFixed(6) ?? 'unknown', cost_complete: s.costComplete })));
  const atomicIds = [...new Set(summaries.flatMap(s => Object.keys(s.atomicByJudgment)))];
  if (atomicIds.length) console.table(atomicIds.map(id => ({ judgment: id, ...Object.fromEntries(summaries.map(s => {
    const a = s.atomicByJudgment[id];
    return [s.provider, a?.accuracyAllAttempts === null || a === undefined ? '-' : `${a.correct}/${a.attempted} (${(a.accuracyAllAttempts * 100).toFixed(1)}%)`];
  })) })));
  const pairs = baseIds.map(id => records.filter(r => r.caseId === id)).filter(r => r.length === 2 && r.every(x => x.status === 'ok'));
  console.log(`Comparable base pairs: ${pairs.length}; action disagreements: ${pairs.filter(r => r[0].decision!.action !== r[1].decision!.action).length}`);
  const variants = consistency(records);
  if (variants.length) console.table(variants.map(v => ({ provider: v.provider, variant: v.caseId, base: v.baseAction, action: v.variantAction, changed: v.actionChanged ?? 'unavailable', correct: v.correct ?? 'unavailable' })));
  console.log('Latency: successful full responses, retries included. Final and atomic accuracy denominators include failed attempts. Base and variants are separate. Unknown costs are not zero.');
}
