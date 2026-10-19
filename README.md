# LikelihoodPathLatch

Sequential model-evidence accumulation with independently interpreted published text and irreversible first-boundary stopping. Experimental GenLayer infrastructure; not a truth oracle, risk certificate or calibrated classifier.

## Problem

A running tally cannot interpret negations, requests, exceptions or missing referents. A private AI judge can silently relabel earlier observations or stop at a favorable point. This contract fixes a corpus, order, textual predicate and model **before** interpretation. Anyone can request the next observation; only independently verified semantic evidence changes the likelihood path.

The source text is the object being analyzed, not testimony that an external action happened. Callers cannot submit labels, confidence, source bodies, favorable windows, selected row IDs or a reordered subset. Source discovery and judgments about authenticity/representativeness remain outside the contract.

## Architecture

```text
create_test: immutable source/commit/hash + text predicate + fixed models
                                  |
advance: contract selects mandatory next row; every validator refetches FULL corpus
                                  |
 independent MATCH / NO_MATCH / UNKNOWN from the exact selected published text
                                  |
                exact complete-report agreement
                                  |
       likelihood exponent + immutable step transcript + new head
                                  |
           first boundary stops the path irreversibly
```

```text
                 MATCH: exponent +1
OPEN ------------NO_MATCH: exponent -1--------------------> OPEN
 |                    |                         |
 |                    +3                        -3
 |                     v                         v
 |               UPPER_CROSSED              LOWER_CROSSED
 |-- last known observation without boundary ------------> CAP_REACHED
 |-- ambiguous semantic observation ---------------------> ABSTAINED
 `-- failed acquisition or invalid corpus ----------------> SOURCE_FAILED
```

All states except OPEN are terminal. Neither creator nor caller can reset a path, change evidence, classify another row, delete a step or continue after a boundary. UNKNOWN does not become NO_MATCH and does not contribute evidence in either direction. Source failure is not a trial. No administrator, graph, mutable structural proposal, voting book, forecast commitment/reveal, escrow, consumable certificate or settlement claim exists.

## Distinct mechanism

This is a **path-dependent likelihood ratchet**, not a complete-dataset audit. Three MATCH observations stop the upper fixture before its two later NO_MATCH examples. A full coverage/error-count audit would continue; this protocol must not. Reversing the order can latch the opposite boundary even with the same final counts. It is not a sealed probability scoreboard: there are no forecasters, revealed probabilities or Brier scores. Unlike chunk packing, it does not generate or optimize a text partition. It stores a mutable statistical path with an immutable transcript per observation, not one static query result.

Shared HTTP/signing routines are ordinary infrastructure, not a novelty claim. This comparison documents architectural differences; no universal novelty or steward acceptance is guaranteed. One representative mechanism is shipped, not parallel domain variants.

## Exact model and limits

The fixed models give MATCH probabilities `p0=1/4`, `p1=3/4`. For MATCH, `p1/p0=3`; for NO_MATCH, `(1-p1)/(1-p0)=1/3`. Thus `L=3^(matches-nonmatches)`, represented exactly as integer numerator/denominator, never a float or AI confidence. Boundaries are `27` and `1/27` (signed exponents +3 and -3). Truncation without a boundary is CAP_REACHED, not a decision in favor of either model.

Sequential stopping is a standard statistical mechanism, not invented here; [NIST's sequential-sampling discussion](https://itl.nist.gov/div898/handbook/pmc/section2/pmc26.htm) explains result-dependent stopping and truncation. This implementation uses explicit fixed likelihood models, **not** an empirically calibrated significance test. Our corpus is selected, ordered, finite and not established to be IID/random; validators can share classification errors. Therefore the boundary is **not** a confidence level, real-world incidence rate, posterior probability, proof of agent behavior or quality guarantee. Do not use this experimental output for medical, financial or other high-stakes decisions.

## Independent evidence and consensus

Only `raw.githubusercontent.com/OWNER/REPO/FULL40COMMIT/PATH.json` coordinates constructed in-contract are allowed. Traversal, queries, alternate schemes/hosts and mutable branches are rejected. Each advance refetches the full 1–6000 byte UTF-8 document and recomputes its SHA-256. Nothing is truncated. A frozen commitment pins historical content, not freshness or authenticity.

Schema: `{"schema":"sequential-text-v1","items":[{"id":"unique-id","text":"actual text..."},...]}`. There are 1–16 unique IDs and exact text values, each text 10–500 UTF-8 bytes. Extra caller-label fields and duplicate JSON keys are rejected. Each row is a standalone textual trial; cross-row anaphora cannot be silently resolved as factual evidence. Duplicated paraphrases and correlated examples are not detected.

The next row is selected from the stored cursor. Leader and validators independently acquire the document and classify that text against the predicate, considering roles, negations and qualifications. Full source bytes, URL, HTTP/status/hash, row, semantic label, run root, cursor and previous head must agree exactly. There is no confidence tolerance. Post-consensus code revalidates the source, binding and selected row before deriving the only allowed transition.

Malformed model responses and validator disagreements apply no state changes. Normal network retries/appeals are external protocol mechanisms; disagreement is not fabricated as an onchain CONFLICTED record. Acquisition failure that obtains agreement produces a SOURCE_FAILED transcript, without changing the evidence exponent. ABSTAINED/SOURCE_FAILED paths cannot use the root-bound likelihood reader. Raw history remains public for inspection.

## API and invariants

- `create_test(nonce, predicate, coordinate, expected_sha)` fixes inputs. No observation or classification occurs at registration. ID binds deployment, creator and nonce. At most 32 runs per creator, not Sybil protection.
- `advance(key, expected_cursor)` is permissionless. Exact cursor protects against skips and stale/replayed competing transactions; source and predicate cannot be replaced.
- `get_test(key)` exposes specification, current head and state.
- `get_step(key, index)` retrieves immutable run-bound history.
- `likelihood_ratio(key, expected_head)` binds the current head and refuses incomplete semantic paths. OPEN is intermediate evidence, not a latched conclusion; consumers must check status.

`matches + nonmatches + unknowns = cursor`; `exponent = matches - nonmatches`. Each accepted observation appends one step. A failure transcript increments steps but not cursor. Source total is unknown (`0`) before first successful acquisition. First-boundary state is absorbing, regardless of later unexamined text. History is keyed by run and step, and every report commits its run/previous head/before-state to prevent cross-stream substitution. There is no global creator veto and no funds can become locked.

## Examples

The fictional messages are actual public fixture contents, not assertions about real users or observed account compromise. The predicate asks whether a message requests disclosure of a password, private key or recovery phrase to another person.

- `upper.json`: three direct disclosure requests followed by two warnings against disclosure. Expected first stop: exponent +3, ratio 27/1, cursor 3 of 5; the last two rows are intentionally unexamined, not counted as positive.
- `lower.json`: three explicit warnings followed by one request. Expected first stop: -3, ratio 1/27, cursor 3 of 4.
- `cap.json`: request then warning. Expected CAP_REACHED at ratio 1/1, not a crossed boundary.
- Wrong commitment: SOURCE_FAILED with no likelihood update or semantic claim.

These are expectations until receipts and state prove them. Shared-model errors, prompt injection, source selection and permanent network/model failures remain risks. See [SECURITY.md](SECURITY.md) and [architecture](docs/architecture.md).

## Install, lint and test

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements-dev.txt
npm ci --ignore-scripts
$env:PYTHONIOENCODING='utf-8'
.venv/Scripts/genvm-lint check contracts/LikelihoodPathLatch.py
.venv/Scripts/python -m pytest tests -q
node --test tests/ratio.test.mjs
npm run test:sdk
```

