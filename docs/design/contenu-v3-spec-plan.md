# Contenu v3 — spec et plan (8 lots + campagne d'arts)

> Statut : **ACTÉ, en exécution** (11/11/2026, tranchages de session incorporés : greffe des solos ACTÉE, marchand v2 ACTÉ, icônes d'équipement REFUSÉES → arts complets par objet). Prompt de lancement : `docs/prompt-contenu-v3.md`. Renvois : roadmap point 6 (contenu) ; brief de contenu `docs/design/familles-races-v3.md` + sections v3 de `docs/design/spec-design.md` ; arbitrages du 11/11 (tranchages) et du 10/11 (structure d'une famille v3).

## Hors périmètre

- **Redesign IA de combat** (roadmap point 10) : après ce chantier.
- **Recalibrage** : baseline verrouillée (ACTÉ 11/11, `f72106ff…`/`3f9fe198…`). Ce chantier produit des **MESURES** (nouveau sha attendu : les vagues accueillent Sirènes et gobelins), jamais des recalibrages, sauf révision datée dans arbitrages.
- **Méta P-Hub, déclinaisons des raretés basses** (roadmap point 12).

## Règles de chantier (rappel AGENT.md)

- Une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` régénéré par `node build.mjs`, jamais édité à la main ; zéro dépendance npm.
- **Re-fetch systématique avant chaque édition** : d'autres couloirs poussent aussi sur `main`.
- Toute décision dans `docs/arbitrages.md` avec date et statut ; une MESURE par lot qui touche les vagues ou le catalogue.
- Chaîne de preuve par lot : build ok + tests (≥ 144) + smoke (≥ 294 checks, échecs préexistants 46 g/45 e tolérés) + digest (inchangé attendu sauf lots qui touchent les vagues : C2, C3, C5 → MESURE).
- Un seul chantier à la fois sur `ui.js` ; le couloir design pousse les arts en parallèle (manifeste seulement, pas de `src/`).

## Lot C1 — marchand de créatures v2 (tranché 11/11)

- **3 offres par jour** (rotation quotidienne, même mécanique que les compagnons de la Guilde : `seedOfDay`), monstres non nommés, L/M/nommés hors vente, limite 3 exemplaires inchangée.
- **Prix en data** (`data/marchand.json`) : **C 200, UC 1 500, R 4 500, SR 8 000, UR 10 000 or** (un run ≈ 400 or, une UR ≈ 25 runs).
- **Raretés débloquées par difficulté de donjon bouclée** (défaut proposé, calibrable) : C dès le départ ; +UC après un premier donjon bouclé en Facile ; +R en Normal ; +SR en Difficile ; +UR en Très difficile (bandes des modes : Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L). Les tirages du jour se font parmi les raretés débloquées.
- UI : le rayon marchand affiche les 3 offres du jour (prix, rareté, mention verrouillée si palier non atteint), plus le catalogue complet.
- Preuve : tests (rotation seedée, déblocage par mode bouclé, prix), smoke section neuve, digest inchangé attendu.

## Lot C2 — Sirènes des Récifs (13e famille de monstres)

- 8 cartes C→L, voies **Chant/contrôle** et **Récifs/dégâts** ; uniques nommées **L Méliane** et **L Thalassa** ; **pas de M**.
- École + sorts de lignée complets, conformes à la structure v3 (tronc C→UC→R→SR, 2 voies, 6 sorts par carte).
- Intégration au bestiaire des Marées (vagues des donjons + rencontres d'errance `zone-marees`).
- Preuve : validateur vert, tests, **digest re-mesuré** (les vagues changent) → MESURE consignée, PAS de recalibrage.

## Lot C3 — gobelins régionaux

- Une seule famille gobelin (foyer aux Marées) ; variantes régionales 2-3 cartes en ligne directe rapide dans les autres donjons ; premier test : **Gobelin des Fumées à la Forge** ; **pas de M gobelin**.
- Preuve idem C2 (digest re-mesuré, MESURE).

## Lot C4 — Clergé du Plein Jour

- **Apolline, Prophétesse du Jour** passe en **M** (fusion Célestin + Justine) ; nouvelle **L Justine, Justicière du Jour** ; le Zénith porte 2 M.
- Renommages/fusions d'affichage seuls ; courbes inchangées sauf nécessité de cohérence ; migration non destructive si des ids bougent.

## Lot C5 — greffe des 31 solos archivés (ACTÉ 11/11)

- Chaque solo archivé (11 C, 6 UC, 7 R, 7 SR) rejoint une **famille d'accueil** (école/zone), avec crans et voies alignés sur la structure v3.
- Les cibles d'évolution existantes (`evolutions.json`/`solo-steps.json`) sont préservées : une carte qui évolue vers un ex-solo atterrit dans la famille, plus dans les archives.
- Garde anti-doublon de nom complet (EXI-DATA-3) respectée.

## Lot C6 — familles compagnons (7 UR + 7 L)

- Graines des deuxièmes voies : les branches de forge des compagnons (Yuki, Onyx, Naïfa, Aïna, Roc, Ember, Sylve).
- 7 familles (UR + L nommée unique chacune), entrées depuis l'existant, conformes à la structure v3.

## Lot C7 — familles divines joueur + lignées d'accueil des Enge

- **Arbitres du Seuil, Chœur Miroir, Tisseuses du Pont** : déjà posées côté monstres (d1-d18) → rendues **jouables côté joueur**.
- Les trois portes du Jeune Séraphin ont leurs maillons à poser (l'événement d'équilibre p1 → d6 Kairos est déjà en place).
- **Lignées d'accueil des Enge** : Sirène Nouvelle, Gorgonne Nouvelle, Fée Nouvelle (communes de la Crypte).

## Lot C8 — clôture

- Validateurs verts, tables régénérées (`node tools/gen-tables.mjs`), CHANGELOG/HISTORY.
- Digest **re-mesuré** N = 3000 + N = 10 000 : nouvelle baseline consignée en MESURE (sha attendu différent : vagues et catalogue changent), PAS de recalibrage (baseline joueur verrouillée).
- Protocole `docs/validation-ihm.md` joué ; validation téléphone + PC par Marc-Olivier.

## Campagne d'arts série 3 (couloir design, en parallèle du code)

- **Arts complets par objet d'équipement (TRANCHÉ 11/11)** : ~90 pièces (5 sets × 6 pièces × 3 paliers), la planche d'icônes est abandonnée.
- **Arts des nouvelles cartes v3** : Sirènes 8, gobelins ~8, Clergé 2, compagnons 14 (7 UR + 7 L), divines ~18, Enge 3, solos regreffés 31 — estimation ~85, le compte exact se fixe depuis le delta du manifeste.
- Même pipeline que la vague 3 : WAI-Illustrious v17, prompts NL painterly (`docs/images/correction-prompts-v3.md`), références verrouillées pour les nommées (IPAdapter depuis les sommets), genre verrouillé par nommée, `species-map.json`, zéro texte dans l'art, palettes par donjon, budgets §13, masters hors repo, manifeste unique `assets-v3.json`, diffusion CI Pages.
- Livraison en 2 vagues : (v1) cartes v3, (v2) équipement ; intégration au manifeste + vérification smoke (image présente par carte).