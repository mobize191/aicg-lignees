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
function v9to10(s) { s.version = 10; return s; }
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
