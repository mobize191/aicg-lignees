# Système d'errance top-down — Guide d'implémentation

Référence : démos jouables « Errance A — démo jouable » (base) et « Errance A+ — démo jouable » (couche d'ambiance). Ce document reprend les mécanismes exacts des démos, avec extraits de code, points d'attention et conseils d'intégration dans le repo `aicg-lignees`.

---

## 1. Architecture générale

Le système tient en 6 blocs indépendants, à découper en modules :

| Bloc | Rôle | Cible suggérée dans le repo |
|---|---|---|
| Données carte | grille `Uint8Array` + codes terrain | alimenté par `zones.json` |
| Pré-rendu décor | canvas offscreen peint une fois | `errance/paint.js` |
| Pathfinding | A* grille 8-dir + lissage ligne de vue | `errance/path.js` |
| Pilotage | vitesse vectorielle inertielle + collisions par axe | `errance/move.js` |
| Rencontres | compteur de pas + taux + pas de grâce | `errance/encounters.js` |
| Présentation | caméra lerp, zoom, HUD, transitions | `errance/render.js` |

Principe clé : **le décor est peint une seule fois** dans un canvas offscreen (`base`), puis blitté chaque frame par un unique `drawImage`. Seules les entités animées (herbes, héros, lucioles, fumée, étincelles) sont redessinées par frame. C'est ce qui rend le style « peint, non pixelisé » abordable sur mobile.

---

## 2. Données de carte

### Codes terrain (démo)

```
0 prairie   1 chemin    2 eau        3 arbre
4 mur donjon 5 porte    6 hautes herbes
7 maison    8 autel     9 rocher    10 jarre/coffre
```

### Structure

```js
const T = 36, MW = 46, MH = 32;          // tuile px, dimensions carte
const terr = new Uint8Array(MW * MH);
const idx = (x, y) => y * MW + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
const solid = t => t === 2 || t === 3 || t === 4 || t === 7 || t === 8 || t === 9 || t === 10;
```

**Point d'attention :** garde `terr` en `Uint8Array` (48 Ko ici), jamais en tableau d'objets. Une carte 200×200 = 40 000 octets, négligeable.

**Intégration zones.json :** stocke par zone la grille encodée (string base64 ou tableau plat), le `T` de la zone, les objets interactifs et les patchs de hautes herbes. Le décor procédural (touffes, fleurs) est généré par RNG **déterministe avec seed stocké dans la zone**, pour que la carte soit identique à chaque visite sans persister des mégaoctets d'image.

```js
let seed = 20261110;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
```

**Point d'attention :** toute caractéristique visuelle tirée via `rnd()` doit l'être dans un ordre fixe et sans branche dépendant de l'état, sinon le seed ne suffit plus à reproduire la carte.

---

## 3. Pré-rendu du décor

### Principe

```js
const base = document.createElement("canvas");
base.width = MW * T; base.height = MH * T;
const bx = base.getContext("2d");
bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = "high";
// ... passes de peinture ...
```

Ordre des passes (importante, chaque couche recouvre la précédente) :

1. **Fond** : dégradé vertical global, puis ~1500 taches organiques semi-transparentes (`ellipse` avec opacité 5-8 %) pour casser l'aplat.
2. **Micro-détails** : touffes (quadratic curves), fleurs à pétales, cailloux, seulement sur tuiles `0`.
3. **Chemin** : cercles larges ton foncé, puis cercurs clairs décalés, puis taches d'ornières et cailloux, seulement sur tuiles `1`.
4. **Étang** : rive sablonneuse (2 ellipses), eau en dégradé radial, ombres de profondeur, reflets statiques, nénuphars, roseaux.
5. **Socles de hautes herbes** : 2 couches (masque sombre + touffes claires).
6. **Arbres, rochers, donjon, maisons, autel** : avec ombre portée elliptique au sol peinte *sous* chaque objet.

### Recette « non pixelisé »

- Jamais de `fillRect` nu pour des surfaces organiques : toujours ellipses, courbes, dégradés.
- Trois valeurs de vert minimum par élément (sombre / moyen / lumière) + un point de lumière chaude (`rgba(210,255,195,.3)` sur les canopées).
- Ombres portées systématiques : `rgba(0,0,0,.25-.35)` en ellipse décalée de +3/+4 px. C'est ce qui « assoit » les objets dans le décor.

**Point d'attention :** le pré-rendu d'une carte 46×32 prend ~50-100 ms. Pour de grandes cartes, pré-rends par **chunks** (bandes de tuiles) à la demande ou au chargement de la zone, jamais tout en bloquant le thread principal. Un `requestIdleCallback`/Worker peut faire des merveilles ici.

**Point d'attention :** les objets interactifs (coffres, jarres) cassables/changeants ne doivent pas être cuits dans le pré-rendu, ou doivent être re-peints localement lors d'un changement (voir §7).

---

## 4. Pathfinding : A* 8 directions + lissage

### A* avec heuristique octile

```js
const DIRS = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.42],[1,-1,1.42],[-1,1,1.42],[-1,-1,1.42]];
function astar(sx, sy, tx, ty) {
  if (!inb(tx, ty) || solid(terr[idx(tx,ty)])) return null;
  const key = (x,y) => y*MW + x, open = [{x:sx,y:sy,g:0,f:0,p:null}], seen = new Map();
  seen.set(key(sx,sy), 0);
  while (open.length) {
    open.sort((a,b) => a.f - b.f); const cur = open.shift();
    if (cur.x === tx && cur.y === ty) { const path = []; let n = cur; while (n) { path.unshift(n); n = n.p; } return path; }
    for (const d of DIRS) {
      const nx = cur.x+d[0], ny = cur.y+d[1];
      if (!inb(nx,ny) || solid(terr[idx(nx,ny)])) continue;
      // interdit les diagonales qui « coupent le coin » d'un obstacle
      if (d[2] > 1 && (solid(terr[idx(cur.x+d[0],cur.y)]) || solid(terr[idx(cur.x,cur.y+d[1])]))) continue;
      const g = cur.g + d[2], k = key(nx,ny);
      if (seen.has(k) && seen.get(k) <= g) continue;
      seen.set(k, g);
      const adx = Math.abs(nx-tx), ady = Math.abs(ny-ty);
      open.push({x:nx,y:ny,g, f: g + Math.max(adx,ady) + .41*Math.min(adx,ady), p:cur});
    }
  }
  return null;
}
```

### Lissage par ligne de vue (string pulling)

```js
function los(ax, ay, bx, by) {          // échantillonne le segment tous les ~T*.35
  const d = Math.hypot(bx-ax, by-ay), n = Math.max(1, Math.ceil(d / (T*.35)));
  for (let i = 1; i <= n; i++) {
    const x = ax + (bx-ax)*i/n, y = ay + (by-ay)*i/n;
    if (solid(terr[idx(Math.floor(x/T), Math.floor(y/T))])) return false;
  }
  return true;
}
function smooth(pts) {                  // remplace les zigzags par des segments droits
  const out = [pts[0]]; let i = 0;
  while (i < pts.length - 1) {
    let j = pts.length - 1;
    while (j > i + 1 && !los(pts[i].x, pts[i].y, pts[j].x, pts[j].y)) j--;
    out.push(pts[j]); i = j;
  }
  return out;
}
```

**Points d'attention :**
- `open.sort` + `shift` est du O(n log n) par nœud : parfait jusqu'à ~150×150 tuiles. Au-delà, passe à un tas binaire (ou A*JP). La démo tourne à 60 fps sur cette carte, marge confortable.
- Recalcule A* **seulement si la tuile cible change** (mémo `lastTx/lastTy`), pas à chaque `pointermove`. C'est le premier gain perf du pilotage au maintien.
- Le point de départ du chemin doit être la **position pixel réelle** du héros (`pts[0] = {x: hero.x*T, ...}`), sinon le premier segment « saute » visiblement.

---

## 5. Pilotage inertiel (le secret des déplacements « vivants »)

Le héros n'est pas téléporté de tuile en tuile : il porte un **vecteur vitesse** que l'on fait tourner progressivement. Résultat : des virages en arc, des accélérations et freinages doux, un balancement (`tilt`) dans les virages.

```js
// dans la boucle, avec dt borné :
const v = hero.v, maxV = WALK_SPEED * T;             // px/s
// 1) abandon des waypoints atteints ou dépassés
while (hero.path.length) {
  const w = hero.path[0];
  const dwx = w.x - hero.x*T, dwy = w.y - hero.y*T, d = Math.hypot(dwx, dwy);
  if (hero.path.length > 1) {
    const w2 = hero.path[1];
    const dot = dwx*(w2.x - w.x) + dwy*(w2.y - w.y);
    if (d < T*.5 || dot < 0) { hero.path.shift(); continue; }  // « derrière » => abandonné
  } else if (d < 2.5) { hero.path.shift(); v.x = 0; v.y = 0; break; }
  break;
}
if (hero.path.length) {
  const w = hero.path[0];
  const dwx = w.x - hero.x*T, dwy = w.y - hero.y*T, d = Math.hypot(dwx, dwy) || 1e-6;
  // 2) vitesse désirée : freinage progressif sur le DERNIER point
  const want = hero.path.length === 1 ? Math.min(maxV, d / .22) : maxV;
  const dvx = dwx/d*want, dvy = dwy/d*want;
  // 3) rotation limitée du vecteur vitesse : virages en arc
  const turn = maxV * 5 * dt;
  let ex = dvx - v.x, ey = dvy - v.y;
  const em = Math.hypot(ex, ey) || 1e-9;
  if (em > turn) { ex = ex/em*turn; ey = ey/em*turn; }
  v.x += ex; v.y += ey;
  // 4) intégration + collision PAR AXE (glisse le long des murs)
  const nx = hero.x*T + v.x*dt;
  if (!solidAt(nx, hero.y*T)) hero.x = nx/T; else v.x = 0;
  const ny = hero.y*T + v.y*dt;
  if (!solidAt(hero.x*T, ny)) hero.y = ny/T; else v.y = 0;
} else {
  const f = Math.max(0, 1 - 8*dt);   // freinage doux sans destination
  v.x *= f; v.y *= f;
}
hero.tilt += ((v.x/maxV)*.09 - hero.tilt) * Math.min(1, 10*dt);  // balancement
```

**Points d'attention :**
- `dt` doit être **borné** (`Math.min(.05, ...)`) : un onglet en arrière-plan ou un point d'arrêt sur iOS produit sinon des sauts de plusieurs tuiles, traversant les murs.
- Le test « waypoint dépassé » (produit scalaire négatif avec le segment suivant) évite le ping-pong autour des points ; sans lui, le héros orbite autour de sa destination.
- `solidAt` teste le **centre** du héros. Pour un vrai rayon de collision, teste 2-4 points décalés, ou réduis la hitbox en vérifiant `solidAt` aux 4 coins d'un carré de demi-taille ~10 px.
- Collision par axe = le héros glisse le long des murs au lieu de s'y coller. Essentiel pour le feel.

---

## 6. Caméra : lerp + anticipation + zoom dramatique

```js
// zoom : 1.05 au départ, jusqu'à 1.7 selon l'éloignement du point d'entrée,
// -0.1 quand on marche (dézoome léger = sensation de vitesse)
const dist = Math.hypot(hero.x - start.x, hero.y - start.y);
let zTarget = 1.05 + Math.min(1, dist/26) * .6 - (hero.moving ? .1 : 0);
zTarget = Math.max(1.0, Math.min(1.7, zTarget));
cam.z += (zTarget - cam.z) * Math.min(1, 3.5*dt);

// look-ahead : la caméra précède la direction réelle du mouvement de 0.12 s
const cxT = hero.x*T + v.x*.12, cyT = (hero.y - .35)*T + v.vy*.12; // (démo : v.y*.12)
cam.x += (cxT - cam.x) * Math.min(1, 4.5*dt);
cam.y += (cyT - cam.y) * Math.min(1, 4.5*dt);
```

**Points d'attention :**
- Les `Math.min(1, k*dt)` sont des lerp **indépendants du framerate** (approximation exponentielle). N'écris jamais `cam.x += (cible - cam.x) * 0.1` brut : c'est dépendant du framerate.
- Le look-ahead basé sur la *vitesse* (pas la cible) donne l'effet « la caméra découvre le chemin ». 0.1-0.15 s est la zone idéale ; au-delà, la caméra semble lutter contre le joueur.
- Bornes de zoom : ne descend jamais sous 1.0 (le pré-rendu devient flou si tu zoomes *out* au-delà de sa résolution native). Pour dézoomer plus, pré-rends la carte à l'échelle 2× et affiche à ~0.5.

---

## 7. Rencontres aléatoires (façon Pokémon)

```js
const ENC_RATE = 0.16;      // probabilité par PAS dans les hautes herbes
const GRACE_STEPS = 2;      // pas sûrs après un combat / une fuite

// détection de pas = changement de tuile (pas de timer)
const tk = Math.floor(hero.x)*100 + Math.floor(hero.y);
if (tk !== lastTile) {
  lastTile = tk; steps++;
  const t = terr[idx(Math.floor(hero.x), Math.floor(hero.y))];
  if (t === 5) { /* entrée de donjon */ }
  else if (grace > 0) grace--;
  else if (t === 6 && Math.random() < ENC_RATE) startEncounter();
}
```

Transition vers le combat : **flash blanc** (fondu 0.45 s) puis **iris** (`clip-path: circle()` animé sur un div noir plein écran), puis écran de combat DOM. Au retour : iris inverse + `grace = GRACE_STEPS`.

**Points d'attention :**
- Compte les **pas (tuiles)**, pas le temps : deux vitesses de déplacement donnent la même densité de rencontres.
- Le pas de grâce après combat est indispensable, sinon la sortie de combat au milieu d'un patch enchaîne immédiatement (boucle infernale). L'autel de la démo ajoute +5 pas de grâce : généralise en buff.
- Taux de référence : Pokémon utilise 5-25 % selon le patch. 0.16/pas ≈ 1 rencontre toutes les ~6 tuiles d'herbe ; ajuste par zone dans `zones.json` (`enc_rate` par zone/patch), pas en dur.
- **Intégration avec `engine/combat.js` :** sauvegarde avant la transition `{ zone, hero: {x, y}, face, buffs }` (position en **tuiles** ou pixels monde, jamais en coordonnées écran). Après le combat, restaure puis rends ~2-5 pas invulnérables via `grace`.

---

## 8. Interactions : objets, coffres, jarres, autels

Modèle de la démo : **clic sur un objet = marche jusqu'à lui, puis interaction automatique à l'arrivée**.

```js
// trouver une tuile praticable à ≤ 2 tuiles de l'objet, la plus proche du héros
function walkableNearTile(o) {
  let best = null, bd = 1e9;
  for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
    const tx = o.x + dx, ty = o.y + dy;
    if (!inb(tx,ty) || solid(terr[idx(tx,ty)])) continue;
    if (Math.hypot((tx+.5)*T - o.cpx, (ty+.5)*T - o.cpy) > 2.3*T) continue;
    const dHero = Math.hypot(tx - hero.x, ty - hero.y);
    if (dHero < bd) { bd = dHero; best = { x: tx, y: ty }; }
  }
  return best;
}
// puis : astar -> smooth -> hero.path, et hero.pending = objet
// à l'arrivée (héros immobile) :
if (hero.pending && !hero.moving && !busy) {
  const o = hero.pending; hero.pending = null;
  if (Math.hypot(hero.x*T - o.cpx, hero.y*T - o.cpy) < 2.3*T) {
    if (o.type === "chest") openChest(o); else openDialog(o);
  }
}
```

Attaque (`attack()`, Espace / clic droit / tap sur le héros / bouton ⚔️ tactile) :
- arc de frappe doré dessiné autour du héros pendant 0.35 s, cooldown 0.5 s ;
- fauche les lames de hautes herbes dans un cône devant (`b.cutUntil = time + 9` : lames couchées 9 s, ~600 lames filtrées par test directionnel) ;
- brise les jarres (`p.broken = true`), qui lâchent des herbes récoltables et redeviennent praticables (`terr = 6`).

**Points d'attention :**
- La jarre brisée modifie `terr` : elle redevient praticable sans recalcul de carte. C'est le pattern à retenir pour tout objet destructible : **les états cassables vivent dans `terr`/l'état de l'objet, le visuel des objets est redessiné chaque frame (pas cuit dans le pré-rendu)**.
- `busy` (dialogue/combat) doit geler pathfinding ET interactions, sinon un clic pendant un dialogue empile des actions en file.
- Le tap sur le héros déclenche le coup : garde ce test avant `setTarget` dans `pointerdown`, sinon le clic part en marche.
- Persiste l'état des coffres/jarres récoltés par zone (Set d'ids dans le save), sinon tout se régénère.

