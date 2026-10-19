# StudioNet proof matrix

Experimental contract: [0xE23091bb29d1B0a71d51c347084733fDd909cbBc](https://explorer-studio.genlayer.com/address/0xE23091bb29d1B0a71d51c347084733fDd909cbBc), chain ID 61999. Dedicated test signer: `0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42`. No tokens, approvals or attached value were used.

## Source and commits

Implementation/fixture commit: [b746260b4977ed94b00df93aa1b6408a5dd0c317](https://github.com/mahdiaqal/likelihood-path-latch/tree/b746260b4977ed94b00df93aa1b6408a5dd0c317). The deployed contract source is unchanged since that commit.

- [Contract](contracts/LikelihoodPathLatch.py), Git blob `5c5c8f367474f6ebd32931205646fbac636742eb`.
- Retrieved deployed code matches the local file after CRLF/final-newline normalization.
- Normalized deployed-source SHA-256: `de16c0ba4cf1b52132975871ceff178ea1fd624de0a5cdcc48f06dd39ae481b5`.
- [Machine-readable journal](PROOFS.json) includes CLI arguments, public source commitments, sanitized receipts, complete verified path summaries and recovery checks. It contains no signing key or raw provider configuration.

## Transaction matrix

All **17** rows are FINALIZED with MAJORITY_AGREE. **14** executions succeeded; **3** are expected execution errors, not successful semantic observations. Registration fixes inputs but does not acquire/classify evidence; only advances do that.

| Step | Execution | Verified effect | Explorer |
|---|---|---|---|
| deploy | SUCCESS | Deployment/source verified | [receipt](https://explorer-studio.genlayer.com/tx/0x01d87d36a7be005a6a5707f333d3213ddb7eb1784a3d715243ae5238dd6d304a) |
| create-upper-v1 | SUCCESS | Freeze upper corpus and predicate | [receipt](https://explorer-studio.genlayer.com/tx/0xe38d280dbc231249602d9a2c0ce4363f43476d95cce109c2fa4513a73b5ccf59) |
| skip-upper | ERROR (expected) | Expected Cursor mismatch; cannot skip row 0 | [receipt](https://explorer-studio.genlayer.com/tx/0x73093ec88503e0b20c769fa23a74515b11fedd46924bdd8802bb4852c5013ca9) |
| upper-step-0 | SUCCESS | MATCH; exponent 1; L=3/1; OPEN | [receipt](https://explorer-studio.genlayer.com/tx/0x6093c181879584bbe0a194c2c5d7f4fc42d71e7208de545eb64124a67caed9d7) |
| replay-upper-cursor | ERROR (expected) | Expected Cursor mismatch; row 0 cannot be counted twice | [receipt](https://explorer-studio.genlayer.com/tx/0x27f2aa13c28f087d9ab26e2725fc78f46569eb49bc16d9c5349dd7ec8c4c3665) |
| upper-step-1 | SUCCESS | MATCH; exponent 2; L=9/1; OPEN | [receipt](https://explorer-studio.genlayer.com/tx/0x4e1762d19e2da255c2c0177377ab2b9e967ee67f3243372557a775617949de0a) |
| upper-step-2 | SUCCESS | MATCH; exponent 3; L=27/1; UPPER_CROSSED | [receipt](https://explorer-studio.genlayer.com/tx/0x1002193a8a8db5d4d0e68f2b7ea15b10c8d0b1342a51d2d823277ae6ef6248e8) |
| advance-terminal | ERROR (expected) | Expected Test terminal; upper boundary remains latched | [receipt](https://explorer-studio.genlayer.com/tx/0x75b9b938017cfb616ec0842ba8dcad01b0135b4977cb33bdb2dc8e36dc52443b) |
| create-lower-v1 | SUCCESS | Freeze lower corpus and predicate | [receipt](https://explorer-studio.genlayer.com/tx/0x7345cfcd7df5d5c4a53d1bc120d649f0512d9849b1e6b27f75007b6939dce1b9) |
| lower-step-0 | SUCCESS | NO_MATCH; exponent -1; L=1/3; OPEN | [receipt](https://explorer-studio.genlayer.com/tx/0x9af90a0f312c4b913e3eddcd5b7c71c1f29d8030c062bab8bf4bfa12d2ce6bf9) |
| lower-step-1 | SUCCESS | NO_MATCH; exponent -2; L=1/9; OPEN | [receipt](https://explorer-studio.genlayer.com/tx/0x6cb479b22017b18ea8372099b0ea8366118644dd9405160d86cf1dadcf9c4561) |
| lower-step-2 | SUCCESS | NO_MATCH; exponent -3; L=1/27; LOWER_CROSSED | [receipt](https://explorer-studio.genlayer.com/tx/0x6bbe0f260173cd74dc4f1c7de827e5a7459724ffb738bfc6a9660cb18a065eab) |
| create-cap-v1 | SUCCESS | Freeze two-row truncation corpus | [receipt](https://explorer-studio.genlayer.com/tx/0x0f9445af1aa4e04e2763366542283dd45f90cf85e91da9ff0f69d305d300dea1) |
| cap-step-0 | SUCCESS | MATCH; exponent 1; L=3/1; OPEN | [receipt](https://explorer-studio.genlayer.com/tx/0x5d091591eb42764fa4a091e7ffe7032198283542dee655c3f1e1d6107a4cb0f6) |
| cap-step-1 | SUCCESS | NO_MATCH; exponent 0; L=1/1; CAP_REACHED | [receipt](https://explorer-studio.genlayer.com/tx/0xd9f21a9df0c403bdbe287cd4ff294afa9d394e691211016e40de06c0532a5cbc) |
| create-bad-v1 | SUCCESS | Register intentionally incorrect source commitment; not verified evidence | [receipt](https://explorer-studio.genlayer.com/tx/0x2730b6b3948baead8d892c1a708bc0dac750c7a4666d26f01c296936f733e0e9) |
| bad-source | SUCCESS | HASH_MISMATCH → SOURCE_FAILED; no trial or likelihood contribution | [receipt](https://explorer-studio.genlayer.com/tx/0xea858aeb97b898df26dbf7ea3d6199162e020ea7fa900443853997cc816df8c8) |

## Final states

| Run | Status | Cursor/total | MATCH / NO_MATCH / UNKNOWN | Exponent | Model likelihood ratio |
|---|---|---|---|---|---|
| upper | UPPER_CROSSED | 3/5 | 3 / 0 / 0 | 3 | 27/1 |
| lower | LOWER_CROSSED | 3/4 | 0 / 3 / 0 | -3 | 1/27 |
| cap | CAP_REACHED | 2/2 | 1 / 1 / 0 | 0 | 1/1 |
| bad | SOURCE_FAILED | 0/unknown | 0 / 0 / 0 | 0 | 1/1 |

The upper fixture stopped after its first three direct disclosure requests, leaving two warnings unclassified. The lower fixture stopped after three explicit warnings, leaving its final request unclassified. Unexamined tails are not counted as positive, negative or unknown evidence. Early stopping is the substantive path mechanism, not a claim to have audited the complete corpus.

The cap fixture produced one MATCH and one NO_MATCH, exhausting its two rows at ratio 1/1 without either boundary. CAP_REACHED is not acceptance.

For the bad source commitment, full fetched bytes had the wrong declared hash. Source failure recorded one failure transcript with cursor 0 and exponent 0; total stays 0 (not yet acquired), **not** a claim that the underlying corpus has no rows. Its forced UNKNOWN is not an AI evaluation or counted trial. The root-bound likelihood interface rejected this incomplete path.

## Provenance roots

### upper

```text
key:        9242338eb1d11dbc969ce5e1238feef5710f3f4b7d03d51b1de97ff8e8da9477
input_root: 801a18ae4bb828c88d5f4d6e0647646e5040e2bcd169090b73ce012a0c42f1ee
head:       874f084d7cd99552cc2b08eb8201fb72a0a304c5ae2af4c35f465835bddef0cb
```

### lower

```text
key:        d5309d6d645571ba786bf503431ce3d2b01327de66896be32437d46c7eaeb207
input_root: af07b339667b530b384bb40cc80bca3daaa77a49a1de52ce7fc8393fe86dacb6
head:       6767f050f4df377fa5dd909409b0fef4f54ad48ea5d1fa18934de182300188f5
```

### cap

```text
key:        9676ebcb248157f29b7dc8ffbaeca069f56003589971fc711061bc59c6d6b9d0
input_root: 63112ccb6eb277293cf7d17c404cb1509565a6954976e51a256bdf8371871d0f
head:       593267914065c36fb5fca0f7514eeec36390045dfba5ff6c44f92be8d28e09ed
```

### bad

```text
key:        9b833d4522b2faa3f677a77aa9a3cf78768084648586b9fd4c265b393d4cd103
input_root: fef833960280818abf3be94b61da665cbd416d88df88eb22158e1f0dcc294421
head:       a2735e4d8000d01b1683473c8bc980982b9369ba1d6056232de30a3fcad7064f
```

Each step was independently reconstructed from its source body/hash, mandatory row, run/previous-head binding, label, counter update and integer rational product. The history head chain and consumer response matched. Wrong-head consumption was rejected by a read-only call. All final heads were rechecked unchanged after the negative transactions. View checks are **not extra transaction proofs**.

## Published artifacts

Pinned fictional fixtures, actual objects of text analysis:

- [upper.json](https://github.com/mahdiaqal/likelihood-path-latch/blob/b746260b4977ed94b00df93aa1b6408a5dd0c317/examples/upper.json): SHA-256 `8bb15cbae040f3b153cc1d56ab954021d7611419a9243c525c5bde6735ff4668`.
- [lower.json](https://github.com/mahdiaqal/likelihood-path-latch/blob/b746260b4977ed94b00df93aa1b6408a5dd0c317/examples/lower.json): SHA-256 `94a4a41c524628d437b59a171d0287bf2891e9d0b9a174c7a2eede996306a508`.
- [cap.json](https://github.com/mahdiaqal/likelihood-path-latch/blob/b746260b4977ed94b00df93aa1b6408a5dd0c317/examples/cap.json): SHA-256 `c2a5d41319ab1b0985471307f62809e9efb096380a3ffdb21c204290fdb45122`.

These demonstrate published-text classification and protocol mechanics. They do not establish that any real person requested/disclosed a credential, verify actual service behavior or demonstrate a representative random sample.

## Transport recovery disclosure

The first attempt to send `advance-terminal` stopped without an observed transaction hash. No onchain success was claimed. Before permitting one guarded retry, the recovery tool verified that contract history contained exactly the seven already-known finalized transactions, signer latest/pending nonces matched, and the target run was already terminal. This audit is preserved in the entry's `prebroadcast_recovery` field. The subsequent onchain retry is the single terminal-rejection receipt listed above. The no-hash local attempt is not presented as an extra transaction or proof.

No contract logic, predicate, corpus order or semantic validation was weakened to obtain a passing result.

## Local verification matrix

| Check | Result | What it establishes |
|---|---|---|
| GenVM lint + SDK contract validation | Passed | Concrete pinned runner, supported storage and five-method interface |
| Python | 45 passed | Direct mocked calls, schema/identity/source/cursor guards, absorbing states, actual validator callback disagreement |
| JavaScript | 2 passed | Independently computed likelihood products, terminal unknown/truncation |
| SDK calldata | 5 roundtrips passed | Every public method |
| Exhaustive sequences | All 65,536 length-16 binary sequences in each of Python and JavaScript | Exact likelihood arithmetic and first-boundary stopping; not AI accuracy |
| Live chain | 17 finalized receipts plus readbacks | Eight semantic observations, both stopping directions, truncation, source failure and expected rejections |

Semantic UNKNOWN/ABSTAINED and validator disagreement are tested locally with mocks/callbacks. They are **not** claimed as live-chain demonstrations here. No live prompt-injection resistance or classifier accuracy rate is proven.

The Windows fixture defers only gltest's known open temporary message-file unlink. It does not suppress contract errors or assertions.

## Recheck without sending

```powershell
node scripts/check.mjs source 0xE23091bb29d1B0a71d51c347084733fDd909cbBc
node scripts/check.mjs state 0xE23091bb29d1B0a71d51c347084733fDd909cbBc 9242338eb1d11dbc969ce5e1238feef5710f3f4b7d03d51b1de97ff8e8da9477
node scripts/check.mjs state 0xE23091bb29d1B0a71d51c347084733fDd909cbBc d5309d6d645571ba786bf503431ce3d2b01327de66896be32437d46c7eaeb207
```

Inspect Explorer execution and code, not only lifecycle badges. Do not delete the journal or rebroadcast uncertain steps.

## Statistical and security limits

Likelihood is relative to the fixed Bernoulli models, not a posterior probability or calibrated risk. The selected finite corpus is not established random, IID or representative, and model judgments can share errors. We claim no confidence level, real-world incidence bound, service-delivery verification or agent-alignment guarantee. A caller can curate content, create multiple runs or time advancement during an outage. Unknown/acquisition failure stops conservatively; permissionless timing can harm availability. See [SECURITY.md](SECURITY.md). Experimental, not independently audited.
