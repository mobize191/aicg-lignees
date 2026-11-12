# Prompt de lancement — bugs rapides IHM (lots 4-5, fin du chantier correctifs)

> À coller au couloir 1. Règles du repo : une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant chaque édition. Preuve de chaque lot : build + `node --test` + `node smoke-ui.mjs dist.html` + digest INCHANGÉ.

## 0. État du chantier — couloir pilotage, 12/11 (revue v1.34)

Les lots 1 à 3 (ciblage Tactique ligne arrière) sont **LIVRÉS et REVUS en v1.34** : les 84 sorts de lignée ont une fiche de camp (`data/lineage-spells.json`), `spellSideOf` reconnaît « la zone » et « les renforts », le fallback vestige de `src/ui.js` est supprimé, plus de sorts muets depuis l'arrière. Revue complète : `docs/historique/revue-v1.34.md` (commit `dfdda22`). Le diagnostic D1-D3 et les repros A/B/C restent en annexe pour la traçabilité ; leurs tests permanents existent déjà (171 verts).

**Ce prompt ne lance plus que les lots 4-5** — les bugs IHM rapides déjà consignés dans la roadmap.

Baseline au lancement des lots 4-5 : **171 tests verts**, smoke **306 checks dont 303 PASS** — 3 échecs préexistants inscrits en bugs dans la roadmap (gorgée qui ne soigne pas ; achat monstre C à la Guilde, à réévaluer avec la spec gating ; victoire pas-à-pas manuelle en 40 tours), HORS périmètre ici — digest `c62fcbd1…` **1281/3000** et `5059e683…` **4236/10000** (mesure v1.34 ; proposition de verrouillage en attente de tranchage). Les anciennes baselines `f8a9f0bb…`/`978ed44b…` sont **PÉRIMÉES**.

## 1. Plan — lots 4-5 (bugs rapides IHM)

**Lot 4 — gestes et fiche carte**
- Voir les détails d'une carte ne marche pas si l'équipe est pleine ; le double-clic / appui long ajoute la carte à l'équipe sans le vouloir → dissocier les gestes : ℹ️ / appui long = fiche, bouton explicite = ajouter à l'équipe.
- Fiche carte : afficher tous les sorts avec leur rôle (grimoire), zone vs monocible, et la frappe en « dégâts (pourcentage) ».

**Lot 5 — collections**
- Collections : mise au propre générale de l'affichage. (Le figeage exact des listes d'objets par catégorie relève de la spec C de `docs/prompt-activites-immediates.md` ; ici, seule la remise au propre de l'affichage est attendue.)

Acceptation : chaque bug se démontre avant/après (repro consignée dans le commit ou un test / check smoke dédié).

## 2. Preuves et limites

- Chaque lot : build, `node --test` (171 verts attendus), smoke à jour si l'IHM bouge, **digest `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 INCHANGÉS** (`node combat-digest.mjs dist.html 3000` puis `10000`).
- Ne pas toucher : le chemin Auto, les maths de combat, l'ordre du tour, l'équilibrage, l'économie, l'errance et son décor (chantier séparé, après la session de tranchage).
- Les 3 échecs smoke préexistants ne sont PAS de ce chantier : ne pas les « corriger » en passant.
- Si un lot ne peut pas tenir la contrainte digest inchangé : STOP, consigner dans `docs/arbitrages.md` avant d'aller plus loin.

## Annexe historique — signalement et diagnostic du 12/11 (lots 1-3, livrés en v1.34)

### Le signalement (Marc-Olivier, 12/11)

1. En Tactique, sélectionner une attaque de dégâts propose des cibles ALLIÉES.
2. Certains sorts et attaques de ses cartes ne font aucun dégât aux ennemis.
3. Suspicion (confirmée) : il reste des traces du mode support/attaquant, supprimé au chantier « reste code » (v1.31).

### Diagnostic (D1-D3, corrigés en v1.34)

**D1 — `spellSideOf` (`src/data.js`)** : le camp de ciblage venait du champ `cible` de la fiche. La fonction renvoyait **null** pour les 84 sorts de lignée (`data/lineage-spells.json` sans champ `cible` ni `role`, rôle d'école injecté à l'affichage dans ui.js), les 7 fiches `cible: "la zone"` et les 2 fiches `cible: "les renforts"`.

**D2 — fallback vestige support/attaquant (`src/ui.js`, `bindActionButtons`)** : camp null → `(isStrike ? 'enemy' : 'ally')`, piloté par le kind de ligne (`strike` avant / `support` arrière) : tout sort à camp null ouvert depuis la ligne arrière proposait la liste d'alliés, sorts de dégâts compris.

**D3 — sorts muets dans `applySupport` (`src/engine/spells.js`)** : cast Tactique depuis l'arrière d'un sort ni hostile (`foeFacingSpell`) ni couvert par `s.effect` → événement `cast` + mana dépensé, aucun effet.

### Reproductions de référence (devenues tests permanents en v1.34)

- **A** : `spellSideOf` sur les sorts de lignée assemblés comme ui.js (rôle d'école injecté) → null pour toutes les écoles testées (eau/degats, aube/soin, vol/manip, appel/invocation).
- **B** : arrière + « Millième Taillade » (lignée dégâts) cliquée sur un ALLIÉ → `allyUid` envoyé, `castFoeSpell` ignorait la désignation et frappait l'ennemi le plus faible.
- **C** : arrière + « Rayon Matinal » (lignée soin, famille aube), allié désigné → 1 événement `cast`, 0 événement de soin (sort muet).