---

## 9. Rendu par frame : l'ordre et les économies

Ordre de dessin (de l'arrière vers l'avant) :

1. `ctx.drawImage(base, 0, 0)` — la carte peinte (1 appel).
2. Ombres de nuages (petit canvas de taches floues, dérive lente, wrap horizontal).
3. Reflets animés de l'eau, écume du bord de l'étang.
4. Lames de hautes herbes animées, **regroupées par couleur en 2 `stroke()`** au lieu de ~600 :
```js
for (const col of ["#3f8a42", "#2e6b34"]) {
  ctx.strokeStyle = col; ctx.beginPath();
  for (const b of blades) {
    if (b.c !== col) continue;
    if (b.x < vx0 || b.x > vx1 || b.y < vy0 || b.y > vy1) continue;  // culling viewport
    const sw = Math.sin(time*2 + b.ph) * 3.5;
    ctx.moveTo(b.x, b.y);
    ctx.quadraticCurveTo(b.x + sw*.5, b.y - b.h*.6, b.x + sw, b.y - b.h);
  }
  ctx.stroke();
}
```
5. Herbes récoltables (halo pulsant), jarres, coffres.
6. Héros (ombre, balancement, `tilt`, `scale(face,1)` pour le retournement).
7. Fumée, feuilles au vent, étincelles de récolte, lucioles.
8. (après `ctx.restore()`) lumière chaude plein écran + marqueur de destination + HUD.

