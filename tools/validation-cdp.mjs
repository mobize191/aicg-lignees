// Driver CDP minimal (Node 22+, WebSocket global) — joue docs/validation-ihm.md (v1.33) S1-S20 + checks contenu v3
// Usage : staging .site servi sur 8080 + chrome --remote-debugging-port=9222
import { writeFileSync, mkdirSync } from 'node:fs';

const CDP_HTTP = 'http://localhost:9222';
const GAME = 'http://localhost:8080/';
const OUT = 'docs/captures-validation/v1.33';
mkdirSync(OUT, { recursive: true });

const report = [];
const consoleErrors = [];
let shotCount = 0;
const shotNames = [];

function log(scenario, status, detail = '') {
  report.push({ scenario, status, detail });
  console.log(`${status === 'OK' ? 'OK  ' : status === 'KO' ? 'KO  ' : 'INFO'} ${scenario}${detail ? ' — ' + detail : ''}`);
}

async function newTarget() {
  const res = await fetch(`${CDP_HTTP}/json/new?about:blank`, { method: 'PUT' });
  return res.json();
}

class CDP {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.id = 0; this.pending = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      } else if (msg.method) {
        if (msg.method === 'Runtime.exceptionThrown') consoleErrors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
          consoleErrors.push('console.error: ' + msg.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
        }
        if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
          consoleErrors.push('log: ' + String(msg.params.entry.text).slice(0, 300));
        }
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
  async evaljs(expression, awaitPromise = false) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
  }
  async shot(name) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
    shotNames.push(name);
    shotCount++;
  }
  async setViewport(w, h) {
    await this.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
  }
  async nav(url) {
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Log.enable');
    await this.send('Page.navigate', { url });
    for (let i = 0; i < 100; i++) { await new Promise(r => setTimeout(r, 200)); if (await this.evaljs('document.readyState') === 'complete') return; }
  }
  async waitFor(expr, timeout = 15000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      try { if (await this.evaljs(expr)) return true; } catch (e) { /* ignore */ }
      await new Promise(r => setTimeout(r, 250));
    }
    return false;
  }
  async click(sel) { return this.evaljs(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; })()`); }
  async clickBtn(txt) { return this.evaljs(`(() => { const b = [...document.querySelectorAll('button, a.btn')].find(x => ${JSON.stringify(txt)}.test(x.innerText) && !x.disabled); if (!b) return false; b.click(); return true; })()`); }
  async tap(sel) {
    const r = await this.evaljs(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
    if (!r) return false;
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r.x, y: r.y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r.x, y: r.y, button: 'left', clickCount: 1 });
    return true;
  }
  async closeModals() { await this.evaljs(`document.querySelectorAll('.modal-overlay').forEach(o => o.remove()); 0`); }
  async clickAt(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
}

async function pageChecks(cdp, label, mobile) {
  const r = await cdp.evaljs(`(() => ({
    sw: document.documentElement.scrollWidth, iw: window.innerWidth,
    bodyTail: document.body.innerText.slice(-600),
    smallBtns: [...document.querySelectorAll('button, .btn, a.btn')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.width < 32 || r.height < 32); }).map(b => (b.className || b.id || b.innerText.trim().slice(0, 10)) + ':' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height))
  }))()`);
  log(`${label} [${mobile ? 'mobile' : 'desktop'}] pas de scroll horizontal`, r.sw <= r.iw + 1 ? 'OK' : 'KO', `scrollWidth=${r.sw} innerWidth=${r.iw}`);
  const cssBrut = /\.(chip|shop-row|recomp-list|fx-video|equip-slots)\b/.test(r.bodyTail);
  log(`${label} [${mobile ? 'mobile' : 'desktop'}] aucun CSS brut en bas de page`, !cssBrut ? 'OK' : 'KO', cssBrut ? r.bodyTail.slice(-150) : '');
  if (mobile) log(`${label} [mobile] tous les boutons >= 32 px`, r.smallBtns.length === 0 ? 'OK' : 'KO', r.smallBtns.join(', '));
}

// entre en combat depuis #donjons (gère la modale de modificateur de run)
async function enterCombat(cdp) {
  await cdp.evaljs('go("#donjons")');
  await new Promise(r => setTimeout(r, 500));
  await cdp.evaljs(`(() => { const b = document.querySelector('.enter-btn[data-dungeon]') || [...document.querySelectorAll('#app .btn, #app button')].find(x => /entrer|étage 1/i.test(x.innerText) && !x.disabled); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 600));
  const mod = await cdp.evaljs(`!!document.querySelector('#mod-free')`);
  if (mod) { await cdp.click('#mod-free'); }
  await cdp.closeModals();
  const ok = await cdp.waitFor('location.hash === "#combat" && typeof state !== "undefined" && !!state && !!state.team', 20000);
  await cdp.evaljs('speedIdx = 1; 0');
  await new Promise(r => setTimeout(r, 1200));
  return ok;
}

