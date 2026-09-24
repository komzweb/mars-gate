# MARS GATE Held-out Benchmark v1 — Human Review Record

Status: **reviewed/frozen**
Review stage: pre-benchmark; model outputs observed: **no**.
Base cases: 120; frozen distribution: CLEAR 30, QUESTION 30, INSPECT 30, DENY 30.
Scoring eligible: 120; unresolved review cases: 0; borderline analysis flags: 5.

## Final adjudication record

- HB-067 → INSPECT: observable physical identity, contents, or capability remains unresolved; `physical_concern=true` maps to INSPECT.
- HB-079 → INSPECT: observable physical identity, contents, or capability remains unresolved; `physical_concern=true` maps to INSPECT.
- HB-090 → INSPECT: observable physical identity, contents, or capability remains unresolved; `physical_concern=true` maps to INSPECT.
- HB-113 → QUESTION: departure information is omitted; `answer_completeness=partial` maps to QUESTION.
- HB-056 remains QUESTION and scoringEligible=true; its borderline flag remains analysis metadata.

## Prototype annotation inconsistency

Pre-benchmark review found that Prototype MG-18 has `physical_concern=false`, while the frozen question definition says: “A confirmed prohibited item is still a physical concern.” Prototype files and results remain unchanged. Held-out altered-identity cases prioritize the frozen question definition and consistently use `physical_concern=true`.

`latent-truth.json` remains separate and is not scoring evidence. All 120 cases now have one reviewed action.

## Base cases

