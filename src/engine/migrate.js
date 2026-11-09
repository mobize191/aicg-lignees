// src/engine/migrate.js : la chaine de migrations v8 -> version courante (EXI-SAVE-1)
// chaque migration est pure et bump la version ; aucune ne saute de palier.
// v8 -> v9 (arbres de race, EXI-P1-6) : les exemplaires évolués restent jouables dans le
// nouvel arbre ; la voie est re-choisie depuis trees.json quand la carte en a un éveil.
function v8to9(s) {
  s.version = 9;
  for (const inst of s.instances ?? []) {
    const ev = eveilsOf(inst.id)[0];
    if (ev && !inst.voie) inst.voie = ev.voie;
  }
  return s;
}
// v9 -> v10 (sorts, EXI-P2-7) : les sorts connus sont re-mappés par la fusion-map
// (signature -> cran ou unique) ; aucun sort appris n'est perdu.
function v9to10(s) {
  s.version = 10;
  const monsters = DATA.monsters ?? [];
  const bySignature = new Map();
  for (const m of monsters) if (m.soloSpell) bySignature.set(m.soloSpell, m.id);
  for (const inst of s.instances ?? []) {
    const connus = inst.acc ?? inst.sorts ?? [];
    const remappes = [];
    for (const sp of connus) {
      const nom = sp.nom ?? sp.name ?? null;
      const monstreId = nom ? bySignature.get(nom) : null;
      const entry = monstreId ? (FUSION_MAP[(monsters.find((m) => m.id === monstreId) ?? {}).dungeon] ?? {}).signatures?.[monstreId] : null;
      if (entry) {
        remappes.push(entry.unique ? { sort: entry.unique, unique: true } : { sort: entry.fusion, cran: entry.cran });
      } else if (nom) {
        remappes.push({ nom, legacy: true });
      } else {
        remappes.push(sp);
      }
    }
    inst.sorts = remappes;
    inst.acc = remappes;
  }
  return s;
}
function v10to11(s) { s.version = 11; return s; }
function v11to12(s) { s.version = 12; return s; }
const MIGRATIONS = { 8: v8to9, 9: v9to10, 10: v10to11, 11: v11to12 };
function migrate(save) {
  let s = save;
  const target = DATA.engine.CURRENT_VERSION;
  while ((s.version ?? 0) < target) {
    const fn = MIGRATIONS[s.version];
    if (!fn) throw new Error(`pas de migration depuis la version ${s.version}`);
    s = fn(s);
  }
  return s;
}