**Culling :** calcule le viewport monde (`vx0/vx1/vy0/vy1` = cam ± demi-écran/zoom, +40 px de marge) et saute tout ce qui est dehors. Prérequis dès que tu dépasses ~500 entités animées.

**Points d'attention perf :**
- `ctx.setTransform(DPR, 0, 0, DPR, 0, 0)` une fois par frame, `DPR = min(2, devicePixelRatio)`. Ne jamais rendre en DPR > 2 : coût ×4 pour un gain invisible.
- N'utilise ni `ctx.filter`, ni `shadowBlur`, ni `globalCompositeOperation` lourds dans la boucle : c'est ce qui différencie ce style du HD-2D, et c'est pour ça qu'il tient sur mobile.
- Throttle le HUD : n'écris dans le DOM que si la valeur affichée change (compteur zoom/FPS de la démo).
- Compteur FPS intégré pendant le dev ; vise 60 fps desktop, 30+ fps mobile milieu de gamme.

---

## 9 bis. Couche d'ambiance (cycle jour/nuit, faune, météo)

En provenance de la démo A+. Toutes ces pièces restent dans le budget perf du style A : zéro `ctx.filter`, zéro flou plein écran, tout est either pré-rendu (coût nul par frame) soit une entité animée cullée comme les autres.

