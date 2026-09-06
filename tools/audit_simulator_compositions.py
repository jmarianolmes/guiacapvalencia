import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "server" / "data"


def normalize(value):
    return " ".join(str(value or "").strip().lower().split())


def full_key(q):
    opts = q.get("options") or {}
    values = [opts.get(letter, q.get(f"option{letter}", "")) for letter in "ABCD"]
    answer = q.get("answer", q.get("correctAnswer", ""))
    answer_text = values["ABCD".index(answer)] if answer in "ABCD" else answer
    return "│".join([normalize(q.get("normalized") or q.get("question")), *sorted(normalize(v) for v in values), normalize(answer_text)])


def audit(rows, label):
    keys = Counter(full_key(row) for row in rows)
    duplicate_groups = {key: count for key, count in keys.items() if count > 1}
    return {
        "label": label,
        "records": len(rows),
        "unique_equivalence_keys": len(keys),
        "duplicate_groups": len(duplicate_groups),
        "duplicate_records_beyond_first": sum(count - 1 for count in duplicate_groups.values()),
        "max_repetitions": max(duplicate_groups.values(), default=1),
    }


def main():
    pool = json.loads((DATA / "simulator_questions.json").read_text())
    recent = json.loads((DATA / "original_exams.json").read_text())
    historical = json.loads((DATA / "gva_cap_mercancias_extracted.json").read_text())["exams"]
    result = {"pool_models": [audit(rows, f"{chr(65+i)}") for i, rows in enumerate(pool)]}
    result["official_exams"] = [audit(exam["questions"], exam["date"]) for exam in [*recent, *historical]]
    result["pool_summary"] = audit([q for rows in pool for q in rows], "A-J total")
    result["official_summary"] = audit([q for exam in [*recent, *historical] for q in exam["questions"]], "34 official exams total")
    out = ROOT / "tools" / "simulator_composition_audit.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
