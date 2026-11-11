// Stub DOM permissif + boot du dist (partagé par combat-digest.mjs et smoke-ui.mjs).
// Leçons : le getter innerHTML retourne la CHAÎNE brute posée (les checks includes() lisent
// le template d'origine) ; le setter vide children et RE-PARSE en enfants (105),
// parentNode récursif au parse (89), Image résout en microtask via onerror (79),
// couper le body sur <script> (61), registre des ids pour getElementById.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);

let currentReg = null; // Map des id -> élément, posée par bootDist

function parseAttrs(str) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+)))?/g;
  let m;
  while ((m = re.exec(str))) attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}

const camelize = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function parseFragment(src, parentNode) {
  const root = { el: parentNode, children: [], text: '' };
  const stack = [root];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s[^>]*)?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[3] !== undefined) { stack[stack.length - 1].text += m[3]; continue; }
    const tag = m[1].toLowerCase();
    if (m[0].startsWith('</')) {
      while (stack.length > 1 && stack[stack.length - 1].tag !== tag) stack.pop();
      if (stack.length > 1) stack.pop();
      continue;
    }
    const node = makeEl(tag);
    for (const [k, v] of Object.entries(parseAttrs(m[2] ?? ''))) node.setAttribute(k, v);
    if (node._attrs.class) node.className = node._attrs.class;
    const frame = { tag, el: node, children: [], text: '' };
    stack[stack.length - 1].children.push(frame);
    stack.push(frame);
    if (currentReg && node._attrs.id) currentReg.set(node._attrs.id, node);
    if (VOID_TAGS.has(tag)) stack.pop();
  }
  const assemble = (frame) => {
    if (frame.el) {
      frame.el._text = frame.text;
      for (const f of frame.children) {
        const c = assemble(f);
        c.parentNode = frame.el;
        frame.el.children.push(c);
      }
      return frame.el;
    }
    return frame.children.map((f) => assemble(f));
  };
  // Le frame racine porte el = parentNode : on assemble ses enfants SANS retourner
  // le parent lui-même (sinon le setter innerHTML fait children = [this] et l'arbre
  // devient cyclique : récursion infinie de walk/_qsa).
  if (root.el) root.el._text = root.text;
  return root.children.map((f) => assemble(f));
}