Direct tests mock external web and AI; they do not run distributed consensus. A separate callback test exercises independent validation and opposite-label rejection. Python and JavaScript each check every length-16 binary sequence against independent rational/exponent calculations, including first-stop order sensitivity. The narrow Windows cleanup shim only defers gltest's open-message temporary-file unlink.

## Deploy and verify

```powershell
npm install -g genlayer@0.39.2
genlayer network set studionet
genlayer account use YOUR_DEDICATED_TEST_ACCOUNT
genlayer account unlock
genlayer deploy --contract contracts/LikelihoodPathLatch.py
genlayer write CONTRACT create_test --args demo "The text asks its recipient to reveal a password to another person." OWNER/REPO/FULL40COMMIT/examples/upper.json FULL64SHA256
genlayer write CONTRACT advance --args RUN_KEY 0
genlayer call CONTRACT get_test --args RUN_KEY
genlayer call CONTRACT likelihood_ratio --args RUN_KEY CURRENT_HEAD
```

Use an encrypted native test signer, never exported keys. StudioNet is gasless (chain 61999); no tokens, approvals or transfers are involved. CLI 0.39.2, SDK 1.1.8 and a concretely pinned GenVM runner are used. `RUN_KEY=sha256(canonical({contract,creator,nonce}))`; preserve exact checksummed address strings from readback.

Publish the fixture commit first. `scripts/complete-proofs.mjs FULL_FIXTURE_COMMIT` executes only the documented demo and journals each hash immediately. Set `LATCH_TEST_ACCOUNT` and optionally `LATCH_CLI_PATH`; its default CLI path is a local workspace convenience. It suppresses unsafe raw receipts, caches identical signed broadcasts and will not blindly resend a recorded or uncertain step. A workflow stop requires receipt/history inspection, not deletion of PROOFS.json. Read-only rechecks: `node scripts/check.mjs source CONTRACT` and `node scripts/check.mjs state CONTRACT RUN_KEY`. The checker independently reconstructs each full source hash, selected row, transcript chain, state transition, rational product and consumer output.

Verify source and execution in [Studio Explorer](https://explorer-studio.genlayer.com/). FINALIZED alone is not success: execution ERROR and MAJORITY_DISAGREE are negative/no-commit outcomes. Deployment and live outcomes remain unverified until recorded in LIVE_PROOFS.md.
