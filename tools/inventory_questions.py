import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "server" / "data"


def flatten(value):
    if isinstance(value, list):
        result = []
        for item in value:
            result.extend(flatten(item))
        return result
    if isinstance(value, dict):
        return [value]
    raise TypeError(f"Formato inesperado: {type(value)!r}")


def year(date):
    parts = str(date or "").split("/")
    return parts[-1] if len(parts) == 3 else "sem_data"


def main():
    simulator = flatten(json.loads((DATA / "simulator_questions.json").read_text()))
    originals = json.loads((DATA / "original_exams.json").read_text())
    dates = json.loads((DATA / "provas_dates.json").read_text())

    by_materia = Counter(q.get("materia", q.get("subject", "sem_materia")) for q in simulator)
    by_year = Counter(year(q.get("prova", q.get("provaDate"))) for q in simulator)
    by_source = Counter(q.get("model", "pool") for q in simulator)
    by_exam = Counter(q.get("prova", q.get("provaDate", "sem_prova")) for q in simulator)
    normalized = Counter((q.get("normalized") or q.get("question") or "").strip().lower() for q in simulator)
    duplicate_groups = [count for count in normalized.values() if count > 1]

    # Detect whether the static pool explicitly identifies origin or chapter.
    keys = sorted({key for q in simulator for key in q.keys()})
    chapter_keys = [key for key in keys if "chapter" in key.lower() or "cap" in key.lower()]
    origin_keys = [key for key in keys if any(token in key.lower() for token in ("official", "origin", "source", "model"))]

    report = {
        "simulator_total": len(simulator),
        "original_exams_records": len(originals) if isinstance(originals, list) else None,
        "provas_dates_records": len(dates) if isinstance(dates, list) else None,
        "simulator_top_level_shape": {
            "top_level": len(json.loads((DATA / "simulator_questions.json").read_text())),
            "flattened": len(simulator),
        },
        "by_materia": dict(by_materia),
        "by_year": dict(sorted(by_year.items())),
        "by_source_model": dict(by_source),
        "unique_exam_dates": len(by_exam),
        "exam_dates": sorted(by_exam),
        "duplicate_normalized_question_groups": len(duplicate_groups),
        "duplicate_records_beyond_first": sum(count - 1 for count in duplicate_groups),
        "max_same_normalized_question_count": max(duplicate_groups, default=1),
        "question_keys": keys,
        "chapter_keys": chapter_keys,
        "origin_keys": origin_keys,
    }
    out = ROOT / "tools" / "question_inventory.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
