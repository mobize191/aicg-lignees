# Campagne d'illustrations et vidéos ComfyUI — plan d'exécution

> **Pour les agents d'exécution :** suivre ce plan tâche par tâche, dans l'ordre. Les étapes utilisent des cases à cocher (`- [ ]`) pour le suivi. Chaque tâche se termine par une porte de validation : ne jamais passer à la suivante sans l'avoir franchie.

**Goal :** produire avec ComfyUI (DreamShaper XL) l'illustration de chaque carte du jeu AICG : Lignées, les 5 fonds de donjons, puis les vidéos de sorts signature (WAN 2.2 5B), et les intégrer au manifeste `assets.json` sans jamais toucher au moteur du jeu.

**Architecture :** le catalogue est extrait du jeu (harnas `stub.mjs`), transformé en prompts langage naturel (`build-prompts.mjs`), rendu par ComfyUI en local (`comfy-batch.mjs`, API HTTP ou MCP), post-traité et intégré au manifeste (`make-assets.py`), puis poussé sur GitHub (Pages sert le jeu). La relecture visuelle se fait par planches de contrôle (`contact-sheet.py`) et le registre des seeds (`seeds.csv`) garantit la cohérence des cartes nommées.

**Tech Stack :** ComfyUI (checkpoint **DreamShaper XL**, sampler `dpmpp_2m_sde` + `karras`), WAN 2.2 5B pour la vidéo, Node.js 18+ (scripts .mjs, `fetch` natif), Python 3 + Pillow (post-traitement), git/GitHub.

## Global Constraints (valeurs verbatim, applicables à chaque tâche)

