# Prompt — correctifs v1.40 : les interactions d'errance ne se déclenchent pas (retour ville, porte du donjon) — retour terrain de Marc-Olivier, 12/11 12e tour

> Statut : BUG SIGNALÉ par Marc-Olivier (12/11, 12e tour) : « le point de retour ville et l'entrée du donjon ne marchent pas, je suis obligé de passer à chaque fois par le menu. » Couloir 1 : exécute APRÈS le chantier v1.39 (en cours), sur le main du moment. Une tâche = un commit FR. Preuve : build + `node --test tests/*.test.js` (PAS `node --test tests/`) + `node smoke-ui.mjs dist.html` + digests INCHANGÉS.

## Contexte (diagnostiqué et vérifié sur main `4b4f24e` par le couloir pilotage)

Le clic sur une interaction (`src/ui.js`, handler `pointerdown` du canvas d'errance) ne pose un `st.pending` QUE si la tuile cliquée est EXACTEMENT la tuile de l'interaction : la porte doit être à `ty === donjon.y + donjon.h` avec `tx` dans la largeur du bâtiment, le retour sur SA tuile unique, l'autel sur SA tuile. Or le donjon et la maison de retour sont PEINTS plus larges que leurs tuiles cliquables (`src/errance-paint.js` : bâtiment, toit, halo) : la majorité des clics « sur le bâtiment » tombent sur des tuiles voisines → aucun `pending` → simple déplacement → **rien ne se passe**.

Quand un `pending` est posé, le handler cherche une tuile praticable dans un carré ±2 autour de la cible et envoie le héros s'y rendre ; l'interaction ne se déclenche qu'à l'arrivée si `Math.hypot(hero − centre) < 1,6` (`src/errance.js`, bloc « arrivée sur une cible d'interaction »). Deux défaillances supplémentaires :

1. Une cible dont la tuile praticable la plus proche est à ~2 tuiles (porte entourée de murs, retour près de l'eau) ne se déclenche **jamais** (seuil 1,6 jamais atteint).
2. Si A* échoue ou abandonne (`ev.abandoned`), le `pending` reste posé en silence : aucun retour au joueur.

Enfin, le retour ville envoie vers `#terres` (page de sélection des zones) alors que le toast annonce « Retour à la ville » : incohérent avec l'ACTÉ du 11/11 (l'Accueil = hub-ville, page par défaut).

## Lot unique — déclenchement robuste des interactions d'errance

1. **Hitbox élargie** : porte = toute tuile du bâtiment donjon (murs compris) + 1 anneau autour ; retour = tuile retour + son 8-voisinage ; autel et huttes = tuile + 8-voisinage. Si le clic couvre plusieurs interactions, prendre la plus proche du héros. Feedback immédiat au clic : toast court (« → Porte du donjon », « → Retour à la ville », « → Autel ») pour confirmer la prise en compte.
2. **Arrivée garantie** : au clic sur une interaction, chercher la tuile praticable la plus proche du héros dans le 8-voisinage de la cible (repli ±2) ; si le héros est déjà à portée du seuil d'arrivée, déclencher IMMÉDIATEMENT sans repath ; si A* échoue, toast explicite (« ✗ Chemin bloqué vers la porte du donjon. ») et `pending` annulé — plus jamais de silence.
3. **Cohérence du seuil** : garantir que la tuile de déplacement choisie est toujours à ≤ seuil de la cible (8-voisinage prioritaire, seuil recalé si besoin, ex. 1,9) — le couple recherche ±2 / seuil 1,6 actuel peut ne jamais se rencontrer.
4. **Retour ville → `#accueil`** (hub-ville), pas `#terres`. Toast conservé. La position d'errance est déjà persistée (`persistErrancePos`), le retour dans la zone doit replacer le héros là où il était.
5. **Garde-fous tests headless** (pattern harness `tests/errance.test.js`) :
   - génératif : pour les 5 zones, chaque interaction posée (porte, retour, autel) possède au moins une tuile praticable à ≤ seuil du centre ;
   - déclenchement : héros adjacent + clic simulé → `arrived` se déclenche et l'effet part (porte → combat de zone donjon ; retour → `#accueil` ; autel → soin) ;
   - clic « raté » sur une tuile voisine du bâtiment pose bien un pending (hitbox) ;
   - héros déjà à portée → déclenchement immédiat sans mouvement.
6. **Digests INCHANGÉS attendus** : flux d'errance UI uniquement. À confirmer par preuve standard.

## Contraintes et hors périmètre

- `data/*.json` source de vérité ; `dist.html` via `node build.mjs` ; re-fetch avant chaque édition ; zéro dépendance npm.
- **Digests INCHANGÉS attendus** : `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.
- Hors périmètre : nouveau visuel des bâtiments (couloir design), architecture donjons × errance (session), la capture en errance (lot D de la refonte direction).
- Consigner dans `docs/arbitrages.md` (entrée en haut), CHANGELOG v1.40, roadmap, protocole IHM (scénario errance : le retour ville et la porte se déclenchent au clic, sur téléphone ET PC).
