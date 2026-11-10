# Les arbres d'évolution

> AICG : Lignées. Le graphe d'évolution complet du jeu (238 cartes), extrait des données embarquées : chaînes des 7 familles compagnons, voies des 15 naissances, mini-lignées des solos, webs des 5 donjons et familles divines. Une évolution exige le **niveau 10** et des **éclats** (C→UC : 3 bruts, UC→R : 2 polis, R→SR : 4 polis, SR→UR : 2 gravés, UR→L : 4 gravés), et le choix de voie est définitif pour l'exemplaire.

## 1. Les voies des 15 naissances

À sa première évolution, chaque naissance choisit sa voie parmi celles ouvertes. Les cibles sont les maillons d'entrée des familles, des solos ou des webs de monstres.

### Les 4 novices humains

```mermaid
flowchart LR
  n1["Épéiste Novice · C"]
  n1 -->|"voie du guerrier"| a30["Spadassin Vigilant · UC"]
  n1 -->|"voie de la protection"| s14["Garde du Rempart · UC"]
  n1 -->|"voie sylvestre"| a33["Pisteur du Bosquet · UC"]
  n2["Mage Novice · C"]
  n2 -->|"les flots — l’Eau"| a29["Adepte des Rivières · UC"]
  n2 -->|"la fournaise — le Feu"| a32["Veilleur de Braise · UC"]
  n2 -->|"les Sylvains — la Terre"| a33["Pisteur du Bosquet · UC"]
  n2 -->|"la lumière — l’élue de l’Aube"| s13["Servante de l’Aube · UC"]
  n2 -->|"l’ombre — l’élue du Crépuscule"| a31["Guetteur Crépusculaire · UC"]
  n3["Prêtre Novice · C"]
  n3 -->|"la lumière — la foi"| s13["Servante de l’Aube · UC"]
  n3 -->|"la garde — protéger les vivants"| s14["Garde du Rempart · UC"]
  n4["Voleur Novice · C"]
  n4 -->|"voie de l’assassinat"| a31["Guetteur Crépusculaire · UC"]
  n4 -->|"voie des quais"| a34["Braconnier des Quais · C"]
  n4 -->|"voie de la fête"| a37["Jongleur de Fête · C"]
```

### Les 5 bestiaus (les webs de monstres)

```mermaid
flowchart LR
  n5["Bestiau des Eaux · C"]
  n5 -->|"voie du pillage — les récifs"| e3["Pillard des Récifs · UC"]
  n5 -->|"voie des berges"| e11["Crabe des Berges · UC"]
  n6["Bestiau des Flammes · C"]
  n6 -->|"voie de la suie"| f3["Écorcheur de Suie · UC"]
  n6 -->|"voie de la fournaise"| f15["Semeur de Fournaise · UC"]
  n6 -->|"voie du goblin"| f24["Gobelin de Suie · UC"]
  n7["Bestiau du Vivant · C"]
  n7 -->|"voie de la mousse"| g3["Sanglier de Mousse · UC"]
  n7 -->|"voie des sèves"| g12["Bergère des Sèves · UC"]
  n8["Bestiau des Ténèbres · C"]
  n8 -->|"le gouffre"| k3["Fossoyeur Nocturne · UC"]
  n8 -->|"le deuil marin"| k12["Veilleuse de Bord · UC"]
  n8 -->|"le devoir brisé"| k24["Porte-Étendard Défunt · UC"]
  n9["Bestiau des Cieux · C"]
  n9 -->|"la voie dorée — la Légion Solaire"| z3["Arbalétrier Doré · UC"]
  n9 -->|"la voie du feu céleste — les Phénix"| z16["Essor de Flammes · UC"]
  n9 -->|"la voie du plein jour — le Clergé"| z23["Chapelain du Jour · UC"]
```

### Les 3 enges et les 3 naissances divines