- **Modèle** : DreamShaper XL (checkpoint dans `ComfyUI/models/checkpoints/`, nom exact passé par `COMFY_MODEL`). Prompts en **langage naturel** (phrases descriptives), pas de listes de tags danbooru.
- **Réglages** : `dpmpp_2m_sde` + `karras`, 28 steps, CFG 5-7 (6 par défaut), génération **832×1216** portrait (fonds **1216×832**).
- **Style** (phrase incluse dans chaque prompt positif) : `Painted in a painterly, semi-realistic fantasy card game illustration style, detailed shading, intricate background, epic fantasy trading card game artwork, rim lighting.`
- **Négatif standard** : `low quality, worst quality, blurry, bad anatomy, bad hands, missing fingers, extra digits, extra arms, text, letters, numbers, watermark, signature, username, error, jpeg artifacts, cropped, multiple views, monochrome, greyscale, low contrast, flat cel shading, anime screencap` (+ `dark, gritty` pour Lumière/Zénith ; + `people, creatures, humans` pour les fonds).
- **Palettes par univers** (phrases exactes, aussi dans `build-prompts.mjs`) : Marées `deep blue and turquoise with sea foam swirls and coral accents` ; Forge `ember orange and soot black with glowing red metal and floating embers` ; Bosquet `moss green with golden spores and giant mushrooms` ; Crypte `grey green with candlelight and cold mist` ; Zénith `warm gold and ivory with radiant light` ; Divin `ivory and gold with hourglasses, mirrors and golden threads`.
- **Règles visuelles** : tier bas = calme (C/UC poses sobres, pas d'effets) ; zéro texte dans l'image ; silhouette lisible en 200×280 ; visage/point focal hors du quart bas (zone du voile de texte) ; nommées = même personne sur toute la ligne (référence la plus haute rareté d'abord, seed verrouillé dans `seeds.csv`, puis déclinaison).
- **Budgets d'intégration** (via `make-assets.py`) : art 300×420 JPEG ≤ 30 Ko ; fond 960×540 JPEG ≤ 110 Ko ; manifeste `assets.json` cible ≤ 8 Mo ; JSON en base64 **ASCII pur**.
- **Intouchables** : `dist.html` et le moteur ne sont JAMAIS modifiés par cette campagne. Références de non-régression : digest `7dfab0a295eaa1dab1f70e039b782e0ef06285fdd0fdf3e09d65304b966de5aa` (476/3000, 0 exception) et smoke 158 PASS.
- **Périmètre** : 238 cartes moins 7 archives = 231 arts à produire + 5 fonds + 29 références v3 (`tools/serie1-prompts.json`, intégration différée au contenu v3) + vidéos sorts signature. Les 33 arts actuels (générateur en ligne) restent en place jusqu'à leur remplacement lot par lot.
- **Vidéos** : WAN 2.2 5B, ~0,8 s (21 frames, 25 fps — convention WAN/ComfyUI : durée = (frames − 1) / fps, donc pour 0,8 s il faut 0,8 × 25 + 1 = 21 frames ; le webm rendu dure 21/25 = 0,84 s), boucle fermée, fond compatible voile sombre, **jamais en base64 dans le dist** (stockées dans le repo, chargement = chantier code séparé).

---

### Task 1 : Préparer le poste et extraire le catalogue

**Files:**
- Clone : `mobize191/aicg-lignees` (branche `main`)
- Create : `cards.json`, `prompts-draft.json` (produits par les scripts)

**Interfaces:**
- Produces: `cards.json` (238 cartes, champs `id, name, rarity, classe, role, element, dungeon, monster, raciale, archived, soloSpell...`) et `prompts-draft.json` (231 prompts : `{id, file, name, rarity, universe, named, positive, negative, review}`).

- [ ] **Step 1 : cloner le repo et vérifier le harnas**

```bash
git clone https://github.com/mobize191/aicg-lignees.git && cd aicg-lignees
mkdir -p campagne && cd campagne
cp ../dist.html ../stub.mjs ../tools/*.mjs ../tools/*.py ../tools/serie1-prompts.json .
node --check comfy-batch.mjs && node --check build-prompts.mjs && echo "scripts OK"
```
Expected : `scripts OK` (aucune erreur de syntaxe).

- [ ] **Step 2 : extraire le catalogue**

```bash
node extract-cards.mjs
```
Expected : `cartes : 238` et la répartition par rareté `{"C":52,"UC":33,"R":33,"SR":42,"UR":35,"L":36,"M":7}`. Le fichier `cards.json` est créé.

- [ ] **Step 3 : générer le brouillon de prompts**

```bash
node build-prompts.mjs
```
Expected : `prompts : 231`, `à relire (fallback générique) : 2`, `nommées (référence à verrouiller) : 41`. Le fichier `prompts-draft.json` est créé.

- [ ] **Step 4 : porte de relecture des prompts**

Ouvrir `prompts-draft.json` et corriger : (a) les entrées `review: true` (2 fallbacks génériques, décrire le monstre à partir de son nom et de son `soloSpell`) ; (b) pour chaque entrée `named: true`, enrichir la description physique canonique de la personne (cheveux, armure, signe distinctif) en une phrase. Sauver le résultat (même fichier). Ne pas modifier les champs `id`, `file`, `negative`.

**Gate :** `prompts-draft.json` complet, 231 entrées, chaque nommée décrite précisément.

### Task 2 : Installer ComfyUI + DreamShaper XL et fumer l'API

**Files:**
- Install : ComfyUI (`ComfyUI/`), checkpoint DreamShaper XL dans `ComfyUI/models/checkpoints/`
- Create : `batch-smoke.json`

- [ ] **Step 1 : lancer ComfyUI**

```bash
cd ComfyUI && python main.py --listen
# Dans un autre terminal :
curl -s http://127.0.0.1:8188/system_stats | head -c 200
```
Expected : JSON avec la version et le device CUDA. Si ComfyUI n'est pas encore installé : `git clone https://github.com/comfyanonymous/ComfyUI && pip install -r requirements.txt`, et lancer via l'embedded python si portable.

- [ ] **Step 2 : installer le checkpoint DreamShaper XL**

Télécharger DreamShaper XL (Lykon, Hugging Face `Lykon/DreamShaperXL` ou release Civitai) dans `ComfyUI/models/checkpoints/`. Noter le nom EXACT du `.safetensors` (exemple `dreamshaperXL10_alpha2.safetensors`).

```bash
export COMFY_MODEL=dreamshaperXL10_alpha2.safetensors   # <- nom réel du fichier
```

- [ ] **Step 3 : fumer la chaîne avec 1 image**

```bash
cat > batch-smoke.json <<'EOF'
[{ "id": "smoke", "file": "smoke.jpg", "seed": 1000,
   "positive": "A goblin warrior of the sea tides, in a deep blue and turquoise palette with sea foam swirls and coral accents, with water magic and turquoise glow. Calm pose, plain simple background, no energy effects. Portrait framing, head and shoulders, centered. Painted in a painterly, semi-realistic fantasy card game illustration style, detailed shading, intricate background, epic fantasy trading card game artwork, rim lighting.",
   "negative": "low quality, worst quality, blurry, bad anatomy, bad hands, missing fingers, extra digits, extra arms, text, letters, numbers, watermark, signature, username, error, jpeg artifacts, cropped, multiple views, monochrome, greyscale, low contrast, flat cel shading, anime screencap" }]
EOF
node comfy-batch.mjs batch-smoke.json
```
Expected : `OK smoke.jpg seed 1000 ... Ko` puis `BATCH COMPLET : 1 images dans out`. Le rendu prend ~20-60 s selon la GPU. Si l'erreur mentionne le checkpoint : vérifier `COMFY_MODEL`.

**Note MCP :** si Vibe local est connecté au MCP ComfyUI, on peut piloter les rendus par MCP au lieu de l'API HTTP ; les scripts restent la référence pour les batches (le MCP sert au pilotage image par image et aux réglages fins).

### Task 3 : Étape test — 6 images, une par univers (porte painterly)

**Files:**
- Create : `out/` (6 images de test), `planche-test.png`

- [ ] **Step 1 : constituer le batch de test depuis la série 1**

```bash
node -e "const s=require('./serie1-prompts.json'); const pick=['titan-marees','seigneur-cendres','coeur-bosquet','la-mort','astre-capiteux','kairos']; require('fs').writeFileSync('batch-test.json', JSON.stringify(s.filter(p=>pick.includes(p.id)));" 
```
Expected : `batch-test.json` avec 6 entrées.

- [ ] **Step 2 : rendre et assembler la planche**

```bash
node comfy-batch.mjs batch-test.json
python3 contact-sheet.py out planche-test.png
```
Expected : 6 images + `planche : planche-test.png - 6 vignettes`.

- [ ] **Step 3 : porte de validation visuelle (ARRÊT OBLIGATOIRE)**

Vérifier sur la planche : (a) rendu painterly semi-réaliste cohérent entre les 6 univers (si un rendu part en anime/plat : ajouter `detailed shading, painterly brush strokes` au positif et `flat cel shading, anime screencap` au négatif — déjà présents — puis baisser le CFG à 5 et réessayer) ; (b) palette de chaque univers respectée ; (c) silhouette lisible en vignette 150×210 ; (d) zéro texte généré. Faire valider la planche par Marc-Olivier avant le batch complet. **Non négociable : pas de batch complet sans validation des 6.**

### Task 4 : Série 1 — les 29 nommées de référence + registre des seeds

**Files:**
- Create : `references/` (29 arts), `seeds.csv` (registre), `planche-serie1.png`

- [ ] **Step 1 : rendre les 29 nommées (par petits lots, avec relecture)**

```bash
node -e "const s=require('./serie1-prompts.json').filter(p=>!p.bg); require('fs').writeFileSync('batch-s1.json', JSON.stringify(s));"
node comfy-batch.mjs batch-s1.json --out references
python3 contact-sheet.py references planche-serie1.png
```
Expected : 29 images dans `references/`, `seeds.csv` rempli ligne par ligne (une ligne par image : fichier, seed, prompt).

- [ ] **Step 2 : discipline des nommées (porte qualité)**

Chaque nommée est l'identité VERROUILLÉE de sa personne : valider une par une (jamais d'auto-retry en boucle : corriger le prompt, retenir la meilleure, consigner son seed). Une image retenue = sa ligne `seeds.csv` est définitive. Les corrections éventuelles de prompt se reportent dans le JSON de batch pour les futurs tours.

- [ ] **Step 3 : archiver le registre**

```bash
cp seeds.csv ../tools/seeds-serie1.csv
git add tools/seeds-serie1.csv && git commit -m "campagne : registre des seeds de la série 1 (29 références)"
```

**Note :** ces 29 arts ne sont PAS intégrés au manifeste (les cartes v3 n'existent pas encore dans le jeu) ; ils attendent le chantier contenu v3.

### Task 5 : Les 5 fonds de donjons

**Files:**
- Create : `out/bg-*.jpg`, `assets.json` (mis à jour)

- [ ] **Step 1 : rendre les 5 fonds**

```bash
node -e "const s=require('./serie1-prompts.json').filter(p=>p.bg); require('fs').writeFileSync('batch-bg.json', JSON.stringify(s));"
node comfy-batch.mjs batch-bg.json
```
Expected : 5 images 1216×832 dans `out/` (bg-marees, bg-forge, bg-bosquet, bg-crypte, bg-zenith). Réessayer seulement si la palette ne correspond pas à l'univers (pas pour la composition exacte).

- [ ] **Step 2 : intégrer et pousser**

```bash
python3 make-assets.py
git add assets.json && git commit -m "assets : fonds de donjons DreamShaper XL (5)" && git push
curl -sI https://mobize191.github.io/aicg-lignees/assets.json | grep -i content-length
```
Expected : `make-assets.py` rapporte 5 fonds intégrés (chacun ≤ 110 Ko), `arts : 33`, `fonds : 5` ; le workflow Pages passe (vérifier l'onglet Actions) ; le site sert le nouveau manifeste.

### Task 6 : Monstres des donjons (135) — 5 lots par univers

**Files:**
- Create : `batch-marees.json`, `batch-forge.json`, `batch-bosquet.json`, `batch-crypte.json`, `batch-zenith.json`, `planche-<univers>.png`

- [ ] **Step 1 : découper le brouillon par univers**

```bash
node -e "
const p = require('./prompts-draft.json');
for (const dg of ['marees','forge','bosquet','crypte','zenith','divin']) {
  require('fs').writeFileSync('batch-' + dg + '.json', JSON.stringify(p.filter(c => c.universe === dg)));
  console.log(dg, p.filter(c => c.universe === dg).length);
}"
```
Expected : `marees 26, forge 20, bosquet 18, crypte 26, zenith 27, divin 18` (135 au total).

- [ ] **Step 2 : rendre univers par univers, planche + porte visuelle à chaque lot**

```bash
for dg in marees forge bosquet crypte zenith divin; do
  node comfy-batch.mjs batch-$dg.json
  python3 contact-sheet.py out planche-$dg.png
done
```
Expected : 135 images dans `out/` (les monstres génériques n'exigent AUCUNE cohérence entre eux : pas de relecture individuelle, juste la planche par univers : palette correcte, lisibilité vignette, pas de texte). Corriger et relancer uniquement les fichiers en échec.

- [ ] **Step 3 : intégrer et pousser par univers**

```bash
python3 make-assets.py
git add assets.json && git commit -m "assets : monstres des 6 univers en DreamShaper XL" && git push
```
Expected : `make-assets.py` rapporte ≤ 30 Ko par art, manifeste total affiché ; Pages vert ; vérifier 3-4 fiches en ligne (Ctrl+F5).

### Task 7 : Naissances, familiales, solos, divines — discipline des nommées

**Files:**
- Create : `batch-naissance.json`, `batch-famille.json`, planches par groupe

- [ ] **Step 1 : isoler les groupes restants du brouillon**

```bash
node -e "
const p = require('./prompts-draft.json');
const naissances = p.filter(c => c.universe === 'naissance');
const reste = p.filter(c => c.universe === 'famille');
require('fs').writeFileSync('batch-naissance.json', JSON.stringify(naissances));
require('fs').writeFileSync('batch-famille.json', JSON.stringify(reste));
console.log('naissances', naissances.length, '| familiales/solos', reste.length);"
```
Expected : `naissances 15 | familiales/solos 96` (63 sans art + 33 déjà couverts par le Task 6 pour les monstres ; les 96 couvrent familiales et solos). Vérifier avec `jq 'length' batch-*.json` avant de lancer.

- [ ] **Step 2 : ordre des nommées (règle des références)**

Pour chaque LIGNE nommée rencontrée dans `batch-famille.json` (Kenji, Yuki, Apolline, Léna, Alix...) : générer D'ABORD le maillon le plus haut (rareté L/M) avec le prompt enrichi du Task 1, valider, verrouiller le seed dans `seeds.csv`, PUIS générer les maillons bas en rétrogradant la phrase d'intensité (tier) et en gardant la description physique identique. Ne jamais générer les maillons bas avant la référence.

- [ ] **Step 3 : rendre, intégrer, pousser (comme Task 6)**

```bash
node comfy-batch.mjs batch-naissance.json && node comfy-batch.mjs batch-famille.json
python3 contact-sheet.py out planche-reste.png
python3 make-assets.py
git add assets.json tools/seeds.csv 2>/dev/null; git commit -m "assets : naissances, familiales et solos DreamShaper XL" && git push
```
Expected : manifeste final `arts : 231` (hors références v3), `fonds : 5` ; smoke 158 PASS et digest INCHANGÉS (aucune modification du `dist.html` n'a eu lieu, le vérifier : `git status dist.html` doit être propre).

### Task 8 : Vidéos de sorts signature (WAN 2.2 5B)

**Files:**
- Create : `fx/*.webm` (stockées dans le repo sous `site-assets/fx/`), prompts dans `tools/fx-prompts.json`

- [ ] **Step 1 : installer les modèles WAN 2.2 5B**

Dans ComfyUI : Manager → installer les modèles du template natif « WAN 2.2 Text-to-Video 5B » (umt5_xxl text encoder, vae wan_2.1, checkpoint wan2.2_t2v_5B). VRAM < 24 Go : lancer ComfyUI avec `--lowvram` (blocks swap).

- [ ] **Step 2 : écrire les 10 premiers prompts vidéo (les signatures L/M de la série 1)**

Créer `tools/fx-prompts.json` : `{id, file, prompt}` avec, pour chaque sort signature, une phrase courte décrivant le geste en boucle (le personnage reste identifiable, l'effet part du centre et revient) :
1. `fx-leviathan-laser` : « A colossal leviathan sea serpent charging and firing a glowing turquoise laser beam breath over a dark ocean, painterly fantasy, seamless loop »
2. `fx-griknir-cry` : « A goblin king raising his axe in a war cry, shockwave of blue energy rippling outward, painterly fantasy, seamless loop »
3. `fx-la-mort-faux` : « An elegant hooded death reaper sweeping her glowing scythe through cold mist, grey green palette, painterly fantasy, seamless loop »
4. `fx-pyrrha-renaissance` : « A phoenix maiden rising from ashes, flame wings unfurling and folding back in a cycle of rebirth, ember and gold palette, painterly fantasy, seamless loop »
5. `fx-kairos-sablier` : « A time arbiter in ivory robes flipping a golden hourglass, floating clock fragments swirling, ivory and gold palette, painterly fantasy, seamless loop »
6. `fx-meliane-chant` : « A mermaid siren with long teal hair singing, glowing musical swirls pulsing around her, deep blue palette, painterly fantasy, seamless loop »
7. `fx-archiliche-flammes` : « An archlich skeletal mage conjuring necromantic green flames between his hands, crypt sarcophagi behind, painterly fantasy, seamless loop »
8. `fx-jeanne-halo` : « An armored knight maiden raising her banner, divine golden light halo pulsing, candlelit crypt, painterly fantasy, seamless loop »
9. `fx-astre-solaire` : « A radiant celestial lord with solar flare wings, waves of warm golden light expanding and receding, painterly fantasy, seamless loop »
10. `fx-ananke-fils` : « A fate weaver weaving golden threads between floating mirrors, luminous thread magic flowing, ivory and gold palette, painterly fantasy, seamless loop »
Négatif commun : `text, watermark, blurry, low quality, distorted anatomy, jitter, morphing artifacts`.

- [ ] **Step 3 : rendre via le template WAN 2.2 5B**

Dans ComfyUI, template « WAN 2.2 Text-to-Video 5B » : 21 frames, 25 fps, 832×480, seed fixe consigné, prompt du `fx-prompts.json` (21 frames = 0,8 s selon la convention WAN : durée = (frames − 1) / fps ; 20 frames ne donneraient que 0,76 s). Exporter les frames et assembler en boucle fermée :

```bash
# boucle : crossfade 5 frames entre la dernière et la première frame
ffmpeg -framerate 25 -i fx-leviathan-laser/%04d.png -filter_complex \
  "[0][0]xfade=transition=fade:duration=0.2:offset=0.6[v]" -map "[v]" -c:v libvpx-vp9 -b:v 400k \
  site-assets/fx/fx-leviathan-laser.webm
```
Expected : ~0,8 s par vidéo, WebM VP9 ≤ 400 Ko, boucle imperceptible.

- [ ] **Step 4 : stocker et pousser (PAS dans le manifeste)**

```bash
git add site-assets/fx tools/fx-prompts.json && git commit -m "fx : vidéos de sorts signature WAN 2.2 5B (10 premières)" && git push
```
**Note :** l'affichage des vidéos dans le jeu est un chantier code séparé (v0.48+) : elles ne vont NI dans `assets.json` NI en base64 dans le dist. Ce task produit et stocke les fichiers, rien de plus.

### Task 9 : Finalisation — registre, planches, docs, non-régression

**Files:**
- Modify : `README.md`, `docs/roadmap.md`, `docs/images/images-conventions.md` (état de la campagne)
- Create : `tools/seeds.csv` versionné, planches archivées

- [ ] **Step 1 : versionner le registre complet des seeds**

```bash
cp seeds.csv tools/seeds.csv
git add tools/seeds.csv && git commit -m "campagne : registre complet des seeds"
```

- [ ] **Step 2 : non-régression (obligatoire avant le dernier push)**

```bash
git status dist.html            # doit être PROPRE
node combat-digest.mjs dist.html 3000   # digest 7dfab0a2... 476 victoires, 0 exception
node smoke-ui.mjs                      # TOUT PASSE (158 checks)
```
Expected : digest et smoke identiques aux baselines (la campagne ne touche pas au jeu).

- [ ] **Step 3 : mettre à jour la doc et pousser**

README (section assets : nombre final d'arts et de fonds), `docs/roadmap.md` (série 1 → FAIT, vidéos → FAIT/en cours), puis :

```bash
git add README.md docs/ && git commit -m "docs : état de la campagne d'illustrations" && git push
```

- [ ] **Step 4 : validation terrain**

Ouvrir https://mobize191.github.io/aicg-lignees/ sur téléphone ET PC : collection, fiche, plateau de combat, fonds de donjons ; capturer et noter tout art à refaire dans un fichier `a-refaire.md` (le seed original permet de re-générer proche). Faire valider par Marc-Olivier.

---

## Auto-revue du plan (faite)

- Couverture : 231 arts existants (Tasks 6-7) + 29 références v3 (Task 4, non intégrées) + 5 fonds (Task 5) + vidéos (Task 8) + intégration/budgets/non-régression (Tasks 5-7, 9). Les 7 cartes archivées et les 2 documents de brief WAI restent hors périmètre (le brief `docs/images/images-prompt-serie1.md` est historique ; les prompts opérationnels sont `tools/serie1-prompts.json` et `prompts-draft.json`).
- Cohérence des noms : `tools/extract-cards.mjs` → `cards.json` → `build-prompts.mjs` → `prompts-draft.json` ; `tools/comfy-batch.mjs` lit `batch-*.json` ; `tools/make-assets.py` écrit `assets.json` ; registre `seeds.csv`.
- Aucun placeholder : chaque étape a sa commande exacte et son résultat attendu.
