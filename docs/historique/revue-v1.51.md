# Revue du couloir pilotage — PR #11 : correctifs smoke/IA (2 lots) + correctifs terrain v1.51 (3 lots), 13/11/2026

> Objet : revue indépendante de la PR #11 (`acf4023`) : lots 1-2 du prompt `docs/prompt-correctifs-smoke-ia.md` (smoke robuste, IA école du sort ; `8ce99de`, `0633848`) et lots 1-3 du prompt `docs/prompt-correctifs-v1.51.md` (9e signalement ; `6ea3f69`, `b8006cb`, `e92aa8a`), plus docs + validation IHM locale (`909cecc`), fix smoke S27 (`99793e7`) et merge de branche (`e72f7ed`). Méthode : preuves REJOUÉES depuis un tarball de main (`acf4023`), zéro confiance accordée aux claims ; site déployé comparé octet par octet. Verdict : **CONFORME — les 5 lots sont livrés et vérifiés, le digest mesuré est exact et consigné sans recalibrage, UN SEUL MANQUE : le Lot 3 « réserve cachée » du prompt smoke/IA n'est PAS livré** (rail de réserve toujours visible, `src/ui.js` ~4628).

## 1. Preuves rejouées sur main (`acf4023`)

- **Build** : ok, `dist.html` 857 539 caractères, 23 fichiers de données.
- **Tests** : `node --test tests/*.test.js` = **270/270 verts** (claims : 252 lot 1 smoke/IA → 255 lot 2 IA → 262 lot 1 v1.51 → 266 lots 2-3 → 270 après fix S27 — conforme, +18 vs 252).
- **Smoke** : **410 checks TOUT PASSE** — le crash B9 selon la date est RÉPARÉ (B9 c progresse la 1re quête quel que soit son type, garde-fou 7 dates simulées) ; les échecs préexistants (43 B, 45 e, B1 c, B29 h) sont traités avec justification ; crash `chr(233)` et S27 (Map/removeItem) réparés. Claim identique.
- **Digest N=3000 rejoué** : `4a5b0123…` **861/3000**, 0 exception, 0 marathon (claim identique).
- **Digest N=10000 rejoué** : `3f828555…` **2864/10000**, 0 exception, 0 marathon (claim identique).
- **Site déployé** : **md5 identique au build local** (`0ca01271…`) → le site public est exactement le build vérifié.
- **CI** : run #290 (commit `acf4023`) **completed successfully**.

## 2. Déroulé du digest (mesures intermédiaires conformes, aucun recalibrage)

- Baseline VERROUILLÉE (13/11) : `9faff1b9…` 838/3000 / `6103e7b0…` 2795/10000.
- Lot 2 IA (école du sort au ciblage) : `63d6edb4…` 833/3000 / `25e5316b…` 2787/10000 (**−5/−8**, dans la tolérance, consigné).
- Lot 1 v1.51 (signatures soigneuses + ascendance retirée) : `4a5b0123…` 861/3000 / `3f828555…` 2864/10000 (**+23/+69 vs baseline verrouillée, soit +0,77/+0,69 pt**, consigné, AUCUN recalibrage). Les signatures qui soignent au lieu d'attaquer et la perte du bonus d'ascendance déplacent légèrement la courbe — conforme aux tranchages 35/34, écart attendu.
- Lots 2-3 v1.51 (UI, économie) : digests INCHANGÉS — conforme (présentation + hors combat).
- **Aucun digest codé en dur dans le moteur** (occurrences = texte du changelog in-game uniquement).

## 3. Conformité point par point (9e signalement + prompt smoke/IA)

