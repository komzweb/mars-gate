import { parseArgs } from 'node:util';
import { loadDataset } from './dataset.ts';
import { repriceRun, run, runRepeatability, readRecords } from './runner.ts';
import { printReport } from './report.ts';
import type { Provider } from './types.ts';

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    suite: { type: 'string', default: 'all' }, provider: { type: 'string', default: 'both' }, offline: { type: 'boolean', default: false }, limit: { type: 'string' }, repeats: { type: 'string', default: '10' }, case: { type: 'string', default: 'MG-07' }, out: { type: 'string' }, help: { type: 'boolean' },
  } });
  const command = positionals[0] || 'help';
  if (values.help || command === 'help') {
    console.log(`MARS GATE exploratory CLI (Node >=22.14)\n\n  npm run check\n  npm start -- run --offline\n  npm start -- run --suite base            # LIVE: 20 base cases, both providers\n  npm start -- run --suite consistency     # LIVE: 3 bases + 12 variants\n  npm start -- repeatability --case MG-07 --repeats 10\n  npm start -- reprice results/<run-id>    # writes a separate derived summary\n  npm start -- report results/<run-id>\n\nSet TYPESAFE_API_KEY and OPENAI_API_KEY locally in .env.\nOffline output is synthetic plumbing verification, not benchmark evidence.`);
    return;
  }
  if (command === 'validate') {
    const d = await loadDataset();
    console.log(`Valid: ${d.cases.length} base cases; ${d.variants.length} variants; ${Object.keys(d.gold).length} gold records.`);
    console.table(d.counts);
    console.log('Gold status: author-proposed. Human review: docs/case-review.md');
    return;
  }
  if (command === 'report') {
    if (!positionals[1]) throw new Error('Supply a result directory');
    printReport(await readRecords(positionals[1])); return;
  }
  if (command === 'reprice') {
    if (!positionals[1]) throw new Error('Supply a source result directory');
    const result = await repriceRun(positionals[1], values.out);
    console.table(result.output.byProvider);
    console.log(`Saved corrected summary without modifying source: ${result.directory}`);
    return;
  }
  if (!['run', 'repeatability'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (!['base', 'all', 'consistency'].includes(values.suite!)) throw new Error('suite must be base, all, or consistency');
  if (!['jev', 'llm', 'both'].includes(values.provider!)) throw new Error('provider must be jev, llm, or both');
  const limit = values.limit === undefined ? undefined : Number(values.limit);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) throw new Error('limit must be a positive integer');
  const providers: Provider[] = values.provider === 'both' ? ['jev', 'llm'] : [values.provider as Provider];
  console.log(values.offline ? 'OFFLINE FIXTURE: no network calls; all predictions are synthetic.' : 'LIVE: real billed API calls; source state is identical for both providers.');
  if (command === 'repeatability') {
    const repeats = Number(values.repeats);
    if (!Number.isInteger(repeats) || repeats < 1) throw new Error('repeats must be a positive integer');
    const result = await runRepeatability({ caseId: values.case!, repeats, providers, offline: values.offline!, outputRoot: values.out,
      onRecord: r => console.log(`repeat ${r.repeatIndex} ${r.caseId} ${r.provider} ${r.status} ${r.decision?.action ?? r.error} (${Math.round(r.latencyMs)}ms)`),
    });
    console.table(result.summary.providers.map((p: any) => ({ provider: p.provider, successful: p.successful, action_agreement: p.modalFinalActionAgreementRate, action_counts: JSON.stringify(p.finalActionCounts), errors: p.errors, retries: p.retries, cost_USD: p.estimatedCostUsd })));
    console.log(`Saved: ${result.directory}`);
    if (!result.summary.complete || result.records.some(r => r.status === 'error')) process.exitCode = 1;
    return;
  }
  const result = await run({ suite: values.suite as 'base' | 'all' | 'consistency', providers, offline: values.offline!, limit, outputRoot: values.out,
    onRecord: r => console.log(`${r.caseId} ${r.provider} ${r.status} ${r.decision?.action ?? r.error} (${Math.round(r.latencyMs)}ms)`),
  });
  printReport(result.records);
  console.log(`Saved: ${result.directory}`);
  if (result.records.some(r => r.status === 'error') || !result.summary.complete) process.exitCode = 1;
}

main().catch(e => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1; });
