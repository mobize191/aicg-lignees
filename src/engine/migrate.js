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
// v10 -> v11 (mode RPG, EXI-P3-6) : chaque exemplaire reçoit agilité et intelligence,
// dérivées de sa carte et de son niveau (formule : stat de base x bonus de niveau).
function v10to11(s) {
  s.version = 11;
  for (const inst of s.instances ?? []) {
    const c = getCard(inst.id) ?? getMonster(inst.id);
    if (!c) continue;
    const m = 1 + LEVEL_BONUS * ((inst.lvl ?? 1) - 1);
    inst.agi = Math.max(1, Math.round((c.agi ?? Math.round(c.atk * M.AGI_RATIO)) * m));
    inst.int = Math.max(1, Math.round((c.int ?? Math.round(c.atk * M.INT_RATIO)) * m));
  }
  return s;
}
// v11 -> v12 (zones, EXI-P4-5) : la forme gagne le grimoire appris et les zones visitées.
function v11to12(s) {
  s.version = 12;
  if (!Array.isArray(s.grimoire)) s.grimoire = [];
  if (!Array.isArray(s.zonesVisitees)) s.zonesVisitees = [];
  return s;
}
// v12 -> v13 (tri des biomes, EXI-T-4) : a chaque biome marque trie, les sorts connus
// qui portent encore un nom de signature legacy se re-mappent sur les crans de fusion
// (le mecanisme de la v10, reutilise biome par biome) ; v13 -> v14 rejoue le meme
// remap quand un nouveau biome passe trie (Bosquet T2.2, Crypte T2.3, Zenith T2.4,
// Recrues T2.5 : les naissances et les solos portent le champ biome).
function triRemap(s) {
  const monsters = DATA.monsters ?? [];
  const cards = DATA.cards ?? [];
  const bySignature = new Map();
  for (const m of monsters) if (m.soloSpell) bySignature.set(m.soloSpell, m.id);
  for (const c of cards) if (c.biome && c.soloSpell) bySignature.set(c.soloSpell, c.id);
  const ownerBiome = (id) => {
    const m = monsters.find((x) => x.id === id);
    if (m) return m.dungeon;
    const c = cards.find((x) => x.id === id);
    return c ? c.biome ?? null : null;
  };
  const remap = (sp) => {
    if (!sp || typeof sp !== 'object' || sp.sort) return sp;
    const nom = sp.nom ?? sp.name ?? null;
    const monstreId = nom ? bySignature.get(nom) : null;
    const entry = monstreId ? (FUSION_MAP[ownerBiome(monstreId)] ?? {}).signatures?.[monstreId] : null;
    if (!entry) return sp;
    return entry.unique ? { sort: entry.unique, unique: true } : { sort: entry.fusion, cran: entry.cran };
  };
  for (const inst of s.instances ?? []) {
    if (Array.isArray(inst.sorts)) inst.sorts = inst.sorts.map(remap);
    if (Array.isArray(inst.acc)) inst.acc = inst.acc.map(remap);
  }
  if (Array.isArray(s.grimoire)) s.grimoire = s.grimoire.map(remap);
  return s;
}
function v12to13(s) {
  s.version = 13;
  return triRemap(s);
}
function v13to14(s) {
  s.version = 14;
  return triRemap(s);
}
// v14 -> v15 (T2.3) : la Crypte passe triee, meme mecanisme.
function v14to15(s) {
  s.version = 15;
  return triRemap(s);
}
// v15 -> v16 (T2.4) : le Zenith passe trie, meme mecanisme.
function v15to16(s) {
  s.version = 16;
  return triRemap(s);
}
// v16 -> v17 (T2.5) : les recrues (naissances et solos) passent triees, meme mecanisme.
function v16to17(s) {
  s.version = 17;
  return triRemap(s);
}
// v17 -> v18 (T2.6) : les divines passent triees, meme mecanisme.
function v17to18(s) {
  s.version = 18;
  return triRemap(s);
}
// v18 -> v19 (T4.3/T4.7, lot 4 v0.47) : agi/int recalculées depuis les ratios de profil
// en données (la stat principale domine toujours), niveau conservé.
function v18to19(s) {
  s.version = 19;
  const R = DATA.engine.moteur?.STAT_RATIOS ?? {};
  for (const inst of s.instances ?? []) {
    const c = getCard(inst.id) ?? getMonster(inst.id);
    if (!c) continue;
    const m = 1 + LEVEL_BONUS * ((inst.lvl ?? 1) - 1);
    const r = R[c.classe] ?? R.Guerrier;
    if (!r) continue;
    inst.agi = Math.max(1, Math.round(c.atk * r.agi * m));
    inst.int = Math.max(1, Math.round(c.atk * r.int * m));
  }
  return s;
}
// v19 -> v20 (chantier lignes) : le champ role disparaît ; chaque équipe reçoit sa formation
// (3 devant + 2 derrière par défaut) — les emplacements restent dans l'ordre, figés avant combat.
function v19to20(s) {
  s.version = 20;
  for (const t of s.teams ?? []) t.formation = t.formation ?? '3-2';
  if (s.team) s.team.formation = s.team.formation ?? '3-2';
  return s;
}

// v20 -> v21 (boucle v2 lot 1) : les points ⚡ deviennent de l'or (1 ⚡ = 1 or), le stock de
// potions et l'état de run (PV/mana persistants) entrent en sauvegarde. Non destructif.
function v20to21(s) {
  s.version = 21;
  if (Number.isInteger(s.gold) && s.gold >= 0) s.gold = s.gold;
  else if (Number.isInteger(s.points) && s.points >= 0) s.gold = s.points * (DATA.engine.OR_PER_POINT ?? 1);
  else s.gold = 0;
  delete s.points;
  if (!s.potions || typeof s.potions !== 'object') s.potions = {};
  for (const p of Object.values(DATA.potions ?? {})) {
    if (!Number.isInteger(s.potions[p.id]) || s.potions[p.id] < 0) s.potions[p.id] = 0;
  }
  if (!s.runState || typeof s.runState !== 'object') s.runState = { active: false, units: {} };
  if (!s.runState.units || typeof s.runState.units !== 'object') s.runState.units = {};
  return s;
}

const MIGRATIONS = { 8: v8to9, 9: v9to10, 10: v10to11, 11: v11to12, 12: v12to13, 13: v13to14, 14: v14to15, 15: v15to16, 16: v16to17, 17: v17to18, 18: v18to19, 19: v19to20, 20: v20to21 };
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