### Cycle jour/nuit doux

Un seul paramètre `dark` (0 jour → 1 nuit), piloté par un cycle de 100 s : 55 % jour, 15 % crépuscule, 20 % nuit, 10 % aube.

```js
const DAY_LEN = 100;
const cyc = ((time + 30) % DAY_LEN) / DAY_LEN;   // offset pour démarrer en journée
const dark = cyc < .55 ? 0
           : cyc < .70 ? (cyc-.55)/.15
           : cyc < .90 ? 1
           : 1-(cyc-.90)/.10;
const duskAmt = dark*(1-dark)*4;                  // pic orange aux transitions
```

Trois rectangles plein écran **après** `ctx.restore()` (espace écran, 1 fillRect chacun) :

```js
ctx.fillStyle = "rgba(255,241,205," + (0.05*(1-dark)).toFixed(3) + ")";  // chaude le jour
ctx.fillRect(0, 0, VW, VH);
if (duskAmt > .02) { /* rgba(255,140,60, 0.16*duskAmt) */ }               // orangée crépuscule
if (dark > .02)   { /* rgba(14,22,58, 0.42*dark) */ }                    // bleutée nuit
```

Dérivés gratuits :
- **Ombre du héros étirée** dans la direction opposée au soleil, qui s'allonge avec `dark` :
```js
const shL = 1 + dark*1.1;
ctx.beginPath(); ctx.ellipse(hx + 7*shL, hy + 10 + 2*shL, 12*shL, 4.5, .35, 0, 7); ctx.fill();
```
- **Halo nocturne** autour du héros : un seul `createRadialGradient`, alpha proportionnel à `dark` (visible à partir de `dark > .15`).
- **Phase affichée dans le HUD** (Jour/Soir/Nuit/Aube), écrite seulement si le libellé change (même patron throttle que le HUD principal).