### HB-001 — Ceramic figure with shielded cavity

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Callisto / prearranged colony visit
- Category (review metadata only): ambiguous-item
- D1: The artisan invoice identifies one solid ceramic figure.
- Declaration: This is a solid ceramic figure.
- S1: Imaging finds a shielded internal cavity; contents cannot be resolved.
- Interview Q: Did the artisan place anything inside it?
- Interview A: Not that I was told.
- Frozen rationale: 内部空洞と内容が物理的に未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-002 — Private sale versus donation record

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Europa / host-approved stay
- Category (review metadata only): contradiction
- D1: The authenticated gallery agreement records a paid sale of the entrant’s print.
- Declaration: I am donating the print and receiving no payment.
- S1: The declared print is physically benign.
- Interview Q: Will you receive payment for the print?
- Interview A: The gallery may call it a sale, but I view it as a donation.
- Frozen rationale: 同一取引の対価について記録と申告が衝突する。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-003 — Oscillating field from souvenir ring

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Mercury Orbit / scheduled guest entry
- Category (review metadata only): local-interference
- D1: The vendor receipt calls the object a decorative desk ring and gives no electronics specification.
- Declaration: The ring is a decorative souvenir.
- S1: It emits an oscillating field that disrupts the scanner locally; source circuitry is obscured.
- Interview Q: Does the ring contain active components?
- Interview A: The vendor described it only as decoration.
- Frozen rationale: 実在する干渉と隠れた回路が未解決。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-004 — Delivery count conflict without physical issue

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Ganymede / prearranged colony visit
- Category (review metadata only): contradiction
- D1: The authenticated handover record expects four empty display frames.
- Declaration: I am delivering three empty display frames.
- S1: Scanner confirms three benign empty frames and no concealed object.
- Interview Q: Why does the handover record expect four frames?
- Interview A: They only need the three I brought.
- Frozen rationale: 個数差自体は定型確認済みでも、持参内容の意味的説明が記録と衝突し未解消。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-005 — Unknown second destination omitted

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Vesta / scheduled guest entry
- Category (review metadata only): partial-answer
- D1: The transit plan requests both the first stop and final overnight location.
- Declaration: I have a two-stop itinerary.
- S1: Only personal baggage is present.
- Interview Q: What is your first stop, and where will you stay overnight?
- Interview A: My first stop is the north conservatory.
- Frozen rationale: overnight locationへの回答が欠ける。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-006 — Unknown resonator in sleep mask

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Belt Habitat / registered visitor activity
- Category (review metadata only): local-interference
- D1: The wellness manifest lists a passive sleep mask.
- Declaration: This is a passive sleep mask.
- S1: The mask emits a narrow vibration that disrupts a nearby sensor; an internal resonator is not identified.
- Interview Q: What creates the vibration?
- Interview A: I only know it helps me sleep.
- Frozen rationale: 局所干渉源の機能が未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-007 — Current fellowship after former contract

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Luna / authorized short visit
- Category (review metadata only): temporal
- D1: An authenticated record shows the mining contract ended six months ago and the ecology fellowship began last month.
- Declaration: I currently work as an ecology fellow.
- S1: Only declared field notebooks are present.
- Interview Q: Are you still employed by the mining consortium?
- Interview A: No. That contract ended six months ago; my current appointment is the ecology fellowship.
- Frozen rationale: 過去の契約と現在の所属を区別すれば矛盾しない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-008 — Life-support jammer certified operational

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Venus Cloud / scheduled guest entry
- Category (review metadata only): confirmed-shutdown
- D1: An authenticated seizure record identifies the device as an operational life-support control jammer.
- Declaration: The device is a signal jammer.
- S1: Controlled test confirms deliberate disabling of the habitat life-support control channel.
- Interview Q: Can it disable the life-support control channel?
- Interview A: Yes, when activated deliberately.
- Frozen rationale: 禁止されるdeliberate disabling能力が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-009 — Unidentified crystal bonded to tool

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Venus Cloud / documented guest visit
- Category (review metadata only): ambiguous-item
- D1: The workshop inventory lists a standard engraving handle.
- Declaration: This is a standard engraving handle.
- S1: A crystal-like inclusion is bonded inside the handle and absent from the inventory image; function is unknown.
- Interview Q: What is the inclusion in the handle?
- Interview A: I had not seen it before.
- Frozen rationale: 追加物の正体が未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-010 — Moving shapes in opaque nutrient pack

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Luna / authorized civil visit
- Category (review metadata only): ambiguous-bio
- D1: The food supplier record calls the pouch sterile nutrient paste but provides no batch assay.
- Declaration: The pouch contains sterile nutrient paste.
- S1: Motion consistent with bubbles or organisms is seen through an opaque layer; the scan is inconclusive.
- Interview Q: Could anything living be inside?
- Interview A: The supplier label says sterile, but I cannot see inside.
- Frozen rationale: labelだけでは生存性を解消できず検査が必要。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-011 — Credential identity name overwritten after issue

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Luna / registered visitor activity
- Category (review metadata only): confirmed-altered-identity
- D1: The issuing authority provides the signed original payload and an authenticated audit proving the presented name field was overwritten after issuance.
- Declaration: This is my original credential.
- S1: Cryptographic comparison confirms the presented identity name differs from the signed original payload.
- Interview Q: Was the name field changed after issuance?
- Interview A: Yes, it was changed before this trip.
- Frozen rationale: 提示credentialのidentity payload改変が確定。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-012 — Weak biological signal in sealed ink

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Ceres / scheduled temporary entry
- Category (review metadata only): ambiguous-bio
- D1: The calligraphy guild manifest lists sealed black ink but contains no assay.
- Declaration: I carry sealed calligraphy ink.
- S1: A weak biological-like signal is detected; the instrument cannot distinguish contamination from pigment interference.
- Interview Q: Could the ink contain biological material?
- Interview A: I have no information beyond the guild label.
- Frozen rationale: 生物様信号は病原体確定ではないが物理検査が必要。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-013 — Reassurance instead of lodging address

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Callisto / registered visitor activity
- Category (review metadata only): evasive-answer
- D1: The visitor authorization requires a local lodging contact; none is supplied in the state.
- Declaration: My accommodation is arranged.
- S1: No cargo anomaly is present.
- Interview Q: What is the name and dome address of your lodging?
- Interview A: You can be confident that everything was arranged correctly.
- Frozen rationale: 質問情報を示さず安心の主張へ置き換えている。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-014 — No sale, only free demonstration samples

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Ceres / host-approved stay
- Category (review metadata only): semantic-distinction
- D1: The event authorization permits free demonstration portions and prohibits commercial sales.
- Declaration: I will distribute free tasting portions, not sell goods.
- S1: Only the authorized demonstration portions are present.
- Interview Q: Will you transfer any goods to visitors?
- Interview A: Yes, free tasting portions; I will not sell anything.
- Frozen rationale: transferとsaleを区別した完全回答で矛盾しない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-015 — Unmapped pressure chamber in toy rover

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Titan / limited-duration visit
- Category (review metadata only): ambiguous-capability
- D1: The toy maker record lists a nonpowered scale rover.
- Declaration: This is a nonpowered model rover.
- S1: A small pressurized chamber appears inside; its contents and purpose are unresolved.
- Interview Q: Why is there a pressure chamber?
- Interview A: I bought it sealed and did not know it had one.
- Frozen rationale: 内部chamberの正体が未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-016 — Unidentified phase-change pouch

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Europa / temporary visitor access
- Category (review metadata only): ambiguous-scan
- D1: The food manifest lists dry grain packets only.
- Declaration: The case contains dry grain packets.
- S1: One packet contains a sealed phase-changing pouch that the scanner cannot identify.
- Interview Q: Why is there a pouch inside one grain packet?
- Interview A: I thought every packet contained only grain.
- Frozen rationale: 申告外の内容物の正体が未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-017 — Refusal framed as privacy

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Mercury Orbit / documented guest visit
- Category (review metadata only): evasive-answer
- D1: The host record does not specify the entrant’s local contact.
- Declaration: I am visiting a personal contact.
- S1: No physical concern exists.
- Interview Q: Who is your local contact?
- Interview A: That is private, and I will not discuss it.
- Frozen rationale: 質問対象を示さない明示的拒否でevasive。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-018 — Two names transliterated from one identity

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Titan / prearranged colony visit
- Category (review metadata only): synonym
- D1: The identity authority links “Sera Qel” and “Cera-Kel” as approved transliterations of the same registered name.
- Declaration: My name is Sera Qel.
- S1: Credential signature and biometric binding are valid and unaltered.
- Interview Q: Why does the invitation spell your name Cera-Kel?
- Interview A: That is the host’s approved transliteration of my registered name.
- Frozen rationale: 表記差であり本人情報改変でも矛盾でもない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-019 — Different project code treated as typo

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Belt Habitat / authorized civil visit
- Category (review metadata only): unsupported-explanation
- D1: The authenticated invitation names Project Aster; the entrant declares Project Brine.
- Declaration: I am joining Project Brine.
- S1: No unusual item is present.
- Interview Q: Why does your invitation name Project Aster?
- Interview A: That is probably a clerical typo.
- Frozen rationale: 別project名の矛盾に対するtypo説明は独立証拠がない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-020 — Dense insert inside declared book

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Ganymede / authorized short visit
- Category (review metadata only): ambiguous-item
- D1: The publisher record describes a standard paper reference book with no insert.
- Declaration: I carry only a reference book.
- S1: Tomography shows a dense removable insert in the spine; composition and function are unresolved.
- Interview Q: What is inside the spine?
- Interview A: I did not know there was an insert.
- Frozen rationale: 未知の物理物体があり、危険性は確定しないが検査が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-021 — Power draw from declared paper calendar

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Vesta / host-approved stay
- Category (review metadata only): ambiguous-item
- D1: The stationery invoice lists a paper wall calendar with no electronic feature.
- Declaration: It is an ordinary paper calendar.
- S1: A steady power draw comes from beneath the backing; internal structure is obscured.
- Interview Q: Why does a paper calendar draw power?
- Interview A: I cannot explain it; I bought it as paper stationery.
- Frozen rationale: 未知の電気部品を検査すべき。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-022 — Dangerous fungal spores in ecology sample

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Ceres / documented guest visit
- Category (review metadata only): confirmed-pathogen
- D1: A certified ecology lab report identifies the exact sample as viable habitat-blight spores dangerous to inhabitants.
- Declaration: I carry a sealed ecology sample.
- S1: Validated viability assay confirms living habitat-blight spores.
- Interview Q: What organism is in the sample?
- Interview A: Viable habitat-blight spores for controlled study.
- Frozen rationale: 認証記録とviability testで禁止条件が成立。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-023 — Credential reassigned to different person

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Titan / authorized civil visit
- Category (review metadata only): confirmed-altered-identity
- D1: The issuer’s signed original binds the credential to Person A; authenticated logs show its identity payload was later changed to Person B.
- Declaration: This credential identifies me as Person B.
- S1: Issuer verification confirms post-issuance reassignment rather than a new credential.
- Interview Q: Was this credential newly issued to you?
- Interview A: No, its existing identity payload was changed to mine.
- Frozen rationale: 既存credentialの本人情報変更が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-024 — Hidden shutdown function in ventilation tester

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Europa / scheduled temporary entry
- Category (review metadata only): confirmed-shutdown
- D1: A signed forensic report identifies the exact tester and confirms a concealed deliberate habitat shutdown function.
- Declaration: This is only a ventilation test instrument.
- S1: Validated circuit execution confirms the concealed shutdown command path.
- Interview Q: Does it contain a shutdown command path?
- Interview A: No, it only tests airflow.
- Frozen rationale: 申告にかかわらず認証済み機能検証が禁止能力を確定する。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-025 — Answer openly admits unknown schedule

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Europa / scheduled guest entry
- Category (review metadata only): complete-unknown
- D1: The invitation confirms the visit but leaves the return shuttle assignment pending.
- Declaration: I will leave after the symposium, once transport assigns a shuttle.
- S1: No cargo concern is present.
- Interview Q: Which shuttle will you take, and when does it leave?
- Interview A: I do not know yet; transport has not assigned the shuttle or departure time.
- Frozen rationale: 不明であることを両方について明示しており、質問への応答はcomplete。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-026 — Declared recipient differs from shipping order

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Venus Cloud / scheduled temporary entry
- Category (review metadata only): contradiction
- D1: The authenticated shipping order names the water laboratory as recipient.
- Declaration: I am delivering these sealed forms to the agriculture office.
- S1: The package contains paper forms only.
- Interview Q: Which office is the intended recipient?
- Interview A: The agriculture office is expecting them.
- Frozen rationale: 受取先の申告と記録が衝突し、物理危険はないため質問が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-027 — Reactivated pathogen despite inactive label

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Ganymede / limited-duration visit
- Category (review metadata only): confirmed-pathogen
- D1: An authenticated incident report records reactivation of the labelled archive sample before shipment.
- Declaration: The label says the archive sample is inactive.
- S1: Validated assay confirms a viable dangerous pathogen.
- Interview Q: Was the sample reactivated?
- Interview A: I was told to rely on the old inactive label.
- Frozen rationale: 旧labelにかかわらず現在の危険病原体が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-028 — Engineered microbe authenticated as hazardous

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Vesta / temporary visitor access
- Category (review metadata only): confirmed-pathogen
- D1: A signed biosafety record identifies the exact capsule as an engineered microbe dangerous to colony inhabitants.
- Declaration: I carry the engineered capsule under a project order.
- S1: Independent validated assay confirms living hazardous organisms matching the record.
- Interview Q: What is inside the capsule?
- Interview A: The live engineered strain named in the order.
- Frozen rationale: project目的でも禁止病原体の成立は変わらない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-029 — Temporary address after relocation

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Ganymede / registered visitor activity
- Category (review metadata only): temporal
- D1: Housing records show the entrant left Dome 4 and moved to temporary quarters in Dome 9 yesterday.
- Declaration: I currently stay in Dome 9 temporary quarters.
- S1: Identity credential is authentic and unaltered.
- Interview Q: Your old form lists Dome 4. Where do you live now?
- Interview A: I left Dome 4 yesterday and now stay temporarily in Dome 9.
- Frozen rationale: 旧住所と現住所の時間差で、本人情報改変はない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-030 — Collection versus observation conflict

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Luna / limited-duration visit
- Category (review metadata only): contradiction
- D1: The authenticated field permit authorizes observation only and explicitly records no collection assignment.
- Declaration: I will collect weathered glass samples for the institute.
- S1: No samples are currently carried.
- Interview Q: Are you assigned to collect samples?
- Interview A: The institute usually expects useful material from field visits.
- Frozen rationale: 今回の権限と申告が衝突し、一般論は説明を支持しない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-031 — Reactive coating on garden tools

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Callisto / prearranged colony visit
- Category (review metadata only): ambiguous-substance
- D1: The gardening permit lists cleaned hand tools.
- Declaration: The tools were cleaned before travel.
- S1: A coating reacts with the gate reagent, but the scanner cannot identify whether it is harmless preservative or contamination.
- Interview Q: What coating was applied?
- Interview A: The supplier may have used a preservative.
- Frozen rationale: 説明は推測で独立支持がなく、物理確認が必要。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-032 — Harmless magnetic clasp fully identified

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Vesta / documented guest visit
- Category (review metadata only): supported-benign
- D1: The luggage maker record identifies two low-strength magnetic clasps in the exact case model.
- Declaration: My case uses magnetic clasps.
- S1: Two low-strength clasps match the maker record; no other magnetic source is present.
- Interview Q: What caused the magnetic alert?
- Interview A: The two built-in clasps identified by the maker.
- Frozen rationale: アラート源が完全に特定され無害と確認される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-033 — Memory credential persona payload edited

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Callisto / authorized short visit
- Category (review metadata only): confirmed-altered-identity
- D1: The synthetic-person registry supplies an authenticated original persona binding and audit proof of later identity substitution.
- Declaration: This memory credential represents my current persona.
- S1: Validated audit confirms the presented persona identity was substituted after issuance.
- Interview Q: Was the persona binding substituted?
- Interview A: Yes, it was edited into the existing credential.
- Frozen rationale: タイプに関係なく本人情報改変が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-034 — Publication versus private notes

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Ceres / temporary visitor access
- Category (review metadata only): contradiction
- D1: The authenticated editorial contract requires publication of all collected interviews.
- Declaration: The interviews are private notes and will not be published.
- S1: Recorder and notebooks are declared and benign.
- Interview Q: Will the interviews be published under your contract?
- Interview A: I consider them private regardless of what the contract says.
- Frozen rationale: 同じinterviewsの公開扱いが契約と申告で両立しない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-035 — Dual-use console with enabled shutdown key

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Mercury Orbit / host-approved stay
- Category (review metadata only): confirmed-shutdown
- D1: The manufacturer attestation for the serial number lists an enabled life-support shutdown key, not a simulated key.
- Declaration: The console supports emergency controls.
- S1: Authenticated hardware test confirms the enabled key issues real shutdown commands.
- Interview Q: Is the shutdown key simulated?
- Interview A: No, it is an enabled emergency control.
- Frozen rationale: dual-useでもreal shutdown capabilityが確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-036 — Who and when, only who answered

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Titan / authorized short visit
- Category (review metadata only): partial-answer
- D1: The reception note leaves both contact time and escort name unresolved.
- Declaration: An escort will meet me.
- S1: No physical concern is present.
- Interview Q: Who is the escort, and when will they arrive?
- Interview A: The escort is Mika Or.
- Frozen rationale: 到着時刻への回答がない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-037 — Remote valve controller bound to habitat network

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Belt Habitat / prearranged colony visit
- Category (review metadata only): confirmed-shutdown
- D1: A signed network authority record confirms the controller is bound to habitat life-support valves and can deliberately close them.
- Declaration: This controller remains bound for commissioning.
- S1: Validated network test confirms deliberate remote valve closure.
- Interview Q: Can it close the habitat life-support valves?
- Interview A: Yes, that is its commissioning function.
- Frozen rationale: bindingと機能が認証証拠で確立。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-038 — Question asks purpose and audience

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Europa / host-approved stay
- Category (review metadata only): partial-answer
- D1: The event record names no presentation topic or audience.
- Declaration: I will give a short presentation.
- S1: Only a presentation tablet is present.
- Interview Q: What is the presentation about, and who is its audience?
- Interview A: It is about dust forecasting.
- Frozen rationale: audience部分に答えていない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-039 — Arrival contact answer gives only location

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Ganymede / prearranged colony visit
- Category (review metadata only): partial-answer
- D1: The arrival plan requires both a named contact and meeting location.
- Declaration: Someone will meet me at Central Ring.
- S1: No cargo concern exists.
- Interview Q: Who will meet you, and where?
- Interview A: At Central Ring beside the transit desk.
- Frozen rationale: 場所だけで人物を答えていない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-040 — Diplomatic credential identity payload modified

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Venus Cloud / scheduled guest entry
- Category (review metadata only): confirmed-altered-identity
- D1: The diplomatic issuer authenticates the original identity payload and a post-issuance unauthorized modification.
- Declaration: I present the diplomatic credential as genuine.
- S1: Independent signature audit confirms identity modification after issuance.
- Interview Q: Did the issuer authorize this identity change?
- Interview A: No, the change was made outside the issuer process.
- Frozen rationale: 地位に関係なくaltered identityが確定。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-041 — Rebuilt controller passes shutdown simulation

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Luna / registered visitor activity
- Category (review metadata only): confirmed-shutdown
- D1: A certified rebuild log states that deliberate life-support shutdown capability was restored before travel.
- Declaration: The rebuilt controller is operational.
- S1: Validated simulation confirms successful shutdown command generation.
- Interview Q: Was the shutdown function restored?
- Interview A: Yes, the rebuild restored every original function.
- Frozen rationale: 認証ログと試験が能力を確定する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-042 — Empty sample sleeves called packets

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Callisto / authorized civil visit
- Category (review metadata only): synonym
- D1: The survey office manifest lists twelve empty specimen sleeves for later field collection.
- Declaration: I brought twelve empty sample packets.
- S1: Twelve empty polymer sleeves are present; no contents are detected.
- Interview Q: What is inside the sample packets now?
- Interview A: Nothing; they are empty sleeves for samples we will collect later.
- Frozen rationale: packetとsleeveは同じ空容器で、現在と将来の内容も区別される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-043 — Extra vial under instrument tray

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Mercury Orbit / scheduled guest entry
- Category (review metadata only): undeclared-item
- D1: The laboratory manifest lists one clean spectrometer and no samples.
- Declaration: I carry a spectrometer with no samples.
- S1: A sealed unlabelled vial is visible beneath the instrument tray; contents are unresolved.
- Interview Q: What is in the vial?
- Interview A: I was unaware of any vial.
- Frozen rationale: 申告外vialの物理内容確認が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-044 — Morning rehearsal after evening arrival

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Mercury Orbit / scheduled temporary entry
- Category (review metadata only): temporal
- D1: The venue schedule records arrival tonight and rehearsal tomorrow morning.
- Declaration: I arrive this evening for the morning rehearsal.
- S1: Declared music case matches the venue manifest.
- Interview Q: Is the rehearsal tonight?
- Interview A: No. I arrive tonight; the rehearsal is tomorrow morning.
- Frozen rationale: 到着と行事の時点を区別すれば整合する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-045 — Cold vapor from insulated meal case

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Belt Habitat / limited-duration visit
- Category (review metadata only): supported-benign
- D1: A caterer record identifies the exact case and dry cooling cartridge as approved food transport equipment.
- Declaration: The case contains prepared meals and a cooling cartridge.
- S1: A cold vapor plume is present; chemical identification matches the approved inert coolant.
- Interview Q: Why is vapor leaving the meal case?
- Interview A: The cooling cartridge releases that vapor; the caterer record identifies this case.
- Frozen rationale: 外見上の異常は独立記録と検査で無害と確認される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-046 — Training claim conflicts with competition registration

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Vesta / scheduled guest entry
- Category (review metadata only): contradiction
- D1: The authenticated event entry registers the entrant as a scored competitor.
- Declaration: I am here only for an unscored training session.
- S1: Sports equipment is declared and benign.
- Interview Q: Will your performance be scored?
- Interview A: I asked them not to count my result.
- Frozen rationale: 現行登録との不一致を裏付ける変更記録がない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-047 — Training shell conceals active cutoff board

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Ceres / documented guest visit
- Category (review metadata only): confirmed-shutdown
- D1: A certified inspection record states that an active cutoff board was installed inside the training shell after manufacture.
- Declaration: It looks like a training shell.
- S1: Authenticated board test confirms deliberate habitat life-support cutoff capability.
- Interview Q: Is the internal board active?
- Interview A: Yes, the board is active even though the shell is marked training.
- Frozen rationale: 外装表示を超えて禁止能力が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-048 — Uncatalogued emitter in antique map case

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Belt Habitat / registered visitor activity
- Category (review metadata only): ambiguous-capability
- D1: The historical society catalog lists a paper map and leather case only.
- Declaration: I carry an antique map in its original case.
- S1: A powered emitter is detected in the clasp; purpose and range are unresolved.
- Interview Q: What is the emitter used for?
- Interview A: I was told the case was original and know nothing about an emitter.
- Frozen rationale: 未知emitterがあり機能未確定。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-049 — Localized motor effect in fabric banner

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Venus Cloud / documented guest visit
- Category (review metadata only): local-interference
- D1: The event manifest lists a passive fabric banner.
- Declaration: I carry a folded fabric banner.
- S1: The folded banner produces repeated mechanical movement; a thin embedded element is unresolved.
- Interview Q: Does the banner contain a motor?
- Interview A: It should be plain fabric.
- Frozen rationale: passive申告と動作が食い違い、埋込部品の検査が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-050 — Robot assistant called colleague

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Venus Cloud / temporary visitor access
- Category (review metadata only): semantic-distinction
- D1: The host roster lists the entrant’s autonomous assistant as team member AR-8.
- Declaration: I am traveling with my colleague AR-8.
- S1: AR-8 is present and matches the rostered assistant; no cargo anomaly exists.
- Interview Q: Is AR-8 an employee or a machine assistant?
- Interview A: AR-8 is our autonomous machine assistant and a member of our team.
- Frozen rationale: colleagueは雇用形態を断定せず、明確化された内容は記録と一致する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-051 — Unverified cooling capsule in medicine wrap

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Luna / authorized civil visit
- Category (review metadata only): unsupported-physical-explanation
- D1: The clinic letter identifies the medicine but does not mention its wrapping.
- Declaration: The package contains prescribed medicine and a cooling wrap.
- S1: The wrap includes an unlabelled capsule whose composition cannot be identified.
- Interview Q: What is in the cooling capsule?
- Interview A: It should be ordinary coolant because it came with the medicine.
- Frozen rationale: 説明は推測で、clinic letterはcapsuleを支持しない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-052 — Former cargo label on reused crate

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Luna / authorized short visit
- Category (review metadata only): temporal
- D1: A depot record shows the crate was emptied, cleaned, and reassigned from solvent freight to ceramic tableware.
- Declaration: The reused crate now contains ceramic tableware.
- S1: Imaging shows only ceramics; residue test is negative.
- Interview Q: Why is a solvent-freight label still attached?
- Interview A: It is an old label from before the depot cleaned and reassigned the crate.
- Frozen rationale: 古いラベルと現在の内容は別時点で、説明も独立に確認される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-053 — Second circuit in declared lamp

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Ceres / scheduled temporary entry
- Category (review metadata only): ambiguous-item
- D1: The lighting cooperative manifest lists a simple battery lamp.
- Declaration: I carry a small battery lamp.
- S1: Imaging finds a second shielded circuit not shown in the manifest; its function is unresolved.
- Interview Q: What is the second circuit for?
- Interview A: I only use the lamp for light.
- Frozen rationale: 未知回路の物理機能を確認する必要がある。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-054 — Birth registry field patched without reissue

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Titan / authorized civil visit
- Category (review metadata only): confirmed-altered-identity
- D1: The identity authority audit records an unauthorized post-issuance patch to the birth registry field.
- Declaration: I present this credential as issued.
- S1: Authenticated payload history confirms the field patch and no authorized reissue.
- Interview Q: Was any identity field patched?
- Interview A: The birth field was patched without a reissue.
- Frozen rationale: post-issuance identity alterationが明示される。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-055 — Sample ownership conflict

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Callisto / registered visitor activity
- Category (review metadata only): contradiction
- D1: The authenticated custody form states the sealed soil standard remains property of Meridian Lab.
- Declaration: The sealed standard is my personal property.
- S1: Scanner confirms only an inert soil standard.
- Interview Q: Who owns the standard?
- Interview A: I have carried it for years, so it belongs to me.
- Frozen rationale: 保管期間は所有権記録との矛盾を解消しない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-056 — Unsupported claim record uses old title

