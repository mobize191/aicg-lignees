#!/usr/bin/env node
// build.mjs : assemble src/ + data/ -> dist.html unique, deterministe (EXI-MOD-3, ACC-0-8)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const ENGINE_ORDER = [
  'src/engine/stats.js',
  'src/engine/spells.js',
  'src/engine/combat.js',
  'src/engine/summon.js',
  'src/engine/progression.js',
  'src/engine/migrate.js',
];

const read = (p) => {
  if (!existsSync(p)) return `/* ${p} : pas encore extrait */\n`;
  return readFileSync(p, 'utf8').replace(/\s+$/, '\n');
};

const dataNames = readdirSync('data').filter((f) => f.endsWith('.json')).sort();
const data = Object.fromEntries(
  dataNames.map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(`data/${f}`, 'utf8'))])
);

const script = [
  '/* GÉNÉRÉ par build.mjs : ne pas éditer */',
  `const DATA = ${JSON.stringify(data, null, 1)};`,
  read('src/data.js'),
  read('src/validate.js'),
  ...ENGINE_ORDER.map(read),
  read('src/ui.js'),
].join('\n');

const shell = read('src/shell.html');
const out = shell.replace('<!--SCRIPT-->', () => script);
writeFileSync('dist.html', out);
console.log(`build ok : dist.html (${out.length} caracteres, ${dataNames.length} fichiers de donnees)`);
