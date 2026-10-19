# Consensus boundary

LikelihoodPathLatch is an experimental sequential likelihood-ratio state machine over a pinned published text corpus. It is not a new domain version of a graph, certificate, annotation audit or probability-score ledger.

User action → immutable corpus URL/hash + textual predicate → permissionless mandatory next observation → full corpus refetched and hash checked → independent semantic MATCH/NO_MATCH/UNKNOWN → exact complete-report agreement → signed likelihood exponent and first-boundary latch advance → root-bound model-odds readback.

External artifact: full ordered JSON text corpus, the actual object of analysis. Callers supply no observation label, source body, summary, probability, confidence, cursor choice or reordered subset. This does not infer that a documented action really occurred. A caller choosing a corpus is selection bias, not independent sampling.

Contract: fixes the source, predicate and per-principal nonce; forces original order; checks full-response integrity; independently classifies each next text; records immutable step transcripts bound to run, cursor and prior head; stops irreversibly at exponent +3 or -3. UNKNOWN and acquisition failure stop without adding positive or negative evidence. Exhausting a corpus without either boundary is CAP_REACHED, not acceptance.

The two explicit Bernoulli models assign MATCH probabilities 1/4 and 3/4. Each MATCH multiplies the likelihood ratio by 3; each NO_MATCH divides it by 3. Exact ratio is `3**max(exponent,0) / 3**max(-exponent,0)`, with exponent `matches - nonmatches`. No floating point, confidence tolerance or posterior probability is used. Boundary crossing is path-dependent and irreversible; later unexamined rows cannot undo it.

This is a research mechanism for fixed model-relative evidence paths. The corpus is not asserted to be random, IID, representative or correctly classified. Therefore no real-world statistical significance, calibrated risk, error-rate or service/alignment guarantee is claimed. The 27 and 1/27 boundaries are fixed protocol parameters, not advertised confidence levels.

UI/backend: source discovery, authorship judgment and nonauthoritative previews. No frontend is shipped. No funds, settlement transfers, tokens, votes, graph mutations or consumable capabilities exist. Anyone can advance a known OPEN run; the creator cannot edit, reorder, cancel or reset it. Independent model/network failure can block progress, with no funds locked.