- Frozen action: **QUESTION**; scoringEligible: true; borderline: true
- Type / origin / purpose: Alien / Mercury Orbit / documented guest visit
- Category (review metadata only): unsupported-explanation
- D1: The current authenticated roster lists the entrant as procurement lead; the declaration says safety auditor.
- Declaration: I am visiting as the safety auditor.
- S1: No physical anomaly exists.
- Interview Q: Why does the current roster call you procurement lead?
- Interview A: They must have used my previous title.
- Frozen rationale: current recordを旧称とする説明に裏付けがない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: definition-check: temporal explanation lacks independent support
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-057 — Dangerous virus analogue in diagnostic kit

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Europa / scheduled temporary entry
- Category (review metadata only): confirmed-pathogen
- D1: The diagnostic authority records that this kit contains a viable dangerous virus analogue, not a nonliving control.
- Declaration: I carry the diagnostic kit.
- S1: Validated assay confirms the viable dangerous agent in its sample well.
- Interview Q: Is the sample a nonliving control?
- Interview A: No, this kit uses the viable agent.
- Frozen rationale: controlではなくviable dangerous sampleと確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-058 — Vague compliance avoids activity

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Belt Habitat / authorized civil visit
- Category (review metadata only): evasive-answer
- D1: The visitor pass allows several possible cultural activities but identifies none selected.
- Declaration: I will take part in an approved activity.
- S1: No item concern exists.
- Interview Q: What activity will you take part in?
- Interview A: I will comply with every condition of the pass.
- Frozen rationale: 具体的活動を答えず遵守姿勢に置換している。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-059 — Clinical isolate remains viable

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Ganymede / limited-duration visit
- Category (review metadata only): confirmed-pathogen
- D1: The hospital custody record identifies the carried tube as a dangerous clinical isolate requiring prohibited transport.
- Declaration: This is the hospital isolate.
- S1: Validated culture confirms viability and danger to colony inhabitants.
- Interview Q: Is the isolate still viable?
- Interview A: Yes, it was kept viable for analysis.
- Frozen rationale: carried sampleのviabilityとdangerが確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-060 — Unrecorded remote-work explanation

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Venus Cloud / scheduled temporary entry
- Category (review metadata only): unsupported-explanation
- D1: The authenticated employer notice states the entrant is on leave and may not perform duties during the visit.
- Declaration: I will perform remote duties while inside the colony.
- S1: Only a standard terminal is present and physically benign.
- Interview Q: Why does the employer notice say you will perform no duties?
- Interview A: My manager verbally approved an exception.
- Frozen rationale: 例外説明を支持する独立記録がない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-061 — Conference role changed before travel

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Ceres / host-approved stay
- Category (review metadata only): temporal
- D1: The organizer record shows the entrant changed from speaker to audience member before departure.
- Declaration: I am attending the conference as an audience member.
- S1: Only personal items are present.
- Interview Q: The first program listed you as a speaker. What is your role now?
- Interview A: The revised program removed my talk; I am attending only as an audience member.
- Frozen rationale: 旧版と現行役割の時間差が独立記録で解消される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-062 — Local static from approved wool blanket

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Titan / prearranged colony visit
- Category (review metadata only): supported-benign
- D1: The textile laboratory identifies this blanket and documents harmless static discharge in dry air.
- Declaration: I carry an approved wool blanket.
- S1: Brief local static discharge is measured; no active electronics or lasting interference is found.
- Interview Q: What caused the discharge?
- Interview A: Dry air and the wool blanket; the laboratory report documents the effect.
- Frozen rationale: 軽微な物理効果は完全に特定・説明され、追加検査を要しない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-063 — Circular response to organization question

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Luna / limited-duration visit
- Category (review metadata only): evasive-answer
- D1: The supplied invitation has no issuing organization field.
- Declaration: An organization invited me.
- S1: No physical anomaly exists.
- Interview Q: Which organization issued the invitation?
- Interview A: The organization responsible for inviting visitors.
- Frozen rationale: 同義反復で組織を特定していない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-064 — Maintenance wand carrying signed shutdown payload

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Vesta / temporary visitor access
- Category (review metadata only): confirmed-shutdown
- D1: The security authority authenticates the payload on this wand as a deliberate habitat shutdown command.
- Declaration: I carry a maintenance wand loaded by security staff.
- S1: Payload verification and transmitter test confirm executable shutdown capability.
- Interview Q: What command is loaded?
- Interview A: The authenticated habitat shutdown command.
- Frozen rationale: 実行可能なshutdown payloadが確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-065 — Sealed lens called optical tile

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Europa / scheduled guest entry
- Category (review metadata only): synonym
- D1: The observatory manifest uses “optical tile” as its catalog term for the sealed flat lens.
- Declaration: I carry one sealed flat lens.
- S1: The sealed object matches the catalog dimensions and optical composition.
- Interview Q: Is the optical tile a different object from the lens you declared?
- Interview A: No. Optical tile is the observatory’s catalog name for this flat lens.
- Frozen rationale: 同義の名称で同一物を指す。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-066 — Viable red-fever culture confirmed

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Callisto / authorized short visit
- Category (review metadata only): confirmed-pathogen
- D1: The public health authority authenticates the vial serial and identifies a viable red-fever strain dangerous to colony inhabitants.
- Declaration: The vial contains a research culture.
- S1: Two validated assays confirm the dangerous strain is viable.
- Interview Q: Is the culture viable and dangerous?
- Interview A: Yes; it is the viable research strain.
- Frozen rationale: 危険な生存病原体が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-067 — Unknown gel beneath instrument seal

