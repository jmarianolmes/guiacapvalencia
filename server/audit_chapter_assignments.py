import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path('/home/ubuntu/guia-cap-valencia-pro')
SOURCE = ROOT / 'server/data/simulator_questions.json'
ASSIGNMENTS = ROOT / 'server/chapterAssignments.ts'
REPORT = ROOT / 'server/data/chapter_assignment_audit.md'

CHAPTER_NAMES = {
    'common-1-1': 'Comunes 1.1 — cadeia cinemática e transmissão',
    'common-1-2': 'Comunes 1.2 — freios e segurança',
    'common-1-3': 'Comunes 1.3 — condução eficiente',
    'common-1-3bis': 'Comunes 1.3 bis — riscos do tráfego',
    'common-2-1': 'Comunes 2.1 — tempos, tacógrafo e profissão',
    'common-3-1': 'Comunes 3.1 — acidentes e segurança viária',
    'common-3-2': 'Comunes 3.2 — delinquência e imigração clandestina',
    'common-3-3': 'Comunes 3.3 — riscos físicos e ergonomia',
    'common-3-4': 'Comunes 3.4 — saúde, fadiga e substâncias',
    'common-3-5': 'Comunes 3.5 — emergência e socorro',
    'common-3-6': 'Comunes 3.6 — serviço e organização',
    'goods-1-4': 'Mercancías 1.4 — carga e estiva',
    'goods-2-2': 'Mercancías 2.2 — regulamentação e contrato',
    'goods-3-7': 'Mercancías 3.7 — mercado e empresas',
}


def flatten(data):
    if isinstance(data, list):
        return [child for item in data for child in flatten(item)]
    return [data]


def key(question):
    return str(question.get('normalized') or question.get('question') or '').strip().lower()


def load_assignments():
    text = ASSIGNMENTS.read_text(encoding='utf-8')
    return json.loads(text[text.index('{'):text.rindex('}') + 1])


def main():
    assignments = load_assignments()
    questions = flatten(json.loads(SOURCE.read_text(encoding='utf-8')))
    by_chapter = defaultdict(list)
    for question in questions:
        chapter = assignments.get(key(question))
        if chapter:
            by_chapter[chapter].append(question)

    lines = ['# Auditoria de classificação por capítulo', '', f'- Questões únicas com mapeamento: **{len(assignments)}**', f'- Questões do pool: **{len(questions)}**', '']
    lines += ['| Objetivo | Questões do pool | Amostra real para revisão |', '|---|---:|---|']
    for chapter, label in CHAPTER_NAMES.items():
        entries = by_chapter.get(chapter, [])
        sample = entries[0].get('question', 'Sem amostra').replace('|', '\\|') if entries else 'Sem questão mapeada'
        lines.append(f'| {label} | {len(entries)} | {sample} |')
    REPORT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(REPORT)


if __name__ == '__main__':
    main()
