// src/engine/migrate.js : la chaine de migrations v8 -> version courante (EXI-SAVE-1)
// chaque migration est pure et bump la version ; aucune ne saute de palier.
function v8to9(s) { s.version = 9; return s; }
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
