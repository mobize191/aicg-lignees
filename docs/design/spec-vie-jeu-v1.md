# Spec — Vie du jeu v1 : critiques d'agilité, feedback 3 tiers, héros d'errance animé, UI mobile, vérifs level design, manifeste assets

> Statut : **PROPOSÉ** (12/11), arbitrages initiaux de Marc-Olivier consignés (hit-stop « pourquoi pas, à tester, au pire on enlève » ; crits liés à l'agilité à AJOUTER — vérifié : aucun crit n'existe dans `src/engine/combat.js` aujourd'hui, l'agi ne sert qu'à l'ordre des tours et l'esquive ; sprite héros : « PAS une image rectangulaire qui bouge sur la carte, un vrai personnage vivant, formes rondes, bras qui bougent, quitte à être peu détaillé » ; manifeste assets = JSON ; licences enregistrées pour information, non bloquantes). À lancer APRÈS la session de génération 3.2, par le couloir 1 (code).

## Lot 1 — Coup critique d'agilité (moteur + digest)

**Mécanique** : chance de coup critique à chaque frappe physique, tirée de l'écart d'agilité.

- Constantes calibrables (dans les M du moteur) : `CRIT_BASE = 0.05` (5 % plancher), `CRIT_PER_AGI = 0.01` (+1 % par point d'avantage d'agi attaquant vs cible, seulement l'avantage positif), `CRIT_CAP = 0.30` (30 % plafond), `CRIT_MULT = 1.5` (dégâts ×1,5 après application des buffs/malus).
- Ordre de résolution : l'esquive existante se résout D'ABORD (inchangée), puis le tirage crit sur la frappe qui touche. Sorts : NON concernés en v1 (frappes physiques seules) — ouvre un élargissement possible plus tard.
- **Symétrique** : la formule s'applique aux ennemis et à l'Auto (IA) comme au joueur. L'Auto/digest critique donc aussi.
- Événement : l'event `damage` existant gagne un champ `crit: true` (pas de nouveau type d'event — l'UI lit le flag).
- **Digest** : maths de combat touchées → MESURE obligatoire par étape, tolérance habituelle, et une nouvelle baseline attendue à arbitrer par Marc-Olivier à la validation finale (comme la refonte IA : baseline v1.34 `c62fcbd1…`/`5059e683…` reste la référence jusqu'à arbitrage). Aucun autre chantier maths en parallèle.
- Tests : tirage semé (bornes 5-30 %, monotone en écart d'agi, cap atteint), le crit respecte l'esquive (frappe esquivée = jamais crit), Auto critique (digest), le flag `crit` n'apparaît que sur les frappes.

## Lot 2 — Feedback 3 tiers + hit-stop à tester

- Un point de routage unique `feedback(tier, anchorEl)` : le combat et l'errance l'appellent, jamais de shake direct épars.
  - **small** (or ramassé, hover bouton, jarre) : tick SFX, rien d'autre.
  - **medium** (coup normal, soin, achat, recrue) : flash léger + shake ~0.3 + pop overshoot (ease-out back) sur `floatText`.
  - **large** (crit lot 1, KO, boss, drop UR/compagnon) : flash + shake ~0.7 + zoom léger + **hit-stop 80-100 ms**.
- **Hit-stop (arbitrage : à tester, réversible)** : uniquement tier large, jamais deux freeze qui se chevauchent (le plus récent restaure), l'entrée reste enregistrée pendant la freeze, retour EXACT au repos à la fin. Un flag/constante unique pour le désactiver en 1 ligne si le rendu déçoit.
- Réglage **« réduire les flashs »** dans les options (en plus du prefers-reduced-motion OS, déjà respecté partout) : les flashes deviennent teinte sans pulsation ; règle ≤ 3 flashs/s.
- Digest **inchangé** (couche feel = présentation seulement). Tests headless : le hit-stop se termine toujours (deux événements 30 ms d'écart), shake amorti à 0 en temps réel, chaque tween finit à sa valeur de repos.

## Lot 3 — Héros d'errance : un vrai personnage, pas un rectangle

**Exigence de Marc-Olivier (arbitrage 12/11)** : « pas une image rectangulaire qui bouge sur la carte ; un vrai personnage vivant, formes rondes, bras qui bougent, fluide, quitte à être peu détaillé ».

**Route ACTÉE pour la spec : personnage peint et animé PAR CODE** (`errance/hero.js`), cohérent avec la DA errance « peint, non pixelisé » (le décor est déjà peint par code) et avec l'échec constaté de l'i2v WAN :

- Personnage articulé dessiné en canvas : tête (ellipse, peau en dégradé doux), **cheveux blancs** (courbes/mèches), **cape noire** (polygone souple qui ondule à l'opposé du mouvement), bras et jambes en capsules arrondies, ombre portée elliptique au sol.
- Cycle de marche : balancement des membres en sin(phase), léger bob vertical, cape et cheveux en retard de phase (suivent le mouvement). Idle : respiration lente, mèches qui dérivent, cape au repos.
- 4 directions (bas/haut/gauche/droite) : la silhouette reste identifiable dans toutes (cape + cheveux blancs = signature lisible à ~36 px/tuile d'échelle).
- **Aucune image générée, aucun rectangle** : tout est tracé par code, donc aucun problème de transparence, de halo, ni de dérive d'identité — et les mouvements sont fluides par construction.
- Fallback/piste ultérieure (non lotie ici) : famille de frames générées depuis l'art héros avec IPAdapter si un rendu plus « art » est demandé plus tard — hors scope, la route code est celle qui répond à l'exigence « vivant et fluide ».
- QA : capture en contexte sur terrain réel de la zone Marées, en mouvement (pas, virage, idle), vérifiée par le protocole IHM ; critères = silhouette ronde, membres lisibles, on comprend « la femme cape noire cheveux blancs ». Digest inchangé (présentation errance).

## Lot 4 — UI/UX mobile (critères d'acceptation des lots UI existants)

- **Safe-area** : `env(safe-area-inset-*)` sur le menu latéral et le HUD d'errance (PWA installée, encoche) ; recalcul au resize.
- **Bande de rareté jamais couleur-seule** : sélecteur de marche = couleur + losange ◆ (déjà dans la DA or) ; audit contraste 4.5:1 (cas à risque : or sur fond place ensoleillée), les ratios consignés dans le smoke.
- **Sweep de résolutions** au protocole IHM : captures à 1280×720, ultrawide (2560×1080), 1080×2340 ; le smoke vérifie qu'aucun élément n'est tronqué/caché.
- Digest inchangé (IHM).

## Lot 5 — Vérifications level design (avec spec B et chantier errance)

- **Reachabilité errance** : test headless — depuis le spawn de CHAQUE zone, le A* existant doit atteindre porte de donjon, autel, jarres, et point de retour ville (spec B3, confirmé prioritaire par la revue 4-lens : seul soft-lock réel du jeu).
- **Graphe d'acquisition économie** : check « aucun déblocage n'exige une ressource obtenable uniquement derrière lui » (goal_reachable sur or, jetons, pierre d'éveil, déblocages de difficulté).
- **Table de beats par zone** : intensité 0-1 et taux de rencontre par zone/étage en data (même table pilote spawn et musique) ; rest avant chaque porte de donjon ; règle : chaque école de sorts se rencontre d'abord à échec bon marché (étages 1-2, Facile).
- Digest inchangé sauf si un taux de rencontre change (alors MESURE).

## Lot 0 — Manifeste d'assets JSON (alimenté par la session 3.2)

- `tools/assets-manifest.json` : une entrée par art/vidéo de production — `{ id, kind, source: { kind: "gen", model: "wai-illustrious-v17", loras: [{ civitaiId, version, base, trigger, license }], seed }, qa: { status, date }, production: { path, w, h, ko } }`.
- **JSON acté par Marc-Olivier (12/11)** : stocke tout, vérifiable par le smoke. La session de génération 3.2 (ou son rapport) remplit les entrées depuis ses run-logs et seeds.
- Licences des LoRAs : **enregistrées pour information, NON bloquantes** (arbitrage Marc-Olivier 12/11).
- Smoke : tout art présent dans les manifestes de production a une entrée source+qa dans assets-manifest.json.

## Ordre des lots et preuves globales

Ordre : **0 (manifeste) → 1 (crits, le plus gros, digest) → 2 (feedback) → 3 (héros) → 4 (UI) → 5 (vérifs)**. Un commit FR par lot. Chaque lot : tests headless verts, smoke enrichi (section dédiée), digest MESURÉ (inchangé attendu pour 0/2/3/4, nouvelle baseline attendue pour 1, à arbitrer par Marc-Olivier), protocole IHM mis à jour (téléphone ET PC + sweep lot 4), CHANGELOG/HISTORY/roadmap. Le hit-stop du lot 2 reste réversible en une ligne.

## Questions ouvertes

- [ ] Lot 1 : `CRIT_PER_AGI = 1 %/point` et plafond 30 % : défauts proposés, calibrables après mesure digest.
- [ ] Lot 1 : sorts exclus des crits en v1 — à confirmer au tranchage.
- [ ] Lot 3 : palette exacte du héros code (cheveux blancs/cape noire actés ; tenue sous la cape : proposition = cuir sombre + liseré doré DA, à valider sur capture).
