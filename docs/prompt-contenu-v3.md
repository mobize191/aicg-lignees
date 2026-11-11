# Prompt de lancement — chantier « contenu v3 » (8 lots)

> Prompt auto-suffisant pour le couloir 1. Spec et plan détaillés : `docs/design/contenu-v3-spec-plan.md`. La campagne d'arts série 3 (cartes v3 + équipement) est un livrable du couloir design en parallèle, hors périmètre du code.

---

Tu codes sur le repo `aicg-lignees` (branche `main`). Lis d'abord `AGENT.md`, puis `docs/design/contenu-v3-spec-plan.md`, `docs/design/familles-races-v3.md`, `docs/arbitrages.md` (tranchages du 11/11 + structure d'une famille v3 du 10/11) et `docs/roadmap.md` point 6.

**Règles absolues** :

- `data/*.json` = source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm.
- **Re-fetch systématique avant chaque édition** : d'autres couloirs poussent aussi sur `main`.
- Une tâche = un commit français ; toute décision dans `docs/arbitrages.md` avec date et statut ; migrations non destructives versionnées.
- **Aucun recalibrage** : la baseline est verrouillée (ACTÉ 11/11). Les lots qui changent les vagues (C2, C3, C5) re-mesurent le digest et consignent une MESURE, sans toucher aux maths d'équilibrage.

**Chaîne de preuve à chaque lot** : `node build.mjs§` ; `node --test` (≥ 144 verts) ; `node smoke-ui.mjs dist.html` (≥ 294 checks, échecs préexistants 46 g/45 e tolérés) ; `node combat-digest.mjs dist.html 3000` (inchangé attendu SAUF lots C2/C3/C5 : re-mesure + MESURE). Clôture : digest 3000 ET 10000.

**Les 8 lots, dans l'ordre** :

1. **Marchand v2** : 3 offres/jour (rotation `seedOfDay` comme la Guilde), prix C 200 / UC 1 500 / R 4 500 / SR 8 000 / UR 10 000 or, raretés débloquées par difficulté de donjon bouclée (C départ ; +UC Facile ; +R Normal ; +SR Difficile ; +UR Très difficile). L/M/nommés hors vente, limite 3 exemplaires. (tranché 11/11, arbitrages)
2. **Sirènes des Récifs** : 13e famille de monstres, 8 cartes C→L, voies Chant/contrôle et Récifs/dégâts, L Méliane et Thalassa, pas de M ; intégration aux vagues des Marées + errance. Digest re-mesuré + MESURE.
3. **Gobelins régionaux** : famille unique (foyer Marées), variantes 2-3 cartes par région, premier test Gobelin des Fumées (Forge), pas de M. Digest re-mesuré + MESURE.
4. **Clergé du Plein Jour** : Apolline, Prophétesse du Jour en M (fusion Célestin + Justine), nouvelle L Justine, Justicière du Jour ; Zénith à 2 M.
5. **Greffe des 31 solos archivés** (11 C, 6 UC, 7 R, 7 SR) dans des familles d'accueil ; cibles d'évolution préservées, plus d'atterrissage en archives. Digest re-mesuré + MESURE.
6. **Familles compagnons** (7 UR + 7 L) : graines = branches de forge (Yuki, Onyx, Naïfa, Aïna, Roc, Ember, Sylve).
7. **Familles divines joueur** (Arbitres du Seuil, Chœur Miroir, Tisseuses du Pont, déjà posées en monstres d1-d18) + maillons du Jeune Séraphin + **lignées d'accueil des Enge** (Sirène Nouvelle, Gorgonne Nouvelle, Fée Nouvelle, communes de la Crypte).
8. **Clôture** : validateurs, tables (`node tools/gen-tables.mjs`), CHANGELOG, digest 3000 + 10000 en MESURE, protocole `docs/validation-ihm.md`, validation téléphone + PC par Marc-Olivier.

**Critères d'acceptation finaux** : build + tests + smoke verts, validateur data vert (anti-doublon de noms), digest re-mesuré et consigné sans recalibrage, parcours IHM S1-S20 sans KO bloquant.