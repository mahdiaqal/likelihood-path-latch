# Submission fields

Contribution type: Builder → Intelligent Contracts

Title: LikelihoodPathLatch — Consensus-Checked Sequential Evidence

## Notes / Description

LikelihoodPathLatch is a reusable sequential evidence primitive, not a graph or certificate. A test fixes a commit-pinned text corpus, textual predicate and two explicit models. Anyone may advance only the next row. Leader and validators independently fetch the full corpus, verify its SHA-256 and classify the exact text as MATCH, NO_MATCH or UNKNOWN. The complete report must agree exactly.

Each known label multiplies or divides a rational likelihood ratio by 3. The first 27 or 1/27 boundary latches irreversibly. Exhaustion is CAP_REACHED, not approval. UNKNOWN and source failure stop without inventing evidence. Run/cursor/head bindings prevent replay and cross-run substitution.

StudioNet proofs cover both boundaries, unexamined tails, exhaustion, bad commitments and replay/terminal rejection. The repository includes 47 tests, 5 SDK checks and matching deployed source. Outputs are fixed-model evidence, not calibrated risk or factual service/agent verification.

## Evidence URLs

- Repository: https://github.com/mahdiaqal/likelihood-path-latch
- Contract: https://github.com/mahdiaqal/likelihood-path-latch/blob/main/contracts/LikelihoodPathLatch.py
- Complete proof matrix: https://github.com/mahdiaqal/likelihood-path-latch/blob/main/LIVE_PROOFS.md
- Deployment/source: https://explorer-studio.genlayer.com/address/0xE23091bb29d1B0a71d51c347084733fDd909cbBc
- Upper boundary: https://explorer-studio.genlayer.com/tx/0x1002193a8a8db5d4d0e68f2b7ea15b10c8d0b1342a51d2d823277ae6ef6248e8
- Lower boundary: https://explorer-studio.genlayer.com/tx/0x6bbe0f260173cd74dc4f1c7de827e5a7459724ffb738bfc6a9660cb18a065eab
- Failed commitment: https://explorer-studio.genlayer.com/tx/0xea858aeb97b898df26dbf7ea3d6199162e020ea7fa900443853997cc816df8c8

Truncation and all negative receipts are linked individually in the proof matrix. This is a new representative mechanism, not evidence that earlier graph submissions were corrected. Use the actual contribution date; do not backdate. No production readiness, calibrated statistical guarantee, points or acceptance are promised.
