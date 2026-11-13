// patch-species-v32.mjs — applique R11 à species-map.json (verrous 3.2, 12/11) :
// descriptions d'espèce concrètes (canon MTG/LotR/Atlantide Disney), nouvelles espèces
// (goblin, gorgon), familles seuil/miroir/pont, nommées des 37 cartes manquantes.
// bump _meta.version = 2.
import { readFileSync, writeFileSync } from 'node:fs';

const P = new URL('./species-map.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const m = JSON.parse(readFileSync(P, 'utf8'));

m._meta.version = 2;
m._meta.date = '2026-11-12';
m._meta.r11 = 'Verrous R11-R14 (12/11) : descriptions d\'espèce concrètes canon MTG/LotR ; léviathan = canon Atlantide Disney (carapace de crustacé, yeux rouges, gueule à tentacules) ; gobelin = petite créature verte noueuse à grandes oreilles. Nouvelles espèces goblin/gorgon ; familles seuil/miroir/pont ; nommées c1-c14, p5, p6, w6, w18, w19-w21.';

// --- R11 : réécriture des descriptions d'espèce (morphologie concrète) ---
Object.assign(m.speciesTags, {
  goblin: ['a small wiry green-skinned goblin, long pointed ears, hooked nose, hunched posture, yellow eyes, ragged loincloth, clawed hands, no human proportions'],
  gorgon: ['a monstrous gorgon beast, a massive serpentine-haired creature, a head of living snakes atop a hulking reptilian body, scaled hide, fangs, no human anatomy'],
  seaBehemoth: ['a colossal ancient armored sea monster like the Leviathan from Atlantis: The Lost Empire, massive crustacean shell carapace, glowing red eyes, tentacled maw, rows of jagged teeth, dark underwater ruins'],
  seaSerpent: ['a colossal sea serpent, an elongated scaled serpentine body, dorsal fins, a gaping fanged maw, gleaming eyes, no limbs, no human traits'],
  magmaGolem: ['a hulking magma golem made of molten rock and black volcanic stone, glowing lava cracks across its body, jagged stone limbs, ember eyes in a crude rock face, no human anatomy'],
  fireElemental: ['a towering elemental of living flame, body made of fire and smoke with an ember core, no solid human body, no human face, wreathed in blazing fire'],
  fireLord: ['a colossal fire lord of molten slag and burning rock, beast-like massive body, crown of embers, glowing ember eyes, no humanoid proportions'],
  treant: ['an ent, a towering tree-being like Tolkien\'s Ents, thick bark skin, branch arms, root legs, a deep-set wooden face with glowing eyes, moss and lichen growths'],
  fungusQueen: ['a fungal creature in the style of Magic: The Gathering fungus, mushroom caps and fungal growths on a stocky non-human body, spore clouds, no human face, no human anatomy'],
  phoenixFirebird: ['a giant phoenix firebird, fully avian body with beak and talons, blazing wings of ember feathers, no arms, no human features'],
  reaper: ['a grim reaper, a hooded skeletal figure in a tattered cloak, skull face with glowing eyes, holding a scythe, clearly undead'],
  lich: ['a lich, an undead skeletal sorcerer, exposed skull with glowing arcane eyes, tattered arcane robes hanging from a skeletal frame, no living flesh'],
  undeadCaptain: ['an undead ship captain, a skeletal sea-soaked figure in a tattered captain coat, skeletal face, holding a harpoon, clearly non-living'],
  widowGhost: ['a spectral widow ghost, a translucent pale figure in a tattered veil and dress, ghostly and incorporeal, floating'],
  banshee: ['a banshee, a spectral undead woman with long flowing white hair, tattered grave clothes, translucent ghostly body, mouth open in a wailing scream'],
  beast: ['a hulking monstrous beast, claws, fangs, thick hide, no human traits'],
  beastWater: ['a massive amphibious sea beast, scaly wet hide, fins and webbed claws, a gaping fanged maw, glowing eyes, no human traits'],
  beastFire: ['a hulking beast of ember and ash, smoke-blackened fur, burning eyes, claws and fangs, nostrils wreathed in smoke, no human traits'],
  beastWood: ['a massive hulking forest beast of bark and thorns, moss-covered hide, branch antlers, clawed paws, fangs, no human traits'],
  beastDark: ['a hulking shadow beast of the crypt, dark matted fur, glowing pale eyes, long claws and fangs, a monstrous quadruped, no human traits'],
});

// --- espèces beast:true explicites (R8/R11) ---
m.beastSpecies = ['beast', 'beastWater', 'beastFire', 'beastWood', 'beastDark', 'seaSerpent', 'seaBehemoth',
  'treant', 'magmaGolem', 'fireElemental', 'phoenixFirebird', 'fireLord', 'goblin', 'gorgon', 'fungusQueen'];

// --- LoRAs candidats par espèce (appliqués SEULEMENT si verdict GARDÉ, tools/lora-verdicts-v32.json) ---
m.loraBySpecies = {
  goblin: { file: 'IL_10.safetensors', trigger: 'g0bl1nr4ce' },
  treant: { file: 'Forest-Guardians-000014.safetensors', trigger: 'FG-V2.0-Treant' },
  dryad: { file: 'Forest-Guardians-000014.safetensors', trigger: 'FG-V2.0-Dryad' },
  fireflySpirit: { file: 'Forest-Guardians-000014.safetensors', trigger: 'FG-V2.0-Spirit' },
  magmaGolem: { file: 'Golems.safetensors', trigger: 'Magma Golem' },
  seaBehemoth: { file: 'Leviatan.safetensors', trigger: 'leviathan a sea monster' },
  lich: { file: 'wow-undead.safetensors', trigger: 'xundeadx' },
  reaper: { file: 'wow-undead.safetensors', trigger: 'xundeadx' },
  undeadCaptain: { file: 'wow-undead.safetensors', trigger: 'xundeadx' },
  widowGhost: { file: 'wow-undead.safetensors', trigger: 'xundeadx' },
  banshee: { file: 'Banshee.safetensors', trigger: 'banshee' },
  fungusQueen: { file: 'Cordyceps_XL.safetensors', trigger: 'crdcps' },
  beastDark: { file: 'Creepy Wolf Monster (SFW-NSFW) - IL.safetensors', trigger: 'CWM-WolfIL' },
};

// --- familles du contenu v3 (Seuil / Miroir / Pont) ---
Object.assign(m.families, {
  seuil: { species: 'human', univers: 'Zénith', note: 'NOUVELLE (v3.2) : arbitres du Seuil, tenues de cérémonie lumineuse (R12)' },
  miroir: { species: 'echoSpirit', univers: 'Zénith', note: 'NOUVELLE (v3.2) : chœur miroir, esprits du reflet' },
  pont: { species: 'fateWeaver', univers: 'Zénith', note: 'NOUVELLE (v3.2) : tisseuses du pont, fils dorés du destin' },
});

// --- nommées des 37 cartes manquantes ---
Object.assign(m.named, {
  c1: { name: 'Yuki, Lame Ardente', gender: '1girl', species: 'human', age: 'adulte aguerri', ipa: 'b1', note: 'compagnon UR — identité verrouillée par IPAdapter depuis la graine b1 ; c8 (L) ref c1' },
  c2: { name: 'Onyx, Lame Funeste', gender: '1boy', species: 'human', age: 'adulte aguerri', ipa: 'b2', note: 'compagnon UR, ref b2 ; c9 (L) ref c2' },
  c3: { name: 'Naïa, Source du Large', gender: '1girl', species: 'human', age: 'adulte aguerri', ipa: 'b3', note: 'compagnon UR, ref b3 ; c10 (L) ref c3' },
  c4: { name: 'Aïna, Chant de l’Aube', gender: '1girl', species: 'human', age: 'adulte aguerri', ipa: 'b4', note: 'compagnon UR, ref b4 ; c11 (L) ref c4' },
  c5: { name: 'Roc, Montagne Vivante', gender: '1boy', species: 'human', age: 'adulte aguerri', ipa: 'b5', note: 'compagnon UR, ref b5 ; c12 (L) ref c5' },
  c6: { name: 'Ember, Flamme Vive', gender: '1girl', species: 'human', age: 'adulte aguerri', ipa: 'b6', note: 'compagnon UR, ref b6 ; c13 (L) ref c6' },
  c7: { name: 'Sylve, Griffe Sylvestre', gender: '1girl', species: 'human', age: 'adulte aguerri', ipa: 'b7', note: 'compagnon UR, ref b7 ; c14 (L) ref c7' },
  c8: { name: 'Yuki, Sabre de l’Aurore', gender: '1girl', species: 'human', age: 'force de l’âge légendaire', ipa: 'c1', note: 'compagnon L — IPAdapter depuis c1 (UR) pour la MÊME identité' },
  c9: { name: 'Onyx, Ombre Éternelle', gender: '1boy', species: 'human', age: 'force de l’âge légendaire', ipa: 'c2', note: 'L, ref c2' },
  c10: { name: 'Naïa, Marée Éternelle', gender: '1girl', species: 'human', age: 'force de l’âge légendaire', ipa: 'c3', note: 'L, ref c3' },
  c11: { name: 'Aïna, Aurore Immortelle', gender: '1girl', species: 'human', age: 'force de l’âge légendaire', ipa: 'c4', note: 'L, ref c4' },
  c12: { name: 'Roc, Rempart du Monde', gender: '1boy', species: 'human', age: 'force de l’âge légendaire', ipa: 'c5', note: 'L, ref c5' },
  c13: { name: 'Ember, Soleil Captif', gender: '1girl', species: 'human', age: 'force de l’âge légendaire', ipa: 'c6', note: 'L, ref c6' },
  c14: { name: 'Sylve, Âme du Bosquet', gender: '1girl', species: 'human', age: 'force de l’âge légendaire', ipa: 'c7', note: 'L, ref c7' },
  p5: { name: 'Séraphin, Porteur de Lumière', gender: '1boy', species: 'human', age: 'éternel', extra: 'a divine angelic being with halo and wings', note: 'séraphin (UR seuil)' },
  p6: { name: 'Séraphin, Chérubin Éveillé', gender: '1boy', species: 'human', age: 'éternel', extra: 'a divine angelic being with halo and wings', note: 'chérubin (L seuil) — même identité que p5 (hypothèse : séraphin masculin, voir rapport)' },
  w6: { name: 'Kairos, Juge Éternel', gender: '1boy', species: 'human', age: 'éternel', ipa: 'kairos', note: 'vidéo WAN wan21-kairos.webm existe : art fixe aligné via IPAdapter sur la ref kairos' },
  w18: { name: 'Ananké, Gardienne des Rives', gender: '1girl', species: 'human', age: 'éternelle', ipa: 'wan21-ananke', note: 'vidéo WAN wan21-ananke.webm existe : IPAdapter sur la ref vidéo' },
  w19: { name: 'Sirène Nouvelle', gender: '1girl', species: 'mermaid', age: 'adulte', note: 'sirène = humanoïde assumé (écailles)' },
  w20: { name: 'Fée Nouvelle', gender: '1girl', species: 'fireflySpirit', age: 'adulte', note: 'fée = humanoïde assumé' },
  w21: { name: 'Gorgonne Nouvelle', gender: null, species: 'gorgon', beast: true, age: null, note: 'bête à chevelure de serpents (R11 morphologie pure)' },
});

writeFileSync(P, JSON.stringify(m, null, 2) + '\n');
console.log('species-map.json v2 :', Object.keys(m.speciesTags).length, 'speciesTags,', Object.keys(m.named).length, 'named, beastSpecies =', m.beastSpecies.length);
