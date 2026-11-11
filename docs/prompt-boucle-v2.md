# Prompt de lancement : le chantier boucle de jeu v2

> À copier au début de la session agent (Vibe, Claude Code, Cursor, OpenCode...). Toutes les règles sont déjà tranchées et consignées (`docs/arbitrages.md`, 11/11/2026) : ce chantier est de l'exécution. La spec de référence est `docs/design/boucle-v2-spec-plan.md` — elle fait foi en cas de doute.

---

Tu travailles sur **AICG : Lignées** (repo GitHub `mobize191/aicg-lignees`, branche `main`), un jeu de cartes solo 100 % navigateur. Le jeu embarqué est `dist.html`, généré par `node build.mjs` depuis `src/` + `data/`.

## Mission

Implémenter la **boucle de jeu v2**, intégralement ACTÉE, en 6 lots dans l'ordre. La spec détaillée (exigences moteur/data/UI, plan) est `docs/design/boucle-v2-spec-plan.md` : lis-la en premier, elle fait foi.

1. **Lot 1 — Potions, régénération, persistance** : action « Objet » dans la fenêtre d'action (potions de soin 30/60 % et de mana 40/80 %, chaque gorgée coûte son tour, utilisables aussi entre les étages) ; point d'achat minimal (conversion 1 ⚡ = 1 or, rayon potions) ; suppression de la régénération entre les combats d'un même run (PV/mana persistants, effets temporaires dissous entre combats) ; régénération complète après le premier boss ; soins complets entre deux runs distincts ; hook « autel de soin » pour l'errance future ; migration de sauvegarde (version +1 : potions, or, état de run).
2. **Lot 2 — Niveaux de donjon 1 → 25** : chaque marche (donjon × mode) porte un niveau, une bande de rareté (Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M ; boss final haut de bande, intermédiaire un cran sous) et un bestiaire thématique croissant par mode ; le sélecteur de marche affiche niveau et bande.
3. **Lot 3 — Départ à 2 cartes + recrutement naturel** : écran de départ (4 propositions une par race : novice humain, bestial, mystique, divin ; 1 choisie + 1 aléatoire parmi les 3 restantes) ; ~1 % de chance qu'un vaincu (hors nommés et boss) rejoigne la collection, taux par zone dans `data/zones.json`, toast de recrue.
4. **Lot 4 — Drops v2 + Récompenses + inventaire minimal** : matériaux de zone sur les monstres, pièce et matière garanties sur les boss, équipement à taux très faible partout, gemmes brutes vendables ; **écran « Récompenses » après chaque combat** (or, XP, drops aux couleurs de rareté, recrue ; chaque élément cliquable, « Tout ramasser ») ; page Inventaire groupée ; équipement sur la fiche (2 slots personnage + 2 slots d'équipe, pièces éligibles au clic, stats base + bonus %, bonus de set).
5. **Lot 5 — Progression** : XP classique recalibrée sur l'échelle longue (simulée au digest) ; palier d'évolution sans perte nette (vérifié par simulation, pas à la main) ; solos archivés (hors pool actif, en data pour les sauvegardes) ; rang N des naissances achevé : éveil N→C par la pierre d'éveil (T1.2) et exclusions des drops et du recrutement — vérifie d'abord l'état courant (T1.1 du grand chantier a peut-être déjà migré les raretés N), toujours jouables en combat.
6. **Lot 6 — Baseline finale** : digest documenté dans `docs/arbitrages.md` (N = 10 000, exceptions et marathons à 0), nouvelle baseline dans `docs/roadmap.md`, build/tests/smoke verts, `docs/regles-jeu.md` à jour.

### HORS PÉRIMÈTRE (ne pas coder)

- **L'errance** : seul le hook « autel de soin » est posé ; aucun écran top-down (chantier d'après, selon `docs/design/errance-topdown.md`).
- **Le craft en ville, la Boutique complète, le marchand, la Guilde, les quêtes** : bloc visuel (roadmap point 9). Seul le rayon potions minimal est dans le Lot 1.
- **L'équilibrage final** : Zénith, taux global, prix des potions — tranchés une seule fois après ce chantier et l'économie v2. Le digest de chaque lot est une **mesure**, pas un objectif à atteindre en touchant aux maths.
- **Le contenu v3 restant** (compagnons, Enge, divines joueur, nommées) et **l'IA de combat** (roadmap point 10) : d'autres chantiers.

