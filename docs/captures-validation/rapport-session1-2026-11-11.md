# Rapport de validation — session 1 (correctifs terrain UI), 11/11/2026

Dist validé : `875c2f3` (6 commits de correctifs sur `0eaee4d`), build déterministe vérifié (deux builds identiques).

## Preuves moteur (chaîne AGENT.md)

- `node build.mjs` : ok, dist.html 568 850 caractères.
- `node --test` : **115/115 verts**.
- `node smoke-ui.mjs dist.html` : **171/171 TOUT PASSE** (le « 1 échec » local sur checkout Windows CRLF est un artefact de fins de ligne du check 45e, pas un bug ; 171/171 sur le dist normalisé LF).
- `node combat-digest.mjs dist.html 3000` : digest **`833a6d2c60131fbd21b021c701daa90f308275961e03c479500c032eb5b98a24`**, **518/3000**, 0 exception, 1 marathon — **inchangé**, conforme au plan (aucune maths touchée).

## Vérification des 6 correctifs dans le dist (statique)

| Correctif | Statut |
|---|---|
| Dédoublonnage `inst.acc` + fusion `instSpells` (`spellKeyOf`/`unknownSpellsOf`) | OK présent |
| `elOf()` : le pion `.unit[data-uid]` prime sur les autres `data-uid` (rail d'ordre) | OK présent |
| Bouton réduire de la fenêtre d'action (`act-reduce`, `.act-modal.reduced`) | OK présent |
| `FAM_ORDER` = 11 familles (4 v3 : crepuscule, vol, zele, appel) | OK présent |
| Boutons ≥ 32 px en mobile (media query 600px) | OK présent |
| Double bordure des cartes supprimée (anneaux `inset` retirés) | OK présent |

## Scénarios navigateur S1–S10 (protocole validation-ihm.md)

**Non exécutés dans cette session** : aucun agent équipé de Chromium n'est disponible dans cet environnement (le harnas smoke simule le DOM, il ne rend pas). À rejouer avec un agent navigateur (Playwright/Cursor) sur `http://localhost:8080/dist.html`, viewports 1440×900 et 390×844, en ciblant en priorité : la fenêtre d'action réduite (S7), le ciblage par pion vs rail (S7), les 4 nouvelles familles dans la collection (S3), la taille des boutons en 390px (S4/S7), la bordure simple des cartes (S3/S8).

Verdict : moteurs et correctifs OK côté automatisable ; validation visuelle réelle en attente d'un environnement navigateur.
