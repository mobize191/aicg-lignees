# Audit exhaustif des sorts — chaque sort rejoué en combat, fiche vs effet réel (14/11, déclenché par le signalement « Grand Assassin »)

**Déclencheur terrain** : Marc-Olivier signale que sur une carte « grand assassin », tous les sorts d'attaque ne peuvent viser que ses alliés, et soupçonne qu'« un sur deux est buggé ».

**Verdict global** : 309 sorts uniques rejoués en combat réel (moteur du dist, tour du lanceur isolé, 8 seeds par sort). **224 conformes (73 %), 85 anomalies (27 %), regroupées en 5 racines** dont 4 familles complètes de sorts de lignée touchées. Le signalement est confirmé et expliqué ; l'intuition « un sur deux » est juste sur le périmètre vécu (lignées + recrues à effet).

## Méthode

Outil `audit-sorts.mjs` (rejouable, poussé à la racine) : pour chaque sort porté par chaque carte et chaque monstre (84 sorts de lignée via la carte porteuse de chaque famille, 64 sorts de cartes solo, 161 signatures de monstres dédupliquées + communs), l'outil :
1. construit un combat réel via le moteur du `dist.html` (3 mannequins PV 500 000, agi 999, atk 1 ; un allié témoin blessé à 50 %) ;
2. isole le tour du lanceur (`beginRound` + `stepRound` avec l'action tactique `{kind: 'spell', idx}`) ;
3. agrège sur 8 seeds les effets observés (dégâts par cible, ennemis touchés, soins, buffs, boucliers, dot/stun/slow/curse, renforts) ;
4. compare à la fiche que la fenêtre d'action affiche réellement (rôle/cible de `signatureMetaOf` pour les signatures, `spellSideOf` pour le camp proposé au clic, `zoneWidthOf` pour la largeur affichée) ;
5. attribue un verdict fiche-vs-effet.

Résultat détaillé : `node audit-sorts.mjs` (sortie console + `audit-sorts-resultat.json`, non poussé).

## Le signalement, vérifié : la famille du Vol (Mercenaire → Grand Brigand → Fléau des Routes → Gadianton)

La « carte grand assassin » est la famille du Vol (`vol` : t1 Mercenaire → t2 Pillard → t3 Brigand → t4 **Grand Brigand** → t5 Fléau des Routes → t6 Gadianton), classe **Assassin**. Dans `data/lineage-spells.json`, **les 6 sorts de la lignée portent `"cible": "1 allié"`** alors que ce sont des attaques (mult ×1,4 → ×4,5 ; noms : Larcin Agile, Coup de Jarnac, Dague dans le Dos, Fauchage, Embuscade, Coup de Grâce).

Conséquence en jeu : la fenêtre d'action lit la cible de la fiche (`spellSideOf`) et ne propose **que les alliés** ; le moteur résout alors le sort en **buff ATQ** (valeur mult−1) sur l'allié désigné au lieu d'attaquer. En Auto, en revanche, le chemin historique **frappe déjà les ennemis** (le camp data n'est pas consulté sans action tactique) : le bug est purement Tactique, et le correctif de la cible ne touchera pas le digest Auto.

Les cartes concernées : les 6 paliers de la famille du Vol (Grand Brigand SR porte les 4 premiers sorts).

## Les 5 racines (85 anomalies)

### R1 — Lignée du Vol : attaques résolues en buff ATQ allié (6 sorts) — LE signalement

Racine : data `lineage-spells.json` (cible « 1 allié »), famille d'Assassins à école Ruse (role manip).
- Gadianton (t6) : Larcin Agile ×1,4 · Coup de Jarnac ×1,6 · Dague dans le Dos ×1,9 · Fauchage ×2,6 · Embuscade ×3,4 · Coup de Grâce ×4,5 — tous : fiche manip/« 1 allié », effet observé = buff ATQ, zéro dégât.

[À TRANCHER §0 n°7-a] A) cible « 1 ennemi » (attaque sournoise, cohérente avec la classe Assassin et les mults identiques aux lignées d'attaque ; digest Auto inchangé) ; B) assumer une lignée de soutien (renommage des sorts) ; C) statu quo.

### R2 — Lignées de l'Appel et du Pont : invocations qui ne s'invoquent jamais (12 sorts)

Racine : data « les renforts » + moteur : `actTeamStriker` résout tout sort de camp allié en buff ATQ ; `castSummon` n'est appelé que pour `classe Invocateur + effect.kind summon`. Les 12 sorts des familles `appel` (v1-v6) et `pont` (w13-w18) affichent « invocation · les renforts » et produisent un buff ATQ (mult−1) : aucun renfort n'apparaît.
- Archimage de l'Appel (v6) : Appel Mineur · Élémentaire de Braise · Meute Spirituelle · Portail · Légion Céleste · Appel Suprême.
- Ananké (w18) : Fil I → Fil VI.

[À TRANCHER §0 n°7-b] A) vraie invocation (un esprit rejoint la réserve/l'avant ; chantier moteur, le digest Auto bougera et devra être mesuré) ; B) attaques « au nom de l'invocation » (cible « 1 ennemi », digest Auto inchangé) ; C) buff assumé (fiche corrigée).