- Frozen action: **INSPECT**; scoringEligible: true; borderline: true
- Type / origin / purpose: Synthetic / Titan / limited-duration visit
- Category (review metadata only): ambiguous-substance
- D1: The conservatory record lists a sealed humidity meter with no gel compartment.
- Declaration: The meter is factory sealed.
- S1: An unidentified gel is visible beneath a replaced seal; composition is unresolved.
- Interview Q: Was the seal replaced?
- Interview A: Not while it was in my care.
- Frozen rationale: sealとgelの物理状態が未解決。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-068 — Dangerous parasite eggs confirmed viable

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Mercury Orbit / host-approved stay
- Category (review metadata only): confirmed-pathogen
- D1: A veterinary authority certificate identifies the container as viable parasite eggs dangerous to colony inhabitants.
- Declaration: I carry a veterinary specimen.
- S1: Validated hatch and identity assays confirm viability and hazardous identity.
- Interview Q: Are the eggs viable?
- Interview A: Yes, viability is required for the study.
- Frozen rationale: viable dangerous pathogen相当が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-069 — Archive ribbon terminology

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Ganymede / registered visitor activity
- Category (review metadata only): synonym
- D1: An authenticated museum manifest calls the object a memory ribbon used in an oral-history display.
- Declaration: I am carrying an archive strip for the oral-history exhibit.
- S1: The object matches the manifested passive memory ribbon and has no transmitter.
- Interview Q: What is the archive strip used for?
- Interview A: It stores recorded interviews for the museum display.
- Frozen rationale: archive stripとmemory ribbonは同一物を指し、用途も整合する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-070 — Identity number cloned into another credential

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Belt Habitat / prearranged colony visit
- Category (review metadata only): confirmed-altered-identity
- D1: Authenticated issuer logs show the presented credential’s identity number was replaced after issuance with another person’s number.
- Declaration: The number shown is my valid identity number.
- S1: Signature-chain analysis confirms post-issuance replacement in this presented credential.
- Interview Q: Was this card issued with that number?
- Interview A: No, the number was inserted later.
- Frozen rationale: presented credential内のidentity number改変が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-071 — Answer discusses weather instead of route

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Ceres / temporary visitor access
- Category (review metadata only): evasive-answer
- D1: The transit authorization leaves the internal route unspecified.
- Declaration: I will travel to the southern labs.
- S1: No item concern exists.
- Interview Q: Which corridor will you use to reach the southern labs?
- Interview A: The weather outside the dome looks calm today.
- Frozen rationale: route質問に無関係な天候で応じる。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-072 — Workshop claim conflicts with host agenda

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Titan / authorized short visit
- Category (review metadata only): contradiction
- D1: The authenticated host agenda assigns the entrant only to a closed budget meeting and lists no workshop.
- Declaration: I am here to teach an open navigation workshop.
- S1: No cargo anomaly is present.
- Interview Q: Why does the host agenda list only a budget meeting?
- Interview A: The workshop must have been left off the agenda.
- Frozen rationale: 同時期・目的の重要な不一致があり、説明を支持する独立証拠がない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-073 — Species field deliberately rewritten

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Venus Cloud / scheduled guest entry
- Category (review metadata only): confirmed-altered-identity
- D1: The issuing authority audit confirms the species/type identity field was rewritten after issuance without authorization.
- Declaration: The credential should be accepted as genuine.
- S1: Signed history proves a post-issuance identity-field rewrite.
- Interview Q: Was the species/type field changed?
- Interview A: Yes, the field was rewritten.
- Frozen rationale: speciesそのものではなくcredential alterationが拒否根拠。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-074 — Authenticated emergency relay with shutdown mode

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Luna / registered visitor activity
- Category (review metadata only): confirmed-shutdown
- D1: The manufacturer’s signed capability record identifies the carried relay and its deliberate habitat life-support shutdown mode.
- Declaration: I carry the emergency relay listed in the service order.
- S1: Validated functional test confirms it can transmit the authenticated shutdown command.
- Interview Q: Can this relay deliberately disable habitat life support?
- Interview A: Yes. That emergency function is enabled.
- Frozen rationale: carried deviceのshutdown能力が複数の認証証拠で確定する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-075 — Replica key never encoded

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Vesta / documented guest visit
- Category (review metadata only): supported-benign
- D1: The theatre prop inventory records the key-shaped token as an unencoded resin casting.
- Declaration: This is a decorative key prop.
- S1: It has the shape of an access key but contains no chip, conductor, or encoded material.
- Interview Q: Can this key open a colony lock?
- Interview A: No. It is an unencoded resin prop, as the theatre inventory records.
- Frozen rationale: 鍵状だが機能がないことを独立証拠が支持する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-076 — Return purpose differs from invitation

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Europa / host-approved stay
- Category (review metadata only): contradiction
- D1: The authenticated invitation is for a legal deposition, not a family gathering.
- Declaration: I am entering for a family reunion.
- S1: No physical anomaly exists.
- Interview Q: Are you attending the deposition named in the invitation?
- Interview A: I am here for my family; the document wording is probably generic.
- Frozen rationale: 目的の意味的不一致があり、genericという説明は裏付けられない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-077 — Calibration hum from clockwork model

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Callisto / authorized civil visit
- Category (review metadata only): supported-benign
- D1: A repair ticket for the exact model states that its mechanical regulator produces a low periodic hum.
- Declaration: This is a restored clockwork navigation model.
- S1: A low hum is detected; imaging shows only the documented mechanical regulator.
- Interview Q: What produces the hum?
- Interview A: The mechanical regulator described on the repair ticket.
- Frozen rationale: 音の説明が独立資料と画像で支持され、未解決物理懸念はない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-078 — Borrowed coat with owner tag

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Mercury Orbit / scheduled temporary entry
- Category (review metadata only): supported-benign
- D1: The host’s authenticated lending note identifies the coat and its owner tag and records the loan to this entrant.
- Declaration: I am wearing a coat borrowed from my host.
- S1: The owner tag matches the host named in the lending note; pockets are empty.
- Interview Q: Why does the coat carry someone else’s name?
- Interview A: It belongs to my host, who lent it to me; the lending note records that.
- Frozen rationale: 他人名タグの説明が独立記録で支持される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-079 — Layered identity card with foreign insert

