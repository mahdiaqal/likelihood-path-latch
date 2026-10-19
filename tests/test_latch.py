import ast
import copy
from fractions import Fraction
import hashlib
import itertools
import json
from pathlib import Path
import re
import pytest

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "contracts/LikelihoodPathLatch.py"
tree = ast.parse(SOURCE.read_text(encoding="utf-8"))
ns = {"hashlib": hashlib, "json": json, "re": re, "LIMIT": 6000,
      "POLICY": "likelihood-path-latch-v1", "LABELS": ("MATCH", "NO_MATCH", "UNKNOWN")}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n, ast.FunctionDef)], type_ignores=[]), str(SOURCE), "exec"), ns)
BODY = (ROOT / "examples/upper.json").read_bytes()
SHA = hashlib.sha256(BODY).hexdigest()
COORD = "mahdiaqal/likelihood-path-latch/" + "a" * 40 + "/examples/upper.json"
PREDICATE = "The message asks its recipient to disclose a password, private key or recovery phrase to another person."


def test_exact_rational_path_exhaustive_65536_sequences():
    # Complete all length-16 binary paths; stop at their first boundary.
    for sequence in itertools.product(("MATCH", "NO_MATCH"), repeat=16):
        state, exact = ns["initial_state"](), Fraction(1)
        for label in sequence:
            exact *= Fraction(3) if label == "MATCH" else Fraction(1, 3)
            state = ns["transition"](state, label, 16, True)
            ratio = ns["model_ratio"](state)
            assert Fraction(ratio["numerator"], ratio["denominator"]) == exact
            assert state["matches"] + state["nonmatches"] == state["cursor"]
            if state["status"] != "OPEN":
                assert (state["status"] == "UPPER_CROSSED") == (exact >= 27)
                assert (state["status"] == "LOWER_CROSSED") == (exact <= Fraction(1, 27))
                break


def test_order_changes_first_boundary_not_retroactive_count():
    outputs = []
    for labels in (["MATCH"] * 3 + ["NO_MATCH"] * 3, ["NO_MATCH"] * 3 + ["MATCH"] * 3):
        s = ns["initial_state"]()
        for label in labels:
            s = ns["transition"](s, label, 6, True)
            if s["status"] != "OPEN":
                break
        outputs.append(s)
    assert [s["status"] for s in outputs] == ["UPPER_CROSSED", "LOWER_CROSSED"]
    assert [s["cursor"] for s in outputs] == [3, 3]


def test_abstention_is_not_negative_or_positive():
    s = ns["transition"](ns["initial_state"](), "MATCH", 5, True)
    after = ns["transition"](s, "UNKNOWN", 5, True)
    assert after["exponent"] == s["exponent"] == 1
    assert after["status"] == "ABSTAINED" and after["unknowns"] == 1
    assert after["cursor"] == 2 and after["matches"] == 1 and after["nonmatches"] == 0


def test_source_failure_does_not_count_as_trial():
    s = ns["transition"](ns["initial_state"](), "UNKNOWN", 0, False)
    assert s["status"] == "SOURCE_FAILED" and s["cursor"] == s["exponent"] == 0 and s["steps"] == 1


def test_truncation_not_a_boundary_decision():
    s = ns["transition"](ns["initial_state"](), "MATCH", 2, True)
    s = ns["transition"](s, "NO_MATCH", 2, True)
    assert s["status"] == "CAP_REACHED" and ns["model_ratio"](s)["numerator"] == 1


@pytest.mark.parametrize("before,label,total,ready", [
    ({**ns["initial_state"](), "status": "UPPER_CROSSED"}, "MATCH", 5, True),
    (ns["initial_state"](), "MATCH", 0, False),
    (ns["initial_state"](), "MATCH", True, True),
    (ns["initial_state"](), "BAD", 5, True),
    ({**ns["initial_state"](), "total": 4}, "MATCH", 5, True)])
def test_transition_guards(before, label, total, ready):
    with pytest.raises(ValueError):
        ns["transition"](before, label, total, ready)


@pytest.mark.parametrize("raw", ['{"label":true}', '{"label":"YES"}', '{"label":"MATCH","label":"NO_MATCH"}', '{}', '{"label":"MATCH","confidence":1}'])
def test_strict_label_parser(raw):
    with pytest.raises(ValueError):
        ns["parse_label"](raw)


