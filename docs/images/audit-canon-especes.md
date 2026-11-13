# Audit canon D&D/MTG des espèces (monstres, créatures mystiques, créatures divines) — 13/11, pour la vague 3.4

> Constat déclencheur (Marc-Olivier) : « Hydre des Marées » affrontée avec une **image de gobelin**. Constat + demande : vérifier que la description de chaque créature ressemble au canon D&D ou MTG.

## 1. BUG : les bosses sont des cartes du pool renommées (art faux garanti)

`src/engine/combat.js` → `makeWave` : au stage 5/10, le boss est **tiré au hasard dans le pool d'ennemis du donjon** puis **renommé** via `boss.name = dungeon.bossNames[stage]`. L'ART et l'espèce restent ceux de la carte tirée : « Hydre des Marées » peut s'afficher avec l'art d'un gobelin (constaté en jeu).

**Correctif proposé (couloir 1)** : mapping boss → carte dédiée quand elle existe (nom exact), fallback pool seulement si aucune :

| Donjon | Boss (stage) | Carte dédiée existante | Action |
|---|---|---|---|
| Marées | Hydre des Marées (5) | **AUCUNE** | **NOUVELLE carte boss à créer** (art 3.4, espèce `hydra`, cf. §2) |
| Marées | Souverain des Marées (10) | **AUCUNE** (Pontos e22 = sage des berges, pas un souverain du gouffre) | **NOUVELLE carte boss à créer** (espèce `merSovereign`) |
| Forge | Maître des Fours (5) | f23 « Maître des Foyers » (UR, quasi homonyme) | mapping f23 |
| Forge | Seigneur des Cendres (10) | f13 (exact) | mapping f13 |
| Bosquet | Mycola, Reine des Spores (5) | g16 (exact) | mapping g16 |
| Bosquet | Cœur du Bosquet (10) | g8 (exact) | mapping g8 |
| Crypte | Goule des Caveaux (5) | k13 (exact, post-3.4 = ghoulFeral) | mapping k13 |
| Crypte | La Mort, Faucheuse des Tombes (10) | k17 (exact) | mapping k17 |
| Zénith | Phénix du Zénith (5) | z6 (exact) | mapping z6 |
| Zénith | Astre Capiteux (10) | z8 (exact) | mapping z8 |

**[À TRANCHER — IMPACT DIGEST]** : le boss n'étant plus tiré au hasard, la composition des vagues 5/10 change → **les digests `9faff1b9…`/`6103e7b0…` vont bouger** (baseline verrouillée à re-mesurer). Arbitrage explicite de Marc-Olivier requis avant/après le fix couloir 1 (comme pour la baseline crits d'agilité).

## 2. Audit canon espèce par espèce

Canon de référence : **D&D 5e (Monstrous Manual)** et **MTG (types de créatures)**. Verdicts : ✓ conforme / ⚠ écart assumé (documenté) / ✗ à corriger ou trancher.

