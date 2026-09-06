import { describe, expect, it } from 'vitest';
import { temarios } from '../client/src/data/temarios';

describe('Temario CAP Comunes — objetivos 1.1 e 1.2', () => {
  it('mantém o resumo completo e a cópia literal corrigida do objetivo 1.1', () => {
    const comunes = temarios.find((temario) => temario.id === 'common');
    const drivingBlock = comunes?.blocks.find((block) => block.id === 'common-driving');
    const topic = drivingBlock?.topics.find((item) => item.id === 'common-11');

    expect(topic?.points.pt).toHaveLength(5);
    expect(topic?.points.pt.join(' ')).toContain('par motor');
    expect(topic?.points.pt.join(' ')).toContain('1 kW = 1,36 CV');
    expect(topic?.detailedSummary).toHaveLength(17);
    expect(topic?.detailedSummary?.map((item) => item.code)).toEqual(['Base', '1', '1.1', '1.1.1', '1.1.2', '1.1.3', '1.2', '1.3', '1.4', '1.4.1', '1.4.2', '2', '2.1', '2.2', '3', '3.1', '3.2']);
    expect(topic?.detailedSummary?.find((item) => item.code === '3.2')?.essentials.pt.join(' ')).toContain('oito velocidades');
    expect(topic?.fullReading?.literalText).toContain('OBJETIVO 1.1: CONOCER LAS CARACTERÍSTICAS DE LA CADENA CINEMÁTICA PARA OPTIMIZAR SU UTILIZACIÓN.');
    expect(topic?.fullReading?.literalText).toContain('1.2. POTENCIA DEL MOTOR (TRABAJO)');
    expect(topic?.fullReading?.literalText).toContain('3.2. DIAGRAMAS DE COBERTURA');
  });

  it('mantém o resumo completo e a cópia literal corrigida do objetivo 1.2', () => {
    const comunes = temarios.find((temario) => temario.id === 'common');
    const drivingBlock = comunes?.blocks.find((block) => block.id === 'common-driving');
    const topic = drivingBlock?.topics.find((item) => item.id === 'common-12');

    expect(topic?.points.pt).toHaveLength(5);
    expect(topic?.points.pt.join(' ')).toContain('fading');
    expect(topic?.points.pt.join(' ')).toContain('ESP');
    expect(topic?.detailedSummary).toHaveLength(20);
    expect(topic?.detailedSummary?.map((item) => item.code)).toEqual(['1', '2', '2.1', '2.2', '2.2.1', '2.2.2', '2.2.3', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '14.1']);
    expect(topic?.detailedSummary?.find((item) => item.code === '14.1')?.essentials.pt.join(' ')).toContain('FCW/PCS');
    expect(topic?.fullReading?.literalText).toContain('OBJETIVO 1.2: CARACTERÍSTICAS TÉCNICAS Y FUNCIONAMIENTO DE LOS DISPOSITIVOS DE SEGURIDAD');
    expect(topic?.fullReading?.literalText).toContain('5. UTILIZACIÓN DE LOS MEDIOS DE RALENTIZACIÓN Y DE FRENADO EN LAS BAJADAS');
    expect(topic?.fullReading?.literalText).toContain('14.1. PRINCIPALES FUNCIONES ADAS');
  });
});
