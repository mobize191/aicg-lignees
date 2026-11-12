# Prompt — refonte direction (tranchages de la session du 12/11) : formation 3+2, oppositions au sort, points de repos, capture + jetons

> Statut : TRANCHÉ par Marc-Olivier (session du 12/11, voir `docs/design/session-qa-direction.md` section 0). Couloir 1 : exécute lot par lot, UN LOT = UN COMMIT FR, APRÈS v1.39 et v1.40, dans l'ordre A → B → C → D, avec preuves complètes par lot. Chaque lot qui change les maths de combat (A, B) exige une MESURE documentée et une NOUVELLE baseline digest, soumise au verrouillage de Marc-Olivier : **les digests `c62fcbd1…`/`5059e683…` restent la référence jusqu'au lot A inclusivement dans sa version d'origine**.

## Contexte (structure vérifiée sur main `4b4f24e` par le couloir pilotage)

- **Équipe** : `store.team.slots` = 5 emplacements, `formation: '3-2'` ; aujourd'hui les 5 cartes COMBATTENT (avant/arrière actifs depuis v1.31 : l'arrière encaisse −50 % tant que l'avant tient). TRANCHÉ : **3 actifs + 2 en réserve** — l'« arrière » devient une réserve hors combat, remplaçable en plein combat en dépensant le tour du nouveau venu.
- **Éléments** : chaque carte porte un élément (`ELEMENTS`, `BEATS`, `BEATEN_BY` depuis `src/data.js`) ; le bonus d'opposition (+25 %) se calcule aujourd'hui CARTE contre CARTE ; les sorts portent une ÉCOLE (`data/schools.json`, recâblage famille → école) ; les naissances raciales sont déjà Neutres (v0.38). TRANCHÉ : monstres gardent leur élément inné, **humains Neutres**, **l'opposition se calcule SORT contre CIBLE** (élément de l'école du sort), et **« Terre » est renommé Nature** (topologie d'opposition inchangée).
- **Restauration** : `store.runState` persiste PV/mana d'un combat à l'autre dans le run, avec **régénération automatique après le premier boss** (`REGEN_BOSS_STAGE`) et soins complets entre deux runs ; l'autel d'errance soigne (`autelDeSoin`). TRANCHÉ : **persistance partout** (donjon ET errance), **aucun soin automatique**, restauration **gratuite en ville et à l'autel**, **objets en donjon**.
- **Acquisitions** : recrutement naturel ~1 % par vaincu (`recrutableMonsters`, taux par zone en data, bloc fin de combat `src/ui.js`), compagnons achetables à la Boutique. TRANCHÉ : **capture en errance/donjon à la DQM avec % affiché**, **un seul vendeur de compagnons à offres quotidiennes achetées en JETONS** déblocables par la progression (jamais en or), les compagnons/jour à l'or disparaissent. L'épreuve de recrutement des humains/mystiques (allégeance/énigme du Lieur) viendra avec le lore : hors périmètre de ce chantier.

## Lot A — Formation 3 actifs + 2 réserve (moteur + UI)

- **Structure conservée** : `store.team.slots` reste un tableau de 5 (compatibilité des saves, pas de bump) ; sémantique : indices 0-2 = ACTIFS, 3-4 = RÉSERVE. `formation: '3-2'` devient ce sens-là (plus d'arrière qui combat).
- **Moteur de combat** : seuls les 3 actifs entrent au combat ; les unités d'arrière ne jouent pas, ne sont pas ciblables, ne prennent pas de dégâts de zone. Les mécaniques « rang avant/arrière » (−50 % arrière, frappes amoindries de l'arrière) disparaissent avec l'arrière.
- **Switch en combat (fenêtre d'action tactique)** : nouvelle action « Échanger » : choisir une carte de réserve ; l'entréeuse dépense SON tour (elle n'agit pas ce tour-ci) ; la carte sortante garde ses PV/mana courants (retour en réserve), l'entrante entre avec ses PV/mana de réserve. Une carte K.O. peut être remplacée par le même switch (coût identique). Pas de switch pendant la résolution d'un tour.
- **XP de réserve** : 50 % de l'XP des actifs (valeur en data, `engine.reserveXpMult: 0.5` dans `data/engine.json`, consommée par le lot 1 de v1.39 en place).
- **UI** : plateau = 3 pions ; rail de réserve visible (2 emplacements, remplaçables au clic) ; page Équipe : libellés Actifs/Réserve ; l'ordre des slots 0-2 vs 3-4 se règle par glisser ou boutons, libre.
- **Migration** : équipe existante à 5 cartes → les 3 premiers slots deviennent actifs, les 2 derniers réserve ; aucun retrait de carte, aucun bump de save.
- **IA/auto-résolution (digest + futurs combats de missions)** : l'IA ne fait PAS de switch (chemin simple : les 3 actifs) ; les vagues ennemies restent à leur taille actuelle (2-3 en zone, par étage en donjon).
- **Garde-fous tests headless** : 3 actifs entrent, 2 en réserve hors ciblage ; switch coûte le tour de l'entrante ; PV/mana conservés au switch ; réserve à 50 % d'XP ; migration d'une save à 5 cartes ; une équipe de moins de 3 cartes fonctionne (2 actifs).
- **PREUVES SPÉCIALES** : digest CHANGE (5 combattants → 3) → MESURE documentée (victoires par donjon × mode avant/après) + NOUVELLE baseline digest (3000 et 10000) proposée au verrouillage par Marc-Olivier ; calibration NON touchée (aucun ajustement de maths de combat dans ce lot).

## Lot B — Oppositions au sort + élément Nature (data + moteur)

- **Renommage data** : l'élément `Terre` devient **Nature** partout (`data/`, `ELEMENTS`, textes UI, glossaire, éclats/gemmes bruts, oppositions). Topologie d'opposition INCHANGÉE (Nature hérite des liens de Terre : domine et est dominé par les mêmes éléments).
- **Calcul d'opposition** : le +25 % (et le −25 % quand on est dominé, le cas échéant : garder les valeurs actuelles) se calcule entre **l'élément de l'ÉCOLE du sort** (attaque et soins offensifs comme aujourd'hui pour la carte) et **l'élément inné de la cible**. Les frappes simples (pas de sort) : élément de la CARTE qui frappe, comme aujourd'hui — un monstre aquatique frappe toujours « aquatique » ; un humain neutre frappe neutre (ni bonus ni malus).
- **Humains Neutres** : les cartes humaines n'affichent plus l'élément de leur voie : elles restent Neutres (déjà vrai des naissances raciales) ; l'élément de la voie vit sur ses SORTS via l'école (mage de feu : sorts d'école feu). Les monstres et divins gardent leur élément inné affiché.
- **UI/fiches** : badge d'élément sur chaque sort dans le grimoire et la fenêtre d'action ; oppositions expliquées « sort → cible » ; glossaire à jour.
- **Migration** : data + affichage uniquement, structure de save inchangée.
- **Garde-fous tests headless** : sort d'école X sur cible d'élément dominé → +25 % ; même sort sur cible Neutre → neutre ; frappe simple d'un humain → jamais de bonus d'opposition ; renommage exhaustif (grep « Terre » élémentaire : plus aucune occurrence d'élément Terre, hors historique du changelog in-game qui n'est PAS réécrit).
- **PREUVES SPÉCIALES** : digest CHANGE (maths de résistance) → MESURE avant/après + NOUVELLE baseline (cumulée avec le lot A : une seule re-baseline finale après B est acceptable, documentée).

## Lot C — Points de repos : persistance partout, aucun soin automatique (flux de jeu)

- **Supprimer les soins automatiques** : plus de régénération complète après le premier boss (`REGEN_BOSS_STAGE`) ni de soins complets implicites entre deux runs : le pool PV/mana de l'équipe persiste PARTOUT (donjons, errance, combats de zone), jusqu'à restauration explicite.
- **Restauration gratuite** : en ville (retour à l'accueil : soin complet au retour, avec toast explicite) et à l'autel d'errance (existant) — aucun or demandé. **Objets en donjon** : potions via le bouton 🧪 existant (rayon potions inchangé) ; PAS de vente de soins en pleine errance.
- **Audit du `runState`** : unifier le pool entre donjon et errance (les combats de zone persistent, pas de reset caché à l'entrée de zone) ; les états K.O. persistent (une carte K.O. reste K.O. jusqu'à soin/ville) ; l'autel ne relève PAS les K.O. sauf si c'est déjà le cas aujourd'hui (documenter le choix retenu).
- **UI** : le hub-ville et l'autel affichent leur effet de repos ; la page Équipe montre l'état PV/mana réel de chaque carte.
- **Garde-fous tests headless** : victoire d'étage → aucun reset auto ; retour ville → restauration complète ; autel → idem + grâce ; potions → hors combat et en donjon ; K.O. persistant entre combats.
- **PREUVES** : digest INCHANGÉ attendu (flux hors combat). **MESURE gameplay recommandée** : la difficulté perçue monte (3 actifs + survie persistante) ; ne PAS recalibrer dans ce lot, signaler la courbe de victoires à Marc-Olivier pour tranchage.

## Lot D — Capture à la DQM + vendeur à jetons (économie des acquisitions)

- **Capture** : à l'écran Récompenses d'un combat gagné (donjon ET errance), pour chaque monstre recrutable vaincu (`recrutableMonsters` existant, taux par zone en data), une ligne « Tenter la capture — X % » ; le % affiché = taux de base par zone (l'actuel ~1 % devient la base, ajustable en data) modulé par la démonstration de force : rapport niveau moyen des actifs / niveau du monstre (formule simple en data, plafonnée, affichée avant le choix). Un seul essai par monstre vaincu ; sur réussite, la carte rejoint la collection (naissance de monstre existante). PAS de capture des boss de zone ni des nommés (comme aujourd'hui).
- **Vendeur à jetons** : la Boutique garde UN vendeur de compagnons (onglet dédié, voir `docs/design/spec-boutique-inventaire-onglets.md` harmonisée avec les ACTÉS du 7e tour) ; **3 offres quotidiennes** (déterministes par jour, comme l'actuel), achetées en **JETONS** — nouvelle devise : sources = donjons bouclés, jalons, quêtes (montants en data, gating par la progression selon `docs/design/spec-gating-acquisitions.md`) ; JAMAIS en or. Les compagnons/jour à l'or disparaissent. Les offres peuvent inclure des raretés ciblées (R/SR plafonnées par le gating).
- **Recrutement naturel** : conservé (c'est la capture de base) ; le % devient VISIBLE partout (l'écran de capture l'affiche).
- **Garde-fous tests headless** : capture déterministe (seed → %, réussite/échec) ; jetons gagnés/dépensés, pas d'achat en or ; offres quotidiennes stables dans la journée ; boss/nommés non capturables ; économie test étendu.
- **PREUVES** : digest INCHANGÉ attendu (économie). Protocole IHM : écran Récompenses avec capture + onglet vendeur (téléphone ET PC).

## Contraintes générales

- `data/*.json` source de vérité ; `dist.html` via `node build.mjs` ; re-fetch avant chaque édition ; zéro dépendance npm ; une tâche = un commit FR.
- Chaque lot : build + `node --test tests/*.test.js` (PAS `node --test tests/`) + `node smoke-ui.mjs dist.html` + digests (inchangés pour C et D ; MESURE + nouvelle baseline pour A et B).
- Consigner chaque lot dans `docs/arbitrages.md` (entrée en haut), CHANGELOG, roadmap, protocole IHM.
- Hors périmètre de TOUT ce chantier : l'épreuve de recrutement humains/mystiques (lore Le Lieur, chantier suivant), les panoplies/craft (spec sets), les expéditions/missions (tranchage temps réel en attente), le moindre recalibrage de maths de combat.
