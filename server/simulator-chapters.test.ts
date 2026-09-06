import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { classifySimulatorQuestion } from './chapterClassifier';

describe('findSimulatorChapter', () => {
  it('classifica questões comuns de tacógrafo no objetivo 2.1', () => {
    expect(classifySimulatorQuestion({ subject: 'Materiales Comunes', question: '¿Cuál es el descanso semanal registrado por el tacógrafo?' }).chapter?.id).toBe('common-2-1');
  });

  it('classifica questões de estiva no objetivo 1.4 de mercancías', () => {
    expect(classifySimulatorQuestion({ subject: 'Mercancias', question: '¿Cómo se debe revisar la estiba y la sujeción de la carga?' }).chapter?.id).toBe('goods-1-4');
  });

  it('mantém CMR no objetivo 2.2 de mercancías', () => {
    expect(classifySimulatorQuestion({ subject: 'Mercancias', question: '¿Cuándo se aplica el Convenio CMR al contrato de transporte?' }).chapter?.id).toBe('goods-2-2');
  });

  it.each([
    ['common-1-1', 'De los que se indican a continuación, ¿qué elemento pertenece al sistema de transmisión de un automóvil?'],
    ['common-1-2', 'Dentro de los Sistemas de Transporte Inteligente se encuentran los denominados V2V, ¿cuál es su funcionalidad característica?'],
    ['common-1-3', '¿Cuál de las siguientes circunstancias aumenta el consumo de carburante?'],
    ['common-1-3bis', '¿Qué variables existen para definir el tráfico existente en una carretera?'],
    ['common-2-1', '¿Qué conductores de vehículos de transporte de mercancías deben llevar a bordo su tarjeta de cualificación profesional?'],
    ['common-3-1', '¿Cuál de estos es un factor de riesgo?'],
    ['common-3-2', 'La responsabilidad de un conductor por colaborar en la introducción en España de inmigrantes ilegales mediante el vehículo que tiene a su cargo se determina:'],
    ['common-3-3', 'El tipo de esfuerzo requerido para el manejo de la carga del vehículo influye en el nivel de riesgo. Así, es más segura la manipulación que exija:'],
    ['common-3-4', '¿Qué circunstancias pueden influir negativamente en la percepción del riesgo del conductor?'],
    ['common-3-5', '¿Quién debe entregar la declaración amistosa de accidente?'],
    ['common-3-6', '¿Qué aspectos debe cuidar básicamente una empresa de transporte en sus instalaciones?'],
    ['goods-1-4', 'En el transporte de paquetería, la colocación y estiba de las mercancías en el vehículo serán por cuenta:'],
    ['goods-2-2', '¿Cuántos vocales debe tener una Junta Arbitral de Transporte?'],
    ['goods-3-7', 'El capital social de una sociedad anónima debe estar desembolsado, por lo menos, en un:'],
  ])('mantém a amostra real no objetivo %s', (chapterId, question) => {
    expect(classifySimulatorQuestion({ subject: 'Materiales Comunes', question }).chapter?.id).toBe(chapterId);
  });

  it('atribui um capítulo a todas as questões do pool estatístico', () => {
    const file = new URL('./data/simulator_questions.json', import.meta.url);
    const raw = JSON.parse(readFileSync(file, 'utf8')) as unknown[];
    const questions = raw.flat(Infinity) as Array<{ materia: string; question: string; stem: string; normalized?: string }>;
    const classified = questions.filter((question) => classifySimulatorQuestion({ subject: question.materia, question: question.question, stem: question.stem, normalized: question.normalized }).chapter);
    expect(classified).toHaveLength(questions.length);
    expect(questions.length).toBe(1000);
  });

  it('usa o mapa revisado para todo o pool, sem fallback residual por palavra-chave', () => {
    const file = new URL('./data/simulator_questions.json', import.meta.url);
    const raw = JSON.parse(readFileSync(file, 'utf8')) as unknown[];
    const questions = raw.flat(Infinity) as Array<{ materia: string; question: string; stem: string; normalized?: string }>;
    const methods = questions.reduce<Record<string, number>>((summary, question) => {
      const method = classifySimulatorQuestion({ subject: question.materia, question: question.question, stem: question.stem, normalized: question.normalized }).method;
      summary[method] = (summary[method] ?? 0) + 1;
      return summary;
    }, {});

    expect(methods.reviewed).toBe(1000);
    expect(methods.keyword ?? 0).toBe(0);
    expect(methods.unassigned ?? 0).toBe(0);
  });
});
