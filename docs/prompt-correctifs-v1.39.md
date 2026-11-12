# Prompt — correctifs v1.39 : XP PAR COMBAT + fenêtre de fin de combat + SUPPRESSION DU MODE AUTO (tranchages de Marc-Olivier, 12/11 11e tour, session de direction)

> Statut : TRANCHÉ par Marc-Olivier (12/11, 11e tour, session de direction). Couloir 1 : exécute sur main `259a530` (vérifié : 202 tests verts, smoke 404 checks avec les 3 échecs préexistants, digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000). Une tâche = un commit FR. Preuve par lot : build + `node --test tests/*.test.js` (PAS `node --test tests/`) + `node smoke-ui.mjs dist.html` + digests INCHANGÉS.

## Contexte (diagnostiqué et vérifié sur main `259a530` par le couloir pilotage)

1. **L'XP est aujourd'hui distribuée en fin de run, pas par combat** : dans `src/ui.js`, l'événement `end` ne distribue l'XP que si `(!won || finalClear || !!store.zoneFight) && runLog.stages > 0`, avec la formule `runLog.stages × DIFFX.pts × (won ? 1,5 : 1) × 0,8 × tactXpMult (× 2 découverte)`. Concrètement : un run de donjon de 5 étages ne donne l'XP qu'à la fin (dernier étage ou défaite) ; la fenêtre Récompenses qui s'affiche après CHAQUE combat gagné (`openRecompensesModal(recomp)`) montre déjà l'or et les objets du combat, mais jamais l'XP. TRANCHÉ par Marc-Olivier : « l'XP, maintenant, ça doit être par combat. Même dans les donjons. Et la fenêtre de fin de combat doit afficher l'XP gagnée par chaque personnage, les objets trouvés et l'or gagné. »
2. **Le mode auto existe encore** : `autoMode` (global, `src/ui.js`), bouton `#mode` (« Mode : Auto » / « Mode : Tactique »), bouton `#auto-turn` (« 🤖 Auto ce tour »), préférence persistée `store.uiPrefs.combatAuto`, boucle `while` d'auto-enchaînement dans `run()`, compteur `combatTally.auto` et pénalité `tactMult = 1 − 0,5 × (auto/total)` qui réduit pts, éclats et XP des tours joués en auto. TRANCHÉ : « on enlève le mode auto. Il servira juste pour les missions spéciales » (les expéditions/patrouilles du doc de session, section 10.3) — c'est-à-dire que l'auto-résolution de combat restera disponible EN INTERNE pour le futur mode « missions », mais n'existera plus comme mode de combat joué.

## Lots

### Lot 1 — XP PAR COMBAT (moteur + fenêtre de fin de combat)

