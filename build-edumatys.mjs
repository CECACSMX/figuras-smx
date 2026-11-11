// Versión edumatys.io de la galería: toma la galería CECAC ya construida (node build-galeria.mjs)
// y escribe en D:/Galeria-Edumatys una copia sin CECAC, sin códigos MP/RA y con la marca edumatys.
//   node build-edumatys.mjs           → copia y rebrandea figuras y portada
//   node build-edumatys.mjs --shots   → además, rehace las miniaturas
// © 2026 Angel Ortiz · licencia MIT · desarrollado con ayuda de IA (Claude)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = "D:/Galeria-Edumatys";
const MARCA = "C:/Users/Ido/Desktop/Archivos hasta 09sep/matys-web/marca";
const DRIVE = "C:/Users/Ido/.claude/skills/anatomy/scripts/drive.mjs";
const uri = (f) => "data:image/svg+xml;base64," + readFileSync(join(MARCA, f)).toString("base64");
const LOGO = uri("edumatys-logo-oscuro.svg");
const FAVICON = `<link rel="icon" type="image/svg+xml" href="${uri("edumatys-favicon.svg")}">`;
const FONDO = "#0B1020";

// Cambios de texto comunes a figuras y portada (frases exactas, nunca sueltas, para no tocar base64)
const TEXTOS = [
  ["Sistemas Microinformáticos y Redes · MP0221 Montaje y mantenimiento de equipos", "Montaje y mantenimiento de equipos"],
  ["MP01 Montaje y mantenimiento", "Montaje y mantenimiento"],
  ["© 2026 Angel Ortiz · CECAC SMX · uso educativo", "© 2026 Angel Ortiz · edumatys.io · uso educativo"],
  ["© 2026 Angel Ortiz · CECAC · licencia", "© 2026 Angel Ortiz · edumatys.io · licencia"],
  [" · logo de CECAC excluido de la licencia", ""],
  ["CECAC · MP0221 · RA3", "edumatys.io"],
  ["BANCO DE PRUEBAS · SMX · CECAC", "BANCO DE PRUEBAS · EDUMATYS"],
  ["BANCO DE PRUEBAS · SMX", "BANCO DE PRUEBAS · EDUMATYS"],
  [">SMX</text>", ">EDUMATYS</text>"],
  [">SMX-", ">EDU-"],
  [">SMX ", ">EDU "],
];
const ESTILO = `<style>.cecac{background:${FONDO}!important;padding-left:20px!important}.cecac img{height:44px!important}</style>`;

function marca(html) {
  for (const [a, b] of TEXTOS) html = html.split(a).join(b);
  html = html.replace(/<img src="data:image\/jpeg;base64,[A-Za-z0-9+/=]+" alt="CECAC">/g, `<img src="${LOGO}" alt="edumatys.io">`);
  html = html.replace(/<title>/, `${FAVICON}${ESTILO}<title>`);
  return html;
}

// Figuras
const figs = readdirSync(join(HERE, "figuras"));
for (const slug of figs) {
  mkdirSync(join(OUT, "figuras", slug), { recursive: true });
  for (const f of ["index.html", "oscuro.html"])
    writeFileSync(join(OUT, "figuras", slug, f), marca(readFileSync(join(HERE, "figuras", slug, f), "utf8")));
}

// Portada
let index = marca(readFileSync(join(HERE, "index.html"), "utf8"));
const PORTADA = [
  ["<title>Figuras SMX · CECAC</title>", "<title>Figuras interactivas · edumatys.io</title>"],
  ["para Sistemas Microinformáticos y Redes (CECAC), de uso educativo.", "de montaje y mantenimiento de equipos, de uso educativo."],
  ["--brand:#24375F;--accent:#24375F", `--brand:${FONDO};--accent:#6C63FF`],
  ["--accent:#9fb4e6", "--accent:#8F88FF"],
  [`<img src="cecac_logo.jpg" alt="CECAC"><div><b>Sistemas Microinformáticos y Redes</b>`, `<img src="${LOGO}" alt="edumatys.io"><div><b>Montaje y mantenimiento de equipos</b>`],
  ["<h1>Figuras SMX</h1>", "<h1>Figuras interactivas</h1>"],
  ["MP0221 · Montaje y mantenimiento de equipos", "Montaje y mantenimiento de equipos"],
  [" · el logo de CECAC es del centro y queda excluido de la licencia.", "."],
];
for (const [a, b] of PORTADA) { if (!index.includes(a)) throw new Error("portada: no encuentro " + a.slice(0, 60)); index = index.split(a).join(b); }
writeFileSync(join(OUT, "index.html"), index);

// Licencias y miniaturas
for (const f of ["LICENSE", "LICENSE-anatomy-kit"]) copyFileSync(join(HERE, f), join(OUT, f));
mkdirSync(join(OUT, "miniaturas"), { recursive: true });
for (const f of readdirSync(join(HERE, "miniaturas"))) copyFileSync(join(HERE, "miniaturas", f), join(OUT, "miniaturas", f));
if (process.argv.includes("--shots")) {
  const src = readFileSync(join(HERE, "build-galeria.mjs"), "utf8");
  for (const slug of figs) {
    const m = src.match(new RegExp(`slug: "${slug}"[\\s\\S]*?foto: (\\[[\\s\\S]*?\\]\\]) \\}`));
    const foto = m ? JSON.parse(m[1]) : [["wait", 3000]];
    const url = "file:///" + join(OUT, "figuras", slug, "index.html").replace(/\\/g, "/") + "#quieto";
    execFileSync(process.execPath, [DRIVE, url, JSON.stringify([...foto, ["shot", join(OUT, "miniaturas", `${slug}.png`).replace(/\\/g, "/"), ".iso-plate", 0.5]])], { stdio: "inherit" });
  }
}

// Comprobación: no debe quedar nada del centro ni del currículo a la vista
const restos = [];
for (const slug of figs) for (const f of ["index.html", "oscuro.html"]) {
  const t = readFileSync(join(OUT, "figuras", slug, f), "utf8").replace(/base64,[A-Za-z0-9+/=]+/g, "").replace(/\.cecac|class="cecac"/g, "");
  for (const p of ["CECAC", "MP0221", "MP01", "RA3", "SMX", "Sistemas Microinform"]) if (t.includes(p)) restos.push(`${slug}/${f}: ${p}`);
}
console.log("edumatys:", figs.length, "figuras →", OUT, restos.length ? "\nRESTOS:\n" + restos.join("\n") : "· limpio");