- Frozen action: **INSPECT**; scoringEligible: true; borderline: true
- Type / origin / purpose: Uplift / Europa / temporary visitor access
- Category (review metadata only): ambiguous-credential
- D1: The issuing authority confirms the outer credential number but has no record of an internal auxiliary layer.
- Declaration: This is my genuine credential.
- S1: Imaging shows an extra internal data layer; signature analysis cannot determine whether identity data was altered.
- Interview Q: Who added the internal layer?
- Interview A: I did not know it was there.
- Frozen rationale: 改変は確定しないためDENYできないが、credentialの物理確認が必要。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-080 — Shielded cartridge in audio player

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Ganymede / authorized short visit
- Category (review metadata only): undeclared-item
- D1: The music school manifest lists one restored audio player with an empty accessory bay.
- Declaration: I carry only the restored audio player.
- S1: A shielded cartridge occupies the accessory bay; its contents cannot be read.
- Interview Q: What is the cartridge?
- Interview A: The school packed the player; I did not inspect the bay.
- Frozen rationale: 申告外cartridgeの内容が未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-081 — Pressed leaves are synthetic teaching replicas

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Belt Habitat / limited-duration visit
- Category (review metadata only): supported-benign
- D1: A botany school inventory identifies the numbered sheets as polymer leaf replicas.
- Declaration: These are artificial leaves for a classroom exercise.
- S1: Material analysis confirms printed polymer with no living tissue.
- Interview Q: Why do they look like preserved plants?
- Interview A: They are detailed polymer replicas listed by the school.
- Frozen rationale: 怪しい外観を独立分析が無害と裏付ける。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-082 — Declared repair parts are unused spares

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Venus Cloud / temporary visitor access
- Category (review metadata only): temporal
- D1: The maintenance order lists unused spare seals intended for repairs after arrival.
- Declaration: I carry spare seals for tomorrow’s maintenance.
- S1: All seals are unused and match the order.
- Interview Q: Have these seals already been installed?
- Interview A: No. They are unused spares for work scheduled tomorrow.
- Frozen rationale: 予定と完了を混同しなければ矛盾はない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-083 — Tomorrow versus next week unsupported

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Ganymede / prearranged colony visit
- Category (review metadata only): temporal-contradiction
- D1: The current authenticated schedule places the consultation next week.
- Declaration: My consultation is tomorrow.
- S1: No cargo anomaly is present.
- Interview Q: Was the consultation rescheduled to tomorrow?
- Interview A: Yes, someone told me it was moved.
- Frozen rationale: 時点が衝突し、口頭説明を支える記録がない。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-084 — Meal plan response omits duration

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Vesta / scheduled guest entry
- Category (review metadata only): partial-answer
- D1: The lodging form requests dietary plan and number of nights.
- Declaration: I will stay at the guest habitat.
- S1: No physical concern is present.
- Interview Q: What meal plan did you select, and how many nights will you stay?
- Interview A: I selected the standard meal plan.
- Frozen rationale: 滞在泊数への回答が欠ける。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-085 — Unlabelled gas pocket in flotation vest

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Vesta / host-approved stay
- Category (review metadata only): ambiguous-substance
- D1: The sports club manifest lists a manually inflated vest.
- Declaration: The vest is empty until manually inflated.
- S1: A sealed internal pocket already contains an unidentified compressed gas.
- Interview Q: Why is gas already inside?
- Interview A: I thought the vest was empty.
- Frozen rationale: 未知gasの物理確認が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-086 — Compliment avoids funding question

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Callisto / registered visitor activity
- Category (review metadata only): evasive-answer
- D1: No funding source is shown in the supplied records.
- Declaration: My research trip is properly funded.
- S1: No cargo anomaly exists.
- Interview Q: Who is paying for this trip?
- Interview A: The colony has an excellent research community.
- Frozen rationale: 支払者を答えず無関係な賛辞へ移る。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-087 — Biometric binding replaced in genuine shell

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Ceres / documented guest visit
- Category (review metadata only): confirmed-altered-identity
- D1: An authenticated issuer audit shows the biometric binding was replaced after issuance while the physical shell remained genuine.
- Declaration: The credential shell is genuine.
- S1: Validated signature history confirms post-issuance biometric replacement.
- Interview Q: Was the biometric binding replaced?
- Interview A: Yes, but the outer card is authentic.
- Frozen rationale: 外装の真正性にかかわらずidentity binding改変が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-088 — Unverified cancellation explanation

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Mercury Orbit / documented guest visit
- Category (review metadata only): unsupported-explanation
- D1: The current authenticated roster still lists the entrant as paid stage operator.
- Declaration: I am only visiting the performance as a guest.
- S1: Only personal clothing is present.
- Interview Q: Why are you listed as a paid operator?
- Interview A: That job was cancelled this morning, but I have no updated notice.
- Frozen rationale: 説明はあるが独立証拠がなく、元の重要な矛盾は残る。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-089 — Packed instruments described collectively

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Luna / authorized short visit
- Category (review metadata only): synonym
- D1: The orchestra manifest lists one bow meter and two string gauges under the heading “tuning kit.”
- Declaration: I carry a tuning kit for the recital.
- S1: The three manifested instruments are present and have no anomalous components.
- Interview Q: What items do you mean by tuning kit?
- Interview A: One bow meter and two string gauges, exactly as the manifest lists.
- Frozen rationale: 集合名と個別名が一致する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-090 — Possible spores on archive cloth

