# Spec : catalogues de l'économie v2 (Boutique, équipement, quêtes, Guilde, inventaire)

> Statut : **ACTÉ** le 11/11/2026 (retour de Marc-Olivier), sur la base du calibrage v0 acté le 10/11 (nuit, troisième tour). Les prix et pourcentages sont le calibrage v0 : toute valeur s'affine au digest, documentée dans `docs/arbitrages.md`. À terme, la source de vérité des valeurs vit dans `data/*.json`.

## 1. Boutique

Catalogue fixe, toujours visible. Monnaie : l'or (1 point ⚡ = 1 or, un run ≈ 400 or).

| Objet | Effet | Prix |
|---|---|---|
| Potion de soin | Restaure 30 % des PV max du porteur | 50 or |
| Potion de soin supérieure | Restaure 60 % | 120 or |
| Potion de mana | Recharge 40 % du mana max | 60 or |
| Potion de mana supérieure | Recharge 80 % | 140 or |
| Éclat | Collection (bonus d'éclat) | 150 or |

- **Gemmes brutes vendables** (révision du 11/11/2026, retour de Marc-Olivier) : à prix élevé ; les polies, gravées et éternelles restent des récompenses de boss (`BOSS_GEM`).
- **Potions libres en combat (ACTÉ)** : une carte peut en boire autant qu'elle veut, chaque gorgée **coûte son tour** via une nouvelle action « Objet » de la fenêtre d'action ; utilisables aussi hors combat (entre les étages). Le prix des potions est le levier de calibrage du digest.
- L'équipement occupe le rayon dédié (voir §2).
- **Acquisition de l'équipement (ACTÉ 11/11/2026)** : matériaux de la saveur de chaque zone sur les monstres, pièce garantie sur les boss, **craft en ville** (matériaux + or) pour les paliers hauts ; la Boutique couvre le bas du catalogue ; le L reste le fruit des évolutions, le M le boss d'Enfer.

## 2. Équipement (mix : arme typée + armure générique + slots d'équipe)

**Slots par personnage : 2.** Arme (slot 1, typée par classe) + armure (slot 2, générique). **Slots d'équipe : 2**, génériques, effet sur toute l'équipe.

### Armes, deux lignes par classe (ACTÉ : variantes de build)

- Ligne **frappe** : +ATQ %.
- Ligne **finesse** : +stat secondaire de la classe : +AGI pour le Guerrier et l'Assassin, +INT pour le Mage, le Prêtre et l'Occultiste.

Paliers (calibrage v0) : C +5 %, UC +10 %, R +15 %, SR +25 %. Prix : C 200, UC 400, R 800, SR 1 600 or. Pas de L en boutique (le L reste le fruit des évolutions).

### Noms : les trois saveurs mêlées (ACTÉ)

Règle normative : les noms mêlent **zones/donjons** (Marées, Forge Cendrée, Bosquet Profond, Crypte Oubliée, Zénith Ardent), **écoles** (la Lame, le Baume, la Ruse, l'Entrave, la Ferveur…) et **métiers** (milicien, chapelain, guet, apprenti…). Le tableau ci-dessous fixe la ligne frappe ; chaque palier existe aussi en ligne finesse avec son propre nom (ex. « Rapière », « Bâton d'arcane », « Dagues d'élan », « Sceptre de sagette », « Focus astral »). La liste définitive se fige au chantier terrain.

| Classe | C | UC | R | SR |
|---|---|---|---|---|
| Guerrier (épées) | Épée de milicien | Lame de la Forge Cendrée | Épée du guet de Marées | Tailleuse de siège du Zénith |
| Mage (bâtons) | Bâton d'apprenti | Bâton du Bosquet Profond | Bâton d'arcane de la Crypte | Sceptre du Zénith Ardent |
| Prêtre (sceptres) | Sceptre de chapelain | Sceptre du Baume | Bénitier de la Crypte Oubliée | Sceptre de la Ferveur |
| Assassin (dagues) | Dagues émoussées | Crochets de la Ruse | Dagues de la nuit des Marées | Stylets de l'Ombre du Zénith |
| Occultiste (focus) | Focus de novice | Focus de la Crypte | Talisman de l'Entrave | Iris de Nuit Éternelle |

### Sets par zone, façon Dofus (ACTÉ 11/11/2026)

- Chaque zone porte un **set thématique** (ex : **la Sirène** pour les Marées) : **une armure générique + une arme par classe** à sa saveur (épée, bâton, sceptre, dagues, focus), soit 6 pièces par set.
- **Trois niveaux par set** : **base** (C/UC), **supérieure** (R), **royale** (SR) : Robe de la sirène → Robe supérieure de la sirène → Robe royale de la sirène, avec l'arme qui va avec à chaque niveau.
- **Craft en ville** : la base s'assemble avec les ressources courantes de la zone ; la supérieure et la royale exigent en plus la **matière du boss** du donjon de la zone (elle ne s'achète pas).
- **Drops** : les ressources tombent partout (errance et donjons) ; les équipements peuvent tomber partout à **taux très faible** ; le boss garantit sa pièce et sa matière.
- **Bonus de set (ACTÉ)** : arme + armure du même set équipées sur un personnage = **+5 points de pourcentage** sur les effets des deux pièces (calibrage v0, à affiner au digest).
- Les sets sont la **ligne noble** de l'équipement ; la Boutique garde les paliers génériques d'entrée. Prix : paliers actés (C 200 → SR 1 600 or).

### Armures génériques (une seule ligne)

Tunique de milicien (C), Brigandine de la Forge Cendrée (UC), Haubert des Marées (R), Égide du Zénith Ardent (SR) : +PV % aux mêmes paliers, mêmes prix que les armes.

### Slots d'équipe (pool de 4, 2 équipables)

| Objet | Effet |
|---|---|
| Bannière de guerre | +ATQ % d'équipe |
| Oriflamme de vigie | +AGI % d'équipe |
| Reliquaire de chapelle | +PV % d'équipe |
| Talisman de camp | +1 régén de mana d'équipe (C/UC), +2 (R), +3 (SR) |

Paliers et prix identiques à l'équipement individuel (C 200 → SR 1 600, calibrage v0).

### Règles

- Assignation **hors combat** libre, désassignation sans perte ; l'équipement **suit la carte à l'évolution**.
- Les pourcentages s'appliquent sur les stats de base : **recalibrage digest obligatoire après implémentation** (maths modifiées), documenté dans `docs/arbitrages.md`.

## 3. Quêtes quotidiennes (3 par jour, rotation seed, bonus complétion : 1 pierre d'éveil)

Rotation déterministe (seed de la date) : **1 petite + 1 moyenne + 1 grande** chaque jour. La grande du jour porte une **carte N ou un éclat** un jour sur trois (seed). Progression persistée en sauvegarde, remise à zéro au changement de jour. Le défi du jour reste supprimé.

| Taille | Quête | Récompense |
|---|---|---|
| Petite | Vaincre 10 monstres | 80 or |
| Petite | Gagner 3 combats d'errance | 90 or |
| Petite | Récolter 10 collectables en errance | 80 or |
| Petite | Acheter 1 objet à la Boutique | 60 or |
| Moyenne | Vaincre 25 monstres | 120 or |
| Moyenne | Finir 1 donjon | 100 or |
| Moyenne | Évoluer 1 carte | 100 or |
| Moyenne | Apprendre 3 crans | 120 or |
| Moyenne | Fusionner 2 créatures | 100 or |
| Grande | Finir 2 donjons | 150 or |
| Grande | Vaincre 1 boss | 120 or |
| Grande | Recruter 1 créature au marchand | 100 or + éclat |

Bonus de complétion totale (les 3 faites) : **1 pierre d'éveil** (acté). Le pool s'ajuste librement au chantier sans nouvel arbitrage tant que le format tient (3 par jour, bonus pierre).

## 4. Guilde (ex-Forge)

- **Évolutions** : inchangées, en gemmes (`EVO_COST`).
- **Compagnons** : cartes recrues pour la collection et l'équipe ; **rotation quotidienne de 3 offres** (seed de la date, ACTÉ). Prix : C 500, UC 800, R 1 200, SR 1 600, UR 2 000 or (acté 500-2 000) ; **le L n'est jamais recrutable** (évolution uniquement).
- **Marchand de créatures** (monstres pour la fusion et les enseignements) : échelle exigeante actée, C 200 → UR 10 000 or ; il remplace les jetons (`JETON_RARITY` disparaît).

## 5. Inventaire (page Personnage)

- Fiche personnage : 2 slots (arme, armure) ; stats affichées **base + bonus %** recalculées.
- Page équipe : 2 slots d'équipe partagés par toute l'équipe.
- Vue équipement du rayon Boutique reliée au même inventaire.

## 6. Impact moteur et migration

- Nouvelle action « Objet » dans la fenêtre d'action (potions en combat, ACTÉ) ; à implémenter avec le chantier économie.
- `store.points` converti en or ; `JETON_RARITY` supprimée ; migration de sauvegarde (version +1) avec conversion du solde ⚡ existant.
- **Digest** : recalibrage documenté après l'implémentation (équipement en % = maths modifiées ; potions = levier prix).
