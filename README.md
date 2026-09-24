# MARS GATE

An experimental semantic-decision benchmark and Frozen Results viewer, set at a fictional Mars-colony entry checkpoint.

MARS GATE asks whether a specialized System-One-style decision model offers a useful accuracy, latency, and cost tradeoff for many small semantic judgments compared with general-purpose LLMs. Visitors and entry policy are fictional; this is a research/demo interface, not a production immigration system or a public interactive service.

Frozen Held-out Benchmark v1 compares TypeSafe AI's Jev with GPT-5.6 Luna Medium. GPT-6 Luna Medium was added as a **post-freeze comparator**: the benchmark content and scoring were fixed before its results were observed. The UI displays saved results and makes no provider API requests.

## Why this experiment?

Code handles deterministic checks well, while general-purpose LLMs can reason over complex context. Many workflows also contain small, repeated semantic decisions that are difficult to encode as rules but do not require long, multistep reasoning. MARS GATE tests that middle layer without presuming which system is preferable.

Jev is TypeSafe AI's System One decision model. It evaluates a supplied State and Question and returns typed judgments with probabilities: Noul (yes/no), Choice (categories), and Score (ordered categories). Here it handles semantic judgments rather than long-form generation. Its confidence and the LLMs' model-reported probabilities are **not** treated as equivalent measures.

## Benchmark design

The frozen held-out set has **120 base cases**, balanced across **30 CLEAR, 30 QUESTION, 30 INSPECT, and 30 DENY** Gold actions. Visitors include Human, Android, Alien, Cyborg, Synthetic, and Uplift. The same fictional policy and permit conditions apply to every visitor type; species alone is not grounds for an action. The earlier 20-case prototype is a development set and is excluded from held-out accuracy.

All three systems receive the same observable State and eight questions. Their atomic outputs enter the **same deterministic final-action rules**, which route to CLEAR, QUESTION, INSPECT, or DENY. This compares the semantic-judgment step under shared routing, rather than asking each model to generate an unconstrained final verdict.

| Atomic judgment | Role |
| --- | --- |
| Material contradiction | Whether supplied claims or records materially conflict |
| Explanation supported | Whether independent evidence supports an offered benign explanation |
| Physical concern | Whether an unresolved item or scan needs physical inspection |
| Prohibited shutdown capability | Whether authenticated evidence establishes the forbidden capability |
| Prohibited pathogen | Whether authenticated evidence establishes a viable dangerous pathogen |
| Altered identity | Whether authenticated evidence establishes an altered credential |
| Answer completeness | Whether the interview answer addresses the explicit question |
| Anomaly severity | Diagnostic rating of supported physical impact; it does not set the final action |

The frozen [policy, questions, and thresholds](benchmark/v1/manifest.json) and [shared decision function](src/judgments.ts) define the exact task. Jev uses the TypeSafe System One endpoint; both Luna evaluations used the **Chat Completions API** with the same structured-output contract. GPT-6 was added through a separately recorded post-freeze configuration, without changing Frozen v1 or rerunning the earlier systems.

## Observed results

Values below come from the tracked [publication snapshot](ui/src/data/frozen.json). Base latency is observed API latency, including network/provider effects. Costs are estimates under recorded pricing assumptions, not universal prices.

| Metric | Jev | GPT-5.6 Luna Medium | GPT-6 Luna Medium |
| --- | ---: | ---: | ---: |
| Base Final Action Accuracy | 119/120 | 109/120 | 120/120 |
| Base Atomic Accuracy | 910/960 | 855/960 | 888/960 |
| Base p50 API Latency | 296 ms | 6,572 ms | 3,457 ms |
| Base Estimated Cost | $0.008823 | $0.107249 | $0.051696 |
| Repeatability Final Action | 99/100 attempted* | 93/100 | 100/100 |
| Consistency Action Agreement | 48/48 | 36/48 | 48/48 |
| Sensitivity Variant Gold Accuracy | 5/9 | 3/9 | 4/9 |

\* Jev had one HTTP 520 failure in repeatability; all 99 successful responses matched the Gold Final Action. The failure remains in the attempted-request denominator.

