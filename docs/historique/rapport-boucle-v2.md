# Rapport de clôture — chantier boucle de jeu v2 (11/11/2026)

Spec de référence : `docs/design/boucle-v2-spec-plan.md`. Arbitrages ACTÉ : `docs/arbitrages.md` (entrées du 11/11). Chantier exécuté en 6 lots, un commit par lot sur `main`.

## Lots livrés

| Lot | Contenu | Commit | Digest (N=3000) |
| --- | --- | --- | --- |
| 1 | Potions + action 🧪 Objet, or (1 ⚡ = 1 or), rayon potions Boutique, persistance PV/mana dans le run, régén après le boss d'étage 5, soins entre runs, hook autel de soin, migration v21 | `25fd0e1` | inchangé `aed250f9…` 1274/3000 |
| 2 | Niveaux de donjon 1→25, bandes de rareté par marche (C→R … UR→M), bestiaire par bande, sélecteur « Nv X » | `bc2bd2f` | `f72106ff…` 1379/3000 (0 exc., 1 marathon) |
| 3 | Départ à 2 cartes (4 propositions, 1 choisie + 1 aléatoire), recrutement naturel ~1 % par zone, toast, migration v22 | `fd8699e` | inchangé `f72106ff…` |
| 4 | Drops v2 (matériaux de zone, pièce + matière garanties sur boss, équipement 2 %, gemmes brutes vendables), écran Récompenses cliquable, Inventaire groupé, équipement 2 slots carte + 2 slots équipe + bonus de set, migration v23 | `bc36cba` | inchangé `f72106ff…` |
| 5 | XP recalibrée (`XP_GROWTH` = 0.25), palier d'évolution sans perte nette vérifié par simulation (`noLossPctOf`), 31 solos archivés, rang N exclu des drops/recrutement (éveil N→C par la pierre d'éveil inchangé) | `6eefe99` | inchangé `f72106ff…` |
| 6 | Baseline finale + docs + clôture | voir `main` | **N = 10 000 : `3f9fe198…` 4558/10000, 0 exception, 1 marathon** |

## Chaîne de preuve finale

- `node build.mjs` : ok (dist.html régénéré, jamais édité à la main).
- `node --test` : **128 tests verts** (aucun test perdu depuis le début du chantier : 115 → 128).
- `node smoke-ui.mjs` : **210 checks**, 5 sections B1–B5 vertes ; seuls les 2 échecs préexistants sur main avant le chantier (46 g attaque portée, 45 e bandeau — sensibles au timing, hors périmètre).
- `node combat-digest.mjs dist.html 3000` : `f72106ff…` 1379/3000 — inchangé des lots 3 à 6.
- `node combat-digest.mjs dist.html 10000` : **`3f9fe198ab3babea20f56a4f1214ff4905468d0dc8c4990280c88408f90a9e5e` — 4558/10000 (45,6 %), 0 exception, 1 marathon** → nouvelle baseline, consignée dans `docs/arbitrages.md` et `docs/roadmap.md`.
- `node tools/gen-tables.mjs` : tableaux à jour (`docs/tables/`).
- Sauvegardes : migrations non destructives v20 → v23 (chaîne complète dans `src/engine/migrate.js`), version courante 23.

## Hors périmètre respecté

Pas d'écran d'errance top-down (seul le hook `autelDeSoin()` est posé, contrat `docs/design/errance-topdown.md` §7-§8) ; pas de craft en ville, Boutique complète, marchand, Guilde, quêtes ; pas de retouche des maths pour le digest (mesure pure) ; contenu v3 restant et IA de combat laissés aux chantiers suivants (roadmap points 6 et 10).

## Ouvertures consignées (PROPOSÉ dans arbitrages)

- Solos archivés encore cibles d'évolution (`evolutions.json`) : greffe à des familles en roadmap contenu v3 plutôt que de casser les évolutions.
- Défi du jour (`drawDailyCommon`) peut encore tirer du rang N : source de N hors drops, conforme à l'arbitrage.
- Équilibrage final (Zénith, taux global, prix des potions) : tranché une seule fois après ce chantier et l'économie v2, sur la base de la nouvelle baseline `3f9fe198…`.
