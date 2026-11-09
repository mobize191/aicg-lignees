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
  return errors;
}