```mermaid
flowchart LR
  n10["Enge des Brumes · C"]
  n10 -->|"la forme — Sirène"| e24["Chanteuse des Récifs · UC"]
  n11["Enge des Bois · C"]
  n11 -->|"la forme — Dryade"| g12["Bergère des Sèves · UC"]
  n12["Enge des Caveaux · C"]
  n12 -->|"la forme — le gouffre"| k3["Fossoyeur Nocturne · UC"]
  n12 -->|"la forme — le deuil marin"| k12["Veilleuse de Bord · UC"]
  n12 -->|"la forme — le devoir brisé"| k24["Porte-Étendard Défunt · UC"]
  n13["Ange · C"]
  n13 -->|"l’éveil du service — le Jeune Séraphin"| p1["Jeune Séraphin · UC"]
  p1 -.->|"l’équilibre (événement : l’Ange ET le Démon possédés)"| d6["Kairos, Arbitre du Seuil · L"]
  n14["Démon · C"]
  n14 -->|"la voie du Chœur Miroir — la Réflexion"| d8["Choriste Miroir · UC"]
  n15["Éveillé du Seuil · C"]
  n15 -->|"la voie du Pont — le Liage"| d14["Aiguille du Pont · UC"]
```

Deux convergences existent au palier UC : l'Adepte des Rivières (a29) et le Veilleur de Braise (a32) peuvent quitter leur élément pour la lumière et rejoindre la lignée de Léna (a29 → s5, a32 → s5). C'est le seul point du graphe où deux familles se rejoignent.

## 2. Les 7 familles compagnons

Le tronc C → UC → R → SR → UR → L, avec ses portes (naissances et solos qui y entrent) et sa graine archivée.

### Famille du Sabre

```mermaid
flowchart LR
  a1["Épéiste en Herbe · C"] --> a30["Spadassin Vigilant · UC"] --> a6["Épéiste Errant · R"] --> a10["Bretteur du Zénith · SR"] --> a15["Kenji, Lame Éternelle · UR"] --> a17["Kenji, Sabre Céleste · L"]
  n1["Épéiste Novice · C"] -->|"voie du guerrier"| a30["Spadassin Vigilant · UC"]
  b1["Yuki, Brise-Lame · SR"] -.->|graine dormante| a10["Bretteur du Zénith · SR"]
```

### Famille de l’Ombre

```mermaid
flowchart LR
  a2["Rôdeur des Ombres · C"] --> a31["Guetteur Crépusculaire · UC"] --> a7["Faucheur des Ombres · R"] --> a12["Fantôme du Sanctuaire · SR"] --> a16["Kira, Reine des Ombres · UR"] --> a18["Kira, Nuit Sans Fin · L"]
  n2["Mage Novice · C"] -->|"l’ombre — l’élue du Crépuscule"| a31["Guetteur Crépusculaire · UC"]
  n4["Voleur Novice · C"] -->|"voie de l’assassinat"| a31["Guetteur Crépusculaire · UC"]
  b2["Onyx, Fil de Nuit · SR"] -.->|graine dormante| a12["Fantôme du Sanctuaire · SR"]
```

### Famille de l’Eau

```mermaid
flowchart LR
  a5["Apprentie des Rivières · C"] --> a29["Adepte des Rivières · UC"] --> a8["Sorcière des Rivières · R"] --> a11["Sorcière des Océans · SR"] --> a13["Alix, Archimage des Marées · UR"] --> a14["Alix, Déesse de l’Eau · L"]
  n2["Mage Novice · C"] -->|"les flots — l’Eau"| a29["Adepte des Rivières · UC"]
  b3["Naïa, Sourcéleine · SR"] -.->|graine dormante| a11["Sorcière des Océans · SR"]
```

### Famille de l’Aube

```mermaid
flowchart LR
  s1["Novice de l’Aube · C"] --> s13["Servante de l’Aube · UC"] --> s5["Prêtresse de l’Aube · R"] --> s8["Grande Prêtresse de l’Aube · SR"] --> s9["Léna, Avatar de l’Aurore · UR"] --> s10["Léna, Aube Éternelle · L"]
  n2["Mage Novice · C"] -->|"la lumière — l’élue de l’Aube"| s13["Servante de l’Aube · UC"]
  n3["Prêtre Novice · C"] -->|"la lumière — la foi"| s13["Servante de l’Aube · UC"]
  b4["Aïna, Voix du Matin · SR"] -.->|graine dormante| s8["Grande Prêtresse de l’Aube · SR"]
```

### Famille du Bouclier

