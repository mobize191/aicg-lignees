# Rapport de validation IHM — AICG : Lignées (protocole v1.33, headless Chromium via CDP)

Jeu servi en staging Pages (dist.html + assets-v3.json + fx/ + errance/) sur http://localhost:8080/ · Viewports 1440×900 et 390×844 · 30 captures dans `docs/captures-validation/v1.33/`

## Résultats par scénario

- **S1 écran de départ à 4 propositions** : OK — ⚔ Bienvenue à AICG : Lignées !  Choisissez votre première carte parmi ces 4 novices (un par race) — 
- **S1 2 cartes accordées + accueil ouvert** : OK — {"n":2,"departFait":true,"accueil":true}
- **S2 hub-ville : scène + menu + Terres Sauvages + héroïne + entrée Personnage** : OK — {"scene":true,"menu":true,"wild":true,"npc":true,"perso":true}
- **S2 héroïne cliquable (bulle de dialogue)** : INFO
- **S2 pop-up si navigation sans équipe (équipe vide ici)** : OK — slots=0 pop=true
- **S2 accueil [desktop] pas de scroll horizontal** : OK — scrollWidth=1440 innerWidth=1440
- **S2 accueil [desktop] aucun CSS brut en bas de page** : OK
- **S3 5 slots + carte posée + formation 3+2/2+3 + bouton retour** : OK — {"slots":5,"hasCell":true,"team":2,"forms":true,"back":true}
- **S3 equipe [desktop] pas de scroll horizontal** : OK — scrollWidth=1425 innerWidth=1440
- **S3 equipe [desktop] aucun CSS brut en bas de page** : OK
- **S4 collection : cartes rendues** : OK — {"cards":3,"art":3}
- **S4 illustrations chargées (assets-v3.json)** : OK — art=3
- **S4 collection : familles divines joueur (seuil/miroir/pont) listées** : OK — {"seuil":true,"miroir":true,"pont":true,"compagnons":true}
- **S5 donjons : sélecteur Nv + verrous** : OK — {"nv":true,"locks":8}
- **S6 combat : plateau (unités) + rangs avant/arrière + contrôles** : OK — {"units":4,"speed":true,"fx":true,"mode":true,"avant":2,"arriere":0}
- **S6 bouton #speed cyclé** : OK — Vitesse : ×2
- **S7 fenêtre d’action tactique, aucune ligne « undefined »** : OK — {"act":true,"undefined":false,"reduce":true,"sorts":9}
- **S18 rangs avant/arrière sur chaque unité, formation figée en combat (pas de boutons)** : OK — {"avant":2,"arriere":0,"rangs":true,"formBtns":false,"rows":0}
- **S18 elOf() : le pion .unit est la cible surlignée (pas les rail-chips)** : OK — true
- **S20 bouton ▾ réduire replie/rouvre la fenêtre d’action** : OK — true
- **S20 action 🧪 Objet : potion bue, stock décrémenté** : INFO — objet=true bu=true reste=1
- **S16 webm FX servie en staging** : OK — status=200
- **S16 une seule vidéo FX à la fois (2 casts → 1 overlay)** : OK — {"overlays":1,"ready":4,"paused":false,"rate":2,"err":null}
- **S16 la vidéo joue (readyState ≥ 2, pas en pause, rate > 0)** : OK — {"overlays":1,"ready":4,"paused":false,"rate":2,"err":null}
- **S16 toggle 🎬 FX persisté (aicg-fx)** : OK — off
- **S16 prefers-reduced-motion : aucun overlay FX** : OK — overlays=0
- **S8 fiche au clic sur un pion** : OK — {"pion":true,"modal":true,"img":true}
- **S9 écran Récompenses (lignes + « Tout ramasser »)** : INFO — {"recomp":false,"rows":0,"tout":false}
- **S10 boutique + atelier : rayons + 90 boutons Fabriquer** : OK — {"potions":true,"marchand":true,"craft":90,"atelier":true}
- **S10 achat potion débite l’or** : OK — or 500 -> 450
- **S10 craft pièce de base : matériaux + or débités, pièce possédée** : OK — {"id":"eq-set-marees-base-armure","g0":1000,"m0":5,"g1":900,"m1":2,"owned":1}
- **S10 boutique [desktop] pas de scroll horizontal** : OK — scrollWidth=1425 innerWidth=1440
- **S10 boutique [desktop] aucun CSS brut en bas de page** : OK
- **S10 marchand v2 : 3 offres du jour rendues = rotation seedOfDay, catalogue complet, prix actés UC/R/SR** : OK — {"nbOffres":3,"cat":123,"locks":102,"prix":true,"debloquees":"C"}
- **S10 sans donjon bouclé : seule C débloquée, cadenas 🔒 sur les autres raretés** : OK — debloquees=C locks=102
- **S10 achat d’une offre du jour débite l’or et ajoute l’exemplaire** : OK — {"ok":true,"id":"k2","g0":50000,"g1":49800,"o1":1,"o0":0}
- **S10 achat UC refusé tant que verrouillée (pas d’or débité)** : OK — {"r":false,"g1":49800,"g0":49800}
- **S21 donjon bouclé en Facile → UC débloquée et achetable (1 500 or)** : OK — {"deb":"C,UC","r":true,"g1":48300,"g0":49800,"lockUc":true}
- **S11 guilde : évolutions + compagnons + autel, aucun élément jeton** : OK — {"evolutions":true,"compagnons":true,"autel":true,"jetonUI":false,"pierres":true}
- **S12 3 quêtes du jour + bonus complétion** : OK — {"rows":3,"bonus":true}
- **S13 inventaire groupé + bouton retour** : OK — {"potions":true,"materiaux":true,"equip":true,"back":true}
- **S17 page Personnage : onglets + Équipe (formation, slots) + retour** : OK — {"tabs":true,"equipe":true,"teamSlots":true,"back":true}
- **S17 onglet Inventaire commute** : OK
- **S17 bouton retour → accueil** : OK
- **S14 les 5 zones listées, seule la zone de départ ouverte** : OK — {"zones":["zone-marees"],"total":5,"unlocked":1}
- **S14 sprite sheet du héros servie (staging)** : OK — status=200
- **S14 entrée en zone : canvas errance** : OK
- **S14 déplacement au clic (pilotage inertiel)** : OK — d=0.59 v={"x":3.3792046978903048,"y":0.3754671886544773}
- **S14 errance stable (pas d’exception)** : OK — nouvelles=0
- **S15 glossaire : symboles de l’écran** : OK — {"symboles":true,"glyphs":true}
- **S19 migration v27 au rechargement : acc dédoublonné, version 27, collection intacte** : OK — {"version":27,"n":2,"uniq":true,"coll":4}
- **S2 #accueil [mobile] pas de scroll horizontal** : OK — scrollWidth=390 innerWidth=390
- **S2 #accueil [mobile] aucun CSS brut en bas de page** : OK
- **S2 #accueil [mobile] tous les boutons >= 32 px** : OK
- **S3 #equipe [mobile] pas de scroll horizontal** : OK — scrollWidth=390 innerWidth=390
- **S3 #equipe [mobile] aucun CSS brut en bas de page** : OK
- **S3 #equipe [mobile] tous les boutons >= 32 px** : OK
- **S10 #boutique [mobile] pas de scroll horizontal** : OK — scrollWidth=390 innerWidth=390
- **S10 #boutique [mobile] aucun CSS brut en bas de page** : OK
- **S10 #boutique [mobile] tous les boutons >= 32 px** : OK
- **S17 #personnage [mobile] pas de scroll horizontal** : OK — scrollWidth=390 innerWidth=390
- **S17 #personnage [mobile] aucun CSS brut en bas de page** : OK
- **S17 #personnage [mobile] tous les boutons >= 32 px** : OK
- **S14 #terres [mobile] pas de scroll horizontal** : OK — scrollWidth=390 innerWidth=390
- **S14 #terres [mobile] aucun CSS brut en bas de page** : OK
- **S14 #terres [mobile] tous les boutons >= 32 px** : OK
- **S14 [mobile] tap déplace le héros** : OK — d=0.54
- **S14 errance [mobile] pas de scroll horizontal** : OK — scrollWidth=390 innerWidth=390
- **S14 errance [mobile] aucun CSS brut en bas de page** : OK
- **S14 errance [mobile] tous les boutons >= 32 px** : OK

