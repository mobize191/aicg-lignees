# Spec — Le gel v1 : le périmètre FIGÉ de la première version (suite 39)

> **GEL DÉCLARÉ par Marc-Olivier le 15/11 (suite 39) : « Parfait on gèle là pour la v1, tu peux faire la spec, et je lance la génération d'image. »** Cette spec consolide tout ce qui est tranché pour la v1 en un seul document d'exécution : les cartes à créer (ids FIGÉS, exigence des arts série 3), les recâblages data, les lots de livraison, les digest attendus, et le **paquet de génération d'images** (seeds, espèces, IPAdapter, canon). Le design est GELÉ : tout ce qui n'est pas dans cette spec est v2.
>
> Sources : `docs/design/design-arbres-v18.md` §6-§10 (l'inventaire), `docs/design/spec-trappes-demon-ange-v1.md` (VALIDÉE suite 33 — démon + dévoyés + accès Chœur), `docs/images/spec-arts-v34.md` + `docs/images/spec-arts-v34-gel-v18.md` (arts, arbitrage suite 36 « on va tout lancer d'un coup »), suites 24-37 des arbitrages. **Deux arbitrages clos par cette spec (divergences constatées)** : §1.9 Famine bestiale (spec trappes prime), §1.10 Souverain des Marées pur monstre (suite 30 prime).

## 1. Les cartes figées du gel (49 nouvelles + 5 re-arts + 3 retraits)

Toutes les chaînes ci-dessous sont TRANCHÉES (v18 §6 + suites 24-33). Les **ids sont FIGÉS** : les arts série 3 les attendent (`tools/prompts-gel-v1.json` livré avec cette spec, commit joint). Règles : courbes divine/mystique/humaine de référence + écart de classe ; une seule C par famille (dérogations documentées : n14/n13, w20/w21 côté Enge) ; les L nommées respectent EXI-DATA-3 (nommées uniques).

### 1.1 Le camp démon — 18 nouvelles (d19-d36, race divine camp démon, élément Ombre)

Spec d'exécution : `spec-trappes-demon-ange-v1.md` §2 (VALIDÉE). Résumé figé :

| Id | Carte | Palier | Classe | Voie | École |
| --- | --- | --- | --- | --- | --- |
| d19 | Démon du Désir | UC | Assassin | la chair | le Vice |
| d20 | Succube | R | Occultiste | la chair | le Vice |
| d21 | Grande Succube | SR (verrou) | Occultiste | la chair | le Vice |
| d22 | Dame du Désir | UR | Occultiste | la chair | le Vice |
| d23 | **Asmodia, Reine du Désir** | L | Occultiste | la chair | le Vice |
| d29 | Gouffre des Vices | R | Occultiste | la chair (trappe) | le Vice |
| d30 | Grand Gouffre | SR (verrou) | Occultiste | la chair (trappe) | le Vice |
| d31 | Gueule de l'Abîme | UR | Occultiste | la chair (trappe) | le Vice |
| d32 | **Famine** | L | Occultiste | la chair (trappe) | le Vice |
| d24 | Démon des Fosses | UC | Guerrier | la puissance | la Fureur |
| d25 | Démon Majeur | R | Guerrier | la puissance | la Fureur |
| d26 | Seigneur Démon | SR (verrou) | Guerrier | la puissance | la Fureur |
| d27 | Prince Démon | UR | Guerrier | la puissance | la Fureur |
| d28 | **Belzébuth, Roi des Démons** | L | Guerrier | la puissance | la Fureur |
| d33 | Fléau Démoniaque | R | Occultiste | la puissance (trappe) | la Fureur |
| d34 | Grand Fléau | SR (verrou) | Occultiste | la puissance (trappe) | la Fureur |
| d35 | Porte-Peste | UR | Occultiste | la puissance (trappe) | la Fureur |
| d36 | **Peste, Mère des Fléaux** | L | Occultiste | la puissance (trappe) | la Fureur |