@pytest.mark.parametrize("mutation", ["duplicate-id", "duplicate-text", "caller-label", "empty", "wrong-schema"])
def test_corpus_schema(mutation):
    obj = json.loads(BODY)
    if mutation == "duplicate-id":
        obj["items"][1]["id"] = obj["items"][0]["id"]
    elif mutation == "duplicate-text":
        obj["items"][1]["text"] = obj["items"][0]["text"]
    elif mutation == "caller-label":
        obj["items"][0]["label"] = "MATCH"
    elif mutation == "empty":
        obj["items"] = []
    else:
        obj["schema"] = "metadata-proof"
    with pytest.raises(ValueError):
        ns["parse_corpus"](json.dumps(obj))


@pytest.fixture
def deployed(direct_vm, direct_deploy):
    c = direct_deploy(str(SOURCE))
    direct_vm.mock_web(re.escape(ns["source_spec"](COORD, SHA)["url"]), {"response": {"status": 200, "headers": {}, "body": BODY}, "method": "GET"})
    direct_vm.mock_llm(r"(?s).*LIKELIHOOD PATH TEXT OBSERVATION.*", '{"label":"MATCH"}')
    return c


def test_direct_upper_latch_order_replay_head(deployed):
    key = deployed.create_test("upper", PREDICATE, COORD, SHA)
    first = deployed.get_test(key)
    with pytest.raises(Exception, match="Cursor mismatch"):
        deployed.advance(key, 1)
    for i in range(3):
        deployed.advance(key, i)
    run = deployed.get_test(key)
    assert run["state"]["status"] == "UPPER_CROSSED" and run["state"]["cursor"] == 3 and run["state"]["total"] == 5
    assert deployed.likelihood_ratio(key, run["head"])["ratio"]["numerator"] == 27
    with pytest.raises(Exception, match="Test terminal"):
        deployed.advance(key, 3)
    with pytest.raises(Exception, match="Head mismatch"):
        deployed.likelihood_ratio(key, first["head"])
    with pytest.raises(Exception, match="Nonce used"):
        deployed.create_test("upper", PREDICATE, COORD, SHA)
    assert deployed.get_step(key, 0)["root"] == deployed.get_step(key, 1)["previous_head"]


def test_direct_permissionless_and_stale_cursor(deployed, direct_vm, direct_bob):
    key = deployed.create_test("public", PREDICATE, COORD, SHA)
    from genlayer import Address
    direct_vm.sender = Address(str(direct_bob))
    deployed.advance(key, 0)
    with pytest.raises(Exception, match="Cursor mismatch"):
        deployed.advance(key, 0)
    assert deployed.get_test(key)["state"]["cursor"] == 1


def reset_label(vm, label):
    vm.clear_mocks()
    vm.mock_web(re.escape(ns["source_spec"](COORD, SHA)["url"]), {"response": {"status": 200, "headers": {}, "body": BODY}, "method": "GET"})
    vm.mock_llm(r"(?s).*LIKELIHOOD PATH TEXT OBSERVATION.*", json.dumps({"label": label}))


def test_direct_lower(deployed, direct_vm):
    reset_label(direct_vm, "NO_MATCH")
    key = deployed.create_test("lower", PREDICATE, COORD, SHA)
    for i in range(3):
        deployed.advance(key, i)
    run = deployed.get_test(key)
    assert run["state"]["status"] == "LOWER_CROSSED" and deployed.likelihood_ratio(key, run["head"])["ratio"]["denominator"] == 27


def test_direct_unknown_denies_reader(deployed, direct_vm):
    reset_label(direct_vm, "UNKNOWN")
    key = deployed.create_test("unknown", PREDICATE, COORD, SHA)
    deployed.advance(key, 0)
    run = deployed.get_test(key)
    assert run["state"]["status"] == "ABSTAINED" and run["state"]["exponent"] == 0
    with pytest.raises(Exception, match="Incomplete semantic path"):
        deployed.likelihood_ratio(key, run["head"])


def test_direct_bad_hash_denies_reader(deployed):
    key = deployed.create_test("bad", PREDICATE, COORD, "f" * 64)
    deployed.advance(key, 0)
    run = deployed.get_test(key)
    assert run["state"]["status"] == "SOURCE_FAILED" and run["state"]["cursor"] == 0
    with pytest.raises(Exception, match="Incomplete semantic path"):
        deployed.likelihood_ratio(key, run["head"])


def test_direct_malformed_label_does_not_advance(deployed, direct_vm):
    key = deployed.create_test("malformed", PREDICATE, COORD, SHA)
    direct_vm.clear_mocks()
    direct_vm.mock_web(re.escape(ns["source_spec"](COORD, SHA)["url"]), {"response": {"status": 200, "headers": {}, "body": BODY}, "method": "GET"})
    direct_vm.mock_llm(r"(?s).*LIKELIHOOD PATH TEXT OBSERVATION.*", '{"label":"YES"}')
    with pytest.raises(Exception, match="Malformed text observation"):
        deployed.advance(key, 0)
    assert deployed.get_test(key)["state"]["steps"] == 0


