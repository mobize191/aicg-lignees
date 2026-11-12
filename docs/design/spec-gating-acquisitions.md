# Spec D — Gating global des acquisitions par la progression

> Statut : **PROPOSÉ** (12/11/2026) — rien ne se code avant la session de tranchage. ACTÉ du 11/11 nuit (arbitrages, point 4 ; doc de session §8) : **gating global des acquisitions par la progression** (« tu as débloqué telle zone → droit à tel type de carte »), répété trois fois par Marc-Olivier ; l'hôtel de génération (compagnons) est supprimé de la Guilde ; les compagnons actuels sont jugés pas assez chers et trop forts dès le début. Prompt : `docs/prompt-activites-immediates.md` (Phase 2, spec D). Trame : `docs/design/contenu-v3-spec-plan.md`.

## Contexte (état actuel v1.34)

- Mécanisme qui fait foi : le **marchand de créatures v2** (ACTÉ, lot C1) — 3 offres/jour en rotation `seedOfDay`, raretés débloquées par **difficulté de donjon bouclée** (`data/marchand.json` `debloqueParDiff` : C dès le départ, UC après un donjon bouclé en Facile, R en Normal, SR en Difficile, UR en Très difficile), prix actés C 200 / UC 1 500 / R 4 500 / SR 8 000 / UR 10 000 or, limite 3 exemplaires. UI : cadenas 🔒 avec la difficulté requise (`raretesMarchandDebloquees`).
- Guilde (ex-Forge, v1.25) : **compagnons du jour** — 3 offres/jour (`seedOfDay`), prix `data/guilde.json` C 500 / UC 800 / R 1 200 / SR 1 600 / UR 2 000 or, max 3 ex., rang L jamais recrutable. Plus d'hôtel de génération (déjà supprimé).
- Autres acquisitions non gated aujourd'hui : Boutique (potions 50–140 or, éclats 150 or, équipement 200–1 600 or), quêtes (récompenses or/carte N/pierre/éclat), recrutement naturel en combat (~1 % par zone).

## Périmètre ACTÉ (s'applique tel quel)

1. **Gating global** : marchand, boutique et acquisitions de cartes ne proposent que ce que la progression débloque. Clé proposée : **donjon bouclé** (mécanisme marchand v2).
2. Hôtel de génération supprimé (déjà fait) ; sort des compagnons du jour à trancher (deux options chiffrées ci-dessous).
3. Compagnons recalibrés (prix, raretés, statistiques) — marquage « à re-mesurer » après la partie à zéro de Marc-Olivier (106 000 or en poche sur la partie de test : l'or se dilue).

## Proposition détaillée

### Table de gating (en data, une seule clé : donjon bouclé)

Proposition `data/gating.json` (nouveau) : `debloqueParPalier` = paliers de donjons bouclés (0 = départ, 1 = 1er donjon Facile, 2 = Normal, 3 = Difficile, 4 = Très difficile, 5 = Enfer) → ce qui se débloque :

| Palier bouclé | Boutique | Marchand | Guilde (compagnons) | Quêtes |
|---|---|---|---|---|
| 0 (départ) | potions, éclats C | C | C | inchangé |
| 1 (Facile) | + équipement C/UC | + UC | + UC | inchangé |
| 2 (Normal) | + équipement R | + R | + R | + carte N du jour |
| 3 (Difficile) | + équipement SR | + SR | + SR | + éclat bonus |
| 4 (Très difficile) | équipement complet | + UR | + UR | inchangé |
| 5 (Enfer) | — | — | — | — |

- Un seul mécanisme (`debloqueParDiff` du marchand) étendu à tous les rayons ; UI identique (cadenas 🔒 + mention du déblocage) partout.

### Compagnons du jour — les DEUX options chiffrées

- **Option (a) — suppression** : les compagnons du jour disparaissent de la Guilde (coût : 0 offre/jour ; la Guilde ne garde que évolutions + autel). Le recrutement de cartes non-monstres passe alors par les quêtes (carte N 1 jour/3) et les naissances.
- **Option (b) — gardés, gated, plus chers, recalibrés** (recommandation du doc de session : ils servent le scouting façon Dragon Quest Monsters) : 3 offres/jour conservées, **gated comme le marchand** (C au départ, +UC/R/SR/UR par palier bouclé), prix ×2 : **C 1 000 / UC 1 600 / R 2 400 / SR 3 200 / UR 4 000 or** (contre 500→2 000), puissance recalibrée (stats des compagnons −10 %, à re-mesurer au digest après la partie à zéro), toujours max 3 ex. et L jamais recrutable.

### Recalibrage général

Aucun prix ne bouge dans cette spec hors option (b) des compagnons ; le recalibrage de l'économie (or dilué) est **à re-mesurer** après la partie à zéro de Marc-Olivier, puis tranché en session avec MESURE digest.

## Lots proposés

- **D1 (data + moteur)** : `data/gating.json`, extension de `debloqueParDiff` à la Boutique (potions/éclats/équipement par palier) et aux acquisitions de cartes ; UI cadenas uniforme.
- **D2 (Guilde)** : selon le choix de la session — option (a) suppression des compagnons du jour, ou option (b) gated + prix ×2 + stats −10 % ; migration de sauvegarde non destructive dans les deux cas.
- **D3 (clôture)** : tests, smoke, protocole IHM, CHANGELOG/HISTORY/roadmap.

## Preuves attendues

- Tests headless : table de gating (palier 0 → seule la rareté C est débloquée partout ; palier 3 → SR débloqué), option compagnons choisie conforme en data, migration sans perte.
- Smoke : cadenas 🔒 sur les rayons verrouillés, déblocage après donjon bouclé (simulé).
- Digest : **inchangé attendu** (hors combat — MESURE de confirmation ; le digest n'achète rien), baseline v1.34 `c62fcbd1…` 1281/3000 / `5059e683…` 4236/10000.

## Questions ouvertes

- [À TRANCHER — SESSION 12/11] Clé exacte du gating : donjon bouclé (proposé) ? étage précis ? zone d'errance débloquée ? Et la même clé pour tous les rayons, ou des clés par rayon (ex. la Boutique débloquée par zone plutôt que par donjon) ?
- [À TRANCHER — SESSION 12/11] Sort final des compagnons du jour : option (a) supprimés, ou option (b) gated + chers + recalibrés (chiffrage ci-dessus) ?
- [À TRANCHER — SESSION 12/11] Les quêtes (récompenses) entrent-elles dans le gating global, ou restent-elles hors (proposé : hors, elles sont le tutoriel) ?
- [À TRANCHER — SESSION 12/11] Le recrutement naturel en combat (~1 %/zone) est-il gated aussi, ou inchangé ?
