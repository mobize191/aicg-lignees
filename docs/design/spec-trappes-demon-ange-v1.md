# Spec — Trappes démon et ange v1 : le camp démon complet + les anges dévoyés (lot PRIORITAIRE du gel, prête à lancer après validation des propositions)

> Tranchage de Marc-Olivier (14/11, suite 25) : « Pas d'accès Chœur pour n14, je voudrais que l'on débloque les trappes démon et ange avant d'avancer. » Lecture consignée : (1) n14 Démon n'a PAS accès au Chœur Miroir, son éveil part sur les voies du camp démon ; (2) les trappes du camp démon (Gouffre des Vices, Fléau Démoniaque) reçoivent leur LIGNÉE EN V1 (le « au fil des patchs » est écarté) et la trappe ange (la porte « mauvaise volonté » de p1 : les anges dévoyés) est DÉBLOQUÉE en v1 ; (3) ce lot passe EN TÊTE du gel, avant gorgones/fées, paladin/chevalier, la spec-gel générale et la fusion. À corriger d'un mot si la lecture est mauvaise. Références : `docs/design/design-arbres-v18.md` §6.1-§6.2 + diagramme 10.6 ; chaînes des voies et nommées actées v14 (arbitrages du 13/11).

## 1. Tranchages actés (14/11, suite 25 — rien à rediscuter)

