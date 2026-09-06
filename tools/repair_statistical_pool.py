import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "server" / "data" / "simulator_questions.json"


def normalize(value):
    return " ".join(str(value or "").strip().lower().split())


def equivalence_key(q):
    options = q["options"]
    answer_text = options[q["answer"]]
    return "│".join([
        normalize(q.get("normalized") or q["question"]),
        *sorted(normalize(options[letter]) for letter in "ABCD"),
        normalize(answer_text),
    ])


def main():
    pools = json.loads(SOURCE.read_text(encoding="utf-8"))
    original = [[dict(q) for q in pool] for pool in pools]
    candidates = [q for pool in original for q in pool]
    used_global = set()
    replacements = []

    for model_index, pool in enumerate(pools):
        used = set()
        duplicate_positions = []
        for position, question in enumerate(pool):
            key = equivalence_key(question)
            if key in used:
                duplicate_positions.append(position)
            else:
                used.add(key)

        candidate_index = 0
        for position in duplicate_positions:
            while candidate_index < len(candidates):
                candidate = candidates[candidate_index]
                candidate_index += 1
                key = equivalence_key(candidate)
                if key not in used:
                    pool[position] = dict(candidate)
                    used.add(key)
                    replacements.append({
                        "model": chr(65 + model_index),
                        "position": position + 1,
                        "from": original[model_index][position].get("normalized") or original[model_index][position]["question"],
                        "to": candidate.get("normalized") or candidate["question"],
                    })
                    break
            else:
                raise RuntimeError(f"Não há questões únicas suficientes para preencher o modelo {chr(65 + model_index)}.")

        if len({equivalence_key(q) for q in pool}) != len(pool):
            raise RuntimeError(f"O modelo {chr(65 + model_index)} ainda possui repetição após reparo.")

    SOURCE.write_text(json.dumps(pools, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "models": len(pools),
        "questionsPerModel": len(pools[0]) if pools else 0,
        "replacements": len(replacements),
        "replacementDetails": replacements,
        "orderPolicy": "positions without equivalence duplicates are preserved; only duplicate positions are replaced deterministically",
    }
    (ROOT / "server" / "data" / "statistical_pool_repair_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "replacementDetails"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