- **Signatures des soigneurs** : livrées, 14 cartes + 14 monstres passées en soin (symétrie joueur/ennemi), cible = allié le plus blessé. Conforme au tranchage 35. [NB : mon prompt listait 15 cartes ; le couloir 1 en traite 14 — `p6` Aube Éternelle (L, plus fort sort de l'aube, exception assumée v0.47) vérifié cohérent.]
- **Ascendance RETIRÉE** : mécanique supprimée (`statsAt` sans asc), UI nettoyée, **migration v28→v29** (`delete inst.asc`, non destructif) ; restes uniquement dans le changelog historique in-game — conforme (l'historique ne se réécrit pas).
- **Défaite en Terres Sauvages** : écran dédié « retour au Port des Brumes », bouton unique ville, plus de mention d'étage/donjon — conforme au point 3 du prompt.
- **Mana persistant** : prouvé par test headless entre combats de zone (victoire → combat suivant sans Accueil/autel : mana = restant) — conforme au point 4.
- **Fiche unifiée** (`ficheCoreHtml`) : menu équipe = combat, stats PV/ATQ/AGI/INT, illustration contenue (plus de rognage), variante combat avec effets actuels — conforme au point 5-6.
- **Badge élément** : `${EL_GLYPH[el]}` réparé sur tous les sorts — conforme au point 7.
- **Splash Mage / wave Occultiste** : explicités depuis `CLASSE_MODS` dans la fiche (« cible + éclats à 50 % ») — conforme au tranchage 36, maths inchangées.
- **Taille des cartes en combat** : agrandies (30vw/180px desktop, 28vw/150px mobile) — conforme au point 9.
- **Achat de cartes à l'or SUPPRIMÉ** : rayon marchand retiré de la Boutique, `buyMonster` refuse avec redirection Guilde jetons 🎫, textes « or »→« jetons » corrigés — conforme au tranchage Lot D du 12/11.
- **Validation IHM locale** : 39/39 PASS (Playwright, 1440×900 + 390×844, captures poussées dans `docs/captures-validation/v1.51/`) ; protocole `docs/validation-ihm.md` versionné v1.51.

## 4. MANQUE : Lot 3 « réserve cachée » du prompt smoke/IA non livré

- Le tranchage de Marc-Olivier (13/11, consigné suite 2 de ce journal) : **plus de rail de réserve visible à l'écran de combat** — cartes cachées sur le côté, accès via action compacte. **Vérifié dans le code : le rail `#reserve-zone` avec la rangée « réserve » est TOUJOURS rendu** (`src/ui.js` ~4628, commentaire « Lot A : rail de réserve visible » inchangé, `<div class="reserve-zone" id="reserve-zone">` ~5687).
- La PR couvre les lots 1-2 du prompt smoke/IA et les lots 1-3 du prompt v1.51, mais pas ce lot 3. **À relancer au couloir 1 en priorité** (le tranchage est acté, la fiche unifiée du lot 2 v1.51 en facilite l'intégration) ; mécanique inchangée (échange volontaire = tour, K.O. = gratuit), digest inchangé attendu.

## 5. Réponse à la question de Marc-Olivier (stats des monstres rencontrés) — consignée pour le design

- **Les stats des monstres sont FIXES par carte + niveau : AUCUN aléatoire individuel** (pas d'équivalent IV/nature Pokémon). Formule (`makeUnit`, `src/engine/combat.js:7-18`) : `base × (1 + 8 % × (niveau − 1)) × modificateur de classe × (1 + cran de race) × équipement` — déterministe.
- **Gobelin des Marées (C, Guerrier, 58 PV de base, +15 % PV de classe) vs Pillard des Récifs (UC, Assassin, 52 PV de base, −10 % PV)** : la rareté ne donne pas plus de PV — chaque carte a ses stats de base propres et la classe module ; un C « PV tank » dépasse naturellement un UC fragile. Conforme au tranchage « rareté = puissance de départ » (répartition libre par carte).
- **Deux Pillards niv2 avec des PV différents** : aucune variance individuelle — la différence vient du CONTEXTE : (1) l'**adoucissement des premiers combats** du premier donjon en Facile tant que le record < 10 (×0,70 aux étages 1-5, ×0,80 étages 6-9, ×0,45 étage 10, `src/ui.js` ~5590-5597) ; (2) l'**étage** (le niveau des ennemis dépend de l'étage via `levelIn`) ; (3) le **cran de race** (statique par race en `data/trees.json`). Le « niv2 » affiché ne résume donc pas tout le contexte.
- **Piste ouverte [À TRANCHER, n°4 du reste]** : si Marc-Olivier veut une variance individuelle « à la Pokémon » (cartes plus fortes/faibles d'un même type), c'est un tranchage de design à part (impact digest : MESURE obligatoire). Statut actuel : stats déterministes.

## 6. Suite

- **Marc-Olivier** : validation IHM **S26/S27 v1.51 sur le terrain** (téléphone ET PC, site déployé = build vérifié) ; verrouillage éventuel de la nouvelle mesure `4a5b0123…`/`3f828555…` comme baseline après validation (la baseline `9faff1b9…` reste la référence tant qu'aucun arbitrage).
- **Couloir 1** : Lot 3 « réserve cachée » (manque ci-dessus), PUIS fusion DQM v4 (`docs/design/spec-fusion-v4.md`, 2 lots, digest inchangé attendu contre la baseline en vigueur).
- **Couloir pilotage** : specs contenu v4 (donjons divins, 4 cartes régionales, expéditions, lignées exclusives, panoplies, sorts libres, fins).
