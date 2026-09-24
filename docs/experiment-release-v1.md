# MARS GATE Experiment Release v1

Status: **FROZEN**
Release audit: **PASS** (2026-09-24)

- Frozen dataset: Frozen Held-out Benchmark v1
- Overall execution freeze SHA-256: `3a4505ecc16db9260d5d8aaacb1adb1777a4b2d7ab0973823fc0628b530e4f1d`
- Benchmark manifest SHA-256: `c73a6887d32644dd47eea2257345582399418471c0fc4c3ba34cf86290152e0d`
- Compared systems: Jev, GPT-5.6 Luna Medium, GPT-6 Luna Medium
- GPT-6 Luna status: post-freeze comparator; Frozen v1 was fixed before its evaluation
- UI mode: Frozen Results viewer; live inference disabled
- Intended use: private experiment, research communication, screenshots, and recorded demo
- Public interactive deployment: not planned

The release audit found 0/16 freeze-component mismatches and 0/8 raw-run hash mismatches. Frozen Base action and rule checks found 0/360 mismatches. UI tests (14/14), implementation tests (23/23), dataset validation, and the production build passed. No Jev or OpenAI inference request was made during the audit.

The local `results/` directory remains excluded from Git. Its eight raw run hashes and provenance are recorded in `results/benchmark-v1/final-analysis/source-inventory.json` (SHA-256: `c754434e449f477bc6d2fdc1b6e3ea056999a19832679b09ec6496d3a9be4830`). Preserve that local directory separately when archiving raw responses; the Git tag identifies the audited code, Frozen dataset, and UI snapshot, but does not contain the raw run files.
