# Candidats LoRA pour les monstres et créatures mystiques (v3.2 / R11)

> Recherche Civitai du 12/11 (API, tri Highest Rated, filtre bases Illustrious / SDXL / NoobAI). Objectif : ancrer la morphologie des espèces récalcitrantes (R11) SANS régresser le style painterly validé. Test témoin obligatoire avant adoption (6 images par LoRA, poids 0.6-0.8, verdict morphologie + style) ; rejet = fallback sur les descriptions R11 de `species-map.json`. Aucune régression de style acceptée pour gagner de la morphologie.

## Priorité 1 — testés en premier (impact maximal sur les défauts constatés)

| Espèce(s) ciblée(s) | LoRA | Base | Note |
|---|---|---|---|
| Gobelin des Marées (et gobelins du contenu v3) | [Goblin \| IL & Pony & Anima \| DND](https://civitai.com/models/492126) | **Illustrious natif**, ⭐864, dl 6,4k, SFW | LE candidat n°1 : gobelin D&D classique (vert, noueux, grandes oreilles), exactement le canon visé. Versions Illustrious ET Anima disponibles. |
| treant, dryad, fireflySpirit, esprits du Bosquet | [Forest Guardians \[Dragon/Treant/Dryad/Spirit\] IL&NoobAI](https://civitai.com/models/1039143) | Illustrious + NoobAI, ⭐165, SFW | Multi-espèces (un seul LoRA pour 4 espèces du Bosquet) — cœur de la forêt = ent, dryades, esprits. Signe « Shrekman Aesthetic Loras » : série sérieuse de concept LoRAs nature. |
| magmaGolem (Vulcain), golems/bêtes minérales de la Forge | [Golems - Illustrious](https://civitai.com/models/574367) | **Illustrious natif**, ⭐90, SFW | Golems + élémentaires ; a priori le plus proche du magma golem. |
| seaBehemoth / léviathan des Marées | [Leviathan XL](https://civitai.com/models/237733) | **Illustrious natif**, ⭐154, SFW | **ACTÉ Marc-Olivier 12/11.** Canon visuel = le Léviathan du film Disney « Atlantide, la cité perdue » (monstre colossal à carapace de crustacé, yeux rouges luisants, gueule à tentacules). **Route 1 : description R11** « a colossal ancient armored sea monster like the Leviathan from Atlantis: The Lost Empire, massive crustacean shell carapace, glowing red eyes, tentacled maw, dark underwater ruins » + **Leviathan XL en appui** (léviathan mythique générique, ancre la morphologie non humanoïde). Tidehunter DotA2 écarté (géant bleu humanoïde, pas la cible) ; aucun LoRA dédié au design Disney n'existe sur Civitai. |

## Priorité 2 — selon résultats P1

| Espèce(s) ciblée(s) | LoRA | Base | Note |
|---|---|---|---|
| lich, undeadCaptain, beastDark humanoïde | [Undead (World of Warcraft)](https://civitai.com/models/1530870) | **Illustrious natif**, ⭐65, SFW | Mort-vivant WoW : anatomie décharnée fiable. |
| banshee (Macha) | [Banshee \| Vampire Counts (Total War Warhammer)](https://civitai.com/models/828302) | NoobAI + Pony, ⭐81 | Esthétique Warhammer Fantasy, très proche du canon (fantôme gothique féminin). Base NoobAI : compatible lignée Illustrious, test plus prudent (poids 0.5-0.6). |
| banshee (variante) | [Banshee for Pony/Illus](https://civitai.com/models/438695) | Illustrious + Pony, ⭐88 | Tag « monster girl » : risque de féminisation, à comparer au 828302. |
| fungusQueen (Mycola), fongus du Bosquet | [Cordyceps XL LoRA](https://civitai.com/models/246852) | **SDXL 1.0**, ⭐64, SFW | Esthétique fongique/infection (cordyceps) : la plus proche du fongus MTG. Base SDXL : marche sur Illustrious (même architecture) mais dérive de style plus probable, test strict. |
| beastDark générique (bêtes de la Crypte) | [Creepy Wolf Monster (SFW) - IL](https://civitai.com/models/1329245) | Illustrious + SDXL, ⭐60, SFW | Bête monstrueuse pour les Bestiau/bêtes d'attaque sombres. |

## Priorité 3 — boosters de style génériques (optionnels, à ne tester que si P1/P2 laissent des manques)

| Cible | LoRA | Base | Note |
|---|---|---|---|
| Tous les monstres (style) | [\[XL\] dark_fantasy_creature](https://civitai.com/models/147462) | **SDXL 1.0**, ⭐245, dl 1,2k, SFW | Le plus populaire de la catégorie ; risque : c'est un style LoRA (modifie TOUTE l'image), poids bas 0.4-0.5 max. |
| Créatures concept | [Creature Concept Designer LoRa - Illustrious XL](https://civitai.com/models/1944005) | SDXL, ⭐28 | Concept art créatures ; tag « 3d artists » : risque de dérive 3D, notre style est painterly — seulement si les tests le montrent neutre. |
| Mermaid (si besoin) | [Mermaid (Shin Megami Tensei) \[IllustriousXL\]](https://civitai.com/models/1304780) | Illustrious, ⭐105 | Sirène assumée humanoïde : moins prioritaire, les espèces humanoïdes ne sont pas le défaut n°1. |

## Protocole de test (rappel, cf. correction-prompts-v3.md §7)

1. Télécharger les 4 LoRAs P1 (+ P2 si budget). Versions Illustrious natives privilégiées ; NoobAI accepté à poids réduit (0.5-0.6) ; SDXL accepté en test strict.
2. 6 témoins par LoRA, mêmes seeds que les cartes concernées, poids 0.6/0.7/0.8 (2 images par poids) pour tracer la courbe.
3. QA vision auto : (a) morphologie correcte pour l'espèce ? (b) style painterly inchangé (zéro dérive anime/3D) ? Les DEUX pour garder.
4. Verdict par LoRA consigné dans `RAPPORT-vague3-2.md` (gardé/rejeté + poids retenu) ; rejet = fallback descriptions R11, pas d'arrêt humain.
5. Un LoRA gardé s'applique UNIQUEMENT aux cartes de son espèce, jamais en global.

## Candidats écartés d'office (consignés pour mémoire)

- **Monster Girl Encyclopedia (Lich/Dryad/Banshee…)** : canon monster-girl féminisé, contredit R10 (parité) et l'esprit « monstre = monstre ». Écarté.
- **Goblin girl / Goblin Slayer (personnages)** : personnages précis ou féminisation, pas l'espèce générique. Écarté (sauf le 492126 qui est l'espèce D&D).
- **SD 1.5** (ex. Goblins ⭐3363) : architecture incompatible avec WAI-Illustrious (SDXL). Écarté.
- **Marvel/Marvel Rivals Phoenix, NIKKE Leviathan, Jean Grey** : personnages nommés sous copyright, pas des espèces. Écartés.
- **Leviathan the Tidehunter (DotA2)** : écarté (Marc-Olivier, 12/11) — géant bleu humanoïde, pas le gardien carapacé du canon Atlantide.
- **Atlantis 2001 (Krea 2)** et **Atlantis tech - World Morph (SD 1.5)** : bases incompatibles avec WAI-Illustrious, et personnages du film, pas l'espèce. Écartés.