### How to read these results

On this Frozen workload, GPT-6 Luna had the highest Base Final Action accuracy, while Jev had the highest Base atomic hard-label accuracy. Jev's observed p50 API latency and estimated cost were substantially lower. Jev and GPT-6 Luna each maintained the Base action on all 48 meaning-preserving consistency variants. Sensitivity was difficult for all three systems; its **9 variants** cannot support broad conclusions. There is no composite winner score.

The additional suites measure different properties. **Repeatability** repeats an identical input. **Consistency** checks whether the Final Action persists after meaning-preserving paraphrase, information reordering, irrelevant detail, or species/type swap. **Sensitivity** adds, removes, or reverses decisive evidence and checks whether the action changes *to the new Gold action*. A Base-to-variant difference alone does not establish that a transformation caused it; same-input variability is measured separately.

## Frozen Results Viewer

The React/Vite UI browses frozen cases, switches among the three models, shows an evidence-to-judgment **Decision Trace**, compares models, reveals Frozen Ground Truth, and presents a Research Results dashboard. Gold is already present in the static snapshot; the reveal control is for presentation, not secrecy. This is a viewer of saved results, not a live benchmark runner. The **Start Inspection** animation is presentation only and is excluded from measured API latency. UI actions do not call Jev or OpenAI.

To run the viewer from a clone, use Node.js **22.14 or newer**:

~~~sh
npm --prefix ui ci
npm --prefix ui run dev
~~~

Open the local URL printed by Vite. The viewer uses the tracked [frozen UI snapshot](ui/src/data/frozen.json), so **no API key or local results/ directory is needed**. For a production build of this viewer, use npm --prefix ui run build. The root ui:prepare / ui:dev scripts regenerate that snapshot from locally retained raw results and are not needed for a fresh clone.

To check the tracked benchmark and code without provider inference:

~~~sh
npm run benchmark:verify-freeze
npm run benchmark:validate
npm test
npm --prefix ui test
~~~

## Re-running inference and provenance

Re-running provider inference requires your own credentials; see the blank [.env.example](.env.example), keep .env out of Git, and expect provider charges. Never put keys in client-side VITE_* variables. The Node-side adapters read credentials from environment variables. Model availability, behavior, and prices may change, so historical responses may not reproduce exactly. Raw run files in results/ are intentionally excluded from Git; some analysis and snapshot-regeneration scripts depend on those local files. This repository therefore does **not** provide a self-contained replay of every historical raw response.

The experiment is **MARS GATE Experiment Release v1**, at tag mars-gate-experiment-v1. The frozen overall SHA-256 is 3a4505ecc16db9260d5d8aaacb1adb1777a4b2d7ab0973823fc0628b530e4f1d; the benchmark manifest SHA-256 is c73a6887d32644dd47eea2257345582399418471c0fc4c3ba34cf86290152e0d. Run npm run benchmark:verify-freeze to verify the tracked frozen components. GPT-6 Luna remains a post-freeze comparator, not part of the original model-settings freeze.

| Path | Contents |
| --- | --- |
| [benchmark/v1/](benchmark/v1/) | Frozen cases, reviewed Gold, [case review](benchmark/v1/case-review.md), policy, variants, and freeze metadata |
| [data/](data/) | Excluded-from-scoring prototype/development cases |
| [src/](src/) | Atomic questions, shared routing, provider adapters, and CLI analysis |
| [ui/](ui/) | Frozen Results viewer and tracked publication snapshot |
| [docs/](docs/) | Review and [experiment release](docs/experiment-release-v1.md) documentation |

## Limitations

This is a small, hand-designed benchmark in one fictional domain, aimed at a specific semantic-decision workload rather than general intelligence. The sensitivity set has only 9 variants. Network and provider infrastructure affect latency; estimated cost depends on recorded pricing assumptions. Provider behavior can change. Jev confidence and LLM model-reported probabilities are not numerically comparable. Species-swap observations do not establish an internal bias mechanism. The frozen scoring is preserved even where later item interpretation merits review. No public interactive deployment is planned.

## License

This project is licensed under the [MIT License](LICENSE).
