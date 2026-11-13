# RAPPORT de build — paquet de génération du GEL v1 (point d'arrêt, prêt à lancer)

Date : 15/11 (suite 39). Specs : `docs/design/spec-gel-v1.md` (§5 arts) + `docs/images/spec-arts-v34-gel-v18.md` (canons des espèces, thèmes ×3, arbitrages suite 36 « on va tout lancer d'un coup »). Builder : `tools/build-prompts-gel-v1.mjs`. Sorties : `tools/prompts-gel-v1.json` (+ `tools/seeds-gel-v1.csv`, `tools/gender-map-gel-v1.csv`, 49 graines ajoutées à `tools/seeds-v3.csv`). Script de génération : `tools/gen-gel-v1.py` (canon §15 inchangé, adaptation de `gen-v33.py`).

**Lancement : `python3 tools/gen-gel-v1.py all` puis `python3 tools/gen-gel-v1.py convert`** (ComfyUI démarré, comme en v3.3). Le script est idempotent (skip des images déjà faites, log `run-log-gel-v1.json`) ; les thèmes arrivent APRÈS les classiques dans l'ordre du fichier, les références IPAdapter des nommées existent donc déjà.

## 1. Comptages

- **162 prompts = 54 cartes × 3 versions** (54 classiques, 54 « Lignées au Repos » `-r`, 54 « Lignées Obscures » `-o`), arbitrage suite 36.
- **54 cartes = 49 nouvelles du gel + 5 re-arts canon v3.4** (n14 Diablotin, p1, p5, p6, z8 — seeds v3.3 conservés).
- Auto-vérification du builder : **OK (0 erreur)** — zéro « card » en positif, zéro fragment de nom dans le positif (ALLOW étendu : `demon` = grammaire MTG obligatoire, comme `leviathan` trigger), cadrage par rareté (UR/L/M = full body), genre R10 verrouillé (25 F / 23 M / 6 bêtes sur les classiques), R13 anti-sang partout, R8 sur les bêtes, négatif **20 tags exactement** (plafond canon §15), positifs 589-786 caractères.
- **Seeds** : nouvelles = **2150037-2150085** (49, suite de `seeds-v3.csv`, consignées) ; re-arts conservés (n14=2127013, p1=2128024, p5=2150014, p6=2150015, z8=2126024) ; Repos = +5 000 000, Obscures = +10 000 000 (vérifié entrée par entrée).

## 2. Correction d'ids pendant le build (IMPORTANT)

Le plan initial notait les gorgones **k22-k29** : COLLISION vérifiée dans les data — la Crypte est pleine (k1-k32, Ahab k22, Jeanne d'Arc k27, Gobelins des Caveaux k31/k32). Les gorgones prennent donc **k33-k40** et les fées **g33-g39** (convention du projet : suite du max par donjon, comme les Gobelins des Mousses g31/g32 après g21). La spec `spec-gel-v1.md` §1.5 est corrigée en conséquence (nota ids). Aucune autre collision : d19-d40 (Seuil plein à d18), p7/p8 (p plein à p6), a50-a53 (a plein à a49), s15-s18 (s plein à s14), e31/e32 (Marées pleines à e30) sont tous libres.

## 3. Chaînes IPAdapter (nommées : identité maximale)

16 nommées au total. Classiques — la L hérite de son UR : d23 Asmodia ← d22, d28 Belzébuth ← d27, d40 Astre Rayonnant ← d39, k37 Méduse ← k36, k40 Euryale ← k39, g36 Mab ← g35, g39 Aubépine ← g38, a53 Isaure ← a52, s18 Kiri ← s17. **Famine (d32) et Peste (d36) : nouvelles identités SANS référence entrante** (d31 bestial ≠ Famine ; d35 porteur encapuchonné ≠ Peste reine) — leurs classiques deviennent la référence de leurs thèmes. Thèmes `-r`/`-o` : IPAdapter depuis le classique de la MÊME carte pour les 16 nommées (d23, d28, d32, d36, d40, p1, p5, p6, n14, z8, k37, k40, g36, g39, a53, s18).

## 4. LoRAs (les 3 autorisés uniquement)

`Leviatan.safetensors` sur les 2 boss des Marées uniquement (6 prompts) : e31 Hydre des Marées (hydre), e32 Souverain des Marées (merSovereign), trigger `leviathan a sea monster`, poids 0.7. Aucun autre LoRA ; espèces nouvelles en description R11 seule.

## 5. Canons par bloc (extraits des positifs, vérifiés)

- **Camp démon, la chair (le Vice)** : d19-d23 (Démon du Désir UC → Succube R → Grande Succube SR → Dame du Désir UR → **Asmodia, Reine du Désir L**) + trappe bestiale d29-d32 (Gouffre des Vices R → Grand Gouffre SR → Gueule de l'Abîme UR → **Famine L**, gueule colossale, PAS de figure humanoïde, arbitrages suites 26/33).
- **Camp démon, la puissance (la Fureur)** : d24-d28 (Démon des Fosses UC → Démon Majeur R → Seigneur Démon SR → Prince Démon UR → **Belzébuth, Roi des Démons L**, forme humanoïde de Baalzebul D&D : roi infernal à la peau sombre, yeux composés de mouche, halo de mouches) + trappe d33-d36 (Fléau Démoniaque R → Grand Fléau SR → Porte-Peste UR → **Peste, Mère des Fléaux L**, reine cagoulée, reine des fléaux).
- **Anges dévoyés (l'Orgueil)** : d37-d40 (Ange Ardent R, feu + veines de feu noir → Ange du Zénith SR → Astre Vaillant UR → **Astre Rayonnant L**, roi solaire à six ailes, corona dorée à liseré noir — signature « Lumière Noire »).
- **Chaîne céleste** : p7 Ange de Lumière ➕ SR, p8 Archange ➕ UR, + re-arts p1 Jeune Séraphin (ange enfant D&D), p5 Séraphin, Porteur de Lumière (R), p6 **Séraphin, Archange Ultime** (L, six ailes blanc-or, couronne de lumière — canon D&D solar).
- **Paladin / Chevalier** : a50-a53 (→ **Isaure, Égide de l'Aube L**, égide solaire) ; s15-s18 (→ **Kiri l'Invincible L**, cheveux noirs lisses, armure noire complète, sans heaume, sabre au fourreau — l'art alternatif « robe blanche immaculée » reste sa version Exception).
- **Gorgones (k33-k40)** : canon MTG — femme pâle aux serpents vivants, peau écaillée verte, regard pétrifiant (voie le regard : k33-k37 → **Méduse, Reine des Écueils L**) ; nobles serpentines à corps de naga (voie les serpents : k38-k40 → **Euryale, Nourrice des Serpents L**, canon Theros). Anti-tags jellyfish systématiques. Univers « les Écueils » (antre de grotte marine, mar vert-pâle).
- **Fées (g33-g39)** : canon MTG — humanoïdes minuscules ailés (ailes d'insecte irisées), farceurs ; reines type Pixie Queen (voie les jeux : → **Mab, Souveraine des Jeux L**) et ronces (→ **Aubépine, Reine des Ronces L**, couronne d'aubépine). Anti-tags giant/colossal. Univers le Bosquet (fonds v3.3 conservés).
- **Boss des Marées (e31/e32)** : hydre à 3 têtes serpentines, couronnes de corail ; Souverain = **RECO bête marine couronnée** (option (a) TRANCHÉE suite 30 : les Abîmaux sont des PURS monstres) — couronne d'épaves bernaclées, trident d'os, manteau de varech.

## 6. Thèmes

- **Repos** (`-r`, seed +5M) : `calm resting pose, gentle daily activity, serene expression, no magic, no combat` + `peaceful slice-of-life moment` ; l'élément est retiré, l'univers et l'espèce restent.
- **Obscures** (`-o`, seed +10M) : inversion de l'élément (proposition de la spec, à valider au QA côte à côte) : Lumière → voile d'ombre corrompue ; Ombre → lumière dorée purificatrice ; Feu → glace spectrale ; Eau → braise ; Nature → givre blanchi ; Neutre → aura spectrale inversée. L'espèce et le cadrage ne changent PAS.
- Distinction lisible sans légende des 3 versions = critère QA ; planches contact = détection uniquement.

## 7. Durée estimée

162 images à ~20-40 s (canon §15, hires + ADetailer) ≈ **1 h à 2 h de génération**, plus les retries (seed+1, max 2). La durée réelle mesurée par `run-log-gel-v1.json` servira de référence pour la 3.4 complète.

## 8. Après génération

1. QA visuel (§5 de la spec + `docs/images/images-conventions.md` : zéro canidé, zéro sang, zéro Fx, négatif ≤ 20, identité des nommées préservée sur les 3 versions, thèmes distincts sans légende).
2. Crop signatures 4 % bas-droite à la clôture (convention v3.3).
3. Les images rejoignent `tools/out-v2/gel-v1/` (convert 400×560 JPEG q80) ; le manifeste `assets-v34.json` complet (clés `<id>`, `<id>-r`, `<id>-o`) sera assemblé à la session v3.4 complète, quand les lots data A-F auront posé les cartes.
4. Retour attendu de Marc-Olivier sur la table d'inversion Obscures avant généralisation au catalogue entier.
