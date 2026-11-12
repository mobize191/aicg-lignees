# Prompt — correctifs v1.38 : XP des combats de zone + aléatoire PAR COMBAT (retours terrain de Marc-Olivier, 12/11 9e tour)

> Statut : ACTÉ/TRANCHÉ par Marc-Olivier (12/11, 9e tour). Couloir 1 : exécute après la vérification de PR #8 + PR #9 (livrées, preuves rejouées par le couloir pilotage : 196 tests, smoke 394 checks avec les 3 échecs préexistants, digests inchangés). Une tâche = un commit FR. Preuve par lot : build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests INCHANGÉS.

## Contexte (diagnostiqué et vérifié sur main `735e70d` par le couloir pilotage)

Marc-Olivier a enchaîné « plein, plein de combats » dans les Terres Sauvages :

1. **Zéro XP** : ses cartes n'ont pas monté d'un niveau, zéro XP affiché, après des dizaines de rencontres. Racine vérifiée dans `src/ui.js` : l'XP de run n'est accordée que si `(!won || finalClear)` (fin de run : défaite ou dernier étage du donjon). Une victoire de combat de zone n'est NI l'une NI l'autre → **l'XP n'est jamais distribuée pour les rencontres des Terres Sauvages**, ni pour la porte du donjon de zone.
2. **Toujours les mêmes monstres** : le seed de vague `waveSeedFor(donjon, diff)` = hash de `jour|donjon|diff` → **la même vague toute la journée** (il a combattu 6 fois le même duo Chanteuse + Pillard). TRANCHÉ par Marc-Olivier : « chaque combat doit être différent — l'aléatoire se lance PAR COMBAT ».
3. **Taille des vagues TRANCHÉE** : 2-3 monstres par combat en début de jeu (c'est déjà le calibre de `makeWave` à l'étage 1 : 2 + parfois 1, pas de support à l'étage 1) ; on augmentera plus tard, un peu à la fois, avec la progression (après la session 1→100). Prévoir la taille en data pour un ajustement sans toucher le moteur.

## Lots

### Lot 1 — XP des combats de zone (critique : progression bloquée en errance)

- Tout combat de zone terminé, **victoire OU défaite**, distribue l'XP d'une étage de run à l'équipe, avec la formule existante (`DIFFX.pts × 1,5 (victoire) × 0,8 × tactXpMult`, bonus découverte éventuel) : ligne ⭐ XP à l'écran Récompenses et `pushRecomp`, comme en donjon. La porte du donjon de zone (victoire) fait de même.
- Réutiliser le chemin existant (le bloc XP de fin de run) plutôt qu'un second mécanisme : au dernier événement d'un combat de zone, forcer la résolution de l'XP (`runLog.stages` valant 1) AVANT le retour à l'errance.
- **Garde-fous tests headless** : victoire de zone → l'équipe gagne de l'XP (assert avant/après sur `inst.xp`/niveau) ; défaite de zone aussi ; un run de donjon classique reste inchangé (XP cumulée en fin de run uniquement).
- **Digests inchangés attendus** : l'XP est un flux UI/progression, le digest rejoue le moteur headless avec ses propres seeds. À confirmer par preuve standard.

### Lot 2 — Aléatoire PAR COMBAT + taille de vague en data

- **Seed par combat** : `startZoneFight` incrémente un compteur **persisté dans la sauvegarde** (`store.zoneFightCount`), et le seed de la vague de zone devient `hash(jour|donjon|diff|zoneFightCount)` → chaque rencontre est différente, reproductible dans une sauvegarde donnée (déterminisme conservé pour les tests). Les combats de donjon classique gardent leur seed d'étage inchangé.
- **Taille en data** : ajouter `errance.waveSize` (par zone, défaut 2-3 : l'actuel `makeWave` étage 1) dans `data/zones.json`, consommé par la génération des vagues de zone ; la croissance future (4-5 monstres, supports, puis plus) se tranchera après la session, en data uniquement.
- **Garde-fous tests headless** : deux combats de zone consécutifs produisent deux vagues distinctes (ids/niveaux des monstres comparés) ; le même état rejoué produit la même séquence (déterminisme) ; `errance.waveSize` respecté (2-3 au début).

## Contraintes et hors périmètre

- `data/*.json` source de vérité ; `dist.html` via `node build.mjs` ; re-fetch avant chaque édition ; zéro dépendance npm.
- **Digests INCHANGÉS attendus** : `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.
- Hors périmètre : équilibrage de l'XP (formule inchangée, seule la distribution aux combats de zone s'ajoute), maths de combat, ENC_RATE, architecture donjons × errance (session).
- Consigner chaque lot dans `docs/arbitrages.md` (entrée en haut), CHANGELOG v1.38, roadmap à jour, protocole IHM si un écran change (écran Récompenses de zone).
