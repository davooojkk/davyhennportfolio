/* Une la entrada modular en una sola hoja para publicar en GitHub Pages.
   Ejecutar: node scripts/build-css.mjs (o --check para verificarla). */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssDir = path.join(root, 'css');
const output = path.join(cssDir, 'site.css');
const entry = await readFile(path.join(cssDir, 'style.css'), 'utf8');
const imports = [...entry.matchAll(/^@import url\(['"]?(\.\/[^'"\)]+)['"]?\);\s*$/gm)];
if (imports.length !== 15 || (entry.match(/@import/g) || []).length !== imports.length) {
    throw new Error('Revisá las importaciones de css/style.css antes de generar site.css.');
}

const parts = await Promise.all(imports.map(async ([, relative]) => {
    const filename = path.resolve(cssDir, relative);
    let source = (await readFile(filename, 'utf8')).replace(/[ \t]+$/gm, '');
    // Al mover CSS desde subdirectorios, conservar las rutas de sus recursos.
    source = source.replace(/url\(\s*(['"]?)(\.\.?(?:\/[^)'"\s]+)+)\1\s*\)/g, (_, quote, url) => {
        const adjusted = path.relative(cssDir, path.resolve(path.dirname(filename), url)).split(path.sep).join('/');
        return `url('${adjusted.startsWith('.') ? adjusted : `./${adjusted}`}')`;
    });
    return `/* ${relative} */\n${source.trimEnd()}\n`;
}));

const built = `/* Generado por node scripts/build-css.mjs. Editar css/basics/ o css/home/. */\n\n${parts.join('\n')}`;
if (process.argv.includes('--check')) {
    if (await readFile(output, 'utf8') !== built) {
        throw new Error('css/site.css está desactualizado: ejecutá node scripts/build-css.mjs.');
    }
} else {
    await writeFile(output, built);
    console.log(`css/site.css: ${Buffer.byteLength(built)} bytes, ${imports.length} módulos`);
}
