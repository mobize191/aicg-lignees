# Diagnostic + prompt de correctif — panneaux 💾 Sauvegarde et 🗂 Parties invisibles sur l'Accueil

> À coller au couloir 1. Signalement de Marc-Olivier (12/11, 3e tour) : « Sur l'IHM, je ne vois pas de boutons "Parties" pour en changer. » Diagnostic fait par le couloir pilotage sur main (12/11, état post-PR #5, v1.35). Une tâche = un commit français ; `dist.html` jamais édité à la main (`node build.mjs`) ; re-fetch avant chaque édition. Preuve : build + `node --test` + smoke + digest INCHANGÉ.

## 1. Diagnostic (évidence statique, vérifiée sur main)

**Le panneau 🗂 Parties et la boîte 💾 Sauvegarde sont rendus dans le DOM de l'Accueil mais peints SOUS la scène du hub : invisibles et incliquables.**

- `renderHome` (`src/ui.js`, branche hub avec partie en cours, ~2900) : le contenu **du flux** de l'Accueil se réduit à `${saveBoxHtml()} ${slotsPanelHtml()}` ; tout le reste du hub (`.hub-scene`, `.hub-veil`, `.hub-title`, `.hub-menu`, `.hub-bubble`, `.hub-bottom`) est `position:fixed`.
- `.hub-scene` (`src/shell.html` ~995) : `position:fixed;inset:0` avec fond dégradé **opaque** plein écran ; `.hub-veil` (~997) : même géométrie, voile semi-transparent par-dessus.
- `.save-box` (~829 : classe **partagée** par la boîte 💾 et le panneau 🗂 `slots-panel`) : aucun `position`, aucun `z-index` → statique dans le flux.
- Ordre de peinture CSS (CSS 2.1 annexe E) : les éléments positionnés (`fixed`, z-index auto) se peignent **au-dessus** du contenu statique du flux. La scène opaque couvre donc intégralement les deux panneaux.
- `header` est sticky (z 40) : sans correctif de géométrie, les panneaux remonteraient aussi sous lui.

**Portée et ancienneté** : la boîte 💾 est probablement invisible sur l'Accueil depuis l'arrivée du hub plein écran (v1.27, à confirmer à l'exécution sur un build d'époque) ; le panneau 🗂 livré en v1.35 hérite du défaut. Les autres pages ne sont pas couvertes par une scène fixe : la boîte 💾 y est visible, ce qui explique que le problème n'ait pas été repéré plus tôt. Le smoke **B20 a** teste `homeHtml.includes('slots-panel')` : présence dans le DOM, pas visibilité → **faux vert**.

## 2. Correctif attendu (minimal et réversible)

1. **Empilement** : `.save-box { position: relative; z-index: 30; }` — les deux panneaux passent au-dessus de la scène et des couches z 20/22 du hub, et deviennent cliquables. Ajouter `pointer-events:none` à `.hub-scene` et `.hub-veil` (elles couvrent tout l'écran et avalent les clics partout ailleurs que sur les boutons).
2. **Géométrie** : les panneaux sont en haut du flux ; à nu ils s'afficheraient en haut de l'écran, sous le header sticky et le `.hub-title` (top: 52px). Les placer **sous l'écran du hub** : espaceur en flux avant les deux panneaux (hauteur ~100dvh, mobile comprise) pour qu'on y accède en défilant. Le hub reste un écran plein, les panneaux arrivent en dessous. Tout autre placement équivalent propre est accepté s'il tient l'acceptation.
3. **Smoke (leçon du faux vert)** : corriger **B20 a** pour valider la visibilité effective : scroll jusqu'au panneau + `document.elementFromPoint` au centre d'une carte de partie == un élément du panneau (pas la scène), ou équivalent sur `computedStyle` (position/z-index). Même garde-fou pour la boîte 💾. Vérifier aussi les 3 branches de l'Accueil : hub avec partie en cours, équipe vide, écran de départ (`renderDepart` ~2470, où les panneaux sont visibles aujourd'hui — ne pas les casser).

## 3. Acceptation et preuves

- Sur l'Accueil (partie en cours, téléphone ET desktop simulé) : le panneau 🗂 (4 cartes, actions Jouer/Nouvelle partie/Renommer/Supprimer) et la boîte 💾 sont **visibles et cliquables** ; le hub n'est pas cassé visuellement (captures du protocole IHM à refaire sur l'Accueil).
- Build + `node --test` (171 verts attendus) + smoke à jour (B20 a durci, count à ajuster) + **digest `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 INCHANGÉS** (`node combat-digest.mjs dist.html 3000` puis `10000`).
- Ne pas toucher : moteur, data d'équilibrage, économie, contenu. La spec B navigation/hub (PROPOSÉE) reprendra l'Accueil plus tard : ce correctif est un dépannage, pas la refonte.
