# MARS GATE — Colony Entry Control

Frozen Held-out Benchmark v1を使った火星入境審査端末のInteractive UIと、検証に使用したCLI・データを収録します。Prototype 20件はdevelopment setで、Held-out accuracyには含めません。

## Interactive UI MVP

Node.js 22.14以上。React + Vite + CSSで実装した閲覧用アプリです。Frozen Base 120ケースを切り替え、保存済みJev / GPT-5.6 Luna / GPT-6 Lunaの判断を再生します。Research ResultsはFinal Analysisのpublication dataから生成します。**画面操作ではモデルAPIを呼びません。**

```sh
cd ui
npm install
cd ..
npm run ui:dev
```

表示先は通常 `http://127.0.0.1:5173/` です。ビルドとテスト:

```sh
npm run ui:build
npm run ui:test
npm run benchmark:verify-freeze
npm test
```

`ui:prepare`はfreeze integrityを確認し、`benchmark/v1/cases.json`、既存Frozen Base `records.jsonl`、`results/benchmark-v1/final-analysis/publication-data.json`などを読み、UI用の縮約スナップショット`ui/src/data/frozen.json`を生成します。Benchmark本体・raw resultsは変更しません。ブラウザ側はこのスナップショットのみを読み、`src/providers.ts`、APIキー、リクエストbodyをbundleしません。Goldもデモ上は「Reveal Ground Truth」まで非表示ですが、静的フロントエンド内のデータなので秘匿性を保証する仕組みではありません。

現在のUIは**Frozen Result modeのみ**です。Live Inspectionは未実装のarchitecture placeholderで、サーバー接続・API key設定は不要です。CLIのライブ実験を使う場合だけルートの`.env`へ`TYPESAFE_API_KEY`と`OPENAI_API_KEY`を設定します。これらを`ui/`へ置かないでください。

画面はInspection（case navigation、filter、短いdecision sequence、3モデル切替、Compare Mode、Ground Truth reveal）とResearch Results（Base、efficiency、Repeatability、Consistency、Sensitivity、Methodology、Limitations）です。Visitor portraitは差し替え可能なSVG componentです。

以下は既存CLI/Benchmarkの運用記録です。

## Held-out Benchmark v1（freeze時点の記録）

`benchmark/v1/`に新規120 base cases（各action 30）、分離したreviewed/frozen Ground Truthとlatent truth、事前固定repeatability subset 20件、12 family×4種類のconsistency variants、9 sensitivity variantsを保存しています。Pre-benchmark human reviewが完了し、120件すべてが`scoringEligible: true`です。

```sh
npm run benchmark:validate
```

[case-review](benchmark/v1/case-review.md)に全ケースと最終adjudicationを、[freeze](benchmark/v1/freeze.json)に構成要素のhashを保存しています。Freeze時点ではこのdatasetに対するJev/OpenAI API実行は行っていません。

## 現在の状態

- 20基本ケース（CLEAR / QUESTION / INSPECT / DENY各5件）。Human / Android / Alienは各クラスに含まれます。
- 3ケース×4変換 = 12 consistency variants（言い換え、JSON情報順、無関係情報追加、種族置換）。
- 同一State・同一質問内容・共通行動規則。ケースごとにプロバイダーの先行順を交互に変更します。
- 生HTTPレスポンス、atomic結果、最終行動、正誤、時間、token使用量、推定費用を保存。
- **正解は作成者による提案ラベルで、独立した人間のレビューは未実施です。** [ケースレビュー](docs/case-review.md)で確認してください。
- **offlineは固定レスポンスによる配管確認です。モデル性能を再現せず、APIが利用できることも証明しません。**

## 起動

Node.js 22.14以上。外部依存なし。TypeScriptをNodeのtype strippingで実行するため、実験的機能の警告が表示される場合があります。型の静的チェックではなく、実行時検証とテストで検証します。

