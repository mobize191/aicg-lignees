// src/validate.js : le contrat de donnees (spec section 4), messages en francais
function validate(data, errors) {
  const push = (msg, ref) => errors.push(`${msg} (${ref})`);
  const cards = [...(data.cards ?? []), ...(data.monsters ?? [])];
  const ids = new Set(cards.map((c) => c.id));
  if (ids.size !== cards.length) push('des cartes partagent le meme id', 'EXI-DATA-3');
  // charte des nommees : une nommee (nom complet "prenom, titre") = un meme personnage sur
  // toute sa lignee. Le nom complet des nommees doit donc etre unique (arbitrage 10/11/2026) ;
  // les prenoms repetes a titres differents (deux branches d'une meme lignee) et les titres
  // generiques sans prenom restent hors regle.
  const nomsComplets = new Map();
  for (const c of cards) {
    if (typeof c.name !== 'string' || !c.name.includes(',')) continue;
    if (nomsComplets.has(c.name)) push(`deux cartes portent le meme nom de nommee : ${c.name} (${nomsComplets.get(c.name)} et ${c.id})`, 'EXI-DATA-3');
    else nomsComplets.set(c.name, c.id);
  }
  for (const m of data.monsters ?? []) {
    for (const s of m.spells ?? []) {
      if (!s.nom && !s.name) push(`le monstre ${m.id} porte un sort sans nom`, 'EXI-DATA-1');
    }
  }
  const cardIds = new Set((data.cards ?? []).map((c) => c.id));
  const monsterIds = new Set((data.monsters ?? []).map((m) => m.id));
  const allIds = new Set([...cardIds, ...monsterIds]);
  for (const c of data.cards ?? []) {
    if (c.family && !(data.families ?? {})[c.family]) {
      push(`la carte ${c.id} reference la famille inconnue ${c.family}`, 'EXI-DATA-1');
    }
  }
  for (const [fam, f] of Object.entries(data.families ?? {})) {
    for (const step of [...(f.steps ?? []), ...(f.future ?? [])]) {
      if (!cardIds.has(step)) push(`la famille ${fam} reference la carte inconnue ${step}`, 'EXI-DATA-1');
    }
  }
  for (const [from, choices] of Object.entries(data.evolutions ?? {})) {
    if (!allIds.has(from)) push(`l'evolution depuis ${from} part d'une carte inconnue`, 'EXI-DATA-1');
    for (const ch of choices ?? []) {
      if (!allIds.has(ch.to)) push(`l'evolution de ${from} mene a la carte inconnue ${ch.to}`, 'EXI-DATA-1');
    }
  }
  const dungeonIds = new Set([...(data.dungeons ?? []).map((d) => d.id), ...Object.keys(data['monster-families'] ?? {})]);
  for (const m of data.monsters ?? []) {
    if (m.dungeon && !dungeonIds.has(m.dungeon)) {
      push(`le monstre ${m.id} appartient au donjon inconnu ${m.dungeon}`, 'EXI-DATA-1');
    }
  }
  for (const [from, to] of Object.entries(data['solo-steps'] ?? {})) {
    if (!allIds.has(from)) push(`le solo-step depuis ${from} part d'une carte inconnue`, 'EXI-DATA-1');
    if (!allIds.has(to)) push(`le solo-step de ${from} mene a la carte inconnue ${to}`, 'EXI-DATA-1');
  }
  for (const [biome, fams] of Object.entries(data['monster-families'] ?? {})) {
    if (!dungeonIds.has(biome)) push(`les familles de monstres du biome inconnu ${biome}`, 'EXI-DATA-1');
    for (const fam of fams ?? []) {
      const entrees = [...(fam.lines ?? []), ...(fam.side ?? [])].map((l) => (Array.isArray(l) ? l : [l]));
      for (const line of entrees) {
        for (const id of [...line, fam.mythic].filter(Boolean)) {
          if (!monsterIds.has(id)) push(`la famille ${fam.name} reference le monstre inconnu ${id}`, 'EXI-DATA-1');
        }
      }
    }
  }
  // arbres de race (EXI-P1-1) : refs, crans 10/20/30, noms d'éveils uniques, remplace exige disparait
  const nomsEveils = new Set();
  for (const [race, tree] of Object.entries(data.trees ?? {})) {
    for (const [cran, pct] of Object.entries(tree.crans ?? {})) {
      if (![0, 5, 10, 15].includes(pct)) push(`la race ${race} a un cran ${cran} à ${pct} % (attendu 0/5/10/15)`, 'EXI-P1-1');
    }
    for (const ev of tree.eveils ?? []) {
      if (!allIds.has(ev.de)) push(`l'éveil de ${race} part de la carte inconnue ${ev.de}`, 'EXI-P1-1');
      if (!allIds.has(ev.vers)) push(`l'éveil de ${race} mène à la carte inconnue ${ev.vers}`, 'EXI-P1-1');
      const nom = (cards.find((c) => c.id === ev.vers)?.name ?? '') + '|' + ev.de;
      if (nomsEveils.has(nom)) push(`doublon d'éveil ${ev.de} -> ${ev.vers} dans ${race}`, 'EXI-P1-2');
      nomsEveils.add(nom);
      if (ev.effet === 'remplace' && !ev.disparait) push(`l'éveil ${ev.de} -> ${ev.vers} est "remplace" sans disparait`, 'EXI-P1-2');
      if (ev.disparait && !allIds.has(ev.disparait)) push(`l'éveil ${ev.de} -> ${ev.vers} fait disparaître la carte inconnue ${ev.disparait}`, 'EXI-P1-2');
      for (const p of ev.portes ?? []) {
        if (!p.id || !p.nom) push(`la porte d'un éveil de ${race} manque id ou nom`, 'EXI-P1-1');
      }
    }
  }
  // noms de cartes : pas de collision Ange Éveillé / Éveillé du Seuil (EXI-P1-2)
  const noms = (data.cards ?? []).map((c) => c.name);
  if (new Set(noms).size !== noms.length) push('des cartes partagent le meme nom', 'EXI-P1-2');
  // zones (EXI-P1-4, EXI-P4-1, EXI-P4-2) : cadence, drops N, rencontres, récoltes, enseignements
  // lot 5 donjons par famille (EXI-DJ-1) : pool valide, escalier de boss (M interdit), royale = palier+10, zone.donjon existe
  for (const d of data.dungeons ?? []) {
    if (!(d.region >= 1 && d.region <= 4)) push(`le donjon ${d.id} a une region invalide (${d.region})`, 'EXI-DJ-1');
    if (!(d.palier >= 1)) push(`le donjon ${d.id} a un palier invalide (${d.palier})`, 'EXI-DJ-1');
    for (const id of d.pool ?? []) {
      const pm = data.monsters?.find((m) => m.id === id);
      if (!pm) push(`le donjon ${d.id} a un pool inconnu ${id}`, 'EXI-DJ-1');
      else if (pm.horsPool) push(`le donjon ${d.id} met un boss horsPool ${id} dans son pool`, 'EXI-DJ-1');
    }
    for (const bp of d.bossPaliers ?? []) {
      const ref = data.monsters?.find((m) => m.id === bp.ref);
      if (!ref) push(`le donjon ${d.id} a un bossPaliers inconnu ${bp.ref}`, 'EXI-DJ-1');
      else if (ref.rarity === 'M' && bp.floor !== d.floors) push(`le donjon ${d.id} met un M (${bp.ref}) dans un escalier (autorise en boss final seulement)`, 'EXI-DJ-1');
    }
    if (d.royale) {
      const attendu = (d.palier ?? 0) + 10; // chaîne royale = palier + 10 (spec §1), cap 100 = lot 9
      if (d.royale.palier !== attendu) push(`le donjon ${d.id} a une royale palier ${d.royale.palier} au lieu de ${attendu}`, 'EXI-DJ-1');
      if (d.royale.boss && !monsterIds.has(d.royale.boss)) push(`le donjon ${d.id} a un boss royal inconnu ${d.royale.boss}`, 'EXI-DJ-1');
    }
  }
  for (const z of data.zones ?? []) {
    if (z.donjon && !(data.dungeons ?? []).some((d) => d.id === z.donjon)) push(`la zone ${z.id} pointe un donjon inconnu ${z.donjon}`, 'EXI-DJ-1');
  }
  // lot 6 fusion v4 : table de synthèse — familles connues (cartes ou monstres)
  const famsConnues = new Set([...Object.keys(data.families ?? {}), ...Object.values(data['monster-families'] ?? {}).flatMap((f) => (f ?? []).map((x) => x.name))]);
  for (const [key, p] of Object.entries(data['fusion-synthese']?.paires ?? {})) {
    for (const f of key.split('|')) if (f && !famsConnues.has(f)) push(`fusion-synthese : famille inconnue ${f} (paire ${key})`, 'EXI-DJ-2');
    if (p.famille && p.famille !== 'A' && p.famille !== 'B' && p.famille !== 'hasard' && !famsConnues.has(p.famille)) push(`fusion-synthese : cible inconnue ${p.famille} (paire ${key})`, 'EXI-DJ-2');
  }
  const F = data.engine?.FUSION ?? {};
  if (F.sautRate != null && !(F.sautRate > 0 && F.sautRate <= 1)) push('FUSION.sautRate hors bornes', 'EXI-DJ-2');
  if (F.demonRate != null && !(F.demonRate >= 0 && F.demonRate <= 1)) push('FUSION.demonRate hors bornes', 'EXI-DJ-2');
  const gemTiers = new Set(data.engine?.GEM_TIERS ?? []);
  const sortsEcoleIds = new Set((data.grimoire?.ecole ?? []).map((s) => s.id));
  for (const z of data.zones ?? []) {
    if (z.cadence !== 'zone') push(`la zone ${z.id} n'a pas la cadence "zone"`, 'EXI-P4-2');
    if (z.apres !== 'donjon') push(`la zone ${z.id} n'est pas suivie d'un donjon (jamais deux zones consécutives)`, 'EXI-P4-2');
    for (const id of z.poolN ?? []) {
      if (!allIds.has(id)) push(`la zone ${z.id} référence la naissance inconnue ${id}`, 'EXI-P1-4');
    }
    for (const id of z.rencontres ?? []) {
      if (!monsterIds.has(id)) push(`la zone ${z.id} a une rencontre inconnue ${id}`, 'EXI-P4-1');
    }
    for (const tier of z.recoltes?.eclats?.tiers ?? []) {
      if (!gemTiers.has(tier)) push(`la zone ${z.id} récolte un éclat de tier inconnu ${tier}`, 'EXI-P4-1');
    }
    const taux = z.drops?.N;
    if (taux !== undefined && (typeof taux !== 'number' || taux < 0 || taux > 1)) {
      push(`la zone ${z.id} a un taux N invalide (${taux})`, 'EXI-P1-4');
    }
    for (const tauxR of [z.recoltes?.eclats?.taux, z.recoltes?.jetons?.taux]) {
      if (tauxR !== undefined && (typeof tauxR !== 'number' || tauxR < 0 || tauxR > 1)) {
        push(`la zone ${z.id} a un taux de récolte hors bornes (${tauxR})`, 'EXI-P4-1');
      }
    }
    // boucle v2 lot 3 : taux de recrutement naturel calibré par zone, jamais en dur
    const tauxRec = z.recrute?.taux;
    if (tauxRec !== undefined && (typeof tauxRec !== 'number' || tauxRec < 0 || tauxRec > 1)) {
      push(`la zone ${z.id} a un taux de recrue hors bornes (${tauxRec})`, 'EXI-DATA-1');
    }
    for (const e of z.ecolages ?? []) {
      if (!sortsEcoleIds.has(e.sort)) push(`la zone ${z.id} enseigne le sort inconnu ${e.sort}`, 'EXI-P4-1');
      else if (!(data.grimoire.ecole.find((s) => s.id === e.sort)?.crans ?? {})[e.cran]) {
        push(`la zone ${z.id} enseigne le cran inconnu ${e.cran} de ${e.sort}`, 'EXI-P4-1');
      }
    }
  }
  // sorts d'école (EXI-P2-2, ACC-2-1) : école existante, 4 marches ou vide motivé,
  // coûts strictement croissants, taux décroissants quand la largeur monte
  const ecoles = data.schools ?? {};
  // lot 3 refonte v2 (E) : modificateur d'ecole en data, bornes lisibles
  for (const [key, sc] of Object.entries(ecoles)) {
    const mod = sc?.mod;
    if (!mod) continue;
    if (mod.mult != null && !(mod.mult > 0 && mod.mult <= 2)) push(`l'ecole ${key} a un mod.mult hors bornes (${mod.mult})`, 'EXI-DATA-4');
    if (mod.cout != null && !(mod.cout > 0 && mod.cout <= 2)) push(`l'ecole ${key} a un mod.cout hors bornes (${mod.cout})`, 'EXI-DATA-4');
  }
  // lot 4 refonte v2 : tables de deblocage par niveau (J6/J11) et sorts de trio (J7)
  const cransValides = new Set(['I', 'II', 'III', 'IV']);
  for (const [niv, cran] of Object.entries(data.engine?.SORTS_NIVEAU ?? {})) {
    if (!(Number(niv) >= 1) || !cransValides.has(cran)) push(`SORTS_NIVEAU : niveau ${niv} -> cran ${cran} invalide`, 'EXI-DATA-5');
  }
  const tousLesSorts = [...(data.grimoire?.ecole ?? []), ...(data.grimoire?.entrees ?? []), ...(data.grimoire?.communs ?? []), ...(data.grimoire?.race ?? []), ...(data.grimoire?.uniques ?? [])].map((s) => s.id);
  for (const [niv, ids] of Object.entries(data.engine?.HYBRIDES_NIVEAU ?? {})) {
    for (const id of ids ?? []) if (!tousLesSorts.includes(id)) push(`HYBRIDES_NIVEAU ${niv} : sort inconnu ${id}`, 'EXI-DATA-5');
  }
  for (const tr of data.engine?.SORTS_TRIO ?? []) {
    if (!tr.nom || !(tr.cout >= 1) || !(tr.mult > 0)) push(`SORTS_TRIO : entree invalide (${tr.nom ?? 'sans nom'})`, 'EXI-DATA-5');
  }
  // lot 8 shiny (suite 40) : bloc SHINY en data, bornes coherentes
  const SH = data.engine?.SHINY ?? null;
  if (!SH) push('bloc SHINY manquant dans engine.json', 'EXI-DATA-6');
  else {
    if (!(SH.taux > 0 && SH.taux <= 1)) push('SHINY.taux hors bornes (]0-1])', 'EXI-DATA-6');
    if (!(SH.bonusMin > 0 && SH.bonusMax >= SH.bonusMin && SH.bonusMax <= 1)) push('SHINY.bonusMin/bonusMax hors bornes (0 < min <= max <= 1)', 'EXI-DATA-6');
    if (typeof SH.artSuffixe !== 'string' || !SH.artSuffixe.length) push('SHINY.artSuffixe invalide', 'EXI-DATA-6');
    if (!Number.isInteger(SH.migrationSeed)) push('SHINY.migrationSeed non entier', 'EXI-DATA-6');
  }
  // lot 9 XP 1-100 : courbe cubique + table de minutes par niveau + étirement des niveaux de donjon (grille v1)
  const XP9 = data.engine?.XP ?? null;
  if (!XP9) push('bloc XP manquant dans engine.json', 'EXI-DATA-7');
  else {
    if (!['cubique', 'quadratique'].includes(XP9.courbe ?? '')) push('XP.courbe inconnue (cubique|quadratique)', 'EXI-DATA-7');
    const mt = XP9.minutesParTranche ?? XP9.minutesParNiveau ?? null;
    if (!mt || !Object.entries(mt).length || !Object.values(mt).every((v) => Number(v) > 0)) push('XP.minutesParTranche invalide (tranches de niveaux > 0)', 'EXI-DATA-7');
    if (!(Number(XP9.minutesParCombat) > 0)) push('XP.minutesParCombat invalide', 'EXI-DATA-7');
    if (!(Number(XP9.niveauxParTranche) >= 1)) push('XP.niveauxParTranche invalide', 'EXI-DATA-7');
  }
  if (!(Number(data.engine?.LEVEL_CAP) >= 20)) push('LEVEL_CAP < 20 (progression 1-100 attendue)', 'EXI-DATA-7');
  if (!(Number(data.engine?.moteur?.DUNGEON_LEVEL_STRETCH) >= 1)) push('moteur.DUNGEON_LEVEL_STRETCH < 1', 'EXI-DATA-7');
  if (!(Number(data.engine?.moteur?.LEGACY_LEVEL_CAP) >= 1)) push('moteur.LEGACY_LEVEL_CAP invalide', 'EXI-DATA-7');
  // correctifs-eq v2 lot 2 : signatures hybrides des monstres soigneurs (soinPct = fraction des degats rendus)
  if (!(Number(data.engine?.moteur?.SIGNATURE_SOIN_PCT) > 0 && Number(data.engine?.moteur?.SIGNATURE_SOIN_PCT) < 1)) push('moteur.SIGNATURE_SOIN_PCT hors bornes (]0-1[)', 'EXI-DATA-8');
  // v3.4 Exception (suite 61) : bloc EXCEPTION en data (taux du tirage, seuil du thème Repos, seed de migration)
  const EX = data.engine?.EXCEPTION ?? null;
  if (!EX) push('bloc EXCEPTION manquant dans engine.json', 'EXI-DATA-9');
  else {
    if (!(EX.taux > 0 && EX.taux <= 1)) push('EXCEPTION.taux hors bornes (]0-1])', 'EXI-DATA-9');
    if (!(EX.themeR > 0 && EX.themeR < 1)) push('EXCEPTION.themeR hors bornes (]0-1[)', 'EXI-DATA-9');
    if (!Number.isInteger(EX.migrationSeed)) push('EXCEPTION.migrationSeed non entier', 'EXI-DATA-9');
  }
  const largeurRang = (l) => (l === 'equipe' || l === 'equipe-renforcee' ? 4 : l === 'tous' ? 5 : Number(l) || 0);
  const tousSortsEcole = [...(data.grimoire?.ecole ?? []), ...(data.grimoire?.entrees ?? [])];
  const idsSorts = new Set();
  for (const s of [...tousSortsEcole, ...(data.grimoire?.communs ?? []), ...(data.grimoire?.race ?? []), ...(data.grimoire?.uniques ?? [])]) {
    if (idsSorts.has(s.id)) push(`doublon de sort ${s.id}`, 'EXI-DATA-3');
    idsSorts.add(s.id);
    if (s.ecole && !ecoles[s.ecole]) push(`le sort ${s.id} référence l'école inconnue ${s.ecole}`, 'EXI-P2-1');
  }
  for (const s of data.grimoire?.ecole ?? []) {
    const crans = Object.entries(s.crans ?? {});
    if (crans.length !== 4) push(`le sort ${s.id} n'a pas 4 crans`, 'EXI-P2-2');
    let prevCout = 0, prevTaux = 1, prevLarg = 0;
    for (const [nom, c] of crans) {
      if (c.vide) { if (!c.raison) push(`le cran ${nom} de ${s.id} est vide sans raison`, 'EXI-P2-2'); continue; }
      if (!(c.cout > prevCout)) push(`les coûts du sort ${s.id} ne sont pas strictement croissants (${nom})`, 'EXI-P2-2');
      prevCout = c.cout;
      const larg = largeurRang(c.largeur);
      if (c.taux !== undefined) {
        if (larg > prevLarg && !(c.taux < prevTaux)) push(`les taux de ${s.id} ne baissent pas quand la largeur monte (${nom})`, 'EXI-DATA-4');
        prevTaux = c.taux;
      }
      prevLarg = larg;
    }
  }
  // fusion (EXI-P2-3, EXI-P2-4) : un biome marqué trié couvre 100 % de ses signatures
  for (const [biome, b] of Object.entries(data['fusion-map'] ?? {})) {
    const sigsBiome = [
      ...(data.monsters ?? []).filter((m) => m.dungeon === biome).map((m) => m.id),
      ...(data.cards ?? []).filter((c) => c.biome === biome).map((c) => c.id),
    ];
    if (!b.trie) continue;
    for (const id of sigsBiome) {
      const entry = (b.signatures ?? {})[id];
      if (!entry) { push(`le biome ${biome} est trié mais la signature ${id} n'est pas couverte`, 'EXI-P2-3'); continue; }
      const cible = entry.unique ?? entry.fusion;
      if (!idsSorts.has(cible) && !(data.grimoire?.entrees ?? []).some((e) => e.id === cible)) {
        push(`la signature ${id} fond vers le sort inconnu ${cible}`, 'EXI-P2-3');
      }
    }
  }
  // tri d'homogénéité (T2.7, ACTÉ) : aucun sort strictement dominé au même coût,
  // même école + même rôle, sans particularité (effet/delta), même base de comparaison
  const largRang2 = (l) => (l === 'equipe' || l === 'equipe-renforcee' ? 4 : l === 'tous' ? 5 : Number(l) || 0);
  const plat = [];
  for (const s of data.grimoire?.ecole ?? []) {
    for (const [cran, c] of Object.entries(s.crans ?? {})) {
      if (c.vide) continue;
      plat.push({ id: s.id + ' ' + cran, ecole: s.ecole, role: s.role, cout: c.cout, mult: c.mult ?? 0, taux: c.taux ?? 0, larg: largRang2(c.largeur), fx: s.effet ?? null });
    }
  }
  for (const e of [...(data.grimoire?.entrees ?? []), ...(data.grimoire?.communs ?? []), ...(data.grimoire?.race ?? [])]) {
    plat.push({ id: e.id, ecole: e.ecole, role: e.role, cout: e.cout, mult: e.mult ?? 0, taux: 0, larg: largRang2(e.cible), fx: e.effet ?? null });
  }
  const byKey = new Map();
  for (const s of plat) {
    const k = s.ecole + '|' + s.role + '|' + s.cout;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(s);
  }
  for (const [k, arr] of byKey) {
    for (const a of arr) for (const b of arr) {
      if (a === b || a.fx || b.fx) continue;
      const aT = a.taux > 0, bT = b.taux > 0;
      if (aT !== bT) continue;
      const pa = aT ? a.taux : a.mult, pb = aT ? b.taux : b.mult;
      if (pa > pb && a.larg >= b.larg) push(`le sort ${b.id} est strictement dominé par ${a.id} au même coût (${k})`, 'EXI-T-3');
    }
  }
  // difficultés (boucle v2 lot 2) : bande de rareté valide et cohérente, boss dans la bande
  const ranks = new Set(Object.keys(data.engine?.RANK ?? {}));
  for (const d of data.difficulties ?? []) {
    const b = d.bande ?? null;
    if (!Array.isArray(b) || b.length !== 2 || !ranks.has(b[0]) || !ranks.has(b[1])) {
      push(`la difficulté ${d.id} a une bande invalide (${JSON.stringify(b)})`, 'EXI-DATA-1');
      continue;
    }
    if (d.minR !== b[0] || d.mobCap !== b[1]) push(`la difficulté ${d.id} : minR/mobCap ne suivent pas la bande`, 'EXI-DATA-1');
    if (!ranks.has(d.boss5) || !ranks.has(d.boss10)) push(`la difficulté ${d.id} a un boss hors rang connu`, 'EXI-DATA-1');
    else if (!(data.engine.RANK[d.boss5] < data.engine.RANK[d.boss10])) push(`la difficulté ${d.id} : boss5 >= boss10`, 'EXI-DATA-1');
  }
  // boucle v2 lot 3 : propositions de départ = 4 novices d'autant de races, tous existants
  for (const id of data.engine?.DEPART_CHOIX ?? []) {
    const c = cardIds.has(id) ? (data.cards ?? []).find((x) => x.id === id) : null;
    if (!c) push(`le départ propose la carte inconnue ${id}`, 'EXI-DATA-1');
    else if (!c.raciale) push(`la proposition de départ ${id} n'est pas une naissance`, 'EXI-DATA-1');
  }
  // équipement (boucle v2 lot 4) : slots valides, arme typée par classe, rareté connue, bonus positif
  const eqIds = new Set();
  const eqSets = new Set(Object.keys(data.equipment?.sets ?? {}));
  const classesConnues = new Set((data.engine?.CLASSES ?? []));
  for (const p of data.equipment?.pieces ?? []) {
    if (eqIds.has(p.id)) push(`doublon de pièce ${p.id}`, 'EXI-DATA-3');
    eqIds.add(p.id);
    if (!['arme', 'armure', 'equipe'].includes(p.slot)) push(`la pièce ${p.id} a un slot invalide (${p.slot})`, 'EXI-DATA-1');
    if (p.slot === 'arme' && !classesConnues.has(p.classe)) push(`l'arme ${p.id} a une classe inconnue (${p.classe})`, 'EXI-DATA-1');
    if (p.slot !== 'arme' && p.classe) push(`la pièce ${p.id} porte une classe hors arme`, 'EXI-DATA-1');
    if (!ranks.has(p.rarity)) push(`la pièce ${p.id} a une rareté inconnue (${p.rarity})`, 'EXI-DATA-1');
    if (p.set && !eqSets.has(p.set)) push(`la pièce ${p.id} référence le set inconnu ${p.set}`, 'EXI-DATA-1');
    if (p.bonus?.stat === 'manaRegen') { if (!(Number.isInteger(p.bonus.n) && p.bonus.n > 0)) push(`la pièce ${p.id} a un bonus mana invalide`, 'EXI-DATA-1'); }
    else if (!(typeof p.bonus?.pct === 'number' && p.bonus.pct > 0)) push(`la pièce ${p.id} a un pourcentage invalide`, 'EXI-DATA-1');
  }
  // zones lot 4 : matériau de zone et matière de boss
  for (const z of data.zones ?? []) {
    if (!z.materiau?.id || !z.materiau?.nom) push(`la zone ${z.id} n'a pas de matériau`, 'EXI-DATA-1');
    else if (!(typeof z.materiau.taux === 'number' && z.materiau.taux >= 0 && z.materiau.taux <= 1)) push(`la zone ${z.id} a un taux de matériau hors bornes`, 'EXI-DATA-1');
    if (!z.matiereBoss?.id || !z.matiereBoss?.nom) push(`la zone ${z.id} n'a pas de matière de boss`, 'EXI-DATA-1');
  }
  // potions (boucle v2 lot 1) : id unique, genre soin/mana, pourcentage et prix valides
  const potionIds = new Set();
  for (const [pid, p] of Object.entries(data.potions ?? {})) {
    if (potionIds.has(p.id ?? pid)) push(`doublon de potion ${p.id ?? pid}`, 'EXI-DATA-3');
    potionIds.add(p.id ?? pid);
    if (p.id !== pid) push(`la potion ${pid} porte un id différent (${p.id})`, 'EXI-DATA-3');
    if (!['soin', 'mana'].includes(p.genre)) push(`la potion ${pid} a un genre invalide (${p.genre})`, 'EXI-DATA-1');
    if (!(typeof p.pct === 'number' && p.pct > 0 && p.pct <= 1)) push(`la potion ${pid} a un pourcentage hors bornes (${p.pct})`, 'EXI-DATA-1');
    if (!(Number.isInteger(p.prix) && p.prix > 0)) push(`la potion ${pid} a un prix invalide (${p.prix})`, 'EXI-DATA-1');
  }
  return errors;
}