- **Chaque combat terminé distribue immédiatement l'XP**, avec la formule actuelle ramenée à UN étage : `base = 1 × DIFFX.pts × (won ? 1,5 : 1) × 0,8 × tactXpMult (× 2 découverte, conditions inchangées)`, puis par carte `base × xpMultFor(iid)` via `addXpI`. Un run de 5 étages donne ainsi le même total qu'avant (5 combats × la formule à 1 étage = l'ancienne formule à 5 étages), mais distribué au fil des combats.
- **Le bloc de fin de run disparaît** : la condition `(!won || finalClear || !!store.zoneFight)` et le compteur `runLog.stages` ne servent plus à distribuer l'XP. L'écran Récompenses de fin de donjon (`runEndModal`, ligne « XP d'équipe (run) ») devient un RECAP de l'XP déjà distribuée par combat (somme du run, affichage seul, aucune nouvelle distribution).
- **Fenêtre de fin de combat (écran Récompenses, déjà affichée par combat gagné)** : ajouter l'entrée XP dans `recomp` (`pushRecomp('xp', …)`) — **XP par personnage** (nom → niveau atteint, pourcentage si `xpMultFor < 1`), à côté des **objets trouvés** et de l'**or gagné** qui y figurent déjà. Après un combat de zone : même écran avant le retour à l'errance. Sur défaite de zone : conserver la règle v1.38 actée (XP distribuée, coefficient défaite ×1) dans le modal de défaite.
- **Règle de défaite en donjon** : les combats déjà gagnés du run ont distribué leur XP (acquise, jamais retirée) ; le combat PERDU ne distribue rien et le run s'arrête. Pas de retour en arrière sur l'XP déjà gagnée.
- **Garde-fous tests headless** (pattern harness existant, `globalThis.DATA` + `eval(src)`) :
  - un combat de donjon gagné → l'équipe gagne de l'XP immédiatement (assert `inst.xp`/niveau AVANT/APRÈS l'événement `end`, avant l'étage suivant) ;
  - un run complet de 5 étages → l'XP totale du run égale l'ancienne formule (5 × la base par combat ; test comparatif documenté) ;
  - une défaite en milieu de run → l'XP des combats gagnés est conservée, le combat perdu n'en donne pas ;
  - combat de zone : victoire ET défaite distribuent (v1.38 préservée) ;
  - l'écran Récompenses contient une entrée `xp` à chaque combat gagné.
- **Digests INCHANGÉS attendus** : l'XP est un flux progression/UI, le digest rejoue le moteur headless avec ses propres seeds. À confirmer par preuve standard.

### Lot 2 — Suppression du mode auto

- **Supprimer du combat joué** : la variable `autoMode`, le bouton `#mode` et son handler, le bouton `#auto-turn` (« 🤖 Auto ce tour »), la boucle d'auto-enchaînement dans `run()` (`if (autoMode) { while … }`), l'appel `renderCombat(combatApp, { autoFight: autoMode })` (toujours `false` désormais), et la persistance `store.uiPrefs.combatAuto` (une sauvegarde existante qui contient le champ doit se charger sans erreur — migration passive : champ ignoré, pas de bump de version).
- **Supprimer la plomberie de pénalité auto** : `combatTally.auto`/`combatTally.manual`, `tactMult` (redevient toujours 1), `runLog.autoTurns`/`tactTurns` et le facteur `tactXpMult`, les lignes 🧭 « tours joués en auto : récompenses réduites » dans les récompenses. Les récompenses sont désormais toujours intégrales (tout est en Tactique).
- **À CONSERVER ABSOLUMUEMENT** : l'IA du moteur (`src/engine/combat.js`) — elle résout les tours ennemis et le chemin historique rejoué par le digest ; elle servira le futur mode « missions spéciales » (expéditions). On retire le MODE UI, jamais l'auto-résolution interne. Aucun changement de maths dans `combat.js`.
- **Textes à mettre à jour** : Aide/tutoriel (le passage « Mode Tactique… « Auto ce tour »… récompenses au prorata ») et les descriptions d'écran concernées. Les entrées historiques du changelog in-game (v0.40, v1.4…) restent INTACTES : c'est de l'historique, pas de la doc vive.
- **Garde-fous tests headless** : une sauvegarde contenant `uiPrefs.combatAuto: true` se charge sans erreur et démarre un combat en Tactique ; un combat démarré attend l'action du joueur (pas d'enchaînement automatique) ; plus aucune référence à `autoMode`/`#auto-turn` dans le dist construit (grep de contrôle).
- **Digests INCHANGÉS attendus** : le digest rejoue le chemin moteur headless, pas les boutons UI. À confirmer par preuve standard.

## Contraintes et hors périmètre

- `data/*.json` source de vérité ; `dist.html` via `node build.mjs` ; re-fetch avant chaque édition ; zéro dépendance npm.
- **Digests INCHANGÉS attendus** : `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.
- Hors périmètre : le mode « missions spéciales » lui-même (expéditions, section 10.3 du doc de session — le tranchage temps réel vs temps de jeu n'est pas fait) ; l'équilibrage de l'XP (formule inchangée, seule la distribution change) ; la formation 3 actifs + 2 réserve (chantier suivant, à spec séparée) ; l'architecture donjons × errance (session).
- Consigner chaque lot dans `docs/arbitrages.md` (entrée en haut), CHANGELOG v1.39, roadmap à jour, protocole IHM si un écran change (l'écran Récompenses change : entrée XP par personnage).
