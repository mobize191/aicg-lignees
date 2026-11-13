# Test des thèmes « Lignées d'Exception » : Repos vs Crépuscule vs Obscures — protocole témoin (13/11)

> ARBITRÉ Marc-Olivier : tester **3 thèmes** d'alt-art avant de lancer la vague complète. Méthode : échantillon témoin de 12 cartes (comme les tests LoRA 3.2), ~36 images, ~15-20 min de génération ComfyUI. Canon technique inchangé (§15). Seeds témoins = seed classique + 5 000 000.

## 1. Les deux thèmes

### Thème A — « Lignées au Repos » (scène de vie, canon Pokémon illustration rare)
La variante montre le personnage/la créature **hors combat, dans un moment de vie du biome**. Ajout au prompt (en plus du prompt classique de la carte, qui garde son espèce, son genre, sa DA) :
`in a quiet slice-of-life scene, [activité du biome ci-dessous], relaxed natural pose, warm intimate mood, no combat, no magic effects`
Activités par biome : Marées = réparer des filets, marché aux coquillages, pêche à la ligne sur un ponton ; Bosquet = soigner un faon, récolter des fruits, planter une pousse ; Forge = forger un outil (pas une arme), se reposer près de l'enclume, souper au feu ; Crypte = fleurir une tombe, entretenir les cierges, veillée paisible ; Zénith = prière du soir, bibliothèque céleste, bureau d'astrologue.
Les créatures non-humanoïdes ONT des scènes de vie (léviathan = se dorer au large, phénix = nid de braises, golem = trempe de métal, treant = oiseaux perchés sur ses branches) — c'est LE test de robustesse du thème.

### Thème B — « Lignées au Crépuscule » (heure inversée du biome, canon MTG showcase)
La variante garde la scène classique mais **remplace l'heure/couleur du biome par son opposé**. Remplacement dans le prompt (le décor du biome est réécrit, l'espèce et le personnage inchangés) :
- Marées : jour turquoise → **nuit bioluminescente** (`deep night scene, glowing bioluminescent coral and plankton, moonlight shafts through dark water`)
- Bosquet : vert mousse + or → **aube automnale roussie** (`russet autumn dawn, golden mist, falling amber leaves`)
- Forge : orange braise + suie → **forge éteinte, bleu spectral** (`cold blue spectral light, extinguished forge, glowing embers dying out`)
- Crypte : gris-vert bougies → **messe de l'aube pâle** (`pale dawn light through flooded windows, thin morning fog`)
- Zénith : ivoire + or → **crépuscule violet** (`violet dusk sky, threads of fate glinting like starlight`)
Pas de changement de pose ni de tenue : le thème est PORTÉ par la lumière. C'est le test de cohérence de collection (le plus proche du showcase MTG).

### Thème C — « Lignées Obscures » (inversion d'alignement, canon gacha) — AJOUTÉ 13/11 suite 19
La variante montre la carte **dans son élément opposé** : corruption pour les lumineuses, purification pour les obscures. Le prompt garde l'espèce, le personnage, la pose ; on ÉCHANGE la magie dominante (Lumière ↔ Ombre, et l'inverse couleur/magie du biome pour les neutres) et on inverse l'aura :
- Lumineux → corrompu : `corrupted by shadow, dark veins of smoky wisps, dimmed halo, ominous aura, pale sickly light`
- Obscurs/nécrotiques → purifiés : `purified by holy light, radiant golden glow dispelling the darkness, serene expression, soft dawn light`
- Neutres/élémentaires : inversion de l'élément (feu ↔ eau : golem de magma en cristal de glace bleu spectral, « a frozen magma golem, obsidian shell cracked with icy veins, cold blue mist » ; terre ↔ air, etc.)
Règle : JAMAIS de changement d'espèce ni de sang ajouté (R13 conservé) — la corruption est lumineuse/ombreuse, pas gore. Idée forte : un golem de lave en cristal de glace, une liche baignée de lumière dorée, un paladin rongé par l'ombre.



| # | Carte | Pourquoi elle teste |
|---|---|---|
| e1 | Gobelin des Marées (C) | humanoïde générique, la reine des familles |
| e13 | Léviathan, Colère du Gouffre (L) | monstre + LoRA Leviathan + non-humanoïde massif (scène de vie difficile) |
| e17 | Zikka, Chaman des Écumes (L) | nommée, character_dna + IPAdapter (identité à préserver) |
| g21 | Vesna, Dryade du Sous-Bois (L) | nommée + dryade canon MTG frais (sans bois de cerf) |
| g8 | Cœur du Bosquet (M) | treant + LoRA Forest Guardians, boss |
| k16 | Liche des Caveaux (UR) | reclassée 3.4 (lich humanoïde squelettique) |
| k2 | Nymphe Croupie (C) | reclassée 3.4 (canon MTG nymphe), non-humanoïde-friendly |
| z6 | Phénix du Zénith (UR) | aviaire pur, LoRA ? (n'a qu'un trigger phoenix) |
| f21 | Calcine, Dame des Cendres (L) | sommet du gradient golem-humanité de la Forge |
| n14 | Démon (C) | reclassé diable humanoïde (grammaire MTG demon) |
| w-compagnon (ex. Yuki ou Onyx) | compagnon UR↔L | IPAdapter UR↔L, identité la plus contrainte |
| Gorgonne (37 cartes) | gorgon | canon Méduse MTG tout frais, test critique |

## 3. Règles communes aux deux thèmes

- Espèce, genre, magie dominante, character_dna : INCHANGÉS (règle 3.4).
- R13 anti-sang conservé ; PAS de R12.
- LoRAs : mêmes que la version classique de la carte.
- Titre d'Exception : le builder choisit dans la table par axe (Repos → action/lieu de la scène ; Crépuscule → lieu à l'heure inverse, ex. « Vesna, Dryade du Sous-Bois — Sous l'Aube Rousse »).
- Seeds : témoin = seed classique + 5 000 000 (à consigner).

## 4. Verdict (après le test, Marc-Olivier choisit)

Critères de lecture des 36 images :
1. **Lisibilité du thème SANS légende** : peut-on dire « c'est une scène de vie » / « c'est l'heure inversée » sans connaître la carte normale ?
2. **Identité préservée** sur les nommées (Vesna reste Vesna, Zikka reste Zikka) — comparaison côte à côte avec l'art classique.
3. **Espèce lisible** : le léviathan reste un monstre marin, la Gorgonne reste une femme-cheveux-de-serpents (pas une jellyfish !).
4. **Style painterly sans dérive** avec les LoRAs.
5. **Viabilité sur non-humanoïdes** (crépuscule devrait passer partout ; repos est le plus risqué sur léviathan/golem/phénix ; obscures doit rester lisible sans verser dans le gore).
Départage : un thème qui échoue sur ≥ 2 des 5 critères → écarté ; les gagnants se répartissent par vague (ex. Repos en 3.4, Crépuscule en « 3.4 bis », Obscures en 3.5), CHACUN avec son marqueur CSS distinct (or pour Repos, argent-violet pour Crépuscule, rouge sombre pour Obscures).
