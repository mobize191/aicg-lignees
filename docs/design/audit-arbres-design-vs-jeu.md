# Audit — l'arbre des familles défini vs le jeu, et gel de la première version (v1)

> 13/11/2026, retour de Marc-Olivier : la génération des arts est en cours carte par carte ; chaque carte manquante coûte des régénérations. Objectif : figer au plus vite la **première version de l'arbre (v1)**, pour que la campagne d'arts et le contenu data convergent sur la même liste fermée.
>
> Méthode : croisement systématique du design de référence (`docs/historique/design-arbres-v17.md`, audit 11.6 « reste à créer ≈ 88 cartes », plus les specs v3 et fusion v4) avec les données du jeu (`data/cards.json` 150 cartes, `data/monsters.json` 159 monstres, v1.51). Chaque nom du design a été vérifié nom à nom dans les data.

## 1. Ce que l'audit v17 réclamait et qui est livré (rien à faire)

- **Brigand/vol** : Mercenaire → Pillard → Brigand → Grand Brigand → Fléau des Routes → Gadianton, à l'identique (t1-t6).
- **Prêtre d'ombre → famille Crépuscule** : Novice du Crépuscule, Disciple du Crépuscule, Prêtre du Crépuscule, Servante du Crépuscule, Grande Prêtresse de l'Ombre (UR), Vesperine, Reine de la Nuit (L) (q1-q6).
- **Zèle** : Fidèle du Matin → Écuyer Fervent → Croisé de l'Aube → Chapelain du Jour → Arbalétrier Doré → Lémion, Chef de la Légion Solaire (u1-u6).
- **Trous du catalogue divin comblés** : UR des Arbitres (Maître des Sabliers, w5), les 3 familles divines rendues jouables (w1-w18 : Seuil, Miroir, Pont), la porte céleste du Jeune Séraphin a ses maillons (p5 Séraphin, Porteur de Lumière UR ; p6 Séraphin, Chérubin Éveillé L), l'événement d'équilibre p1 → d6 Kairos est posé.
- **Graines** : la règle v14 « propre voie et propre L » est tenue via les étapes solo (b1 Yuki → c1 Yuki, Lame Ardente → c8 Yuki, Sabre de l'Aurore ; b5 Roc → Rempart du Monde ; b7 Sylve → Âme du Bosquet ; idem Onyx, Naïa, Aïna, Ember).
- **Contenu v3** : Sirènes des Récifs 13e famille (e24-e30, Méliane et Thalassa), gobelins régionaux, Clergé du Plein Jour (Justine, Justicière du Jour L ; Apolline, Prophétesse du Jour M), les 3 Enge (n10-n12) et leurs communes d'accueil (w19 Sirène Nouvelle, w20 Fée Nouvelle, w21 Gorgonne Nouvelle), Maïa, Déesse du Bosquet en L de la famille du Bosquet.
- **Statu quo conforme** : les 15 naissances sont en jeu (n1-n15), les 14 familles jouables sont complètes C → L, les webs des 5 donjons sont conformes à l'audit 11.4 (chaîne de la malédiction des quais, la Mort, l'Archiliche, l'Astre Capiteux en M du Zénith).

## 2. Le cas succube et le camp démon : l'historique complet

1. **Définie v14** (ordre acté) : la voie du désir du camp démon — Aiguillon du Désir UC → Succube R → Grande Succube SR → Dame du Désir UR → **Asmodia, Reine du Désir L** ; en parallèle la voie de la puissance (Brute des Fosses UC → Démon Majeur R → Seigneur Démon SR → Prince Démon UR → **Lilith, Reine des Démons L**, nommée actée v14) ; deux trappes (Gouffre des Vices, qui mange Famine ; Fléau Démoniaque).
2. **Tuée côté joueur par le verdict 11.4 de l'audit v17** : « les colorations divines du design (5) meurent : chaque naissance divine a sa famille » — les noms proposés (dont Grande Succube, Prince Démon, Aiguillon du Désir, Brute des Fosses, Gouffre des Vices, Fléau Démoniaque) sortent de la liste ; le Démon n14 est câblé vers le Chœur Miroir (d8). C'est l'état du jeu aujourd'hui : **aucune succube, aucun démon de lignée**.
3. **Réintroduite le 12/11 par la session direction** : les 3 donjons divins TRANCHÉS — « Démons : sous-bosses (ex. la succube) puis le roi des démons ».
4. **TRANCHÉ le 13/11 (Marc-Olivier) : le camp démon est RÉINTÉGRÉ en familles jouables complètes** — révision datée du verdict 11.4, qui ne s'applique plus. Le tranchage donjons divins du 12/11 reste valable en complément (le donjon Démons pourra s'appuyer sur ces lignées pour ses sous-bosses et son boss).

