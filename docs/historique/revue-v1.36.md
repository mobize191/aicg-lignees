# Revue du couloir pilotage — v1.36 (correctif panneaux Accueil + refonte visuelle de l'errance), 12/11/2026

> Objet : revue indépendante de la livraison (PR #6 `bcfa8b1` et PR #7 `34cd65c`, merges consignés en `2a39b8c`). Méthode : preuves REJOUÉES depuis un tarball de main (`2a39b8c`), pas de confiance accordée aux claims ; digest rejoué AUSSI sur le site déployé. Verdict : **conforme, les deux chantiers sont livrés proprement ; zéro régression ; un arbitrage consigné ACTÉ (canon Léviathan) à confirmer par Marc-Olivier** (voir §5).

## 1. Preuves rejouées sur main (`2a39b8c`)

- **Build** : ok, `dist.html` 807 047 caractères, 23 fichiers de données.
- **Tests** : `node --test tests/*.test.js` = **175/175 verts** (claim : 175 — conforme). Nuance d'invocation : `node --test tests/` (dossier) accroche un fichier non-test du répertoire (`allowlist.txt`) ; la commande fiable reste `tests/*.test.js`.
- **Smoke** : `node smoke-ui.mjs dist.html` = **360 checks, 357 PASS, 3 échecs** — les 3 échecs sont **les 3 préexistants** (« 40 victoire pas-à-pas », « B1 g la gorgée soigne », « B7 b achat monstre C »), identiques à v1.35. Sections nouvelles : **B20 durci** (visibilité CSS effective des panneaux + 3 branches de l'Accueil) et **B21** (8 checks : palettes distinctes ×5 zones, retour ville ×5, layout v2 Marées, décor construit, HUD phase) toutes vertes.
- **Digest N = 3000 rejoué** : `c62fcbd1…` **1281/3000**, 0 exception, 0 marathon (claim identique).
- **Digest N = 10 000 rejoué** : `5059e683…` **4236/10000**, 0 exception, 0 marathon (claim identique).
- **Digest rejoué sur le site déployé** (`https://mobize191.github.io/aicg-lignees/`, 814 363 octets, contient v1.36 et `errance-paint`) : **mêmes digests `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000** → le site public est exactement le build vérifié, Marc-Olivier peut tester directement.

## 2. PR #6 — correctif panneaux Accueil : conforme

- **CSS vérifié dans le dist** : `.save-box { position: relative; z-index: 30; }` (au-dessus des couches 20/22 du hub, sous le header 40) ; `pointer-events:none` présent sur `.hub-scene` ET `.hub-veil` (tous deux `position:fixed; inset:0`) ; espaceur `.hub-spacer { height: 100dvh }` dans le flux, branche hub uniquement. Les branches bienvenue/départ n'ont pas de scène fixe (vérifié par B20 h2/h3).
- **Faux vert réparé** : B20 a teste désormais la visibilité effective (déclarations CSS du dist) et non plus la seule présence DOM, plus les 3 branches de l'Accueil.
- **Périmètre tenu** : correctif 100 % CSS/IHM, digests inchangés.

## 3. PR #7 — refonte visuelle de l'errance v1.36 : conforme au prompt `docs/prompt-refonte-errance.md`

- **Lot 1 (peinture A+)** : nouveau module `src/errance-paint.js` (340 lignes, pur + canvas), RNG décor déterministe dérivé du seed de zone, pré-rendu unique `paintZoneBase` + re-peinture locale `repaintTile` (3×3) à la casse de jarre. Layout conservé au lot 1 comme exigé. Palette en data (`zones.json` `errance.paint`) avec défauts intégrés.
- **Lot 2 (ambiance §9bis)** : cycle jour/nuit (`ambiance.dayLen` par zone en data : Marées 110 s, Forge 90 s, Bosquet 120 s, Crypte/Zénith 100 s — défaut 100), overlays semi-transparents, puce de phase HUD throttlée, lames animées groupées avec rafale positionnelle et écart au héros, traces de pas, écume, nuages, faune, fumée. **`prefers-reduced-motion` gèle le décor** (vérifié : `motionOK()` sur animT et dt du décor). **Budget respecté : 0 `ctx.filter`, 0 `shadowBlur` dans src/** (grep vide), DPR ≤ 2.
- **Lot 3 (layout v2 + retour ville + sûreté saves)** : `genZoneMap` consomme `errance.layout` (waypoints, étang à l'échelle, 2 huttes, rochers) avec **repli sur le générateur historique** ; **tuile RETOUR présente dans chaque zone, y compris en repli** (vérifié : lignes 82-84 et 133-137 de `src/errance.js`) → retour aux Terres Sauvages. **Sûreté des saves** : `erranceSavedPos` persistée à chaque sortie/arrivée (`persistErrancePos` aux points de save), `rescueHeroPos` recousse la position vers le spawn si la tuile est devenue solide, migration **v28 non destructive** (SAVE_VERSION 28, `v27to28` présent dans la chaîne).
- **Lot 4 (5 zones)** : palettes par nature en data (Forge braises, Bosquet vert profond, Crypte froide, Zénith doré), `dayLen` par zone, smoke B21.
- **Contraintes du prompt toutes tenues** : **ENC_RATE inchangés** (comparaison jouée zone par zone avec `data/zones.json` au commit pré-chantier `000aefa` : 0,16 / 0,17 / 0,15 / 0,18 / 0,20 identiques) ; **sprite WAN conservé** ; **aucune maths de combat ni équilibrage touchés** (digests identiques, l'errance n'entre pas dans le digest) ; **architecture donjons × errance non préjugée** (modules peinture/ambiance/layout réutilisables quel que soit le tranchage de session).
- **Honnêteté des consignations** : CHANGELOG v1.36 précis, arbitrages (SESSION + LIVRÉ + CORRIGÉ), roadmap à jour (points « héros/décor refaits » et « retour ville » barrés FAIT), protocole IHM v1.36 avec scénario S24 (captures comparatives maquette vs jeu, 1440×900 ET 390×844).

## 4. Vérification des docs d'errance de Marc-Olivier (2e envoi)

Maquette A+ et guide reçus le 12/11 (4e tour) : **identiques octet par octet** aux versions déjà intégrées (`docs/design/maquettes/errance-demo-jouable.html` 55 143 octets, commit `d176be5` ; `docs/design/errance-topdown.md` 26 196 octets). Aucune action nécessaire ; si les tailles locales diffèrent, des modifications non envoyées existent.

## 5. Un point à confirmer : arbitrage « canon Léviathan » consigné ACTÉ

Le commit `e82d527` consigne en ACTÉ (attribué à Marc-Olivier) : canon visuel du Léviathan des Marées = le Léviathan du film « Atlantide » (Disney), LoRA **Leviathan XL** retenu (Illustrious natif), Tidehunter DotA2 écarté, dans `docs/images/lora-candidats-v32.md`. **Ce tranchage n'est pas passé par le couloir pilotage** : à confirmer par Marc-Olivier (décision prise via un autre canal → rien à faire ; sinon rétrograder l'entrée en PROPOSÉ). Aucune incidence sur le code du jeu.

## 6. Ce qui reste à faire (hors périmètre des deux chantiers, à replanifier)

1. **Validation téléphone ET PC de Marc-Olivier** : panneaux 💾/🗂 de l'Accueil (le bug corrigé bloquait les parties multiples), panneau « Parties », errance refondue (le plan de test IHM complet est le scénario **S24** de `docs/validation-ihm.md` v1.36, avec captures comparatives maquette vs jeu).
2. **Session de tranchage** (`docs/design/session-qa-direction.md`) : architecture donjons × errance, élément des cartes, niveaux 1→100, identité, lore, nombre d'équipes.
3. **Tranchage du verrouillage de la baseline** `c62fcbd1…` 1281/3000 / `5059e683…` 4236/10000 (proposition en attente ; la baseline verrouillée reste `f72106ff…`/`3f9fe198…`).
4. **Les 3 échecs smoke préexistants** (B1 g gorgée, B7 b achat monstre C, victoire pas-à-pas 40).
5. **Les 4 specs des ACTÉS** restent en PROPOSÉ (sets d'équipement, navigation/hub, Boutique+Inventaire onglets, gating) : leur exécution attend les tranchages de session.

## 7. Verdict

**Conforme.** Les deux chantiers (correctif Accueil, refonte errance v1.36) sont livrés proprement, toutes les contraintes du prompt sont tenues, les preuves sont rejouées y compris sur le site déployé. Le couloir 1 n'a plus de chantier ouvert : la suite est gérée par les décisions de Marc-Olivier (validation S24, session de tranchage, verrouillage de baseline, confirmation de l'arbitrage Léviathan).
