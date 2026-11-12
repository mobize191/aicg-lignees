# Provenance — skill game-ai

- **Source** : dépôt `awesome-gamedev-agent-skills`, chemin `skills/disciplines/game-ai` (https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/game-ai).
- **Licence** : Apache-2.0 (celle du dépôt source) ; les trois fichiers sont importés **verbatim** le 12/11/2026, sans modification du contenu.
- **Contenu** : `SKILL.md` (choix du modèle de décision FSM / arbre de comportement / score d'utilité / GOAP, perception, steering, A*, garde-fous et vérifications exécutables) ; `references/pathfinding.md` ; `references/fsm-perception-steering.md`.
- **Usage dans ce repo** : guider la spec « refonte de l'IA » (combat et errance) — choix du modèle, garde-fous (hystérésis, équité de perception, anti-blocage), et vérifications sous forme de tests plutôt que d'impression visuelle. L'errance utilise déjà un A* 8 directions avec lissage de ligne de vue : la référence pathfinding servira de grille d'audit.
- **Note** : le dépôt source propose le skill compagnon `ai-behavior-trees-utility-ai` (runtimes arbre de comportement et score d'utilité), plus directement pertinent pour les décisions de combat tour par tour (choix de cible, soin vs attaque). À importer au moment de la spec si le modèle retenu en a besoin.