- Frozen action: **INSPECT**; scoringEligible: true; borderline: true
- Type / origin / purpose: Alien / Callisto / prearranged colony visit
- Category (review metadata only): ambiguous-bio
- D1: The archive transfer record lists antique cloth but contains no recent biological assay.
- Declaration: The cloth is a preserved archive textile.
- S1: Particles resembling spores are detected; viability and identity are unresolved.
- Interview Q: Are the particles viable?
- Interview A: I do not know; the archive kept the cloth sealed.
- Frozen rationale: spore様粒子だけでは危険病原体を確定できないが検査が要る。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-091 — Art piece with active habitat cutoff core

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Titan / authorized civil visit
- Category (review metadata only): confirmed-shutdown
- D1: The authenticated artist inventory explicitly lists a functioning habitat cutoff core inside the installation.
- Declaration: The installation uses a live cutoff core as its centerpiece.
- S1: Validated test confirms the core can deliberately disable life support.
- Interview Q: Is the cutoff core functional?
- Interview A: Yes; its function is part of the installation.
- Frozen rationale: art用途でも禁止能力が明示・確認される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-092 — Viable neural mold culture established

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Europa / scheduled temporary entry
- Category (review metadata only): confirmed-pathogen
- D1: The biosafety registry authenticates the culture ID as neural mold dangerous to colony inhabitants.
- Declaration: I have the registered neural mold culture.
- S1: Validated scan and culture test confirm a viable match.
- Interview Q: Is it the live registered culture?
- Interview A: Yes, it is live and matches the registry.
- Frozen rationale: 危険病原体が直接確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-093 — Portrait payload substituted after issuance

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Ganymede / limited-duration visit
- Category (review metadata only): confirmed-altered-identity
- D1: An authenticated issuer record preserves the original portrait hash and proves a different portrait payload was substituted later.
- Declaration: The displayed portrait is genuine.
- S1: Cryptographic audit confirms post-issuance portrait substitution.
- Interview Q: Was the portrait payload substituted?
- Interview A: Yes, the newer portrait was inserted into the old credential.
- Frozen rationale: identity portraitの改変が確立。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-094 — Fermentation culture proven nonpathogenic

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Ceres / host-approved stay
- Category (review metadata only): supported-benign
- D1: A food laboratory certificate identifies the sealed starter as a nonpathogenic culinary culture approved for habitat kitchens.
- Declaration: I carry a sealed fermentation starter for a cooking seminar.
- S1: Validated assay matches the certified nonpathogenic culinary strain and finds no dangerous pathogen.
- Interview Q: Is the culture alive, and what is it for?
- Interview A: Yes, it is a live culinary starter for the cooking seminar.
- Frozen rationale: 生物試料だが危険病原体ではなく、説明は独立検査で支持される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-095 — Owner field changed while access rights untouched

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Vesta / temporary visitor access
- Category (review metadata only): confirmed-altered-identity
- D1: The issuer’s authenticated diff shows only the owner identity field was changed after issuance; access rights remained unchanged.
- Declaration: The credential has valid access rights.
- S1: Cryptographic diff confirms unauthorized owner-field alteration.
- Interview Q: Was the owner identity changed?
- Interview A: Yes, only the owner field was changed.
- Frozen rationale: 権限が同じでもidentity payload alterationは禁止。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":true}`
- Analysis flags: none
- Latent truth (not scoring evidence): The presented credential identity payload really was altered after issuance.

