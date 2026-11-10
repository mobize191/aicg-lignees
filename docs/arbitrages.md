# Journal des arbitrages et décisions

> Règle : toute décision de design vit ici avec sa **date** et son **statut** (`ACTÉ` = s'applique aux data et au jeu ; `PISTE` = exploré, pas codé ; `PROPOSÉ` = en attente de Marc-Olivier). On ne contredit jamais un arbitrage ACTÉ : on propose une révision datée en dessous.

## 2026-11-10 : arbitrages de la session design (PUSHÉS dans les data)

### ACTÉ : la classe Invocateur disparaît

- L'`Invocateur de Fournaise` (a21) devient **Mage** : les invocations passent par l'école de l'Appel (déjà ouverte Mage + Occultiste).
- Les 8 monstres `Invocateur` sont reclassés : `f5` Invocateur des Foyers, `f12` Gardien des Foyers, `f23` Maître des Foyers, `g13` Semeur Sylvestre, `g10` Druidesse des Sèves deviennent **Mage** ; `k7` Archiliche des Caveaux, `k15` Éveillé des Caveaux, `k16` Liche des Caveaux deviennent **Occultiste** (nécromancie).
- Le registre `engine.CLASSES` garde `Invocateur` en réserve (aucune carte ne la porte ; synergie `Invocateur` dormante). Le retrait complet du registre attend la v3.

### ACTÉ : le Gardien-Mécanique devient Guerrier

- `s4` passe de Prêtre à **Guerrier** ; le Rempart s'ouvre au **profil Guerrier** (`schools.rempart.ouvrePar.profils` : `["Guerrier"]`).
- La synergie Guerrier s'applique donc à la carte qui protège le mieux : cohérent avec son rôle.

### ACTÉ : l'Entrave s'ouvre au Mage ET à l'Occultiste

- `schools.entrave.ouvrePar.profils` : `["Mage", "Occultiste"]`. Le contrôle devient une affaire de lanceurs, pas une exclusive d'ombre.

### ACTÉ : sorts d'écolage communs renommés (noms de métier, pas de monstre)

- `Morsure d'Écume` → **Lame d'Écume**, `Chant de Sirène` → **Mélodie envoûtante**, `Carapace de Corail` → **Barrière de Corail**, `Guet des Fonds` → **Vigie des Flots**.
- Appliqué dans `grimoire.json` (4 sorts) et `monsters.json` (soloSpell de e8 et e20). **Les ids restent inchangés** (`morsure-decume`, `chant-de-sirene`...) : les sauvegardes et les fusions (`fusion-map.json`) sont préservées.

### ACTÉ : règles de rang au combat

- La protection de l'arrière ne couvre **pas** les attaques de zone (attaques et sorts ciblés seulement).
- La formation (3 devant + 2 derrière ou 2 + 3) est **figée au départ** du combat ; l'action de repli reste une piste v1.1.
- Les monstres suivent les mêmes règles de rang (leurs classes existent dans les données).

### PISTE v1.1 : la Garde du Gardien

- Tant que le Gardien tient à l'avant, l'adversaire ne peut pas viser la ligne arrière. À calibrer avant actage (risque : verrouillage de partie).

### PISTE v2 : le grimoire élémentaire (l'élément porte le sort, pas la carte)

- Idée : `Barrière de Corail` resterait un sort **Eau** même joué par une carte Feu ; choisir une voie débloquerait les sorts de l'élément de cette voie ; la carte garderait son élément de naissance comme **affinité** (bonus léger quand le sort joué partage son élément).
- Pour : cohérence du lore, liberté de build, le grimoire devient le pivot de progression, l'interaction élémentaire se calcule sur le sort.
- Contre : l'identité de carte s'amenuise, équilibrage par élément × rôle à refaire (chaque voie doit couvrir dégâts, soin, contrôle, bouclier).
- Statut : piste ouverte, notée dans les maquettes de la page fiches et du combat. **Pas de décision actée.**

### Impact d'équilibrage constaté

- Baseline digest **3000 combats : `7dfab0a295eaa1dab1f70e039b782e0ef06285fdd0fdf3e09d65304b966de5aa`** (476 victoires, 0 exception, 0 marathon), à comparer à la précédente `c5ab2af1…` (534 victoires). La baisse vient des reclassifications (esquives et frappes de l'arrière par classe). À surveiller au recalibrage des caractéristiques v0.47 : c'est une mesure, pas une régression de conformité (tests et smoke verts).

## Décisions antérieures

Voir `docs/historique/` (rapports des phases de la refonte) et `docs/design/` (specs normatives). En bref : moteur pas-à-pas v0.46, refonte majeure exécutée (phases 0 à 5), campagne d'illustrations DreamShaper XL livrée (231 arts + 5 fonds), caractéristiques (FOR/VIE/AGI/INT) actées pour la v0.47 avec formules à calibrer avec Marc-Olivier.