**Point d'attention :** ne teinte **jamais** le monde en dessinant un rect par-dessus les entités interactives au-dessus du héros avec une couleur pleine : toujours des overlays semi-transparents en espace écran, après le rendu monde. La lisibilité des tuiles (chemin, herbes, eau) doit survivre à la nuit, sinon le gameplay se dégrade avec la lumière.

### Faune : papillons le jour, lucioles la nuit

Même patron pour les deux, symétrie jour/nuit :

```js
// lucioles : intensité et halo bokeh montent avec l'obscurité
const a = (.45 + .45*Math.sin(time*2 + f.ph)) * (.2 + .8*dark);
if (dark > .3) { /* halo radial rgba(255,233,168, .30*dark), rayon f.r*5 */ }
// papillons : alpha s'effondre à la nuit tombée
ctx.globalAlpha = Math.min(1, (0.8 - dark)*2.5);
```

**Point d'attention :** le battement d'ailes (`Math.abs(Math.sin(time*14 + fl))` modulant la hauteur des deux ellipses) doit être rapide (~14 Hz) sinon le papillon semble cligner au lieu de voler. Reset `globalAlpha = 1` après le dessin.

### Traces de pas (feedback de déplacement)

Empreintes alternées gauche/droite, orientées selon la direction, posées au changement de tuile sur le chemin uniquement :