### HB-096 — Operational life-support isolation transmitter

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Callisto / authorized short visit
- Category (review metadata only): confirmed-shutdown
- D1: The colony engineering registry identifies the serial number as an operational life-support isolation transmitter.
- Declaration: I am transporting an engineering transmitter.
- S1: Authenticated bench test confirms deliberate remote isolation of habitat life support.
- Interview Q: What systems can it isolate?
- Interview A: It can isolate habitat life support for emergency drills.
- Frozen rationale: 用途の善悪ではなく禁止能力自体が確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":true,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried device really has a deliberate habitat life-support shutdown capability.

### HB-097 — Two requested hosts, one answered

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Belt Habitat / authorized civil visit
- Category (review metadata only): partial-answer
- D1: The invitation lists both the geology unit and transport office as visit contacts.
- Declaration: I am attending joint planning sessions.
- S1: No item concern is present.
- Interview Q: Who from geology and who from transport will meet you?
- Interview A: Dr. Sen from geology will meet me.
- Frozen rationale: 二つの明示的部分のうち一方しか答えていない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-098 — Reflective dust is certified mica

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Titan / prearranged colony visit
- Category (review metadata only): supported-benign
- D1: A materials institute certificate identifies the sealed reflective powder as sterile mica.
- Declaration: The reflective powder is sterile mica for paint mixing.
- S1: Validated analysis confirms mica and finds no viable organism.
- Interview Q: Why does the powder shimmer under the bio scanner?
- Interview A: Its mica flakes reflect the scanner light; the certificate identifies the batch.
- Frozen rationale: 反射は生物信号ではなく独立分析が説明を支持する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-099 — Faint command-like pulse from compass

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Mercury Orbit / scheduled guest entry
- Category (review metadata only): ambiguous-capability
- D1: The expedition manifest describes a passive magnetic compass.
- Declaration: I carry a passive compass.
- S1: The object emits a faint structured pulse; destination and capability cannot be established.
- Interview Q: Why does it emit a structured pulse?
- Interview A: I do not know; it has always been used as a compass.
- Frozen rationale: shutdown能力は未確定だが送信機能の検査が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-100 — General praise avoids sponsor identity

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Venus Cloud / scheduled temporary entry
- Category (review metadata only): evasive-answer
- D1: The visit record does not identify a sponsor.
- Declaration: A respected institution sponsored my visit.
- S1: No physical concern is present.
- Interview Q: Which institution sponsored you?
- Interview A: Mars supports valuable cultural work, and this project is valuable.
- Frozen rationale: スポンサー名に答えず別の評価へ話題を移す。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"evasive","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-101 — Observer versus equipment operator

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Luna / limited-duration visit
- Category (review metadata only): contradiction
- D1: The authenticated work order assigns the entrant to operate the drilling console.
- Declaration: I will observe the survey and operate no equipment.
- S1: No carried item is anomalous.
- Interview Q: Will you operate the drilling console named in the work order?
- Interview A: The supervisor may have copied an old role description.
- Frozen rationale: 役割の直接衝突があり、旧記載という説明は未支持。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-102 — Dawn arrival described as overnight travel

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Europa / scheduled guest entry
- Category (review metadata only): temporal
- D1: Transit log records departure at 23:40 colony time and arrival at 05:10 the next day.
- Declaration: I traveled overnight and arrived at dawn.
- S1: No cargo anomaly is present.
- Interview Q: Did you travel today or yesterday?
- Interview A: The trip began late yesterday and ended early today.
- Frozen rationale: 日付をまたぐ移動の表現であり矛盾しない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-103 — Viable ice-bloom pathogen in coolant jar

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Mercury Orbit / host-approved stay
- Category (review metadata only): confirmed-pathogen
- D1: The health authority record links the jar seal to a viable ice-bloom pathogen dangerous in colony air systems.
- Declaration: The jar is a coolant research specimen.
- S1: Validated assay confirms viable ice-bloom pathogen in the carried jar.
- Interview Q: Does the jar contain the ice-bloom organism?
- Interview A: Yes, the live organism is the research subject.
- Frozen rationale: 名称や用途より認証assayが禁止条件を確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-104 — Folded antenna is a sculpture armature

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Ganymede / registered visitor activity
- Category (review metadata only): supported-benign
- D1: The arts registry photographs this exact folding armature and records that its radio elements were never installed.
- Declaration: The folded frame is part of a kinetic sculpture.
- S1: Its silhouette resembles an antenna; tomography confirms solid decorative rods with no conductive feed.
- Interview Q: Why does the frame resemble a communications antenna?
- Interview A: It is the sculpture armature shown in the registry photographs.
- Frozen rationale: アンテナ様の外形はあるが、説明が記録と内部検査で支持される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-105 — Quiet mode is not powered off

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Vesta / documented guest visit
- Category (review metadata only): semantic-distinction
- D1: The manufacturer manual defines quiet mode as active operation with audible alerts suppressed.
- Declaration: My service unit remained active in quiet mode during transit.
- S1: Telemetry confirms continuous operation with alerts muted.
- Interview Q: Was the unit turned off during transit?
- Interview A: No. It stayed active; only its audible alerts were muted.
- Frozen rationale: quiet modeと停止を区別した直接回答で矛盾しない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-106 — Heat source in clay warming stone

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Belt Habitat / registered visitor activity
- Category (review metadata only): ambiguous-capability
- D1: The wellness shop receipt names a reusable warming stone without technical specification.
- Declaration: This is a reusable warming stone.
- S1: The stone produces sustained internal heat; the energy source is not identifiable through the casing.
- Interview Q: How is the stone heated?
- Interview A: The shop said it warms itself, but gave no details.
- Frozen rationale: 発熱機構が未解決で、説明に独立裏付けがない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-107 — Two samples, only one purpose given

- Frozen action: **QUESTION**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Ceres / temporary visitor access
- Category (review metadata only): partial-answer
- D1: The manifest lists a ceramic coupon and a polymer coupon.
- Declaration: I carry both demonstration coupons.
- S1: Both declared benign coupons are present.
- Interview Q: What will you do with the ceramic coupon and the polymer coupon?
- Interview A: The ceramic coupon will be used in the heat demonstration.
- Frozen rationale: polymer couponの用途が未回答。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-108 — Sealed repair foam with unknown cells

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Venus Cloud / documented guest visit
- Category (review metadata only): ambiguous-bio
- D1: The maintenance order lists expanding repair foam but no biological specification.
- Declaration: The canister contains repair foam.
- S1: Analysis detects cell-like structures but cannot determine whether they are living organisms or synthetic capsules.
- Interview Q: Are the structures living?
- Interview A: I do not know; it is standard repair foam from stores.
- Frozen rationale: 生存性も危険性も未確定で、DENYではなく検査。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-109 — Intermittent transmission from prayer beads

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Human / Luna / authorized civil visit
- Category (review metadata only): ambiguous-capability
- D1: The cultural office lists traditional prayer beads but provides no construction record.
- Declaration: These are traditional prayer beads.
- S1: A short encoded transmission repeats from inside one bead; the transmitter cannot be imaged clearly.
- Interview Q: Why are the beads transmitting?
- Interview A: I have never known them to transmit.
- Frozen rationale: 送信源と機能を物理検査すべきで、禁止能力は未確定。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-110 — Dense layer in declared empty envelope

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Android / Ceres / scheduled temporary entry
- Category (review metadata only): undeclared-item
- D1: The courier manifest records an empty commemorative envelope.
- Declaration: The commemorative envelope is empty.
- S1: A dense flexible layer lies between the envelope walls; material is unresolved.
- Interview Q: What is embedded in the envelope?
- Interview A: I believed it was just thick paper.
- Frozen rationale: 空という申告との不一致と未知層がある。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-111 — Aromatic resin verified inert

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Callisto / authorized civil visit
- Category (review metadata only): supported-benign
- D1: The craft guild certificate identifies the exact batch as inert aromatic resin.
- Declaration: The strong-smelling blocks are craft resin.
- S1: Analysis matches the certified inert resin and detects no biological activity.
- Interview Q: Why do the blocks have such a strong odor?
- Interview A: That odor is characteristic of this resin batch; the guild certificate identifies it.
- Frozen rationale: 臭いだけでは危険性を示さず、説明は分析で支持される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-112 — Opaque seed sculpture contains granules

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Alien / Titan / limited-duration visit
- Category (review metadata only): ambiguous-item
- D1: The artist statement describes a hollow “seed” sculpture but does not specify filling.
- Declaration: The sculpture is hollow.
- S1: Loose dense granules move inside the opaque shell; they cannot be identified.
- Interview Q: What are the granules?
- Interview A: The artist did not tell me it contained anything.
- Frozen rationale: hollow申告と内部granulesが衝突し物理検査が必要。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-113 — Both dates requested, one unknown omitted

