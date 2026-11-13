# Audit des espèces « créatures mystiques » mal classées (constat 13/11, pour la vague 3.4)

> Contexte : le correctif k2 « Nymphe Croupie » (reclassée `stagnantNymph`, cf. arbitrages 13/11 suite 3) a révélé un défaut **systémique** : les génériques de la Crypte classées `beastWater`/`beastDark` ont toutes reçu le prompt « bête » du verrou R8 (positif `a beast, monstrous, claws, fangs, a wild non-humanoid creature, no human traits, no human face` + négatif anti-humanoïde), alors que leurs noms décrivent des **humanoïdes mystiques** (noyés, endeuillés, banshee, liche, fossoyeur). Résultat vérifié par QA vision sur les arts v3.1 poussés : dragons et loups à la place des personnages.

## 1. Constat confirmé par vision (12 cartes, bloc Crypte)

QA vision indépendant sur `tools/out-v2/v31/` : les cartes ci-dessous sont rendues comme des **monstres non-humanoïdes** (dragon écailleux ou bête lupine) alors que le nom désigne un humanoïde/deux-pieds :

| Carte | Nom | Rareté | Espèce actuelle | Rendu v3.1 | Reclassification proposée (3.4) |
|---|---|---|---|---|---|
| k2 | Nymphe Croupie | C | beastWater | dragon ailé | `stagnantNymph` — **DÉJÀ TRANCHÉ** |
| k3 | Fossoyeur Nocturne | UC | beastDark | monstre | `undead` humanoïde (fossoyeur cadavérique, pioche) |
| k5 | Spectre des Quais | SR | beastDark | monstre | `ghost` (spectre translucide humanoïde) |
| k6 | Banshee des Caveaux | UR | beastDark | bête lupine | `banshee` (cf. Macha k14, esprit féminin hurlant) |
| k8 | Ancien Naufragé | M | beastWater | monstre | `undeadDrowned` (vieil homme noyé, barbe d'algues) |
| k9 | Servante Pâle | C | beastWater | dragon | `ghost` (servante fantôme, tablier flottant, F) |
| k10 | Meneuse de Deuil | R | beastWater | monstre | `ghostMourner` (veuve en deuil, voile noir, F) |
| k11 | Prieuse des Naufragés | SR | beastWater | dragon | `ghost` (prieuse agenouillée, F) |
| k16 | Liche des Caveaux | UR | beastDark | bête lupine | `lich` (mage squelettique encapuchonné, grimoire) |
| k18 | Endeuillée des Flots | UR | beastWater | dragon | `ghostMourner` (F) |
| k20 | Capitaine Noyé | SR | beastWater | dragon | `undeadDrowned` (capitaine en uniforme lacéré, M) |
| k21 | Revenu des Flots | UR | beastWater | monstre | `undeadDrowned` (revenant, M) |

Toutes : verrou R8 à RETIRER (ni positif bête ni négatif anti-humanoïde), genre à trancher (proposition ci-dessus), cadrage/pose conservés.

## 2. Incohérences prompt vs rendu (pas de défaut visuel, à harmoniser)

- **f21 Calcine, Dame des Cendres (L)** et **f4 Chevalier de Braise (R)** : classées `fireElemental` avec le prompt bête R8, mais rendues humanoïdes dans les faits (silhouette de femme/homme en flammes) : le checkpoint a ignoré le prompt. Le rendu actuel est probablement le bon ; en 3.4, harmoniser l'espèce avec le rendu voulu (élémentaire humanoïde de flammes) plutôt que de forcer un monstre.
- **f5 Invocateur des Foyers (SR), f23 Maître des Foyers (UR)** : noms humanoïdes dans la famille élémentaire non-humanoïde. Si la DA « élémentaires de la Forge = esprits de flamme » est assumée, renommer la cohérence interne (pas bloquant) ; sinon reclasser.

## 3. Ambigus à arbitrer (Marc-Olivier)

| Carte | Nom | Espèce | Question |
|---|---|---|---|
| k1 | Rôdeur des Caveaux | beastDark | bête rôdeuse ou goule rampante ? |
| k12 | Veilleuse de Bord | beastWater | lampe/esprit errant (feu follet) ou femme de veille ? |
| k13 | Goule des Caveaux | beastDark | au canon MTG/LotR une goule est humanoïde ; bête acceptable si DA assumée |
| k15 | Éveillé des Caveaux | beastDark | cadavre éveillé humanoïde ou monstre ? |
| n14 | Démon (C) | beastDark | démon-bête générique OK, ou diable humanoïde ? |
| g13 | Semeur Sylvestre | beastWood | semeur = humanoïde ou ent semateur ? |

## 4. Recommandation pour la vague 3.4

1. Créer dans `species-map.json` les espèces : `stagnantNymph` (acté), `banshee` (déjà utilisé par k14 : généraliser), `lich`, `ghost`, `ghostMourner`, `undeadDrowned`, avec descriptions R11 (morphologie concrète, canon MTG/LotR).
2. Retirer ces cartes du lot `beast:true` (verrou R8 + négatif anti-humanoïde + triggers Leviathan « bêtes aquatiques massives » pour les ex-beastWater).
3. Trancher les genres (proposition table §1 : F pour Servante/Meneuse/Prieuse/Endeuillée/Banshee, M pour Fossoyeur/Capitaine/Revenu/Ancien Naufragé, Spectre = F ou M au goût).
4. Arbitrer le tableau §3 avant le build 3.4.
5. QA 3.4 : comptage dédié « créatures mystiques = humanoïdes/esprits (pas des dragons ni des loups) ».

## 5. Note méthode

Audit croisé : `tools/prompts-v3.json` (positifs « a wild non-humanoid creature » + négatifs anti-humanoïde) × noms de cartes × QA vision des arts `tools/out-v2/v31/` poussés. Aucune carte « succube » n'existe dans `data/cards.json` (vérifié) : le périmètre réel = bloc Crypte + éléments de la Forge.