export function makeEl(tag = 'div') {
  const listeners = {};
  const el = {
    tagName: String(tag).toUpperCase(),
    nodeType: 1,
    children: [],
    parentNode: null,
    dataset: {},
    style: {},
    _attrs: {},
    _text: '',
    _innerHTML: '',
    onclick: null,
    hidden: false,
    value: '',
    id: '',
    classList: (() => {
      const s = new Set();
      return {
        add: (...c) => c.forEach((x) => s.add(x)),
        remove: (...c) => c.forEach((x) => s.delete(x)),
        toggle(c, force) { const on = force === undefined ? !s.has(c) : !!force; if (on) s.add(c); else s.delete(c); return on; },
        contains: (c) => s.has(c),
        _set: s,
      };
    })(),
    addEventListener(t, f) { (listeners[t] ??= []).push(f); },
    removeEventListener() {},
    dispatch(t, ev = {}) {
      ev.preventDefault ??= () => {};
      ev.stopPropagation ??= () => {};
      ev.target ??= el;
      (listeners[t] ?? []).forEach((f) => f(ev));
    },
    click(ev) {
      this.dispatch('click', ev);
      if (typeof this.onclick === 'function') {
        this.onclick({ preventDefault() {}, stopPropagation() {}, target: this, currentTarget: this });
      }
    },
    appendChild(c) { c.parentNode?.removeChild?.(c); c.parentNode = this; this.children.push(c); return c; },
    insertBefore(c) { return this.appendChild(c); },
    removeChild(c) { const k = this.children.indexOf(c); if (k >= 0) this.children.splice(k, 1); return c; },
    remove() { this.parentNode?.removeChild?.(this); },
    setAttribute(n, v) {
      this._attrs[n] = String(v);
      if (n === 'id') this.id = String(v);
      if (n === 'hidden') this.hidden = true;
      if (n === 'value') this.value = String(v);
      if (n === 'class') {
        this.classList._set.clear();
        String(v).split(/\s+/).filter(Boolean).forEach((c) => this.classList._set.add(c));
      }
      if (n.startsWith('data-')) this.dataset[camelize(n.slice(5))] = String(v);
    },
    getAttribute(n) { return n in this._attrs ? this._attrs[n] : null; },
    removeAttribute(n) { delete this._attrs[n]; },
    closest() { return null; },
    focus() {}, blur() {}, scrollIntoView() {},
    get textContent() {
      let out = this._text ?? '';
      for (const c of this.children) out += c.textContent ?? '';
      return out;
    },
    set textContent(v) { this._text = String(v); this.children = []; },
    querySelector(sel) { return this._qsa(sel)[0] ?? null; },
    querySelectorAll(sel) { return this._qsa(sel); },
    _qsa(sel) {
      const wanted = String(sel).trim().split(/\s+/).map((tok) => {
        if (tok.startsWith('#')) return { kind: 'id', v: tok.slice(1) };
        if (tok.startsWith('.')) return { kind: 'cls', v: tok.slice(1) };
        if (tok.startsWith('[')) return { kind: 'attr', v: tok.slice(1, -1) };
        return { kind: 'tag', v: tok.toUpperCase() };
      });
      const matches = (node, w) =>
        w.kind === 'id' ? node._attrs.id === w.v
          : w.kind === 'cls' ? node.classList._set.has(w.v)
          : w.kind === 'attr' ? w.v in node._attrs
          : node.tagName === w.v;
      const found = [];
      const walk = (node) => {
        for (const c of node.children) {
          if (matches(c, wanted[wanted.length - 1])) {
            let ok = true;
            let p = c;
            for (let d = wanted.length - 2; d >= 0; d--) {
              let seen = false;
              while (p && p !== node.parentNode) {
                p = p.parentNode;
                if (p && matches(p, wanted[d])) { seen = true; break; }
              }
              if (!seen) { ok = false; break; }
            }
            if (ok) found.push(c);
          }
          walk(c);
        }
      };
      walk(this);
      return found;
    },
  };
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._innerHTML; },
    set(v) {
      this._innerHTML = String(v);
      this._text = '';
      const roots = parseFragment(this._innerHTML, this);
      this.children = Array.isArray(roots) ? roots : [roots];
    },
  });
  Object.defineProperty(el, 'className', {
    get() { return [...el.classList._set].join(' '); },
    set(v) {
      el.classList._set.clear();
      String(v).split(/\s+/).filter(Boolean).forEach((c) => el.classList._set.add(c));
    },
  });
  return el;
}

// paires clé -> expression à évaluer DANS le contexte du bundle
const API_PAIRS = {
  byId: 'byId', byIid: 'byIid', dungeonById: 'dungeonById', dungeonLevelOf: 'dungeonLevelOf', bandOf: 'bandOf', CATALOG: 'CATALOG', DUNGEONS: 'DUNGEONS',
  DIFFICULTIES: 'DIFFICULTIES', store: 'store', makeUnit: 'makeUnit', makeWave: 'makeWave',
  initCombat: 'initCombat', resolveTurn: 'resolveTurn', pickSpell: 'pickSpell', statsAt: 'statsAt',
  teamLevel: 'teamLevel', cardPower: 'cardPower', teamPower: 'teamPower', recommendedPower: 'recommendedPower',
  FAMILIES: 'FAMILIES', MONSTER_FAMS: 'MONSTER_FAMS', SOLO_STEPS: 'SOLO_STEPS', EVO_CHOICES: 'EVO_CHOICES',
  nextFormOf: 'nextFormOf', RUN_MODS: 'RUN_MODS', runModById: 'runModById', runModLootMult: 'runModLootMult',
  enterAt: 'enterAt', go: 'go', renderCombat: 'renderCombat',
  newInst: 'newInst', addGem: 'addGem', spendGems: 'spendGems',
  addXpI: 'addXpI',
  addCardIid: 'addCardIid',
  _setAuto: '(v) => { autoMode = v; }',
  _state: '() => state',
  beginRound: 'beginRound', peekRound: 'peekRound', stepRound: 'stepRound', drinkPotion: 'drinkPotion',
  potionCount: 'potionCount', totalPotions: 'totalPotions', buyPotion: 'buyPotion', autelDeSoin: 'autelDeSoin', healRunComplet: 'healRunComplet', applyRunStateTo: 'applyRunStateTo', persistRunStateFrom: 'persistRunStateFrom', curHpManaOf: 'curHpManaOf', POTIONS: 'POTIONS',
  _actEl: '() => actBox',
  _prompt: '() => promptState',
  _busy: '() => busy',
  _speed: '(v) => { speedIdx = Math.max(0, Math.min(SPEEDS.length - 1, Number(v) || 0)); }',
  _lastTactMult: '() => lastTactMult',
  _zoneWidthOf: '(name) => zoneWidthOf({ name })',
  _previewZone: '(uid) => { const el = elOf(uid); if (el) previewZone(el); }',
  _clearZone: '() => clearZonePreview()',
  _draw: '() => drawBoard()',
  _openUnit: '(uid) => { const u = findUnit(uid); if (u) openUnitModal(u); }',
  _tacPause: '(v) => { tacPaused = !!v; syncFightBtn(); }',
  _tacPaused: '() => tacPaused',
  _rail: '() => (combatApp ? combatApp.querySelector("#rail") : null)',
};

