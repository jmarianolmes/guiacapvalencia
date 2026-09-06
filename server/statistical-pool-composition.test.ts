import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('es-ES');
}

function equivalenceKey(question: { normalized?: string; question: string; options: Record<string, string>; answer: string }) {
  return [
    normalize(question.normalized || question.question),
    ...['A', 'B', 'C', 'D'].map((letter) => normalize(question.options[letter])).sort(),
    normalize(question.options[question.answer]),
  ].join('│');
}

describe('composição dos simulados estratégicos', () => {
  it('mantém 10 modelos de 100 questões sem repetir uma equivalência dentro do mesmo modelo', () => {
    const file = path.join(process.cwd(), 'server/data/simulator_questions.json');
    const pools = JSON.parse(fs.readFileSync(file, 'utf8')) as Array<Array<{ normalized?: string; question: string; options: Record<string, string>; answer: string }>>;
    expect(pools).toHaveLength(10);
    for (const pool of pools) {
      expect(pool).toHaveLength(100);
      const keys = pool.map(equivalenceKey);
      expect(new Set(keys).size).toBe(100);
    }
  });
});
