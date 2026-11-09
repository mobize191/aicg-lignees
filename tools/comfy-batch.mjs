// comfy-batch.mjs — pousse un batch de prompts sur l'API ComfyUI et vérifie chaque rendu.
// Usage : node comfy-batch.mjs <batch.json> [--out dossier]
// batch.json : [{ id, file, positive, negative, seed?, w?, h? }]
// Prérequis : ComfyUI lancé avec --listen (http://127.0.0.1:8188), checkpoint
// DreamShaper XL dans ComfyUI/models/checkpoints (nom exact via COMFY_MODEL).
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';

const SERVER = process.env.COMFY_URL || 'http://127.0.0.1:8188';
const MODEL = process.env.COMFY_MODEL || 'dreamshaperXL.safetensors';
const batchFile = process.argv[2];
if (!batchFile) { console.error('usage: node comfy-batch.mjs <batch.json>'); process.exit(1); }
const outDir = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'out';
mkdirSync(outDir, { recursive: true });

const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const registry = existsSync('seeds.csv') ? readFileSync('seeds.csv', 'utf8').split('\n') : ['file,seed,prompt'];

// workflow SDXL txt2img au format API ComfyUI (DreamShaper XL : dpmpp_2m_sde + karras)
function workflow(positive, negative, seed, w, h, prefix) {
  return {
    '3': { class_type: 'KSampler', inputs: { seed, steps: 28, cfg: 6, sampler_name: 'dpmpp_2m_sde', scheduler: 'karras', denoise: 1, model: ['4', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['5', 0] } },
    '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: MODEL } },
    '5': { class_type: 'EmptyLatentImage', inputs: { width: w, height: h, batch_size: 1 } },
    '6': { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['4', 1] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['4', 1] } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    '9': { class_type: 'SaveImage', inputs: { images: ['8', 0], filename_prefix: prefix } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function queueOne(item) {
  const seed = item.seed ?? Math.floor(Math.random() * 2 ** 31);
  const w = item.w ?? 832, h = item.h ?? 1216;
  const prefix = item.file.replace(/\.jpe?g$/, '');
  const res = await fetch(SERVER + '/api/prompt', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow(item.positive, item.negative, seed, w, h, prefix), client_id: 'fondations-cards' }),
  });
  if (!res.ok) throw new Error('queue ' + res.status + ' : ' + (await res.text()).slice(0, 300));
  const { prompt_id } = await res.json();
  // attend la fin du rendu
  for (let i = 0; i < 600; i++) {
    await sleep(2000);
    const h2 = await fetch(SERVER + '/api/history/' + prompt_id);
    const hist = await h2.json();
    const entry = hist[prompt_id];
    if (!entry) continue;
    const outs = entry.outputs || {};
    const images = Object.values(outs).flatMap((o) => o.images || []);
    if (images.length > 0) {
      const img = images[0];
      const url = SERVER + '/api/view?filename=' + encodeURIComponent(img.filename) + '&subfolder=' + encodeURIComponent(img.subfolder || '') + '&type=' + encodeURIComponent(img.type || 'output');
      const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
      writeFileSync(outDir + '/' + item.file, bin);
      registry.push(item.file + ',' + seed + ',"' + item.positive.replace(/"/g, "'") + '"');
      console.log('OK', item.file, 'seed', seed, Math.round(bin.length / 1024) + ' Ko');
      return;
    }
    if (entry.status && entry.status.status_str === 'error') throw new Error('rendu en erreur pour ' + item.file);
  }
  throw new Error('timeout rendu ' + item.file);
}

let fails = 0;
for (const item of batch) {
  try { await queueOne(item); }
  catch (e) { fails++; console.error('ÉCHEC', item.file, e.message); }
  writeFileSync('seeds.csv', registry.join('\n') + '\n');
}
console.log(fails === 0 ? 'BATCH COMPLET : ' + batch.length + ' images dans ' + outDir
  : fails + ' ÉCHEC(S) / ' + batch.length + ' — relancer ce fichier de batch après correction');
process.exit(fails === 0 ? 0 : 1);
