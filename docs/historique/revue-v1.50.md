# Revue du couloir pilotage — v1.39 → v1.50 (grand lancement), 13/11/2026

> Objet : revue indépendante du GRAND LANCEMENT complet — v1.39 (lots 1-2 : XP par combat + suppression du mode auto, `48f1053`/`eaaee66`), v1.40 (interactions d'errance, `c03210a`), puis les étapes 2-11 (v1.41 `207044a` → v1.50 `ed5a49f`), clôture consignée en `055328d`. Méthode : preuves REJOUÉES depuis un tarball de main (`055328d`), zéro confiance accordée aux claims ; site déployé comparé octet par octet. Verdict : **CONFORME — les 11 étapes sont livrées proprement, la baseline proposée est exacte et PAS appliquée, un seul point de dette non bloquant (script de smoke fragile sur la date, préexistant)**.

## 1. Preuves rejouées sur main (`055328d`)

- **Build** : ok, `dist.html` 853 383 caractères, 23 fichiers de données.
- **Tests** : `node --test tests/*.test.js` = **252/252 verts** (claims par étape : 209 → 214 → 220 → 225 → 230 → 234 → 240 → 242 → 246 → 249 → 252 — conforme, +50 tests vs pré-chantier).
- **Smoke** : **276 PASS** avant arrêt, nouveaux checks B8b h (manifeste) et B8c a-d (safe-area, ◆, contraste 4.5:1 consigné, sweep résolutions) tous verts. Échecs constatés dans la partie jouée : « 43 B 5 cartes posées » et « B1 c achat » ; le run s'arrête sur le crash B9 c (voir §6) donc B29 h non rejoué ici. Le couloir 1 consigne l'ensemble (43 B, 45 e, B1 c, B29 h, crash B9) comme **préexistant, identique sur la baseline** — cohérent avec l'état connu du smoke avant le chantier.
- **Digest N=3000 rejoué** : `9faff1b9…` **838/3000**, 0 exception, 0 marathon (claim identique).
- **Digest N=10000 rejoué** : `6103e7b0…` **2795/10000**, 0 exception, 0 marathon (claim identique).
- **Site déployé** (`https://mobize191.github.io/aicg-lignees/`) : **md5 identique au build local** (`b2cc0d50…`, 861 348 octets) → le site public est exactement le build vérifié, Marc-Olivier peut valider le S26 directement dessus.
- **CI** : run #270 (commit `055328d`) **completed successfully** (4 min 18 s) — conforme à la consigne de clôture.

## 2. Baseline proposée : exacte, écart expliqué, PAS appliquée

- **Proposition** : `9faff1b9…` 838/3000 et `6103e7b0…` 2795/10000, vs verrouillée `c62fcbd1…` 1281/3000 / `5059e683…` 4236/10000. Écart : **−443/3000, −1441/10000**.
- **Cause vérifiée cohérente** : quasi tout l'écart est pris à l'étape 2 (`5bdb0c6d…` 822/3000 dès la formation 3+2 : le harnais du digest passe de 2 avant + 1 arrière à 2 actifs + 1 réserve, un combattant de moins) ; les étapes 3-4 sont quasi neutres (835→838, 2797→2795). C'est **le prix attendu du tranchage 3+2, pas un bug** ; la compensation (repos, potions, capture) est entre les mains du joueur.
- **Non-application vérifiée dans le code** : les seules occurrences des digests dans `src/` sont le **texte du changelog in-game** ; aucun digest codé en dur dans le moteur ou `combat-digest.mjs`. La baseline verrouillée `c62fcbd1…` reste la référence des docs tant que Marc-Olivier n'a pas arbitré.

## 3. Conformité par étape (spot-checks indépendants)

- **v1.39** : `combatAuto` ne subsiste que comme **migration passive** (`delete store.uiPrefs.combatatuto` à la migration, sans bump de version) — conforme à la spec ; l'XP par combat est couverte par les tests de l'écran Récompenses.
- **v1.40 (Étape 1)** : digests inchangés constatés par le couloir 1 (`c62fcbd1…`/`5059e683…` conservés jusqu'à l'étape 2) ; les interactions d'errance (hitbox bâtiment, 8-voisinage, retour → `#accueil`) sont reprises dans le changelog v1.40 in-game et testées (214 tests).
- **Étape 2 (Lot A, formation 3+2)** : `engine.reserveXpMult` présent en data (`data/engine.json`) et branché (`src/ui.js`) ; K.O. → remplaçant automatique **gratuit**, entrante au tour suivant (garde-fous testés, 220 verts).
- **Étape 3 (Lot B, oppositions au sort + Nature)** : `REGEN` — voir étape 5 ; « Terre » **absent de `data/`** (0 occurrence), **Nature présent** dans 6 fichiers de data ; badge élément sur les sorts au S26-b.
- **Étape 4 (crits d'agilité)** : MESURÉ `9faff1b9…`/`6103e7b0…` — point d'arrivée des maths confirmé par mes rejets.
- **Étape 5 (Lot C, points de repos)** : `REGEN_BOSS_STAGE` **supprimé** (grep 0 dans `src/` et `data/`) ; persistance PV/MP + K.O. couvertes par les tests (234 verts) ; aucun recalibrage fait (conforme à la consigne, courbe à surveiller en test terrain).
- **Étape 6 (Lot D, capture + jetons)** : capture un essai à l'écran Récompenses, % = taux zone × démonstration de force ; Guilde : compagnons du jour **en jetons, jamais en or** (changelog v1.45) ; épreuve humains/mystiques bien HORS périmètre.
- **Étape 7 (Lot 0, manifeste)** : `tools/assets-manifest.json` présent, 255 968 octets, entrées source+qa structurées (modèle, LoRAs, seed, statut qa) ; smoke B8b h vert.
- **Étape 8 (feedback 3 tiers + hit-stop)** : `FX_HITSTOP` en data (kill switch 1 ligne) et routeur `feedback(tier, anchor)` dans `src/ui.js` ; réglage « réduire les flashs » persisté.
- **Étape 9 (héros d'errance par code)** : `src/errance-hero.js` (arborescence plate, écart de nom vs spec documenté) ; tests : **zéro `fillRect`**, 4 directions, silhouette ≤ 36×50 px, ombre au sol (249 verts).
- **Étape 10 (UI mobile)** : safe-area sur menu latéral + HUD errance, ◆ sur les bandes de rareté, audit contraste consigné (or sur place ensoleillée ≈ 1.6:1 = cas décoratif documenté), sweep 1280×720/2560×1080/1080×2340 vérifié en smoke.
- **Étape 11 (level design)** : tests génératifs de reachabilité (spawn → porte, autel, chaque jarre, retour) sur les 5 zones, acyclicité du graphe d'acquisition, table de beats `zone.errance.beats` en data pilotant `encRate` sans modification → digest inchangé, conforme.

## 4. Défauts appliqués aux questions ouvertes ([À TRANCHER] — arbitrage Marc-Olivier)

1. **SCHOOL_ELEMENT** (mapping école → élément) : lame=Neutre, baume/appel/ferveur=Lumière, rempart=Nature, entrave/mauvais-oeil=Ombre, ruse=Eau. Cohérent avec la topologie ; à valider.
2. **Synergies calculées sur les 3 actifs seuls** : conforme au tranchage 3+2. À valider.
3. **Autel relève aussi les K.O.** : comportement préexistant conservé et documenté. Défaut acceptable.
4. **Tenue du héros** : non peinte (cape couvrante), proposition cuir sombre + liseré doré. Cosmétique.
5. **Jetons** : prix compagnons C 5 → UR 200 ; sources : donjon bouclé +10, jalon +5, quêtes +1/+2/+4. À jauger en test terrain (économie).
6. **Hit-stop 90 ms**, désactivable `FX_HITSTOP` : conforme à la spec (80-100 ms).

## 5. Conflit spec vs code signalé par le couloir 1 : confirmé non bloquant

L'heuristique de ciblage IA (utilité) lit encore **l'élément de la carte** au lieu de l'école du sort. Les dégâts sont bien calculés école-du-sort ; l'impact est limité au choix de cible. À corriger dans le prochain lot IA (le redesign complet de l'IA est déjà programmé après errance et calibrage).

## 6. Dette non bloquante : le script de smoke est fragile sur la date

Le check **B9 c** fait `list.find((x) => x.type === 'tuer')` sur les quêtes du jour sans vérifier l'existence ; les quêtes sont tirées par **seed de la date** (`quetesDuJour()`), et le 13/11 la petite quête n'est pas de type « tuer » → `TypeError` à `smoke-ui.mjs:1177`, le run s'arrête là (B29 h non rejoué). **Défaut du script, pas du jeu** (le couloir 1 l'a signalé « lié au changement de jour, identique sur la baseline »). À réparer au prochain passage du couloir 1 : choisir dynamiquement une quête présente, ou simuler le jour attendu. Profiter du même correctif pour traiter les échecs préexistants 43 B, 45 e, B1 c, B29 h.

## 7. Ce qui reste à faire

1. **Validation IHM S26 par Marc-Olivier, téléphone ET PC** (`docs/validation-ihm.md` v1.50, 8 sous-scénarios a-h : formation 3+2 et switch/K.O., oppositions au sort, capture + jetons, points de repos, crits, feedback 3 tiers, héros 3 états, sweep mobile) — **directement sur le site déployé** (identique au build vérifié).
2. **Arbitrage baseline** : verrouiller la proposition `9faff1b9…` 838/3000 / `6103e7b0…` 2795/10000 (écart = 3+2, expliqué et rejeté indépendamment) ou conserver l'ancienne.
3. **Courbe de difficulté** : aucun recalibrage fait après le Lot C (3 actifs + persistance PV/MP) ; à jauger en test terrain S26, re-mesure et recalibrage éventuel SEULEMENT sur tranchage explicite de Marc-Olivier.
4. **Correctif smoke** (B9 c robuste + échecs préexistants) : petit lot à donner au couloir 1.
5. **Petit lot IA** : heuristique de ciblage élément → école du sort (§5), à fusionner avec le redesign IA déjà programmé.
6. **Contenu v4** (avant tout : specs à écrire, couloir pilotage) : fusion (forme tranchée : niveau 1, 25 % stats plafonné par rareté, sorts hérités, table de synthèse de familles avec hybrides sirène/dryade/demi-ange), lignées exclusives initiales (3-4 familles uniques, forme à préciser), donjons divins (3 : Démons, Anges, Équilibre), 4 cartes régionales multibiomes, expéditions (temps réel plafonné, auto-résolution interne), épreuves de recrutement humains/mystiques avec le lore Le Lieur, panoplies famille × classe sélectives, sorts libres par carte + grimoires (+ piste sorts par biome).
