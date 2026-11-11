# Rapport de clôture — chantier économie v2 (11/11/2026)

Bloc visuel roadmap point 9, première tranche : l'économie v2 (or, Boutique complète, marchand de créatures, Guilde, quêtes quotidiennes, suppression des jetons). Spec : `docs/design/economie-v2-catalogues.md` (ACTÉ 11/11). Le craft en ville et le rayon équipement complet de la Boutique restent au bloc visuel hub-ville.

## Lots livrés (sur `main`)

| Lot | Contenu | Commit |
| --- | --- | --- |
| E1 | Boutique complète : potions + éclats bruts (150 or) + rayon équipement (60 pièces `source: boutique`, 200-1 600 or) | `6073aff` |
| E2 | Marchand de créatures (rayon 🐾 Boutique) : monstres non nommés C→UR, 200→10 000 or (`data/marchand.json`), limite 3 ex. | `6a9ac21` |
| E3a | Forge → **Guilde** : compagnons du jour (3 offres, rotation seed de la date, C 500 → UR 2 000 or, L/N exclus) | `b90a851` |
| E3b | **Jetons de génération supprimés** : plus d'octroi, `JETON_RARITY` retiré, migration v25 (conversion en or selon `JETON_OR`, taux PROPOSÉ) | `f66f070` |
| E4 | **Quêtes quotidiennes** (page 📜 Quêtes, 3/jour rotation seed, or + carte N 1 jour/3 + bonus 1 pierre d'éveil, défi du jour supprimé, migration v24) | `b44f7b6` |
| E5 | Clôture : docs, baseline, rapport | ce commit |

## Chaîne de preuve finale

- `node build.mjs` : ok. `node --test` : **134 tests verts**. `node smoke-ui.mjs` : **243 checks**, sections B6-B10 vertes (2 échecs préexistants hors chantier : 46 g, 45 e).
- Digest : **inchangé** sur toute l'économie v2 (hors combat) — pack 3000 `f72106ff…` 1379/3000 ; pack **N = 10 000 : `3f9fe198…` 4558/10000 (45,6 %), 0 exception, 1 marathon**, même baseline que la clôture boucle v2.
- Migrations : v24 (quêtes), v25 (jetons → or), non destructives, testées (idempotence incluse).

## PROPOSÉ en attente de Marc-Olivier

- Paliers intermédiaires du marchand de créatures (UC 600, R 1 800, SR 4 000 or) — bornes C 200 / UR 10 000 seules actées.
- Taux de conversion des jetons en or (`JETON_OR` : C 100 → UR 5 000 or).

## Reste (bloc visuel suivant)

Craft en ville (matériaux + or pour les paliers hauts), page Personnage à onglets (Équipe + Inventaire) avec la maquette hub-ville, puis Accueil/hub-ville + Les Terres Sauvages, puis l'errance top-down.
