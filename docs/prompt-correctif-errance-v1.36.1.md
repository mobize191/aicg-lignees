# Prompt — correctif errance v1.36.1 : grand lac, thème plage, interactions, héros vectoriel (retours terrain de Marc-Olivier, 12/11 6e tour)

> Statut : ACTÉ par Marc-Olivier (12/11, 6e tour — retours de test de la v1.36 déployée). Coulloir 1 : lis ce document en entier, puis exécute lot par lot. Une tâche = un commit FR. Preuve par lot : build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests INCHANGÉS + captures S24 (protocole `docs/validation-ihm.md`) pour les lots 2-4.

## Contexte

Marc-Olivier a testé la v1.36 en jeu et signale : carte entièrement recouverte d'eau (héros qui « marche sur l'eau », arbres/maisons/jarres « dans l'eau »), pas de point de retour ville visible, pas de donjon visible, interactions absentes ou sans aucune animation, et le personnage (sprite WAN animé) jugé moche. Diagnostic rejoué par le couloir pilotage sur main (`48e3865`), simulation de `genZoneMap` + lecture de `src/errance-paint.js` : **la collision est saine, la peinture est fausse**. Symptômes et preuves :

1. **Racine — « grand lac »** : `decorOrders` (`src/errance-paint.js`, calcul de `pond` vers les lignes 64-72) déduit l'étang peint de la bbox de **toutes** les tuiles `ET.EAU`. Or la ceinture de bord de carte (lignes/colonnes 0 et w-1/h-1, ~60 % EAU) participe à cette bbox → l'ellipse peinte couvre presque toute la carte (simulation Marées : centre (1440, 1056), rayons ≈ 1434×1050 px + anneau de sable `rx + 0,7·T`, sur un monde de 2944×2048). Toutes les tuiles PRAIRIE/CHEMIN/HERBES sont peintes sous l'eau → le héros marche sur des tuiles praticables peintes en eau, et les objets (arbres, huttes, jarres, donjon, retour, autel — tous peints par-dessus) semblent « plantés dans l'eau ». Le donjon et le retour ville EXISTENT et sont peints (`map.donjon`, `map.retour`, tuile RETOUR en (6,29) sur les Marées vérifiée par simulation), mais noyés dans le lac et introuvables en pratique.
2. **Interactions** : les huttes portent des dialogues en data (`errance.layout.huttes[].title/text`) mais le `pointerdown` de l'errance ne connaît que autel/porte/retour/jarre — **aucune interaction possible avec les maisons**. Les feedbacks existants (arc de frappe, étincelles, toasts) n'ont jamais été validés visuellement (smoke B21 = DOM/data, aucune capture S24 jouée à la livraison).
3. **Héros** : sprite WAN (image animée) — Marc-Olivier le rejette : « je préfère un petit bonhomme comme dans le HTML d'exemple ». La maquette `docs/design/maquettes/errance-demo-jouable.html` contient le héros vectoriel de référence (section « héros (peint, ombre directionnelle du soleil, halo nocturne, balancement) » : tunique à deux tons, jambes animées, tête, sacoche, bob + tilt + face).
4. **Thème des Marées** : « on fait une plage, pas un lac sur toute la carte » — la mer doit border la carte, pas la recouvrir. **Tranché par Marc-Olivier** : liseré d'eau peu profonde PRATICABLE, eau profonde infranchissable.

## Lots

### Lot 1 — Bug racine « grand lac » (prioritaire, immédiat)

