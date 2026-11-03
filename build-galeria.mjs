// Galería de figuras Anatomy (SMX · CECAC). Copia cada figura, le añade la autoría y la vuelta a la galería,
// hace su miniatura y escribe la portada.
//   node build-galeria.mjs           → copia figuras y escribe index.html
//   node build-galeria.mjs --shots   → además, rehace las miniaturas (Chrome sin ventana)
// Para añadir una figura: una entrada más en FIGURAS y volver a ejecutar.
// © 2026 Angel Ortiz · licencia MIT · desarrollado con ayuda de IA (Claude)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DRIVE = "C:/Users/Ido/.claude/skills/anatomy/scripts/drive.mjs";

// modulo · título · qué enseña · origen (carpeta, archivo claro, archivo oscuro) · cómo se fotografía la miniatura
const FIGURAS = [
  { slug: "despiece-semitorre", modulo: "MP0221", tema: "Montaje", titulo: "Despiece de una semitorre ATX",
    texto: "Los 13 componentes de un sobremesa y el orden en que se desmontan: cada pieza sale por su eje de montaje.",
    src: "D:/Anatomy-Despiece", claro: "despiece-light.html", oscuro: "despiece.html", foto: [["key", "End"], ["wait", 600]] },
  { slug: "despiece-minipc", modulo: "MP0221", tema: "Montaje", titulo: "Despiece de un mini PC",
    texto: "Un ordenador completo en 115 × 102 × 42 mm, capa a capa: turbina, disipador, placa con CPU soldada, SO-DIMM, M.2 y disco de 2,5″.",
    src: "D:/Anatomy-MiniPC", claro: "minipc-light.html", oscuro: "minipc.html", foto: [["key", "End"], ["wait", 600]] },
  { slug: "arquitectura", modulo: "MP0221", tema: "Arquitectura", titulo: "Arquitectura del ordenador",
    texto: "Von Neumann frente a Harvard: un solo bus para instrucciones y datos o dos buses separados.",
    src: "D:/Anatomy-Arquitectura", claro: "arquitectura-light.html", oscuro: "arquitectura.html", foto: [["wait", 3000]] },
  { slug: "cuello-de-botella", modulo: "MP0221", tema: "Almacenamiento", titulo: "El cuello de botella del almacenamiento",
    texto: "HDD, SSD SATA y NVMe copiando el mismo archivo de 4 GB: dónde se atasca el dato y por qué.",
    src: "D:/Anatomy-CuelloBotella", claro: "cuello-botella-light.html", oscuro: "cuello-botella.html", foto: [["wait", 3000]] },
  { slug: "tipos-de-discos", modulo: "MP0221", tema: "Almacenamiento", titulo: "Tipos de discos: interfaz y velocidad",
    texto: "Carrera de 8 unidades, de PATA a NVMe PCIe 5.0, copiando 4 GB a su velocidad real.",
    src: "D:/Anatomy-Discos", claro: "discos-light.html", oscuro: "discos.html", foto: [["wait", 3000]] },
  { slug: "memoria-ram", modulo: "MP0221", tema: "Memoria", titulo: "Memoria RAM: celda 1T1C y generaciones",
    texto: "Cómo guarda un bit la DRAM, la prebúsqueda y el reloj DDR, y seis generaciones de módulo.",
    src: "D:/Anatomy-RAM", claro: "memoria-ram-light.html", oscuro: "memoria-ram.html", foto: [["wait", 3000]] },
];
const MODULOS = { MP0221: "MP0221 · Montaje y mantenimiento de equipos" };

const CREDITO = `<!-- © 2026 Angel Ortiz · CECAC · licencia MIT. Dibujado con el kit Anatomy, MIT © 2026 Ryan. Desarrollado con ayuda de IA (Claude). Uso educativo. -->`;
const PIE = `<p class="g-credit" style="max-width:1000px;margin:14px auto 24px;padding:0 16px;font:11px/1.4 ui-sans-serif,system-ui,'Segoe UI',sans-serif;opacity:.65">© 2026 Angel Ortiz · CECAC SMX · uso educativo · licencia MIT · desarrollado con ayuda de IA (Claude) · dibujado con el kit Anatomy (MIT, © 2026 Ryan) · logo de CECAC excluido de la licencia</p>`;
const VOLVER = (otro, etiqueta) => `<nav class="g-nav" style="max-width:1000px;margin:10px auto 0;padding:0 16px;display:flex;gap:16px;font:13px ui-sans-serif,system-ui,'Segoe UI',sans-serif"><a href="../../" style="color:inherit">← Galería</a><a href="${otro}" style="color:inherit;opacity:.7">${etiqueta}</a></nav>`;

function copia(f, archivo, otro, etiqueta) {
  let html = readFileSync(join(f.src, archivo), "utf8");
  html = html.replace(/MP01 Montaje y mantenimiento/g, "MP0221 Montaje y mantenimiento"); // código oficial del módulo
  html = html.replace(/<p class="dp-credit">[\s\S]*?<\/p>/, ""); // la galería pone su propio pie
  html = html.replace(/<body([^>]*)>/, (m) => `${m}${CREDITO}${VOLVER(otro, etiqueta)}`);
  html = html.replace(/<\/body>/, `${PIE}</body>`);
  return html;
}
for (const f of FIGURAS) {
  const dir = join(HERE, "figuras", f.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), copia(f, f.claro, "oscuro.html", "Tema oscuro"));
  writeFileSync(join(dir, "oscuro.html"), copia(f, f.oscuro, "./", "Tema claro"));
}