```sh
cp .env.example .env
# エディタでTYPESAFE_API_KEYとOPENAI_API_KEYを設定。値をチャットへ送らない。
npm run check
npm test
npm start -- run --offline
```

実API（課金あり）の接続確認と本実行：

```sh
npm start -- run --suite base --limit 1
npm start -- run
```

最初のLIVE確認は`npm run smoke:live`でも実行できます。両プロバイダーに同じ1ケースを1回ずつ送り、通常2リクエストだけを行います。20件実行は、この結果を確認した後に進めます。

既定の`run`は20基本ケース＋12variantsを両プロバイダーで実行し、通常64リクエストです。HTTP 429/5xx/529の再試行により増える場合があります。全体は順次実行します。ネットワークアクセスが必要です。

```sh
npm start -- run --suite base              # 20基本ケースのみ
npm start -- run --suite consistency       # 元3件と12variants
npm start -- run --provider jev            # Jevのみ
npm start -- run --provider llm            # LLMのみ
npm start -- report results/<run-id>       # 保存結果を再表示（APIを呼ばない）
```

両者のキーを事前確認してからリクエストを開始します。認証・課金・権限エラーでは現在のケースのペアを保存して停止します。タイムアウト、無効なJSON、拒否応答、schema違反はERRORとして保存し、CLEARなどへ変換しません。中断済みJSONLは`report`で確認できますが、自動resumeはこのPrototypeに含みません。再実行は別runとして保存します。

## 比較設定

Jev `jev-1.13.0`、LLM `gpt-5.6-luna`、LLM reasoning effort `medium`を既定値にします。LLMはstrict JSON schemaを使い、長文説明・Chain-of-Thoughtを要求しません。モデル、reasoning effort、料金は`.env`で変更できます。これはこの2モデルの比較であり、LLM全般への結論にはできません。

同じHTTPクライアントと明示的なretryで時間を計測するため、公式HTTP APIを直接使用します。SDKに隠れた再試行はありません。Jevを1問ずつ呼ばず、8問をまとめます。LLMも1回で同じ8問を回答します。LLMの出力schemaに必要な追加トークンも費用に含まれます。

価格（2026-09-22確認、USD/100万tokens）：Jev入力0.042・出力0、GPT-5.6 Luna入力0.20・cached入力0.02・出力1.20。Lunaは272Kを超える入力でリクエスト全体の入力が2倍、出力が1.5倍になりますが、このPrototypeの入力はその閾値を大きく下回ります。reasoning tokenは出力tokenとして課金されます。別LLMを選ぶ場合は対応する価格を3項目とも設定し、APIパラメーターとの互換性も確認してください。

各プロバイダーのprompt cacheを確実に無効化する保証はありません。アプリ側cacheはなく、LLMのcached tokensは保存し課金へ反映します。ネットワーク・provider待ち時間込みの利用者側latencyであり、純粋な推論時間ではありません。

## Judgmentと最終行動

`src/judgments.ts`が唯一の定義です。入力の種族・出身地を拒否根拠にせず、架空世界の必要な技術条件をStateに明記します。数値・期限など定型チェックは通過済みという共通条件です。

| 判断 | 型 | 最終行動への利用 |
|---|---|---|
| material_contradiction | Noul | 未解消の重要な矛盾→QUESTION |
| explanation_supported | Noul | 独立証拠で支持された説明による矛盾の解消 |
| physical_concern | Noul | 未解決の物理的な懸念→INSPECT |
| prohibited_shutdown | Noul | 生命維持停止能力の確定 |
| prohibited_pathogen | Noul | 危険な生存病原体の確定 |
| altered_identity | Noul | 提示された身分証の本人情報改変の確定 |
| answer_completeness | Choice | complete / partial / evasive、未回答→QUESTION |
| anomaly_severity | Score | 確認された物理的影響の程度。診断専用で最終行動に未使用 |

