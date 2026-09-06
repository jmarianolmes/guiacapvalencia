import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "server" / "data"


def flatten(value):
    if isinstance(value, list):
        result = []
        for item in value:
            result.extend(flatten(item))
        return result
    return [value]


def question_signature(q):
    options = q.get("options") or {}
    return "│".join([
        str(q.get("normalized") or q.get("question") or "").strip().lower(),
        str(options.get("A", q.get("optionA", ""))).strip(),
        str(options.get("B", q.get("optionB", ""))).strip(),
        str(options.get("C", q.get("optionC", ""))).strip(),
        str(options.get("D", q.get("optionD", ""))).strip(),
        str(q.get("answer", q.get("correctAnswer", ""))),
    ])


def normalized_signature(q):
    return str(q.get("normalized") or q.get("question") or "").strip().lower()


def main():
    pool = flatten(json.loads((DATA / "simulator_questions.json").read_text()))
    original_exams = json.loads((DATA / "original_exams.json").read_text())
    gva = json.loads((DATA / "gva_cap_mercancias_extracted.json").read_text())
    official = []
    for exam in original_exams:
        for q in exam["questions"]:
            official.append({**q, "prova": exam["date"], "source": "original_exams"})
    for exam in gva["exams"]:
        for q in exam["questions"]:
            official.append({**q, "prova": exam["date"], "source": "gva"})

    official_by_full = Counter(question_signature(q) for q in official)
    official_by_norm = Counter(normalized_signature(q) for q in official)
    pool_full = Counter(question_signature(q) for q in pool)
    pool_norm = Counter(normalized_signature(q) for q in pool)

    exact_matches = sum(1 for q in pool if question_signature(q) in official_by_full)
    normalized_matches = sum(1 for q in pool if normalized_signature(q) in official_by_norm)
    unique_pool_full = len(pool_full)
    unique_pool_norm = len(pool_norm)
    pool_duplicates_full = sum(v - 1 for v in pool_full.values() if v > 1)
    pool_duplicates_norm = sum(v - 1 for v in pool_norm.values() if v > 1)

    by_date = Counter(q.get("prova", "") for q in pool)
    by_materia = Counter(q.get("materia", "") for q in pool)
    official_dates = sorted({q["prova"] for q in official})

    report = {
        "official_records": len(official),
        "official_dates": len(official_dates),
        "official_date_list": official_dates,
        "pool_records": len(pool),
        "pool_unique_full_signature": unique_pool_full,
        "pool_unique_normalized": unique_pool_norm,
        "pool_duplicate_records_full_signature": pool_duplicates_full,
        "pool_duplicate_records_normalized": pool_duplicates_norm,
        "pool_exact_full_signature_matches_official": exact_matches,
        "pool_normalized_matches_official": normalized_matches,
        "pool_nonofficial_by_full_signature": len(pool) - exact_matches,
        "pool_nonofficial_by_normalized": len(pool) - normalized_matches,
        "pool_dates": dict(sorted(by_date.items())),
        "pool_subjects": dict(by_materia),
    }
    out = ROOT / "tools" / "source_comparison.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
