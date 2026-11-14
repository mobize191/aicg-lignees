import { readFileSync, writeFileSync } from 'node:fs';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const s = JSON.parse(readFileSync(ROOT + 'tools/species-map.json', 'utf8'));
const prompts = JSON.parse(readFileSync(ROOT + 'tools/prompts-v34.json', 'utf8'));

let fixed = 0;
const capNeg = (p) => {
  const tags = p.negative.split(',').map(x => x.trim()).filter(Boolean);
  if (tags.length > 20) {
    // Priorité: anti-cadre, R13, antlers, jellyfish, cadrage, qualité
    const priority = tags.filter(t => /card frame|blood|gore|open wounds|watermark|text,|logo|signature|antlers|jellyfish|close-up|portrait|bad quality/i.test(t));
    const rest = tags.filter(t => !priority.includes(t));
    p.negative = [...new Set([...priority, ...rest])].slice(0, 20).join(', ');
    return true;
  }
  return false;
};

for (const p of prompts) {
  if (p.bg) continue;
  let changed = false;

  // 1. Démons gel : ajouter "humanoid" si absent
  if (/^(demonDesire|succubus|succubusGreater|ladyOfDesire|asmodia|demonPit|demonGreater|demonLord|demonPrince|belzebuth|plagueDemon|plagueDemonGreater|plagueBearer|peste)$/.test(p.species)) {
    if (!/humanoid/i.test(p.positive)) {
      p.positive = p.positive.replace(/, (an assassin|a warrior|a mage|a priest|an occultist)/, ', humanoid demon, $1');
      if (!/humanoid/i.test(p.positive)) p.positive += ', humanoid';
      changed = true;
    }
  }

  // 2. Anges gel : ajouter "humanoid" + ailes explicites
  if (/^(seraphYoung|seraphBearer|angelLight|archangel|seraphUltimate|fallenAngelArdent|fallenAngelZenith|fallenStar|darkSun)$/.test(p.species)) {
    if (!/humanoid/i.test(p.positive)) { p.positive += ', humanoid'; changed = true; }
    if (!/wing/i.test(p.positive)) { p.positive += ', large feathered wings'; changed = true; }
    if (p.species === 'seraphUltimate' && !/six|6/i.test(p.positive)) { p.positive = p.positive.replace(/large white-gold feathered wings/, 'SIX large white-gold feathered wings'); changed = true; }
  }

  // 3. Fées thornQueen : ajouter tiny
  if (p.species === 'thornQueen' && !/tiny|diminutive/i.test(p.positive)) {
    p.positive = p.positive.replace(/a thorn faerie queen/, 'a tiny thorn faerie queen, diminutive'); changed = true;
  }

  // 4. Gorgon w21 : s'assurer "woman"
  if (p.species === 'gorgon' && !/woman|female/i.test(p.positive)) {
    p.positive = p.positive.replace(/a gorgon/, 'a gorgon woman, a pale beautiful woman'); changed = true;
  }

  // 5. GENDER undeadKnightF : forcer female
  if (p.species === 'undeadKnightF' && /1boy|an adult man/.test(p.positive)) {
    p.positive = p.positive.replace(/\(aged up:1\.0-2\.0\), an adult man, 1boy, male/, '(aged up:1.0-2.0), an adult woman, 1girl, female');
    p.positive = p.positive.replace(/an adult man, 1boy, male/, 'an adult woman, 1girl, female');
    p.gender = '1girl'; changed = true;
  }

  // 6. g6 beast générique : R11 concret manquant
  if (p.id === 'g6' && /a massive hulking forest beast|a hulking forest beast/i.test(p.positive)) {
    p.positive = p.positive.replace(/a a massive hulking forest beast[^,]*(,[^,]*){0,5}/, 'a colossal sylvan colossus, a massive quadruped of living wood and moss, tree-trunk legs, branch antlers, bark armor, no canine traits,');
    changed = true;
  }

  // 7. Cap négatifs à 20 tags
  if (capNeg(p)) changed = true;

  if (changed) fixed++;
}

writeFileSync(ROOT + 'tools/prompts-v34.json', JSON.stringify(prompts, null, 1));
console.log('Round 2 fixed:', fixed, 'prompts');