優先順：DENY（3つの禁止条件のいずれか ≥ .85）→ INSPECT（physical ≥ .65）→ QUESTION（contradiction ≥ .65かつexplanation < .80、またはpartial＋evasive ≥ .60）→ 不確実性によるQUESTION → CLEAR。不確実性はいずれかの禁止条件/physical ≥ .35、未解消contradiction ≥ .35、またはcomplete < .60。閾値は未校正のPrototype初期値です。`manifest.json`に保存し、テスト結果を見てこっそり変更しません。

禁止条件は3問に分け、ORをコードで処理します。確率の最大値をゲートに使いますが、禁止条件の和事象の確率とは解釈しません。physical_concernは説明による解消を考慮するため、完全に機械的な属性ではありません。このPrototypeで設計の妥当性を調べます。

JevのNoulはP(Yes)、Choice/Scoreは分布とconfidenceをそのまま保存。LLMは自己申告確率で、confidenceを要求・生成しません。両者のconfidenceを比較しません。Scoreを危険確率へ読み替えず、Noulを掛け合わせて最終行動の確率も生成しません。

## ファイルと再利用

```text
data/cases.json          観測情報だけの20ケース
data/variants.json       12 variants（正解は元ケースを参照）
data/gold.json           隠された真実・行動正解・atomicラベル・日本語根拠
docs/case-review.md      人間がレビューする一覧
src/judgments.ts         質問・入力allowlist・共通の行動決定
src/providers.ts         キーを扱うサーバー側HTTP adapters
src/runner.ts            UIとCLIから呼べる実行処理（Node側）
src/report.ts            比較とconsistency集計
src/cli.ts               CLI表示だけを担当
tests/prototype.test.ts  情報漏洩防止・境界・API失敗・保存の検証
```

将来Reactからは小さなサーバーを介してrunnerを呼びます。providers/runnerやgoldをブラウザへbundleしないでください。UI実装・サーバー公開は現在含みません。

## 出力

`results/<timestamp>-<mode>-<id>/`に以下を保存します（git対象外）。

- `manifest.json`: providerごとのrequested model、API応答から得たresolved model、reasoning effort、pricing assumptions、policy、質問、閾値、hash、実行条件、完了状態。APIキーなし。
- `dataset-snapshot.json`: 実行時データと正解の固定コピー。モデルには送信しません。
- `records.jsonl`: 各ケース×モデル。Ground Truth、atomic回答、行動、正誤、atomicMatches、latency、usage、cost、送信body、各HTTP attemptの生text/JSON/status。
- `summary.json`: 基本ケースのfinal action accuracy、全atomic judgment accuracyと判断別accuracy、variant別の行動変化・Noul確率差・Choice/Score分布差。Jevのconfidence差はJev内の比較のみ。

latencyは完全な回答の受信・検証まで（retry待ち込み）。`firstAttemptLatencyMs`も保存します。成功ケースのp50/p95と、ERRORを含む全試行を分母とした正答率を表示します。基本20件とvariantsは混ぜません。費用不明の試行を0ドル扱いせず、判明分と`costComplete`を分けます。provider側の不明な課金は推定できません。

## Prototype結果の読み方

まず誤判定ケースの証拠・質問・原レスポンスを確認し、規則や作成者ラベルの問題とモデルの問題を分けます。両者の正誤だけでなく、どのatomic判断で分かれたか、同じ意味で回答が変わるかを見ます。20件の一回実行から統計的優位性やcalibrationを結論しません。英語ケースから日本語性能を推定しません。variantの意味保存は人間レビューが必要です。

## 公式資料

- https://docs.typesafe.ai/api
- https://docs.typesafe.ai/models
- https://docs.typesafe.ai/primitives
- https://docs.typesafe.ai/confidence
- https://developers.openai.com/api/docs/models/gpt-5.6-luna
- https://developers.openai.com/api/docs/guides/reasoning
- https://developers.openai.com/api/docs/guides/structured-outputs