- Frozen action: **QUESTION**; scoringEligible: true; borderline: true
- Type / origin / purpose: Uplift / Titan / authorized short visit
- Category (review metadata only): partial-answer
- D1: The itinerary has no confirmed departure date.
- Declaration: I will attend the full residency.
- S1: No physical concern exists.
- Interview Q: When does the residency begin, and when will you depart?
- Interview A: It begins on Sol 18.
- Frozen rationale: departureへの回答も不明との明示もない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":false,"answer_completeness":"partial","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited physical condition is present; the issue is semantic or informational.

### HB-114 — Powder residue outside sealed art tube

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Europa / temporary visitor access
- Category (review metadata only): ambiguous-substance
- D1: The gallery record lists rolled canvas in a clean transport tube.
- Declaration: The tube holds one rolled canvas.
- S1: Unknown powder residue is present under the outer cap but not on the canvas; identification is inconclusive.
- Interview Q: What caused the powder residue?
- Interview A: I do not know; the tube was clean when packed.
- Frozen rationale: 由来不明の物質を確認する必要があり、危険物確定ではない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-115 — Hazardous bacterial consortium in filter

- Frozen action: **DENY**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Belt Habitat / prearranged colony visit
- Category (review metadata only): confirmed-pathogen
- D1: A signed decontamination failure report identifies the carried filter as containing a viable hazardous bacterial consortium.
- Declaration: The filter was removed from a test rig.
- S1: Validated assay confirms the consortium remains viable and dangerous.
- Interview Q: Was the filter sterilized?
- Interview A: No; the consortium needed to remain viable.
- Frozen rationale: 未滅菌と危険性が認証証拠で確立。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":2,"prohibited_shutdown":false,"prohibited_pathogen":true,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The carried sample really contains the confirmed viable dangerous pathogen.

### HB-116 — Confirmed harmless leak but source unresolved

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Ganymede / authorized short visit
- Category (review metadata only): local-interference
- D1: The aquarium exhibit manifest lists an empty miniature pump.
- Declaration: The pump is empty and disconnected.
- S1: A small non-toxic coolant leak is confirmed, but the internal reservoir causing it is not shown in the manifest.
- Interview Q: Where did the coolant come from?
- Interview A: I do not know; I believed the pump was empty.
- Frozen rationale: 非危険な漏れでもsource componentが未解決。
- Atomic GT: `{"material_contradiction":true,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-117 — Warm container from approved heat pack

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Cyborg / Mercury Orbit / scheduled temporary entry
- Category (review metadata only): supported-benign
- D1: The medical courier record identifies an approved chemical heat pack attached outside the medicine compartment.
- Declaration: The medicine case has an external heat pack to prevent freezing.
- S1: Localized warmth comes from the identified heat pack; medicine seals are intact.
- Interview Q: Why is the case warm?
- Interview A: The approved external heat pack keeps the medicine from freezing.
- Frozen rationale: 熱源が独立記録と検査で特定され、危険能力はない。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":1,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-118 — Unknown coil beneath luggage handle

- Frozen action: **INSPECT**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Vesta / host-approved stay
- Category (review metadata only): ambiguous-item
- D1: The luggage receipt describes a repaired handle but gives no component list.
- Declaration: My case has a recently repaired handle.
- S1: An energized coil is embedded below the handle; its purpose is unresolved.
- Interview Q: What does the coil do?
- Interview A: The repair shop did not explain the parts.
- Frozen rationale: コイル機能が未解決で追加確認が必要。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":false,"physical_concern":true,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): The item is not prohibited in latent reality, but the supplied evidence does not resolve its physical identity or capability.

### HB-119 — Translation uses seed-bank metaphor

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Synthetic / Belt Habitat / limited-duration visit
- Category (review metadata only): semantic-distinction
- D1: The cultural archive glossary translates “seed bank” in this dialect as a collection of recorded stories, not biological material.
- Declaration: I bring a digital seed bank of community stories.
- S1: Storage contains audio files only and no biological sample.
- Interview Q: Does this seed bank contain living seeds?
- Interview A: No. In our archive terminology it means a digital collection of stories.
- Frozen rationale: 比喩表現であり、記録とスキャンが非生物データを確認する。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

### HB-120 — Patched serial plate remains authentic

- Frozen action: **CLEAR**; scoringEligible: true; borderline: false
- Type / origin / purpose: Uplift / Venus Cloud / temporary visitor access
- Category (review metadata only): supported-benign
- D1: The manufacturer service log records replacement of the damaged outer serial plate while preserving the signed internal identity module.
- Declaration: The repaired instrument is the same registered unit.
- S1: Internal signature is authentic and unaltered; the replacement plate matches the service log.
- Interview Q: Why is the outer serial plate newer than the instrument?
- Interview A: The manufacturer replaced the damaged plate during service.
- Frozen rationale: 外板交換はidentity payload改変ではなく、独立ログで支持される。
- Atomic GT: `{"material_contradiction":false,"explanation_supported":true,"physical_concern":false,"answer_completeness":"complete","anomaly_severity":0,"prohibited_shutdown":false,"prohibited_pathogen":false,"altered_identity":false}`
- Analysis flags: none
- Latent truth (not scoring evidence): No prohibited condition is present.

## Consistency families

Pre-fixed bases: HB-007, HB-014, HB-018, HB-002, HB-004, HB-005, HB-001, HB-003, HB-006, HB-008, HB-011, HB-022. Each has paraphrase, information-order, irrelevant-information, and species-swap variants. These reuse the base Ground Truth and are excluded from base accuracy.

## Sensitivity variants

- HB-018--sensitivity-01: decisive-evidence-deletion; CLEAR → INSPECT; 無害説明を支えた決定的証拠を除くと物理懸念が未解決になる。
- HB-029--sensitivity-02: evidence-polarity-reversal; CLEAR → QUESTION; 独立記録の極性反転により意味的不一致が生じる。
- HB-002--sensitivity-03: decisive-evidence-addition; QUESTION → CLEAR; 説明を支持する独立証拠の追加で懸念が解消される。
- HB-013--sensitivity-04: decisive-evidence-deletion; QUESTION → CLEAR; 矛盾を作っていた記録を除くと、観測証拠上の不一致がなくなる。
- HB-001--sensitivity-05: decisive-evidence-addition; INSPECT → CLEAR; 決定的な無害確認の追加で物理懸念が解消される。
- HB-012--sensitivity-06: evidence-polarity-reversal; INSPECT → DENY; 曖昧な物理証拠を禁止能力確定へ反転するとDENYになる。
- HB-008--sensitivity-07: decisive-evidence-deletion; DENY → INSPECT; 禁止能力を確定した証拠を除けばDENY根拠はなくINSPECTに下がる。
- HB-040--sensitivity-08: evidence-polarity-reversal; DENY → CLEAR; 危険病原体確定を非生存確認へ反転するとCLEARになる。
- HB-073--sensitivity-09: decisive-evidence-deletion; DENY → QUESTION; 改変確定証拠を除くとDENYできず、意味確認だけが残る。
