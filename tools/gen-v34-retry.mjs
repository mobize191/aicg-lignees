// gen-v34-retry.mjs — régénère uniquement les prompts modifiés (liste dans /tmp/regen-v34.txt)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const prompts = JSON.parse(readFileSync(ROOT + 'tools/prompts-v34.json', 'utf8'));
const regenList = readFileSync('/tmp/regen-v34.txt', 'utf8').split('\n').filter(Boolean);
const regenSet = new Set(regenList);
const todo = prompts.filter(p => !p.bg && regenSet.has(p.file.replace('.jpg','')));
console.log('À régénérer:', todo.length, 'prompts');
writeFileSync(ROOT + 'tools/prompts-v34-retry.json', JSON.stringify(todo, null, 1));
