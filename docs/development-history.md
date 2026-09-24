# Development history

| Work phase | Codex development model | Scope |
|---|---|---|
| Through Frozen Held-out Benchmark v1 Base and Repeatability implementation and execution | GPT-5.6 Sol Medium | Development tooling |
| From Consistency Benchmark onward | GPT-6 Sol Medium | Development tooling |

Recorded before the Consistency Benchmark API run on 2026-09-23. This Codex model change affects development tooling only. It does not change any Frozen Benchmark component or either evaluated model setting: Jev `jev-1.13.0` and GPT-5.6 Luna with reasoning effort `medium`.

## Post-freeze external model evaluation

Frozen v1 content and its Jev/GPT-5.6 Luna evaluation settings were fixed before any GPT-6 Luna results were observed. After GPT-6 Luna became available, GPT-6 Luna Medium was evaluated as a third model on the same Frozen v1 content for Base, Repeatability, Consistency, and Sensitivity. This addition used a separate, hashed post-freeze model configuration; it did not re-freeze or alter Frozen v1, and the original Jev/GPT-5.6 responses were not rerun. The Codex development model remained GPT-6 Sol Medium during the post-freeze evaluation work.
