# Validation IHM locale — protocole et prompt

Ce document fournit un **prompt prêt à copier** dans un agent local équipé d'un navigateur automatisé (Claude Code, Cursor, Playwright MCP, ou tout agent capable de piloter Chromium et de prendre des captures d'écran). Il valide le jeu de bout en bout : alignement, rien de coupé, tout au bon endroit, console propre. Version du protocole : **v1.37** (correctifs retours terrain 7e-8e tours — voir scénario S25 ; v1.36.1 correctif errance : grand lac, plage, eau profonde/peu profonde, interactions huttes, héros vectoriel — S24 à rejouer impérativement, les captures de la v1.36 manquaient ; v1.36 refonte errance — S24 ; v1.35 parties multiples — S23 ; v1.34 refonte IA — S22) (refonte visuelle de l'errance : peinture A+, ambiance jour/nuit, layout v2 + retour ville, palettes 5 zones — voir scénario S24 ; v1.35 parties multiples — S23 ; v1.34 refonte IA — S22) (v1.34 refonte de l'IA de combat — voir scénario S22 — plus parties multiples : 4 slots de sauvegarde, panneau « Parties » sur l'Accueil — voir scénario S23). Baselines : 196 tests, smoke 394 checks (3 échecs préexistants connus), digest `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 (MESURE finale v1.34, proposition de verrouillage de baseline en attente de Marc-Olivier ; baseline verrouillée courante `f72106ff…` 1379/3000 / `3f9fe198…` 4558/10000).

## Préparation (une fois)

```bash
git clone https://github.com/mobize191/aicg-lignees.git
cd aicg-lignees
# Node 20+ requis pour le harnas
node build.mjs                                # build déterministe : dist.html régénéré
node --test                                   # 171 tests verts attendus
node smoke-ui.mjs dist.html                   # 306 checks attendus (3 échecs préexistants connus, moteur)
node combat-digest.mjs dist.html 3000         # MESURE courante v1.34 : c62fcbd1…, 1281/3000, 0 exception, 0 marathon (baseline verrouillée f72106ff…, 1379/3000)
node combat-digest.mjs dist.html 10000        # MESURE N = 10 000 v1.34 : 5059e683…, 4236/10000 (baseline verrouillée 3f9fe198…, 4558/10000)
# servir le jeu en reproduisant le déploiement Pages (le chargeur d'assets a besoin de http, pas de file://)
mkdir -p .site && cp dist.html .site/index.html && cp assets-v3.json assets-v3.1.json .site/ && cp -r site-assets/fx .site/fx && cp -r site-assets/errance .site/errance
cd .site && python3 -m http.server 8080
# → ouvrir http://localhost:8080/  (index.html = dist.html ; fx/ et errance/ servis comme en ligne)
# (servir la racine du dépôt à la place = comportement « assets non chargés » : le jeu doit continuer sans échouer)
```

## Le prompt (à copier tel quel)

---

Tu es un agent de validation UI pour **AICG : Lignées**, un jeu de cartes solo 100 % navigateur, servi sur `http://localhost:8080/dist.html` (SPA à hash-routing : `#accueil`, `#equipe`, `#collection`, `#forge` (la Guilde), `#donjons`, `#quetes`, `#terres`, `#errance`, `#boutique`, `#inventaire`, `#combat`, `#glossaire`). Ta mission : vérifier que tout fonctionne, que tout est bien aligné, que rien n'est coupé, et produire un rapport avec captures d'écran. Tu ne modifies AUCUN fichier du jeu.

### Règles générales

1. Deux viewports systématiques : desktop **1440×900** et mobile **390×844** (ajoute **360×740** pour les cas limites). Pour chaque scénario ci-dessous, captures dans les deux viewports.
2. À chaque page : capture plein écran, puis vérifie (a) aucune erreur dans la console (écoute `page.on('console')` et `page.on('pageerror')`), (b) pas de scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`), (c) aucun texte tronqué visible (ellipsis attendues ok, coupures non), (d) tous les boutons interactifs ont une taille ≥ 32 px en mobile.
3. **Régression CSS mobile (v1.29)** : sur chaque page, fais défiler jusqu'en bas : AUCUN texte brut de type `.chip.r-C`, `.recomp-list`, `.shop-row`, `.fx-video` ne doit s'afficher (le bug « CSS visible sur téléphone » est corrigé, il ne doit jamais revenir).
4. Les illustrations (cartes + fonds) se chargent via `assets-v3.json` (manifeste par défaut V3.0 depuis v1.28, ~31 Mo ; `assets-v3.1.json` en doublon commutable via 🖼️ depuis v1.33 — teste aussi le switch) : vérifie qu'au moins une image `.art-img` est présente dans la collection et qu'un combat affiche un fond. Si aucune image : NE PAS échouer, noter « assets non chargés » et continuer (le jeu marche aussi sans).
5. Le jeu utilise localStorage : vide-le entre les scénarios qui posent une équipe ou un départ (`localStorage.clear()`), jamais pendant un combat ni pendant l'errance.

### Scénarios (dans l'ordre)

**S1 — Premier lancement / départ à 2 cartes.** `localStorage.clear()`, ouvre la page : l'écran de départ propose 4 cartes (une par race) ; choisis-en une, capture. Vérifie : 2 cartes accordées (1 choisie + 1 aléatoire), l'accueil/hub-ville s'ouvre ensuite.

**S2 — Hub-ville (accueil).** Capture. Vérifie : scène de ville + voile + titre lisibles sur les deux viewports, menu latéral (Donjons, Terres Sauvages, Boutique, Guilde, Quêtes, **Personnage**, Collection, Glossaire) entièrement visible sans scroll en mobile, l'héroïne (cheveux blancs, cape noire) cliquable avec sa bulle de dialogue, le gros bouton « LES TERRES SAUVAGES » ouvre une pop-up si l'équipe est vide, bouton retour partout.

**S3 — Équipe.** `#equipe` : pose des cartes (3 exemplaires max par carte : la 4e pose refusée avec un message). Capture. Vérifie : 5 slots visibles sans scroll en mobile, puissance d'équipe affichée, appui long (ou clic droit) ouvre la fiche.

**S4 — Collection.** `#collection` : capture. Vérifie : sections par race lisibles, chaque carte affiche nom + rareté + élément + classe, filtres en popup qui se ferment au clic extérieur, aucune carte ne déborde de sa grille.

**S5 — Donjons.** `#donjons` : capture. Vérifie : chaîne des 5 donjons (les suivants verrouillés tant que le précédent n'est pas bouclé), sélecteur de niveau « Nv X » avec bande de rareté en toutes lettres (Facile C→R … Enfer UR→M), checkpoint à l'étage multiple de 5 le plus loin atteint.

**S6 — Combat AUTO.** Lance un combat en Auto, capture à mi-combat. Vérifie : plateau entier visible sans couper les contrôles, rail d'ordre du tour lisible, journal qui défile, vitesse ×0,5 → ×32 via `#speed`, menu ☰ ouvrable en overlay.

**S7 — Combat tour par tour (v1.39 : plus de mode Auto, plus de boutons « Mode : Auto » / « 🤖 Auto ce tour » dans la barre de combat) + action Objet.** Nouveau combat. Vérifie pour CHAQUE carte du joueur : fenêtre d'action (illustration, PV/ATQ/mana, sorts au mana insuffisant grisés `.off`, aucune ligne « ✦ undefined »), ciblage par liste et clic direct sur pion surligné. Ouvre l'action 🧪 Objet : choix de potion avec le stock affiché, la gorgée soigne et consomme (1 tour), sortie de combat = les boutons restent cohérents. Capture la fenêtre d'action ET le choix de potion.

**S8 — Fiche en combat.** Clique un pion : capture la fiche (illustration en grand, effets actifs avec source et durée).

**S9 — Fin de combat + Récompenses (v1.39 : l'XP est distribuée à CHAQUE combat et affichée par personnage).** Termine un combat : l'écran Récompenses s'ouvre (or gagné, **XP gagnée par chaque personnage** — nom → niveau, % si fatigue, drops cliquables, recrue éventuelle). Capture. Vérifie : « Tout ramasser » referme la modale, l'étage suivant est proposé après victoire, le retour au donjon fonctionne.

**S10 — Boutique + atelier de craft.** `#boutique` : capture. Vérifie : rayons potions (soin 50 or, mana 60 or), éclat brut 150 or, équipement 200-1 600 or, marchand de créatures v2 (3 offres du jour en rotation, catalogue complet C 200 → UR 10 000 or, prix actés UC 1 500 / R 4 500 / SR 8 000, rareté verrouillée 🔒 tant que la difficulté de donjon requise n'est pas bouclée) ; un achat débite l'or et ajoute l'exemplaire (modale de révélation) ; refus propre si or insuffisant ou rareté verrouillée. **Atelier 🔨 (v1.31)** : 90 boutons « Fabriquer » (5 zones × 3 niveaux × 6 pièces), coût affiché (matériaux de zone + or ; supérieure/royale + matière du boss) ; avec des matériaux posés en console de setup (`store.materiaux['ecume'] = 5`, `store.gold = 1000`, `save()`), fabriquer une pièce de base débite matériaux + or et ajoute la pièce à l'inventaire ; sans matière du boss, les paliers hauts restent désactivés.

**S11 — Guilde (ex-Forge).** `#forge` : capture. Vérifie : évolutions en gemmes, réserve de pierres d'éveil affichée, autel 5-pour-1, compagnons du jour (3 offres, prix 500-2 000 or), et AUCUNE trace de jetons de génération nulle part (supprimés v1.25).

**S12 — Quêtes.** `#quetes` : capture. Vérifie : 3 quêtes du jour rendues, bonus de complétion (pierre d'éveil) mentionné, une quête réalisable se met à jour au fil du jeu.

**S13 — Inventaire + équipement.** `#inventaire` : capture. Vérifie : page groupée (Potions, Pièces, Gemmes, Matériaux), puis sur la fiche d'une carte : 2 slots d'équipement (arme typée par classe + armure) + 2 slots d'équipe, bonus de set affiché quand les deux pièces d'un même set sont posées.

**S14 — Terres Sauvages + errance (5 zones, héros dédié).** `#terres` : capture. Vérifie : les **5 zones** sont listées (`zone-marees`, `zone-forge`, `zone-bosquet`, `zone-crypte`, `zone-zenith`), seule la zone de l'eau est ouverte au départ, zones visitées marquées. En errance, vérifie que le sprite sheet du héros est servi (`fetch('errance/heros-walk.png')` → 200 en staging ; sinon repli poster/procédural attendu, non bloquant). Entre dans la zone : le canvas d'errance prend l'écran. Sur MOBILE (doigt) et desktop (souris) : touche la carte → le héros s'y rend avec le **pilotage inertiel** (accélération, virages en arc, freinage à l'approche, arrêt net SANS orbite autour du point), toucher le héros casse une jarre adjacente, les hautes herbes déclenchent des rencontres (la grâce diminue), l'autel de soin restaure tout (+5 pas de grâce, toast), la porte du donjon lance le combat de zone. Capture : le déplacement, une jarre cassée, l'autel. Vérifie : aucune erreur console pendant 30 s d'errance continue, rendu net sur écran haute densité (pas de flou).

**S15 — Glossaire.** `#glossaire` : capture, vérifie que « Les symboles de l'écran » documente ℹ️/🎰/🌱 et les glyphes de combat.

**S16 — Vidéos FX en jeu (v1.31).** En combat, déclenche un sort signature mappé (`FX_SPELLS`, ex. Marée Noire) : capture au moment du cast. Vérifie : overlay `.fx-video-overlay` présent avec une `<video>` qui joue (`video.readyState >= 2`, `!video.paused` hors écran caché), une seule vidéo à la fois (deux casts rapides → un seul overlay), le bouton `🎬 FX` bascule off/on et persiste au rechargement (`localStorage aicg-fx`), et en émulation `prefers-reduced-motion: reduce` aucun overlay n'apparaît (image fixe). Hors staging (assets absents) : pas d'overlay, pas d'erreur — fallback bandeau.

**S17 — Page Personnage à onglets (v1.31).** `#personnage` (entrée 🧝 Personnage du hub) : capture. Vérifie : onglets **Équipe** et **Inventaire**, onglet Équipe = slots + formation 3+2/2+3 + équipement d'équipe, onglet Inventaire = page groupée, bouton retour ← ramène à l'accueil, et les anciennes routes `#equipe`/`#inventaire` restent accessibles (boutons retour présents).

**S18 — Rangs avant/arrière en combat (règles Option A).** En combat : capture. Vérifie : le plateau rend **deux rangées** (avant/arrière étiquetées), chaque unité a un `rang` (`state.team.avant/arriere`, `state.enemies.avant/arriere`), **aucun bouton de formation** (`#form-3-2`/`#form-2-3`) n'est présent pendant le combat (formation figée), et en ciblant un pion arrière valide le pion est surligné (`.targeted` sur `.unit`, pas sur les rail-chips — régression `elOf()`).

**S19 — Anti-doublons de sorts + sauvegarde (migration v27).** Setup console : faire évoluer deux fois une carte de famille (ou poser `inst.acc` avec doublons + recharger). En combat, ouvre la fenêtre d'action de la carte évoluée : capture. Vérifie : **aucun sort affiché en doublon** (noms de sorts uniques dans la liste), aucune ligne « ✦ undefined ». Recharge la page : vérifie `store.version === 27` et que `inst.acc` est dédoublonné (clé = nom ou sort+cran), la collection intacte.

**S20 — Fenêtre d'action : réduire + Objet (rappel v1.31).** En combat tactique : ouvre la fenêtre d'action d'une carte, capture, clique **▾ réduire** → la fenêtre se replie (classe `.reduced`) sans masquer le plateau, **▴ ouvrir** la rouvre ; rouvre l'action 🧪 Objet, bois une potion (setup : `store.potions.soin30 = 1`) → PV restaurés, stock décrémenté, 1 tour consommé.

**S22 — Combats contre l'IA améliorée (v1.34).** Pour CHAQUE difficulté (Facile → Enfer) : lance un combat en mode 🤖 Auto et un en Tactique, capture à mi-combat. Vérifie : (a) en Tactique, depuis la ligne arrière, un sort de lignée soin propose un ALLIÉ et soigne (événement de soin dans le journal), un sort de dégâts propose un ENNEMI ; (b) en Auto, le journal montre des soins/buffs de lignée quand la ligne arrière caste (lot 0) ; (c) l'IA ennemie cible prioritairement les unités killables et évite l'arrière protégé quand l'avant tient (observer 2-3 tours de journal) ; (d) en Facile l'IA fait parfois des choix sous-optimaux visibles (sort moins cher, cible non killable), en Enfer non ; (e) aucune régression du mode Auto (plateau, rail, journal, vitesse comme S6) ; (f) errance : si le héros se coince contre un obstacle, il repathe puis abandonne proprement (pas d'orbite infinie). 0 erreur console attendue.

**S23 — Parties multiples (v1.35).** Sur l'Accueil (téléphone ET PC), capture le panneau « Parties » à côté de la boîte 💾. Vérifie : (a) 4 cartes d'emplacement avec résumé (or, donjon·étage, niveau d'équipe) et date, la partie en cours marquée « en cours » ; (b) ✨ Nouvelle partie sur un slot vide démarre un départ frais (écran de départ à 2 cartes rejoué) et la partie courante reste intacte ; (c) ▶ Jouer bascule sans perte (or/équipe retrouvés), la partie quittée est sauvegardée d'abord ; (d) ✏️ Renommer persiste après rechargement ; (e) 🗑 Supprimer demande deux confirmations et n'efface que ce slot ; (f) après rechargement de la page, la dernière partie jouée est rechargée ; (g) exporter/restaurer un code FCSAVE1 s'applique à la partie active. 0 erreur console attendue.

**S25 — Interactions d'errance au clic (v1.40).** Dans une zone (Marées), clique sur le BÂTIMENT du donjon (n'importe quel mur, pas seulement la porte peinte) : un toast « → Porte du donjon » apparaît et le héros s'y rend puis le combat de zone donjon démarre. Idem clic à côté de l'autel (soin + toast), à côté du point de retour (toast + retour à l'Accueil hub-ville, PAS à la sélection des zones), et sur une hutte. Si un chemin est bloqué, le toast « ✗ Chemin bloqué » s'affiche. Vérifie sur téléphone ET PC, avec le doigt (tap) : aucune interaction ne doit rester silencieuse.

**S24 — Errance refondue (v1.36).** Pour CHAQUE zone (Marées, Forge, Bosquet, Crypte, Zénith), viewports 1440×900 ET 390×844 : entre dans la zone, capture la carte après 2 s. Vérifie : (a) peinture A+ lisible (taches organiques, chemin texturé, étang avec rive/nénuphars, arbres en couches avec ombre, donjon peint, autel à halo) ; (b) palette propre à la zone (Forge braises, Bosquet vert profond, Crypte froide, Zénith doré) ; (c) ambiance : attends le passage au soir/nuit (cycle ~100 s) et capture — overlays semi-transparents, halo du héros, lucioles visibles, tuiles toujours lisibles ; papillons le jour ; (d) lames des hautes herbes animées, écartées au passage du héros ; (e) marche sur le chemin : traces de pas ; (f) clic sur la tuile de retour ville (porte lumineuse) → retour aux Terres Sauvages sans perte ; (g) casse une jarre (tap héros devant la jarre) : arc doré + étincelles + jarre en éclats, +1 éclat brut ; (h) **captures comparatives côte à côte** maquette `docs/design/maquettes/errance-demo-jouable.html` vs jeu, même zone, 0 erreur console.

**S25 — Correctifs v1.37 (7 lots).** Viewports 1440×900 ET 390×844, 0 erreur console. (a) **Équipe/combat** : tenter d'entrer dans une zone sans équipe → toast « Composez d'abord votre équipe » ; former une équipe, entrer en zone, déclencher une rencontre, la quitter par navigation, puis re-déclencher une rencontre (plus de blocage) ; donjon lancé depuis le menu enchaîne bien l'étage 2. (b) **Boutons équipe** : collection et slots — ＋/−/ℹ️ en bas-droite, badge de niveau lisible en haut-droite (capture 390×844 exigée). (c) **Tactique par défaut** : un combat démarre en « Mode : Tactique » ; basculer en Auto persiste après rechargement. (d) **Boutique** : marchand = 3 offres du jour seules (pas de « Catalogue complet »), offre épuisée grisée avec compteur, article verrouillé masqué, article trop cher visible bouton grisé. (e) **Combat** : fenêtre d'action « ⚔ Attaque — ~N · frappe de {classe} à X % » ; fiche carte avec le % de frappe ; attendre une esquive (ou forcer via seed) → capture du feedback « 💨 Esquivé ! » + ligne de journal exigée ; fiche d'un sort signature avec rôle · cible · puissance, et ciblage sur les ennemis pour un sort de dégâts. (f) **Errance** : après une victoire de combat de zone, le héros est figé (aucun mouvement sans tap) et la grâce affichée vaut 8.

### Rapport final

Produis `rapport-validation.md` avec : pour chaque scénario, statut OK/KO, captures nommées (`S3-collection-mobile.png`…), la liste EXHAUSTIVE des erreurs console avec contexte, et toute anomalie visuelle (élément coupé, mal aligné, chevauchement, texte tronqué, CSS brut visible) avec capture à l'appui. Termine par un verdict global et les 3 corrections les plus urgentes.

---

## Notes pour le lanceur

- Les vitesses de combat : le bouton `#speed` fait défiler ×0,5 → ×32 ; ×16/×32 coupent l'animation (utile pour S9).
- « Auto ce tour » laisse l'IA jouer le tour courant sans bloquer le test du S7 sur les tours suivants.
- Les vidéos de sorts (FX v0.48, servies via `fx/` en staging) **sont affichées en jeu depuis v1.31** (lot 5) : voir S16. Servir la racine du dépôt = assets absents = fallback attendu, non bloquant.
- Scaffolding de test autorisé : `localStorage.clear()`, mutations de `store` en console (matériaux, or, potions, `acc`) pour poser un état, puis `save()` — mais AUCUNE modification de fichier du jeu.
- Le digest et le smoke (baselines ci-dessus) valident le MOTEUR ; ce protocole valide l'AFFICHAGE réel dans un vrai Chromium, ce que le harnas ne peut pas faire (DOM simulé). Les deux sont complémentaires.