// src/data.js : acces unique aux donnees + validation au chargement (EXI-P0-3)
const errors = [];
validate(DATA, errors);
if (errors.length && typeof document !== 'undefined') {
  document.body.insertAdjacentHTML('beforeend',
    `<pre style="color:#f88;padding:12px">DONNEES INVALIDES :\n${errors.join('\n')}</pre>`);
}
const index = (arr) => Object.fromEntries((arr ?? []).map((x) => [x.id ?? x.key, x]));
const IDX = {
  cards: index(DATA.cards), monsters: index(DATA.monsters),
  families: Object.fromEntries(Object.entries(DATA.families ?? {})),
  schools: index(DATA.schools), grimoire: index(DATA.grimoire?.spells),
  trees: index(DATA.trees), zones: index(DATA.zones),
};
const getCard = (id) => IDX.cards[id];
const getMonster = (id) => IDX.monsters[id];
const getSpell = (id) => IDX.grimoire[id];
const getSchool = (id) => IDX.schools[id];
const getFamily = (id) => IDX.families[id];
const getTree = (id) => IDX.trees[id];
const getZone = (id) => IDX.zones[id];