### R3 — Signatures des recrues à effet : la fiche annonce l'effet, le tour frappe (33 sorts)

Racine moteur : `applySupport` (lignes support, donc les ennemis) applique bien les rôles dérivés (bouclier, invocation, boost, lien, renvoi, stun, slow, dot, curse, warcry, revive). Mais depuis le Lot A (plus de ligne support joueur), les cartes du joueur jouent en ligne avant, et `actTeamStriker` **n'applique que le rôle soin** (v1.51) : toute signature avec `effect.kind` ≠ heal et sans `soloMult` est résolue en **frappe** (atk × 1,5) alors que la fenêtre affiche le vrai rôle (`signatureMetaOf`). La fiche ment ; le joueur vise l'équipe/les renforts et l'unité frappe.

- 16 bouclier : Matriarche des Récifs « Barrière de Corail », Ancien des Berges « Mur de Galet », Protecteur des Berges « Écran de Galets », Souffleur de Braises « Cendre Protectrice », Idole de Magma « Peau de Lave », Bergère des Sèves « Claie de Branches », Oracle des Clairières « Voûte de Clairière », Veilleuse de Bord « Drap de Nappe », Paladine Défunte « Égide Défunte », Garde-Flamme « Rempart Ardent », Plume Miroir « Plumage Miroir », Phénix Miroir « Renvoi Céleste », Chapelain du Jour « Aube Bénie », Prisme du Chœur « Reflet Protecteur », Chef du Chœur « Renvoi en Chœur », Aiguille du Pont « Point Serré ».
- 8 invocation : Invocateur des Foyers « Fournaise Invoquée », Gardien des Foyers « Fournaise Éternelle », Maître des Foyers « Gardiens Invoqués », Semeur Sylvestre « Sève Éveillée », Druidesse des Sèves « Sève Vitale », Archiliche des Caveaux « Voie du Tombeau », Éveillé des Caveaux « Rite d'Éveil », Liche des Caveaux « Légion des Caveaux ».
- 8 boost/manip : Foreure d'Âmes « Cri de la Forge », Meneuse de Deuil « Deuil Martial », Sermenteuse Défunte « Serment Rallié », Cantatrice du Zénith « Hymne du Zénith », Célestin « Cantique Final », Miroir Antiphonique « Chant Miroir » (soi), Tisseuse des Nœuds « Nœud d'Or », Architecte du Pont « Deux Rives ».
- 1 soin/résurrection : Adriel, Lumignole des Clairières « Première Clarté » (fiche soin « 1 allié », effet = frappe).

[À TRANCHER §0 n°7-c] A) appliquer l'effet affiché en Tactique (prolonge le tranchage v1.51 « une carte soigneuse a une signature de soin » ; le switch existe déjà côté support : shield → bouclier, summon → renfort, atkBuff/warcry → boost, link/copy → lien/renvoi, revive → résurrection ; branche tactique seule = digest Auto inchangé) ; B) aligner la fiche sur « dégâts » (l'effet ne s'applique qu'aux ennemis).

### R4 — Noms fusionnés au grimoire : largeur = MAX des crans au lieu du cran du porteur (racine moteur)