```js
if (t === 1 && hero.moving) {
  const pxp = -hero.diry, pyp = hero.dirx;                    // perpendiculaire au mouvement
  prints.push({ x: hero.x*T + pxp*(steps%2 ? 4.5 : -4.5),
                y: hero.y*T + pyp*(steps%2 ? 4.5 : -4.5) + 8,
                a: Math.atan2(hero.diry, hero.dirx), life: 5 });
  if (prints.length > 40) prints.shift();                    // borne mémoire
}
// rendu : 3 petites ellipses sombres, alpha = min(1, life/5)*.28
```

**Point d'attention :** borne le tableau (ici 40) et décrémente la vie dans la boucle de rendu, comme la fumée et les étincelles. Ce sont les mêmes 20 lignes pour toute particule temporaire.

### Herbes réactives et rafales

Deux effets, une seule boucle (celle des lames groupées par couleur, cf. §9) :

```js
// rafale ondulante : la même vague traverse toute la carte
const sw = Math.sin(time*2 + b.ph) * 3.5 * (1 + .5*Math.sin(time*.6 + b.x*.01 + b.y*.006));
// poussée du héros : les lames s'écartent quand il passe à moins de 42 px
const hd = Math.hypot(b.x - hpx0, b.y - hpy0);
const push = hd < 42 ? (1 - hd/42) * 7 : 0;
ctx.quadraticCurveTo(b.x + (sw+push*pdx)*.5, b.y - b.h*.6, b.x + sw + push*pdx, b.y - b.h + push*pdy*.4);
```

**Point d'attention :** la rafale doit dépendre de la position (`b.x*.01 + b.y*.006`) et non du seul temps, sinon tout le pré frémit en bloc et l'effet casse l'illusion d'un souffle traversant.

### Graines de pissenlit (vent visible)

Une dizaine de duvets blancs qui dérivent vers l'est, vitesse modulée par la rafale (`gustV = .5 + .5*Math.sin(time*.6)`), wrap horizontal. Renforcent la direction du vent suggérée par les herbes, coût quasi nul.

### Bordures de fleurs autour des patchs de hautes herbes

Cuites dans le pré-rendu (coût nul par frame) : des fleurs échantillonnées sur l'ellipse de contour de chaque patch, uniquement sur tuiles `0`.

**Intérêt gameplay :** marque visuellement les zones à rencontres sans un mot d'UI. Combines-y une légère teinte de socle plus sombre (déjà présente) : le joueur apprend le danger en une partie de seconde.

### Écume animée de l'étang

Segments courts (`moveTo`/`lineTo`) qui parcourent l'ellipse du bord avec phases décalées, alpha oscillant, remplaçant le cercle statique. Le rayon « respire » déjà via `br = 5.35*T + Math.sin(time*.8)*3`.

**Point d'attention :** autour d'un point d'eau, trois signaux suffisent à « vendre » le liquide : reflets scintillants (ondes courtes), écume au bord (phases décalées), respiration du contour. Plus coûteux (vagues simulées) n'apporte rien à cette échelle de zoom.

## 10. Entrées : souris ET tactile

