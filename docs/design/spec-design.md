
# Fondations Cards — Design (spec v2)

**Date :** 05/11/2026 (pivot assumé ce jour)
**Statut :** réécriture complète après pivot, en attente de validation
**Décideurs :** Marc-Olivier BIZE

> **Pivot du 05/11/2026 :** le lien « vie réelle » (habitudes, validations, hooks API) est **suspendu** — conservé uniquement comme option lointaine (jalon 4). Le jeu devient un **jeu solo de collection et de batailles** (style AFK Heroes / auto-battler), 100 % navigateur. Le nom « Fondations Cards » est provisoire.

---

## 1. Vision

Jeu solo de **collection de cartes + batailles en donjons**, entièrement jouable dans un navigateur, sans backend. On collectionne des cartes via des boosters et des récompenses de donjons, on les fait évoluer par fusion ou sacrifice, et on enchaîne des combats — automatiques ou manuels — où les **synergies de familles** (à la Teamfight Tactics) récompensent la diversité et la chasse aux cartes spécifiques.

### Boucle de jeu

1. **Explorer** — enchaîner les étages des donjons, par type.
2. **Récolter** — boosters de type, récompenses d'étages, défi quotidien à graine.
3. **Construire** — composer une équipe de 5 (attaque + support) qui maximise les synergies.
4. **Combattre** — résolution auto ou manuelle, lisible et animée.
5. **Évoluer** — fusionner, sacrifier pour améliorer, ou sacrifier pour des boosters.

### Décisions arbitrées en brainstorming

| Décision | Choix |
|---|---|
| Lien « vie réelle » | **Suspendu** — option lointaine (jalon 4), retiré du périmètre courant |
| Architecture | **100 % navigateur**, localStorage, sans backend |
| Rythme | **Enchaînement libre des donjons** + un **défi quotidien à graine** |
| Monstres | Tous collectionnables, mais **uniquement via boosters/récompenses** de type — plus de capture directe |
| Combat | 2 lignes (attaque/support), **synergies par types à la TFT** (paliers), doublons comptés une fois, auto ou manuel |
| Doublons | 3 sorties : **fusion** (nouvelle carte), **sacrifice-amélioration**, **sacrifice-booster** |
| Thème | Série 1 anime/manga (~80 cartes) + typage à 2 axes |
| Art | Illustration fantasy « TCG » via ComfyUI (hors-ligne), placeholders SVG |

---

## 2. Architecture

- **Une SPA statique** : HTML/CSS/JS vanilla, aucun build, aucun framework, aucun backend, aucune dépendance au runtime.
- **État** : localStorage, avec **export/import JSON** obligatoire (bouton visible — la collection est précieuse, un navigateur peut être vidé).
- **Hébergement** : servi en **statique par le Pi-hub** (nginx), accessible depuis PC et mobile via l'accès existant. Le jeu reste 100 % client — le serveur ne fait que livrer des fichiers ; la sauvegarde reste locale au navigateur (export/import pour transférer entre appareils).
- **Art des cartes** : pipeline hors-ligne ComfyUI inchangé (script lit le catalogue, génère les images, versionnées avec le code). Le jeu n'appelle jamais ComfyUI à l'exécution ; sans image, placeholder SVG. **Prototype v0.9 : les familles de l'Aube et de l'Eau sont complètes et illustrées jusqu'à la rareté L** (5 maillons chacune, un même personnage par famille du C au L : Léna pour l'Aube, Alix pour l'Eau — 10 cartes illustrées) ; en plus, l'emballage du booster et la carte du donjon L'Antre des Marées ont leur propre illustration. Les autres familles (Sabre, Ombre, Bouclier) restent en glyphe en attendant leurs arts ; elles sont complètes en données mais leurs maillons UR/L arrivent au jalon 2. Les images sont réduites et inlinées dans le dist autonome, servies en fichiers séparés sur l'hébergement statique.
- **Aléa** : PRNG semé (seed) partout — tirages de boosters, composition des combats, défi quotidien (graine = date locale). Le moteur de combat est **déterministe** pour une graine et un état d'équipe donnés.

---

## 3. Combat

### Lignes

- **Ligne d'Attaque** (max 3) : engage et encaisse les coups.
- **Ligne de Support** (max 2) : ne peut être ciblée que si l'attaque est vide ; à chaque tour, applique son effet de soutien (soin, +X % ATK pour le tour, bouclier…).
- **Défense désespérée** : si la ligne d'attaque est vide (tous les attaquants KO), les supports passent à l'**attaque de base** (ATK de base, cibles par défaut) — une équipe sans attaquants vivants ne perd jamais par forfait.
- Équipe totale : **5 cartes** choisies dans la collection.

### Synergies de Classe & d'Élément (à la TFT)

