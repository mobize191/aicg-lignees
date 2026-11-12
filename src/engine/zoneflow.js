// src/engine/zoneflow.js — garde « équipe formée » + cycle de vie des combats de zone/donjon (correctifs v1.37 lot 1)
// Pur et testable headless : aucune valeur de design en dur (EXI-MOD-1).

// au moins 1 carte en équipe active
function equipeFormee(team) {
  return !!(team && Array.isArray(team.slots) && team.slots.filter(Boolean).length > 0);
}

// garde d'entrée (Terres Sauvages, donjons, startZoneFight) : { ok, reason? }
function gardeEquipe(storeLike) {
  if (equipeFormee(storeLike?.team)) return { ok: true };
  return { ok: false, reason: 'equipe' };
}

// genre du run en cours : 'zone' | 'donjon' | 'defi' | null
function genreRun(runState) {
  return runState && runState.active ? (runState.kind ?? null) : null;
}

// un combat de zone (errance) est-il en cours ? (ne sert plus de drapeau global zombie)
function combatZoneEnCours(storeLike) {
  return genreRun(storeLike?.runState) === 'zone' && !!storeLike?.zoneFight;
}

// démarre un run propre : aucun état résiduel de combat de zone
function initRun(storeLike, kind) {
  if (storeLike.zoneFight) storeLike.zoneFight = null;
  storeLike.runState = { active: true, kind };
  return storeLike.runState;
}

// sortie du combat par navigation (sans victoire) : nettoyage systématique, plus d'état zombie
function quitterCombat(storeLike) {
  if (storeLike.zoneFight) storeLike.zoneFight = null;
  if (storeLike.runState) { storeLike.runState.active = false; storeLike.runState.kind = null; }
}
