// src/validate.js : le contrat de donnees (spec section 4), messages en francais
function validate(data, errors) {
  const push = (msg, ref) => errors.push(`${msg} (${ref})`);
  const cards = [...(data.cards ?? []), ...(data.monsters ?? [])];
  const ids = new Set(cards.map((c) => c.id));
  if (ids.size !== cards.length) push('des cartes partagent le meme id', 'EXI-DATA-3');
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
      if (![0, 10, 20, 30].includes(pct)) push(`la race ${race} a un cran ${cran} à ${pct} % (attendu 0/10/20/30)`, 'EXI-P1-1');
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
  // zones (EXI-P1-4) : cadence, drops N, références
  for (const z of data.zones ?? []) {
    if (z.cadence !== 'zone') push(`la zone ${z.id} n'a pas la cadence "zone"`, 'EXI-P4-2');
    for (const id of z.poolN ?? []) {
      if (!allIds.has(id)) push(`la zone ${z.id} référence la naissance inconnue ${id}`, 'EXI-P1-4');
    }
    const taux = z.drops?.N;
    if (taux !== undefined && (typeof taux !== 'number' || taux < 0 || taux > 1)) {
      push(`la zone ${z.id} a un taux N invalide (${taux})`, 'EXI-P1-4');
    }
  }
  // sorts d'école (EXI-P2-2, ACC-2-1) : école existante, 4 marches ou vide motivé,
  // coûts strictement croissants, taux décroissants quand la largeur monte
  const ecoles = data.schools ?? {};
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
    const sigsBiome = (data.monsters ?? []).filter((m) => m.dungeon === biome).map((m) => m.id);
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
  return errors;
}