`largeurOfSpellName` prend `Math.max` des largeurs des crans du grimoire quand le nom du sort y existe (fusion des arbres). Toute signature portant un de ces 13 noms (Lame d'Écume, Morsure Putride, Colonne de Feu, Marque Corrosive, Sève Rongeuse, Hurlement, Fournaise Invoquée, Étreinte des Profondeurs, Mélodie envoûtante…) frappe en **zone totale (5)** au lieu du cran du porteur.
- Constat direct : Souffle Ardent « Colonne de Feu » et Goule des Caveaux « Morsure Putride » : fiche « 1 ennemi » (zone fiche 2), frappe les 3 mannequins.
- Les 4 noms « équipe » (Barrière de Corail, Vigie des Flots, Renvoi Céleste, Hymne) sont masqués aujourd'hui par R3 (frappes à 1 cible) et se révèleront au fix R3 : la largeur doit être corrigée en même temps (largeur du cran du porteur, 1 par défaut pour une signature).

Pas de tranchage : correctif moteur (largeur = cran du porteur, jamais le max des crans). Digest Auto à vérifier (les ennemis passent par `castFoeSpell` qui utilise aussi `largeurOfSpellName`).

### R5 — Badges contrôle/malus qui mentent : aucun effet de contrôle ne s'applique (32 sorts)

Le remappage famille → école propage le rôle de l'école aux sorts de lignée (badge affiché), mais les sorts de lignée n'ont **ni taux ni tours** dans les data, et le moteur ne pose aucun statut pour eux : la fiche affiche « contrôle »/« malus », l'effet est une frappe sèche. Idem pour les signatures de monstres à effet stun/slow/curse/dot côté joueur (R3), l'Œil du Malheur de classe (desc « −20 % de précision × 2 tours » jamais appliquée), et les signatures des recrues à effet contrôle.

- Lignée Bosquet (école Entrave, 6 sorts) : Trait d'Épine · Lance d'Aubier · Épine Vengeresse · Rafale d'Épines · Maïa : Danse des Feuilles · Maïa : Cœur du Bosquet (via Maïa a28).
- Lignée Seuil (école Entrave, 6 sorts) : Sablier I → VI (via Kairos w6).
- Lignée Braise (école Mauvais-Œil, 6 sorts) : Étincelle Filante · Flèche de Feu · Jet de Braise · Fournaise · Solen : Couronne de Feu · Solen : Braise Éternelle (via Solen a23).
- Lignée Crépuscule (école Mauvais-Œil, 6 sorts) : Griffe Nocturne · Voile d'Ombre · Malédiction du Soir · Danse des Ombres · Oubli Éternel · Nuit Sans Fin (via Vesperine q6).
- Œil du Malheur (sort de classe Occultiste, 2 porteuses testées n12/n15) : malus annoncé, frappe seule.
- 6 signatures « contrôle » de monstres : Marée Traîtresse, Chant Paralysant, Filet de Suie, Ombre Tissée, Sable Glissant, Sentence Lente.

[À TRANCHER §0 n°7-d] A) implémenter les effets (données taux/tours à créer pour les 24 sorts de lignée ; prolongement naturel des specs v4 « sorts libres ») ; B) retirer les badges contrôle/malus de l'affichage tant que les effets n'existent pas (les sorts restent des frappes, fiche honnête) ; C) diffé : specs v4.

## Ce qui est conforme (224 sorts)

- Les 7 lignées d'attaque (lame, ombre, eau, aube-soins, bouclier-équipe, zele-boosts, miroir) et la lignée Aube (soins) : fiches et effets cohérents, puissances conformes (ratio dmg/(atk×mult) ≈ 1,0 sur les 8 seeds), ciblage conforme.
- Les sorts communs (Frappe Précise, Premiers Soins), les sorts de race, les sorts de classe dégâts (Brise-Garde, Frappe dans le Dos, Décharge Arcanique « zone » cohérente en zone de 3, Onde Consacrée), les signatures soigneuses (v1.51), les signatures dégâts des monstres, les gimmicks (belier ×1,5 documenté, volee, carrousel) : tous conformes.
- Note d'affichage (non bloquant) : les boosts de la lignée Zèle (Ferveur) affichent « ×1,4 ATQ » pour un effet « +40 % à la prochaine frappe de l'allié » : cohérent, mais le libellé pourrait préciser « +40 % ».

## Impact sur le digest (à consigner par le couloir 1)

- R1 (cible data Vol « 1 ennemi ») : **digest Auto inchangé** (le chemin auto ne consulte pas la cible ; le bug était purement Tactique).
- R3 (fix branche Tactique seule) : **digest Auto inchangé** si le chemin auto n'est pas touché (les ennemis déjà conformes via applySupport).
- R2 (vraie invocation) : digest Auto **bougera** (les sorts Appel/Pont passeront de frappe à invocation en auto) : à mesurer et consigner comme digest documenté.
- R4 (largeur cran) : digest Auto **à vérifier** (les ennemis utilisent aussi `largeurOfSpellName`).

## Preuve de revalidation attendue après correctifs

`node audit-sorts.mjs` rejoué : 0 anomalie sur les lots livrés (les verdicts R1-R5 basculent vers HOSTILE_OK/ALLIE_OK), plus les preuves standard (build, tests, smoke, digests 3000/10000 consignés).