### La structure réintégrée (v1)

- **Entrée** : n14 Démon (C) ; les deux voies s'ouvrent au choix 1 (UC). **TRANCHÉ le 14/11 (suite 25) : n14 n'a PAS accès au Chœur Miroir** — recâblage acté vers ces voies ; l'accès du Chœur se redéfinit sans n14 (3 options dans `docs/design/spec-trappes-demon-ange-v1.md` §4 : porte coloration-eau de p1 RECOMMANDÉE, événement du miroir, naissance dédiée).
- **Voie de la chair** : Aiguillon du Désir UC → choix 2 : Succube R → Grande Succube SR → Dame du Désir UR → Asmodia, Reine du Désir L, **ou** Gouffre des Vices R (**trappe DÉBLOQUÉE en v1, suite 25 : Grand Gouffre SR → Gueule de l'Abîme UR → Famine L**, NOM ACTÉ suite 26, ex-« La Faim »).
- **Voie de la puissance** : Brute des Fosses UC → choix 2 : Démon Majeur R → Seigneur Démon SR → Prince Démon UR → Lilith, Reine des Démons L, **ou** Fléau Démoniaque R (**trappe DÉBLOQUÉE en v1 : Grand Fléau SR → Porte-Peste UR → Peste, Mère des Fléaux L**, NOM ACTÉ suite 26, ex-Pestis).
- **18 cartes nouvelles, 2 familles de lignée** (6 sorts de lignée chacune, coûts 2/3/5/9/14/20 ✦ ; +6 cartes des trappes débloquées le 14/11, suite 25). Les noms « Aiguillon du Désir, Brute des Fosses, Dame du Désir, Prince Démon » sont des noms proposés v12-v16, validés v15 (« au pire tu les modifieras ») ; Asmodia et Lilith sont actés v14.
- **Famine** (ex-« La Faim », un des sept grands monstres) : **L de la trappe du Gouffre des Vices en v1 (suite 25, NOM ACTÉ suite 26)** (elle quitte la liste différée v2).
- **Côté arts** : l'espèce de ces cartes doit être tranchée humanoïde diable (succube, démon) — la question ouverte « n14 Démon : bête ou diable ? » de l'audit espèces (`docs/images/audit-especes-mystiques.md`) se tranche diable avec ce gel ; espèces à ajouter dans `species-map.json`.

## 3. TRANCHÉ le 13/11 — le gel v1 (les 4 décisions)

Les quatre tranchages de Marc-Olivier du 13/11/2026 définissent la **liste fermée de la première version de l'arbre** :

1. **Camp démon : familles jouables complètes** (12 cartes, cf. §2).
2. **Anges dévoyés : dans v1** — Ange Ardent R → Ange du Zénith SR → Astre Vaillant UR → Astre Rayonnant L, greffés depuis la porte « mauvaise volonté » de p1 Jeune Séraphin (déjà posée dans `data/trees.json` sans maillons) ; l'Astre Capiteux (z8) est re-racé divine camp ange (changement de fiche : race divine, élément Lumière, courbe inchangée).
3. **Paladin + chevalier : dans v1** — le paladin (Paladin → Paladin Sacré → Paladine Sacrée → Isaure, Égide de l'Aube, greffe 2.1 sur l'arbre de l'épéiste) et le chevalier (Chevalier → Chevalière du Rempart → Gardienne du Rempart → sa L propre, à nommer ; v14 : la double convergence vers Argus meurt, le bouclier garde sa L à lui).
4. **Gorgones et fées : dans v1** — les deux webs de la section 6.2 :
   - **Gorgones** (l'essence des eaux) : Gorgonne Nouvelle C (w21, existante) → Serpent des Récifs UC → Fileuse du Regard R → deux voies verrou SR → UR → L : le regard (Pétrifiante des Écueils SR → Gorgonne Immaculée UR → Méduse, Reine des Écueils L) et les serpents (Mère des Serpents SR → Grande Serpentine UR → Euryale, Nourrice des Serpents L). Sthéno en réserve si une troisième voie s'ouvre. **8 cartes nouvelles.**
   - **Fées** (l'essence de la forêt) : Fée Nouvelle C (w20, existante) → Luciole Hargneuse UC (existante côté monstre g2) → Fée des Groves R → deux voies verrou SR → UR → L : les jeux (Fée des Jeux SR → Souveraine des Jeux UR → Mab, Souveraine des Jeux L) et les ronces (Fée des Ronces SR → Reine des Ronces UR → Aubépine, Reine des Ronces L). **7 cartes nouvelles.**

**Total du gel v1 : ≈ 39 cartes nouvelles** (12 démons + 4 anges dévoyés + 4 paladin + 4 chevalier + 8 gorgones + 7 fées), à créer côté data (spec d'exécution à rédiger) puis à générer en arts **une fois les ids définitifs posés** (règle série 3 : aucune génération avant les ids).

## 4. Différé en v2+ (consigné : ne pas générer en arts pour la v1)

- **Destinées post-L** (Ange du Sabre, Ministre du Sabre, Kenji Dieu du Sabre ; Ange de l'Aube, Ministre de l'Aube, Léna Déesse de l'Aube) ; **Calypso, Déesse des Océans** (le dualisme v14 de l'eau reste réduit à Alix seule en v1, à re-trancher en v2).
- **Lignée déchue / la chute** (Ange Déchu, Pèlerin de l'Aube, Pénitente de l'Aube, Luz, Exilé Céleste, Étoile Errante).
- **Événements** (Morzak à étages, la mort d'Isaure — donc les 2 cartes d'Isaure la défunte —, la M de l'Équilibre).
- **Nécromancie** (Évocatrice du Caveau, Nécromancienne des Caveaux, Grande Nécromancienne).
- **Maudit des Berges** (la chaîne de la malédiction des quais existe déjà : Ancien des Berges → Protecteur des Berges → Pontos → Titan des Marées).
- **Sommets quais et fête** (Ombre des Quais, Brumaire, Virtuose de Fête, Colombine).
- **Sylvains** (6 cartes), **élues du mage** (4 : Guérisseuse des Rivières, Mage des Marées, Gardienne de Braise, Mage de la Cendre), **élus de la terre** (jamais tranchés).
- **Paliers H** (HUC, HSR) ; **essences Enge du feu et de la lumière**. (Les trappes démon et Famine quittent cette liste le 14/11, suite 25 : débloquées en v1, gel §6.1 du v18.)

## 5. Divergences doc/jeu à consigner (hors gel, à traiter au fil des lots)

1. **p2 Ange Gardien** : mort en design v16/v17 (« l'Ange Gardien meurt »), il existe dans le jeu (p2, C, remplacé par p1 Jeune Séraphin). Statut à assumer en spec : le C angélique reste nommé Ange Gardien.
2. **Portes sans maillons du Séraphin** : la porte « mauvaise volonté » reçoit ses maillons en v1 (anges dévoyés) ; la porte « coloration » reste **dormante** en v1 (ses maillons sont les destinées post-L, différées v2).
3. **Champ race absent des monstres** : les ré-racements prévus par l'audit (« changements de fiche, pas des créations » : Sirènes et dryades → mystique, l'Astre → divine, la Crypte → Esprit) n'ont jamais été faits ; à traiter avec le lot des gorgones/fées qui pose la question du câblage de la race mystique côté joueur.
4. **Accès au Chœur Miroir après le recâblage de n14** : à définir en spec (porte, naissance dédiée, ou conversion).

## 6. Ordre d'exécution proposé (couloir code, après le correctif smoke/IA en cours)

1. **Spec du gel v1** (`docs/design/spec-gel-arbre-v1.md` à rédiger) : familles démon (Désir, Puissance), gorgones, fées ; greffes épéiste (paladin) et bouclier (chevalier) ; anges dévoyés + re-racement de l'Astre ; recâblage n14 ; communes et accès ; migrations de sauvegarde ; ré-racements de fiches.
2. **Livraison en lots** (data + sorts de lignée + tables), chaîne de preuve par lot, digest en **MESURE** (baseline verrouillée `9faff1b9…` 838/3000 / `6103e7b0…` 2795/10000 : le contenu data ne la touche pas, mais le recâblage de n14 et les nouvelles familles élargissent les équipes possibles → mesurer et consigner).
3. **Couloir design** : aucune génération d'arts au-delà du gel avant les ids définitifs ; ensuite les ≈ 39 cartes du gel entrent au backlog de la série 3 (nommées avec IPAdapter depuis les références : Asmodia, Lilith, Méduse, Euryale, Mab, Aubépine, Isaure).
