import concurrent.futures
import json
import time
from pathlib import Path

from openai import OpenAI

ROOT = Path('/home/ubuntu/guia-cap-valencia-pro')
SOURCE = ROOT / 'server/data/simulator_questions.json'
OUTPUT = ROOT / 'server/chapterAssignments.ts'
REPORT = ROOT / 'server/data/chapter_assignment_report.json'
MODEL = 'gpt-5-mini'
BATCH_SIZE = 25
WORKERS = 4

CHAPTERS = [
    ('common-1-1', 'Comunes 1.1: cadena cinemática, par, potencia, cuentarrevoluciones y caja de cambios'),
    ('common-1-2', 'Comunes 1.2: frenos, ralentizadores y dispositivos/sistemas de seguridad del vehículo'),
    ('common-1-3', 'Comunes 1.3: consumo de carburante y conducción eficiente'),
    ('common-1-3bis', 'Comunes 1.3 bis: riesgos del tráfico, carretera, meteorología y usuarios vulnerables'),
    ('common-2-1', 'Comunes 2.1: entorno social, jornada, tiempos de conducción/descanso, tacógrafo, CAP y documentación del conductor'),
    ('common-3-1', 'Comunes 3.1: riesgos de carretera y accidentes de trabajo'),
    ('common-3-2', 'Comunes 3.2: delincuencia y tráfico de inmigrantes clandestinos'),
    ('common-3-3', 'Comunes 3.3: riesgos físicos, ergonomía, manipulación y protección individual'),
    ('common-3-4', 'Comunes 3.4: aptitud física/mental, alimentación, alcohol, drogas, medicamentos, fatiga y estrés'),
    ('common-3-5', 'Comunes 3.5: emergencias, accidente, incendio y primeros auxilios'),
    ('common-3-6', 'Comunes 3.6: imagen de marca, servicio, mantenimiento y organización del trabajo'),
    ('goods-1-4', 'Mercancías 1.4: operación de carga, masa, volumen, reparto, estabilidad, embalaje, estiba, amarre y medios de manipulación'),
    ('goods-2-2', 'Mercancías 2.2: reglamentación, títulos, documentos, restricciones, contrato, CMR, transporte internacional y fronteras'),
    ('goods-3-7', 'Mercancías 3.7: entorno económico, mercado, empresas, actividades y especializaciones del transporte de mercancías'),
]

CHAPTER_TEXT = '\n'.join(f'- {identifier}: {description}' for identifier, description in CHAPTERS)
CHAPTER_IDS = [identifier for identifier, _ in CHAPTERS]


def flatten(data):
    if isinstance(data, list):
        result = []
        for item in data:
            result.extend(flatten(item))
        return result
    return [data]


def normalized_key(question):
    return str(question.get('normalized') or question.get('question') or '').strip().lower()


def classify_batch(batch):
    client = OpenAI()
    payload = [
        {'id': item['id'], 'subject': item['subject'], 'question': item['question']}
        for item in batch
    ]
    last_error = None
    for attempt in range(1, 5):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        'role': 'system',
                        'content': 'Eres un clasificador preciso de preguntas del Certificado de Aptitud Profesional (CAP) de España. Clasifica cada pregunta en exactamente un objetivo curricular. No inventes contenido. Prioriza siempre el contenido real de la pregunta frente al campo subject, que en el banco histórico puede ser demasiado amplio o estar mezclado. Por ejemplo, una pregunta sobre V2V, conducción eficiente o ADAS debe ir a Comunes aunque figure como Mercancias.',
                    },
                    {
                        'role': 'user',
                        'content': f'''Clasifica las preguntas siguientes en uno de estos objetivos:\n{CHAPTER_TEXT}\n\nPreguntas JSON:\n{json.dumps(payload, ensure_ascii=False)}''',
                    },
                ],
                response_format={
                    'type': 'json_schema',
                    'json_schema': {
                        'name': 'chapter_assignments',
                        'strict': True,
                        'schema': {
                            'type': 'object',
                            'properties': {
                                'assignments': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'id': {'type': 'string'},
                                            'chapterId': {'type': 'string', 'enum': CHAPTER_IDS},
                                            'confidence': {'type': 'string', 'enum': ['high', 'medium', 'low']},
                                        },
                                        'required': ['id', 'chapterId', 'confidence'],
                                        'additionalProperties': False,
                                    },
                                },
                            },
                            'required': ['assignments'],
                            'additionalProperties': False,
                        },
                    },
                },
                max_completion_tokens=1800,
                extra_body={'reasoning': {'effort': 'minimal'}},
            )
            choices = response.choices or []
            if not choices:
                raise RuntimeError(f'Resposta sem escolhas (tentativa {attempt}): {response}')
            content = choices[0].message.content
            if not content:
                raise RuntimeError(
                    f'Resposta sem conteúdo (tentativa {attempt}; '
                    f'finish_reason={choices[0].finish_reason}; resposta={response})'
                )
            result = json.loads(content)
            returned = {entry['id']: entry for entry in result['assignments']}
            expected = {item['id'] for item in batch}
            if set(returned) != expected:
                raise RuntimeError(f'Batch incompleto: esperadas={len(expected)} retornadas={len(returned)}')
            return returned
        except Exception as error:
            last_error = error
            if attempt < 4:
                time.sleep(attempt * 2)
    raise RuntimeError(f'Falha ao classificar lote após 4 tentativas: {last_error}')


def main():
    raw = json.loads(SOURCE.read_text(encoding='utf-8'))
    questions = flatten(raw)
    unique = {}
    for question in questions:
        key = normalized_key(question)
        if key:
            unique[key] = {
                'key': key,
                'subject': question.get('materia', ''),
                'question': question.get('question', ''),
            }

    items = list(unique.values())
    for index, item in enumerate(items):
        item['id'] = f'q{index:04d}'
    batches = [items[index:index + BATCH_SIZE] for index in range(0, len(items), BATCH_SIZE)]
    assignments = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = [executor.submit(classify_batch, batch) for batch in batches]
        for index, future in enumerate(futures, start=1):
            assignments.update(future.result())
            print(f'Classificados {index}/{len(futures)} lotes')

    item_by_id = {item['id']: item for item in items}
    mapping = {item_by_id[identifier]['key']: value['chapterId'] for identifier, value in assignments.items()}
    low_confidence = [value for value in assignments.values() if value['confidence'] == 'low']
    OUTPUT.write_text(
        '/* Gerado a partir da classificação revisada das questões CAP. */\n'
        f'export const chapterAssignments: Record<string, string> = {json.dumps(mapping, ensure_ascii=False, indent=2)};\n',
        encoding='utf-8',
    )
    REPORT.write_text(json.dumps({
        'uniqueQuestions': len(items),
        'assignedQuestions': len(mapping),
        'coverageRate': len(mapping) / len(items) if items else 0,
        'lowConfidenceCount': len(low_confidence),
        'lowConfidence': low_confidence,
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Classificação concluída: {len(mapping)}/{len(items)} questões únicas; baixa confiança: {len(low_confidence)}')


if __name__ == '__main__':
    main()