| Espèce (cartes) | Notre description | Canon D&D/MTG | Verdict |
|---|---|---|---|
| goblin (e1-e18…) | petit humanoïde vert, oreilles pointues, nez crochu, voûté | D&D goblin : petit humanoïde à peau jaune-vert, oreilles pointues, lâche et rusé ; MTG : variable mais humanoïde | ✓ conforme D&D |
| mermaid (e23-e30) | femme à queue de poisson, sans jambes/pieds (durcissement 3.3) | MTG merfolk : humanoïde aquatique à queue ; D&D mermaid idem | ✓ |
| seaSerpent (e13 Léviathan) | serpent colossaL marin écailleux, nageoires dorsales, crocs | MTG Sea Serpent : serpent marin colossal | ✓ |
| seaBehemoth (e14 Titan) | monstre marin cuirassé « Léviathan d'Atlantide » | canon MAISON assumé (arbitré, Atlantide Disney) | ⚠ écart assumé, volontaire |
| **hydra (NOUVELLE — Hydre des Marées)** | — | D&D/MTG hydra : **corps serpentin/reptilien avec PLUSIEURS TÊTES sur des cous** (3-5) ; c'est LE trait distinctif, une tête unique = un sea serpent, pas une hydre | à créer en 3.4 : `a many-headed sea hydra, three long serpentine necks rising from a massive scaled body, dorsal fins, fangs, no human traits` [nombre de têtes à trancher : 3 par défaut] |
| dryad (g9-g21) | femme feuillage, accents écorce, **bois en guise de bois de cerf** | D&D dryad : belle jeune femme esprit d'arbre, peau d'écorce partielle, liée à un arbre ; les bois de cerf sont un ajout non-canon (plus treant) | ⚠ écart esthétique assumé (statu quo tranché 13/11) |
| stagnantNymph (k2) | nymphe d'eau stagnante déchue | D&D nymph : esprit féminin de la nature d'une beauté surnaturelle — notre variante « croupie » = maison mais dans la famille nymphique | ⚠ maison cohérent |
| banshee (k6, k14 Macha) | femme spectre hurlante, cheveux blancs | D&D banshee : esprit féminin undead, hurlement fatal, non-corporelle | ✓ |
| lich (k7, k16) | sorcier squelettique undead en robes | D&D/MTG lich : spellcaster undead squelettique, phylactère | ✓ |
| ghoul (k13 ghoulFeral) | humanoïde zombie à 4 pattes | D&D ghoul : humanoïde cadavre décharné, griffes, agilité bestiale, mangeur de charognes — la posture quadrupède est un extrapolation acceptable | ✓ (interprétation) |
| zombie (k15 ghoulRisen) | humanoïde zombie debout | D&D zombie : cadavre reanimé shambling | ✓ |
| ghosts (k5, k9-k12, k18, widowGhost) | spectres/femmes de deuil translucides | D&D ghost/specter/wraith : esprit humanoïde incorporel | ✓ |
| undeadDrowned (k8, k20, k21, k22 Ahab) | noyés gonflés d'eau, capitaine squelettique | D&D « drowned »/revenant aquatique : cadavres noyés réanimés | ✓ |
| carrionBeast (k1) | cadavre d'animal réanimé | D&D « undead beast » : bête morte réanimée (pas de canidé vivant) | ✓ maison cohérent |
| treant (g7, g8, g13) | ent à la Tolkien, visage de bois | MTG Treefolk / Tolkien Ents : arbre animé anthropomorphe | ✓ |
| fireflySpirit (g18 Adriel) | jeune femme aux ailes translucides lumineuses | D&D pixie/sprite : petit esprit ailé — variante maison adulte | ⚠ maison cohérent |
| fungusQueen (g16 Mycola) | **CONTRADICTION INTERNE** : species-map = « MTG fungus, non-human body, no human face » mais le prompt = « an adult woman, a mushroom girl » | MTG fungus/thallid = créatures fongiques non-humanoïdes ; « mushroom girl » = trope danbooru sans ancrage D&D/MTG | **✗ À TRANCHER** : femme-champignon (prompt actuel, art généré comme tel) ou créature fongique MTG ? Le boss 5 du Bosquet = cette carte |
| phoenixFirebird (z2-z22) | oiseau de feu entièrement aviaire | MTG Phoenix : oiseau de feu renaissant | ✓ |
| magmaGolem / fireElemental (f1-f23) | golems/magma, gradient d'humanité par rareté | D&D : golem = construct animé ; élémentaire de feu = flamme vivante souvent humanoïde | ✓ (gradient = maison) |
| fireLord (f13) | « colossal fire lord, BEAST-like, no humanoid proportions » | MTG efreet/flame lord : humanoïde de feu ; son nom de « Seigneur » et son rôle de boss final humanoïde | **✗ À TRANCHER** : rester colosse bestial (écart assumé) ou humanoidiser (canon efreet) ? |
| angel (n13 Ange) | « divine angelic being with halo and wings » | D&D/MTG Angel : humanoïde ailé, halo | ✓ (ailes présentes) |
| solarDeity (z8 Astre) | « radiant halo, sun crown, divine being » — **PAS d'ailes dans les tags** | D&D Solar : ange supérieur AILÉ | **✗ petit écart à corriger en 3.4** : ajouter `large radiant feathered wings` |
| demon (n14) | bête sombre → reclassé `diableHumanoide` (3.4) | D&D/MTG Demon : humanoïde cornu, souvent ailé, intelligent — JAMAIS une simple bête | ✓ après reclassification 3.4 (reco tags : `a humanoid demon, horns, leathery wings, crimson skin`) |
| succube (camp démon, à venir gel v1) | à définir | D&D/MTG succubus : femme démone humanoïde, ailes de chauve-souris, séduisante, jamais une bête | reco : humanoïde ailée, même grammaire que n14 |
| gorgon (Gorgonne, 37 cartes 3.3) | species-map = « monstrous gorgon BEAST, hulking reptilian body, snake head » | **AMBIGUÏTÉ CANONIQUE** : MTG gorgon = femme à cheveux de serpents vivants (Méduse) ; D&D gorgon = TAUREAU à écailles métalliques qui pétrifie — notre version bête reptilienne = NI l'un ni l'autre | **✗ À TRANCHER** : canon MTG (tête de serpents vivants, corps féminin serpentin, regard pétrifiant) recommandé car c'est l'image que les joueurs attendent |
| fée (camp fées gel v1, à venir) | à définir | D&D/MTG faerie : petit humanoïde ailé, espiègle | reco : ailes d'insecte, petite taille |
| beastWater/Fire/Wood/Dark (génériques) | « hulking monstrous beast… » | — (aucun canon : c'est l'artefact loup documenté) | en cours d'éradication 3.4 (règle morphologie concrète) |
| oracle/herald/apostle/celestialJudge/fateWeaver/echoSpirit/nightQueen/vikingKing/riverSage | humanoïdes divins/royaux maison | pas de contresens canon (avatars, juges célestes = archétypes libres) | ✓ |

## 3. Actions 3.4 (cumulatives)

1. **Bug boss** : mapping boss→carte dédiée (couloir 1) + **2 nouvelles cartes boss Marées** (hydre multi-têtes, souverain des marées) avec art en 3.4. Digest à re-mesurer (arbitrage).
2. **SolarDeity** : ajouter `large radiant feathered wings` (canon D&D solar).
3. **Trancher** : gorgon (reco MTG femme-serpents), Mycola (femme-champignon vs fongique MTG), f13 (bestial vs efreet humanoïde), nombre de têtes de l'hydre (3 par défaut).
4. Succube/fées (gel v1) : grammaire humanoïde ailée, jamais bête.