- Le pond peint doit venir du **`layout.pond` en data quand présent** (les Marées l'ont : `{x:37, y:22, rx:5, ry:5}`) ; sinon, calculé **uniquement sur l'amas d'eau intérieur** : ignorer les tuiles EAU de la ceinture de bord (x ou y ∈ {0, w-1, h-1}) dans la bbox ; s'il ne reste aucune tuile intérieure, pas d'étang peint.
- Tout débordement de peinture d'eau/sable **hors des tuiles EAU borné à ≤ 0,25·T** (liseré écume/rive). Idem `pondDeep`, `pondGlints`, `reeds` : contraints dans le rayon du pond.
- **Garde-fou test headless** (partie pure, `decorOrders` est déjà chargée par `tests/errance.test.js` via `loadEngine`) : pour les 5 zones, `decorOrders(map, zone)` doit produire un pond dont l'ellipse + 0,25·T ne recouvre **aucune tuile non-EAU à plus de 0,25·T d'une tuile EAU** (assert : rayons ≤ bbox des tuiles EAU intérieures + marge 0,25·T ; présence de `layout.pond` ⇒ pond peint = pond data). Ce test aurait attrapé le bug : il échoue sur main, doit passer après le lot.

### Lot 2 — Thème plage des Marées + eau profonde / peu profonde (ACTÉ + TRANCHÉ)

- **Layout v3 des Marées en data** (`errance.layout`) : une plage — la mer occupe une **bande de bord** (rivage sud de préférence) avec plages de sable entre prairie et eau, un petit étang intérieur au plus, **aucune masse d'eau au centre de la carte**. La ceinture de bord des Marées devient sable + rochers/bois flottés côté mer (plus d'arbres dans l'eau).
- **Nouvelle tuile `EAU_PROFONDE` (SOLID)** vs `EAU_PEU_PROFONDE` **praticable** (liseré de 1-2 tuiles le long des rives). Règle appliquée aux 5 zones (les autres gardent leur identité : l'eau de la Crypte peut être entièrement profonde, le Bosquet des marigots, etc. — en data).
- Rendu distinct : profonde = sombre, opaque ; peu profonde = claire, translucide, reflets, et le héros y laisse des éclaboussures/traces.
- Rencontres uniquement dans les hautes herbes : **ENC_RATE inchangés**, l'eau peu profonde ne déclenche rien, n'apporte aucun loot, ne change aucune économie. `rescueHeroPos` doit secourir une position devenue EAU_PROFONDE (vérifier le set SOLID).
- Migration : aucune (les tuiles d'errance ne sont pas persistées) — mais vérifier que `erranceSavedPos` + `rescueHeroPos` couvrent le nouveau terrain.

### Lot 3 — Interactions et feedback visibles

- **Interaction huttes** : tap sur une maison → déplacement adjacent → dialogue (`title` + `text` en data) en encart/toast ; même mécanique que les autres objets (`pending`).
- Feedbacks d'interaction visibles et lisibles : halo de l'autel qui pulse au soin, porte du donjon qui s'ouvre/part au départ du combat, halo du retour ville au passage, marqueur de destination au sol (cercle) pendant le déplacement. Vérifier l'arc de frappe et les étincelles de jarre sur le nouveau fond (ils étaient noyés dans le lac).
- **Lisibilité donjon + retour ville** : le chemin visible y mène ; retour ville à ≤ 6 tuiles du spawn, avec enseigne « ↩ Ville » lisible et glow pulsé ; donjon repérable dès l'arrivée dans la zone (silhouette + panneau). Smoke B21 : durcir pour couvrir le retour à ≤ 6 tuiles du spawn et la présence des deux types d'eau.

### Lot 4 — Héros vectoriel « petit bonhomme » (ACTÉ, remplace le sprite WAN)

- Remplacer le rendu du héros (`heroSheet`/`heroPoster` dans `renderErrance`) par le **héros vectoriel de la maquette** : reprendre le code de référence (sacoche, jambes, tunique deux tons, ceinture, bras, tête/cheveux/œil) avec bob de marche, tilt dans les virages, miroir horizontal, ombre directionnelle et halo nocturne existants. Pas d'image externe, pas de `ctx.filter`/`shadowBlur`.
- Supprimer proprement le chargement du sprite WAN réservé à l'errance (l'asset reste dans les manifests pour d'autres usages, le câblage errance est retiré). La contrainte « sprite WAN gardé » du prompt de refonte est LEVÉE par cette décision.
- Direction du regard (face/dirx) conservée ; `prefers-reduced-motion` : bob et balancement gelés.

## Contraintes et hors périmètre

- `data/*.json` source de vérité (layout v3, tuiles d'eau, palettes en data) ; `dist.html` via `node build.mjs` uniquement ; re-fetch avant chaque édition ; zéro dépendance npm.
- **Digests INCHANGÉS attendus** : `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 (l'errance n'entre pas dans le digest ; ENC_RATE et maths intouchés).
- Captures du protocole IHM (S24 actualisé v1.36.1) **obligatoires pour les lots 2-4** (rendu visuel non vérifiable par le smoke) si un agent navigateur est disponible ; sinon consigner la limitation explicitement dans le commit — le faux vert de la v1.36 vient précisément de l'absence de capture.
- Hors périmètre : architecture donjons × errance (session de tranchage), maths de combat, équilibrage, économie, ENC_RATE.
- Consigner chaque lot dans `docs/arbitrages.md` (entrée en haut), CHANGELOG v1.36.1, roadmap à jour.
