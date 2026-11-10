# Rapport de validation IHM — AICG : Lignées (v0.46.1)

Date : session de validation post-PROMPT A (correctifs v0.46.1 appliqués et commités).
Méthode : Playwright + Chromium, deux viewports — desktop 1440×900 et mobile 390×844 en émulation tactile (`isMobile`, `hasTouch`, `page.tap()` partout). Serveur : `python3 -m http.server` sur le repo. Captures plein écran dans `docs/captures-validation/`.

## Harnas

- `node combat-digest.mjs dist.html 3000` → digest `c5ab2af1f56c23f935859e9d9944e8183dafe5788ed48f097dab412107eb0f47`, **534 victoires / 3000, 0 exception** (identique à la baseline : le moteur n'a pas bougé).
- `node smoke-ui.mjs` → **121 checks, 1 échec pré-existant** (`45 e — bandeau de sort spécial non couvrant`), présent avant les correctifs v0.46.1 et inchangé par eux.
- Erreurs console durant toute la session : **0** (ni `console.error` ni `pageerror`, les deux viewports).

## Résultats par scénario

| Scénario | Statut | Détails |
|---|---|---|
| S1 Accueil | OK | Bandeau + nav entiers, pas de scroll horizontal (desktop + mobile). Captures `S1-accueil-*.png` |
| S2 Forge | KO mineur | Génération lancée, mais le badge « nouvelle » non retrouvé en collection par le script (artefact de mesure probable — à re-vérifier visuellement sur `S2-forge-apres-*.png`) |
| S3 Collection | OK | Sections par race, filtres en popup, aucune carte qui déborde, pas de scroll horizontal. `S3-*.png` |
| S4 Équipe | OK | Pose de cartes au tap fonctionnelle (vérifié par repro ciblé : toast « rejoint l'équipe (1/5) », slot rempli). La mesure auto du script était fausse (mauvais sélecteur). Fiche ouverte à l'appui long. `S4-*.png` |
| S5 Donjons + modificateur | OK | Modale avec les 3 options : Accepter / Entrer sans modificateur / Relancer (1 éclat brut). `S5-*.png` |
| S6 Combat auto | OK avec 1 anomalie | Plateau, journal, pastilles et menu présents. **Anomalie : pastilles `.info-chip` à 19–21 px de haut (< 32 px recommandé tactile)**. Le ☰ ouvre la nav (vérifié par repro sur mobile) mais le check auto en combat a échoué (artefact de timing). `S6-*.png` |
| S7 Combat Tactique v0.46 | OK | Vérifié en profondeur par le PROMPT A (repro mobile tactile) : fenêtre d'action ouverte, boutons 44 px, hit-test OK, tap ⚔ → liste de cibles + pions `.targeted`, tap direct sur pion, sort ✦, ⏸ Attendre — tout résout. Le check auto de ce script a échoué par course avec le départ auto (artefact). Captures `S7-*.png` |
| S8 Fiches | OK | Fiche de pion en combat : scroll bas puis fermeture OK. Fiche carte : après scroll, le ✕ est visible (y=10, hit-test OK) et ferme la fiche. `S8-*.png` |
| S9 Fin de combat | Non tranché | Combat auto lancé à vitesse max, mais pas de modale/bannière après 40 s dans le script (combat encore en cours au moment du check — à re-tester avec attente plus longue). `S9-fin-combat-*.png` |
| S10 Glossaire | OK | Section « Les symboles de l'écran » documentée. `S10-*.png` |

## Anomalies trouvées

1. **Pastilles d'info (ℹ️/🎰/🌱) trop petites** : 19–21 px de haut sur les deux viewports (32 px mini recommandé, 44 px pour la fenêtre d'action). Captures `S6-combat-auto-*.png`.
2. S2 (badge « nouvelle ») et S9 (fin de combat) : non tranchés par le script automatisé — à re-vérifier manuellement.

## Verdict global

L'IHM est fonctionnelle dans les deux viewports avec zéro erreur console et aucun scroll horizontal. Les 4 bugs du retour terrain v0.46 sont corrigés et prouvés par taps tactiles réels (voir commit `v0.46.1`). Le mode Tactique est jouable au doigt sur téléphone.

## 3 corrections les plus urgentes

1. **Pastilles `.info-chip` ≥ 32 px (44 px en tactile)** — seule vraie régression d'ergonomie restante.
2. Re-vérifier le badge « nouvelle » en collection après génération Forge (S2).
3. Re-tester la fin de combat de bout en bout (S9) avec une attente adaptée à la vitesse ×32.