```mermaid
flowchart LR
  s4["Gardien-Mécanique · C"] --> s14["Garde du Rempart · UC"] --> s6["Sentinelle d’Acier · R"] --> s7["Bastion Arcanique · SR"] --> s11["Argus, Rempart Éveillé · UR"] --> s12["Argus, Forteresse Vivante · L"]
  n1["Épéiste Novice · C"] -->|"voie de la protection"| s14["Garde du Rempart · UC"]
  n3["Prêtre Novice · C"] -->|"la garde — protéger les vivants"| s14["Garde du Rempart · UC"]
  b5["Roc, Épaule du Monde · SR"] -.->|graine dormante| s7["Bastion Arcanique · SR"]
```

### Famille de la Braise

```mermaid
flowchart LR
  a19["Allumeur de Braises · C"] --> a32["Veilleur de Braise · UC"] --> a20["Mage de la Fournaise · R"] --> a21["Invocateur de Fournaise · SR"] --> a22["Solen, Archimage de la Braise · UR"] --> a23["Solen, Roi des Braises · L"]
  n2["Mage Novice · C"] -->|"la fournaise — le Feu"| a32["Veilleur de Braise · UC"]
  b6["Ember, Cœur de Fournaise · SR"] -.->|graine dormante| a21["Invocateur de Fournaise · SR"]
```

### Famille du Bosquet

```mermaid
flowchart LR
  a24["Traqueur du Bosquet · C"] --> a33["Pisteur du Bosquet · UC"] --> a25["Chasseur du Bosquet · R"] --> a26["Prédateur Sylvestre · SR"] --> a27["Maïa, Lame du Bosquet · UR"] --> a28["Maïa, Déesse du Bosquet · L"]
  n1["Épéiste Novice · C"] -->|"voie sylvestre"| a33["Pisteur du Bosquet · UC"]
  n2["Mage Novice · C"] -->|"les Sylvains — la Terre"| a33["Pisteur du Bosquet · UC"]
  b7["Sylve, Écorce Vive · SR"] -.->|graine dormante| a26["Prédateur Sylvestre · SR"]
```

## 3. Les mini-lignées des solos et les greffes

- **les quais** : a34 Braconnier des Quais (C) → a40 Chasseur des Quais (UC) → a41 Maître des Brumes (R)
- **les routes** : a35 Palefrenière Errante (C) → a42 Écuyère des Routes (UC) → a43 Première Écuyère (R)
- **les dunes** : a36 Éclaireur des Dunes (UC) → a44 Guide des Dunes (R)
- **la fête** : a37 Jongleur de Fête (C) → a45 Artiste de Fête (UC) → a46 Maître Jongleur (R)
- **les berges** : a38 Raboteur de Berges (C) → a47 Charpentier des Berges (UC) → a48 Maître Charpentier (R)
- **le guet** : a39 Veilleuse du Guet (UC) → a49 Capitaine du Guet (R)

Les 5 solos d'origine sont des portes raccourcies : Garde-Promesse (a3) → Garde du Rempart (Bouclier), Étincelle Vive (a4) → Veilleur de Braise (Braise), Pilier Mécanique (a9) → Bastion Arcanique (Bouclier), Médecin de Camp (s2) → Servante de l'Aube (Aube), Veilleur d'Acier (s3) → Guetteur Crépusculaire (Ombre). Et un pont latéral existe chez les Cendrels : l'Écorcheur de Suie (f3, cousin) évolue en Foreuse d'Âmes (f8).

## 4. Les webs des 5 donjons

Chaque famille de monstres a jusqu'à trois lignes d'évolution (une par maillon), des cousins sans évolution et souvent un mythe (M). Les bestiaus, les enges et les naissances du Zénith y entrent par leurs voies.

### Antre des Marées

**Gobelins des Écumes**

- e1 Gobelin des Marées (C) → e3 Pillard des Récifs (UC) → e4 Sergent des Brumes (R) → e5 Prophète des Marées (SR)
- e16 Grand Chaman des Écumes (UR) → e17 Zikka, Chaman des Écumes (L)
- e18 Roi des Écumes (UR) → e19 Griknir, Roi des Écumes (L)
- cousins : e2 Tirailleur des Récifs (C) · e10 Veuve des Récifs (UC) · e8 Matriarche des Récifs (R)

**Abîmaux**

