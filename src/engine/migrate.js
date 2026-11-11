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

// v21 -> v22 (boucle v2 lot 3) : écran de départ à 2 cartes — les sauvegardes qui ont déjà
// des cartes sautent l'écran (departFait = true), les nouvelles commencent à false.
function v21to22(s) {
  s.version = 22;
  if (typeof s.departFait !== 'boolean') s.departFait = (Array.isArray(s.instances) ? s.instances.length : 0) > 0;
  return s;
}

// v22 -> v23 (boucle v2 lot 4) : inventaire étendu — matériaux de zone, pièces d'équipement
// possédées, slots d'équipement (2 par carte + 2 d'équipe). Non destructif.
function v22to23(s) {
  s.version = 23;
  if (!s.materiaux || typeof s.materiaux !== 'object') s.materiaux = {};
  if (!s.equipment || typeof s.equipment !== 'object') s.equipment = {};
  if (!s.equip || typeof s.equip !== 'object') s.equip = {};
  if (!Array.isArray(s.equipTeam) || s.equipTeam.length !== 2) s.equipTeam = [null, null];
  return s;
}

// v23 -> v24 (économie v2 lot E4) : quêtes quotidiennes — état vierge, le défi du jour est remplacé
// (le champ dailyDone reste en sauvegarde, inerté). Non destructif.
function v23to24(s) {
  s.version = 24;
  if (!s.quetes || typeof s.quetes !== 'object') s.quetes = { day: '', list: [], bonusDone: false };
  return s;
}

// v24 -> v25 (économie v2 lot E3b) : les jetons de génération disparaissent — convertis en or
// selon la table JETON_OR en data (taux PROPOSÉ), puis vidés. Non destructif.
function v24to25(s) {
  s.version = 25;
  const table = DATA.engine.JETON_OR ?? {};
  const jetons = Array.isArray(s.tokens) ? s.tokens : [];
  const or = jetons.reduce((a, t) => a + (table[t?.rar] ?? table.C ?? 100), 0);
  if (or > 0) s.gold = (s.gold ?? 0) + or;
  s.tokens = [];
  return s;
}

// v25 -> v26 (bloc visuel : errance top-down) : état d'errance + zones débloquées, vierges. Non destructif.
function v25to26(s) {
  s.version = 26;
  if (!s.errance || typeof s.errance !== 'object') s.errance = null;
  if (!Array.isArray(s.zonesUnlocked)) s.zonesUnlocked = [];
  if (!Array.isArray(s.zonesVisitees)) s.zonesVisitees = [];
  return s;
}

// v26 -> v27 (reste code lot 1) : dédoublonne les sorts hérités (acc) des sauvegardes polluées
// (avant le correctif, chaque évolution recopiait les sorts courants dans acc => doublons à la fusion). Non destructif.
function v26to27(s) {
  s.version = 27;
  for (const inst of s.instances ?? []) {
    if (!Array.isArray(inst.acc)) continue;
    const seen = new Set();
    inst.acc = inst.acc.filter((sp) => {
      const k = spellKeyOf(sp);
      if (k == null) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  return s;
}

const MIGRATIONS = { 8: v8to9, 9: v9to10, 10: v10to11, 11: v11to12, 12: v12to13, 13: v13to14, 14: v14to15, 15: v15to16, 16: v16to17, 17: v17to18, 18: v18to19, 19: v19to20, 20: v20to21, 21: v21to22, 22: v22to23, 23: v23to24, 24: v24to25, 25: v25to26, 26: v26to27 };
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