## Ordre de lecture (avant toute ligne de code)

1. `docs/design/boucle-v2-spec-plan.md` : la spec qui fait foi.
2. `docs/arbitrages.md` : entrées du 11/11 (« boucle de jeu v2 », « calibrage post-lignes et précisions boucle v2 », « écran de Récompenses, inventaire minimal, errance », « sets d'équipement par zone »). Ne contredire aucun ACTÉ.
3. `docs/regles-jeu.md` §2, §5, §6 ; `docs/design/economie-v2-catalogues.md` §1, §2, §5, §6 ; `docs/design/errance-topdown.md` §7-§8 (le contrat du hook autel).
4. Dans `src/` : repérer la régénération d'avant combat, le flux de donjon (étages, boss), la fenêtre d'action, le sélecteur de donjon, le module de sauvegarde et ses migrations.

## Règles d'or

- **Aucune valeur de design dans `src/`** : taux, prix, bandes, courbes d'XP, pools de bestiaires vivent dans `data/*.json` (test allowlist). Une nouvelle constante = une entrée dans `data/engine.json` ou le bon `data/*.json`.
- `dist.html` n'est jamais édité à la main ; zéro dépendance ; les ids de sorts et de cartes ne changent pas.
- **Migrations de sauvegardes** : version +1, jamais destructives ; les vieilles sauvegardes restent jouables.
- **Chaque lot qui change les maths = digest recalculé et consigné** dans `docs/arbitrages.md` (mesure datée, N, victoires, exceptions, marathons). Ne modifie pas les maths pour « améliorer » le digest : les arbitrages d'équilibre restent ouverts jusqu'à la re-mesure finale.
- Mobile d'abord : cibles de tap ≥ 32 px, aucun panneau plein écran sans bouton de fermeture.
- Non-régression : FX v0.48 (toggle 🎬), ciblage v2, anti-runs fantômes, limite 3 exemplaires.
- **Re-fetch `docs/arbitrages.md` et `docs/roadmap.md` avant chaque édition** : d'autres couloirs poussent aussi sur main.

## Chaîne de preuve (à chaque lot)

1. `node build.mjs && node --test` → au moins 115 tests verts.
2. `node smoke-ui.mjs` → au moins 171 checks verts, plus les nouveaux checks du lot (Objet, persistance, sélecteur, départ, Récompenses, Inventaire).
3. `node combat-digest.mjs dist.html 3000` (et un pack N = 10 000 au Lot 6) → digest noté dans `docs/arbitrages.md` et `docs/roadmap.md` pour chaque lot qui change les maths.
4. Si `data/` a bougé : `node tools/gen-tables.mjs` puis commit des tableaux.
5. `docs/regles-jeu.md` passe les règles du lot à « implémenté » ; `docs/roadmap.md` état + historique.

## Discipline

- Un lot = un ou plusieurs commits français, une préoccupation par commit, message court à l'impératif.
- Design ambigu : note la question dans `docs/arbitrages.md` (statut PROPOSÉ) et prends l'option la plus conservatrice en attendant.
- Chantier clos : rapport dans `docs/historique/`.
- Ne revendique jamais un succès sans la sortie de la preuve qui l'établit.

## Collaboration

- Réponds en français, itérations courtes : on montre vite, on corrige vite.
- Marc-Olivier tranche les arbitrages ; tout le reste est de l'exécution autonome.
