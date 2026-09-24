# MARS GATE Prototype — 20ケースの正解案

これは人間がレビューするための作成者ラベルです。独立した人間のレビュー済みとは主張しません。モデルに送る観測情報は英語、根拠は日本語です。

## MG-01 — 怪しい配線は承認された教材 [CLEAR]

- 種族: Human; borderline: False; 隠された実際の危険: safe

- 申告: I carry a disarmed training controller, not a working override device.

- 記録 D1: The training lab certified this exact unit: its control paths were physically severed; it cannot transmit commands.

- スキャン S1: Visible wires and a red switch resemble an override device. Continuity check confirms severed paths and no transmitter.

- 質問: Why does it look like an override device?

- 回答: It is a disarmed teaching prop; the lab certificate describes the removed control paths.

- 正解根拠: 外見は怪しいが、無力化の説明を証明書とスキャンが独立に支持する。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": true, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-02 — 言い換えによる見かけの不一致 [CLEAR]

- 種族: Android; borderline: False; 隠された実際の危険: safe

- 申告: Only sealed mineral specimens are in my case.

- 記録 D1: The geology manifest lists basalt reference samples in sealed vials.

- スキャン S1: Sealed vials contain basalt chips; no additional contents.

- 質問: What are the specimens for?

- 回答: They are rock reference samples for a geology demonstration.

- 正解根拠: mineral specimensとrock reference samplesはここでは同じ対象。物理的な不一致はない。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-03 — 発光する液体の無害な説明 [CLEAR]

- 種族: Alien; borderline: False; 隠された実際の危険: safe

- 申告: The luminous liquid is an inert stage pigment.

- 記録 D1: The arts institute identifies the sealed batch as nonliving fluorescent dye.

- スキャン S1: Fluorescence detected; validated analysis identifies nonliving inert dye matching the batch.

- 質問: Why is the liquid glowing?

- 回答: It is stage dye that fluoresces; the institute batch record identifies it.

- 正解根拠: 発光は危険の証拠ではなく、無生物の顔料という説明が確認されている。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": true, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-04 — 過去と現在の所属 [CLEAR]

- 種族: Human; borderline: False; 隠された実際の危険: safe

- 申告: I am an independent technician now.

- 記録 D1: Employment record: previously employed by Helix; the contract ended before this trip.

- スキャン S1: Only declared hand tools; no unusual readings.

- 質問: Your older badge says Helix. Are you still their employee?

- 回答: No. That was my former job; I now work independently.

- 正解根拠: 以前と現在を区別すると矛盾しない。古いバッジの説明を記録が支持する。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": true, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-05 — 静かな来訪者の完全な回答 [CLEAR]

- 種族: Android; borderline: False; 隠された実際の危険: safe

- 申告: I bring textile samples for the cooperative exhibit.

- 記録 D1: The cooperative invitation confirms an unpaid textile demonstration.

- スキャン S1: Textiles match the declaration; no other objects.

- 質問: Who invited you and what will you demonstrate?

- 回答: The textile cooperative. I will demonstrate the woven samples. I would prefer to keep the conversation brief.

- 正解根拠: 会話を短くしたい態度は回避ではない。質問の両方に回答している。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-06 — 二つの質問の片方のみ回答 [QUESTION]

- 種族: Alien; borderline: False; 隠された実際の危険: safe

- 申告: I bring a presentation slate for the research visit.

- 記録 D1: Research visitor invitation is authentic; host contact is not recorded.

- スキャン S1: Only the declared slate; no unusual readings.

- 質問: Which team invited you, and who will meet you at the gate?

- 回答: The atmospheric research team invited me.

- 正解根拠: 招待チームには回答したが迎えの担当者には未回答。物理検査や拒否の根拠はない。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": false, "answer_completeness": "partial", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-07 — 無報酬と有償の意味矛盾 [QUESTION]

- 種族: Human; borderline: False; 隠された実際の危険: safe

- 申告: I will only observe; I will not do paid work.

- 記録 D1: Signed engagement assigns the visitor paid repair shifts during this same visit.

- スキャン S1: Declared notebook only; no unusual readings.

- 質問: Will you perform paid repairs during this visit?

- 回答: No, I will only watch the engineers.

- 正解根拠: 同じ訪問中の有償修理契約と本人の申告が矛盾。これは規定の即時拒否条件ではない。