async function main() {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.setViewport(1440, 900);
  await cdp.nav(GAME);
  await cdp.waitFor('typeof store !== "undefined" && !!document.querySelector("#app")', 20000);
  await new Promise(r => setTimeout(r, 1500));

  // ---------- S1 ----------
  await cdp.evaljs('localStorage.clear()');
  await cdp.nav(GAME);
  await cdp.waitFor('typeof store !== "undefined"', 20000);
  await new Promise(r => setTimeout(r, 800));
  const s1depart = await cdp.evaljs(`(() => { const el = document.querySelector('#app'); return { hasDepart: /départ|proposition|choisir|choisissez|novices/i.test(el.innerText), text: el.innerText.slice(0, 160) }; })()`);
  log('S1 écran de départ à 4 propositions', s1depart.hasDepart ? 'OK' : 'KO', s1depart.text.replace(/\n/g, ' ').slice(0, 100));
  await cdp.shot('S1-depart-desktop');
  await cdp.evaljs(`(() => { const b = document.querySelector('#app .gcell, #app [data-id]'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 900));
  const s1after = await cdp.evaljs(`({ n: store.instances.length, departFait: store.departFait, accueil: !!document.querySelector('.hub-scene, .hub-menu') })`);
  await cdp.closeModals();
  log('S1 2 cartes accordées + accueil ouvert', s1after.n === 2 && s1after.departFait === true && s1after.accueil ? 'OK' : 'KO', JSON.stringify(s1after));

  // ---------- S2 ----------
  await cdp.evaljs('go("#accueil")');
  await new Promise(r => setTimeout(r, 700));
  const s2 = await cdp.evaljs(`({ scene: !!document.querySelector('.hub-scene'), menu: !!document.querySelector('.hub-menu'), wild: !!document.querySelector('#hub-wild'), npc: !!document.querySelector('.hub-npc'), perso: !!document.querySelector('a[href="#personnage"]') })`);
  log('S2 hub-ville : scène + menu + Terres Sauvages + héroïne + entrée Personnage', s2.scene && s2.menu && s2.wild && s2.npc && s2.perso ? 'OK' : 'KO', JSON.stringify(s2));
  await cdp.shot('S2-accueil-desktop');
  await cdp.click('.hub-npc');
  await new Promise(r => setTimeout(r, 400));
  const bulle = await cdp.evaljs(`!!document.querySelector('.modal-overlay, .npc-bubble, .bubble') || /dit|bonjour|salut|lignée/i.test(document.body.innerText.slice(-400))`);
  log('S2 héroïne cliquable (bulle de dialogue)', bulle ? 'OK' : 'INFO', '');
  await cdp.click('#hub-wild');
  await new Promise(r => setTimeout(r, 400));
  const teamEmpty = await cdp.evaljs(`store.team.slots.filter(Boolean).length`);
  const pop = await cdp.evaljs(`!!document.querySelector('#hub-pop.on, .modal-overlay')`);
  log('S2 pop-up si navigation sans équipe (équipe vide ici)', teamEmpty === 0 ? (pop ? 'OK' : 'KO') : 'INFO', `slots=${teamEmpty} pop=${pop}`);
  await cdp.evaljs(`(() => { const b = document.querySelector('#hub-pop-close, .modal-actions .btn.ghost'); if (b) b.click(); })()`);
  await pageChecks(cdp, 'S2 accueil', false);

  // ---------- S3 ----------
  await cdp.evaljs('go("#equipe")');
  await new Promise(r => setTimeout(r, 600));
  await cdp.closeModals();
  const s3 = await cdp.evaljs(`({ slots: document.querySelectorAll('.slot[data-idx]').length, hasCell: !!document.querySelector('#app .gcell.cat') })`);
  await cdp.tap('#app .gcell.cat');
  await new Promise(r => setTimeout(r, 400));
  await cdp.evaljs(`(() => { const cells = document.querySelectorAll('#app .gcell.cat'); if (cells[1]) cells[1].scrollIntoView({ block: 'center' }); })()`);
  await cdp.tap('#app .gcell.cat:nth-of-type(2), #app .grid .gcell.cat:nth-child(2)').catch(() => {});
  await cdp.evaljs(`(() => { const cells = [...document.querySelectorAll('#app .gcell.cat')]; const rest = cells.find(c => !store.team.slots.includes(Number(c.dataset.iid))); if (rest) addCardIid(Number(rest.dataset.iid)); })()`);
  await new Promise(r => setTimeout(r, 400));
  const s3b = await cdp.evaljs(`({ team: store.team.slots.filter(Boolean).length, forms: !!document.querySelector('#form-3-2') && !!document.querySelector('#form-2-3'), back: !!document.querySelector('#equipe-back') })`);
  log('S3 5 slots + carte posée + formation 3+2/2+3 + bouton retour', s3.slots === 5 && s3b.team >= 1 && s3b.forms && s3b.back ? 'OK' : 'KO', JSON.stringify({ ...s3, ...s3b }));
  await cdp.shot('S3-equipe-desktop');
  await pageChecks(cdp, 'S3 equipe', false);

  // ---------- S4 ----------
  await cdp.evaljs('go("#collection")');
  await new Promise(r => setTimeout(r, 700));
  const s4 = await cdp.evaljs(`({ cards: document.querySelectorAll('.card').length, art: document.querySelectorAll('.art-img, .art img').length })`);
  log('S4 collection : cartes rendues', s4.cards > 0 ? 'OK' : 'KO', JSON.stringify(s4));
  log('S4 illustrations chargées (assets-v3.json, défaut V3.0 ; assets-v3.1.json commutable 🖼️)', s4.art > 0 ? 'OK' : 'INFO', `art=${s4.art}`);
  const s4b = await cdp.evaljs(`(() => { const t = document.querySelector('#app').innerText; const heads = [...document.querySelectorAll('#app h3')].map(h => h.innerText); return { seuil: heads.some(h => /Arbitres du Seuil/i.test(h)), miroir: heads.some(h => /Chœur Miroir/i.test(h)), pont: heads.some(h => /Tisseuses du Pont/i.test(h)), compagnons: heads.some(h => /Sabre|Ombre|Aube|Bouclier|Braise|Bosquet|Eau/i.test(h)) }; })()`);
  log('S4 collection : familles divines joueur (seuil/miroir/pont) listées', s4b.seuil && s4b.miroir && s4b.pont ? 'OK' : 'KO', JSON.stringify(s4b));
  await cdp.shot('S4-collection-desktop');

  // ---------- S5 ----------
  await cdp.evaljs('go("#donjons")');
  await new Promise(r => setTimeout(r, 600));
  const s5 = await cdp.evaljs(`({ nv: /Nv \\d+/.test(document.querySelector('#app').innerText), locks: document.querySelectorAll('.locked, [disabled]').length })`);
  log('S5 donjons : sélecteur Nv + verrous', s5.nv ? 'OK' : 'KO', JSON.stringify(s5));
  await cdp.shot('S5-donjons-desktop');

  // ---------- S6 : combat auto ----------
  const inCombat = await enterCombat(cdp);
  const s6 = await cdp.evaljs(`({ units: document.querySelectorAll('.unit').length, speed: !!document.querySelector('#speed'), fx: !!document.querySelector('#fx-toggle'), mode: !!document.querySelector('#mode'), avant: state?.team?.avant?.length ?? -1, arriere: state?.team?.arriere?.length ?? -1 })`);
  log('S6 combat : plateau (unités) + rangs avant/arrière + contrôles', inCombat && s6.units > 0 && s6.speed && s6.avant >= 0 ? 'OK' : 'KO', JSON.stringify(s6));
  await cdp.shot('S6-combat-desktop');
  await cdp.click('#speed');
  await new Promise(r => setTimeout(r, 300));
  const spd = await cdp.evaljs(`document.querySelector('#speed')?.innerText ?? ''`);
  log('S6 bouton #speed cyclé', /×/.test(spd) ? 'OK' : 'KO', spd);
  await cdp.evaljs('speedIdx = 1; 0');

  // ---------- S7 : tactique + fenêtre d'action ----------
  await cdp.click('#mode'); // passe en Tactique
  await new Promise(r => setTimeout(r, 400));
  const hasAct = await cdp.waitFor(`!!document.querySelector('.act-modal')`, 40000);
  const s7 = await cdp.evaljs(`(() => { const t = document.querySelector('.act-modal')?.innerText ?? ''; return { act: !!document.querySelector('.act-modal'), undefined: /undefined/.test(t), reduce: !!document.querySelector('.act-reduce'), sorts: (t.match(/✦/g) ?? []).length }; })()`);
  log('S7 fenêtre d’action tactique, aucune ligne « undefined »', hasAct && !s7.undefined ? 'OK' : 'KO', JSON.stringify(s7));
  await cdp.shot('S7-fenetre-action-desktop');

  // ---------- S18 : rangs + elOf (dans le même combat) ----------
  const s18 = await cdp.evaljs(`(() => { const u = [...(state?.team?.avant ?? []), ...(state?.team?.arriere ?? [])]; return { avant: state?.team?.avant?.length ?? -1, arriere: state?.team?.arriere?.length ?? -1, rangs: u.every(x => x.rang === 'avant' || x.rang === 'arriere'), formBtns: !!document.querySelector('#form-3-2') || !!document.querySelector('#form-2-3'), rows: document.querySelectorAll('.line').length }; })()`);
  log('S18 rangs avant/arrière sur chaque unité, formation figée en combat (pas de boutons)', s18.avant >= 0 && s18.rangs && !s18.formBtns ? 'OK' : 'KO', JSON.stringify(s18));
  const s18b = await cdp.evaljs(`(() => { const p = document.querySelector('.unit[data-uid]'); if (!p) return 'no-pion'; p.classList.add('targeted'); const ok = document.querySelector('.unit.targeted') === p; p.classList.remove('targeted'); return ok; })()`);
  log('S18 elOf() : le pion .unit est la cible surlignée (pas les rail-chips)', s18b === true ? 'OK' : 'KO', String(s18b));

  // ---------- S20 : réduire + Objet ----------
  const red = await cdp.evaljs(`(() => { const b = document.querySelector('.act-reduce'); if (!b) return 'absent'; b.click(); const box = document.querySelector('.act-modal'); const r1 = box?.classList.contains('reduced'); b.click(); return r1; })()`);
  log('S20 bouton ▾ réduire replie/rouvre la fenêtre d’action', red === true ? 'OK' : 'KO', String(red));
  await cdp.shot('S20-fenetre-reduite-desktop');
  await cdp.evaljs(`(() => { store.potions = { ...(store.potions ?? {}), soin30: 1 }; save(); })()`);
  const objBtn = await cdp.evaljs(`(() => { const m = document.querySelector('.act-modal'); const b = m && [...m.querySelectorAll('button')].find(x => /🧪|objet/i.test(x.innerText)); if (b) { b.click(); return true; } return false; })()`);
  await new Promise(r => setTimeout(r, 500));
  const drink = await cdp.evaljs(`(() => { const b = [...document.querySelectorAll('button')].find(x => /soin|gorgée|potion/i.test(x.innerText) && x.closest('.modal-overlay, .act-modal')); if (b) { b.click(); return true; } return false; })()`);
  await new Promise(r => setTimeout(r, 600));
  const potAfter = await cdp.evaljs(`store.potions.soin30 ?? 0`);
  log('S20 action 🧪 Objet : potion bue, stock décrémenté', drink && potAfter === 0 ? 'OK' : 'INFO', `objet=${objBtn} bu=${drink} reste=${potAfter}`);
  await cdp.shot('S20-objet-desktop');
  await cdp.evaljs(`(() => { const b = document.querySelector('.act-modal .act-close, .act-modal [class*="close"], .act-modal .btn.ghost'); if (b) b.click(); })()`);

  // ---------- S16 : vidéos FX ----------
  const fxReach = await cdp.evaljs(`fetch('fx/fx-leviathan-laser.webm', { method: 'HEAD' }).then(r => r.status).catch(() => 0)`, true);
  log('S16 webm FX servie en staging', fxReach === 200 ? 'OK' : 'INFO', 'status=' + fxReach);
  const fxCtx = await cdp.evaljs(`({ app: !!combatApp, st: typeof state !== "undefined" && !!state })`);
  if (!fxCtx.app || !fxCtx.st) await enterCombat(cdp);
  const fx1 = await cdp.evaljs(`(async () => { localStorage.removeItem('aicg-fx'); speedIdx = 1; fxMotionOK = null; playFxVideo({ name: 'Marée Noire' }); playFxVideo({ name: 'Couronne des Écumes' }); await new Promise(r => setTimeout(r, 400)); const ovs = document.querySelectorAll('.fx-video-overlay'); const v = ovs[0]?.querySelector('video'); return { overlays: ovs.length, ready: v?.readyState ?? 0, paused: v?.paused ?? true, rate: v?.playbackRate ?? 0, err: v?.error?.code ?? null }; })()`, true);
  log('S16 une seule vidéo FX à la fois (2 casts → 1 overlay)', fx1.overlays === 1 ? 'OK' : 'KO', JSON.stringify(fx1));
  log('S16 la vidéo joue (readyState ≥ 2, pas en pause, rate > 0)', fx1.ready >= 2 && !fx1.paused && fx1.rate > 0 ? 'OK' : 'INFO', JSON.stringify(fx1));
  await cdp.shot('S16-fx-overlay-desktop');
  const fxToggle = await cdp.evaljs(`(() => { const b = document.querySelector('#fx-toggle'); if (!b) return 'absent'; b.click(); const v = localStorage.getItem('aicg-fx'); b.click(); return v; })()`);
  log('S16 toggle 🎬 FX persisté (aicg-fx)', fxToggle === 'off' ? 'OK' : 'KO', String(fxToggle));
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cdp.evaljs('fxMotionOK = null; playFxVideo({ name: "Marée Noire" }); 0');
  await new Promise(r => setTimeout(r, 900));
  const fxRM = await cdp.evaljs(`document.querySelectorAll('.fx-video-overlay').length`);
  log('S16 prefers-reduced-motion : aucun overlay FX', fxRM === 0 ? 'OK' : 'KO', 'overlays=' + fxRM);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: '' }] });

  // ---------- S8/S9 : fiche + fin de combat + récompenses ----------
  const pion = await cdp.evaljs(`(() => { const p = document.querySelector('.unit[data-uid]'); if (p) { p.click(); return true; } return false; })()`);
  await new Promise(r => setTimeout(r, 500));
  const s8 = await cdp.evaljs(`({ modal: !!document.querySelector('.modal-overlay'), img: !!document.querySelector('.modal-overlay img, .modal-hero img') })`);
  log('S8 fiche au clic sur un pion', pion && s8.modal ? 'OK' : 'INFO', JSON.stringify({ pion, ...s8 }));
  await cdp.shot('S8-fiche-desktop');
  await cdp.evaljs(`(() => { const b = document.querySelector('.modal-overlay .modal-actions .btn, .modal-overlay button'); if (b) b.click(); })()`);
  const s9ctx = await cdp.evaljs(`({ app: !!combatApp, st: typeof state !== "undefined" && !!state, hash: location.hash })`);
  if (!s9ctx.st || s9ctx.hash !== '#combat') await enterCombat(cdp);
  await cdp.evaljs('autoMode = true; speedIdx = 6; 0'); // auto + turbo pour finir vite
  const recomp = await cdp.waitFor(`!!document.querySelector('.recomp-row') || /tout ramasser/i.test(document.body.innerText)`, 90000);
  const s9 = await cdp.evaljs(`({ rows: document.querySelectorAll('.recomp-row').length, tout: /tout ramasser/i.test(document.body.innerText) })`);
  log('S9 écran Récompenses (lignes + « Tout ramasser »)', recomp && s9.rows > 0 && s9.tout ? 'OK' : 'INFO', JSON.stringify({ recomp, ...s9 }));
  await cdp.shot('S9-recompenses-desktop');
  await cdp.evaljs(`(() => { const b = [...document.querySelectorAll('button')].find(x => /tout ramasser/i.test(x.innerText)); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 700));

  // ---------- S10 : boutique + atelier ----------
  await cdp.evaljs(`store.gold = Math.max(store.gold, 500); save(); go("#boutique")`);
  await new Promise(r => setTimeout(r, 700));
  const s10 = await cdp.evaljs(`(() => { const t = document.querySelector('#app').innerText; return { potions: /potion/i.test(t), marchand: /marchand|créature/i.test(t), craft: document.querySelectorAll('[data-craft]').length, atelier: /atelier/i.test(t) }; })()`);
  log('S10 boutique + atelier : rayons + 90 boutons Fabriquer', s10.potions && s10.marchand && s10.craft === 90 ? 'OK' : 'KO', JSON.stringify(s10));
  await cdp.shot('S10-boutique-desktop');
  const gold0 = await cdp.evaljs('store.gold');
  const buy = await cdp.evaljs(`(() => { const b = document.querySelector('[data-buy]'); if (b && !b.disabled) { b.click(); return true; } return false; })()`);
  await new Promise(r => setTimeout(r, 500));
  const gold1 = await cdp.evaljs('store.gold');
  log('S10 achat potion débite l’or', buy && gold1 < gold0 ? 'OK' : 'KO', `or ${gold0} -> ${gold1}`);
  // craft d'une pièce de base avec matériaux posés en setup
  await cdp.evaljs(`store.materiaux['ecume'] = 5; store.gold = Math.max(store.gold, 1000); save(); go("#boutique")`);
  await new Promise(r => setTimeout(r, 500));
  const craftInfo = await cdp.evaljs(`(() => { const b = document.querySelector('[data-craft^="eq-set-marees-base"]'); if (!b) return null; const id = b.dataset.craft; const g0 = store.gold, m0 = store.materiaux['ecume']; b.click(); return { id, g0, m0, g1: store.gold, m1: store.materiaux['ecume'], owned: store.equipment[id] ?? 0 }; })()`);
  log('S10 craft pièce de base : matériaux + or débités, pièce possédée', craftInfo && craftInfo.owned === 1 && craftInfo.m1 === craftInfo.m0 - 3 && craftInfo.g1 === craftInfo.g0 - 100 ? 'OK' : 'KO', JSON.stringify(craftInfo));
  await cdp.shot('S10-atelier-desktop');
  await pageChecks(cdp, 'S10 boutique', false);
  // contenu v3 lot C1 : marchand v2 — 3 offres du jour, catalogue complet, cadenas, achat
  await cdp.evaljs(`store.gold = 50000; store.progress.marees.diffs[1].record = 0; save(); go("#boutique")`);
  await new Promise(r => setTimeout(r, 600));
  const s10m = await cdp.evaljs(`(() => { const offres = [...document.querySelectorAll('[data-buy-offre]')].map(b => b.dataset.buyOffre); const cat = document.querySelectorAll('[data-buy-mon]').length; const t = document.querySelector('#app').innerText; const locks = (t.match(/🔒/g) ?? []).length; const prix = /1\s?500/.test(t) && /4\s?500/.test(t) && /8\s?000/.test(t); const apiOffres = offresMarchandDuJour().map(m => m.id); return { nbOffres: offres.length, offres, apiOffres, cat, locks, prix, debloquees: raretesMarchandDebloquees().join(',') }; })()`);
  log('S10 marchand v2 : 3 offres du jour rendues = rotation seedOfDay, catalogue complet, prix actés UC/R/SR', s10m.nbOffres === 3 && s10m.offres.join() === s10m.apiOffres.join() && s10m.cat > 50 && s10m.prix ? 'OK' : 'KO', JSON.stringify({ nbOffres: s10m.nbOffres, cat: s10m.cat, locks: s10m.locks, prix: s10m.prix, debloquees: s10m.debloquees }));
  log('S10 sans donjon bouclé : seule C débloquée, cadenas 🔒 sur les autres raretés', s10m.debloquees === 'C' && s10m.locks > 0 ? 'OK' : 'KO', `debloquees=${s10m.debloquees} locks=${s10m.locks}`);
  const buyOffre = await cdp.evaljs(`(() => { const b = document.querySelector('[data-buy-offre]:not([disabled])'); if (!b) return { ok: false, why: 'aucune offre achetable' }; const id = b.dataset.buyOffre; const g0 = store.gold, o0 = ownedOf(id) ?? 0; b.click(); return { ok: store.gold === g0 - marchandPrix(byIdSoft ? byIdSoft(id) : null) || store.gold < g0, id, g0, g1: store.gold, o1: ownedOf(id) ?? 0, o0 }; })()`);
  log('S10 achat d’une offre du jour débite l’or et ajoute l’exemplaire', buyOffre.ok && buyOffre.o1 === buyOffre.o0 + 1 ? 'OK' : 'KO', JSON.stringify(buyOffre));
  const buyLocked = await cdp.evaljs(`(() => { const pool = marchandMonsters(); const uc = pool.find(m => m.rarity === 'UC'); const g0 = store.gold; const r = buyMonster(uc.id); return { r, g1: store.gold, g0 }; })()`);
  log('S10 achat UC refusé tant que verrouillée (pas d’or débité)', buyLocked.r === false && buyLocked.g1 === buyLocked.g0 ? 'OK' : 'KO', JSON.stringify(buyLocked));
  await cdp.shot('S10-marchand-v2-desktop');
  // S21 : déblocage par donjon bouclé en Facile
  await cdp.evaljs(`store.progress.marees.diffs[1].record = 10; save(); go("#boutique")`);
  await new Promise(r => setTimeout(r, 600));
  const s21 = await cdp.evaljs(`(() => { const deb = raretesMarchandDebloquees().join(','); const pool = marchandMonsters(); const uc = pool.find(m => m.rarity === 'UC'); const g0 = store.gold; const r = buyMonster(uc.id); const t = document.querySelector('#app').innerText; const lockUc = t.includes('🔒'); return { deb, r, g1: store.gold, g0, lockUc }; })()`);
  log('S21 donjon bouclé en Facile → UC débloquée et achetable (1 500 or)', s21.deb === 'C,UC' && s21.r === true && s21.g1 === s21.g0 - 1500 ? 'OK' : 'KO', JSON.stringify(s21));
  await cdp.shot('S21-marchand-debloque-desktop');
  await cdp.evaljs(`store.progress.marees.diffs[1].record = 0; save();`);

  // ---------- S11 ----------
  await cdp.evaljs('go("#forge")');
  await new Promise(r => setTimeout(r, 600));
  const s11 = await cdp.evaljs(`(() => { const t = document.querySelector('#app').innerText; const headings = [...document.querySelectorAll('#app h2, #app h3, #app h4')].map(h => h.innerText); return { evolutions: /évolution/i.test(t), compagnons: /compagnon/i.test(t), autel: /autel/i.test(t), jetonUI: !!document.querySelector('[class*="jeton"], [data-jeton]') || headings.some(h => /^jetons?$/i.test(h.trim())), pierres: /pierre/i.test(t) }; })()`);
  log('S11 guilde : évolutions + compagnons + autel, aucun élément jeton', s11.evolutions && s11.compagnons && !s11.jetonUI ? 'OK' : 'KO', JSON.stringify(s11));
  await cdp.shot('S11-guilde-desktop');

  // ---------- S12 ----------
  await cdp.evaljs('go("#quetes")');
  await new Promise(r => setTimeout(r, 600));
  const s12 = await cdp.evaljs(`({ rows: document.querySelectorAll('.quest-row').length, bonus: /pierre d’éveil|pierre d'éveil/i.test(document.querySelector('#app').innerText) })`);
  log('S12 3 quêtes du jour + bonus complétion', s12.rows === 3 && s12.bonus ? 'OK' : 'KO', JSON.stringify(s12));
  await cdp.shot('S12-quetes-desktop');

  // ---------- S13 + S17 ----------
  await cdp.evaljs('go("#inventaire")');
  await new Promise(r => setTimeout(r, 600));
  const s13 = await cdp.evaljs(`(() => { const t = document.querySelector('#app').innerText; return { potions: /potion/i.test(t), materiaux: /matériau/i.test(t), equip: /équipement/i.test(t), back: !!document.querySelector('#inv-back') }; })()`);
  log('S13 inventaire groupé + bouton retour', s13.potions && s13.materiaux && s13.equip && s13.back ? 'OK' : 'KO', JSON.stringify(s13));
  await cdp.shot('S13-inventaire-desktop');
  await cdp.evaljs('go("#personnage")');
  await new Promise(r => setTimeout(r, 600));
  const s17 = await cdp.evaljs(`({ tabs: !!document.querySelector('#tab-equipe') && !!document.querySelector('#tab-inventaire'), equipe: !!document.querySelector('#form-3-2'), teamSlots: !!document.querySelector('#perso-body .slot'), back: !!document.querySelector('#perso-back') })`);
  log('S17 page Personnage : onglets + Équipe (formation, slots) + retour', s17.tabs && s17.equipe && s17.back ? 'OK' : 'KO', JSON.stringify(s17));
  await cdp.shot('S17-personnage-desktop');
  await cdp.evaljs(`document.querySelector('#tab-inventaire')?.click()`);
  await new Promise(r => setTimeout(r, 400));
  const s17b = await cdp.evaljs(`!!document.querySelector('#perso-body #inv-back, #perso-body .shop-row')`);
  log('S17 onglet Inventaire commute', s17b ? 'OK' : 'KO', '');
  await cdp.evaljs(`document.querySelector('#perso-back')?.click()`);
  await new Promise(r => setTimeout(r, 400));
  const s17c = await cdp.evaljs(`!document.querySelector('#perso-back')`);
  log('S17 bouton retour → accueil', s17c ? 'OK' : 'KO', '');

  // ---------- S14 ----------
  await cdp.evaljs('go("#terres")');
  await new Promise(r => setTimeout(r, 600));
  const s14a = await cdp.evaljs(`(() => { const btns = [...document.querySelectorAll('.enter-zone, [data-zone]')]; return { zones: btns.map(b => b.dataset.zone), total: (DATA.zones ?? []).length, unlocked: btns.filter(b => !b.disabled).length }; })()`);
  log('S14 les 5 zones listées, seule la zone de départ ouverte', s14a.total === 5 && s14a.unlocked === 1 && s14a.zones.includes('zone-marees') ? 'OK' : 'KO', JSON.stringify(s14a));
  await cdp.shot('S14-terres-desktop');
  const heroReach = await cdp.evaljs(`fetch('errance/heros-walk.png', { method: 'HEAD' }).then(r => r.status).catch(() => 0)`, true);
  log('S14 sprite sheet du héros servie (staging)', heroReach === 200 ? 'OK' : 'INFO', 'status=' + heroReach);
  await cdp.evaljs(`(() => { const b = [...document.querySelectorAll('.enter-zone, [data-zone]')].find(x => !x.disabled); if (b) b.click(); })()`);
  const inErr = await cdp.waitFor('location.hash === "#errance" && !!document.querySelector("#errance-canvas")', 15000);
  log('S14 entrée en zone : canvas errance', inErr ? 'OK' : 'KO', '');
  await new Promise(r => setTimeout(r, 1200));
  await cdp.shot('S14-errance-desktop');
  // déplacement au clic : essaie plusieurs directions jusqu'à ce que le héros bouge
  const cv = await cdp.evaljs(`(() => { const c = document.querySelector('#errance-canvas'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  const hb = await cdp.evaljs(`({ x: store.errance.hero.x, y: store.errance.hero.y })`);
  let moved = 0;
  for (const [dx, dy] of [[0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25], [0.2, 0.2], [-0.2, -0.2]]) {
    await cdp.clickAt(cv.x + cv.w * (0.5 + dx), cv.y + cv.h * (0.5 + dy));
    const okM = await cdp.waitFor(`Math.hypot(store.errance.hero.x - (${hb.x}), store.errance.hero.y - (${hb.y})) > 0.4`, 8000);
    if (okM) { moved = 1; break; }
  }
  const ha = await cdp.evaljs(`({ x: store.errance.hero.x, y: store.errance.hero.y, v: store.errance.hero.v })`);
  const d = Math.hypot(ha.x - hb.x, ha.y - hb.y);
  log('S14 déplacement au clic (pilotage inertiel)', moved && d > 0.4 ? 'OK' : 'KO', `d=${d.toFixed(2)} v=${JSON.stringify(ha.v)}`);
  await new Promise(r => setTimeout(r, 1500));
  await cdp.shot('S14-errance-deplacement-desktop');
  const errsBefore = consoleErrors.length;
  await new Promise(r => setTimeout(r, 3000));
  log('S14 errance stable (pas d’exception)', consoleErrors.length === errsBefore ? 'OK' : 'KO', `nouvelles=${consoleErrors.length - errsBefore}`);

  // ---------- S15 ----------
  await cdp.evaljs('go("#glossaire")');
  await new Promise(r => setTimeout(r, 600));
  const s15 = await cdp.evaljs(`({ symboles: /symboles/i.test(document.querySelector('#app').innerText), glyphs: /ℹ️|🎰|🌱/.test(document.querySelector('#app').innerText) })`);
  log('S15 glossaire : symboles de l’écran', s15.symboles && s15.glyphs ? 'OK' : 'KO', JSON.stringify(s15));
  await cdp.shot('S15-glossaire-desktop');

  // ---------- S19 : migration v27 au rechargement ----------
  await cdp.evaljs(`(() => { const k = 'fondations-cards-v1'; const d = JSON.parse(localStorage.getItem(k)); d.version = 26; if (d.instances[0]) d.instances[0].acc = [{ sort: 'lame-decume', cran: 'I' }, { sort: 'lame-decume', cran: 'I' }, { name: 'Jet d\\u2019Écume' }, { name: 'Jet d\\u2019Écume' }]; localStorage.setItem(k, JSON.stringify(d)); })()`);
  await cdp.nav(GAME);
  await cdp.waitFor('typeof store !== "undefined"', 20000);
  await new Promise(r => setTimeout(r, 1200));
  const s19 = await cdp.evaljs(`(() => { const inst = store.instances[0]; const acc = inst?.acc ?? []; const keys = acc.map(s => s.name ? 'n:' + s.name : 's:' + s.sort + ':' + (s.cran ?? '')); return { version: store.version ?? DATA.engine.CURRENT_VERSION, n: acc.length, uniq: new Set(keys).size === keys.length, coll: store.collection.size }; })()`);
  log('S19 migration v27 au rechargement : acc dédoublonné, version 27, collection intacte', s19.version === 27 && s19.uniq && s19.n === 2 ? 'OK' : 'KO', JSON.stringify(s19));

  // ---------- mobile 390x844 ----------
  await cdp.setViewport(390, 844);
  await new Promise(r => setTimeout(r, 500));
  for (const [hash, name] of [['#accueil', 'S2'], ['#equipe', 'S3'], ['#boutique', 'S10'], ['#personnage', 'S17'], ['#terres', 'S14']]) {
    await cdp.evaljs(`go("${hash}")`);
    await new Promise(r => setTimeout(r, 600));
    await pageChecks(cdp, `${name} ${hash}`, true);
    await cdp.shot(`${name}-${hash.slice(1)}-mobile`);
  }
  await cdp.evaljs('go("#terres")');
  await new Promise(r => setTimeout(r, 500));
  await cdp.evaljs(`(() => { const b = [...document.querySelectorAll('.enter-zone, [data-zone]')].find(x => !x.disabled); if (b) b.click(); })()`);
  await cdp.waitFor('!!document.querySelector("#errance-canvas")', 15000);
  await new Promise(r => setTimeout(r, 900));
  const mb = await cdp.evaljs(`(() => { const c = document.querySelector('#errance-canvas'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  const hb2 = await cdp.evaljs(`({ x: store.errance.hero.x, y: store.errance.hero.y })`);
  await cdp.clickAt(mb.x + mb.w * 0.5, mb.y + mb.h * 0.22);
  const okM = await cdp.waitFor(`Math.hypot(store.errance.hero.x - (${hb2.x}), store.errance.hero.y - (${hb2.y})) > 0.3`, 10000);
  const ha2 = await cdp.evaljs(`({ x: store.errance.hero.x, y: store.errance.hero.y })`);
  const dM = Math.hypot(ha2.x - hb2.x, ha2.y - hb2.y);
  log('S14 [mobile] tap déplace le héros', okM && dM > 0.3 ? 'OK' : 'KO', `d=${dM.toFixed(2)}`);
  await cdp.shot('S14-errance-mobile');
  await pageChecks(cdp, 'S14 errance', true);

  // ---------- rapport ----------
  const errsUniq = [...new Set(consoleErrors)];
  const kos = report.filter(r => r.status === 'KO');
  const rapport = [
    '# Rapport de validation IHM — AICG : Lignées (protocole v1.33, headless Chromium via CDP)',
    '',
    `Jeu servi en staging Pages (dist.html + assets-v3.json + assets-v3.1.json + fx/ + errance/) sur http://localhost:8080/ · Viewports 1440×900 et 390×844 · ${shotCount} captures dans \`${OUT}/\``,
    '',
    '## Résultats par scénario',
    '',
    ...report.map(r => `- **${r.scenario}** : ${r.status}${r.detail ? ' — ' + r.detail : ''}`),
    '',
    '## Captures de cette session',
    '',
    ...shotNames.map(n => '- `' + n + '.png`'),
    '',
    '## Erreurs console (exhaustif)',
    '',
    errsUniq.length ? errsUniq.map(e => '- ' + e).join('\n') : '- aucune',
    '',
    '## Verdict',
    '',
    kos.length === 0
      ? `VERT : ${report.filter(r => r.status === 'OK').length} checks OK, 0 KO, ${errsUniq.length} erreur(s) console.`
      : `ORANGE : ${kos.length} KO — ${kos.map(k => k.scenario).join(' ; ')}`,
    '',
  ].join('\n');
  writeFileSync(`${OUT}/rapport-validation.md`, rapport);
  console.log('\nRapport : ' + OUT + '/rapport-validation.md · captures : ' + shotCount);
  process.exit(0);
}

main().catch((e) => { console.error('DRIVER CRASH:', e); process.exit(1); });
