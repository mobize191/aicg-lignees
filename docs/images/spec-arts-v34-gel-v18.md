# Spéc v3.4 — EXTENSION GEL v18 + thèmes d'exception élargis (Classique + Repos + Obscures pour TOUTES les cartes)

> Compagnon de `docs/images/spec-arts-v34.md` (correctifs d'espèces + mécanique Exception) — ARBITRÉ par Marc-Olivier le 15/11 (suite 36) : « on va tout lancer d'un coup ». La 3.4 couvre l'intégralité du catalogue avec **3 illustrations par carte**. Périmètre v18 : `docs/design/design-arbres-v18.md` §6.

## 1. Les nouvelles cartes du gel v18 (arts à créer)

Espèce TOUJOURS depuis les data (règle species-map : build-prompts ÉCHOUE pour toute carte sans entrée). Les entrées nouvelles ci-dessous complètent `tools/species-map.json` (v3). Nommées → IPAdapter.

### 1.1 Camp démon (18 cartes, grammaire MTG demon : DIABLES HUMANOÏDES, jamais « beast »)
| Carte | Espèce (clé) | Description canon |
| --- | --- | --- |
| n14 Diablotin (C) | `imp` | a small impish humanoid demon, ash-grey skin, small curved horns, stubby bat wings, long thin tail, mischievous toothy grin, tattered loincloth |
| Démon du Désir (UC) | `demonDesire` | a lean elegant humanoid demon, wine-red skin, sharp handsome features, slim horns, tailored dark silk attire, seductive smirk |
| Succube (R) | `succubus` | a beautiful winged succubus, a shapely female demon, small bat wings, small horns, thin barbed tail, elegant dark gown (gel v1 : canon D&D/MTG, rien de vulgaire) |
| Grande Succube (SR) | `succubusGreater` | same, regal demoness, crown of dark flame, ornate black-gold gown, larger wings |
| Dame du Désir (UR) | `ladyOfDesire` | a towering regal demon noblewoman, obsidian skin, golden ornaments, commanding presence, ornate throne-room attire |
| Asmodia, Reine du Désir (L) | `asmodia` | écho féminin d'Asmodeus (D&D) : a majestic infernal queen, tall statuesque humanoid devil, black-gold regal robes, crown of black fire, elegant curved horns, commanding smile |
| Gouffre des Vices (R) | `viceMaw` | a gaunt bestial demon, stretched grey hide, multiple thin arms, a gaping fanged maw (trappe BESTIALE — exception assumée à la grammaire humanoïde) |
| Grand Gouffre (SR) | `viceMawGreater` | same, hulking, distended maw, clawed limbs, emaciated dread presence |
| Gueule de l'Abîme (UR) | `abyssMaw` | a colossal demonic maw-monster, ringed with fangs, clawed limbs, dark void halo (jamais de blessures : R13) |
| Famine (L) | `famine` | cavalière D&D de la Famine : an emaciated regal demon, hollow cheeks, towering gaunt frame, tattered royal robes, an eternally empty chalice, devouring shadow aura — NO open wounds (R13) |
| Démon des Fosses (UC) | `demonPit` | a stocky brutish humanoid demon, thick horns, heavy jaw, iron chains, scarred leather harness |
| Démon Majeur (R) | `demonGreater` | a tall armored humanoid demon, black plate armor, blazing eyes |
| Seigneur Démon (SR) | `demonLord` | an armored demon commander, horned helm, tattered banner, commanding pose |
| Prince Démon (UR) | `demonPrince` | a regal horned demon prince, ornate dark armor, infernal crown, commanding presence |
| Belzébuth, Roi des Démons (L) | `belzebuth` | forme humanoïde D&D de Baalzebul : a tall dark-skinned infernal king, compound eyes like a fly, black regal robes with gold, a halo of hovering flies, lordly pose, crowned |
| Fléau Démoniaque (R) | `plagueDemon` | a lean demon shrouded in a swarm of flies, insectile wings, sickly green miasma (pas de blessures) |
| Grand Fléau (SR) | `plagueDemonGreater` | a chitin-plated demon, insectile limbs, fly-swarm cloak, plague censer |
| Porte-Peste (UR) | `plagueBearer` | a hooded towering demon carrying a smoking plague censer, ornate rusted armor, green fog |
| Peste, Mère des Fléaux (L) | `peste` | a regal hooded plague queen, a demon mother of plagues, ornate funeral robes, sickly green flames in hand, swarming halo (R13 : AUCUNE plaie ouverte) |

### 1.2 Anges (canon D&D — divin)
| Carte | Espèce | Description |
| --- | --- | --- |
| p1 Jeune Séraphin (UC) | `seraphYoung` | a child-like radiant angel, small white wings, simple white-gold robes, soft halo |
| p5 Séraphin, Porteur de Lumière (R) | `seraphBearer` | a young angel warrior bearing golden light, two large white feathered wings, white-gold armor, radiant halo |
| Ange de Lumière (SR) ➕ | `angelLight` | an armored angel of light, gleaming white-gold plate, large wings, blazing halo |
| Archange (UR) ➕ | `archangel` | a majestic armored archangel, towering, radiant halo, large white-gold feathered wings, flaming sword |
| Séraphin, Archange Ultime (L) | `seraphUltimate` | canon séraphin + solar D&D : a supreme radiant archangel, SIX large white-gold feathered wings, blazing crown of light, solar halo |
| Ange Ardent (R) | `fallenAngelArdent` | a fierce angel of burning pride, white-gold armor cracked with veins of black fire, intense gaze |
| Ange du Zénith (SR) | `fallenAngelZenith` | same, dark-gold armor, solar coronation, haughty pose |
| Astre Vaillant (UR) | `fallenStar` | a towering solar warrior (D&D solar), large radiant feathered wings, dark-gold armor, blazing spear |
| Astre Rayonnant (L) | `darkSun` | a supreme solar king turned to pride, six radiant wings, black-edged golden corona, majestic and menacing — lumière noire, JAMAIS gore |
| z8 Astre Capiteux (re-race divine) | `solarDeity` | INCHANGÉ + `large radiant feathered wings` (canon D&D solar, déjà acté suite 16) |

### 1.3 Gorgones (canon MTG : FEMME aux cheveux de serpents — INTERDIT la méduse-animale jellyfish)
Espèce `gorgon` réécrite : a gorgon like Medusa, a pale beautiful woman with living hissing snakes for hair, green scaled skin, serpentine eyes, a petrifying gaze. Déclinaisons : Serpent des Récifs (UC, jeune gorgone), Fileuse du Regard (R), Pétrifiante des Écueils (SR), Gorgonne Immaculée (UR), **Méduse, Reine des Écueils (L)** = canon intégral (serpents royaux, regard pétrifiant). Voie des serpents : Mère des Serpents (SR), Grande Serpentine (UR), **Euryale, Nourrice des Serpents (L)** = canon Theros : serpentine LOWER BODY (naga-like), serpents royaux.
Négatif commun obligatoire : `jellyfish`.

### 1.4 Fées (canon MTG : humanoïdes minuscules ailés, farceurs)
Espèce `faerie` : a tiny winged faerie, a diminutive humanoid with iridescent insect wings, delicate features, playful trickster grin, wild moss-and-petal attire. Déclinaisons : Fée des Groves (R), Fée des Jeux (SR), Souveraine des Jeux (UR), **Mab, Souveraine des Jeux (L)** = pixie queen : a regal tiny faerie queen, gossamer gown, crown of dewdrops. Voie des ronces : Fée des Ronces (SR), Reine des Ronces (UR), **Aubépine, Reine des Ronces (L)** = thorn faerie queen, crown of hawthorn spikes, briar-rose gown. Luciole Hargneuse UC = `fireflySpirit` existant (g2).

### 1.5 Humains (paladin, chevalier)
Paladin R, Paladin Sacré SR, Paladine Sacrée UR : armure sacralisée or-blanc, tabard aube, écusard solaire. **Isaure, Égide de l'Aube (L)** : paladine suprême, armure or-blanc irradiante, bouclier aurore. Chevalier R, Chevalière du Rempart SR, Gardienne du Rempart UR : armures de rempart or-gris. **Kiri l'Invincible (L)** : femme aux longs cheveux noirs lisses, armure noire intégrale, lame au repos (art alternatif « robe blanche immaculée » = sa version Exception, à conserver parmi les thèmes).

### 1.6 Marées (boss)
**Hydre des Marées** : espèce `hydra` — a massive multi-headed sea hydra, THREE serpentine heads on long necks, scaled hide, fins, coral crowns (canon D&D/MTG : le trait distinctif est les TÊTES MULTIPLES). **Souverain des Marées** : `merSovereign` — a colossal crowned sea-beast king, barnacled crown of shipwrecks, crustacean plates, trident of bone, royal kelp mantle.

### 1.7 Retraits / conservations
- p2 **Ange Gardien : RETIRÉ** (confirme mort, suite 30) — aucune génération, entrée manifeste supprimée.
- e15/e21/e22 (berges) : arts ACTUELS conservés, hors périmètre de régénération 3.4 (spec donjons à venir).
- Vitrine Dryades (g9-g21) : noms conservés, arts MTG canon (bois de cerf retirés — déjà acté suite 17).
- k2 `stagnantNymph`, k13 `ghoulFeral`, k15 `ghoulRisen`, k1 `carrionBeast`, k12 `ghostMourner`, g13 `treant` : reclassifications déjà actées (spec v3.4 §1).

## 2. Thèmes d'exception ÉLARGIS (arbitrage suite 36)

**CHAQUE carte du catalogue reçoit 3 illustrations** :

| Version | Fichier | Seed | Marqueur CSS |
| --- | --- | --- | --- |
| Classique (canon 3.4) | `{id}.jpg` | seed v3.3 (nouvelles : bloc 2 250 000+) | aucun |
| Lignées au Repos (thème A) | `{id}-r.jpg` | classique + 5 000 000 | sweep OR CHAUD croisé 60° (distinct des rares 105°) |
| Lignées Obscures (thème C) | `{id}-o.jpg` | classique + 10 000 000 | liseré + sweep ROUGE SOMBRE |

- **Repos** (définition `test-themes-exception.md` §1-A) : scène de vie du biome, activité calme, sans magie ni combat. L'espèce, le personnage, la tenue canon sont conservés.
- **Obscures** (§1-C) : inversion d'alignement/élément — corruption par l'ombre pour les lumineuses, purification dorée pour les obscures, élément inversé pour les neutres (golem de magma → cristal de glace spectral). Espèce et pose conservées, seule la magie s'échange. **R13 conservé : JAMAIS de gore, jamais de changement d'espèce.**
- **Crépuscule (thème B) : DIFFÉRÉ** — candidat « 3.4 bis » du grand tableau comparatif.
- Mécanique en jeu INCHANGÉE (suite 14) : titre seul + apposition action/lieu/situation, taux **1/100** (tirage **50 % Repos / 50 % Obscures**), transfert du statut à la fusion, digest inchangé, bonus cosmétique seul.
- Nommées : IPAdapter 0.4 sur les 3 versions (identité maximale classique ↔ Repos ↔ Obscures).

## 3. Process (point d'arrêt conservé)

1. Prérequis : `data/cards.json` mis à jour par Marc-Olivier (gel v18 + retrait p2) poussé sur main.
2. Compléter `tools/species-map.json` (v3, entrées §1 ci-dessus) → builder `build-prompts-v34.mjs` : base v3.3 + reclassifications + gel v18 + 2 jeux de prompts thèmes (Repos/Obscures) + seeds. ÉCHEC explicite sur toute carte sans espèce.
3. **POINT D'ARRÊT** : push `tools/prompts-v34.json` + `docs/images/RAPPORT-build-v34.md` (comptages : classiques/régénérations, gel v18, Repos, Obscures ; longueurs négatif ; zéro canidé attendu ; durée estimée) → validation écrite de Marc-Olivier.
4. Génération ComfyUI complète (classique + -r + -o), canon §15 inchangé (WAI-Illustrious v17, Euler a, 28 steps, CFG 5.5, hires ×1.25, ADetailer 0.32), retries +1 max 2, crop signatures 4 % bas-droit sur toute la production. Durée réelle s/image consignée.
5. Push en clôture : ~1 100 jpg + manifeste `assets-v34.json` (3 clés par carte) + switch 5 versions (V3→V3.4, ART_MANIFESTS étendu) + mécanique Exception + déploiement Pages.

## 4. QA (criterium)
Zéro canidé ; zéro sang (R13) ; zéro Fx ; canon espèces du §1 (gorgone = femme aux serpents, PAS jellyfish ; hydre = 3 têtes ; Belzébuth humanoïde royal ; fées minuscules ailées) ; identité des nommées préservée sur les 3 versions (comparaison côte à côte) ; les 3 versions lisiblement distinctes sans légende ; style painterly sans dérive anime/3D ; compagnons UR↔L cohérents ; planches contact = détection uniquement.