def report_fixture():
    spec = ns["source_spec"](COORD, SHA)
    binding = {"run": "run-a", "input_root": "bound", "previous_head": "head", "before": ns["initial_state"](), "policy": ns["POLICY"]}
    report = {"binding": binding, "source": {"url": spec["url"], "http": 200, "status": "OK", "body": BODY.decode(), "hash": SHA},
              "document_status": "READY", "item": json.loads(BODY)["items"][0], "label": "MATCH"}
    return spec, binding, report


@pytest.mark.parametrize("mutation", ["other-run", "other-head", "skip-row", "wrong-body", "fake-hash", "wrong-label-type"])
def test_post_consensus_tamper_rejected(mutation):
    spec, binding, report = report_fixture()
    forged = copy.deepcopy(report)
    if mutation == "other-run":
        forged["binding"]["run"] = "run-b"
    elif mutation == "other-head":
        forged["binding"]["previous_head"] = "stale"
    elif mutation == "skip-row":
        forged["item"] = json.loads(BODY)["items"][1]
    elif mutation == "wrong-body":
        forged["source"]["body"] = "caller summary"
    elif mutation == "fake-hash":
        forged["source"]["hash"] = "a" * 64
    else:
        forged["label"] = True
    with pytest.raises(ValueError):
        ns["validate_report"](forged, binding, spec, ns["initial_state"]())


def test_validator_independent_fetch_and_decision_disagreement():
    cls = next(n for n in tree.body if isinstance(n, ast.ClassDef))
    advance = next(n for n in cls.body if isinstance(n, ast.FunctionDef) and n.name == "advance")
    callback = next(n for n in advance.body if isinstance(n, ast.FunctionDef) and n.name == "validator")
    spec, binding, report = report_fixture()
    calls = []
    class Return:
        def __init__(self, value):
            self.calldata = value
    class VM:
        pass
    VM.Return = Return
    class GL:
        vm = VM
    scope = {**ns, "gl": GL, "binding": binding, "spec": spec, "before": ns["initial_state"](),
             "observe": lambda: calls.append(1) or copy.deepcopy(report)}
    exec(compile(ast.Module(body=[callback], type_ignores=[]), str(SOURCE), "exec"), scope)
    assert scope["validator"](Return(report)) and len(calls) == 1
    opposite = copy.deepcopy(report)
    opposite["label"] = "NO_MATCH"
    assert not scope["validator"](Return(opposite)) and len(calls) == 2
    assert not scope["validator"](object())


@pytest.mark.parametrize("coordinate,sha", [
    (COORD.replace("a" * 40, "main"), SHA), (COORD.replace("examples/", "../"), SHA),
    (COORD.replace("upper.json", "upper.txt"), SHA), (COORD + "?redirect=1", SHA),
    ("https://evil.example/" + COORD, SHA), (COORD, "A" * 64)])
def test_pinned_source_guards(coordinate, sha):
    with pytest.raises(ValueError):
        ns["source_spec"](coordinate, sha)


@pytest.mark.parametrize("status,http", [("UNAVAILABLE", 0), ("HTTP_ERROR", 404), ("SIZE_ERROR", 200), ("ENCODING_ERROR", 200)])
def test_agreed_acquisition_failures_never_mint_likelihood(status, http):
    spec, binding, report = report_fixture()
    report.update({"source": {"url": spec["url"], "http": http, "status": status, "body": "", "hash": ""},
                   "document_status": "ACQUISITION_FAILED", "item": None, "label": "UNKNOWN"})
    state = ns["validate_report"](report, binding, spec, ns["initial_state"]())
    assert state["status"] == "SOURCE_FAILED" and state["exponent"] == state["cursor"] == 0
    report["label"] = "MATCH"
    with pytest.raises(ValueError):
        ns["validate_report"](report, binding, spec, ns["initial_state"]())


def test_principal_nonce_separation(deployed, direct_vm, direct_bob):
    a = deployed.create_test("same-nonce", PREDICATE, COORD, SHA)
    from genlayer import Address
    direct_vm.sender = Address(str(direct_bob))
    b = deployed.create_test("same-nonce", PREDICATE, COORD, SHA)
    assert a != b and deployed.get_test(a)["input_root"] != deployed.get_test(b)["input_root"]


def test_per_creator_bound(deployed):
    for i in range(32):
        deployed.create_test("limit-" + str(i), PREDICATE, COORD, SHA)
    with pytest.raises(Exception, match="Creator limit"):
        deployed.create_test("limit-33", PREDICATE, COORD, SHA)
