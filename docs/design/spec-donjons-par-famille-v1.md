# Spec — Donjons par famille v1 : un donjon PAR FAMILLE, 4 cartes régionales multibiomes (référence prête à lancer)

> Chantier donjons, rédigé par le couloir pilotage à partir des tranchages de Marc-Olivier : donjons par famille à la DQM + escaliers de boss (suite 31, v18 §6.10), 4 cartes régionales multibiomes = 4 tranches de 25 niveaux (suite 34), UN SEUL donjon gobelin en v1 = les Écumes premier donjon du jeu (suite 37), chaînes royales +10 niveaux + 2 difficultés à l'entrée + 3 donjons divins (tranchés le 12/11). Les paliers exacts se calent sur la nouvelle courbe du rééquilibrage (étude `docs/design/etude-reequilibrage-classes-cartes-2026-11-13.md`, J6/M2) ; les valeurs ci-dessous sont INDICATIVES.

## 1. Le modèle DQM (tranché, rien à rediscuter)

- **Un donjon PAR FAMILLE**, tout au long du jeu ; les 4 familles gobelines régionales à 2 cartes (Fumées, Mousses, Caveaux, Célestes) restent des monstres de RENCONTRE sans donjon (suite 37).
- **3-4 salles** puis **escalier de boss par paliers** : chaque palier de l'escalier = une tête de lignée de la famille (paliers intermédiaires : UR/L de lignées secondaires ; boss final : le L de tête tranché ou proposé §3).
- **2 difficultés à l'entrée** (tranché 12/11) : **Normale** et **Royale** — la Royale ouvre à **+10 niveaux** (chaîne royale, modèle Dofus), boss remplacé par la **tête royale** suivante de la famille, **drops de panoplie** (ressources de set, tranché 12/11). Les deux difficultés se bouclent séparément (jalons, raretés débloquées).
- **Les 3 donjons divins** (tranchés 12/11) : sommets du jeu, à stats renforcées (variance d'exception, étude §G).
- Les **5 donjons actuels** (Marées, Forge, Bosquet, Crypte, Zénith) = **donjons majeurs recyclés** : leur échelle de boss devient l'escalier interne (ex. les Abîmes : palier 1 Rôdeur des Fonds → palier 2 Hydre des Marées → palier 3 Souverain des Marées).

## 2. Les 4 cartes régionales multibiomes (tranché suite 34, amendé suite 37)

- **4 tranches de 25 niveaux** : carte 1 = 1-25, carte 2 = 25-50, carte 3 = 50-75, carte 4 = 75-100.
- Chaque carte recoupe les **5 biomes** (Marées/eau, Forge/feu, Bosquet/nature, Crypte/ténèbres, Zénith/lumière) **disposés différemment** ; plus de bloc étanche par biome.
- **Recâblage de l'errance** : les zones d'errance top-down migrent sur les 4 régions (5 zones par région, une par biome) ; les tables de rencontre (zones.json) peuplent chaque zone avec la famille du donjon local + les rencontres des familles sans donjon (gobelins régionaux).
- Noms des 4 régions : **[À TRANCHER — PROPOSITIONS]** carte 1 « les Rives Hantées », carte 2 « les Terres Braise », carte 3 « les Hauts Corsaires », carte 4 « le Confins Célestes ». Noms des donjons sur le modèle existant (l'Antre, la Forge Cendrée…).

## 3. La grille v1 (paliers INDICATIFS, à caler sur la courbe du rééquilibrage)

**Carte 1 (1-25)** — « acte des Gobelins » ÉCARTÉ (suite 37) :

| ~Niv | Donjon (famille, biome) | Escalier de boss (paliers successifs) |
| --- | --- | --- |
| 3 | Gobelins des Écumes (Marées) | **Zikka** ; royale +10 : **Griknir** (panoplie gobeline) |
| 8 | Enfants de la Braise (Forge) | Gardien des Foyers → **Vulcain** |
| 13 | Dryades (Bosquet) | Vesna → **Adriel** |
| 17 | Spectres des Caveaux (Crypte) | Hurleuse des Caveaux → **Macha** |
| 21 | Clergé du Plein Jour (Zénith) — le temple des trompés (v18 §6.10.3) | Apôtre du Chant → **Célestin** |
| 24 | Donjon des Abîmes palier 1 (Marées, majeur recyclé) | **Rôdeur des Fonds** |

**Carte 2 (25-50)** :

| ~Niv | Donjon (famille, biome) | Escalier de boss |
| --- | --- | --- |
| 28 | Sirènes des Récifs (Marées) | **Méliane → Thalassa** (tranché suite 31) |
| 33 | Cendrels (Forge) | Tisseuse de Suie → **Dame des Cendres** [PROPOSITION] |
| 38 | Bêtes du Fougeron (Bosquet) | Reine des Spores → **Patriarche du Bosquet** [PROPOSITION] |
| 43 | Les Naufragés (Crypte) | Ahab → **Lord des Naufragés** [PROPOSITION] |
| 46 | Phénix Célestes (Zénith) | Fjalar → **Pyrrha** [PROPOSITION] |
| 50 | Donjon des Abîmes palier 2 (majeur) | **Hydre des Marées** (boss non aléatoire, correctif suite 16/28) |

**Carte 3 (50-75)** :

| ~Niv | Donjon (famille, biome) | Escalier de boss |
| --- | --- | --- |
| 55 | Légion Solaire (Zénith) | Aurorine → **Héraut du Zénith** |
| 60 | Chevalerie Défunte (Crypte) | Siegfried → **Jeanne d'Arc** |
| ~63-73 | **Tranche royale** : difficultés Royales des donjons ~53-63 (Légion, Chevalerie) + **donjon royal des Marées : les Gobelins Royaux, boss Roi des Écumes** | Roi des Écumes (panoplie royale) |

**Carte 4 (75-100)** :

| ~Niv | Donjon (famille, biome) | Escalier de boss |
| --- | --- | --- |
| 76 | Donjon tardif des Abîmaux (Marées, majeur) | **Léviathan** (chaîne conservée en L) |
| ~80-93 | **Donjons royaux des biomes restants** (royales Forge ~80, Bosquet ~84, Crypte ~88, Zénith ~93 — valeurs suite 34) | têtes royales des familles majeures de chaque biome [À TRANCHER] |
| ~95 | **Donjon des Démons** (divin 1) | **Belzébuth, Roi des Démons** (d28) |
| ~97 | **Donjon des Anges** (divin 2) | **Séraphin, Archange Ultime** (p6) |
| ~100 | **Donjon de l'Équilibre** (divin 3) | l'Arbitre du Seuil (Kairos, événement Équilibre — forme exacte [À TRANCHER]) |

- **Total ≈ 14 donjons de famille + 5 royaux + 3 divins ≈ 22**, cohérent avec l'intuition « un donjon tous les 5 niveaux » (suite 34) ; les difficultés Royales doublent le contenu de progression sans nouvelle carte.
- Les **M** (Titan des Marées, Seigneur des Cendres, Cœur du Bosquet, la Mort, Ancien Naufragé, Astre Capiteux, Apolline) restent **sommets de famille, jamais dans un escalier** (jamais jouables par montée) ; les cartes HUMAINES de la Légion et du Clergé peuplent le donjon du Zénith et le temple tout en restant obtenables (suite 31).

## 4. Format data (extension de `data/dungeons.json`)

```json
{
  "id": "gobelins-ecumes",
  "name": "L'Antre des Écumes",
  "desc": "…",
  "region": 1,                      // carte régionale 1-4
  "biome": "marees",                // un des 5 biomes
  "famille": "Gobelins des Écumes", // famille monstre porteuse
  "palier": 3,                      // niveau joueur indicatif (Normale)
  "floors": 4,                      // 3-4 salles puis escalier
  "salles": [ ["e1","e3","e4","e5"], ["e16","e17"], ["e18","e19"] ],  // vagues par salle = lignées de la famille
  "bossPaliers": [ { "floor": 3, "ref": "zikka" }, { "floor": 4, "ref": "griknir" } ],
  "royale": { "palier": 13, "boss": "griknir", "panoplie": "panoplie-gobeline" },
  "difficultes": ["normale", "royale"],
  "req": null, "accent": "#4fc3f7", "icon": "🌊"
}
```

- Les zones d'errance (`data/zones.json`) reçoivent `region` + famille locale ; le recâblage garde `recrute`, `materiau`, `matiereBoss` par zone.
- Validateurs : palier croissant par région, famille existante, boss ∈ famille, M interdit dans un escalier, chaîne royale = palier + 10.
- Migration : les 5 donjons actuels deviennent des donjons majeurs (`majeur: true`) à escalier multi-paliers ; leur ID et leur progression bouclée sont préservés.

## 5. Impact digest et mesure

- **IMPACT MAJEUR** : tous les pools de vagues changent (familles par donjon, escaliers, régions). Le digest est **re-mesuré à chaque lot** (MESURE, pas de recalibrage intermédiaire) et la **nouvelle baseline se verrouille en fin de chantier global** (une seule baseline pour tout le chantier v2 : gel + moteur + data + donjons + fusion, discipline M6 de l'étude).
- La difficulté suit la courbe 1-100 du rééquilibrage (M2 : hits-to-kill, EHP) ; les escaliers de boss respectent « un boss prend 25-60 frappes équipe complète ».

## 6. Ordre de livraison

1. Donjons de famille carte 1 (avec capture relevée, suite 38) puis cartes 2-4, une région par lot.
2. Difficultés Royales + panoplies (drops de set).
3. Donjons royaux + divins (stats renforcées, variance d'exception).
4. Recâblage errance + validateurs + tables + clôture (digest 3000 + 10000, MESURE).

> Tranchages restants pour Marc-Olivier : noms des 4 régions (propositions §2), escaliers [PROPOSITION] §3 (Cendrels, Fougeron, Naufragés, Phénix), têtes royales des donjons royaux ~80-93, forme exacte du boss de l'Équilibre.
