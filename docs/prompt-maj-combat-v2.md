# Prompt de lancement : la mise à jour UI du combat v2

> À copier au début de la session agent (Vibe, Claude Code, Cursor, OpenCode...). Les arbitrages concernés sont déjà POUSSÉS dans les data : ce chantier est purement UI/UX, il ne touche ni le moteur ni les valeurs.

---

Tu travailles sur **AICG : Lignées** (repo GitHub `mobize191/aicg-lignees`, branche `main`), un jeu de cartes solo 100 % navigateur. Le jeu embarqué est `dist.html`, généré par `node build.mjs` depuis `src/` + `data/`.

## Mission

Implémenter dans le jeu réel la **mise à jour UI du combat v2** dont le design cible est démontré dans les maquettes Vibe (page combat, page fiches) et consigné dans `docs/regles-jeu.md` (section 7, design cible) :

1. **Ciblage interactif** : quand le joueur choisit une action ou un sort dans la fenêtre d'action, les cibles éligibles s'illuminent sur le plateau (contour doré, pulse, pastille 🎯, curseur de visée) ; un clic désigne et résout ; la **zone de 2** (sorts de largeur 2 : la carte cliquée + sa voisine contiguë) suit le survol ; un bouton **Annuler** ramène à la fenêtre d'action sans rien perdre ; le **coût en mana et la zone restent visibles** pendant toute la désignation. Un clic hors cible ne fait rien (le ciblage reste actif).
2. **Pied de stats sur chaque pion** : PV, ATQ et mana en **actuel/total** (ex : ❤️ 88/88, ✦ 7/40), plus une petite icône par état actif : ⬆ bonus (vert), ⬇ malus (rouge), 🛡 bouclier (bleu). Une carte tombée passe en grisé (opacité réduite + désaturée). L'ancien affichage mana simple disparaît au profit du pied.
3. **Fiche carte plein cadre** : dans la fiche détaillée d'une carte (`.modal-hero`), l'illustration couvre toute la carte verticale (bord doré arrondi), un voile dégradé sombre en bas laisse lire le nom, le sous-titre « classe · élément · rareté » en gris clair, et les stats en bas (❤️ PV en rouge, ✦ mana en violet). Garder les stats détaillées et les sorts en dessous.

### HORS PÉRIMÈTRE (ne pas coder)

- La **Garde du Gardien** (piste v1.1) et le **grimoire élémentaire** (piste v2) : ce sont des pistes, pas des arbitrages ACTÉS.
- Le moteur pas-à-pas, les data, l'équilibrage : aucun chiffre ne bouge.
- Les renommages de sorts et les changements de classes : déjà poussés dans les data (digest `7dfab0a2…`), rien à y faire.

## Ordre de lecture (avant toute ligne de code)

1. `docs/00-SOMMAIRE.md` puis `docs/roadmap.md` (état courant, v0.46/v0.47).
2. `docs/regles-jeu.md` section 7 (le design cible) et `docs/arbitrages.md` (journal des décisions : ne contredire aucun ACTÉ).
3. Dans `src/` : repérer la fenêtre d'action (`.act-modal`), le ciblage actuel (liste cliquable + `.targeted`), le rendu des pions du plateau, et la fiche (`openUnitModal`, `.modal-hero`).

## Règles d'or

- `dist.html` n'est **jamais édité à la main** : on modifie `src/`, puis `node build.mjs`.
- Aucune valeur de design dans `src/` : tout vit dans `data/*.json` (test allowlist). Ce chantier n'ajoute AUCUNE valeur : c'est de la présentation.
- Zéro dépendance : pas de `npm install`. Node 18+, tests natifs.
- Respecter les acquis du v0.46 : anti-runs fantômes (`combatGen`, pauses hors vue, timers génération-capturés), limite 3 exemplaires, pions `clamp(104px, 26vw, 136px)`.
- **Mobile d'abord** : les retours terrain v0.46 venaient du téléphone. Cibles de tap >= 32 px, `elementFromPoint` propre sur les cartes illuminées (aucun overlay ne doit couvrir la pastille 🎯), le pied de stats reste lisible à 390 px de large.
- `prefers-reduced-motion: reduce` coupe les nouvelles animations (pulse, hit, heal).

## Chaîne de preuve (à chaque étape)

1. `node build.mjs && node --test` → 60 tests verts.
2. `node smoke-ui.mjs` → 121 checks verts, **plus les nouveaux checks que tu ajoutes** : ciblage illuminé (5 ennemis), clic hors cible, résolution zone de 2, annulation, pied actuel/total, icônes d'état, KO grisé, fiche plein cadre. Chaque check a son label.
3. `node combat-digest.mjs dist.html 3000` → le digest doit rester **`7dfab0a295eaa1dab1f70e039b782e0ef06285fdd0fdf3e09d65304b966de5aa`** (476 victoires) : ce chantier ne touche pas le gameplay, la dormance est la preuve. Si le digest bouge, tu as cassé le moteur : corrige, ne mets pas à jour la baseline.
4. Après le chantier : mettre à jour `docs/roadmap.md` (état + historique) et `docs/arbitrages.md` (le passage de « design cible » à « implémenté », daté).

## Discipline

- Une tâche = une préoccupation = un commit : (1) ciblage interactif, (2) pied de stats, (3) fiche plein cadre, (4) doc.
- Ne revendique jamais un succès sans la sortie de la preuve qui l'établit.
- Réponds en français, itérations courtes : on montre vite, on corrige vite.
- En cas de design ambigu : note la question dans `docs/arbitrages.md` (statut PROPOSÉ) et prends l'option la plus conservatrice en attendant.