```js
cv.addEventListener("pointerdown", e => {
  if (busy) return; dragging = true;
  const wx = cam.x + (e.clientX - VW/2) / cam.z;   // écran -> monde (inverse caméra)
  const wy = cam.y + (e.clientY - VH/2) / cam.z;
  // 1) tap héros = coup   2) tap jarre = aller frapper   3) tap objet = interagir
  // 4) sinon : setTarget (marche)
});
cv.addEventListener("pointermove", e => { if (dragging && !busy) setTarget(e.clientX, e.clientY); });
```

- `touch-action: none` sur le canvas (sinon le navigateur capte le drag pour le scroll).
- `setTarget` reçoit des **coordonnées client**, convertit en monde via la caméra ; recalcul A* seulement si la tuile cible a changé.
- Détection tactile pour les boutons flottants ⚔️/📦 :
```js
if (matchMedia("(pointer: coarse)").matches || "ontouchstart" in window) document.body.classList.add("touch");
```
- Boutons : `touch-action: manipulation` (évite le délai de 300 ms) et `e.stopPropagation()` pour ne pas déclencher le déplacement.

**Point d'attention iOS :** `pointerdown`/`pointermove` marchent bien partout, mais écoute `pointerup`/`pointercancel` sur `window` (pas le canvas) pour ne pas rester « en marche » quand le doigt sort de l'écran.

---

## 11. Checklist d'intégration au repo

1. Extraire la boucle de rendu de `dist.html` (monolithe) vers `src/ui.js` + modules `errance/*`, reconstruire via le build `shell.html` + `ui.js`.
2. Piloter la carte depuis `zones.json` : grille, seed décor, `enc_rate`, objets, spawns, sortie(s) de zone.
3. Brancher la transition de combat sur `engine/combat.js` : contrat d'entrée (monstre tiré selon la zone/niveau), contrat de sortie (résultat, position tuiles restaurée, `grace ≥ 2`).
4. Brancher tuile `5` (porte donjon) sur `dungeons.json` et tuile `10`/coffres sur l'inventaire.
5. Persistance : position tuiles, coffres/jarres/herbes pris, `steps`, buffs.
6. Test mobile réel (Safari iOS) : dt borné, pointer events, `touch-action`, boutons visibles.
7. Budget perf mesuré : compteur FPS, `performance.mark` sur le pré-rendu de zone.
8. Couche d'ambiance (§9 bis) : décide tôt si le cycle jour/nuit est global au jeu ou par zone (la longueur du cycle, `DAY_LEN`, peut vivre dans `zones.json`).

---

## 12. Pièges récapitulatif

| Piège | Symptôme | Fix |
|---|---|---|
| dt non borné | héros traverse les murs après un onglet inactif | `Math.min(.05, dt)` |
| Lerp fixe (`*0.1`) | caméra plus lente à 30 fps qu'à 60 | `Math.min(1, k*dt)` |
| A* à chaque pointermove | CPU à 100 % pendant le drag | mémo tuile cible (`lastTx/lastTy`) |
| Pas de grâce post-combat | rencontres en boucle à la sortie | `GRACE_STEPS` + autel |
| Waypoints sans test « dépassé » | le héros orbite autour du point | produit scalaire avec le segment suivant |
| Objets cassables cuits dans le pré-rendu | visuel incohérent après bris | dessiner entités à part de `base` |
| Écran -> monde sans zoom | cliquabilité fausse dès que `cam.z ≠ 1` | toujours diviser par `cam.z` (cf. §10) |
| DPR non plafonné | 5-10 fps sur mobiles récents | `min(2, devicePixelRatio)` |
| Grille en objets JS | mémoire ×20 et cache-hostile | `Uint8Array` plat |
| HUD écrit à chaque frame | jank GC sur mobile | écrire seulement si la valeur change |
| Tintée de nuit opaque par-dessus le monde | tuiles illisibles la nuit | overlays semi-transparents ≤ ~0.45 alpha |
| Rafale liée au temps seul | tout le pré frémit en bloc | onde dépendante de la position (`b.x*.01`) |
| Particules sans borne mémoire | fuite lente sur session longue | cap + décrément de vie dans la boucle de rendu |

---

*Source : démos « Errance A » et « Errance A+ », code complet révisé. Paramètres numériques (ENC_RATE 0.16, GRACE_STEPS 2, T=36, WALK_SPEED 4.4 tuiles/s, lerp cam 4.5, look-ahead 0.12 s, zoom 1.05→1.7, DAY_LEN 100 s) : valeurs validées en jeu, à affiner par zone.*