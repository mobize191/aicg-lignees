# Arts manquants — cartes du contenu v3 (37)

> Constat du 12/11 (signalement Marc-Olivier via « Lame Miroir » w7). Ces 37 cartes existent dans data/cards.json et sont jouables, mais n'ont NI prompt (tools/prompts-v3.json), NI seed (tools/seeds-v3.csv), NI image, NI entrée de manifeste (assets-v3.json / assets-v3.1.json) : le front affiche le fallback sans illustration (artOf() = manifeste uniquement). Elles viennent du chantier contenu v3 (couloir 1), codé après le gel du périmètre image (271 arts). À intégrer au lot image 3.2, verrous R11-R14 applicables, seeds 2150000+.

| Lot | Cartes | Détail |
|---|---|---|
| Compagnons évolutifs | c1-c14 | Yuki (lame), Onyx (ombre), Naïa (eau), Aïna (aube), Roc (bouclier), Ember (braise), Sylve (bosquet) — 7 × {UR, L} |
| Divines | p5, p6 | Séraphin Porteur de Lumière (UR, seuil), Séraphin Chérubin Éveillé (L, seuil) |
| Famille Seuil | w1-w6 | Garde du Seuil (C) → Kairos, Juge Éternel (L) — Kairos a DÉJÀ sa vidéo WAN (wan21-kairos.webm) mais pas d'art fixe |
| Famille Miroir | w7-w12 | Lame Miroir (C, signalée), Choriste Miroir (UC), Prisme du Chœur (R), Miroir Antiphonique (SR), Chef du Chœur (UR), Écho Refrain Absolu (L) |
| Famille Pont | w13-w18 | Fileuse (C) → Architecte (UR), Ananké Gardienne des Rives (L) — Ananké a DÉJÀ sa vidéo WAN (wan21-ananke.webm) |
| Renouvelées | w19-w21 | Sirène Nouvelle (C), Fée Nouvelle (C), Gorgonne Nouvelle (C) |

**Notes de spéc** : compagnons = humanoïdes nommés (character_dna à créer, IPAdapter pour cohérence UR→L de chaque personnage, même identité sur les 2 raretés) ; famille Miroir/Pont/Seuil = univers Zénith/mystique, tenues correctes R12 ; les 3 « Nouvelle » reprennent les espèces sirène/fée/gorgonne ; Sirène = humanoïde assumé, Gorgonne = bête à chevelure de serpents (R11 : description morphologie pure).

**Correction du 12/11 (QA couloir design, diff systématique)** : le lot est de **37, pas 38** — `p2` (Ange Gardien) a DÉJÀ son art : entrée `art.p2` présente dans assets-v3.json ET assets-v3.1.json (data-URI 83 Ko, clé lue par `artOf()` = id de carte). Vérification : diff exhaustif `data/cards.json` (150 cartes) × clés `art` des deux manifestes (362 arts) → manquants exacts : c1-c14, p5, p6, w1-w21. Les monstres (159, ids distincts) sont tous couverts. La ligne « Divines » ci-dessus est corrigée en conséquence.
