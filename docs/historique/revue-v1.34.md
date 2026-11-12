# Revue du couloir pilotage — v1.34 (correctifs ciblage + refonte de l'IA), 12/11/2026

> Objet : revue indépendante de la livraison (commits `318c82d` à `fdc0622`, merge v1.34). Méthode : preuves REJOUÉES depuis des tarballs (main, `c9f39e2` pré-chantier, `be110d9` v1.32), pas de confiance accordée aux claims. Verdict : **conforme, chantier livré proprement ; aucun régression ; 4 livrables du programme restent à faire** (voir fin).

## 1. Preuves rejouées sur main (v1.34)

- **Build** : ok, `dist.html` 743 883 caractères, 23 fichiers de données.
- **Tests** : `node --test` = **171/171 verts** (claim : 171 — conforme).
- **Smoke** : `node smoke-ui.mjs dist.html` = **306 checks, 303 PASS, 3 échecs** — les 3 échecs sont **identiques à v1.32 (`be110d9`) et à l'état pré-chantier (`c9f39e2`)**, comparaison jouée : « 40 victoire pas-à-pas 100 % manuelle », « B1 g la gorgée soigne le porteur », « B7 b achat monstre C » → **zéro régression du chantier** ; la section B16 (refonte IA, 7 checks dont l'anti-triche par introspection) est entièrement verte.
- **Digest N = 3000 rejoué** : `c62fcbd1…` **1281/3000**, 0 exception, 0 marathon (claim identique). Écart vs mesure de lancement du chantier (`f8a9f0bb…` 1359/3000) : **−2,6 points, dans la tolérance ≤ 5**.
- **Digest N = 10 000 rejoué** : `5059e683…` **4236/10000**, 0 exception, 0 marathon (claim identique). Écart vs `978ed44b…` 4517/10000 : **−2,8 points, dans la tolérance**. Les maths joueur n'ont pas bougé : la baisse vient de l'IA (ennemis plus malins + Auto joueur soigne/burst mieux, combats plus longs).

## 2. Bug signalé par Marc-Olivier (ciblage ligne arrière) : réparé de bout en bout

Reproductions du diagnostic rejouées sur le moteur livré :

- **A** : les **84/84 sorts de lignée** ont un camp (plus aucun null) ; `spellSideOf` parse « la zone » (→ zone) et « les renforts » (→ team). Le champ `cible` est bien en data.
- **B** : ligne arrière + sort de dégâts : la **cible ennemie désignée est honorée** (plus de liste d'alliés proposée : fin du fallback sur le kind de ligne, filet par rôle).
- **C** : ligne arrière + sort de soin de lignée sur un allié blessé : **l'événement heal est produit** (le sort n'est plus muet). Nuance relevée : à pleine santé, aucun événement heal n'est émis (comportement normal du cap de soin).

## 3. Revue du code livré

- **Lot 1 (ciblage)** : utilité partagée IA/Mode Auto (kill possible, menace, ligne, opposition) + **hystérésis anti flip-flop** (conservation de la cible en cours au bord du seuil) — conforme au prompt et au skill compagnon.
- **Lot 2 (pickSpell)** : choix contextuel (soin sous seuil / contrôle menace / burst kill / efficacité-coût) + hystérésis, poids en data.
- **Lot 3** : profils IA par difficulté **en data** (`difficulties.json`, champ `ia` : Facile volontairement sous-optimal → Enfer utilité complète), **graine IA dédiée déterministe** — les MESURES par lot sont reproductibles.
- **Lot 4** : garde-fous anti-blocage de l'errance (stagnation → repath → abandon après échecs, constantes en data) — ne touche ni le décor ni la structure des zones, conforme à l'interdit du prompt.
- **Anti-triche** : check B16 a par introspection de la source du moteur (aucune lecture d'information hors état public) — vert.
- **Honnêteté des consignations** : CHANGELOG v1.34 précis (y compris « 3 échecs préexistants » assumés), arbitrages complets (MESURE par lot, Porte A consignée avec les défauts de session, proposition de verrouillage de la nouvelle baseline).

## 4. Ce qui reste à faire (non livré par ce chantier, à replanifier)

1. **Correctifs lots 4-5** (bugs rapides IHM du prompt correctifs) : détails d'une carte si équipe pleine, ajout involontaire à l'équipe au double-clic/appui long, fiche des sorts complète, collections au propre.
2. **Les 4 specs des ACTÉS du 11/11 nuit** (Phase 2 de `docs/prompt-activites-immediates.md`) : sets d'équipement, navigation/hub, Boutique+Inventaire onglets, gating — aucune n'est encore écrite.
3. **Les 3 échecs smoke préexistants** (inscrits à la liste de bugs de la roadmap à cette occasion) : la gorgée qui ne soigne pas (B1 g), l'achat de monstre C à la Guilde (B7 b — à réévaluer de toute façon avec la spec gating : l'hôtel de génération est ACTÉ supprimé), la victoire pas-à-pas manuelle en 40 tours (40).
4. **Décisions de Marc-Olivier** : validation téléphone ET PC de v1.34 ; tranchage du **verrouillage de la nouvelle baseline** (`c62fcbd1…`/`5059e683…`) ; la session de tranchage (identité, lore, architecture donjons×errance, élément des cartes, niveaux 1→100 — les défauts de la Porte A ont été appliqués en attendant).

## 5. Verdict

**Conforme.** Le chantier a tenu toutes ses contraintes (digest dans la tolérance, MESURES consignées, anti-triche, symétrie IA/Auto, un commit français par lot). Les écarts de digest sont dans la tolérance actée et exclusivement dus à l'IA, aucune maths joueur n'a bougé. Le couloir 1 peut enchaîner sur les lots 4-5 et les specs, sans urgence de tranchage pour ces deux postes.
