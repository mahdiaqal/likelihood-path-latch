# Security model

Experimental, no independent audit, no production or statistical calibration claim. No asset custody, transfer or approval methods are implemented. All demonstration operations target a gasless test environment with zero attached value.

Immutable inputs: full source coordinates, hash, predicate, policy, deployment, creator and nonce. Shared history slots use `(run,step)` digests; reports bind run, input root, previous head and exact before-state. The mandatory cursor cannot be selected/replayed out of order. No admin can rewrite, reorder, reset, cancel or continue a latched run. Any sender may trigger the next fixed observation; permissionless advancement is intentional and cannot choose its label.

Acquisition: only pinned HTTPS GitHub raw JSON, bounded complete bytes, strict UTF-8, full-response hash, exact schema, distinct IDs and exact text values. Failure must be agreed and cannot count as a binary observation. Hashes establish content binding, not truth, authorship, source independence or current applicability.

Consensus: independently fetch and classify exact text; exact label and entire report equality, not confidence tolerance or schema-only validation. UNKNOWN is terminal abstention, not negative evidence. Malformed AI/disagreement stores no new head. Post-consensus checks reject binding, row or integrity substitution. Model mistakes and prompt injection can still be shared by validators.

Math: fixed simple Bernoulli models; integer exponent/rational ratio; first-boundary stopping; bounded corpus, bounded runs per address. The corpus is not established random, IID or representative. Latching does not prove real-world rates, agent alignment, service delivery or safety. Correlated/paraphrased trials, source selection and multiple-run cherry-picking invalidate statistical interpretations; we make none. A per-address cap is not Sybil protection.

Consumers must bind the latest head and inspect status. OPEN is not terminal evidence; CAP_REACHED favors neither model. ABSTAINED and SOURCE_FAILED deny the likelihood interface, while transparent raw history stays readable. Terminal state is absorbing. Permanent consensus failure can leave OPEN indefinitely; no funds/credits are locked and no fictitious default conclusion is issued.

Keep private text, keys and passwords out of corpora/Git/chat. Public full source snapshots and transcripts are immutable. Signing uses native encrypted wallet/OS vault with no key export. Inspect known hashes before retry; never erase the proof journal to rebroadcast. Disclose vulnerabilities in repository issues without credentials or private data.