- e7 Moqueur des Marées (C) → e11 Crabe des Berges (UC) → e20 Rôdeur des Fonds (R)
- e9 Confesseur des Abysses (SR) → e6 Avatar de l’Abîme (UR) → e13 Léviathan, Colère du Gouffre (L)
- e15 Ancien des Berges (SR) → e21 Protecteur des Berges (UR) → e22 Pontos, Aîné des Berges (L)
- cousins : e12 Gardien des Galets (SR)
- mythe : e14 Titan des Marées (M), hors chaîne

**Sirènes des Récifs**

- e23 Sirène Nouvelle (C) → e24 Chanteuse des Récifs (UC) → e25 Voix du Large (R) → e26 Écumeuse des Récifs (SR)
- e27 Sirène Ensorceleuse (UR) → e28 Méliane, Voix du Large (L)
- e29 Gardienne des Récifs (UR) → e30 Thalassa, Reine des Récifs (L)

### Forge Cendrée

**Cendrels**

- f1 Golem de Cendre (C) → f10 Souffleur de Braises (UC) → f11 Traqueur de Suie (R)
- f16 Mailleur de Suie (SR) → f17 Façonneur de Cendres (UR) → f18 Ombeline, Tisseuse de Suie (L)
- f19 Champion de Cendre (SR) → f20 Souffle Ardent (UR) → f21 Calcine, Dame des Cendres (L)
- cousins : f7 Tisseur de Cendres (C) · f3 Écorcheur de Suie (UC) · f8 Foreuse d’Âmes (R) (f3 évolue en f8)
- mythe : f13 Seigneur des Cendres (M), hors chaîne

**Enfants de la Braise**

- f14 Braise Errante (C) → f15 Semeur de Fournaise (UC) → f4 Chevalier de Braise (R)
- f9 Idole de Magma (SR) → f6 Colosse de Magma (UR) → f22 Vulcain, Colosse Ardent (L)
- f5 Invocateur des Foyers (SR) → f23 Maître des Foyers (UR) → f12 Gardien des Foyers (L)

**Gobelin des Fumées**

- f2 Gobelin des Fumées (C) → f24 Gobelin de Suie (UC)

### Bosquet Profond

**Bêtes du Fougeron**

- g1 Rampant du Fougeron (C) → g3 Sanglier de Mousse (UC) → g4 Gardien des Remparts Verts (R)
- g13 Semeur Sylvestre (SR) → g6 Colosse Sylvestre (UR) → g7 Patriarche du Bosquet (L)
- g14 Mycolithe (SR) → g15 Mycélium Vivant (UR) → g16 Mycola, Reine des Spores (L)
- cousins : g2 Luciole Hargneuse (C) · g5 Prisme Vivant (SR)
- mythe : g8 Cœur du Bosquet (M), hors chaîne

**Gens des Sèves**

- g9 Lueur Bienveillante (C) → g12 Bergère des Sèves (UC) → g10 Druidesse des Sèves (R)
- g11 Oracle des Clairières (SR) → g17 Dryade Radieuse (UR) → g18 Adriel, Lumignole des Clairières (L)
- g19 Dryade du Sous-Bois (SR) → g20 Rôdeuse des Sous-Bois (UR) → g21 Vesna, Dryade du Sous-Bois (L)

### Crypte Oubliée

**Spectres des Caveaux**

- k1 Rôdeur des Caveaux (C) → k3 Fossoyeur Nocturne (UC) → k13 Goule des Caveaux (R)
- k5 Spectre des Quais (SR) → k6 Banshee des Caveaux (UR) → k14 Macha, Hurleuse des Caveaux (L)
- k15 Éveillé des Caveaux (SR) → k16 Liche des Caveaux (UR) → k7 Archiliche des Caveaux (L)
- mythe : k17 La Mort, Faucheuse des Tombes (M), hors chaîne

**Les Naufragés**

- k2 Nymphe Croupie (C) → k12 Veilleuse de Bord (UC) → k10 Meneuse de Deuil (R)
- k11 Prieuse des Naufragés (SR) → k18 Endeuillée des Flots (UR) → k19 Ysolde, Veuve Éternelle (L)
- k20 Capitaine Noyé (SR) → k21 Revenu des Flots (UR) → k22 Ahab, Lord des Naufragés (L)
- cousins : k9 Servante Pâle (C)
- mythe : k8 Ancien Naufragé (M), hors chaîne

**Chevalerie Défunte**

