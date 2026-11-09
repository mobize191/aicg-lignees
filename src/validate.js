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
  return errors;
}