1. **n14 Démon n'a PAS accès au Chœur Miroir.** L'éveil `n14 → d8` (`data/trees.json` + `data/evolutions.json`) est recâblé vers les deux voies du camp démon. La chaîne d7-d12 du Chœur reste complète et jouable ; son accès joueur se redéfinit SANS n14 (§4). **Garde-fou de livraison : ne PAS retirer `n14 → d8` tant que le nouvel accès n'est pas posé** (c'est aujourd'hui le seul éveil du Chœur : sans lui, la famille devient injouable).
2. **Les trappes du camp démon sont DÉBLOQUÉES en v1** : Gouffre des Vices et Fléau Démoniaque ne restent pas des culs-de-sac, chacune reçoit sa lignée complète R → SR → UR → L.
3. **La trappe ange est DÉBLOQUÉE en v1** : la porte « mauvaise volonté » de p1 reçoit les anges dévoyés (4 cartes + re-racement de l'Astre Capiteux, déjà tranché au v18 §6.2). La porte « coloration » reste DORMANTE en v1 (destinées post-L, v2), sauf si l'option d'accès Chœur §4-a est retenue.
4. **L'ordre du gel** : démon + ange AVANT tout le reste.

## 2. Le camp démon (18 cartes à créer, race divine camp démon, élément Ombre)

### 2.1 Structure (DÉFAUT PROPOSÉ, à valider d'un mot)

n14 EST la commune C commune aux deux voies (le camp démon se joue comme un novice divin : l'éveil ouvre le choix de voie). Chaque voie est une famille divine : deux éveils depuis n14 (la chair / la puissance), puis un choix au palier R (la carte de voie OU la trappe). Dérrogation assumée à la règle 1.3 (un C pour deux familles) : à documenter dans le validateur, précédent = n13 qui porte les trois familles du camp divin.

### 2.2 Les chaînes (ids proposés d19-d36, à figer au lot 1 — les arts série 3 attendent ces ids)

**La chair (école proposée : le Vice, rôle dégâts + affaiblissement)**

| Id | Carte | Palier | Classe (prop.) | Note |
| --- | --- | --- | --- | --- |
| d19 | Aiguillon du Désir | UC | Assassin | choix 2 au R |
| d20 | Succube | R | Occultiste | chaîne principale |
| d21 | Grande Succube | SR | Occultiste | verrou |
| d22 | Dame du Désir | UR | Occultiste | |
| d23 | Asmodia, Reine du Désir | L | Occultiste | nommée ACTÉE v14 |
| d29 | Gouffre des Vices | R | Occultiste | TRAPPE DÉBLOQUÉE (suite 25) |
| d30 | Grand Gouffre | SR | Occultiste | verrou |
| d31 | Gueule de l'Abîme | UR | Occultiste | |
| d32 | La Faim | L | Occultiste | PROPOSITION : La Faim (en piste v2 jusqu'ici) devient la nommée de la trappe, bestiale, une gueule du gouffre |

**La puissance (école proposée : la Fureur, rôle dégâts)**

| Id | Carte | Palier | Classe (prop.) | Note |
| --- | --- | --- | --- | --- |
| d24 | Brute des Fosses | UC | Guerrier | choix 2 au R |
| d25 | Démon Majeur | R | Guerrier | chaîne principale |
| d26 | Seigneur Démon | SR | Guerrier | verrou |
| d27 | Prince Démon | UR | Guerrier | |
| d28 | Lilith, Reine des Démons | L | Occultiste | nommée ACTÉE v14 |
| d33 | Fléau Démoniaque | R | Occultiste | TRAPPE DÉBLOQUÉE (suite 25) |
| d34 | Grand Fléau | SR | Occultiste | verrou |
| d35 | Porte-Peste | UR | Occultiste | |
| d36 | Pestis, Mère des Fléaux | L | Occultiste | PROPOSITION, nommée à valider |

Recâblage data : `trees.json` divine.eveils remplace l'entrée `n14 → d8` par deux éveils (n14 → d19 « la voie de la chair », n14 → d24 « la voie de la puissance ») ; `evolutions.json` : d19 → {d20 | d29}, d24 → {d25 | d33}, puis les chaînes SR → UR → L ; l'entrée `n14 → d8` est retirée AU LOT ACCÈS CHŒUR (§4), pas avant. Stats : courbe divine de référence (d1-d18, p1/p5/p6, `RACE_MOD` divine), l'écart de classe s'applique ; valeurs posées au lot, mesurées par le harnas.

### 2.3 Sorts de lignée (2×6, coûts 2/3/5/9/14/20 ✦) + signatures — PROPOSITIONS à valider

**Le Vice (la chair)** : ✦2 « Frôlement du Vice » (1 ennemi, ×1,4) · ✦3 « Regard de Luxure » (×1,6 + malédiction ATQ −25 %, 2 tours) · ✦5 « Haleine du Gouffre » (×1,8 + ralentissement 2 tours) · ✦9 « Charme de l'Abîme » (×2,6 + malédiction 2 tours) · ✦14 « Asmodia : Danse des Vices » (×3,4) · ✦20 « Désir Absolu » (×4,5).

**La Fureur (la puissance)** : ✦2 « Grondement des Fosses » (×1,4) · ✦3 « Coup des Fosses » (×1,6) · ✦5 « Cri de Fureur » (×1,8 + étourdissement 1 tour, taux à caler) · ✦9 « Terreur Majeure » (×2,6 + malédiction 2 tours) · ✦14 « Lilith : Couronne de Fureur » (×3,4) · ✦20 « Ultime Fureur » (×4,5).

**Signatures (soloSpell, jamais le nom de la carte)** : Asmodia « Extase Interdite » (×2 + malédiction) ; Lilith « Sceptre du Jugement » (×2 + étourdissement) ; La Faim « Dévoration Totale » (×2,2) ; Pestis « Souffle Noir » (×2 + malédiction) ; les autres cartes suivent la grammaire des sorts (commun + signature par carte, crans au grimoire). n14 garde « Trait de Vice ».

Espèces des arts (plus tard, `species-map.json`) : diables humanoïdes pour les chaînes principales (Asmodia F, Lilith F, Pestis F), **La Faim bestiale** (une gueule, jamais de figure humanoïde, règle beast:true).

## 3. Les anges dévoyés (4 cartes + re-racement, TRANCHÉ v18 §6.2)

| Id | Carte | Palier | Classe (prop.) | Élément (prop.) |
| --- | --- | --- | --- | --- |
| d37 | Ange Ardent | R | Guerrier | Feu |
| d38 | Ange du Zénith | SR | Guerrier | Lumière |
| d39 | Astre Vaillant | UR | Guerrier | Lumière |
| d40 | Astre Rayonnant | L | Prêtre | Lumière |

- Porte « mauvaise volonté » de p1 : `evolutions.json` p1 → d37 (choix au R, à côté de la voie céleste p1 → p5) ; la porte cesse d'être dormante dans trees.json.
- Famille « dévoyés », école proposée **l'Orgueil** (rôle dégâts) : ✦2 « Éclat Dévoyé » (×1,4) · ✦3 « Bannière Reniée » (×1,6 + malédiction 2 tours) · ✦5 « Zénith Fêlé » (×1,8 + ralentissement 2 tours) · ✦9 « Châtiment Renversé » (×2,6) · ✦14 « Voûte Renversée » (×3,4) · ✦20 « Chute de l'Empyrée » (×4,5). Signature de l'Astre Rayonnant : « Lumière Noire » (×2) — PROPOSITIONS à valider.
- **Re-racement de l'Astre Capiteux (z8)** : fiche race divine camp ange, élément Lumière, courbe inchangée (TRANCHÉ).
- La porte « coloration » reste dormante sauf §4-a.

## 4. L'accès au Chœur Miroir sans n14 (À TRANCHER — 3 options)

Le Chœur (d7-d12, Eau) est aujourd'hui atteint UNIQUEMENT par l'éveil n14 → d8. Après recâblage :

- **(a) la porte coloration-eau de p1 (RECOMMANDÉE)** : la porte « la coloration (l'eau, l'aube, le sabre) » existe déjà dans trees.json ; sa composante EAU devient l'accès v1 du Chœur (p1 → d8, l'ange coloré d'eau rejoint le Chœur), l'aube et le sabre restent v2. Zéro carte nouvelle, la porte dormante devient vivante, symétrie avec le camp ange.
- **(b) l'événement du miroir** : symétrique de l'accès du Seuil (l'événement d'équilibre du Séraphin, p1 → d6) ; mais le système d'événements est v2, accès différé.
- **(c) une naissance dédiée** : une 16e naissance N « Choriste » (C, Eau) éveillant vers d8 ; coûte une carte et casse « les 15 naissances » affichées partout.

Quel que soit le choix : vérifier le pool raccourci (formsOf depuis les raciales divines) et les garde-fous du validateur — le Chœur doit rester JOUABLE après le recâblage.

## 5. Data et moteur (fichiers touchés)

`data/monsters.json` (les 22 nouvelles cartes divines, comme d1-d18) ; `data/trees.json` (éveils n14 recâblés, porte mauvaise volonté vivante, coloration selon §4) ; `data/evolutions.json` (nouveaux maillons, retrait n14 → d8 au lot accès) ; `data/families.json` (familles chair / puissance / dévoyés) ; `data/schools.json` (écoles le Vice, la Fureur, l'Orgueil + ouvrePar) ; `data/lineage-spells.json` (3×6 sorts) ; `data/grimoire.json` (signatures fondées en crans, cf. v1.10) ; `data/engine.json` (FAM_SCHOOL, pools divins) ; `src/validate.js` (dérogation C partagé documentée) ; tests + `smoke-ui.mjs` (fiches, éveils, collection par race, glossaire « Le camp divin »).

## 6. Lots (un commit FR chacun, discipline AGENT.md)

1. **Lot 1 — le camp démon (data)** : 18 cartes + familles + 2 écoles + 2×6 sorts + signatures + les deux éveils n14 (POUR MOMENT sans retirer n14 → d8) + evolutions + validateur + tests.
2. **Lot 2 — l'accès au Chœur Miroir** : application du tranchage §4 (a/b/c) + retrait de `n14 → d8` + pools raccourcis vérifiés + tests « le Chœur reste jouable ».
3. **Lot 3 — les anges dévoyés** : 4 cartes + famille + école + sorts + porte mauvaise volonté vivante + re-racement z8 + grimoire + tests.
4. **Lot 4 — UI/textes** : fiches du camp divin, collection par race, glossaire « Le camp divin », changelog, smoke.

**Digest : INCHANGÉ attendu sur les 4 lots** (aucune nouvelle carte n'entre dans les pools de donjons ; le re-racement z8 ne touche que la fiche). Toute entrée dans un pool de rencontre = MESURE obligatoire contre la baseline avant fusion.

## 7. Validation (chaque lot)

- validateur vert (EXI-P1-1/2 éveils connus, remplace exige disparait, noms uniques ; EXI-DATA-3 nommées uniques ; dérogation « C partagé » documentée) ;
- `node build.mjs && node --test` : 0 fail (nouveaux tests : chaînes complètes R → L sans trou, choix doubles aux UC, sorts de lignée présents par famille, signatures au grimoire, Chœur toujours accessible après le lot 2) ;
- smoke-ui : fiche n14 (2 voies), fiches des 22 cartes, collection race divine, glossaire ;
- `node combat-digest.mjs dist.html 3000` : **inchangé** (baseline `3b11106f…` 871/3000, verrouillage en attente) ;
- le cas échéant `node tools/gen-tables.mjs` régénéré.

## 8. Hors périmètre (rappels)

Les donjons divins (Démons / Anges / Équilibre, tranchés 12/11, non construits) consommeront ces lignées pour leurs sous-bosses et leur roi : chantier séparé. Les arts série 3 attendent les ids définitifs (22 cartes). La coloration « l'aube » et « le sabre » restent v2. La Faim comme événement : si la proposition « L de la trappe » est retenue, l'événement v2 s'y référera au lieu de la créer. La fusion : le camp démon est déjà la cible tranchée de humaine + divin (15 % démon, suite 24) ; la table de synthèse se posera avec la spec-gel générale.
