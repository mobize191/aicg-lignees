# Validation IHM locale — protocole et prompt

Ce document fournit un **prompt prêt à copier** dans un agent local équipé d'un navigateur automatisé (Claude Code, Cursor, Playwright MCP, ou tout agent capable de piloter Chromium et de prendre des captures d'écran). Il valide le jeu de bout en bout : alignement, rien de coupé, tout au bon endroit, console propre.

## Préparation (une fois)

```bash
git clone https://github.com/mobize191/aicg-lignees.git
cd aicg-lignees
# Node 20+ requis pour le harnas
node combat-digest.mjs dist.html 3000   # baseline attendue : 833a6d2c…, ~518 victoires, 0 exception
node smoke-ui.mjs dist.html             # baseline attendue : 171 checks TOUT PASSE
# servir le jeu (le chargeur d'assets a besoin de http, pas de file://)
python3 -m http.server 8080
# → ouvrir http://localhost:8080/dist.html
```

## Le prompt (à copier tel quel)

---

Tu es un agent de validation UI pour **AICG : Lignées**, un jeu de cartes solo 100 % navigateur, servi sur `http://localhost:8080/dist.html` (SPA à hash-routing : `#accueil`, `#collection`, `#equipe`, `#donjons`, `#forge`, `#glossaire`, `#combat`). Ta mission : vérifier que tout fonctionne, que tout est bien aligné, que rien n'est coupé, et produire un rapport avec captures d'écran. Tu ne modifies AUCUN fichier du jeu.

### Règles générales

1. Deux viewports systématiques : desktop **1440×900** et mobile **390×844** (ajoute **360×740** pour les cas limites). Pour chaque scénario ci-dessous, captures dans les deux viewports.
2. À chaque page : capture plein écran, puis vérifie (a) aucune erreur dans la console (écoute `page.on('console')` et `page.on('pageerror')`), (b) pas de scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`), (c) aucun texte tronqué visible (ellipsis attendues ok, coupures non), (d) tous les boutons interactifs ont une taille ≥ 32 px en mobile.
3. Les illustrations (cartes + fonds de donjons) doivent se charger via `assets.json` : vérifie qu'au moins une image `.art-img` est présente dans la collection et qu'un combat affiche un fond (`#app` avec background-image). Si aucune image : NE PAS échouer, noter « assets non chargés » et continuer (le jeu marche aussi sans).
4. Le jeu utilise localStorage : vide-le entre les scénarios qui posent une équipe (`localStorage.clear()`), pas pendant un combat.

### Scénarios (dans l'ordre)

**S1 — Premier lancement.** Ouvre la page, capture l'accueil. Vérifie : le bandeau du haut et la navigation sont visibles ENTIÈREMENT sans scroll sur les deux viewports ; les stats se lisent ; le bouton de sauvegarde ouvre bien sa boîte.

**S2 — Forge / premiers jetons.** Va sur `#forge`, génère une carte (les jetons de départ : 2 humains, 1 humain raffiné, 2 races). Capture la révélation (dos ✦ puis flip au clic). Vérifie : le bouton Générer se désactive après usage du jeton du jour, la nouvelle carte apparaît en collection avec un badge « nouvelle ».

**S3 — Collection.** Va sur `#collection`. Capture. Vérifie : sections par race lisibles, chaque carte affiche nom + rareté + élément + classe, les filtres s'ouvrent en popup et se ferment au clic extérieur, aucune carte ne déborde de sa grille.

**S4 — Équipe.** Va sur `#equipe`, pose 5 cartes (3 exemplaires max par carte : la 4e pose doit être refusée avec un message). Capture. Vérifie : 5 slots visibles sans scroll en mobile, la puissance d'équipe s'affiche, un appui long (clic droit ou pointerdown long) ouvre la fiche.

**S5 — Donjons + modificateur.** Va sur `#donjons`, capture. Entre dans le premier donjon : une modale de modificateur doit proposer Accepter / Entrer sans modificateur (gratuit) / Relancer (1 éclat brut, refusé sans éclat). Capture la modale. Vérifie les trois boutons.

**S6 — Combat AUTO.** Lance un combat en mode Auto, vitesse normale, capture à mi-combat. Vérifie : plateau entier visible sans couper les contrôles en bas ; le journal défile ; les pastilles ℹ️/🎰/🌱 en haut du h2 sont cliquables et ouvrent une modale (capture une ouverte) ; le bandeau de sort spécial ne couvre pas le plateau ; menu ☰ ouvrable en overlay au-dessus du jeu.

**S7 — Combat TACTIQUE (le cœur de la v0.46).** Nouveau combat, bascule en Mode : Tactique, lance le tour. Pour CHAQUE carte du joueur, une fenêtre d'action apparaît en bas : capture-la (une par type : attaquante, soigneuse). Vérifie : l'illustration de la carte est visible dans la fenêtre, PV/ATQ/mana affichés, les sorts au mana insuffisant sont grisés (`.off`), après choix d'action la liste des cibles apparaît avec le pion surligné sur le plateau, le clic sur un pion cible fonctionne aussi. Enchaîne un tour complet puis capture le tour ennemi en cours. Vérifie : aucun « tour fantôme » (le combat ne continue pas seul quand on change d'onglet), la fenêtre se ferme en quittant le combat.

**S8 — Fiche en combat.** Clique un pion : capture la fiche (illustration en grand en tête, tous les effets actifs avec source et durée).

**S9 — Fin de combat.** Termine un combat (gagné ou perdu) : capture la modale de récompenses, vérifie le retour possible au donjon, et que l'étage suivant est proposé après victoire.

**S10 — Glossaire.** Va sur `#glossaire` : capture, vérifie que la section « Les symboles de l'écran » documente ℹ️/🎰/🌱 et les glyphes de combat.

### Rapport final

Produis `rapport-validation.md` avec : pour chaque scénario, statut OK/KO, captures nommées (`S3-collection-mobile.png`…), la liste EXHAUSTIVE des erreurs console avec contexte, et toute anomalie visuelle (élément coupé, mal aligné, chevauchement, texte tronqué) avec capture à l'appui. Termine par un verdict global et les 3 corrections les plus urgentes.

---

## Notes pour le lanceur

- Les vitesses de combat : le bouton `#speed` fait défiler ×0,5 → ×32 ; ×16/×32 coupent l'animation (utile pour S9).
- « Auto ce tour » laisse l'IA jouer le tour courant sans bloquer le test du S7 sur les tours suivants.
- Le digest et le smoke (baselines ci-dessus) valident le MOTEUR ; ce protocole valide l'AFFICHAGE réel dans un vrai Chromium, ce que le harnas ne peut pas faire (DOM simulé). Les deux sont complémentaires.