export function bootDist(file, extraPairs = {}) {
  const html = readFileSync(file, 'utf8');
  const i = html.indexOf('<script>');
  const j = html.indexOf('</script>');
  const bundle = html.slice(i + 8, j);
  const staticHtml = html.slice(0, i);

  const mem = new Map();
  const storage = {
    getItem: (k) => (mem.has(String(k)) ? mem.get(String(k)) : null),
    setItem: (k, v) => { mem.set(String(k), String(v)); },
    removeItem: (k) => { mem.delete(String(k)); },
    clear: () => { mem.clear(); },
    key: (idx) => [...mem.keys()][idx] ?? null,
    get length() { return mem.size; },
  };
  const els = new Map();
  currentReg = els;
  const bodyEl = makeEl('body');
  const headEl = makeEl('head');
  const doc = {
    body: bodyEl,
    head: headEl,
    documentElement: makeEl('html'),
    title: '',
    hidden: false,
    createElement: (t) => makeEl(t),
    createTextNode: (t) => ({ nodeType: 3, textContent: String(t), parentNode: null }),
    getElementById: (id) => els.get(String(id)) ?? null,
    querySelector: (sel) => bodyEl.querySelector(sel),
    querySelectorAll: (sel) => bodyEl.querySelectorAll(sel),
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
  };
  const bodyStart = staticHtml.lastIndexOf('<body');
  bodyEl.innerHTML = bodyStart >= 0 ? staticHtml.slice(bodyStart) : staticHtml;

  const errors = [];
  process.on('unhandledRejection', (e) => errors.push(e));
  const sandbox = {
    console,
    document: doc,
    localStorage: storage,
    sessionStorage: storage,
    location: { hash: '#accueil', href: 'file://' },
    navigator: { userAgent: 'smoke', language: 'fr' },
    history: { pushState() {}, replaceState() {} },
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    requestAnimationFrame: (fn) => setTimeout(fn, 16),
    cancelAnimationFrame: (t) => clearTimeout(t),
    performance: { now: () => Date.now() },
    fetch: () => Promise.reject(new Error('réseau indisponible au harnas')),
    Image: class {
      constructor() { this.onload = null; this.onerror = null; }
      set src(v) { this._src = v; queueMicrotask(() => this.onerror && this.onerror(new Error('stub'))); }
      get src() { return this._src; }
    },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    addEventListener() {}, removeEventListener() {},
    alert() {}, confirm: () => true, prompt: () => null,
    URL: { createObjectURL: () => 'blob:stub', revokeObjectURL() {} },
    onerror: null,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);
  const pairs = { ...API_PAIRS, ...extraPairs };
  const exportsCode = 'globalThis.__api = {\n' +
    Object.entries(pairs).map(([k, v]) => `  ${k}: ${v},`).join('\n') + '\n};\n';
  vm.runInContext(bundle + '\n;\n' + exportsCode, ctx, { filename: 'dist-bundle.js' });
  return { ctx, api: ctx.__api, doc, mem, els, errors, bodyEl };
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