- k23 Écuyer Défunt (C) → k24 Porte-Étendard Défunt (UC) → k4 Chevalier Défunt (R)
- k25 Chevalière de la Veille (SR) → k26 Paladine Défunte (UR) → k27 Jeanne d’Arc, Chevalière de la Veille (L)
- k28 Chevalière du Serment (SR) → k29 Sermenteuse Défunte (UR) → k30 Siegfried, Chevalière du Serment Brisé (L)

### Zénith Ardent

**Légion Solaire**

- z1 Écuyer du Zénith (C) → z3 Arbalétrier Doré (UC) → z4 Lancier Solaire (R) → z5 Voulige d’Aube (SR)
- z13 Centurion Ardent (UR) → z7 Héraut du Zénith (L)
- z14 Lancière de l’Aube (UR) → z15 Aurorine, Lance de l’Aube (L)
- cousins : z12 Garde-Flamme (UC) · z10 Serre-Soleil (R)
- mythe : z8 Astre Capiteux (M), hors chaîne

**Phénix Célestes**

- z2 Souffle-Mèche (C) → z16 Essor de Flammes (UC) → z17 Oiseau de Feu (R)
- z18 Cendre d’Éclosion (SR) → z6 Phénix du Zénith (UR) → z19 Pyrrha, Cendre Éternelle (L)
- z20 Plume Miroir (SR) → z21 Phénix Miroir (UR) → z22 Fjalar, Phénix du Renvoi (L)

**Clergé du Plein Jour**

- z9 Chantre du Zénith (C) → z23 Chapelain du Jour (UC) → z24 Diacre du Plein Jour (R) → z11 Prêtresse du Plein Jour (SR)
- z25 Cantatrice du Zénith (UR) → z26 Célestin, Apôtre du Chant (L)
- z27 Inquisitrice du Jour (SR) → z28 Justicière du Jour (UR) → z29 Justine, Justicière du Jour (L)
- mythe : z30 Apolline, Prophétesse du Jour (M), hors chaîne

## 5. Les familles divines (Le Seuil)

Deux lignes par famille, reliées par un pont : le sommet d'une ligne devient le pied de la suivante. Le Démon (n14) et l'Éveillé du Seuil (n15) y entrent par leurs voies. L'Ange (n13) est l'exception : il ne rejoint pas un web, il s'éveille en le Jeune Séraphin (p1, ex-Ange Éveillé, id inchangé), qui porte les trois portes (la coloration, la voie céleste, la mauvaise volonté) et remplace l'Ange Gardien (p2, archivé). L'événement d'équilibre (posséder l'Ange ET le Démon) le mène à Kairos, Arbitre du Seuil (d6) ; les trois portes attendent leurs maillons.

**Arbitres du Seuil**

- d1 Garde du Seuil (C) → d2 Servante du Sablier (C) → d3 Huissier de l’Entre-Deux (UC)
- d4 Juge des Heures (R) → d5 Maître des Sabliers (SR) → d6 Kairos, Arbitre du Seuil (L)
- pont : d3 (l’Huissier de l’Entre-Deux) → d4 (le Juge des Heures)

**Chœur Miroir**

- d7 Lame Miroir (C) → d8 Choriste Miroir (UC) → d9 Prisme du Chœur (R)
- d10 Miroir Antiphonique (SR) → d11 Chef du Chœur (UR) → d12 Écho, Voix Miroir (L)
- pont : d9 (le Prisme du Chœur) → d10 (le Miroir Antiphonique)

**Tisseuses du Pont**

- d13 Fileuse du Pont (C) → d14 Aiguille du Pont (UC) → d15 Brodeuse des Liens (R)
- d16 Tisseuse des Nœuds (SR) → d17 Architecte du Pont (UR) → d18 Ananké, Tisseuse du Pont (L)
- pont : d15 (la Brodeuse des Liens) → d16 (la Tisseuse des Nœuds)

La chaîne complète de chaque famille : Arbitres, Garde du Seuil → Servante du Sablier → Huissier de l'Entre-Deux → Juge des Heures → Maître des Sabliers → Kairos ; Chœur, Lame Miroir → Choriste → Prisme → Miroir Antiphonique → Chef du Chœur → Écho ; Tisseuses, Fileuse → Aiguille → Brodeuse → Tisseuse des Nœuds → Architecte → Ananké.

---

*La chronologie d'acquisition des sorts le long de ces arbres : `arbres-sorts.md`.*