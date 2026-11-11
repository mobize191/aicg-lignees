# Prompt de lancement — correctifs ciblage Tactique (ligne arrière) + bugs rapides IHM

> À coller au couloir 1. Règles du repo : une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant chaque édition. Preuve de chaque lot : build + `node --test` + `node smoke-ui.mjs dist.html` + digest INCHANGÉ. Baseline au lancement (vérifiée sur main par le couloir pilotage le 12/11) : **150 tests verts**, smoke 299 checks (échecs préexistants 46 g / 45 e), digest `f8a9f0bb…` 1359/3000 et `978ed44b…` 4517/10000.

## 0. Le signalement (Marc-Olivier, 12/11)

1. En Tactique, sélectionner une attaque de dégâts propose des cibles ALLIÉES.
2. Certains sorts et attaques de ses cartes ne font aucun dégât aux ennemis.
3. Suspicion (confirmée) : il reste des traces du mode support/attaquant, supprimé au chantier « reste code » (v1.31).

Diagnostic fait par le couloir pilotage, reproduit sur main en chargeant le moteur via `tests/helpers/load.mjs`. **Trois défauts distincts** :

## 1. Diagnostic (évidence)

**D1 — `spellSideOf` (`src/data.js`)** : le camp de ciblage vient du champ `cible` de la fiche. La fonction renvoie **null** pour :
- les **84 sorts de lignée** : `data/lineage-spells.json` n'a ni champ `cible` ni `role` (le rôle d'école est injecté à l'affichage dans ui.js, ligne ~90) ;
- les 7 fiches `cible: "la zone"` (seul `'zone'` exact est reconnu) ;
- les 2 fiches `cible: "les renforts"`.

**D2 — le fallback vestige support/attaquant (`src/ui.js`, `bindActionButtons`)** : quand le camp est null, l'UI retombe sur `(isStrike ? 'enemy' : 'ally')`, avec `isStrike = kind === 'strike'`. Or le moteur (`src/engine/combat.js`, `beginRound`, items du tour) taggue encore chaque unité `kind: 'strike'` (avant) ou `kind: 'support'` (arrière). Résultat : TOUT sort à camp null ouvert depuis la **ligne arrière** propose la **liste d'alliés**, sorts de dégâts compris. C'est bien une trace du mode support/attaquant : le champ `role` a disparu des cartes, mais le kind de ligne pilote encore le ciblage par défaut.

**D3 — sorts muets dans `applySupport` (`src/engine/spells.js`)** : un cast Tactique depuis l'arrière d'un sort **ni hostile** (`foeFacingSpell` = camp enemy/zone/all OU rôle degats/controle/malus) **ni couvert par `s.effect`** (les cartes joueur n'ont généralement pas `effect`) tombe dans l'échelle des `effKind` sans branche qui l'attrape → événement `cast` + mana dépensé, **aucun effet**. Le correctif T0.2 (camp self/ally → atkBuff) n'existe que dans `actTeamStriker` (kind `'spell'`, ligne avant), pas pour `'cast'` (arrière).

**Reproductions de référence** (à reprendre comme tests permanents) :
- **A** : `spellSideOf` sur les sorts de lignée assemblés comme ui.js (rôle d'école injecté) → null pour toutes les écoles testées (eau/degats, aube/soin, vol/manip, appel/invocation).
- **B** : arrière + « Millième Taillade » (lignée dégâts) cliquée sur un ALLIÉ (c'est ce que l'UI proposait) → `allyUid` envoyé, `castFoeSpell` ignore la désignation et frappe l'ennemi le plus faible.
- **C** : arrière + « Rayon Matinal » (lignée soin, famille aube), allié désigné → 1 événement `cast`, **0 événement de soin** (sort muet).

## 2. Plan en lots

**Lot 1 (data + parse) — une fiche de camp complète pour chaque sort**
- Ajouter `cible` aux 84 sorts de `data/lineage-spells.json`, dérivé du rôle d'école et de la largeur : hostile (degats/controle/malus/manip) → `"1 ennemi"`, ou `"la zone"` si la largeur du nom (`largeurOfSpellName`) dépasse 1 ; soin/boost → `"1 allié"` ; bouclier → `"l'équipe"` ; invocation → `"les renforts"`. Vérifier sort par sort : la fiche type du grimoire fait foi, le validateur doit rester vert.
- `spellSideOf` : reconnaître `"la zone"` (→ 'zone') et `"les renforts"` (→ 'team').
- **Contrainte Auto/digest** : `foeFacingSpell` doit rester vrai pour exactement les mêmes sorts qu'avant le lot. Test obligatoire : sur le catalogue complet, l'ensemble des sorts hostils est identique avant/après.

**Lot 2 (UI) — le camp ne vient plus de la ligne**
- Supprimer le fallback `(isStrike ? 'enemy' : 'ally')` : le camp vient de la fiche du sort, jamais du kind de ligne. Filet de sécurité si camp null : rôle hostile → 'enemy', sinon 'ally'. La frappe simple ⚔ reste 'enemy' dans tous les cas.
- Acceptation : depuis la ligne arrière, un sort de dégâts propose les ennemis ; un sort de soin propose les alliés ; un sort de zone propose l'ancrage de zone.

**Lot 3 (moteur, Tactique uniquement) — plus de sorts muets**
- `applySupport` : quand `action` est présent (pas tactique) et le camp de la fiche est self/ally/team, router par rôle comme le T0.2 le fait côté avant : soin → heal sur l'allié désigné (montant = mult × stat principale du lanceur, plafonné comme les soins existants), boost → atkBuff, bouclier → shield. Émettre les événements attendus.
- `actTeamStriker` (branche T0.2) : après le lot 1, les sorts de lignée soin atteignent le camp 'ally' → la branche actuelle les transformerait en atkBuff. Router par rôle : soin → heal (et non atkBuff).
- **Le chemin Auto ne bouge pas** (`action` null → comportement historique), sinon le digest change. Le soin automatique des lignées depuis l'arrière devient une PISTE à mesurer plus tard (post-tranchage, MESURE consignée), pas ce chantier.

**Lots 4-5 (bugs rapides IHM, déjà consignés dans la roadmap)**
- Voir les détails d'une carte ne marche pas si l'équipe est pleine ; le double-clic/appui long ajoute la carte à l'équipe sans le vouloir → dissocier les gestes : ℹ️/appui long = fiche, bouton explicite = ajouter à l'équipe.
- Fiche carte : afficher tous les sorts avec leur rôle (grimoire), zone vs monocible, et la frappe en « dégâts (pourcentage) ».
- Collections : mise au propre générale.

## 3. Preuves et limites

- Chaque lot : build, `node --test` (les repros A/B/C deviennent des tests permanents), smoke à jour si l'IHM bouge, **digest `f8a9f0bb…` 1359/3000 et `978ed44b…` 4517/10000 INCHANGÉS** (`node combat-digest.mjs dist.html 3000` et `10000`).
- Ne pas toucher : le chemin Auto, les maths de combat, l'ordre du tour, l'équilibrage, l'errance et son décor (chantier séparé, après la session de tranchage du 12/11), l'économie.
- Si un lot ne peut pas tenir la contrainte digest inchangé : STOP, consigner dans `docs/arbitrages.md` avant d'aller plus loin.