Écoles le Vice / la Fureur + 2×6 sorts + signatures : VALIDÉS suite 33 (spec trappes §2.3). Éveils : n14 Diablotin → d19 (la chair) et → d24 (la puissance) ; puis choix au palier R (voie OU trappe : d19 → {d20 | d29}, d24 → {d25 | d33}). **Lilith : v2** (elle quitte le sommet, suite 31 ; proposition d'attache à caler, spec trappes §2.2).

### 1.2 Les anges dévoyés — 4 nouvelles (d37-d40, race divine camp ange, famille dévoyés, école l'Orgueil)

Spec trappes §3 (VALIDÉE suite 33, sorts compris) :

| Id | Carte | Palier | Classe | Élément |
| --- | --- | --- | --- | --- |
| d37 | Ange Ardent | R | Guerrier | Feu |
| d38 | Ange du Zénith | SR | Guerrier | Lumière |
| d39 | Astre Vaillant | UR | Guerrier | Lumière |
| d40 | **Astre Rayonnant** | L | Prêtre | Lumière |

Porte « mauvaise volonté » de p1 : p1 → d37 (choix au R, à côté de la voie céleste p1 → p5) ; la porte devient vivante dans trees.json. Signature de l'Astre Rayonnant : « Lumière Noire » (VALIDÉE suite 33).

### 1.3 La chaîne céleste — 2 nouvelles (p7/p8) + renommage p6 + re-palier p5 (race divine camp ange)

Espèce TRANCHÉE suites 31/33 (v18 §6.2) :

| Id | Carte | Palier | État |
| --- | --- | --- | --- |
| p1 | Jeune Séraphin | UC | existe (re-art ange canon) |
| p5 | Séraphin, Porteur de Lumière | R | existe (re-palieré depuis UR, re-art) |
| **p7** | **Ange de Lumière** | SR | NOUVELLE ➕ |
| **p8** | **Archange** | UR | NOUVELLE ➕ |
| p6 | **Séraphin, Archange Ultime** | L | RENOMMÉE (« Archange Éveillé » écarté), re-art |

Maillons : p5 → p7 → p8 → p6. Le nom « Luz » reste réservé à la lignée déchue v2 (§9 du v18).

### 1.4 Le paladin — 4 nouvelles (a50-a53) et le chevalier — 4 nouvelles (s15-s18) (race humaine)

v18 §6.3-§6.4, TRANCHÉS suites 24/28. Le choix se fait AU PALIER R (confirmé suite 28).

| Id | Carte | Palier | Classe | Entrée |
| --- | --- | --- | --- | --- |
| **a50** | Paladin | R | Guerrier | a30 Spadassin Vigilant → « la lumière » |
| **a51** | Paladin Sacré | SR (verrou) | Guerrier | a50 |
| **a52** | Paladine Sacrée | UR | Guerrier | a51 |
| **a53** | **Isaure, Égide de l'Aube** | L | Guerrier | a52 |
| **s15** | Chevalier | R | Guerrier | s14 Garde du Rempart → « la voie du rempart » |
| **s16** | Chevalière du Rempart | SR (verrou) | Guerrier | s15 |
| **s17** | Gardienne du Rempart | UR | Guerrier | s16 |
| **s18** | **Kiri l'Invincible** | L | Guerrier | s17 |

- Choix du zèle du paladin au palier R : a50 → u3 Croisé de l'Aube (existe, TRANCHÉ suite 24/28).
- Kiri : femme aux longs cheveux noirs lisses dans une armure noire intégrale, lame au repos ; son art alternatif « robe blanche immaculée » = sa version Exception (v3.4).
- Écoles/sorts des deux familles : à poser aux lots data (grammaire standard du grimoire, crans fondés) — aucun sort n'est figé ici, aucune nommée nouvelle à collision (Isaure/Kiri uniques).
- La double convergence vers Argus meurt (v14 : le Bouclier garde sa L à lui).

### 1.5 Gorgones — 8 nouvelles (k33-k40) et fées — 7 nouvelles (g33-g39) (race mystique, lignées d'accueil des Enge)

v18 §6.5. Gorgones depuis **w21 Gorgonne Nouvelle**, fées depuis **w20 Fée Nouvelle** (les deux Enge existent, art v3.3 conservé).

> **Nota ids (suite 39)** : les gorgones prennent **k33-k40** — la Crypte est pleine (k1-k32, jusqu'à Siegfried k30 et les Gobelins des Caveaux k31/k32) et la convention du projet est « suite du max par donjon » (les Gobelins des Caveaux ont pris k31/k32 après k30 ; les Gobelins des Mousses g31/g32 après g21). Les fées prennent **g33-g39** (Bosquet plein jusqu'à g32 ; l'UC g2 Luciole Hargneuse est existante). Tout autre plage k22-k29 aurait collisionné avec les Naufragés et la Chevalerie Défunte (Ahab k22, Jeanne d'Arc k27…).

| Id | Carte | Palier | Voie |
| --- | --- | --- | --- |
| k33 | Serpent des Récifs | UC | — |
| k34 | Fileuse du Regard | R | — |
| k35 | Pétrifiante des Écueils | SR (verrou) | le regard |
| k36 | Gorgonne Immaculée | UR | le regard |
| k37 | **Méduse, Reine des Écueils** | L | le regard |
| k38 | Mère des Serpents | SR (verrou) | les serpents |
| k39 | Grande Serpentine | UR | les serpents |
| k40 | **Euryale, Nourrice des Serpents** | L | les serpents |

| Id | Carte | Palier | Voie |
| --- | --- | --- | --- |
| g33 | Fée des Groves | R | — |
| g34 | Fée des Jeux | SR (verrou) | les jeux |
| g35 | Souveraine des Jeux | UR | les jeux |
| g36 | **Mab, Souveraine des Jeux** | L | les jeux |
| g37 | Fée des Ronces | SR (verrou) | les ronces |
| g38 | Reine des Ronces | UR | les ronces |
| g39 | **Aubépine, Reine des Ronces** | L | les ronces |

- L'UC des fées = **g2 Luciole Hargneuse** (existante côté monstre Bosquet, art conservé) ; l'éveil w20 → g2, puis g2 → g33.
- Sthéno : réserve v2. Écoles/sorts : à poser aux lots data (rien de figé).
- **Tags des lignées d'accueil (v18 §6.7-3, reste ouvert hors gel arts)** : le changement de famille de w20/w21 et le sort du tag eau de w19 se règlent au lot data des Enge, avec le validateur.

### 1.6 La lignée des boss des Marées — 2 nouvelles (e31/e32, monstres du web des Marées, famille Abîmaux)

v18 §6.8 (TRANCHÉ suite 30) : la chaîne berges quitte les Abîmaux, la lignée des boss entre dans la famille, le Titan reste la M.

| Id | Carte | Rôle | Palier |
| --- | --- | --- | --- |
| **e31** | **Hydre des Marées** | boss du palier 5 du donjon des Marées | L |
| **e32** | **Souverain des Marées** | boss du palier 10 du donjon des Marées | L |

- Maillons intermédiaires Hydre → … → Souverain : **aucun à créer en v1** (v18 §6.8-2 les proposait, la grille suite 37 n'en a pas besoin ; à caler à la spec du donjon des Abîmes).
- Livrés AVEC le correctif boss non aléatoire (suite 16 : `boss.name = dungeon.bossNames[stage]` dans `src/engine/combat.js`) — **[IMPACT DIGEST] accepté, mesure obligatoire**.

### 1.7 Les re-arts (5 cartes existantes, canon v3.4 du gel)

| Carte | Espèce nouvelle | Seed | Note |
| --- | --- | --- | --- |
| n14 Diablotin (RENOMMÉ) | `imp` | 2127013 (conservé) | ex « beastDark » : le Diablotin est un diable humanoïde, PAS une bête |
| p1 Jeune Séraphin | `seraphYoung` | 2128024 (conservé) | ange enfant canon D&D |
| p5 Séraphin, Porteur de Lumière | `seraphBearer` | 2150014 (conservé) | re-palieré UR → R |
| p6 Séraphin, Archange Ultime | `seraphUltimate` | 2150015 (conservé) | RENOMMÉE, canon séraphin/solar six ailes |
| z8 Astre Capiteux | `solarDeity` (+ `large radiant feathered wings`) | 2126024 (conservé) | canon D&D solar, acté suite 16/17 |

### 1.8 Les retraits (3 cartes)

- **p2 Ange Gardien** : RETIRÉE (morte suite 30, v16) — retrait du data + entrée manifeste supprimée (arts §1.7 de la spec 3.4).
- **p4 Fidèle du Jour** : RETIRÉE (scorie, suite 28/30).
- **d8 Choriste Miroir / d14 Aiguille du Pont** : retirés des FAMILLES DIVINES JOUEUR (suite 30 ; les w8/w14 côté monstre restent). Les chaînes Chœur (d7 → d9) et Pont (d13 → d15) se recâblent SANS leur UC — livré au lot accès Chœur.

### 1.9 ARBITRAGE — Famine est BESTIALE (la spec trappes prime)

Divergence constatée : `spec-arts-v34-gel-v18.md` §1.1 décrit Famine en « cavalière D&D de la Famine » (démone émaciée humanoïde), la spec trappes §2.3 (VALIDÉE suite 33, mots de Marc-Olivier suite 26 : « la nommée de la trappe, bestiale, une gueule du gouffre ») la fige **bestiale, `beast:true`, jamais de figure humanoïde**. **La spec trappes PRIME** (tranchage explicite, antérieur, validé). La ligne Famine de la spec arts est AMENDÉE : `a colossal emaciated maw-demon, a gaunt towering frame of stretched grey hide, a gaping fanged maw devouring all light, tattered regal shreds, devouring shadow aura — NO open wounds (R13)`. La « cavalière D&D » reste la référence de l'ÉVÉNEMENT v2 de Famine (spec trappes §8), pas de la carte.

### 1.10 ARBITRAGE — le Souverain des Marées est un PUR MONSTRE (option a)

Question ouverte de `spec-arts-v34-gel-v18.md` §1.6 (« à trancher d'un mot ») : la suite 30 a déjà tranché la structure (les Abîmaux = PURS monstres, la lignée des boss entre dans la famille) → **option (a) RECO** : `a colossal crowned sea-beast king, barnacled crown of shipwrecks, crustacean plates, trident of bone, royal kelp mantle` (LoRA Leviatan comme les espèces marines). L'option (b) roi merfolk humanoïde est ÉCARTÉE.

## 2. Les recâblages data (figés)

1. **n14 Diablotin** : renommé (suite 30) ; éveils recâblés n14 → d19 ET n14 → d24 (trees.json + evolutions.json). **GARDE-FOU : ne PAS retirer n14 → d8 avant le nouvel accès Chœur** (spec trappes §1.1).
2. **Accès Chœur (TRANCHÉ suite 31, option d)** : n15 Éveillé du Seuil → {d1 Garde du Seuil, d7 Lame Miroir, d13 Fileuse du Pont} ; chaînes recâblées SANS d8/d14 ; PUIS retrait de n14 → d8 (spec trappes §4).
3. **Mage : l'éveil « la lumière » RETIRÉ sans remplacement** (suite 33) — le mage garde 5 éveils (flots, fournaise, Bosquet, ombre, appel) ; les convergeances « élue de la lumière » (a29/a32 → s5) meurent avec lui. Les recâblages Druides (Bosquet) et Nécromanciens (ombre) restent v2 (v18 §6.10-5).
4. **z8 Astre Capiteux : re-race divine camp ange**, élément Lumière, courbe inchangée (suite 31).
5. **Légion Solaire et Clergé du Plein Jour = familles HUMAINES** (suite 30/31) : PAS de dédoublonnage (u4/u5 restent humaines ; le donjon du Zénith les réutilise comme ennemis) ; le chantier data (re-race des cartes du Zénith côté humain) est [IMPACT DIGEST] accepté.
6. **Dryades** : vitrine « Gens des Sèves » → « Dryades » LIVRÉE en data (suite 33, commit joint d'alors) ; zéro carte nouvelle.
7. **Berges (e15/e21/e22) et e12** : leurs arts actuels sont conservés, HORS périmètre de régénération ; leur sort se règle à la spec du donjon des Abîmes (v18 §6.10-4).

## 3. Les lots de livraison (un commit FR chacun)

L'ordre suit la priorité reçue (suite 25 : démon + ange EN TÊTE) puis la dépendance des garde-fous :

1. **Lot A — le camp démon (data)** : 18 cartes + familles chair/puissance + écoles Vice/Fureur + 2×6 sorts + signatures + éveils n14 → d19/d24 + evolutions + validateur (dérogation C partagé documentée) + tests. *(= lot 1 de la spec trappes)*
2. **Lot B — l'accès au Chœur** : n15 → {d1, d7, d13} + chaînes sans d8/d14 + retrait de n14 → d8 + pools raccourcis vérifiés + test « le Chœur reste jouable ». *(= lot 2)*
3. **Lot C — les anges dévoyés** : 4 cartes + famille + école l'Orgueil + sorts + porte mauvaise volonté vivante + re-race z8 + grimoire + tests. *(= lot 3)*
4. **Lot D — la chaîne céleste** : p7/p8 + renommage p6 + re-palier p5 + maillons + tests.
5. **Lot E — paladin + chevalier** : 8 cartes + familles + éveils a30 → a50 / s14 → s15 + choix du zèle au R (a50 → u3) + tests.
6. **Lot F — gorgones + fées** : 15 cartes + familles + éveils w21 → k33 / w20 → g2 + tags des lignées d'accueil (v18 §6.7-3) + tests.
7. **Lot G — scories** : retraits p2, p4 (lots séparés si les mesures le demandent).
8. **Lot H — Légion/Clergé** : re-race humaine des cartes du Zénith obtenables + donjon du Zénith temple des trompés ([IMPACT DIGEST] accepté, mesure).
9. **Lot I — bosses Marées + fix boss** : e31/e32 + mapping boss → carte dédiée + `makeWave` corrigé ([IMPACT DIGEST] accepté, mesure + arbitrage baseline).
10. **Lot UI** : fiches, collection par race, glossaire « Le camp divin », changelog, smoke-ui (fusionnable avec les lots).

**Digest** : INCHANGÉ attendu sur les lots A-F (aucune nouvelle carte dans les pools de donjons ; le re-race z8 ne touche que la fiche). Les lots G/H/I MESURENT obligatoirement contre la baseline `3b11106f…` 871/3000 (verrouillage en attente) et arbitrent la nouvelle baseline. Chaque lot : validateur vert + `node build.mjs && node --test` 0 fail + digest consigné + `node tools/gen-tables.mjs` si data visée.

## 4. Hors périmètre v1 (la liste fermée du différé, rappel)

Lilith (v2, attache à caler) ; Luz et la lignée déchue ; Sthéno ; Naïades/Alcéides/Auréades/Lampades (v2, recherche livrée) ; les recâblages mage Druides/Nécromanciens (spec v2) ; la coloration (dormante, v2) ; l'événement du miroir (v2) ; les sommets quais/fête (visibles au diagramme 10.5, v2) ; les mini-lignées UR/L (v2) ; les donjons par famille / donjon des Abîmes (spec LIVRÉE le 15/11 : `docs/design/spec-donjons-par-famille-v1.md`, suite 38 ; exécution au lot 5 du prompt refonte v2, après le rééquilibrage) ; le sort des berges e15/e21/e22 + e12 (avec la spec Abîmes) ; les maillons intermédiaires de la lignée des boss ; la fusion v4 (table de synthèse : spec `spec-fusion-v4.md` + §7 du v18) ; le thème Crépuscule (candidat 3.4 bis) ; la régénération du reste du catalogue (reclassifications audit, thèmes des 308 existantes) = session v3.4 complète après les lots data.

## 5. ARTS — le paquet de génération (LIVRÉ, commit joint)

**Ce qu'il contient** (commit « arts » joint à cette spec) : `tools/species-map.json` complété (entrées §1 + réécritures gorgone/solarDeity/ange/imp), `tools/build-prompts-gel-v1.mjs` (builder, auto-vérifications v3.3 reprises), `tools/prompts-gel-v1.json` (54 cartes × 3 versions = 162 prompts), `tools/seeds-v3.csv` (49 nouvelles graines), `tools/gender-map-gel-v1.csv`, `tools/gen-gel-v1.py` (script ComfyUI, adapté de gen-v33.py), `docs/images/RAPPORT-build-gel-v1.md` (comptages, QA, durée estimée).

### 5.1 Périmètre : 54 cartes × 3 versions

49 nouvelles (§1.1-§1.6) + 5 re-arts (§1.7), chacune en **Classique** + **Repos** (`-r`) + **Obscures** (`-o`) — arbitrage suite 36 : « on va tout lancer d'un coup ». Le reste du catalogue (reclassifications, thèmes des existantes) reste à la session v3.4 complète (§4).

### 5.2 Seeds (FIGÉS, suite de seeds-v3.csv à partir de 2 150 037)

| Bloc | Cartes | Seeds |
| --- | --- | --- |
| Camp démon | d19-d36 | 2150037-2150054 |
| Dévoyés | d37-d40 | 2150055-2150058 |
| Chaîne céleste | p7, p8 | 2150059-2150060 |
| Gorgones | k33-k40 | 2150061-2150068 |
| Fées | g33-g39 | 2150069-2150075 |
| Paladin | a50-a53 | 2150076-2150079 |
| Chevalier | s15-s18 | 2150080-2150083 |
| Boss Marées | e31, e32 | 2150084-2150085 |

Re-arts : seed v3.3 CONSERVÉ (n14 2127013, p1 2128024, p5 2150014, p6 2150015, z8 2126024). Thèmes : **classique + 5 000 000** (Repos), **classique + 10 000 000** (Obscures). Retries seed+1, max 2 (canon).

### 5.3 Espèces (species-map v3 complété) — canon MTG pour les mystiques, D&D pour le divin

Grammaires : les chaînes démon = diables humanoïdes (JAMAIS « beast »), sauf les trappes bestiales (d29-d32 : Gouffre, Grand Gouffre, Gueule de l'Abîme, Famine — exception assumée) ; anges = canon D&D ; gorgones = FEMME aux cheveux de serpents (INTERDIT jellyfish, négatif commun obligatoire) ; fées = humanoïdes minuscules ailés. Les 27 clés nouvelles + les réécritures sont dans `species-map.json` (§1 du companion arts pour les descriptions canon). LoRA : uniquement les 3 existants — Leviatan sur `hydra` et `merSovereign` (espèces marines), aucune autre nouveauté.

### 5.4 Nommées et IPAdapter 0.4

Identité par chaîne (l'UR référence, la L hérite) : d23 Asmodia ref d22 ; d28 Belzébuth ref d27 ; d40 Astre Rayonnant ref d39 ; k37 Méduse ref k36 ; k40 Euryale ref k39 ; g36 Mab ref g35 ; g39 Aubépine ref g38 ; a53 Isaure ref a52 ; s18 Kiri ref s17. **Famine et Peste : nouvelles identités sans référence entrante** (d31 est bestial ≠ Famine ; d35 Porte-Peste est un porteur encapuchonné ≠ Peste reine) — leurs classiques deviennent les références de leurs thèmes. d36 Peste F. Ordre de génération : par familles, l'UR AVANT sa L (l'ordre du fichier prompts le garantit) ; thèmes APRÈS les classiques (IPAdapter sur les nommées : classique ↔ Repos ↔ Obscures, identité maximale).

### 5.5 Thèmes (définitions test-themes-exception.md, arbitrage suite 36)

- **Repos** (§1-A) : scène de vie du biome, activité calme, SANS magie NI combat ; espèce, personnage, tenue canon conservés. Poses : remplacement du tier par « calm resting pose, gentle daily activity, serene expression, no magic, no combat ».
- **Obscures** (§1-C) : inversion d'alignement/élément, espèce et pose conservées, SEULE la magie s'échange ; R13 conservé. **Table d'inversion (proposition mécanique, à valider d'un mot au QA)** : Lumière → ombre (corruption) ; Ombre → lumière dorée (purification) ; Feu → glace spectrale ; Eau → braise ; Nature → givre blanchi ; Neutre → aura spectrale inversée. Jamais de changement d'espèce, jamais de gore.
- **Crépuscule (thème B) : DIFFÉRÉ** (candidat 3.4 bis).

### 5.6 Canon §15 (inchangé)

WAI-Illustrious v17, Euler a + normal, 28 steps, CFG 5.5, hires ×1.25 (denoise 0.4), ADetailer visage 0.32, IPAdapter 0.4 ease in-out end 0.85, LoRA poids 0.7, production 400×560 JPEG q80, retries seed+1 max 2, crop signatures 4 % bas-droit sur toute la production (clôture). Durée estimée consignée dans le RAPPORT.

### 5.7 QA (criterium, à la réception)

Zéro canidé ; zéro sang (R13) ; zéro Fx ; gorgone = femme aux serpents (PAS jellyfish) ; hydre = 3 têtes ; Belzébuth humanoïde royal ; fées minuscules ailées ; Famine bestiale (gueule, pas de figure humanoïde) ; identité des nommées préservée sur les 3 versions (côte à côte) ; les 3 versions lisiblement distinctes sans légende ; style painterly sans dérive anime/3D ; compagnons UR↔L cohérents ; négatif ≤ 20 tags partout ; planches contact = détection uniquement.

### 5.8 Clôture (après réception des jpg)

Manifeste `assets-v34.json` (3 clés par carte : `{id}`, `{id}-r`, `{id}-o`), switch 5 versions, mécanique Exception (taux 1/100, appositions par table en data), déploiement Pages — le tout à la session v3.4 complète, qui fusionnera ces prompts par id.
