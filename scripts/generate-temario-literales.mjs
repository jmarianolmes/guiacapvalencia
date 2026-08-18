import fs from 'node:fs';

const sourcePath = '/home/ubuntu/Downloads/temario-extract/apostila_tecnica_transcricao_literal_corrigida.txt';
const outputPath = '/home/ubuntu/guia-cap-valencia-pro/client/src/data/temarioLiterales.ts';
const source = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
const firstObjective = 'OBJETIVO 1.1: CONOCER LAS CARACTERÍSTICAS DE LA CADENA CINEMÁTICA PARA OPTIMIZAR SU UTILIZACIÓN.';
const secondObjective = 'OBJETIVO 1.2: CARACTERÍSTICAS TÉCNICAS Y FUNCIONAMIENTO DE LOS DISPOSITIVOS DE SEGURIDAD A FIN DE DOMINAR EL VEHÍCULO, MINIMIZAR SU DESGASTE Y PREVENIR ANOMALÍAS.';
const secondStart = source.indexOf(secondObjective);

if (secondStart < 0) {
  throw new Error('Não foi possível localizar o cabeçalho literal do Objetivo 1.2.');
}

const objective11Source = source.slice(0, secondStart).trim();
const objective11 = objective11Source.startsWith(firstObjective)
  ? objective11Source
  : `${firstObjective}\n${objective11Source}`;
const objective12 = source.slice(secondStart).trim();

const escapeTemplate = (text) => text.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

fs.writeFileSync(outputPath, `// Gerado exclusivamente a partir da transcrição literal corrigida fornecida pelo utilizador.\n// Não editar manualmente: regenerar a partir da apostila quando houver uma nova transcrição.\n\nexport const objetivo11Literal = String.raw\`${escapeTemplate(objective11)}\`;\n\nexport const objetivo12Literal = String.raw\`${escapeTemplate(objective12)}\`;\n`);

console.log(`Objetivo 1.1: ${objective11.length} caracteres`);
console.log(`Objetivo 1.2: ${objective12.length} caracteres`);