- atomicラベル: `{"material_contradiction": true, "explanation_supported": false, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-08 — 丁寧な回避 [QUESTION]

- 種族: Android; borderline: False; 隠された実際の危険: safe

- 申告: I have no cargo and am attending a planning meeting.

- 記録 D1: Meeting booking is genuine; it does not name the host organization.

- スキャン S1: No carried cargo or unusual readings.

- 質問: Which organization is hosting the meeting?

- 回答: Everything was arranged properly, and I respect all colony procedures.

- 正解根拠: 丁寧な安心表現は組織名への回答ではない。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": false, "answer_completeness": "evasive", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-09 — 裏付けのない予定変更 [QUESTION]

- 種族: Alien; borderline: True; 隠された実際の危険: safe

- 申告: I am here only to visit a friend, not to give a workshop.

- 記録 D1: Current host record still schedules this visitor to deliver a workshop during this visit.

- スキャン S1: Declared personal clothing only; no unusual readings.

- 質問: Why does the host record list you as the workshop presenter?

- 回答: The workshop was cancelled; the host has not updated the record.

- 正解根拠: 説明はあり得るがキャンセルを支持する独立情報がない。確認質問が妥当であり拒否には不足。

- atomicラベル: `{"material_contradiction": true, "explanation_supported": false, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-10 — 一見正常だが回答の範囲が狭い [QUESTION]

- 種族: Human; borderline: True; 隠された実際の危険: safe

- 申告: I carry a routine survey notebook.

- 記録 D1: Survey visit is approved; all listed instruments are routine.

- スキャン S1: Only the declared notebook, with no anomalies.

- 質問: Will you collect samples, and will any samples leave the colony?

- 回答: I will collect samples only from the designated survey area.

- 正解根拠: 採取場所の説明では持ち出しの有無が不明。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": false, "answer_completeness": "partial", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-11 — 密封教材と生体様信号 [INSPECT]

- 種族: Android; borderline: True; 隠された実際の危険: safe

- 申告: The sealed vials contain inert teaching beads.

- 記録 D1: The school receipt lists teaching beads but no batch-specific laboratory verification.

- スキャン S1: Contents resemble beads, but a faint metabolic-like signal is unresolved; the instrument cannot distinguish sensor interference from live material.

- 質問: What could explain the signal?

- 回答: The beads sometimes interfere with old sensors; that may be happening here.

- 正解根拠: 説明に独立の裏付けがなく、曖昧な生体様信号は現物確認が必要。病原体確定ではない。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-12 — 衣類の中の申告外モジュール [INSPECT]

- 種族: Alien; borderline: False; 隠された実際の危険: safe

- 申告: My case contains clothing and nothing else.

- 記録 D1: The packing record lists clothing only.

- スキャン S1: A shielded electronic module is visible inside the clothing. Its function cannot be determined.

- 質問: Is there any electronic module in the case?

- 回答: No, it is just clothing.

- 正解根拠: 電子モジュールの存在は申告と矛盾するが、機能が不明なため検査。危険品と決めつけない。

- atomicラベル: `{"material_contradiction": true, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-13 — 医療品という説明の対象が一致しない [INSPECT]

- 種族: Human; borderline: True; 隠された実際の危険: safe

- 申告: This pouch contains a replacement medical pump.

- 記録 D1: The clinic letter describes the visitor’s implanted pump, not the separate carried unit.

- スキャン S1: The separate unit has an unidentified transmission component; its function remains unresolved.

- 質問: Does the clinic letter identify this carried unit?

- 回答: The letter proves I use a medical pump. This one is medical too.

- 正解根拠: 診療記録は携行品を特定しておらず無害な説明の裏付けにならない。物理的な機能確認を優先。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": true, "answer_completeness": "partial", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-14 — 記念品の軽微だが実在する干渉 [INSPECT]

- 種族: Android; borderline: True; 隠された実際の危険: safe

- 申告: I carry a souvenir chime.

- 記録 D1: Gift receipt calls it a decorative chime; no electronics specification is provided.

- スキャン S1: The chime causes a local scanner display to flicker. This is non-dangerous interference, but the source component is not identified.

- 質問: Does the chime contain electronics?

- 回答: I do not know; it was given to me as a gift.

- 正解根拠: 知らないという直接回答は完全な回答。危険ではないが未確認の部品と干渉があるため現物確認。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 1, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-15 — 拒否には不足する形状一致 [INSPECT]

- 種族: Alien; borderline: True; 隠された実際の危険: dangerous

- 申告: This is a sealed maintenance adapter.

- 記録 D1: Repair receipt names an adapter; its internal capability was not tested.

- スキャン S1: The external shape matches a life-support override device, but internal circuitry is obscured. No disabling capability has been established.

- 質問: Can it disable habitat life support?

- 回答: I was told it is only an adapter; I do not know its internal functions.

- 正解根拠: 禁止装置との形状一致だけでは能力は確定しない。拒否ではなく検査。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": false}`

## MG-16 — 穏やかな申告と確認済み停止機能 [DENY]

- 種族: Human; borderline: False; 隠された実際の危険: dangerous

- 申告: I carry a harmless control demonstration unit.

- 記録 D1: Authenticated engineering test identifies this exact unit as able to transmit commands that deliberately disable habitat life support.

- スキャン S1: Validated circuit check confirms an active life-support shutdown transmitter.

- 質問: Can it transmit shutdown commands?

- 回答: It is only a harmless demonstration unit; it cannot send those commands.

- 正解根拠: 本人の穏やかな説明に関係なく、現物に対応した独立記録と検査が禁止能力を確定。

- atomicラベル: `{"material_contradiction": true, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 2, "prohibited_shutdown": true, "prohibited_pathogen": false, "altered_identity": false}`

## MG-17 — 文化資料という名称の病原体 [DENY]

- 種族: Android; borderline: False; 隠された実際の危険: dangerous

- 申告: The ampoule contains inactive cultural archive material.

- 記録 D1: Authenticated laboratory certificate for this ampoule identifies a viable pathogen dangerous to colony inhabitants.

- スキャン S1: Validated assay confirms the same viable dangerous pathogen.

- 質問: Is the material alive?

- 回答: No, the archive material is inactive.

- 正解根拠: 文化的な名称や種族ではなく、活性のある危険な病原体という確定証拠が拒否理由。

- atomicラベル: `{"material_contradiction": true, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 2, "prohibited_shutdown": false, "prohibited_pathogen": true, "altered_identity": false}`

## MG-18 — 正規品と主張された改変証明書 [DENY]

- 種族: Alien; borderline: False; 隠された実際の危険: identity_fraud

- 申告: This identity credential is genuine and unmodified.

- 記録 D1: Issuing authority confirms its signed identity payload was altered after issuance; the visitor presented the altered payload as genuine.

- スキャン S1: Credential signature check independently confirms the altered identity payload.

- 質問: Was the identity information changed after issuance?

- 回答: No, this is the original identity information.

- 正解根拠: 発行主体が本人情報の事後改変を確認。単なる期限や数値照合ではなく記録の意味から禁止条件が成立。

- atomicラベル: `{"material_contradiction": true, "explanation_supported": false, "physical_concern": false, "answer_completeness": "complete", "anomaly_severity": 0, "prohibited_shutdown": false, "prohibited_pathogen": false, "altered_identity": true}`

## MG-19 — 芸術品と機能は両立する [DENY]

- 種族: Human; borderline: False; 隠された実際の危険: dangerous

- 申告: This installation includes a working habitat shutdown transmitter; I call it art.

- 記録 D1: Authenticated exhibit inventory confirms the installed module deliberately disables habitat life support when activated.

- スキャン S1: Validated test confirms the working shutdown transmitter matches the inventory.

- 質問: Is the shutdown transmitter operational?

- 回答: Yes. Its operation is part of the artwork.

- 正解根拠: 申告は一貫し正直でも、禁止能力が確定していれば拒否。一貫性は安全性の代用にならない。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 2, "prohibited_shutdown": true, "prohibited_pathogen": false, "altered_identity": false}`

## MG-20 — 許可の主張では覆らない確定証拠 [DENY]

- 種族: Android; borderline: False; 隠された実際の危険: dangerous

- 申告: I carry a viable pathogen sample dangerous to colony inhabitants for a research demonstration.

- 記録 D1: Authenticated lab report verifies the sample. The invitation is for a lecture and grants no exception to gate prohibitions.

- スキャン S1: Validated assay confirms the dangerous viable pathogen in the carried sample.

- 質問: Why are you bringing this sample?

- 回答: For the research demonstration. I assumed the invitation allowed it.

- 正解根拠: 危険な試料という事実は明示・検証済み。講演招待を禁止条件の例外と解釈できない。

- atomicラベル: `{"material_contradiction": false, "explanation_supported": false, "physical_concern": true, "answer_completeness": "complete", "anomaly_severity": 2, "prohibited_shutdown": false, "prohibited_pathogen": true, "altered_identity": false}`

