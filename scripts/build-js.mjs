/* Une los módulos locales para evitar tres viajes de red adicionales.
   Ejecutar: node scripts/build-js.mjs (o --check para verificarlo). */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = [
    ['modules/animaciones.js', []],
    ['modules/galerias.js', []],
    ['modules/events.js', [
        "import { iniciarHero } from './animaciones.js';",
        "import { registrarGalerias } from './galerias.js';",
    ]],
    ['main.js', ["import { registrarEventos } from './modules/events.js';"]],
];

const parts = await Promise.all(sources.map(async ([file, imports]) => {
    let source = (await readFile(path.join(root, 'js', file), 'utf8')).trim();
    for (const statement of imports) {
        if (!source.includes(statement)) throw new Error(`Importación inesperada en ${file}`);
        source = source.replace(statement, '').trim();
    }
    source = source.replace(/^export function /gm, 'function ');
    if (/^(import|export)\b/m.test(source)) throw new Error(`Módulo no compatible: ${file}`);
    return `/* ${file} */\n${source}`;
}));

const output = path.join(root, 'js/site.js');
const built = `/* Generado por node scripts/build-js.mjs. Editar js/main.js o js/modules/. */\n\n${parts.join('\n\n')}\n`;
if (process.argv.includes('--check')) {
    if (await readFile(output, 'utf8') !== built) {
        throw new Error('js/site.js está desactualizado: ejecutá node scripts/build-js.mjs.');
    }
} else {
    await writeFile(output, built);
    console.log(`js/site.js: ${Buffer.byteLength(built)} bytes, ${sources.length} módulos`);
}
