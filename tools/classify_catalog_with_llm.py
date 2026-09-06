import concurrent.futures
import json
import time
from pathlib import Path

from openai import OpenAI

ROOT = Path('/home/ubuntu/guia-cap-valencia-pro')
CATALOG = ROOT / 'server/data/question_catalog.json'
OUTPUT = ROOT / 'server/data/question_catalog_llm_suggestions.json'
MODEL = 'gpt-5-mini'
BATCH_SIZE = 50
WORKERS = 6

CHAPTERS = [
    ('common-1-1', 'Comunes 1.1: cadeia cinemática, torque, potência e transmissão'),
    ('common-1-2', 'Comunes 1.2: freios, retardadores e sistemas de segurança'),
    ('common-1-3', 'Comunes 1.3: consumo de combustível e condução eficiente'),
    ('common-1-3bis', 'Comunes 1.3 bis: riscos da via, tráfego, clima e utilizadores vulneráveis'),
    ('common-2-1', 'Comunes 2.1: jornada, tempos de condução, descanso, tacógrafo e CAP'),
    ('common-3-1', 'Comunes 3.1: riscos da estrada e acidentes de trabalho'),
    ('common-3-2', 'Comunes 3.2: delinquência e imigração clandestina'),
    ('common-3-3', 'Comunes 3.3: riscos físicos, ergonomia e EPI'),
    ('common-3-4', 'Comunes 3.4: aptidão física/mental, fadiga e substâncias'),
    ('common-3-5', 'Comunes 3.5: emergências, incêndio e primeiros socorros'),
    ('common-3-6', 'Comunes 3.6: imagem de marca, serviço e organização do trabalho'),
    ('goods-1-4', 'Mercancías 1.4: carga, repartição, estabilidade e estiva'),
    ('goods-2-2', 'Mercancías 2.2: regulamentação, contrato e transporte internacional'),
    ('goods-3-7', 'Mercancías 3.7: mercado, empresas e organização do transporte'),
]
CHAPTER_IDS = [item[0] for item in CHAPTERS]
CHAPTER_TEXT = '\n'.join(f'- {item}: {description}' for item, description in CHAPTERS)


def save_checkpoint(suggestions):
    payload = {
        'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'model': MODEL,
        'classifiedEntries': len(suggestions),
        'suggestions': suggestions,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def classify_batch(batch):
    client = OpenAI()
    payload = [
        {'id': str(index), 'subject': item['sources'][0]['subject'], 'question': item['sources'][0]['question']}
        for index, item in enumerate(batch)
    ]
    expected = {item['id'] for item in payload}
    for attempt in range(1, 5):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {'role': 'system', 'content': 'Classifique cada pergunta do CAP espanhol em exatamente um objetivo curricular. Use o conteúdo real. Retorne somente o JSON solicitado.'},
                    {'role': 'user', 'content': f'Objetivos permitidos:\n{CHAPTER_TEXT}\n\nClassifique todos os itens, mantendo exatamente os IDs numéricos:\n{json.dumps(payload, ensure_ascii=False)}'},
                ],
                response_format={
                    'type': 'json_schema',
                    'json_schema': {
                        'name': 'catalog_chapter_suggestions',
                        'strict': True,
                        'schema': {
                            'type': 'object',
                            'properties': {'assignments': {'type': 'array', 'items': {'type': 'object', 'properties': {'id': {'type': 'string'}, 'chapterId': {'type': 'string', 'enum': CHAPTER_IDS}, 'confidence': {'type': 'string', 'enum': ['high', 'medium', 'low']}}, 'required': ['id', 'chapterId', 'confidence'], 'additionalProperties': False}}},
                            'required': ['assignments'],
                            'additionalProperties': False,
                        },
                    },
                },
                max_completion_tokens=4500,
                extra_body={'reasoning': {'effort': 'minimal'}},
            )
            content = response.choices[0].message.content if response.choices else None
            if not content:
                raise RuntimeError('Resposta vazia')
            returned = {item['id']: item for item in json.loads(content)['assignments']}
            if set(returned) != expected:
                raise RuntimeError(f'IDs do lote divergentes: esperados {len(expected)}, recebidos {len(returned)}')
            return {batch[int(item_id)]['normalizedKey']: value for item_id, value in returned.items()}
        except Exception:
            if attempt == 4:
                raise
            time.sleep(attempt * 2)


def main():
    data = json.loads(CATALOG.read_text(encoding='utf-8'))
    entries = data['entries']
    suggestions = {}
    if OUTPUT.exists():
        try:
            suggestions = json.loads(OUTPUT.read_text(encoding='utf-8')).get('suggestions', {})
        except json.JSONDecodeError:
            suggestions = {}
    to_classify = [entry for entry in entries if entry.get('reviewStatus') != 'reviewed' and entry['normalizedKey'] not in suggestions]
    batches = [to_classify[index:index + BATCH_SIZE] for index in range(0, len(to_classify), BATCH_SIZE)]
    print(f'Pendentes: {len(to_classify)}; lotes: {len(batches)}; checkpoint: {len(suggestions)}', flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        future_to_index = {executor.submit(classify_batch, batch): index for index, batch in enumerate(batches, start=1)}
        for future in concurrent.futures.as_completed(future_to_index):
            index = future_to_index[future]
            suggestions.update(future.result())
            save_checkpoint(suggestions)
            print(f'Concluído lote {index}/{len(batches)}; total salvo: {len(suggestions)}', flush=True)
    save_checkpoint(suggestions)
    print(json.dumps({'classifiedEntries': len(suggestions), 'remaining': len(entries) - 525 - len(suggestions)}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