mkdirSync(join(HERE, "miniaturas"), { recursive: true });
if (process.argv.includes("--shots")) {
  for (const f of FIGURAS) {
    const url = "file:///" + join(HERE, "figuras", f.slug, "index.html").replace(/\\/g, "/") + "#quieto";
    const out = join(HERE, "miniaturas", `${f.slug}.png`).replace(/\\/g, "/");
    execFileSync(process.execPath, [DRIVE, url, JSON.stringify([...f.foto, ["shot", out, ".iso-plate", 0.5]])], { stdio: "inherit" });
  }
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const LOGO = "cecac_logo.jpg";
const tarjetas = (mod) => FIGURAS.filter((f) => f.modulo === mod).map((f) => `
      <article class="card">
        <a class="thumb" href="figuras/${f.slug}/"><img src="miniaturas/${f.slug}.png" alt="${esc(f.titulo)}" loading="lazy"></a>
        <div class="body">
          <span class="tag">${esc(f.tema)}</span>
          <h3><a href="figuras/${f.slug}/">${esc(f.titulo)}</a></h3>
          <p>${esc(f.texto)}</p>
          <div class="links"><a href="figuras/${f.slug}/">Abrir</a><a href="figuras/${f.slug}/oscuro.html">Tema oscuro</a></div>
        </div>
      </article>`).join("");
const secciones = Object.keys(MODULOS).filter((m) => FIGURAS.some((f) => f.modulo === m))
  .map((m) => `<section><h2>${esc(MODULOS[m])}</h2><div class="grid">${tarjetas(m)}</div></section>`).join("");

const index = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Figuras SMX · CECAC</title>
<meta name="description" content="Figuras interactivas para Sistemas Microinformáticos y Redes (CECAC), de uso educativo.">
${CREDITO}
<style>
:root{--bg:#f6f5f1;--card:#fff;--ink:#1d2230;--muted:#5d6475;--line:#e2e0d8;--brand:#24375F;--accent:#24375F;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#121417;--card:#1b1e23;--ink:#e8eaee;--muted:#9aa1ad;--line:#2b2f36;--accent:#9fb4e6;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.cecac{display:flex;align-items:center;gap:20px;background:var(--brand);color:#fff;padding:0 20px 0 0;min-height:64px;flex-wrap:wrap}
.cecac img{height:64px;width:auto;display:block}
.cecac b{font-weight:600;font-size:15px;display:block}.cecac span{font-size:12.5px;opacity:.85}
main{max-width:1120px;margin:0 auto;padding:28px 16px 40px}
.intro{max-width:70ch;color:var(--muted);margin:0 0 28px}
h1{font-size:26px;margin:0 0 6px;letter-spacing:-.01em}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:30px 0 14px;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.thumb{display:block;aspect-ratio:4/3;background:#fbfaf7;overflow:hidden;border-bottom:1px solid var(--line)}
.thumb img{width:100%;height:100%;object-fit:contain;display:block;transition:transform .3s ease}
.card:hover .thumb img{transform:scale(1.03)}
.body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.tag{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--accent)}
h3{font-size:17px;margin:0;line-height:1.3}h3 a{color:inherit;text-decoration:none}h3 a:hover{text-decoration:underline}
.body p{margin:0;color:var(--muted);font-size:14px;flex:1}
.links{display:flex;gap:14px;margin-top:8px;font-size:13.5px}.links a{color:var(--accent);font-weight:600}
.links a+a{font-weight:400;opacity:.8}
footer{max-width:1120px;margin:0 auto;padding:0 16px 32px;color:var(--muted);font-size:12px}
@media (prefers-reduced-motion:reduce){.thumb img{transition:none}}
</style>
</head>
<body>
<header class="cecac"><img src="${LOGO}" alt="CECAC"><div><b>Sistemas Microinformáticos y Redes</b><span>Figuras interactivas para clase</span></div></header>
<main>
  <h1>Figuras SMX</h1>
  <p class="intro">Máquinas dibujadas pieza a pieza para ver por dentro lo que explicamos en clase. Se usan en el navegador: flechas para avanzar, espacio para verlo todo y el ratón para señalar cada pieza. Cada figura tiene tema claro y oscuro.</p>
  ${secciones}
</main>
<footer>© 2026 Angel Ortiz · CECAC SMX · uso educativo · licencia MIT · desarrollado con ayuda de IA (Claude) · figuras dibujadas con el kit Anatomy (MIT, © 2026 Ryan) · el logo de CECAC es del centro y queda excluido de la licencia.</footer>
</body>
</html>
`;
writeFileSync(join(HERE, "index.html"), index);
const faltan = FIGURAS.filter((f) => !existsSync(join(HERE, "miniaturas", `${f.slug}.png`))).map((f) => f.slug);
console.log("galería:", FIGURAS.length, "figuras", faltan.length ? `· faltan miniaturas: ${faltan.join(", ")} (usa --shots)` : "");
