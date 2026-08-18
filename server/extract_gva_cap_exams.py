import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageStat

ROOT = Path('/home/ubuntu/guia-cap-valencia-pro')
DOCUMENTS = Path('/home/ubuntu/gva_cap_official_documents')
MANIFEST = ROOT / 'server/data/gva_cap_mercancias_manifest.json'
OUT = ROOT / 'server/data/gva_cap_mercancias_extracted.json'
WORK = Path('/home/ubuntu/gva_cap_extraction_work')

# Coordenadas relativas da plantilla nacional CAP: cinco blocos superiores de
# 5 questões e cinco blocos inferiores de 15 questões, com quatro respostas A–D.
X_CENTERS = [
    [0.108, 0.140, 0.171, 0.203],
    [0.269, 0.301, 0.333, 0.364],
    [0.431, 0.462, 0.494, 0.525],
    [0.592, 0.623, 0.655, 0.687],
    [0.753, 0.785, 0.817, 0.848],
]
TOP_ROWS = [0.241, 0.270, 0.299, 0.328, 0.357]
BOTTOM_START = 0.461
BOTTOM_STEP = 0.02894


def clean(value: str) -> str:
    return ' '.join(value.replace('\x0c', ' ').split())


def pdf_text(path: Path) -> str:
    result = subprocess.run(['pdftotext', '-raw', str(path), '-'], check=True, capture_output=True, text=True)
    return result.stdout


def parse_questions(path: Path):
    text = pdf_text(path)
    matches = list(re.finditer(r'(?m)^\s*(\d{1,3})\.\s+', text))
    questions = []
    for index, match in enumerate(matches):
        number = int(match.group(1))
        if not 1 <= number <= 100:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = text[match.end():end]
        options = re.split(r'(?im)^\s*([abcd])\)\s*', block)
        if len(options) < 9:
            continue
        stem = clean(options[0])
        answer_options = {}
        for option_index in range(1, min(len(options) - 1, 9), 2):
            answer_options[options[option_index].upper()] = clean(options[option_index + 1])
        if set(answer_options) != {'A', 'B', 'C', 'D'} or not stem:
            continue
        questions.append({'number': number, 'question': stem, 'options': answer_options})
    unique = {entry['number']: entry for entry in questions}
    return [unique[number] for number in sorted(unique)]


def render_first_page(path: Path, target: Path):
    prefix = target.with_suffix('')
    subprocess.run(['pdftoppm', '-f', '1', '-singlefile', '-r', '144', '-png', str(path), str(prefix)], check=True)
    return prefix.with_suffix('.png')


def patch_darkness(image: Image.Image, x: int, y: int) -> float:
    width, height = image.size
    radius_x = max(4, round(width * 0.012))
    radius_y = max(4, round(height * 0.006))
    patch = image.crop((x - radius_x, y - radius_y, x + radius_x, y + radius_y))
    return ImageStat.Stat(patch).mean[0]


def parse_answer_key(path: Path, date: str):
    WORK.mkdir(parents=True, exist_ok=True)
    rendered = render_first_page(path, WORK / f'{date.replace("/", "-")}_answer_key')
    image = Image.open(rendered).convert('L')
    width, height = image.size
    answers = {}
    confidences = {}
    raw_values = {}

    for group in range(5):
        for row, relative_y in enumerate(TOP_ROWS):
            question_number = group * 5 + row + 1
            values = [patch_darkness(image, round(width * relative_x), round(height * relative_y)) for relative_x in X_CENTERS[group]]
            best = min(range(4), key=lambda index: values[index])
            answers[question_number] = 'ABCD'[best]
            confidences[question_number] = sorted(values)[1] - sorted(values)[0]
            raw_values[question_number] = values
        for row in range(15):
            question_number = 26 + group * 15 + row
            values = [patch_darkness(image, round(width * relative_x), round(height * (BOTTOM_START + BOTTOM_STEP * row))) for relative_x in X_CENTERS[group]]
            best = min(range(4), key=lambda index: values[index])
            answers[question_number] = 'ABCD'[best]
            confidences[question_number] = sorted(values)[1] - sorted(values)[0]
            raw_values[question_number] = values

    minimum_confidence = min(confidences.values())
    if len(answers) != 100 or minimum_confidence < 20:
        worst = min(confidences, key=confidences.get)
        raise RuntimeError(f'Gabarito de {date} não atingiu a confiança mínima de leitura ({minimum_confidence:.2f}, pergunta {worst}, valores {raw_values[worst]})')
    return answers, confidences


def extract_exam(record):
    date = record['date']
    questionnaire = Path(record['questionnaire']['localPath'])
    answer_key = Path(record['answer_key']['localPath'])
    questions = parse_questions(questionnaire)
    answers, confidences = parse_answer_key(answer_key, date)
    if len(questions) != 100:
        raise RuntimeError(f'{date}: foram extraídas {len(questions)} perguntas, esperado 100')
    extracted = []
    for item in questions:
        number = item['number']
        extracted.append({
            'questionNumber': number,
            'subject': 'Mercancias' if number <= 25 else 'Materiales Comunes',
            'question': item['question'],
            'stem': item['question'],
            'options': item['options'],
            'answer': answers[number],
            'answerConfidence': round(confidences[number], 2),
        })
    return {
        'date': date,
        'sourceQuestionnaire': record['questionnaire']['url'],
        'sourceAnswerKey': record['answer_key']['url'],
        'questions': extracted,
    }


def main():
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    exams = []
    failures = []
    for record in manifest['complete']:
        try:
            exams.append(extract_exam(record))
            print(f'{record["date"]}: 100 perguntas e gabarito validados')
        except Exception as error:
            failures.append({'date': record['date'], 'error': str(error)})
            print(f'{record["date"]}: FALHA — {error}')
    OUT.write_text(json.dumps({'exams': exams, 'failures': failures}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Extração concluída: {len(exams)} provas válidas; {len(failures)} falhas')


if __name__ == '__main__':
    main()
