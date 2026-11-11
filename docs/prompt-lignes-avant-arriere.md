# Prompt — chantier lignes avant/arrière + suppression du rôle (couloir 1)

> À lancer tel quel au couloir 1. Sources de vérité : arbitrages du 10/11 soir (règles de rang ACTÉES, Option A), `docs/roadmap.md` points 1, 3 et 4, `data/*.json`. Commits, messages et consignes en français. Une tâche = un commit ; re-fetch de chaque fichier avant édition (d'autres couloirs poussent aussi) ; vérifier l'unicité des ancres avant tout remplacement.

## Contexte

Le socle est livré et validé (v1.30 : boucle v2, économie v2, hub-ville, errance zone Marées conforme au guide, campagne V3 en source unique, CI qui teste avant de publier). Ce chantier est le prochain gros morceau moteur, débloqué par l'arbitrage Option A. **Les maths de combat changent : le digest sera re-mesuré, la nouvelle baseline consignée, et AUCUN tranchage d'équilibrage avant Marc-Olivier** (le calibrage se fera une seule fois, après ce chantier et le contenu v3).

Ordre des lots : **0 → 1 → 2 → 3**, chaque lot livré avec sa preuve et sa MESURE dans `docs/arbitrages.md` (même format que les précédentes). Ne pas toucher : errance, économie, images (d'autres couloirs travaillent en parallèle).

## Lot 0 — correctifs terrain restants (roadmap point 1, tous diagnostiqués)

1. **Bug des sorts en doublon** : à chaque évolution, tous les sorts courants de la carte sont recopiés dans `inst.acc` (`oldSpells` dans `src/ui.js`) ; or les sorts de lignée de la nouvelle forme incluent déjà ceux de l'ancienne → chaque évolution duplique le préfixe. Correctif : dédoublonner par identité de sort à la fusion, ne cumuler dans `inst.acc` que les sorts que la nouvelle forme ne connaît pas déjà, **réparer aussi les sauvegardes déjà polluées** (migration non destructive).
2. `elOf()` doit surligner les pions du plateau, pas les rail-chips (`src/ui.js`, environ ligne 2966).
3. Bouton réduire/masquer sur la fenêtre d'action tactique (elle masque toute la ligne équipe, jusqu'à 78 dvh, sans aucun bouton pour la refermer).
4. Ajouter les 4 familles v3 à `FAM_ORDER` (crepuscule, vol, zele, appel).
5. Tailles de boutons mobile ≥ 32 px.
6. Corriger la double bordure de la zone de texte des cartes et son fond flou.

## Lot 1 — le moteur applique les rangs (règles ACTÉES)

- Formation 5 max, **3 devant + 2 derrière ou 2 + 3, figée pendant le combat**.
- L'arrière **encaisse -50 %** des dégâts tant qu'un allié tient à l'avant ; **l'avant tombe : la protection saute**.
- L'arrière est **ciblable** (Option A) ; le comportement « non ciblable » du moteur disparaît.
- Un **Guerrier ou un Assassin en arrière frappe à moitié**, les autres profils à plein.
- **Les soins ne sont jamais affectés par la position.**
- La **protection de l'arrière ne couvre pas les attaques de zone**.
- Le système croisé Souffle/Frappe Croisée (`CROSS`) est **RETIRÉ** (pas retranché en position) ; la piste de sorts croisés conditionnels reste notée pour plus tard.
- Les constantes (-50 %, malus de profil) vivent **en data** (`data/engine.json`), calibrables, jamais codées en dur.
- **Re-mesurer le digest dès ce lot** et consigner la nouvelle baseline (elle change, c'est attendu).

## Lot 2 — suppression du champ `role` (moteur + data + UI + sauvegardes)

- Retirer `role` partout : 113 cartes, 153 monstres, vagues ennemies, écran d'équipe, grimoire et affichage, **sauvegardes (migration v27+ non destructive)**.
- Plus aucun « Attaquant »/« Soutien » affiché ; la fiche type pilote déjà le ciblage depuis l'école (T3.1 FAIT).
- Écran d'équipe : **choisir la formation avant le combat** (3+2 ou 2+3), mémorisée en sauvegarde.

## Lot 3 — recâblage famille → école (roadmap point 3, data uniquement)

- La clé d'école diffère du nom de famille pour 9 des 11 familles (seules lame et appel coïncident ; le Bouclier relève du Rempart, l'Aube du Baume…) : recâbler le mapping (`FAM_SCHOOL`) pour que la fiche type pilote aussi les **sorts de lignée** ; comportement par défaut conservé sinon. La fenêtre d'action ne doit plus retomber sur le ciblage par défaut de la carte.

## Preuves et clôture

- Chaque lot : build ok, **tests verts (≥ 141 avant, en ajouter par lot** : rangs, malus de position, soins insensibles à la position, doublons réparés, migration `role`), **smoke ≥ 269 checks** (adapter les checks liés au rôle), tables régénérées.
- Digest : re-mesure au lot 1 puis à la clôture, **N = 3000 et N = 10 000**, nouvelle(s) baseline(s) consignée(s) dans arbitrages avec preuves ; aucun ajustement d'équilibrage de ta part.
- Clôture : MESURE dans `docs/arbitrages.md`, points 1, 3 et 4 marqués FAITS dans la roadmap avec preuves.

## Critères d'acceptation

- Une équipe de 5 se place en 3+2 ou 2+3 avant le combat ; la formation tient tout le combat.
- L'arrière prend -50 % tant que l'avant tient, plein une fois l'avant tombé ; les soins soignent pareil partout ; la zone ignore la protection de l'arrière.
- Plus aucun champ `role` dans les data, le dist, ni les sauvegardes ; plus aucun « Attaquant »/« Soutien » affiché.
- Les sorts en doublon disparaissent, y compris sur les sauvegardes existantes.
- Digest re-mesuré et consigné ; validation téléphone + PC par Marc-Olivier avant le calibrage.