- Chaque carte porte des **types** sur **2 axes** : *Classe* (le pouvoir — Guerrier / Mage / Prêtre / Assassin) et *Élément* (l'affinité — Feu / Eau / Terre / Ombre / Lumière). L'axe *Origine* (Shonen, Isekai…) a été abandonné au profit des éléments, plus lisibles pour un joueur.
- Pour chaque type, on compte les cartes **uniques** de l'équipe. **Règle des doublons : deux exemplaires de la même carte ne comptent qu'une fois dans les compteurs de types, mais les deux exemplaires bénéficient des bonus** — empêcher le stack, récompenser la diversité ou la chasse ciblée.
- **Paliers par type** (proposition : 2 cartes → palier 1 ; 4 cartes → palier 2). Chaque palier débloque un bonus d'équipe propre au type (ex. « palier 1 : +10 % ATK ; palier 2 : effet signature du type »).
- Le choix stratégique : spécialisation (4-5 cartes d'un type pour le palier 2) ou diversité (2-3 types à palier 1) — avec la règle des doublons, il faut des cartes *différentes* du même type.

### Déroulement

- Résolution **tour par tour** : attaquants frappent, supports appliquent leurs effets, ennemis ripostent en ciblant l'attaque d'abord.
- **Ennemis en miroir complet** : les vagues ennemies ont la **même configuration que le joueur** (une ligne d'attaque et une ligne de supports) et suivent les mêmes règles — leurs supports soignent et arment leur ligne, et ne passent à l'attaque qu'en défense désespérée.
- **Attaques spéciales** : chaque unité (équipe et ennemis) déclenche sa spéciale **tous les 3 coups**, remplaçant l'attaque de base : dégâts **x1,6**, effet de support **x1,5**. Toujours annoncée à l'écran (carte qui grossit et luit, nom affiché, effet visuel distinct), pour qu'on sache quelle attaque est utilisée. **L'action se ralentit légèrement au déclenchement** pour rendre le moment lisible et spectaculaire (pacing global un peu plus lent au profit du juice).
- **Mode auto** par défaut : le combat se joue seul, journal lisible, animations, ~2 minutes.
- **Enchaînement automatique** : après une victoire, l'étage s'incrémente tout seul et le combat suivant se lance sans action du joueur (mode auto).
- **Mode manuel** : à chaque tour, le joueur choisit la cible de chaque attaque et l'ordre de déclenchement des supports — mêmes règles, plus de contrôle.
- **Défi quotidien** : un combat spécial par jour à **graine = date locale** (composition et modificateurs tirés de la graine, visibles avant engagement), récompense : 1 **booster premium**.

---

## 4. Donjons & récompenses

- **Un donjon par élément structurant** (proposition : un donjon par *Élément* ; liste figée avec le catalogue). Chaque donjon = un enchaînement d'étages (1 étage = 1 combat), **boss tous les 5 étages**, progression sauvegardée par donjon. Un donjon a **un thème et une fin** : le prototype couvre « L'Antre des Marées », 20 étages, avec un **boss final à l'étage 20** (accompagné de sbires et de supports) ; vaincre le boss final clôt le donjon. Le vrai système multi-donjons (un par élément, récompenses par profondeur) arrive en jalon 2.
- **Récompenses** — tous les monstres, sbires comme boss, peuvent finir dans la collection, mais **uniquement via boosters ou récompenses**, jamais par capture directe :
  - Première victoire d'un étage → récompense directe : 1 carte du type du donjon (rareté croissante avec la profondeur).
  - Boss vaincu (tous les 5 étages) → 1 **booster de type** (tirage restreint aux cartes du type du donjon).
  - Rejouer un étage déjà gagné → récompense mineure (proposition : 1 carte C du type, plafond quotidien anti-grind à définir).
  - Défi quotidien gagné → 1 **booster premium**.
- **Enchaînement libre** : aucun verrou quotidien sur les donjons — le but est d'enchaîner les combats.

---

## 5. Économie des doublons

- **Doublon** = tout exemplaire au-delà du premier d'une carte. Coûts volontairement **élevés** (difficulté assumée), compensés par des boosters et récompenses **plus généreux** — le ressenti visé : chaque doublon a de la valeur, chaque gain de niveau ou fusion est un petit événement.
- **Fusion** : 5 doublons de rareté X **d'un même type** → 1 carte aléatoire de rareté X+1 de ce type (cartes fusion-only incluses). 5 doublons de L → 1 **M (Mythique)** ; les M sont fusion-only et ne se fusionnent pas.
- **Sacrifice-amélioration** : sacrifier des doublons pour **monter une carte de niveau** : +10 % ATK/PV par niveau. Proposition de coût : le passage au niveau n coûte 2n doublons (de n'importe quelle rareté, fongibles) ; niveau max par rareté : C 5, R 4, SR 3, UR 2, L 1, M 0.
- **Sacrifice-booster** : 10 doublons → 1 booster standard.
- **Tous les chiffres de cette section sont des propositions à équilibrer pendant le prototypage.**

### Raretés & tirages

- Raretés : C / R / SR / UR / L / M. Distribution booster standard (**8 cartes**, généreux pour compenser les coûts de forge) : C 60 % / R 25 % / SR 10 % / UR 4 % / L 1 %, garantie ≥ 2 R. Booster premium (8 cartes) : C 30 % / R 35 % / SR 25 % / UR 7 % / L 3 %, garantie ≥ 1 SR. Booster de type : distribution standard, pool restreint au type.
- ~20 % des cartes SR et plus sont **fusion-only** (jamais tirées en booster) — les doublons prennent une valeur stratégique.

---

## 6. Catalogue

- **Série 1 : anime/manga**, ~80 cartes. Distribution : C 24 / R 20 / SR 16 / UR 10 / L 7 / M 3.
- **Personnages 100 % originaux** : « anime/manga » désigne le style visuel uniquement (art ComfyUI dans cette esthétique). Interdit de reprendre des personnages, noms ou séries existantes — pas d'IP réelle, à la fois pour la cohérence créative et les droits.
- Chaque carte : `nom`, `description` (1 ligne), `rareté`, `types` (2 axes : Classe + Élément), `rôle` (attaque / support), `ATK`, `PV`, `special` (nom + description de l'attaque spéciale, **présente sur toutes les cartes**), `famille` (optionnelle, voir ci-dessous), effet (pour les supports), `source` (booster / fusion), `art_prompt`, `art_file`.
- **Classe ≠ rôle** : la *Classe* décrit le pouvoir (Guerrier / Mage / **Prêtre** / Assassin), le *rôle* décrit la ligne. Un Prêtre peut donc être attaquant (ex. la Garde-Promesse) ou support : le mot « Prêtre » dit qu'il tient de la lumière et des soins, sans le verrouiller en arrière-garde — et on garde la lisibilité immédiate du terme.
- **Familles d'évolution** : les cartes s'organisent en **lignes narratives** au sein d'une famille (ex. Apprentie des Rivières → Sorcière des Rivières → Sorcière des Océans → archimage UR → déesse L), chaque maillon d'une rareté strictement supérieure au précédent. La fiche de carte affiche la ligne complète, maillons futurs verrouillés. Piste à figer en jalon 2 : **la fusion fait évoluer la carte vers le maillon suivant de sa famille** (plutôt qu'un tirage aléatoire de même type).
- **Convention des noms** : avant le niveau UR, une carte ne porte **qu'une épithète** (pas de nom propre) ; le **nom propre du personnage est révélé à l'UR**, moment de collection, et **la même personne accompagne la ligne jusqu'à la L** (sinon, la famille propose plusieurs chemins d'évolution, à définir si le besoin apparaît).
- Les types sont répartis pour que chaque famille dispose d'assez de cartes pour atteindre les paliers (une famille de 3 cartes ne peut pas atteindre le palier 2 : à éviter au moment du catalogue).
- Ajouter une série = déposer un JSON + ses images (aucune modification du code).

---

## 7. Interface (SPA, 6 écrans, hash routing)

**Exigence centrale, presque plus importante que le reste** : une UI **réactive, moderne et propre**, au niveau de Kyara ou WikiMasters — mouvement, effets sur les cartes et les boosters, belles animations de combat. Le juice n'est pas une couche finale : c'est un critère d'acceptation du jalon 1.

1. **Donjons** — liste des donjons par type, progression, défi quotidien en tête d'affiche.
2. **Combat** — vague visible avant engagement, choix auto/manuel, journal tour par tour, animations et « juice ».
3. **Collection** — grille par série, filtres type/rareté, niveaux des cartes, doublons.
4. **Équipe** — builder avec **compteur de synergies en direct** (paliers atteints affichés, bonus listés), glisser-déposer sur les 2 lignes, et un **bouton d'aide (ℹ)** qui ouvre une fiche expliquant les deux axes, les paliers et la règle des doublons.
5. **Forge** — fusion, sacrifice-amélioration, sacrifice-booster, avec simulation du coût avant validation.
6. **Ouverture** — animation de révélation carte par carte (pause dramatique sur UR/L/M).

### Direction UI & « juice » (non négociable)

- **Responsive mobile-first** : jouable au doigt sur téléphone (cible principale d'usage) et impeccable sur desktop ; pas de scroll horizontal, zones tactiles généreuses.
- **Cartes vivantes** : forme de **carte classique portrait 5:7** (frame pour l'illustration), bordure par classe, liseré par élément, chip de rareté et chip de rôle (attaque/support) toujours visibles ; effet de tilt/parallaxe 3D au survol ou au toucher, reflet holographique selon la rareté (C sobre → L/M holographique), lueur au palier de synergie actif. Les **boss** ont une carte élargie, une teinte propre et une lueur distincte.
- **Fiche carte** : **appui long** sur une carte de la collection → fiche en grand (grande image, stats, attaque spéciale, effet de support, ligne d'évolution **illustrée** : chaque maillon montre son art, les futurs verrouillés en silhouette, et un clic sur un maillon ouvre sa propre fiche pour feuilleter la lignée) ; l'**appui rapide** fait l'action par défaut (ajout à l'équipe depuis la collection, fiche directe en combat et sur les cartes révélées).
- **Ouverture de booster** : rituel en deux temps — le paquet apparaît flottant, on l'ouvre avec un **bouton glissant sur le côté** (glisser le curseur jusqu'au bout, la piste s'illumine à l'arrivée), l'emballage s'agite et s'envole ; les 8 cartes arrivent **face cachée dans une grille bien visible** (tri de la moins rare à la plus rare), dévoilement une à une (flip 3D) ou en une fois, clic sur une carte cachée = la dévoiler, clic sur une carte révélée = fiche complète ; éclat + pulsation sur SR+, son + secousse + éclat sur UR/L/M.
- **Combat animé** : cartes en plan latéral, lignes avant/arrière **en quinconce**, attaquants qui **se ruent vers leur cible** (dash) puis reviennent, états visibles (idle, attaque, touché, KO), chiffres de dégâts flottants, secousses d'écran sur coups lourds, déclencheurs de synergie mis en avant (bannière + flash au moment où un palier s'active), vitesse réglable et skip. **Attaques spéciales avec animation propre** : la carte grossit et luit, le nom de la spéciale s'affiche au-dessus, dégâts/soins/buffs des spéciales rendus différemment (chiffres plus gros, dorés, avec éclat). **Enchaînement automatique** : à la victoire, l'étage s'incrémente et le combat suivant se lance seul en mode auto.
- **Transitions** : navigation sans rechargement, transitions douces entre écrans, feedback immédiat sur chaque action (bouton, gain de carte, level-up).
- **Perf** : animations en CSS transform/opacity (60 fps), pas de lib JS lourde ; le jeu reste une SPA vanilla.

---

## 8. Sauvegarde & cas limites

- localStorage + **export/import JSON** (sauvegarde manuelle fortement suggérée dans l'UI) ; détection de sauvegarde absente ou corrompue → écran de récupération.
- Défi quotidien : ancré sur la date locale ; déjà gagné → combat rejouable sans récompense.
- Récompenses d'étage : créditées une seule fois (liste d'étages déjà récompensés persistée).
- localStorage saturé ou indisponible → message explicite, aucune perte silencieuse.
- Carte sans art → placeholder SVG ; le moteur ne dépend jamais des images.

---

## 9. Tests

Logique de jeu en **modules purs** (moteur de combat, tirages semés, comptage de synergies, fusion/sacrifices) + tests automatisés JS (vitest ou équivalent) :

- **Économie** : distribution des tirages sur 10 000 boosters (tolérances), garanties ≥ 1 R / ≥ 1 SR, fusion-only jamais tirées.
- **Synergies** : paliers corrects ; **deux exemplaires d'une même carte comptés une fois mais tous deux bénéficiaires** ; bonus de palier appliqués ; spécialisation vs diversité.
- **Combat** : déterminisme (même graine + même équipe → même déroulé), ciblage de la ligne d'attaque d'abord, supports intouchables tant que l'attaque vit, équivalence auto/manuel (mêmes règles).
- **Donjons** : récompense d'étage créditée une fois, boss tous les 5 étages, booster de type restreint au pool du type.
- **Forge** : coûts exacts des 3 sorties, refus si réserve insuffisante, M uniquement via fusion de L.
- **Sauvegarde** : export → import → état identique ; défi quotidien ancré à la date (horloge injectée).

---

## 10. Jalons

1. **Jalon 1 — Prototype combat** (mock, ~20 cartes fictives) : moteur de combat (2 lignes, tour par tour), synergies avec paliers et règle des doublons, auto + manuel, **juice inclus dès ce jalon** (cartes vivantes, dégâts flottants, bannières de synergie, ouverture animée d'un booster mock). Livrable : la décision go/no-go sur le cœur stratégique **et** le ressenti UI. Tous les chiffres d'équilibrage s'ajustent ici.
2. **Jalon 2 — Jeu complet** : catalogue série 1 typé, boosters + collection, forge (3 sorties de doublons), donjons par type + récompenses, sauvegarde localStorage + export/import, **mis en ligne sur le Pi-hub** (statique via nginx, accessible PC + mobile).
3. **Jalon 3 — Défi quotidien, équilibrage & art** : défi à graine, booster premium, équilibrage final, pipeline art ComfyUI.
4. **Jalon 4 — Option lointaine (hors périmètre tant que non décidé)** : lien « vie réelle » — validations d'habitudes créditant des boosters, hooks externes. Ne reviendra que sur décision explicite.

## 11. Hors périmètre (YAGNI)

- Backend, API, comptes, synchronisation multi-appareils (l'export/import suffit).
- Lien « vie réelle » (habitudes, hooks, Notion/LifeUp/Obsidian) — suspendu, voir jalon 4.
- Multi-joueurs, échanges, classements.
- Monnaies (or, fragments), « production idle » de cartes, mode hardcore destructeur.
- Application mobile native, PWA offline (option facile plus tard si besoin).
---

## 12. Évolutions du prototype (v0.8, retour utilisateur)

- **Plateau face à face** : les lignes d'attaque des deux camps se font face au centre du plateau, les supports des deux côtés sont « derrière » (loin du centre) ; les lignes sont décalées en quinconce. Le builder d'équipe reprend la même disposition (ligne de support décalée).
- **Trois équipes** : trois compositions mémorisées (onglets Équipe 1/2/3) ; le combat et le compteur de synergies pointent sur l'équipe active.
- **Lisibilité du combat** : les chiffres flottants (dégâts, soins, boucliers, buffs) sont plus gros et vivent 1,5 s indépendamment de la vitesse du combat, pour rester lisibles en mode rapide ; les effets de spéciale s'affichent encore plus gros.
- **Spéciale plein écran** : quand une unité déclenche son attaque spéciale, un écran dédié envahit la vue — l'illustration de la carte en grand, bandeau « ATTAQUE SPÉCIALE » / « SOIN SPÉCIAL » / « SPÉCIALE DE SUPPORT », nom de la capacité et de la carte, flash de la zone adverse — puis retour au plateau pour l'impact. (À l'étude pour le jalon 2 : une barre de charge remplaçant le rythme automatique « toutes les 3 attaques ».)
- **Fin immédiate** : dès que le dernier ennemi (ou la dernière unité alliée) tombe, le tour s'arrête net — plus personne n'agit « pour rien » après la victoire/défaite.
- **Mode Auto ↔ Manuel en plein combat** : basculer reprend la main (ou relance l'enchaînement) sans attendre la fin du combat.
- **Écran Donjons** : entrée dédiée dans la navigation ; chaque donjon a sa carte visuelle (illustration, description, nombre d'étages, accent couleur) et mène au combat. L'Antre des Marées est le premier ; d'autres suivront au jalon 2.
- **Booster qui se déchire** : l'emballage illustré occupe la scène, flotte doucement, reflet balayant ; le bouton glissant est posé directement dessus. Au bout de la glissière, le paquet se déchire en deux moitiés qui s'écartent en tournant dans un éclat de lumière, puis les cartes apparaissent face cachée (dévoilement une à une ou en bloc, tri de la moins rare à la plus rare).
- **Fond et navigation** : fond dégradé plus coloré (teintes teal/violet/vert), lien de navigation actif mis en évidence.

## 13. Évolutions v0.9 (méta mana/sorts, niveaux, correctifs)

- **Sorts et mana (nouveau cœur stratégique)** : chaque famille possède une ligne de sorts par coût croissant ; un maillon de rareté t connaît les sorts des maillons précédents plus le sien, avec une réserve de mana et une régénération supérieures (paliers 8/14/22/30/40 mana, régén 2/3/5/6/8). À chaque action, l'unité régénère son mana puis lance le sort le plus cher abordable ; sans mana, elle retombe sur son action de base. Une carte puissante a des sorts puissants ET la réserve pour les jouer, mais chaque incantation vide la réserve : elle doit aussi redescendre sur ses sorts moins chers. C'est le contre-poids à l'évolution (une UR n'écrase pas tout, tout le temps). Remplace le rythme « spéciale tous les 3 coups » ; la barre de charge envisagée reste notée pour le jalon 2 mais n'est plus nécessaire au rythme des spéciales (les gros sorts marqués `big` déclenchent la séquence plein écran existante, les petits une annonce flottante).
- **Niveaux par sacrifice** : posséder au moins 2 exemplaires d'une carte permet d'en sacrifier un depuis sa fiche pour lui faire gagner un niveau (+8 % ATK et PV par niveau, conservé en sauvegarde). Le doublon consommé quitte la collection.
- **Sauvegarde locale** : progression versionnée (équipes ×3, équipe active, étage, graine, collection, niveaux) persistée dans localStorage, silencieuse en iframe sandbox, rechargée au démarrage, validation de version au chargement.
- **Correctifs v0.9** : les illustrations s'affichent (pipeline JPEG corrigé : IDCT, boucle AC, zigzag d'encodage ; plus de voile vert) ; le clic sur une carte donjon entre bien dans le donjon (délégation globale des liens hash dans le routeur, l'iframe sandbox bloquait la navigation) ; un clic sur une carte ouvre sa FICHE (stats, sorts, évolution, ajout à l'équipe) et non la seule image en grand ; chaque carte montre bien SON illustration (mapping id → art corrigé), la fiche est redimensionnée sur mobile.
- **Booster v0.9** : le glisser-déchirer est posé EN HAUT de l'emballage et la coupure suit sa ligne (moitié haute qui s'envole, moitié basse qui tombe) ; les cartes face cachée sont construites derrière le paquet et apparaissent dès le déchirement.
- **Familles complètes Aube et Eau** : jusqu'à la rareté L (a13/a14 Alix UR/L, s9/s10 Léna UR/L) pour voir à quoi ressemble une lignée entière.
- **Juice (skills game-feel)** : hit-stop ~100 ms sur les gros impacts et les KO, secousses graduées par importance, toggle « Flashs : complets/réduits » pour l'accessibilité (désactive éclats plein écran, hit-stop et flashes de zone).
## 14. Influences extérieures : Valkyrie Crusade (2013-2021)

Étude du jeu de référence qui a inspiré Fondations Cards (rapport de recherche fourni par Marc-Olivier). VC était un hybride TCG × city-builder fermé en mai 2021 ; on en retient des mécaniques, pas le modèle économique.

### À adopter (jalon 2, fort rapport profondeur/coût)

- **Oppositions élémentaires** : chez VC, les éléments opposés s'infligent +50 % de dégâts. Nous avons 5 éléments aujourd'hui décoratifs au combat. Adoption d'une roue d'oppositions (Feu ↔ Eau, Lumière ↔ Ombre ; Terre neutre ou opposée à l'Ombre à trancher) : le donjon choisi (Antre des Marées = Eau) incite à ne pas y aller tout-Eau, et les vagues ennemies deviennent un vrai critère de composition. Modification moteur pure, testable.
- **Pitié des boss (jauge d'affection des Archwitches)** : chez VC, la jauge montait à chaque rencontre et garantissait à terme le drop de la carte du boss. Adoption : chaque boss de palier (5/10/15/20) a un compteur de rencontres ; au bout de N victoires/rencontres, le drop de sa carte est garanti. C'est le contre-poison naturel de l'aléa de collection dans un jeu solo sans monétisation.
- **Boss qui montent en niveau à chaque échec** : une Archwitch réapparaissait plus forte après chaque retraite. Adoption pour les boss : chaque défaite contre un boss d'étage le renforce au prochain affront (jusqu'à un plafond), ce qui rend la victoire tardive satisfaisante et donne du sens à l'étagement.
- **Récompenses de donjon** (implicite chez VC via reliques) : nos étages ne donnent rien aujourd'hui. Ajout au jalon 2 : fragments de reliques (4-6 morceaux par relique), complétion → carte R garantie + bonus passif. Objectif de collection hors cartes, raison de refaire les étages.
- **Deck Cost** : VC limitait la puissance embarquable via le coût des cartes (augmenté par les bâtiments). Chaque carte reçoit un champ `cout` (déjà présent dans le catalogue v0.9) ; chaque donjon fixe un plafond qui monte avec la progression. Ça empêche d'écraser les débuts avec les premières UR, donne une raison de jouer les cartes modestes, et permet des donjons-défis à contrainte serrée.
- **Bonus de mono-élément** : VC récompensait l'homogénéité (3 cartes d'un même élément +5 %, 5 cartes +10 %). Nos synergies TFT récompensent la diversité unique ; un petit bonus de mono-élément crée une seconde stratégie viable (draft tout-Eau vs draft multi-types). Simple comptage par élément au moment des paliers.

### À adapter (jalons 2-3, à retravailler pour le solo)

- **Évolution par doublon** (VC : deux exemplaires identiques → version H supérieure) : notre sacrifice/niveau occupe déjà cette case « que faire des doublons ». Si les doublons s'accumulent trop, évolution en « variante H » (art altern, +stats) plutôt qu'un nouveau mécanisme. En attente de données de jeu.
- **Amalgamation** (VC : deux cartes différentes → carte nouvelle) : c'est la « fusion » déjà prévue dans notre spec. Ancrage VC : les amalgamations d'événement fusionnaient des SR-UR en LR ; chez nous, fusionner deux maillons de familles alliées (Eau + Aube) en une carte hybride exclusive. Jalon 3.
- **Coût d'engagement** (VC : soldats perdus en permanence) : rejeté par défaut (frustration gratuite en solo, où on ne « paie » pas le retry), mais l'intention (du poids aux engagements) se garde en mode optionnel : runs de donjon à vies limitées contre meilleures récompenses. Jalon 3, optionnel.
- **Le royaume** : hors périmètre (YAGNI), mais l'idée VC « bâtiment = boost de mécanique » est notée : un « camp » léger au jalon 3+ (améliorations permanentes achetées avec l'or des donjons : +1 slot d'équipe, régén de mana +1, etc.).

### À écarter (échos du F2P / multijoueur)

- **Timers, vitalité, régénération de points** : artifices de monétisation. Notre jeu reste instantané et jouable.
- **PvP, vol de reliques, alliances, classements** : hors scope solo sans backend. Éventuellement des « fantômes » d'équipes locales simulées bien plus tard.
- **Compétences aléatoires en combat** : VC laissait le combat au hasard des procs ; notre identité est le contrôle (mana déterministe, choix de sorts par palier). L'aléatoire reste pour les tirages, jamais pour le combat.
- **Escalade de raretés** (LR, VR, variantes X) : la fin de VC est la leçon — le powercreep a tué le jeu. Notre échelle s'arrête à L ; la puissance vient des niveaux, des sorts et de la maîtrise, pas d'une rareté 7.

### Ce que la mort de VC valide dans nos choix

Le jeu a fermé après que Mynet a systématisé pay-to-win et raretés payantes ; ce que la communauté de fans a reconstruit après (serveurs de revival), c'est le « métier de collectionneur » : évolution, amalgamation, fiches, lignées. C'est exactement notre cœur (familles, lignées, sacrifice) : bonne nouvelle pour l'attachement à long terme, à condition que la collection reste équitable et le combat contrôlable.
## 15. Évolutions v0.10 (boucle de jeu réelle)

Retour test terrain du 5 novembre : la boucle complète « 0 cartes → booster → équipe → donjon → récompenses → farm → sacrifice → boss » est maintenant jouable de bout en bout.

### Correctifs

- **Fiche carte réparée** : en v0.9 la classe CSS « big » de la carte en fiche avait été perdue, la carte prenait toute la largeur en mobile et cachait les informations. La fiche affiche à nouveau stats, sorts (coût ✦, multiplicateur, description), effet de support, ligne d'évolution cliquable maillon par maillon, avec boutons Ajouter à l'équipe (état de la ligne indiqué, retour visuel ✓/✗) et Sacrifier un doublon.
- **Fin des attaques sur cartes mortes** : l'affichage du combat est maintenant INCRÉMENTAL. Chaque event (damage, heal, ko, cast, attack) met à jour la carte concernée au moment où il se produit ; le plateau n'est redessiné qu'au départ et à la fin du tour. Une unité qui meurt en fin de tour ne disparaît plus avant le coup qui la tue, et le mana se voit régénérer et dépenser en direct (chip ✦).
- **Booster 5 cartes** (au lieu de 8) avec garantie d'au moins 1 Rare : les 5 cartes se voient d'un coup d'œil.
- **Bouton de déchirure visible** : le CSS du slider (track 56px, knob 44px, hint « Glissez pour déchirer ») n'existait tout simplement pas ; il a été écrit.
- **Layout mobile réparé** : header/nav qui passent à la ligne, unités réduites (84px), pas de débordement horizontal, l'onglet Booster tient dans la barre.

### Navigation et boucle

- **Page d'accueil** (route #accueil) : première visite → accueil de bienvenue avec les 4 étapes et le bouton « Ouvrir mon premier booster » ; sinon → stats de collection, chips de l'équipe active, « Continuer l'exploration (étage N) » et « Ouvrir un booster ». Le combat n'est plus dans la nav : la route #combat reste, on y entre depuis le donjon ou l'accueil.
- **Catalogue de l'équipe** : seules les cartes possédées sont pleines ; les non-possédées sont grisées (fiche consultable, sans bouton d'ajout). Tri par rareté croissante, badge ×N sur les doublons.
- **Récompenses d'étages** (rewards.js) : chaque étage vaincu donne 2 cartes (3 pour un boss), tirées dans C 55 % / R 31 % / SR 12 % / UR 2 %, déterministes pour une graine. Bannière « VICTOIRE ! +N cartes » et récap dans le journal.
- **Jauge de pitié des boss** (empruntée aux Archwitches de VC, section 14) : chaque palier boss (étage 5/10/15/20) a un compteur de victoires ; à la 3e victoire au même palier, une carte SR+ est garantie. La jauge s'affiche dans le donjon (ligne + mini-barre) et au combat aux étages boss. Le farm d'un même palier n'est jamais du temps perdu : le mur de difficulté se paie toujours en cartes.
- **Scaling doux** : montée 1 + 0,12 × étage (au lieu de 0,15), variance resserrée, boss encaissent (×1,8 PV) sans one-shot (×1,15 ATK). La difficulté est régulière, plus de « salle 3 plus dure que la salle 4 ».

### Méta

- **IA « épargne »** : une unité qui voit son sort le plus cher abordable dans moins de deux actions ne lance PAS un sort moins cher : elle garde son mana pour le gros moment. Testée : l'Archimage sur 7 tours lance 4 Raz-de-Marée et aucun petit sort.
- **3 nouvelles UR en glyphes** pour la diversité de draft : Kenji, Lame Éternelle (Guerrier Feu, attaque), Kira, Reine des Ombres (Assassin Ombre, attaque), Argus, Rempart Éveillé (Guerrier Terre, support bouclier). Les familles lame/ombre/bouclier montent jusqu'à l'UR, leur maillon L est verrouillé (nom affiché). 27 cartes au catalogue.

### Ce qui reste en attente (jalon 2)

Oppositions élémentaires, reliques/fragments, forge/fusion, Deck Cost, bonus mono-élément, boss qui montent en niveau à l'échec, arts des familles lame/ombre/bouclier, hébergement. À faire au fil des itérations courtes, feature par feature.
## 16. Évolutions v0.11 (bugs mobiles, collection, drop lissé)

### Bugs réparés (retour test mobile v0.10)

- **Équipe et fiche totalement inertes (cause racine)** : le panneau de synergies attache son handler sur le bouton d'aide `#syn-help`, qui n'existait PAS quand aucune synergie n'était active (équipe vide) ; `querySelector(...).onclick` sur null lève un TypeError qui casse silencieusement TOUS les handlers attachés après, donc aucun clic sur carte ne fonctionnait. Correctif : le bouton est toujours rendu (les deux branches du panneau) et `?.addEventListener` en défense. Bonus : `closeCardModal()` appelé au lieu de référencé dans la modal de synergies.
- **Bouton du booster hors écran en portrait** : le knob de déchirure était calé à droite du track ; glisser « vers le paquet » exigeait de sortir de l'écran. Correctif : le knob part du bord gauche (glisser vers la droite garde le doigt dans l'écran), hint « Glissez pour déchirer », garde-fou `maxX ≥ 24` px.
- **Filtres/tri disparus** : réintégrés dans l'équipe (chips classe/élément/rôle, styles existants du CSS v0.9).

### Collection et découverte

- **Équipe = possédées seules** : le catalogue complet n'apparaît plus dans la page Équipe ; seules les cartes possédées s'affichent (badge ×N conservé). Découvrir ce qui existe redevient un but.
- **Vue Collection (route #collection)** : une ligne par lignée (eau, aube, lame, ombre, bouclier). Maillons possédés = vraies cartes cliquables ; maillons manquants d'une lignée entamée = silhouette mystère (glyphe de classe + nom + rareté, jamais l'art) ; lignée non entamée = « ??? » intégral ; le maillon L (futur) reste 🔒 et son nom ne se révèle que si l'UR est possédée. Les solos montrent les possédés + « N autres encore cachés ». L'envie de compléter la lignée fait avancer la boucle.
- **Accueil intelligent** : équipe vide → gros bouton « ⚔ Composer mon équipe » (plus de « Continuer l'exploration » qui menait au refus « composez d'abord votre équipe »).

### Drop des boosters lissé

- Nouvelle table : Commune 88,5 % / Rare 9 % / SR 2 % / UR 0,5 % / L jamais. Plafond : au plus 2 non-Communes par booster de 5 ; si 2, alors exactement une R et une SR (jamais deux SR, jamais d'UR au boosteur de base). L'ancienne garantie ≥1 R est retirée. Le socle de la progression = les Communes (fusion et montée en niveaux), les rares sont des coups de chance.
- Alignement avec la demande Magic-like : C majoritaires, R rares, SR/UR réservées à des boosters plus chers (jalon 2, voir ci-dessous).

### Planifié jalon 2 (acté)

- **Monnaie/points** : les victoires rapportent des points ; les boosters s'achètent ; des boosters premium plus chers ouvrent des taux meilleurs (SR/UR bien plus tard). La boucle devient : quelques combats → premier booster → progresser.
- Boss qui montent en niveau à l'échec, oppositions élémentaires, reliques, forge, Deck Cost, mono-élément : voir plan jalon 2 pour l'ordre.

## 17. Évolutions v0.12 (monnaie, boutique, équilibre, mobile)

### Sacrifice et équipes fantômes (retour test v0.11)

- **Sacrifice d'exemplaires libres seulement** : `sacrificeFor` exige 2 exemplaires HORS équipe. Le bug : on pouvait sacrifier des exemplaires placés, puis les replacer → des lignées restaient peuplées de cartes qui n'existaient plus.
- **`sanitizeTeams()` au chargement** : une équipe ne référence que des cartes possédées, au plus 2 fois la même et jamais plus que le nombre d'exemplaires possédés. Les sauvegardes corrompues se réparent toutes seules.
- **Re-rendu après action** : sacrifice ou ajout re-rend l'écran derrière la fiche, plus d'IHM figée.

### Interactions mobiles (spec initiale enfin implémentée)

- **Appui court = action, appui long (450 ms) = fiche** (`js/ui/interactions.js` : `onTap`, seuil 450 ms, mouvement > 12 px annule). Sur une carte placée, l'appui court RETIRE de l'équipe (le double-clic n'existe pas au doigt). Toasts de confirmation, badge ⚡ de points dans l'en-tête.

### Fiche sans spoiler

- Un maillon non possédé ouvre une **fiche mystère** : silhouette, stats « ??? », sorts masqués, jamais l'art du maillon le plus fort. L'art d'un maillon ne se révèle qu'à sa possession. Le sommet L reste 🔒, son nom ne s'affiche que si l'UR est possédée. Boutons Ajouter/Retirer partout (possédées).

### Sorts du joueur lisibles

- Les sorts C/R du joueur étaient quasi invisibles (un float 260 ms) alors que les ennemis SR+ avaient des sorts `big` plein écran. Maintenant : bandeau `.cast-tag` au-dessus du lanceur (950 ms) + float, pour chaque incantation des deux camps.

### Donjon : jamais de blocage

- Chaque entrée **repart de l'étage 1** (bouton par défaut). Un **checkpoint optionnel** apparaît après un boss vaincu (reprise à `floor(record/5)*5+1`, seulement si record ≥ 5). Victoire → `store.record` = max(record, étage). Défaite → message « la prochaine exploration repart de l'étage 1 : farmez les étages bas ».

### Équilibrage des vagues ennemies

- **Plafond de rareté par étage** (`maxRarity`) : étages 1-2 → Communes seules ; 3-4 → ≤ R ; 5-9 → ≤ SR ; 10+ → ≤ UR ; jamais de L. Boss recrutés en R+.
- **Quota de non-Communes par vague** : 0 (étages 1-2), 1 (3-4), 2 (5-9), 3 (10+) hors boss. Un plafond seul autorisait encore « 2 R à l'étage 4 », un mur injuste ; les surnuméraires sont rétrogradés en Communes.
- Scaling de montée 0.12 → **0.10** par étage, variance de tirage 0.85-1.15.

### Booster : garantie Rare, deux paliers

- La garantie **≥ 1 Rare par booster** est réintégrée (un paquet 100 % Communes = déception). Base : C 88,5 / R 9 / SR 2 / UR 0,5 %, plafond 2 non-C = exactement {R, SR}. Premium : C 55 / R 30 / SR 11 / UR 4 %, plafond 2 non-C ≤ {SR, UR}. L jamais en booster (elle attend la forge).

### Monnaie et boutique (début jalon 2)

- **Points ⚡** : victoire d'étage = 15 + 5 × étage (boss : double). Solde visible partout (accueil, donjons, boutique). Migration tolérante des vieilles saves : points = 25 × étages franchis, record = étage atteint.
- **Boutique** : booster de base 60 ⚡, premium 240 ⚡ ; premier booster OFFERT si la collection est vide.

### Leçon technique : collision de noms top-level

- `rewards.js` et `booster.js` déclaraient chacun `function rollRarity` : dans le dist concaténé en script classique, le hoisting faisait écraser la table des récompenses par celle du booster. Renommé `rollRewardRarity` côté récompenses ; règle : dans un bundle sans modules, deux `function` top-level homonymes = la dernière gagne silencieusement.
## 18. Évolutions v0.13 (soin plafonné, niveaux, sorts visibles, points seuls)

### Fiche des cartes à image réparée (bug CSS depuis v0.11)

- `.evo-art` n'avait pas de `position: relative` : l'art du maillon (`.art-img` en `position: absolute; inset: 0`) s'échappait jusqu'au premier ancêtre positionné (la modale) et couvrait tout l'écran, bloquant les boutons. Un simple `position: relative` sur `.evo-art` corrige. Leçon : conteneur d'art sans position + image absolue = fuite visuelle vers l'ancêtre positionné.

### Fin des combats interminables

- **Plafond de soutien** : un soin ou un bouclier ne restaure jamais plus de 35 % des PV max de la cible par incantation. Avant, le mult du sort (jusqu'à ×6) s'appliquait au soin de base : un support UR rendait 250+ PV par tour, son camp devenait invincible.
- **Fureur du donjon** : passé le tour 15, les dégâts des deux camps montent de 8 % par tour supplémentaire. Aucun combat ne s'éternise.
- **Garde-fou** : 60 tours sans vainqueur = bannière ÉGALITÉ, pas d'enchaînement d'étage.

### Le grand sort revient à l'écran

- Depuis l'équilibrage v0.12, plus aucun ennemi ne portait de sort `big` en début de partie : l'animation plein écran avait disparu. Maintenant, tout sort coûtant 5 mana ou plus déclenche la séquence plein écran (les deux camps).

### Niveaux : les cartes démarrent à 1, les ennemis portent leur étage

- `makeUnit` : niveau 1 par défaut, +8 % ATK et PV par niveau, `u.level` exposé et affiché (« Nv X ») dans l'équipe, la collection et les fiches.
- Les cartes ennemies portent `level` = étage du donjon : la montée en puissance passe par le système de niveaux (le multiplicateur de stats ad hoc des vagues est supprimé, reste la variance 0.85-1.15 et les multiplicateurs boss).
- Le sacrifice affiche le gain en % (« Niveau X : +Y×8 % ») au lieu d'un niveau interne 0.

### Récompenses : des points, des cartes au boss

- Les étages ordinaires ne rapportent QUE des points (plus de cartes systématiques) ; seul un boss vaincu lâche une carte. La jauge de pitié (tous les PITY_MAX boss d'un palier) garantit une SR ou mieux. Les cartes courantes viennent des boosters de la boutique, message affiché en fin de combat.
## 19. Évolutions v0.14 (fusions, boucliers visibles, manuel jouable)

### Fusions : nourrir ou évoluer (le cœur du dilemme)

- **Nourrir** (depuis la fiche d'une carte possédée) : la cible mange un AUTRE maillon de sa lignée. Gain = tous les exemplaires libres du maillon mangé + la moitié (arrondie haut) de ses niveaux ; le maillon mangé perd ses niveaux (transférés, pas dupliqués : impossible de nourrir deux fois avec les mêmes niveaux), ses exemplaires placés en équipe restent mais retombent au niveau 1.
- **Évoluer** : 3 exemplaires libres d'un maillon donnent le MAILLON SUIVANT de la lignée, niveaux conservés + 1 (bonus de fusion). C'est la forge des sommets L : 3 UR donnent la L, introuvable en booster.
- Le même tas de doublons peut nourrir la carte forte OU payer l'évolution : c'est l'équilibre demandé entre faire monter les niveaux et passer au maillon supérieur. Une carte très montée reste intéressante à faire évoluer puisque ses niveaux suivent.

### Soins : plein sans plafond artificiel

- Le plafond 35 % des PV max (v0.13) est retiré pour les SOINS : on soigne jusqu'aux PV max, jamais au-delà. Le bouclier garde son plafond de 35 % des PV max par incantation (pas d'empilement infini) et la Fureur du donjon garantit toujours la fin des combats. Aucun sort n'augmente encore les PV max ; les PV s'affichent désormais en hp/maxHp, un tel sort sera lisible.

### Boucliers visibles (la vraie cause des « combats interminables »)

- Le bouclier s'affiche sur la carte (compteur bleu) dès qu'il est supérieur à 0. L'ABSORPTION de dégâts est un event distinct (« 🛡 −X ») : on voit l'attaque encaissée par le bouclier, son compteur baisser, et les PV ne bouger que du reste. Avant, l'absorption produisait le même float « +X » qu'un gain de bouclier : les PV semblaient ne jamais descendre.

### Vitesse réparée

- La vitesse (lente / normale / rapide) était capturée une seule fois au lancement du combat : changer en pleine bataille ne faisait rien jusqu'au combat suivant. Elle est maintenant relue à CHAQUE tour, le changement s'applique au tour suivant.

### Mode manuel jouable

- En mode manuel, toucher un ennemi le désigne comme cible (liseré doré + 🎯, mémorisé d'un tour à l'autre) : la i-ème cible pour le i-ème attaquant, « Combattre » résout le tour. Sans cible, la ligne attaque la première ennemie. Une ligne d'aide explicite le mode en cours sous les boutons.

### Fin de combat : retour au donjon

- Défaite, égalité (60 tours) ou donjon terminé affichent un bouton « ↩ Retour au donjon » qui ramène à l'écran des donjons pour retenter sa chance immédiatement.

### Plateau : boss sans chevauchement, rangées pleines

- Le boss gardait une carte de 130 px dans un conteneur de 100 px : il recouvrait son voisin, et les rangées restaient calées à gauche. Les unités de combat s'étirent maintenant (flex) et centrent leurs rangées, le conteneur du boss grandit avec lui : plus de chevauchement, les cartes occupent la largeur, le boss reste plus imposant.

### Cartes illustrées : l'art couvre la carte en combat

- Les cartes à image posent leur illustration en FOND COMPLET (graduel sous les textes) : la vignette tronquée disparaît. Les cartes glyphe gardent l'ancien layout.

### Niveau et compteur désembourbés

- Le badge « Nv X » (coin haut droit) et le badge « ×N » (aussi haut droit) se chevauchaient : le compteur passe au centre du bord haut.

### Premier booster enfin aléatoire

- Le booster offert tirait avec la graine de sauvegarde (42 pour tout le monde) : strictement les mêmes 5 cartes, mêmes rôles (3 attaquants / 2 supports) à chaque partie. La graine d'ouverture mélange désormais horloge et aléa ; les rôles ne sont jamais truqués, seul le tirage était figé.
## 20. Correctif v0.14.1 (écran blanc)

### Symptôme et cause

- Le prototype v0.14 publié s'affichait en écran blanc total sur téléphone, sous le bandeau du canvas. La version v0.13 fonctionnait quelques minutes plus tôt.
- Cause racine : le dist v0.14 avait perdu sa feuille de style ET son conteneur principal lors d'une reconstruction d'environnement. Le script se retrouvait seul dans un `<head>` non fermé, `document.body` valait null au démarrage, et l'application (100% JS) plantait avant de pouvoir dessiner quoi que ce soit.
- Les 49 tests de l'époque restaient verts : ils ne testaient que le JS du bundle, jamais le document final.

### Réparation

- Le JS du bundle était intact (fusions, soin, boucliers, manuel : tout y était). Seul l'habillage manquait.
- La CSS étant irrécupérable (v0.13 écrasé, projet source effacé), elle a été RÉÉCRITE intégralement depuis la spec et les captures téléphone : thème sombre, cartes portrait 5:7 bordées par élément et liseré de classe, raretés avec holo animée sur la L, art en fond complet, ciblage doré, floats par type d'event, bannières win/lose, overlay plein écran des gros sorts, modales 2 colonnes, boutique et déchirure de booster, donjons et jauge de pitié, toasts, mise en page mobile.
- Bonus : un timer de déchirure de paquet pouvait déclencher après avoir quitté l'écran boutique et plantait sur un élément disparu ; il vérifie maintenant que le paquet existe encore.

### Garde-fous pour que ça ne se reproduise plus

- Le build refuse tout dist sans `<style>` non vide, sans `<body>` placé AVANT le `<script>`, avec un nombre inattendu de scripts, de marqueurs de module ou d'assets, ou dépassant 1 Mo.
- Un harnas de fumée exécute le dist complet dans un mini-DOM et déroule les écrans clés : accueil, équipe, fiche avec fusions (nourrir puis évoluer), boutique, déchirure glissée, révélation des 5 cartes, combat jusqu'à la défaite, bouton retour au donjon. Il vérifie AUSSI la structure du document final : c'est lui qui aurait attrapé l'écran blanc.
- Un script de reconstruction extrait les 22 modules et la CSS depuis le dist du canvas avec les mêmes garde-fous : le canvas prototype reste la source de vérité récupérable.
- Leçon : vérifier le DOCUMENT, pas seulement le bundle.
## 21. Évolutions v0.15 (niveaux par exemplaire, retours du terrain)

Neuf retours du terrain après les premiers boss vaincus, plus une refonte du modèle de niveaux.

### Niveaux par exemplaire (refonte du modèle de progression)

- Chaque EXEMPLAIRE d'une carte porte son propre niveau (`copies` : id -> liste de niveaux, un par exemplaire). Deux exemplaires de la même carte peuvent différer.
- Sacrifier un doublon : le plus faible exemplaire LIBRE part, le meilleur exemplaire monte d'un niveau. Les exemplaires placés en équipe ne sont jamais mangés.
- Nourrir : on choisit QUEL exemplaire du maillon mangé part à la fusion (un bouton par niveau libre distinct dans la fiche). Il donne 1 niveau + la moitié arrondie au-dessus de ses propres niveaux.
- Évoluer : les 3 meilleurs exemplaires LIBRES consommés, le maillon suivant démarre au NIVEAU MOYEN (arrondi vers le bas) des exemplaires utilisés. Fini le +1 gratuit : booster une Commune puis l'évoluer ne rapporte plus rien.
- Migration des sauvegardes : l'ancien `levels` partagé (v1) devient le niveau de chaque exemplaire. La version de sauvegarde passe à 2.

### Fusions et équipe

- `usedInTeam` compte sur les TROIS équipes : un exemplaire placé dans l'équipe 2 n'est plus compté comme libre (bug des fusions qui affichaient 3 exemplaires dont un placé).
- Dans l'écran Équipe, une carte dont tous les exemplaires sont placés disparaît des cartes disponibles ; s'il reste des exemplaires libres, un badge « en équipe xN » signale les placés.
- La fiche affiche « possédée xN (M en équipe) », les boutons Nourrir indiquent le niveau de l'exemplaire mangé, et le bouton Évoluer annonce le niveau moyen de départ.

### Combat et interface

- Fin de partie en POP-UP : défaite, donjon terminé et égalité affichent une modale centrée avec le bouton « Retour au donjon » (il était relégué en bas d'écran). Les victoires intermédiaires enchaînent toujours automatiquement.
- Ordre des stats sur la carte : le bouclier s'affiche AVANT les PV (on perd le bouclier d'abord).
- En combat, les cartes masquent classe et rôle : l'art respire, le nom et les stats se replient en bas.
- Les cartes de l'équipe et des grilles posent l'art en fond complet, comme en combat.

### Boutique et boosters

- Le paquet est recentré et la zone de révélation vit hors du cadre du paquet : les 5 cartes prennent de la place (grille adaptative, 2 colonnes sur mobile) au lieu de s'aligner en miniature.
- La barre de navigation répartit les 5 liens sur la largeur : plus de bouton Boutique à moitié hors écran.

### Synergies et donjon

- Les descriptions distinguent « +X % ATQ de l'équipe » (la stat attaque des cartes) de « +X % dégâts finaux » (appliqués après, multiplient tout, sorts compris), avec un paragraphe d'explication dans l'aide des synergies : les deux se cumulent en se multipliant.
- Courbe du donjon raidie : +1,5 niveau par étage, bonus de rareté (+1 R, +2 SR, +3 UR), boss 2 niveaux au-dessus de leur étage. Les cartes ennemies affichent leur VRAI niveau.

### Qualité

- 51 tests unitaires verts (niveaux par exemplaire, migration v1 vers v2, fusions par exemplaire, moyenne d'évolution, courbe du donjon).
- Le harnas de fumée vérifie en plus : exemplaires en équipe retirés des disponibles, bouton Nourrir avec niveau choisi, pop-up de défaite avec bouton retour dedans.
## 22. Évolutions v0.16

Retours terrain du 6 novembre : vitesse trop lente, paquet de booster encore buggé (bande noire verticale, inclinaison, cartes minuscules qui gonflent), cartes de l'écran Équipe trop petites et image coupée dans la fiche, demande de nouvelles familles et d'oppositions de type, et inspiration du skill game-ai (GitHub) pour les combats.

### Vitesses

- Quatrième vitesse « très rapide » (90 ms par temps de base) : le mode rapide existant restait trop lent sur les combats longs. Les gros moments plein écran (attaque spéciale) sautent aussi en très rapide ; le hit-stop saute dès la vitesse rapide.

### Oppositions élémentaires

- Le Feu s'oppose à l'Eau, la Lumière à l'Ombre ; la Terre est NEUTRE (ni bonus, ni faiblesse).
- L'opposition est symétrique : celui qui FRAPPE son opposé gagne +25 % de dégâts, quel que soit son camp. Se faire frapper par son opposé encaisse donc +25 % ; il n'y a pas de coup réduit.
- Le bonus s'applique à chaque coup, sorts compris, cible par cible (y compris en zone Mage palier 2).
- Écran : les coups portent un marqueur ▲ (votre coup domine l'ennemi) ou ▼ (le coup ennemi domine votre carte). La fiche d'une carte affiche son opposition ; l'aide des synergies explique le système et rappelle qu'il joue pour les ennemis aussi.

### IA de ciblage (premier pas game-ai)

- Inspiré du skill game-ai (couche « décisions ») : l'ennemi ne frappe plus la première cible venue. Il évalue chaque cible vivante : achever une mourable (un coup qui la met à zéro) prime sur tout ; sinon il préfère la cible qu'il DOMINE élémentairement (synergie avec les oppositions) ; à défaut la plus blessée.
- Évaluation pure, sans hasard : le combat reste déterministe pour une même graine. La couche décision est séparée du moteur d'exécution, prête à s'étoffer (choix de sorts, réactivité).

### Catalogue : 40 cartes, 7 familles complètes

- Sommets L forgés (jamais en booster ni au donjon : 3 UR évolutés) : Kenji, Sabre Céleste (Lame, Feu) ; Kira, Nuit Sans Fin (Ombre) ; Argus, Forteresse Vivante (Bouclier, Terre, support).
- Famille de la Braise (mages de Feu), complète C à L : Allumeur de Braises, Mage de la Fournaise, Invocateur de Fournaise, Solen Archimage de la Braise (UR), Solen Roi des Braises (L).
- Famille du Bosquet (assassins de Terre), complète C à L : Traqueur, Chasseur, Prédateur Sylvestre, Maïa Lame du Bosquet (UR), Maïa Déesse du Bosquet (L).
- Chaque famille garde ses 5 sorts (coûts 2/5/9/14/20) et ses 5 paliers de mana. Les nouvelles cartes entrent dans les pools du donjon (jamais leurs L) et dans les boosters ; la collection affiche les 7 familles.

### Fixes d'interface

- Booster : les moitiés du paquet posent l'art en BACKGROUND image (100 % de large, cadrage haut/bas) : plus de bande noire verticale ; le flottement s'anime en translation seule (plus de rotation lue comme un paquet de travers).
- Révélation : la zone est pleine largeur dès le départ et la grille est un flex centré à cellules de taille fixe : les cartes prennent leur place dès le début, plus de gonflement au fil des flips, la 5e carte seule reste centrée.
- Écran Équipe : cartes plus grandes (grille à colonnes larges, slots élargis) : art et stats se lisent sans ouvrir la fiche.
- Fiche : l'illustration couvre toute la carte (les arts font exactement 5:7) : plus d'image coupée dans le portrait.
- Boutique : rappel que la L se forge (évolution de 3 UR), plus de « prochainement » mensonger.

### Qualité

- 82 tests unitaires verts : oppositions (multiplicateur, marqueurs, application en zone et riposte), IA de ciblage (kill-secure, domination, plus blessée), 7 familles complètes (chaîne de raretés, sorts, mana), pools du donjon sans L, courbe de niveau, boosters, store v2 et migration v1.
- Le harnas de fumée rejoue tout le parcours (migration v1, fiche, fusion par exemplaire, évolution, achat et déchirure du booster, révélation, donjon, combat en très rapide, pop-up de défaite, collection des 7 familles) : 40 vérifications.
## 23. Évolutions v0.17 (persistance blindée, UC, boosters en lot)

### Bug des « cartes qui disparaissent »

- Cause racine : l'écriture de sauvegarde avalait silencieusement toutes les erreurs (localStorage bloqué dans la webview), et la lecture rejetait TOUTE la sauvegarde dès qu'un champ était invalide (ex. étage hors bornes) : retour à zéro, collection perdue.
- La lecture RÉPARE au lieu de rejeter : étage et équipe active bornés (clamp), graine tolérante, collection recopiée champ par champ, points et record déduits si absents.
- Copie de sécurité : chaque écriture réussie archive l'ancienne sauvegarde dans une clé `.bak` ; si la clé principale est illisible, on retombe sur la copie.
- Un échec d'écriture n'est plus silencieux : badge de points en mode avertissement (⚠️) + toast explicatif une fois par session. La session ne « disparaît plus en silence » au rechargement.

### Rareté UC (UnCommon)

- Nouveau rang entre C et R : C < UC < R < SR < UR < L. Les lignées de famille passent à 6 maillons (C → UC → R → SR → UR → L), avec un 6e sort intermédiaire (coût 3) et un 6e palier de mana : [8/2, 11/3, 14/3, 22/5, 30/6, 40/8].
- 7 nouvelles cartes UC (une par famille) : Adepte des Rivières (a29), Spadassin Vigilant (a30), Guetteur Crépusculaire (a31), Servante de l'Aube (s13, soin 22), Garde du Rempart (s14, bouclier 20), Veilleur de Braise (a32), Pisteur du Bosquet (a33). Le catalogue passe à 47 cartes.
- Boosters par SLOTS (plus une liste pondérée plate) : base = 4 slots C/UC (exactement 2-3 C et 1-2 UC, clamp dans les deux sens) + 1 slot premium (R 93 % / SR 6 % / UR 1 %) ; premium = 2 slots C/UC (30 % C), 1 slot UC/R (30 % UC), 2 slots premium (R 70 % / SR 22 % / UR 8 %) : jusqu'à TROIS Rare+.
- La table de récompenses de donjon s'étend à l'UC (C 38 % / UC 22 % / R 26 % / SR 12 % / UR 2 %) ; les vagues ennemies gèrent l'UC automatiquement via le rang (pas de L ennemie, quota non-C respecté).

### Boosters en lot

- Chaque palier de la boutique s'ouvre à l'unité ou en lot ×5 / ×10 (boutons activés selon le solde).
- Le lot se paie d'un coup, tire tous les paquets d'un coup et affiche une grande grille face cachée ; « Tout dévoiler » retourne les cartes en cascade, puis un bilan PAR RARETÉ (chips) + compteur nouveautés/doublons. Pas de rituel de déchirure pour le lot (réservé au paquet unique).

### Divers retours

- Filtre de niveaux dans l'onglet Équipe : Tous niveaux / Nv ≥ 2 / Nv ≥ 3 / Nv ≥ 5 (niveau le plus haut de la carte).
- Le lien « ← Retour à la boutique » des écrans d'ouverture devient un vrai bouton stylé (.backlink).
- Mode très rapide encore accéléré : 45 ms par étape (SPEEDS = [1000, 600, 260, 45]).
- Héritage des sorts vérifié et prouvé : une carte évoluée possède TOUS les sorts de ses formes précédentes (spells = slice(0, t+1)) et peut les lancer en combat ; couvert par les tests du catalogue (héritage) ET du moteur (la L a14 lance des sorts de sa lignée au runtime).

### Qualité

- 43 tests unitaires verts (catalogue 47 cartes et lignées 6 maillons, boosters par slots avec bornes C/UC, UC dans les vagues et récompenses, store v2 tolérant + copie .bak, moteur).
- Le harnas de fumée rejoue tout le parcours sur le dist final (mini-DOM maison) : garde-fous structurels, boutique avec lots désactivés selon le solde, achat ×5 (25 cartes, bilan par rareté, 700 points), paquet unique avec déchirure pointer (5 cartes, 640 points), filtre de niveaux, collection des 7 familles, donjon et combat en très rapide jusqu'à la bannière de fin : 52 vérifications.
## 24. Évolutions v0.18 (éclats, bestiaires, donjons typés)

### Éclats (compagnons solos transformables)

- La notion de famille reste la lignée d'évolution ; les compagnons isolés (cartes sans famille) deviennent des ÉCLATS : des cartes jouables qui peuvent se FONDRE dans une famille.
- Fondre consomme l'exemplaire libre le plus faible et donne un bonus PERMANENT de collection : +3 % d'ATQ et de PV par éclat, pour toutes les cartes de la famille, côté équipe uniquement (max 3 éclats par famille, +9 %).
- La fiche d'un éclat possédé propose un bouton par famille (désactivé si famille saturée ou aucun exemplaire libre) ; la fiche d'une carte de famille affiche ses éclats fondus ; les entêtes de la Collection aussi. La section « Compagnons isolés » devient « Éclats » avec le mode d'emploi.
- Le dilemme est voulu : un éclat reste une vraie carte (équipe, sorts, sacrifice), le fondre la retire du pool pour doper une lignée.

### Fiches de monstres

- Les ennemis ne sont plus recrutés parmi les cartes joueur : chaque donjon a son BESTIAIRE de fiches au format carte (rareté, classe, élément, rôle, stats, sort simple et mana) — le moteur de combat ne change pas, un monstre EST une carte.
- Bestiaire des Marées (mono-Eau) : 10 monstres C→UR, attaque et support confondus. Bestiaire de la Forge (Feu/Ombre) : 10 monstres bi-type. Chaque pool couvre la courbe de rareté (attaque C→UR, support C→SR) pour que la montée d'étage trouve toujours un candidat.

### Donjons typés

- Chaque donjon déclare : id, nom, description, nombre d'étages, éléments (mono au début, bi-type ensuite), icône/art, noms de boss par palier et condition de déblocage.
- L'Antre des Marées (Eau, 20 étages) ; La Forge Cendrée (Feu/Ombre, 20 étages), débloquée après le premier boss des Marées (record ≥ 5) — la carte verrouillée affiche la condition.
- NIVEAU CONSEILLÉ affiché par donjon : force moyenne d'équipe à viser pour finir, dérivée de la vraie courbe d'étage du moteur (boss final rareté R, +2 niveaux de bonus), à côté du niveau moyen réel de l'équipe active.
- La progression devient PAR DONJON : étage courant, record et jauge de pitié sont stockés par donjon (`stage`, `record`, `pity` restent des raccourcis vers le donjon ACTIF). Les sauvegardes plates d'avant v0.18 migrent vers l'Antre des Marées.

### Qualité

- 56 tests verts : bestiaires par donjon (jamais de L, quota non-Commune, types déclarés respectés, courbe de rareté couverte, noms de boss), courbe de niveau exportée identique à la formule des vagues, éclats (fusion, saturation, exemplaires libres, persistance), progression par donjon (migration plate → Marées, clamps par donjon).
- Smoke 64 vérifications : parcours complet du dist avec la Forge débloquée (record 5 aux Marées), combat mené dans la Forge, fusion d'un éclat depuis la collection (appui long), éclats fondus affichés dans l'entête de famille, checkpoint par donjon.
## 25. Évolutions v0.19 (Forge, branches d'éclat, bug « cartes disparues »)

### Bug « mes cartes ont disparu » (retour capture, lot ×5 premium)

- Diagnostic : ce n'était PAS une perte de données. Deux causes lisibles comme une disparition : (a) les FILTRES de l'onglet Équipe persistent entre les visites (Support + Nv ≥ 2 actifs), (b) les cartes entièrement placées en équipe étaient MASQUÉES de la grille ; les 25 cartes d'un lot sont toutes Nv 1 → filtrées.
- Correctifs : une carte entièrement placée reste affichée GRISÉE (classe `dimmed`) avec son badge « en équipe ×N » ; le titre compte « X possédées, Y affichées après filtres » ; une grille vide affiche TOUJOURS pourquoi + bouton « Réinitialiser les filtres ».
- Bug réel corrigé au passage : les tirages en lot incrémentaient la collection SANS étendre les exemplaires (`copies`) ; tout passe par `grantCards` (niveau 1 par nouvel exemplaire), collection et exemplaires restent synchronisés.

### Branches d'éclat (redesign des éclats incompris)

- Le bonus +3 %/éclat seul ne se comprend pas (retour terrain : « je n'ai pas compris le système d'éclat ») : fondre 3 éclats dans une famille DÉBLOQUE SA BRANCHE — une carte unique et jouable (SR, 4 premiers sorts de la lignée, mana 22/5), JAMAIS en booster.
- 7 branches (b1..b7, une par famille : Yuki Brise-Lame, Onyx Fil de Nuit, Naïa Sourcéleine, Aïna Voix du Matin, Roc Épaule du Monde, et les branches braise/bosquet) + 6 NOUVEAUX éclats (a34..a39, C/UC, solos avec sort) sortent en booster = matière première.
- `fuseShard` renvoie `{ok, shards, unlocked, branchId}` ; la branche rejoint la chaîne de la Collection une fois débloquée (teaser ✦ avec jauge sinon) ; le bonus +3 %/éclat est conservé (récompense tangible + bonus).

### La Forge (page ⚒️, gestion automatique de l'équipe)

- Page dédiée (nav entre Collection et Donjons) qui liste TOUTES les transformations possibles : évolutions prêtes (ou presque), nourrissages par maillon, sacrifices de doublons, branches d'éclats par famille — chaque action en UN clic, depuis la page.
- GESTION AUTOMATIQUE DE L'ÉQUIPE : si un exemplaire placé doit partir à la fusion, la Forge le retire (`autoRemoveFromTeams`) et REPLACE la carte résultante dans sa ligne si la place est libre (toast de confirmation) — plus besoin de retirer, fusionner, remettre à la main.

### Ouverture en lot animée

- Les lots ×5/×10 ont droit à leur RITUEL : pile de paquets empilés (médaillon ×N) + le même bouton de déchirure glissant, puis révélation en cascade et bilan par rareté.

### Qualité

- 67 tests verts (catalogue 60 cartes, branches jamais en booster, fuseShard débloque la branche) + smoke 83 vérifications (mini-DOM : boot, boutique, déchirure, lot ×5, filtres + reset + dimmed, Forge avec retrait auto d'équipe et branche b3 débloquée, donjons, combat très rapide).
- Build : les commentaires sont retirés du dist (les sources restent documentées) pour tenir sous 1 Mo : 942 Ko, 26 marqueurs, 12 data URI.## 27. Évolutions v0.20 (niveau unique, cercle des éléments, éclats évolutifs, Forge stable)

### Niveau unique par carte (fin des niveaux par exemplaire)

- Retour terrain : le niveau par exemplaire rendait l'affichage donjon incohérent et l'échange d'un exemplaire pénible. Une carte = UN niveau (`levels {id: int}`) + une jauge d'XP fractionnaire (`xp {id: fraction}`) ; 1 XP = +1 niveau.
- Migrations de sauvegarde : v2 → v3 (level = max des niveaux d'exemplaires), v1 → v3 (1 + niveaux extra). SAVE_VERSION 3.
- `levelOf(id)`, `xpOf(id)`, `addXp(id, gain)` ; le combat, l'équipe, la forge et les fiches lisent tous le même niveau → ce qui est affiché en donjon est ce qui se bat.

### Nourrir : formule linéaire 2×écart (choix acté)

- Sacrificer un doublon : +1 niveau. Nourrir `cible ← source` : gain = 1 si même rareté, 1/(2×écart) si la source est MOINS rare (une commune sur une légendaire = +50 % d'un niveau), 2×(écart) si PLUS rare. Une UC exige ainsi 4 communes par niveau (2×écart de 2).
- `feedGain(target, source)` + `gainText(gain)` (« +50 % d'un niveau », « +2 niveaux ») ; les boutons de la Forge affichent le gain exact.

### Cercle des éléments (fin des oppositions à sens unique)

- Feu > Terre > Eau > Feu (+25 %), Lumière ↔ Ombre mutuels (+25 % chacun), Terre neutre vs Lumière/Ombre. `BEATS` + `BEATEN_BY` remplacent `ELEMENT_OPP` ; les fiches affichent « X domine Y et est dominé par Z », les donjons affichent un conseil (« les créatures X sont dominées par Y »).

### Éclats évolutifs (fin de partie)

- Les compagnons d'éclat évoluent (choix acté) : 3 exemplaires → compagnon supérieur, niveau conservé, JAMAIS en booster. 10 compagnons supérieurs a40-a49 (`evolved: true`) via `SOLO_STEPS` (a34→a40→a41, etc.). `forgeOnly(c)` exclut branches ET évolués des boosters, pity et récompenses de fin de donjon.

### Collection « déjà vues » + Forge/fiches stables

- `store.seen` : une carte déjà possédée puis perdue reste affichée en grisée (« plus possédée ») dans la Collection au lieu de redevenir un mystère.
- La fiche se rafraîchit EN PLACE après sacrifice/nourrissage/évolution/fusion : scroll préservé, feedback textuel du nouveau niveau, pas de fermeture/rotation de page. La Forge préserve aussi `window.scrollY` après chaque action pour enchaîner les nourrissages.

### Salles strictement croissantes (hors boss)

- `wavePower(wave)` + garde-fou : chaque salle non-boss est strictement plus forte que la précédente salle non-boss (les boss sont exclus de la comparaison), récursion jusqu'à satisfaction.

### Qualité

- 54 tests verts (catalogue 70 cartes, store v3 migrations + feedGain 2×écart, évolutions généralisées, wave strict, exclusions forgeOnly) + smoke 86 vérifications reproductibles (horloge et aléa du dist gelés : parcours complet boot → équipe/filtres → lot ×5 → Forge stables → évolutions familiales et d'éclat → branche b3 → collection vues → donjons → combat → chaînage auto étage 2).
- Build 949 Ko, 26 marqueurs, 12 data URI. check-imports : 26 modules cohérents.

## 28. Évolutions v0.21 (sorts croisés, mécanismes exclusifs des éclats)

**Sorts croisés entre rôles (direction 2, rendement 60 %, calibré par le harnas).** Chaque combattant porte un sort du rôle opposé, lancé automatiquement par le moteur :

- **Souffle Croisé (rôle attaque, coût 5 mana)** : quand un allié vivant passe sous **20 % de ses PV max**, le lanceur lui rend 60 % de son ATQ au lieu d'attaquer ce tour-ci. Seuil calibré par le harnas : à 35 % l'échange attaque→soin coûtait des tours et resserrait la courbe vers le bas (Avancé −2 pts de victoire moyenne) ; à 20 % le sort devient un bouton panique (Débutant +10 pts sur l'étage le plus disputé, courbe globale inchangée à ±1 pt, murs intacts).
- **Frappe Croisée (rôle support, coût 4 mana, base 6)** : si aucun allié n'est blessé et que le support ne peut pas lancer son sort de soin, il frappe l'ennemi le plus faible pour ATQ × 6 × 60 %, adapté aux éléments. Un support soigne toujours en priorité : la frappe n'est qu'un repli.
- Les sorts croisés consomment le mana existant (pas de jauge supplémentaire) ; les fiches affichent la section « Sorts croisés (rôle opposé) » avec coût et rendement.

**Mécanismes exclusifs des éclats évolutifs (a40-a49).** Chaque compagnon d'éclat porte un gimmick qu'aucune famille ne possède :

| Carte | Mécanisme | Effet |
|---|---|---|
| a40 Chasseur des Quais | Marque du Chasseur | sa volée frappe aussi un second ennemi à 50 % des dégâts |
| a41 Maître des Brumes | Voile de Brume | 25 % de chance d'annuler complètement un coup reçu |
| a42 Écuyère des Routes | Litière de Camp | bouclier de 15 % PV max pour toute l'équipe au départ |
| a43 Première Écuyère | Dernière Bénédiction | en tombant, soigne toute l'équipe de 20 % des PV max de chacun |
| a44 Guide des Dunes | Mirage du Désert | renvoie 20 % des dégâts subis à l'attaquant |
| a45 Artiste de Fête | Numéro Étoilé | +2 de régénération de mana |
| a46 Maître Jongleur | Carrousel de Lames | 15 % de chance de toucher tous les ennemis à 40 % |
| a47 Charpentier des Berges | Cale Sèche | bouclier personnel de 25 % PV max au départ |
| a48 Maître Charpentier | Bélier d'Étrave | première attaque du combat +50 % |
| a49 Capitaine du Guet | Ronde Éclairée | +3 % d'ATQ cumulée par tour pour toute l'équipe (plafond +90 %) |

Les gimmicks se lisent dans les événements de combat existants (cast/attack/heal/block) : l'interface n'a pas changé de forme. Les éclats restent hors boosters, pity et récompenses (forgeOnly).

**Calibrage mesuré (harnas, 40 seeds/étage, 2 donjons, 120 points).** Avant/après v0.21 : Débutant 13→14 %, Milieu 27→27 %, Avancé 77→78 % de victoire moyenne — la profondeur tactique s'ajoute sans déplacer les murs ; les boss restent des paliers réservés au profil supérieur. 66 tests (49 + 17 sorts croisés/gimmicks), round-trip des sources byte-identique, dist autonome 957 Ko.
## 29. Évolutions v0.22 (cinq donjons, échelle de difficulté, boosters de monstres)

**Donjons bi-type par éléments (5, chaîne de déblocage).** Terminer un donjon débloque le suivant ; chaque donjon ajoute +2 niveaux aux vagues (palier tier 0 à 4) :

| Donjon | Éléments | Éclats du boss final | Boss 5 / Boss 10 |
|---|---|---|---|
| L'Antre des Marées | Eau / Terre | a34 a38 a35 a36 | Hydre des Marées / Souverain des Marées |
| La Forge Cendrée | Feu / Ombre | repli aléatoire (chance réduite) | Maître des Fours / Cœur de la Forge |
| Le Bosquet Vermeil | Terre / Lumière | a35 a36 a37 a39 | Dryade Cornue / Patriarche Sylvain |
| La Crypte Noyée | Ombre / Eau | a34 a38 | Goule des Caveaux / Roi Noyé |
| Le Zénith Ardent | Lumière / Feu | a37 a39 | Voulige du Zénith / Astre Vengeur |

La Forge ne file pas encore d'éclats dédiés (les éclats Feu/Ombre viendront avec le contenu massif) : son boss final lâche un éclat aléatoire à chance réduite.

**Échelle de 5 difficultés par donjon.** La difficulté N+1 se débloque quand le record de la N atteint l'étage 10 ; chaque passage devient un farm vertical répétable (les éclats et monstres s'améliorent avec la difficulté) :

| Difficulté | Rareté mini | Boss 5 | Boss 10 | Points | Drop monstre | Drop éclat |
|---|---|---|---|---|---|---|
| Facile | C | R | SR | ×1 | 25 % | 30 % |
| Normal | UC | SR | UR | ×1,5 | 40 % | 45 % |
| Difficile | R | UR | L | ×2 | 55 % | 60 % |
| Très difficile | SR | L | M | ×3 | 70 % | 75 % |
| Enfer | SR | boss à tous les étages | M | ×5 | 90 % | 100 % |

La difficulté agit par plafond de rareté des vagues (pas par des falaises de puissance) : pente adoucie 1,25 (au lieu de 1,5), boss ×2,3 PV / ×1,28 ATQ (au lieu de ×2,6/×1,35), plafond de palier par rareté mini. L'Enfer met un boss à chaque étage et un final M.

**Monstres collectionnables et jouables.** 64 monstres répartis par donjon (préfixes e/f/g/k/z), chaque bestiaire couvre C à M en attaque et C à SR en support, avec sorts injectés (coût 3, multiplicateur 1,5). Le catalogue passe à 134 cartes.

- **Packs de monstres** : par donjon débloqué, 80 ⚡ pour 3 cartes (2 slots C/UC/R + 1 slot SR 60 % / UR 30 % / L 10 %). Le M n'est JAMAIS en pack : il ne tombe qu'au boss en Très difficile/Enfer.
- **Capture au boss** : aux étages 5 et 10, chance selon la difficulté (25 à 90 %) de capturer le monstre vaincu (fenêtre de rareté boss5-boss10).
- **Éclats au boss final** : pool dédié au donjon (voir table), chance selon la difficulté (30 à 100 %) : chaque donjon devient la source ciblée pour débloquer les compagnons de sa famille d'éléments.
- Les monstres se montent uniquement par sacrifice (pas de famille, pas d'éclat) ; ils sont exclus des packs de cartes, du pity et des récompenses d'étage.

**Gate premium (choix acté).** Le booster premium reste verrouillé (« Terminez un donjon ») jusqu'à un premier donjon terminé : le pack de base (60 ⚡) et la fusion restent toujours disponibles. La boutique gagne une section packs de monstres par donjon débloqué ; l'écran Donjons gagne le sélecteur de 5 difficultés avec record affiché et recommandation de niveau.

**Calibrage mesuré (harnas, 40 seeds/étage, Marées).** Avant v0.22 la courbe était en falaises (Milieu bloqué étage 8, boss 0 % ; Avancé boss 20 à 0 %). Après calibrage, la Facile cible les profils Débutant/Milieu (Débutant mur étage 4, Milieu boss 5 à 18 % retryable), le Normal cible Milieu/Avancé (Avancé boss 10 à 0 %, Légende finit), le Difficile cible Avancé (boss 10 à 0 %) et Légende, le TD/Enfer réservent le boss 10 aux collections complètes (Légende 8 %). 92 tests verts, round-trip byte-identique, dist autonome 975 Ko.
### Correctif v0.22.1 (page blanche au chargement)

Le dist v0.22 publié plantait au démarrage : dans le bundle (script classique concaténé), `catalog.js` appelle `allMonsters()` au niveau supérieur alors que `monsters.js` était concaténé APRÈS lui — légal en ES modules (les imports règlent l'ordre d'évaluation), fatal en script unique (TDZ : « Cannot access 'MONSTERS' before initialization »). Symptômes : en-tête et navigation visibles (HTML statique), contenu vide, et le clic sur un onglet naviguait réellement vers `#...` (handlers jamais attachés). Correctif : ordre canonique des modules dans le build, `monsters` avant `catalog` ; contenu des modules strictement inchangé (dist de même taille, seul l'ordre du bloc bouge).

**Porte de garde nouvelle : harnas de fumée du dist.** Le dist publié (pas les sources) est démarré dans un mini-DOM : boot, navigation des 6 onglets, hash, boutique (premium verrouillé, packs de monstres du donjon débloqué), écran donjons (25 chips de difficulté). 44 vérifications, horloge et aléa gelés. Ce harnas échoue sur le dist cassé (17/44, message TDZ exact) et passe sur le corrigé : il est désormais obligatoire avant toute publication. Tests unitaires reconstruits : 34 verts (catalogue 134 cartes/64 monstres, store v4 migrations v1/v3/v4, déblocages difficultés/donjons/premium, packs de monstres sans M, fenêtres de capture, éclats ciblés, bosses et plafonds par difficulté).
## 30. Évolutions v0.23 (centrage des cartes, sélecteur d'équipes)

**Centrage des cartes (retour terrain PC + téléphone).** Deux asymétries visuelles corrigées : l'écran Équipe alignait ses lignes de slots à gauche (`flex-start`) et le combat décalait volontairement la ligne de support de 30 px (marges asymétriques 30/-30, 18/-18 en mobile). Désormais toutes les rangées de cartes (équipe, slots vides, combat, ennemis) sont centrées ; le décalage décoratif de la ligne de support est supprimé.

**Sélecteur d'équipes restauré.** L'écran Équipe affichait « Équipe 1/3 » sans moyen de changer d'équipe. Deux flèches ◀ ▶ encadrent le comptateur : elles font tourner `activeTeam` (0 → 1 → 2 → 0), persistent via la sauvegarde et re-rendent l'écran (lignes, synergies et badges « en équipe » suivent l'équipe active). Le titre de combat affiche l'équipe engagée.

Vérifications : 39 tests unitaires verts, harnas de fumée étendu à 49 vérifications (flèches présentes, 1/3 → 2/3 → retour, bouclage sur 3 clics), round-trip byte-identique, dist autonome 976 Ko.

## 31. Évolutions v0.24 (suppression des postes attaque/support : 5 emplacements libres)

**Slots d'équipe unifiés (T2).** Les deux lignes fixes « Ligne d'attaque (3) » et « Ligne de support (2) » disparaissent : chaque équipe offre **5 emplacements libres**, remplissables avec n'importe quelle carte dans n'importe quel ordre (réordonnancement par glisser-déposer conservé, maximum 2 exemplaires d'une même carte inchangé). L'écran Équipe affiche une zone unique « Équipe (n/5) », le compteur suit chaque ajout/retrait.

**Sous le capot.** Sauvegarde en version 5 : `teams[i] = { slots: [] }` (3 équipes). Migration silencieuse des sauvegardes v1 à v4 : `slots = [...attaque, ...support]`, puis nettoyage (cartes non possédées retirées, doublons plafonnés à 2, 5 emplacements max). Le moteur de combat ne change pas : au lancement du combat, les rôles sont dérivés des slots (`role !== 'support'` en attaque, les autres en support), l'affichage et les ciblages restent identiques. Forge (retrait automatique des exemplaires placés), donjons, accueil, fiche carte et toasts adaptés aux slots.

**CSS.** Les 5 emplacements se partagent la largeur : `width: min(128px, calc((100% - 32px)/5))` en desktop, `(100% - 24px)/5` en mobile, plus jamais de débordement ni de rangée collée à gauche.

Vérifications : 32 tests unitaires verts (dont migrations v4→v5 et sanitize slots), harnas de fumée 42 vérifications (zone unique, plus de lignes, ajout puis retrait), round-trip byte-identique, dist autonome 975 Ko.

## 32. Correctif v0.24.1 (canvas ne s'affichait plus : art embarqué retiré, dist 206 Ko)

**Diagnostic.** Le canvas HTML ne s'affichait plus depuis deux ou trois itérations : le dist avait gonflé jusqu'à ~998 Ko, dont **788 Ko d'images JPEG en base64** embarquées (10 cartes à illustration, l'art du donjon Marées, l'art du pack booster de 96 Ko). Le canvas prototype a dépassé le seuil d'affichage du panneau.

**Correctif.** L'art embarqué est retiré du dist : la carte `ART` de card.js devient vide (`hasArt()` retourne faux partout → les cartes retombent sur le rendu glyphe d'origine, zéro changement fonctionnel), l'art des Marées retombe sur l'icône + dégradé comme les 4 autres donjons, et l'art du pack est remplacé par un dégradé PNG teal→violet de 2,2 Ko généré par le build. Les 12 images d'origine sont SAUVÉGARDÉES (publiées en artifacts) pour être réintégrées optimisées par le pipeline ConfiUI (cible : ~200×280 px, qualité ~60, soit ~10 Ko la carte).

**Garde-fous ajoutés.** Outil d'allègement vérifié par squelette canonique (le code, hors blancs et commentaires, doit être identique avant/après ; chaînes et templates verbatim) + `node --check` sur le bundle et chacun des 26 modules. **Règle nouvelle : le dist embarque des images seulement optimisées, budget total d'art ~100-150 Ko.** Résultat : dist 206 Ko, canvas 207 Ko, ré-extraction byte-identique.

### Design en attente : familles de monstres (modèle par RACE, direction actée, non implémentée)

Document de référence v3 VALIDÉ (13 familles monstres dont les Sirènes + 7 familles personnages + 3 familles spéciales des défis quotidiens, arbres par famille, éclats par élément, méta du choix de voie, briefs visuels pour la génération d'images) : voir le canvas « Fondations Cards - Familles et races (v3, document de référence) ».

Les 64 monstres sont aujourd'hui des « compagnons isolés » ; la direction souhaitée les organise en **familles par RACE / type de créature**, pas par donjon : le « gobelin des marais » et le « gobelin des montagnes » forment UNE famille gobelin. Chaque donjon héberge alors **2-3 familles différentes**, qui évoluent chacune vers leur propre sommet.

- **Structure interne d'une famille (v3 actée)** : échelle complète C, UC, R, SR, **UR**, L, M ; tronc commun C→UC→R→SR puis **2 voies**, chaque voie mène à son UR puis à une **UNIQUE NOMMÉE** en L ; le M (au moins un par donjon) fusionne les deux voies. La voie peut **changer l'élément** (Clairières→Lumière, Sous-Bois→Ombre, Deuil→Ombre). Les branches de forge des familles compagnons (Yuki, Onyx, Naïa, Aïna, Roc, Ember, Sylve) deviennent les graines des deuxièmes voies, mêmes arbres pour monstres et personnages.
- **Méta du choix de voie (v3 ACTÉE, fusion à la Forge)** : le choix se prépare au palier SR (4e sort) et se paie au passage SR→UR : **SR + 2 éclats polis → la SR de la voie choisie** (nouvelle carte, la récompense se voit) ; **la voie ouverte l'est définitivement**, les évolutions suivantes (UR puis L) sont les évolutions NORMALES à 3 exemplaires, sans nouvel éclat ; ouvrir la 2e voie = refaire la fusion sur une autre SR ; M = fusion des 2 L + 10 éclats éternels OU drop au boss final de l'Enfer.
- **Sorts par choix d'évolution (v3 actée, remplace la version à 3 sorts)** : 4 sorts classiques appris aux paliers C, UC, R, SR ; les sorts 5 et 6 viennent de la VOIE choisie (modèle Valkyrie Crusade), la carte aboutit à 6 sorts.
- **Éclats par ÉLÉMENT (v3 actée)** : 5 couleurs (Eau, Terre, Feu, Lumière, Ombre), préciosité continue (brut, poli, gravé, radiant, éternel, un cran par difficulté), loot de boss avec choix entre les 2 éléments du donjon. Coûts actés 2/4/6/10, uniquement aux OUVERTURES (voie, 2e voie, formes spéciales style HUC/HSR, fusion du M), jamais aux évolutions courantes. À 1-2 éclats par boss, ils sont réservés aux évolutions : **le bonus passif +2 %/éclat est ABANDONNÉ** et **les boosters achetables en éclats sont ABANDONNÉS** (les boosters restent en or ; le concept d'éditions de boosters, un type par donjon/famille/édition à la façon des jeux de cartes physiques, est noté pour le futur avec les boosters famille ciblée qui pourront revenir si une monnaie le justifie).
- **Mix linéaire/ramifié (CHOIX ACTÉ)** : les premières familles restent à lignée droite pour ne pas partir dans tous les sens ; les familles profondes se ramifient, avec tronc commun puis branches.
- **Le M par fusion OU drop (CHOIX ACTÉ)** : la Mythique d'une famille se forge en fusionnant plusieurs légendaires SPÉCIFIQUES de la famille, ET peut aussi tomber au boss final de l'Enfer.
- **Branches non exclusives (CHOIX ACTÉ)** : choisir une branche ne verrouille pas les autres.
- **Répartition du bestiaire (CHOIX ACTÉ)** : reclasser les 64 monstres existants par race, puis en ajouter pour compléter les familles.
- **Nombre de familles par donjon (CHOIX ACTÉ)** : variable, 2-3 selon le donjon (plus de familles dans les donjons profonds).
- **Le sort spécial (CHOIX ACTÉ, précisé v2)** : il S'AJOUTE aux sorts communs, la carte aboutit à 6 sorts (4 communs + 2 de voie).
- **Pas de rétrogradation ni promotion (ACTÉ)** : on crée les nouvelles voies à côté, les voies ne s'excluent pas, le but reste la collection complète.
- **Familles spéciales des défis quotidiens (v3, détails actés)** : 3 familles obtenables uniquement via le booster du défi quotidien (non achetable, 5 cartes, taux relevé) ; 1 seule carte par famille divine en équipe (jusqu'à 3 si les 3 familles), élément **Divin** hors oppositions (ni bonus ni malus), **bonus spécial d'équipe dès 2 cartes Divines en jeu** (proposition +10 % dégâts et soins, à calibrer au harnas), évolution aux éclats radiants/éternels. Saveurs actées : Arbitres du Seuil (stun de zone, fait passer les tours, ralentit les ennemis : l'équipe attaque deux fois parce que l'ennemi est lent, retire l'initiative adverse) ; Chœur Miroir (copie ou renvoie les sorts adverses) ; Tisseuses du Pont (chaque tour elle tisse un nouveau lien entre deux alliés, durée 2 tours, les liens se chaînent ; variantes du lien : partage des bonus, transfert des dégâts vers le plus résistant, ou répartition des dégâts entre les deux liés, l'anti-one-shot).
- **Multi-donjons gobelins (v3 ACTÉ, sans M gobelin)** : UNE seule famille gobelin ; le foyer reste aux Marées (famille complète avec voies) ; les autres donjons reçoivent des **variantes régionales en ligne directe rapide** (2-3 cartes sans voies, débloquées par l'éclat de l'élément local), premier test sur la Forge avec le Gobelin des Fumées 🔁 (ex-Gamin des Fumées) ; le M gobelin est abandonné (il viendrait d'une vraie famille gobeline dédiée, plus tard).
- **Sirènes des Récifs (v3 ACTÉE)** : 13e famille de monstres, entièrement à créer (8 cartes, voies Chant/contrôle et Récifs/dégâts, L Méliane et Thalassa, pas de M) ; leur chant est la cause des naufrages, lien de lore avec Ahab, Lord des Naufragés (Crypte).
- **Clergé du Plein Jour (v3)** : Apolline, Prophétesse du Jour, passe en **M** de la famille (fusion Célestin + Justine) ; nouvelle L Justine, Justicière du Jour ; le Zénith porte 2 M (Astre Capiteux + Apolline).
- **Bitypes (AVIS DONNÉ, à trancher)** : swap mono-élément par voie adopté ; bitypes permanents reportés en v2 contenu (touchent les oppositions), à mesurer au harnas.
- **Nouveautés moteur (liste v3 IMPLÉMENTÉES en v0.25, voir section 33)** : invocation d'alliés, résurrection, renvoi de dégâts, stun/entrave et passage de tours, dégâts sur la durée, initiative et ralentissement/retrait d'initiative (l'attaque double vient de l'ennemi ralenti), copie et renvoi de sort, liens entre alliés (partage de bonus, transfert et répartition de dégâts), boost d'équipe.
- **Retours UI notés pour un futur chantier** : brillance selon rareté à appliquer à toutes les bordures, bordures plus stylisées, corriger la double bordure de la zone de texte et son fond flou. Maquette publiée dans le canvas « Fondations Cards - Démo images (cartes, fonds, sorts) » : 3 formalismes de cartes (voile dégradé recommandé, panneau opaque pour L/M, voile uniforme rejeté), palette de bordures par rareté avec brillance animée dès R, fonds de donjons avec voile dégradé, format des mini-vidéos de sorts signature (0,8 s, jamais en base64 dans le dist, chargées à la demande).

### File d'attente : génération d'images et vidéos (ConfiUI + Vibe local)

Après le tour « contenu massif », brancher la génération d'images (arts de cartes, donjons) et de vidéos (intros de boss, évolutions) via ConfiUI sur le PC de l'utilisateur, piloté par Vibe local en MCP, avec relecture automatique des générations par Vibe pour vérifier la conformité au style. À définir alors : modèle, style visuel, et placement (où des vidéos, où des images). À noter : le dist doit rester autonome et léger, les assets seront intégrés en data URI ou servis à côté.
## 33. Chantier moteur v0.25 (statuts génériques et nouveaux effets de combat)

**Principe directeur.** Aucune carte existante n'utilise les nouveaux effets : ils sont tous déclenchés par les statuts (`unit.status`) que seules les nouvelles cartes posent. La validation du chantier : **la courbe de difficulté mesurée au harnas de simulation est INCHANGÉE avant/après** (2400 combats réels, 5 donjons × 4 difficultés × 10 étages × 3 profils d'équipe × 4 seeds, digest identique).

**Système de statuts.** `unit.status = {}` sur chaque unité, tick générique en début de tour (`tickStatuses`) : dot, minuteurs de résurrection, expiration de copie, dmgRed, reflect, slow, ttl d'invocation, durée des liens. Événements nouveaux ignorés proprement par l'UI actuelle (switch sans défaut), affichage à peaufiner au tour contenu.

**Effets implémentés (tous testés, 10/10)** : **stun** (l'ennemi le plus fort passe son tour), **slow** (l'ennemi ralenti fait frapper l'équipe deux fois), **dot** (dégâts sur la durée au tick, posables par le sort du sortisseur `spell.dot` ou par un support de zone), **reflect** (renvoi d'un pourcentage des dégâts reçus), **warcry** (boost d'attaque d'équipe + réduction de dégâts, le cri de guerre gobelin), **summon** (sbire temporaire avec ttl), **revive** (un support ramène un mort), **phoenix** (tué sous condition « des alliés vivent », l'unité revient après N tours, re-trigger tant que des alliés vivent : oblige à tuer les autres d'abord), **copy** (slot vide qui capture le dernier sort adverse joué, le rejoue gratuitement une fois, puis se vide et peut recapturer ; expiration 2 tours si non utilisé), **link** (deux alliés liés se répartissent les dégâts reçus 50/50, anti-one-shot ; soins et buffs partagés à 50 % au partenaire ; durée 2 tours, renouvelable).

**Méta actée ce tour (compléments v3)** : Divin hors oppositions, **bonus d'équipe dès 2 cartes Divines : +10 % dégâts ET +10 % soins** (à calibrer au harnas avec le contenu) ; **gating des boosters** : booster d'un donjon débloqué quand le donjon précédent est fini (Zénith = finir les Marées), boosters « plus » = finir Normal ou Difficile ; boosters par édition = futur ; boosters communs débloqués progressivement aussi (jamais de cartes d'un donjon non atteint dans les boosters communs de début).

**Retours UI du tour (à intégrer au chantier UI)** : **voile dégradé retenu** par défaut sur les cartes (lisible, met l'art en valeur) ; **clic sur la fiche = art seul sans texte**, et pendant un effet spécial le texte s'efface pour un moment plein écran de l'image ; **plusieurs effets de brillance selon la rareté** (bordure ET brillance différentes par palier) ; **fond de combat** illustré du donjon (image ou vidéo en boucle) au lieu du fond noir, **petite animation du boss** à l'entrée de sa salle. Fiche de conventions images publiée (canvas « Fondations Cards - Fiche de conventions images ») pour lancer la première génération : cartes génériques = images libres, cartes nommées = même personne qui évolue (référence verrouillée d'abord), masters 400×560, JPEG ~60, budget art 100-150 Ko, zéro texte dans l'art, palettes par donjon, tier bas « calme » car le voile s'y pose.## 34. Contenu massif v0.26 : les Marées complètes (15 cartes, effets branchés)

**Principe.** Premier donjon rempli selon le document de référence familles v3. Les nouvelles cartes sont les premières à utiliser les effets moteur v0.25 en jeu réel.

**Équilibrage moteur (3 règles, neutres pour l'existant, vérifiées au harnas : digest v0.25 inchangé avant contenu)** :
1. **Le contrôle ne s'applique que si le support a lancé son sort** : sans cast (mana insuffisant), stun/slow/dot/reflect/warcry/summon/revive/link ne s'appliquent pas. Sinon un support de contrôle agissait chaque tour (stun perpétuel, ingérable). La cadence se règle par le coût du sort (coût 6 ≈ tous les 3 tours, coût 8 ≈ tous les 4 tours).
2. **Les supports ennemis contrôlent aussi l'équipe du joueur** (foes passés) : les sirènes chantent, l'équipe adverse écoute. Les sorts de heal/bouclier des ennemis sont inchangés.
3. **Symétrie du ralentissement** : une équipe dont une unité est ralentie encaisse la double frappe (côté joueur existant, côté ennemi ajouté, dormant pour l'existant). Gimmick « bélier » également actif côté ennemi (première frappe ×1,5, dormant).

**15 nouvelles cartes Marées (e16-e30)** :
- **Gobelins des Écumes** : Grand Chaman des Écumes (UR, sort avec dot), Zikka Chaman des Écumes (L, dot 3 tours), Roi des Écumes (UR, bélier), Griknir Roi des Écumes (L, bélier).
- **Abîmaux** : Rôdeur des Fonds (R), Protecteur des Berges (UR, bouclier), Pontos Aîné des Berges (L, soin de masse).
- **Sirènes des Récifs** : Sirène Nouvelle (C, soin), Chanteuse des Récifs (UC, ralentissement, sort coût 8), Voix du Large (R, étourdissement 1, coût 6), Écumeuse des Récifs (SR, attaque), Sirène Ensorceleuse (UR, stun 1), Méliane Voix du Large (L, stun 2, coût 7), Gardienne des Récifs (UR, attaque), Thalassa Reine des Récifs (L, attaque + dot).

**10 renommages** (affichage seul, courbe inchangée) : Léviathan Colère du Gouffre, Gobelin des Fumées, Écorcheur de Suie, Invocateur des Foyers, Tisseur de Cendres, Gardien des Foyers, Archiliche des Caveaux, Ancien Naufragé, Prieuse des Naufragés, Veilleuse de Bord.

**Affichage léger des nouveaux effets** : badges flottants (😵 étourdi, 🐌 ralenti, ☠ poison, ↩️ renvoi, 🔗 lié, ⧉ copie, ✚ invocation, ✨ résurrection, 🔥 phénix, ⌛ expiration).

**Validation au harnas** (2400 combats) : les 4 autres donjons restent au winrate IDENTIQUE (0,0 partout, preuve que les changements moteur sont dormants pour l'existant). Marées : 876 → 869 victoires (−0,3 %), décalages max −10 % sur une cellule donjon/difficulté/profil, aucune falaise, bandes de difficulté respectées, 0 timeout. 11 tests moteur verts (10 effets + gating). Round-trip dist byte-identique (220 913 octets).

**Reste à faire (tour suivant)** : Forge complète (Cendrels 6, Enfants de la Braise 4, Gobelin des Fumées variante), puis Bosquet, Crypte (Spectres, Naufragés, Chevalerie Défunte), Zénith (Légion, Phénix, Clergé), familles compagnons (7 UR + 7 L), familles divines. Smoke test du dist (minidom) à réécrire.
## 35. Chargeur d'assets v0.27 (dist nu + calque d'images/vidéos)

**Principe** : le dist reste NU (aucune image/vidéo embarquée, il marche seul avec glyphes et dégradés). Les générations vivent À CÔTÉ, dans une convention de noms que le jeu sonde au démarrage. Le même HTML fonctionne donc ici sans rien, et chez Marc-Olivier avec ses 29 arts + 5 fonds + vidéos de sorts.

**Convention de noms** : `art/<id>.jpg|png` (art de carte, id du catalogue : e16, f3...), `bg/<id-donjon>.jpg|png` (fond de donjon : marees, forge, bosquet, crypte, zenith), `fx/<slug-sort>.mp4|webm` (vidéo de sort, slug = nom sans accents, minuscules, tirets : abime-absolu).

**Module `js/ui/assets.js` (dans le dist)** : `initAssets()` tente `fetch('assets-v3.json')` depuis v1.28 (manifeste unique de la campagne V3, 265 arts + 8 fonds, servi par la CI Pages, cas http : chargement instantané, aucune requête manquée) ; sinon sondage `new Image()` par carte et par donjon (tolérant en file://, double-clic) ; `probeFx(nom)` sonde les vidéos à la demande. Fichier manquant → retombe sur glyphe/dégradé, aucune erreur bloquante. Les anciens manifests (`assets.json`, `assets-wai.json`, `assets-v2.json`) sont archivés dans `archives/assets/`.

**Branchement UI** : `setArt(id, url)` dans card.js (la map ART vide était déjà câblée dans collection/équipe/combat/fiches, CSS `.art-img` existant) ; donjons : `d.art` déjà branché (écran donjons) + fond de combat illustré avec voile dégradé (`combatApp.style.background` = image + voile sombre) ; vidéos : `probeFx` exposé pour le futur chantier effets plein écran.

**Packer `pack-assets.py` (canvas « Pack Assets », à lancer sur le PC)** : `python3 pack-assets.py <dist.html> <dossier de générations> -o jeu` → renomme les fichiers par slug insensible aux accents (nom de carte OU id direct ; fonds par nom de donjon OU id OU préfixe fond-/bg- ; vidéos par slug de sort), recadre 400×560 JPEG q60 si Pillow est là (copie brute sinon), écrit `jeu.html` + `assets.json`, rapport matched/unmatched. `--noms` liste les 149 cartes, 5 donjons et 144 sorts attendus pour vérifier ses noms de fichiers avant la fusion. Testé : cartes par nom ET par id, fonds par id et préfixe, vidéos, manifeste, jeu.html byte-identique au dist.

**Garde-fous pipeline** : un NOUVEAU module doit être ajouté à l'ORDER canonique de build.py (sinon le dist référence des symboles absents : attrapé par le round-trip). Les imports doivent être strictement EN TÊTE des modules, sans commentaire avant : garde-fou SystemExit dans build.py. Le chargeur ne touche PAS le moteur : harnas 2400 combats digest identique (869 teamWins, 0 timeout), 12 tests moteur verts + test du chargeur en Node (sondage, manifeste, fx) verts.

**Reste à faire** : lecteur vidéo dans le combat (les fx sont sondés mais pas encore affichés : chantier UI brillances/voile/fond plein écran), smoke test minidom du dist toujours en dette.
## 36. Système de 6 classes v0.28

**Classes** : Guerrier ⚔, Assassin 🗡, Mage ✦, Prêtre ✚, Occultiste 🔮, Invocateur 🕯️ (GLYPH étendu, CLASSES = 6).

**Modificateurs de classe** (`CLASSE_MODS` dans engine.js, appliqués dans makeUnit à toutes les unités, équipe comme monstres) :
- Stats : Guerrier +10 % ATK/+15 % PV ; Assassin +5 %/−10 % ; Mage +5 %/−5 % ; Prêtre −15 %/0 ; Occultiste −20 %/0 ; Invocateur −10 %/−10 %. Classe inconnue → neutre (0/0).
- Rendement de frappe SANS sort : Guerrier/Assassin 100 %, Mage/Invocateur 80 %, Prêtre 70 %, Occultiste 60 %. Avec sort : mult complet.
- Comportements : Mage 80 % cible + 40 % de la base en zone (frappe de base seulement) ; Occultiste frappe toute la vague à 60 % (frappe de base seulement) ; exécution Assassin +25 % si cible < 35 % PV ; esquive Assassin 15 % (les deux côtés, événement `dodge`) ; bouclier passif Guerrier +5 % PV max par coup ayant réellement entamé les PV.

**Malédiction (nouveau statut)** : `st.curse = { value, turns }`, appliqué par effet support `curse` en zone, gated sur cast ; l'attaquant maudit voit ses dégâts × (1 − value) ; boss : value × 0,5 ; expire dans tickStatuses. Effet posé sur e27 Sirène Ensorceleuse (value 0,2, 2 tours, remplace son stun 1).

**Invocations v0.28** : helper `castSummon` partagé (supports via applySupport, strikers Invocateurs via la boucle d'attaque des deux côtés) ; sbire : 60 % ATK du lanceur, 50 % PV, ttl 3, sorts Frappe ; cap 2 sbires vivants, budget 3 par lanceur et par combat ; le sbire n'attaque pas le tour de son apparition (snapshot des tableaux strikers). Reclassing : f5 Invocateur des Foyers, a21 Invocateur de Fournaise (Golem de Fournaise), g10 Druidesse des Sèves (Sylvain des Sèves, remplace son heal 26).

**Reclassing v0.28** : Occultistes : e16, e17, e23, e24, e25, e26, e27, e28 (chamans + sirènes/banshees). Assassin : e30 Thalassa. Invocateurs : f5, g10, a21.

**Synergies** : Occultiste 2 cartes → cursePct +10 % ; 4 cartes → +25 %. Invocateur 2 → sbires +25 % PV ; 4 → +50 % PV et +20 % ATQ.

**Collection** : les monstres ne tombent plus dans « éclats isolés ». Marées : 3 familles avec chaînes v3 (Gobelins des Écumes e1→e3→e4→e5 + branches e16→e17 / e18→e19, cousins e2/e10/e8, mythe e14 ; Abîmaux e7→e11→e20 + branches e9→e6→e13 / e15→e21→e22, cousin e12 ; Sirènes e23→e24→e25→e26 + branches e27→e28 / e29→e30). Forge/Bosquet/Crypte/Zénith : bestiaires par donjon en attendant leurs refontes.

**Affichage combat** : événements rendus pour `summon` (le sbire apparaît immédiatement, burst 🕯️), `dodge` (💨 Esquive), `curse` (🔮 −X %), `exec` (🗡️ Exécution) ; clic sur un sbire sans carte catalogue sécurisé.

**Équilibre mesuré** (harnas 2400 combats, 5 donjons × 4 diff × 10 étages × 3 profils × 4 seeds) : baseline v0.27 = 869 teamWins (36,2 %) → v0.28 = 929 (38,7 %), 0 timeout, glissement max par étage −6 pts / +10 pts, tours moyens 2,9 → 3,3. Aucune falaise.

## 37. Forge en familles + glossaire v0.29

**Contenu Forge (13 → 24 monstres, 160 cartes au total)** :
- **Cendrels** : tronc f1 Golem de Cendre → f10 Souffleur de Braises → f11 Traqueur de Suie ; **voie du Filet** (supports Occultistes : f16 Mailleur de Suie SR slow → f17 Façonneur de Cendres UR curse 0,25 → f18 Ombeline, Tisseuse de Suie L stun 2) ; **voie de la Cendre Vive** (Mages à brûlure : f19 Champion de Cendre SR → f20 Souffle Ardent UR → f21 Calcine, Dame des Cendres L) ; cousins f7/f3/f8 ; mythe f13 Seigneur des Cendres.
- **Enfants de la Braise** : f14 Braise Errante C → f15 Semeur de Fournaise UC → f4 Chevalier de Braise R ; **voie du Magma** (f9 Idole de Magma SR → f6 Colosse de Magma UR → f22 Vulcain, Colosse Ardent L, Guerrier à brûlure) ; **voie des Foyers** (f5 Invocateur des Foyers SR → f23 Maître des Foyers UR support Invocateur → f12 Gardien des Foyers L, reclassé Guerrier → Invocateur avec Titan de Fournaise 70 % ATK/60 % PV) ; pas de M (le sommet est le Seigneur des Cendres).
- **Gobelin des Fumées** : f2 → f24 Gobelin de Suie UC (ligne directe rapide, variante régionale gobeline actée v3).
- Conflit de nom résolu : l'UR de la voie du Filet s'appelle **Façonneur de Cendres** (le cousin C existant garde « Tisseur de Cendres »). f13 : sort ×2 (dégâts très concentrés). Boss 10 de la Forge renommé **Seigneur des Cendres**.

**Glossaire (page `#glossaire`, 28e module js/ui/glossaire.js, nav entre Donjons et Boutique)** : sections dépliables `details` — mécaniques (frappe sans sort par classe, contrôle sous embargo, fureur +8 %/tour après le tour 15, croisés générés depuis CROSS, éléments générés depuis BEATS, tableau CLASSES, 8 statuts, progression) ; raretés C→M et taux des boosters (base 4+1 slot R 93/SR 6/UR 1, premium 3+2 slots, monstre 2+1 slot SR 60/UR 30/L 10, M jamais en pack, jauge boss 3 = SR+) ; synergies générées depuis SYNERGIES (paliers 2/4) ; **sorts à découverte** (uniquement cartes possédées ou croisées : `isKnown = owned > 0 || seenCard`, sinon compteur « encore inconnues ») ; éclats (drop boss final 30 %→100 % selon difficulté, ×0,5 sans lignée dédiée, fusion +3 % ATQ/éclat, branche SR à 3/3, évolution à 3 exemplaires) ; difficultés (tableau DIFFICULTIES, déblocages donjon/difficulté, checkpoint, capture boss) ; **défi journalier : à venir** (documenté tel quel) ; historique v0.24→v0.29 et mécaniques disparues.

**Découverte en donjon** : `renderCombat` marque vus les monstres de la vague (`markSeen` sur les unités `dungeon`, exporté de store.js) ; la collection affiche « vue en donjon » pour ces cartes grises et les chaînes de familles monstres se dévoilent dès qu'un maillon est vu (plus seulement possédé).

**Garde-fou nouveau module** : le bundle est UN SEUL script (pas de modules) : tout nom top-level doit être unique sur tout le bundle (collision `ownedOf` collection/glossaire corrigée en `gloOwned`, attrapée par `node --check` du bundle complet). L'ORDER du build vient du dist de référence : un nouveau module s'insère en éditant l'ordre une fois, puis le canon est automatique ; les imports du module sont régénérés dans l'ordre des marqueurs avec noms triés (le round-trip l'impose).

**Équilibre mesuré v0.29** : harnas 2400 combats, baseline v0.28 = 929 (38,7 %) → v0.29 = 949 (39,5 %), 0 timeout. **Les 4 donjons non-Forge sont inchangés cellule par cellule (0 ligne différente)** ; Forge seule 205 → 225 (42,7 % → 46,9 %) : mouvement graduel (starter stable 8/160, mid 62→75, late 135→142), dû à la voie Mage plus frêle (−5 % PV classe), la dilution des supports soins/boucliers ennemis et le reclassing de f12 en Invocateur. Leviers si la Forge paraît trop douce : tier forge 1→2, renforcer la sustain ennemie, ou remonter les stats de la voie du Filet.

**Menu compact v0.29.1 (UI seule, sans changement moteur)** : bouton ☰ dans le header ; sous 640px la nav est repliée et s'ouvre en menu vertical déroulant (✕ pour fermer) ; desktop inchangé (nav complète, bouton masqué). Fermeture automatique au changement d'onglet (`go()`) et au clic extérieur header/nav. Édition directe du dist publié (changement UI-only), validation par smoke router fake DOM 12/12.

## 38. Combat lisible v0.29.2

**Plateau en rangées de 3 (UI seule)** : `drawBoard` découpe chaque ligne (attaque/support, les deux camps) en rangées de 3 cartes max ; le débordement part en rangée arrière (classe `.row.back`, scale .94, origine top) : 5 cartes = 3 devant + 2 derrière comme avant les slots libres. Ligne vide = rangée placeholder (zones stables). Le ciblage manuel, les sbires (summon), ko et revive restent par uid : rien ne change côté moteur.

**Cartes mortes grisées (bug v0.29.2)** : la classe `ko` est posée sur le conteneur `.unit` mais le CSS ciblait `.card.ko` (jamais appliqué) ; sélecteur corrigé en `.unit.ko .card` : gris + luminosité .45 + opacité .55 + scale .96, dès l'événement ko, retiré par revive.

Validation : node --check du bundle, garde-fous structurels, smoke rows() fake DOM 13/13, ré-extraction du canvas byte-identique.

## 39. Tous les donjons en familles v0.30

**45 nouvelles cartes** (catalogue 160 → 205, monstres 90 → 135), les 5 donjons affichent 11 familles à la collection (bestiaires supprimés). La méta du choix de voie par fusion (SR + éclats) reste en file d'attente : les voies sont pour l'instant des lignes parallèles affichées.

- **Bosquet (9)** : Bêtes du Fougeron (voie Sylvestre : g13 Semeur SR Invocateur (Rampant Sylvestre 60/50) ; voie de la Mousse : g14 Mycolithe SR, g15 Mycélium UR, g16 Mycola L, Occultistes à drain (dot 35-40 %, 2-3 tours)) ; Gens des Sèves (voie des Clairières : g17 Dryade Radieuse UR heal 48, g18 Adriel L revive 60 % coût 6 ; voie des Sous-Bois : g19 Dryade SR slow coût 8, g20 Rôdeuse UR, g21 Vesna L — la voie passe en Ombre, acté familles v3).
- **Crypte (18)** : Spectres des Caveaux (k13 Goule R ; k14 Macha L Occultiste drain ; voie Liche : k15 Éveillé SR + k16 Liche UR Invocateurs (Goule Éveillée 50/50, Serviteur Squelettique 60/55), k7 Archiliche reclassé Invocateur (Garde du Tombeau 70/60, 38/104) ; M k17 La Mort 55/150 sort ×2) ; Naufragés (k18 Endeuillée UR curse 0,25, k19 Ysolde L stun 2 coût 7 ; k20 Capitaine Noyé SR, k21 Revenu UR drain, k22 Ahab L 40/106 ; M k8) ; Chevalerie Défunte (k23/k24/k4 tronc ; k25 SR + k26 Paladine UR bouclier 50 + k27 Jeanne d'Arc L (Lumière) ; k28 SR + k29 Sermenteuse UR warcry 20 %/red 15 + k30 Siegfried L).
- **Zénith (18)** : Légion Solaire (z13 Centurion Ardent UR brûlure, z14 Lancière de l'Aube UR, z15 Aurorine L) ; Phénix Célestes (z16 Essor UC, z17 Oiseau de Feu R ; voie de la Cendre Éternelle : z18 Cendre d'Éclosion SR phoenix 3 tours, z6 Phénix du Zénith renaît (phoenix 4 tours, première carte existante à recevoir le statut), z19 Pyrrha L phoenix 3 ; voie du Renvoi : z20/z21/z22 reflect 25/30/35 % coût 6-7) ; Clergé du Plein Jour (z23 Chapelain UC, z24 Diacre R ; z25 Cantatrice UR warcry, z26 Célestin L atkBuff 0,3 ; z27 Inquisitrice SR curse, z28 Justicière UR, z29 Justine L ; M z30 Apolline Mage attaque — les M supports ne peuvent pas tomber en boss, d'où le reclassage).
- **bossNames alignés** : Bosquet 5 Mycola / 10 Cœur du Bosquet ; Crypte 5 Goule des Caveaux / 10 La Mort ; Zénith 5 Phénix du Zénith / 10 Astre Capiteux.

**Équilibre mesuré (harnas 2400 recréé, bundle en vm, 3 profils × 4 seeds)** : global 61,1 → 59,9 %, 0 timeout. **Marées et Forge inchangés cellule par cellule (0/628)**. Bosquet 91,1 → 92,7 %. Crypte 89,5 → 84,4 % (21 cellules), Zénith 89,8 → 83,8 % (20 cellules) : l'ancien bestiaire clairsemé rendait les tiers 3-4 trop mous ; les nouvelles voies curse/stun/invocation/reflect mordent en Normal+. Le profil avancé ne perd aucune cellule ; la résistance se concentre sur le profil moyen en seconde moitié de donjon. Leviers si trop dur en test terrain : baisser le coût des contrôles adverses (7→8), réduire les sbires crypte (60→50 %), reflect z22 35→30 %.

**Validation** : intégrité familles 287 vérifications (raretés croissantes par ligne, couverture exacte, zéro doublon) ; boot smoke du dist complet en mini-DOM 16/16 (boot, 11 familles rendues, compteur 205, glossaire v0.30, donjons) ; ré-extraction byte-identique.
## 40. Défi du jour et familles divines v0.31

**18 cartes divines** (catalogue 205 → 223), élément **Divin** hors opposition, obtenues UNIQUEMENT via le booster du défi (5 cartes : C 25 %, UC 25 %, R 22 %, SR 15 %, UR 9 %, L 4 % ; jamais en booster normal, pack de monstres ou donjon). Raretés : C×4, UC×3, R×3, SR×3, UR×2, L×3 ; 6 attaquants, 12 soutiens.

- **Arbitres du Seuil** (contrôle du temps) : d1 Garde du Seuil C Guerrier 8/60 ; d2 Servante du Sablier C slow coût 8 ; d3 Huissier de l'Entre-Deux UC stun 1 coût 6 ; d4 Juge des Heures R Mage 15/72 (×1,8) ; d5 Maître des Sabliers SR curse 0,25 coût 6 ×2 ; d6 Kairos, Arbitre du Seuil L stun 2 coût 7 ×2.
- **Chœur Miroir** (copie et renvoi de sorts) : d7 Lame Miroir C Assassin 9/46 ; d8 Choriste Miroir UC Mage 12/50 (×1,6) ; d9 Prisme du Chœur R shield 22 ; d10 Miroir Antiphonique SR copy coût 6 ; d11 Chef du Chœur UR reflect 30 % coût 6 ; d12 Écho, Voix Miroir L copy ×2.
- **Tisseuses du Pont** (liens chaînés anti-one-shot) : d13 Fileuse du Pont C Assassin 8/58 ; d14 Aiguille du Pont UC shield 17 ; d15 Brodeuse des Liens R Assassin 15/70 (×1,8) ; d16 Tisseuse des Nœuds SR link coût 6 ; d17 Architecte du Pont UR link coût 5 ; d18 Ananké, Tisseuse du Pont L link ×2.

**Défi** : bloc 🌟 en tête des Donjons. Une équipe divine par jour via makeDailyWave (seed du jour) : 3 attaquants + 2 soutiens uniques, niveau de l'équipe (min 5, chef de file +2 en boss), variance 0,9-1,1 sur ATQ/PV. Victoire : +40 ⚡ et booster du défi offert à la boutique, une fois par jour (dailyDone) ; défaites libres (retry) ; entrer dans un donjon annule le mode défi. En combat, le mode défi masque étage, jauge et difficulté.

**Règles divines** : hors opposition (aucun bonus ni malus élémentaire, BEATS/BEATEN_BY intacts) ; une seule carte par famille divine en équipe, trois maximum (addCard + sanitizeTeams au chargement) ; dès 2 cartes divines posées : +10 % dégâts ET +10 % soins (teamModifiers, dormant sans divines) ; collection : section « Familles divines — défi du jour » (223 cartes), badge « vue au défi » (discovery via le défi) ; glossaire : section Défi du jour (équipe, récompense, règles, sommets) + historique v0.31.

**Validation** : harnas 2400 digest sha256 IDENTIQUE cellule par cellule (1437 victoires, 0 timeout : dormance du moteur prouvée) ; boot smoke du dist complet 35/35 (dont 17 tests divins : champs des 18 cartes, bonus à 2 divines, makeDailyWave déterministe 3+2 avec boss, booster divin 5 000 cartes sans M avec L à 4,2 %, limites addCard, clamp sanitizeTeams, rendus défi/boutique/combat/collection/glossaire) ; 150 combats de défi simulés, 0 crash (copy/link/slow côté ennemi, double L ennemie). Équilibre : débutant 42 % (23 tours), moyen/avancé 100 % (rituel de 2-4 tours) — calibrage à confirmer en test terrain.

## 41. Retours terrain v0.32 (sauvegarde, Forge des monstres, équilibrage)

**Sauvegarde blindée (bug iframe)** : le canvas Vibe rend le jeu dans un iframe sandboxé où localStorage jette une SecurityError, ce qui tuait save()/load() dès le premier booster. makeSafeStorage() fournit l'objet `storage` : localStorage si accessible, sinon Map mémoire persistante pour la session (plus aucun crash) ; save()/load() passent par storage sans jamais jeter. Boîte « Sauvegarde » sur l'accueil : export d'un code (préfixe `FCSAVE1 `, JSON complet encodé, copie via clipboard avec repli execCommand) et import vérifié (code invalide refusé proprement). Boutique : TOUS les packs de donjons sont affichés, les non débloqués en bouton désactivé 🔒.

**Bug moteur : bouclier passif Guerrier doublé.** Le bloc passif de applyDamage (gain d'armure quand le Guerrier encaisse) était dupliqué depuis v0.28 : chaque coup octroyait l'armure deux fois (l'impression « l'ennemi gagne de l'armure en étant attaqué » et les boucliers qui « ne bougent pas » venaient de là, l'ordre des calculs lui-même est bon : dégâts → bouclier → PV, une seule passe). Bloc dupliqué supprimé, delta mesuré au harnas 2400 : 1437 → 1458 victoires, tours moyens 3,63 → 3,4, 0 timeout, chaque cellule rejouée avec le digest documenté.

**Lisibilité du combat** : clic sur une carte en combat → fiche au niveau RÉEL de l'unité (plus « niveau 1 » figé) ; chips de statuts sur chaque carte (🌀 stun avec compteur, slow, curse −X % (tours), reflect % (tours), dot (tours), bouclier passif « 🛡 passif +X », copy, link, reviving) ; le libellé du gain de bouclier passif identifie sa source.

**Forge des monstres et des divines** : les cartes de famille (donjons + divines) s'évoluent le long des lignes de leur famille (3 exemplaires, niveau conservé) — section Évolutions de la Forge, ex. e1→e3, d4 Juge des Heures → d5 Maître des Sabliers, kairos récupérable par évolution d4. fuseShard (sacrifice à éclats) refuse désormais catégoriquement les cartes de famille/donjon : un Kairos ne peut plus être fondu par erreur.

**Booster du défi reworké** : slots déterministes — 3 tirages C 50 %/UC 50 %, 1 tirage R 65 %/SR 35 %, 1 tirage SR 70 %/UR 25 %/L 5 % (L ≈ 5 %/booster, jamais M). Mesuré sur 20 000 cartes : 0 M, L à 5,0 %. Glossaire à jour.

**Économie et confort** : vitesses de combat ×0,5/×1/×2/×4/×8/×16/×32 (7 paliers, ×1 = 600 ms) ; lots de boosters ×5/×10/×20/×50 pour les packs de base, premium ET de monstres ; résumé du booster affiché en HAUT de la fenêtre ; pop-up de fin de donjon : récap de la run (points, étages, cartes de boss, monstres vaincus, éclats, SR+ garanties) + 3 boutons (↻ rejouer, ⬆ difficulté supérieure si débloquée, ↩ donjons) ; vagues de donjons seedées par jour+donjon+difficulté (waveSeedFor : stables toute la journée pour une tentative honnête, changent le lendemain) ; filtre par rareté à l'équipe (chips Toutes/C/UC/R/SR/UR/L/M, réinitialisation en un clic) ; cartes de l'équipe agrandies (grille 150 px desktop et mobile) ; effetDesc étendu à tous les sorts (stun/slow/dot/reflect/warcry/summon/revive/link/copy/curse détaillés) et opposition divine « aucune — le Divin ne domine rien ».

**Validation v0.32** : node --check, 28 marqueurs, garde-fous structurels ; harnas 2400 avant/après (delta du correctif Guerrier documenté, 0 timeout) ; boot smoke 56/56 (34 v0.31 + 22 v0.32 : storage persistant, fuseShard refuse monstre/divine sans rien consommer, évolution e1→e3 niveau conservé et d4→d5, booster divin 20 000 cartes sans M à 5,0 % de L, waveSeedFor stable par jour/donjon/difficulté, export/import roundtrip + code invalide refusé, rendus filtre/lots/boutique/accueil/glossaire, bouclier passif appliqué UNE fois par coup) ; ré-extraction byte-identique après publication.

**Ouvert (attente décision utilisateur)** : économie long terme — le Bosquet Enfer se boucle en <1 h avec une équipe 2 UR + 3 L niveau 1-2, l'argent est quasi illimité en mode Enfer (rejouer à volonté), pas de sensation d'early/late game. Pistes : système d'énergie/stamina quotidienne, inflation des coûts + préciosité des éclats (brut/poli/gravé/radieux/éternel), défis hebdomadaires/saisons, ou un mix. Puis v0.33 : méta du choix de voie par fusion à la Forge (SR + 2 éclats polis → SR de la voie, voie définitive ; M = fusion des 2 L + 10 éclats éternels OU drop Enfer).

## 42. Proposition v0.33 : Méta de l'Ascension (niveaux 1-20, évolution à choix, autel de génération)

**Contexte** : retour audio de Marc-Olivier du 07/11, après la deep-research économie longue durée. Accord sur la direction validée par la recherche (XP gagnée en jouant, éclats comme matériaux d'évolution, peu d'exemplaires, aucun blocage temporel), enrichie de 6 idées de design. Statut : PROPOSITION consolidée, 4 arbitrages ouverts listés en fin de section.

### A. Niveaux 1-20 et Ascendance (le dilemme vitesse contre puissance)

- Une carte monte du niveau 1 au niveau 20 (croissance de stats par niveau conservée, cap 20).
- L'évolution est possible DÈS le niveau 10 ; la nouvelle forme repart au niveau 1.
- **Ascendance** : attendre au-delà de 10 grave un bonus permanent, +0,5 % de stats de base par niveau d'attente (niveau 11 = +0,5 %, niveau 20 = +5 %). Le bonus est conservé après l'évolution et se cumule de façon ADDITIVE à chaque évolution de la lignée : une carte poussée C→L en attendant toujours le 20 arrive avec +25 % de stats de base. Évoluer au niveau 10 = rapide, zéro bonus ; au 20 = lent, bonus maximal. C'est le dilemme central du système.
- Affichage : compteur d'Ascendance sur la fiche (total engrangé + gain si on attend encore), et à l'autel d'évolution, le choix est explicite (« Évoluer maintenant : +1 % engrangé » contre « Attendre niveau 20 : +5 % »).

### B. Coût d'évolution (l'or n'achète plus la puissance)

Évolution = niveau 10 ou plus + éclats de l'élément de la carte, par palier (calibrage initial, à mesurer au harnas) : C→UC = 3 éclats bruts ; UC→R = 2 polis ; R→SR = 4 polis ; SR→UR = 2 gravés ; UR→L = 4 gravés ; L→M = 10 éclats éternels (M aussi accessible par le drop Enfer, déjà acté). L'or n'apparaît dans aucune formule d'évolution : il finance l'acquisition (booster/boutique), jamais la puissance directe.

### C. Autel de génération (le sink des exemplaires)

- **Sacrifice 5 pour 1** : 5 cartes d'une même catégorie (personnages OU monstres, jamais mélangés) → 1 carte de la rareté supérieure, même catégorie, tirée au hasard, pondérée vers les éléments des cartes sacrifiées. Chaîne complète : 5 C = 1 UC, 5 UC = 1 R, 5 R = 1 SR, 5 SR = 1 UR, 5 UR = 1 L. La L est un PROJET (1 L = 5 UR = 25 SR = 125 R = 625 UC = 3125 communes ou l'équivalent en jetons), jamais un tirage.
- **Jetons de génération de fin de donjon** : chaque donjon terminé donne un jeton dont la rareté suit la difficulté : Facile = commun, Normal = uncommon, Difficile = rare, Très difficile = super rare, Enfer = ultra rare (arbitrage tranché : AUCUNE légendaire par donjon, la L passe par l'autel). Un jeton génère directement une carte de sa rareté ; les jetons de monstres tirent dans le bestiaire du donjon d'origine, les jetons personnages dans les familles compagnons. La première complétion du jour est garantie, les suivantes suivent la fatigue quotidienne du donjon (100 %, puis 50 %, 25 %, 12,5 %, plancher 10 %, remise à zéro nocturne) : jouer des heures reste toujours rentable, en rendement décroissant, jamais bloqué.
- **Exemplaires illimités, tous individuels** (arbitrage tranché) : plus de plafond de possession. Chaque exemplaire est une carte à part entière (niveau, XP, Ascendance propres), l'équipe garde sa limite de 2 exemplaires de la même carte. L'affichage devient INDIVIDUEL (la vraie cause de la friction v0.15 était une seule vignette pour des exemplaires multiples, leçon 46) : collection et équipe montrent chaque copie avec son niveau (« 5× Gobelin des Écumes : une niveau 2, une niveau 3, trois niveau 1 »).

### C2. Boosters rework (réponse à « l'or va recasser la dynamique »)

Le diagnostic est juste : tant que l'or achète des cartes à des taux corrects, le farm Enfer en vitesse ×32 inonde le jeu, mêmes niveaux ou pas. Trois garde-fous, zéro blocage :

1. **Taux reworkés bas** : un booster = 2 communes + 2 uncommons + 1 emplacement premium (R 92 % / SR 7 % / UR 1 %), JAMAIS de L ni de M. Le booster finance la variété de collection, pas la puissance.
2. **Prix progressif quotidien** : chaque booster acheté dans la journée coûte 1,5× le précédent (retour au prix de base chaque nuit). Une ou deux ouvertures par jour restent naturelles ; enchaîner 10 boosters devient un choix volontairement coûteux. L'or illimité ne peut plus inonder.
3. **La puissance n'est pas dans le booster** (garde-fou structurel) : une UR chanceuse reste niveau 1 avec ses sorts bruts ; sa puissance réelle exige sa montée 1-20 propre, des éclats fatigués quotidiennement, et des évolution-choix. L'acquisition peut être généreuse, la progression reste lente : c'est le vrai verrou.

- **Jalons de début de jeu** (le bon côté des gacha, assumé) : la progression du compte offre des cartes marquantes aux premiers pas : premier donjon terminé = une R au choix parmi 3, premier boss d'étage 5 vaincu = une UC, première Difficile terminée = une SR au choix parmi 3. La sensation « ah, t'as une carte puissante, allez go » vient de la progression, pas de 50 ouvertures.

### D. Arbres d'évolution à choix et sorts cumulés (modèle Valkyrie Crusade)

- Chaque famille devient un GRAPHE EN RACINES (arbitrage tranché : la linéarité actuelle est cassée) : à CHAQUE palier d'évolution, exactement 2 formes proposées, sauf aux sommets terminaux (1 seule). Les racines peuvent se REJOINDRE : deux branches peuvent converger vers la même forme, éventuellement depuis une famille voisine (les frontières deviennent poreuses : personnages très hybrides ou très monocentriques, au choix du joueur).
- **La carte DEVIENT la nouvelle forme** (nom, classe, stats, élément éventuel de la forme choisie) et **GARDE tous les sorts accumulés**, plus le sort unique de la nouvelle forme. Une L complète peut porter 6 à 8 sorts : l'identité de la carte est l'historique de ses choix (full guerrier = tank pur ; guerrier + prêtre + assassin = guerrier avec heal et exécution).
- **Légendaire : 2 sorts** (la forme L apporte ses deux sorts signature).
- Les choix se resserrent en montant (C/UC : 2 branches fréquentes, UR/L : le graphe converge), la contre-pression de mana existante cadence les sorts accumulés (coût 6-8 = un cast tous les 3-4 tours).
- **Titres et noms personnels** : le nom de la forme devient un TITRE (Archiliche, Cœur du Bosquet, Veilleuse de la Voix, Déesse des Océans...) ; chaque carte est NOMMÉE PAR LE JOUEUR à l'acquisition (renombrable plus tard), le nom personnel traverse les évolutions, seul le titre change. La fiche lit « Nom perso · Titre ». Les uniques (Kairos, Écho, Ananké...) restent des titres canoniques, le nom personnel s'affiche à côté.
- **Phasing (proposition)** : v0.33 = tout le moteur de méta (niveaux 1-20, Ascendance, XP/fatigue, autel, jetons, boosters rework, exemplaires individuels, titres/noms) sur les graphes EXISTANTS (chaque palier propose la forme suivante actuelle +, quand elle existe, la variante naturelle de la famille) ; v0.34 = le chantier contenu du redessin complet en racines (2 choix partout, convergences inter-familles, formes intermédiaires à créer). Raison : le redessin total double le contenu à designer, il ne doit pas bloquer la livraison de la méta.

### E. XP par run et fatigue quotidienne (rythmer sans bloquer)

- **XP par carte, par run** : chaque carte de l'équipe gagne, à la fin du run (pop-up existante), une XP = étages franchis × multiplicateur de difficulté (×1 Facile, ×1,5 Normal, ×2 Difficile, ×3 TD, ×5 Enfer) × 1,5 si victoire. Jamais par combat (la vitesse ×32 ne farmerait sinon rien).
- **Fatigue quotidienne PAR CARTE** : chaque carte commence la journée à 100 % de XP rendue ; chaque palier de XP engrangé aujourd'hui la fait décroître (100 → 90 → 80 → 70...), plancher 25 % ; remise à zéro chaque nuit. Une nouvelle carte ou une nouvelle équipe démarre TOUJOURS à 100 %, même si les vétéraines sont fatiguées (répond au souci des équipes neuves).
- **Éclats : fatigue quotidienne PAR DONJON** : premier drop de la journée 100 %, puis 50 %, 25 %, 12,5 %... plancher 10 % ; remise à zéro chaque nuit. Rejouer reste toujours possible et toujours un peu rentable, simplement décroissant : le ralentissement vient de la courbe, jamais d'un écran de blocage.
- Chaque carte est un EXEMPLAIRE INDIVIDUEL (niveau et XP propres ; arbitrage tranché) : la clé est l'affichage individuel (section C), plus jamais une seule vignette pour des exemplaires multiples. Le nom personnel remplace l'idée de surnom (section D).

### F. Early game et migrations

- Départ : 2 jetons de génération communs (première équipe générée par l'autel), courbe Facile recalibrée pour être franchissable avec des communes niveau 1-3, glossaire mis à jour (Ascendance, autel, fatigue expliqués honnêtement avec les chiffres réels, leçon 75).
- Migration de sauvegarde versionnée : niveaux actuels conservés (clampés à 20), exemplaires au-delà de 2 convertis en jetons/éclats avec toast du montant, position dans le graphe conservée, aucune carte perdue.
- Moteur de combat INTACT attendu (tout est méta) : harnas 2400 à rejouer avant/après, delta documenté si la moindre ligne bouge.

### Arbitrages tranchés (retour audio du 07/11)

1. **Boosters** : gardés mais ENTIÈREMENT reworkés (C2 : taux bas sans L/M, prix progressif quotidien ×1,5, jalons de début de jeu). La méta v3 « SR + 2 éclats polis pour choisir sa voie » est remplacée par ce système. EN ATTENTE DE VALIDATION finale de Marc-Olivier.
2. **Jeton Enfer** : ultra rare garantie, aucune légendaire par donjon (la L passe par l'autel : chaîne 5 UR = 1 L).
3. **Exemplaires** : individuels, ILLIMITÉS en possession (2 max par équipe, règle d'équipe existante), affichage par exemplaire obligatoire.
4. **Ascendance** : +0,5 % par niveau d'attente au-dessus de 10 (max +5 % au 20, cumul additif à chaque évolution).
5. **Graphes** : linéarité cassée, 2 choix à chaque palier (racines qui convergent), redessin complet = v0.34.

### Calibration au harnas (avant publication)

Mesurer avant de publier : nombre de runs par niveau (Facile/Enfer), temps réel par palier C→L (avec et sans Ascendance), temps pour la première L complète, rendement de la chaîne 5-pour-1, et vérifier que le harnas moteur ne bouge pas d'une cellule.

## 43. Implémentation v0.33 : Méta de l'Ascension (livrée, 07/11)

**Statut** : LIVRÉE et publiée dans le canvas prototype (dist 324 398 caractères, 28 modules, save v6). Tout le moteur de méta de la section 42 est en place sur les graphes existants ; le redessin des racines (2 choix par palier) reste v0.34.

### Ce qui est réellement livré

- **Exemplaires individuels (save v6)** : store.instances (iid, id, lvl, xp, asc, name, acc) ; grantCards crée une instance par carte ; collection = compteur dérivé (syncCount) ; levelOf/xpOf lisent le meilleur exemplaire ; addXpI(iid, gain) avec cap 20 (xpToNext(lvl) = lvl, monter 1→10 coûte 45 XP, 1→20 coûte 190) ; renameInst (trim, 24 car.) ; migration v5→v6 sans perte (n exemplaires → n instances, la première garde le niveau clampé 20 et l'XP partielle, les slots id deviennent des iid libres, sanitizeTeams par iid).
- **Évolution** : evolveInstance(iid) dès Nv 10, coût evoCostOf par rareté (C→UC 3 bruts, UC→R 2 polis, R→SR 4 polis, SR→UR 2 gravés, UR→L 4 gravés, L→M 10 éternels) de l'élément de la carte, JAMAIS d'or ; repart Nv 1, sorts de l'ancienne forme cumulés dans acc, Ascendance gravée : asc += 0,5 × (niveau d'attente au-delà de 10), arrondi au dixième, cumulée ; nom et iid conservés (l'équipe suit en place). FuseShard/forgeFeed passent par takeCopy(iid) ; evolveCard (3 exemplaires) supprimé.
- **Gemmes d'évolution** : 4 tiers (brut, poli, gravé, éternel) par élément ; boss étages 5/10 en lâchent, tier par difficulté (BOSS_GEM : Facile brut/brut, Normal brut/poli, Difficile poli/gravé, TD gravé/gravé, Enfer gravé/éternel). Écart avec la spec : PAS de « radieux » (4 tiers, pas 5) ; la M par évolution L→M (10 éternels) coexiste avec le drop Enfer.
- **Autel 5-pour-1** : runAltar(rar, cat) consomme les 5 exemplaires libres les plus bas de la catégorie, génère la rareté supérieure avec élément pondéré par les sacrifiées ; chaîne jusqu'à la L ; la M refusée (NEXT_RAR s'arrête à L).
- **Jetons et jalons** : grantToken/useToken (F=C, N=UC, D=R, TD=SR, E=UR, jamais L ; personnages ou monstres) ; jeton monstre tire dans le bestiaire du donjon d'origine ; départ : 2 jetons C personnages ; jalons openMilestoneModal (1er donjon terminé : R au choix parmi 3 compagnons ; 1er boss étage 5 : UC directe ; 1re Difficile : SR au choix parmi 3).
- **XP de run + fatigue** : à la fin d'un run de donjon (pas du défi), chaque exemplaire de l'équipe gagne étages franchis × points de difficulté ×1,5 si victoire, multiplié par xpMultFor(iid) (fatigue 100→90→… plancher 25 % par carte par jour, registerXpRun) ; la modale de fin (défaite comprise) affiche la ligne XP.
- **Fatigue de butin** : dropChance(dungeonId) = 0,5^n plancher 0,1 par donjon par jour (registerDrop à chaque victoire finale) ; chip « Drop du jour : X % » sur la page Donjons.
- **Boosters reworkés** : base = 2C+2UC + 1 slot R92/SR7/UR1 ; premium = 2R+2SR + 1 slot UR60/SR40 ; monstres = 2 slots C45/UC35/R20 + 1 slot SR70/UR30 ; divin = 3× C50/UC50, 1× R65/SR35, 1× SR75/UR25 ; PLUS AUCUNE L ni M en booster. Prix progressif : boosterPrice = base × 1,5^n achats du même type dans la journée (reset nocturne), affiché en boutique.
- **UI v0.33** : Forge (évolutions une ligne par exemplaire avec dilemme Ascendance explicite, réserve d'éclats, autel pers + monstres, jetons) ; fiche (exemplaires une par une avec niveau, %, chip Ascendance, sorts hérités, renommage en place, évolution par exemplaire) ; équipe/accueil par exemplaire (badge nom perso) ; glossaire (section « Ascension, autel et fatigue » générée depuis les constantes, taux des boosters, autel, jetons, jalons, historique v0.33, GONE_DOC niveau unique v0.24-0.32).
- **Écart assumé** : le titre de forme : le jeu affiche le nom perso en priorité (badge) mais n'affiche pas encore la composition « Nom perso · Titre » sur la fiche, et les lots boutique ×20/×50 facturent au prix courant (×n du prix du moment), pas au prix de base.

### Validation

node --check, 28 marqueurs, garde-fous structurels ; harnas 3000 combats digest IDENTIQUE cf01ed03 (moteur dormant : la seule ligne moteur touchée, c.level ?? levelFor dans initCombat, est dormante, les cartes du harnas n'ont pas de .level) ; smoke boot 66/66 (voir plan v0.33) ; migration testée v5→v6 (niveaux, slots, XP) ; ré-extraction byte-identique après publication. Au passage : variables hoistées dans case 'end' (crash latent de défaite v0.32 réparé).

### Reste pour v0.34 (redessin des racines)

2 choix de forme à chaque palier (graphe en racines qui convergent), formes intermédiaires à créer, sorts signature par voie, titres canoniques sur la fiche, calibration chiffrée de l'économie (runs par niveau, temps C→L, rendement de l'autel), affichage des vidéos fx en dette.
## 44. Implémentation v0.33.1 : retours terrain (livrée, 07/11)

**Statut** : LIVRÉE et publiée dans le canvas prototype (dist 295 908 caractères, 27 modules, save v7). Toutes les corrections de lisibilité demandées + refonte de l'acquisition (fin de la boutique, fin de nourrir/sacrifier). Moteur de combat intact : harnas 3000 combats digest IDENTIQUE 93004bb0, 1742 victoires, 0 timeout.

### Corrections de lisibilité (retours terrain)

- **Retrait d'équipe affiché** : le crash venait du changement de sémantique des slots (id → iid) sans reprendre le module UI ; l'appui court sur une carte en slot la retire et re-rend l'écran immédiatement.
- **Stats réelles par niveau** : statsAt(card, lvl, asc) (même formule que le moteur) ; les cartes d'équipe, de grille et de Forge affichent ATQ/PV du niveau réel (+8 %/niveau × Ascendance).
- **Effets visibles en combat** : fiche au clic sur une unité (openUnitModal) : ATQ/PV/bouclier/mana, effets actifs avec montants, durées restantes et SOURCE (« posé par X (sort) »), Pouvoir, sorts ; fxLog documente les 12 effets du moteur.
- **Pouvoirs documentés** : chaque fiche explique le pouvoir contextuel (stun, malédiction, brûlure, renvoi…) au-dessus des sorts, en tête de fiche et dans la fiche de combat.
- **Vitesses réelles** : à ×16/×32 (speedIdx ≥ 5), les animations sont coupées (turbo) : les tours s'enchaînent pour de vrai.
- **Étage verrouillé** : plus d'input modifiable, chip statique.
- **Filtres en popup** : icône ⚙️, brouillon de filtres, Valider applique, clic extérieur ferme sans changer.
- **Badge ✨** : isNew à la création d'instance, anyNewOf/clearNewOf (fiche), badge brillant sur les grilles.
- **Cartes plus grandes** : slots 144px, grilles minmax(168px), unités de combat 104-172px (boss 140-215px), pied de carte 0,74rem, page élargie à 840px.
- **Défi du jour** : niveau figé au premier lancement du jour (store.dailyLevel), +40 ⚡, 1 éclat brut Divin, 5 divines tirées sur-le-champ.
- **Éclats intermédiaires** : chaque étage intermédiaire a 35 % de la chance du premier drop du jour du donjon de lâcher un éclat brut.

### Refonte acquisition et progression

- **Boutique et boosters SUPPRIMÉS** (modules core/booster et ui/booster réduits au tirage divin ; nav à 6 onglets). Sources : donjons (jauge de boss PITY_MAX, captures), jetons de fin de donjon, autel 5→1, jalons, défi divin (seule source des divines). Rythme lent voulu : quasi uniquement des communes au début, les raretés suivent les donjons/difficultés débloqués.
- **Nourrir, sacrifier, fondre : SUPPRIMÉS** (takeCopy/sacrificeFor/feedCard/fuseShard retirés du store, UI Forge repensée : évolutions par exemplaire, réserve d'éclats, autel, jetons). Les niveaux viennent uniquement de l'XP de donjon ; les doublons passent par l'autel.
- **Noms d'origine** : le renommage personnel est retiré, les cartes gardent le nom de leur forme (demande explicite : revenir en arrière sur ce point de v0.33).
- **Solos gelés** : les compagnons isolés restent jouables et évoluent (SOLO_STEPS) mais ne s'acquièrent plus (ils sortaient des boosters) et sont exclus des jetons, de l'autel et des jalons ; ils reviennent en v0.34 comme branches de l'évolution en racines.
- **Save v7** : isNew sur les instances, dailyLevel, plus de boosterDay/dailyPack ; migrations v5/v6 acceptées sans perte.

### Décisions v0.34 actées (à détailler en section 45)

Évolution en arbre racines 2 par 2 dès le palier UC ; base commune ~dizaine de cartes ; branches convergentes ; les solos reviennent comme branches ; calibration chiffrée de l'économie AVANT le design du graphe.

### Écarts assumés

- L'or/les points restent un score sans sink (la boutique qui les dépensait a disparu ; à recaler en v0.34).
- Le « radieux » (5e tier de gemme) n'existe pas (4 tiers : brut, poli, gravé, éternel).
- La fonte d'éclats est retirée : les bonus déjà fondus restent actifs en combat (aucune perte).

### Validation

node --check 27 modules, garde-fous structurels ; harnas 3000 combats digest IDENTIQUE 93004bb0 (moteur dormant, aucune ligne moteur modifiée ; l'ancien harnas v0.32 cf01ed03 a été perdu au reset environnement, la preuve de dormance est l'égalité de ce harnas avant/après edits) ; smoke boot 71/71 (boot complet, 6 onglets, instances individuelles, autel, jetons, fatigue, évolution, tirage divin sans L/M, migration v5, save v7, retrait d'équipe, filtres popup, étage verrouillé) ; ré-extraction byte-identique après publication.

## 45. Implémentation v0.33.2 + proposition v0.34 « racines » (08/11)

### Implémentation v0.33.2 : deuxième retour terrain (LIVRÉE)

**Statut** : LIVRÉE et publiée dans le canvas prototype (dist 307 526 caractères, 27 modules). Moteur de combat intact : harnas 3000 combats digest 137473a3 IDENTIQUE avant/après tous les edits (1666 victoires, 0 timeout, moyenne 4,67 tours) ; toutes les corrections vivent dans la couche UI, zéro ligne du moteur touchée. Smoke boot 40/40.

- **Aléa UI indépendant (uiRand)** : l'hôte peut seeder Math.random, ce qui rendait les jetons identiques après rechargement ; les 10 tirages aléatoires de la couche UI passent par un flux propre (Date.now + compteur, mulberry32), uniformité vérifiée sur 50 000 tirages.
- **Bonus de découverte** : dans le premier donjon, en Facile, tant que le donjon n'a jamais été bouclé, les ennemis sont affaiblis (étage 1 ×0,68, étage 2 ×0,8, étages 3-4 ×0,9, boss 5 ×0,85, étage 6 ×0,92, étage 7 ×0,85, étages 8-9 ×0,9, boss final ×0,5) ; bandeau à l'écran, section au glossaire ; il s'éteint au premier donjon complet (auto-limité : impossible de farmer un donjon facile).
- **Calibration chiffrée (simulation 14 runs, marées Facile, 5 communes)** : progression régulière des étages 5→8 ; premier donjon complet au run ~8 (15 XP de victoire, 1 jeton, ~4 gemmes brutes en 14 runs) ; après le premier clear le bonus s'éteint, l'équipe plafonne étages 4-8 : la suite passe par la première évolution (Nv 10 = 45 XP cumulés, ~15-16 runs le jour 1 avec la fatigue par carte ; C→UC = 3 éclats bruts, atteignable jour 1). Mesures détaillées dans le canvas économie.
- **Corrections** : 5 jetons de départ ; bouton « Relancer l'exploration (étage 1) » après une défaite ; combat auto dès l'entrée sauf mode manuel ; vitesses ×16/×32 quasi instantanées (animations coupées, chaîne 90 ms) ; crash de TOUTES les fiches corrigé (eclatBlock référencé mais jamais déclaré : un template literal survit au lint mais pas à l'exécution, le smoke de boot complet l'attrape) ; sorts décrits honnêtement (soin ×N, bouclier, buff ATQ, dégâts continus explicités, « frappe à X % de l'ATQ » pour les attaquants) ; Pouvoir expliqué (effet automatique à chaque action, sans mana) ; appui court sur une carte en équipe ouvre la fiche ; glossaire : couleurs des éclats (élément tiré des monstres du donjon, tier selon la difficulté), vitesses, bonus de découverte, relance après défaite.
- **Révélation des cartes** : jeton, autel et évolution ouvrent une carte face cachée (dos ✦ pulsant), flip 3D au clic, halo de la rareté, puis appel à l'action (l'évolution depuis la fiche garde la fiche ouverte).

### Proposition v0.34 : évolution en racines (PROPOSITION, à retravailler par Marc-Olivier)

Proposition détaillée dans le canvas dédié « évolution en voies » (arbre complet, exemple pilote de la famille lame, plan de livraison) ; le résumé ci-dessous en donne les principes.

Principe : l'évolution devient un arbre à choix 2 par 2. Chaque carte nommée garde son identité (noms d'origine conservés), le joueur choisit sa voie, et l'arbre converge pour ne pas exploser en contenu.

1. **Racines** : les ~7 familles actuelles (lame, ombre, eau, aube, bouclier, braise, bosquet) gardent leur commune d'origine comme racine. Plus de « solos » isolés : ils deviennent des cibles de branches (voir point 4).
2. **Bifurcation à chaque palier dès UC** : C→UC propose déjà 2 formes au choix ; puis chaque maillon offre 2 formes suivantes. Pas de retour arrière (une évolution est un engagement, comme l'Ascendance). Les sorts de la forme quittée ne sont PAS perdus : ils restent cumulés (mécanique actuelle conservée), la voie choisie ajoute son sort signature.
3. **Branches convergentes** : 2 UC différentes peuvent mener à la même R (l'arbre est un graphe, pas un arbre pur). Un arbre 2×2×2×2×2 pur exigerait ~30 formes finales par famille ; avec convergences visées, on tient ~2-3 nouvelles cartes par maillon. Les voies se distinguent par les sorts/effets (ex. lame offensive vs lame défensive), pas par des stats brutes.
4. **Les solos deviennent des cibles de branches** : Braconnier, Palefrenière, etc. redeviennent acquérables comme formes d'évolution de certaines voies (fin du gel « jamais acquérir »).
5. **Coûts inchangés** : le palier paie sa rareté (3 bruts C→UC, 2 polis UC→R, etc.) ; dilemme Ascendance conservé (évoluer tôt +0,5 %/niveau d'attente vs attendre Nv 20 +5 %).
6. **Ce qui reste à décider** : nombre exact de voies par famille (2 ou 3), à quel palier les branches cessent de converger, si les monstres suivent le même arbre, et si une voie peut être « déverrouillée » pour une autre carte de la même famille (partage de découverte).

### Écarts et dettes (inchangés + nouveaux)

- Or/points : score sans sink (à recaler en v0.34 avec les racines).
- Radieux : n'existe pas (4 tiers de gemmes).
- Affichage des vidéos fx : en dette.
- La calibration du bonus de découverte est UI-layer : à affiner avec les chiffres vécus de Marc-Olivier.

## 46. Rework des races : implémentation v0.34, Phases 0-1-2 (08/11)

**Statut** : LIVRÉE et publiée (v0.34.0, dist 317 889 caractères avec frontmatter). Moteur dormant : harnas 3000 combats digest e2d5514f IDENTIQUE avant/après les edits (430 victoires, 0 timeout, 4,86 tours de moyenne) ; smoke boot 68/68 ; 27 garde-fous statiques. Source de vérité du design : les deux documents uploadés (« Rework des arbres v10 » et « Plan d'implémentation »), le plan fait foi sur l'ordre, le design sur les règles.

### Ce qui est livré

- **La race, donnée de fiche** : `raceOfCard()` classe les 223 cartes sans toucher au catalogue : 19 divines (18 du Seuil + l'Astre Capiteux, « un dieu qui n'était pas gentil »), 47 mystiques (Sirènes des Récifs, Gens des Sèves, les 3 familles de la Crypte Noyée y compris leurs M : la Mort et l'Ancien Naufragé restent mystiques), formes spéciales humaines du Zénith (Légion Solaire, Clergé du Plein Jour, Apolline comprise), le reste des donjons en monstre, compagnons/mini-lignées/solos en humain. Fiche : ligne race avec modificateur (et pour les divines, le rappel du bonus d'équipe).
- **Fin de l'élément Divin** (décision Marc-Olivier : les divines gardent un VRAI élément, écart assumé avec le doc v10) : Arbitres du Seuil = Lumière, Chœur Miroir = Eau, Tisseuses du Pont = Terre ; oppositions normales, évolutions payées en éclats de leur élément, bonus d'équipe (+10 % dégâts et soins dès 2 divines) porté par la race. Migration save v7→v8 : gemmes Divin → Lumière.
- **Éclat de régression** : drop dans tous les donjons à chaque victoire, 0,3 % (Facile) à 5 % (Enfer) par cran, paramétrable (`REG_ECLAT_RATE`) ; réserve visible à la Forge avec la règle complète ; mécanisme posé (entrée au palier R, 100 % des sorts, 10 % des stats gagnées, l'ancienne reste), **aucune cible vivante avant le patch 3.3** : trappe vide assumée, la réserve se remplit dès maintenant.
- **Verrou en fiche** : champ `verrou {actif, condition}`, affichage 🔒 + condition ; aucun verrou actif sur l'existant (le standard SR viendra avec les nouveaux SR du patch 3.3).
- **Évolutions typées** : `EVO_TYPES` (standard, partage, convergence, regression, chute, malediction, evenement, secrete) + `formsOf(id)` ; les chaînes actuelles deviennent des entrées standard à option unique ; `nextFormOf` reste le moteur des chaînes existantes. Les types malediction (transformation forcée, sans choix) et evenement (carte enfant) sont posés en mécanisme, sans donnée vivante (Phase 5).
- **Défi du jour** : 1 commune pondérée 50/30/15/5 + 1 éclat brut de l'élément tiré (+40 ⚡) ; plus de booster de 5 divines.
- **3 jetons de départ** (remplacent les 5) : humain garanti · les 4 races au tirage · non-humain au tirage ; tous communs, tout en tirage.

### Décisions actées (ce tour)

1. Scope : Phases 0+1+2 + jetons en v0.34 ; patch 3.1 (novices) ensuite.
2. Aucun changement de palier en Phase 2 : Épéiste Errant reste R, Servante de l'Aube reste C, Jongleur/Braconnier restent C, etc. Les re-classements du plan arrivent au patch 3.1, quand les arbres des novices existent.
3. Les 223 existantes gardent leurs stats : RACE_MOD régit nouvelles naissances et régression (le digest du harnas le prouve).
4. Le lien direct Alix Archimage UR → Alix Déesse de l'Eau L reste jusqu'au patch 3.3.
5. Les graines forgeOnly restent non acquérirables en v0.34.0.

### Table de placement pour le patch 3.1 (PROPOSITION, à corriger)

Principe : chaque carte actuelle reste jouable et trouve sa place ; les têtes de chaîne actuelles deviennent des **naissances raccourcies** (la règle d'accès universel du v10) qui entrent dans les arbres des novices.

| Cartes actuelles | Placement proposé dans les arbres v10 |
| --- | --- |
| Épéiste en Herbe (C) + Spadassin Vigilant (UC) | Naissances raccourcies de la voie du guerrier : elles débouchent sur le Soldat ➕ (UC) ; l'Épéiste Novice ➕ (C) devient la racine de l'arbre |
| Épéiste Errant (R) | Re-classé UC au 3.1 (voie de l'errance, choix 1) : les deux naissances ci-dessus y débouchent aussi |
| Bretteur du Zénith (SR) → Kenji UR → Kenji L | Lignée Bretteur : Bretteur ➕ (R) sur la voie de la force, Maître Épéiste ➕ (SR) à créer entre Bretteur et Kenji Lame Éternelle (UR) ; Bretteur du Zénith devient naissance raccourcie du sommet |
| Rôdeur des Ombres (C) + Guetteur Crépusculaire (UC) | Naissances raccourcies de la voie de l'assassinat (Voleur Novice ➕ → Apprenti Assassin ➕ → Faucheur des Ombres R, chaîne Onyx conservée sur le poison) |
| Novice de l'Aube (C) | Naissance raccourcie de la voie lumière du prêtre (le Prêtre Novice ➕ devient la racine ; Servante de l'Aube passe UC au 3.1) |
| Gardien-Mécanique (C) + Garde du Rempart (UC) | Naissances raccourcies de la voie du Chevalier (tank) ; Sentinelle d'Acier R → Bastion Arcanique SR → Argus UR → Argus Forteresse Vivante L conservées, Argus reste le SOMMET PARTAGÉ chevalier/lignée Bouclier du v10 |
| Allumeur de Braises (C) | Naissance raccourcie du mage feu (l'Allumeur de Braises UC re-classé du v10 reste le nœud d'arbre) ; chaîne Solen conservée, Solen reste L mortelle finale |
| Apprentie des Rivières (C) | Naissance raccourcie du mage eau ; chaîne Alix conservée jusqu'à la régression (3.3) |
| Traqueur du Bosquet (C) + Pisteur du Bosquet (UC) | Naissances raccourcies de la voie sylvestre de l'épéiste (Chasseur du Bosquet R re-classé, chaîne Maïa conservée) |
| Garde-Promesse (C, Prêtre Eau) | Naissance raccourcie de la lignée du prêtre lumière (ou convergence foi du mage eau : à trancher au 3.1) |
| Étincelle Vive (C, Mage Feu) | Naissance raccourcie du mage feu |
| Médecin de Camp (C, Prêtre Lumière) | Naissance raccourcie de la voie foi du prêtre |
| Veilleur d'Acier (C, Assassin Ombre) | Naissance raccourcie de la voie de l'assassinat, ou rattaché au Guet (mini-lignée conservée) : à trancher |
| Pilier Mécanique (R, Guerrier Terre) | Naissance raccourcie de la lignée du Chevalier/Bouclier |
| Mini-lignées (Quais, Routes, Dunes, Fête, Berges, Guet) | Greffes actées du v10 : Quais et Fête sur le voleur, Routes sur le chevalier, Dunes sur la voie sylvestre ; Berges et Guet restent des mini-lignées (pas de greffe) |

### Données d'équilibrage ouvertes (plan, section 4)

- Taux de l'Éclat de régression par cran (posé à 0,3/0,6/1,2/2,5/5 % par victoire) : à recaler avec le retour terrain.
- Répartition fine des stats +10/+20/+30 % par stat : au patch 3.1.
- Palier de Morzak, camp de l'Astre Capiteux, essences feu/lumière de l'Enge : aux patches 3.2+.