## Captures de cette session

- `S1-depart-desktop.png`
- `S2-accueil-desktop.png`
- `S3-equipe-desktop.png`
- `S4-collection-desktop.png`
- `S5-donjons-desktop.png`
- `S6-combat-desktop.png`
- `S7-fenetre-action-desktop.png`
- `S20-fenetre-reduite-desktop.png`
- `S20-objet-desktop.png`
- `S16-fx-overlay-desktop.png`
- `S8-fiche-desktop.png`
- `S9-recompenses-desktop.png`
- `S10-boutique-desktop.png`
- `S10-atelier-desktop.png`
- `S10-marchand-v2-desktop.png`
- `S21-marchand-debloque-desktop.png`
- `S11-guilde-desktop.png`
- `S12-quetes-desktop.png`
- `S13-inventaire-desktop.png`
- `S17-personnage-desktop.png`
- `S14-terres-desktop.png`
- `S14-errance-desktop.png`
- `S14-errance-deplacement-desktop.png`
- `S15-glossaire-desktop.png`
- `S2-accueil-mobile.png`
- `S3-equipe-mobile.png`
- `S10-boutique-mobile.png`
- `S17-personnage-mobile.png`
- `S14-terres-mobile.png`
- `S14-errance-mobile.png`

## Erreurs console (exhaustif)

- aucune

## Verdict

VERT : 67 checks OK, 0 KO, 0 erreur(s) console.
