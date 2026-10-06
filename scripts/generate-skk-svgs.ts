import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const SKK_DIR = resolve(process.cwd(), "public/images/skk");
mkdirSync(SKK_DIR, { recursive: true });

const COLORS: Record<string, { bg: string; stop1: string; stop2: string; stroke?: string }> = {
  kuning: { bg: "#eab308", stop1: "#fde047", stop2: "#ca8a04" },
  merah: { bg: "#dc2626", stop1: "#ef4444", stop2: "#991b1b" },
  putih: { bg: "#f8fafc", stop1: "#ffffff", stop2: "#cbd5e1", stroke: "#94a3b8" },
  hijau: { bg: "#16a34a", stop1: "#22c55e", stop2: "#15803d" },
  biru: { bg: "#2563eb", stop1: "#3b82f6", stop2: "#1d4ed8" },
};

// 1. Generate 15 frame variations (Purwa circle, Madya square, Utama pentagon for 5 colors)
for (const [colName, col] of Object.entries(COLORS)) {
  // Purwa (Circle)
  const purwaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-${colName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.stop1}" />
      <stop offset="100%" stop-color="${col.stop2}" />
    </linearGradient>
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="92" fill="url(#bg-${colName})" stroke="url(#goldFrame)" stroke-width="12" />
  <circle cx="100" cy="100" r="84" fill="none" stroke="#fef08a" stroke-width="2" stroke-opacity="0.6" />
  ${col.stroke ? `<circle cx="100" cy="100" r="82" fill="none" stroke="${col.stroke}" stroke-width="1" />` : ""}
</svg>`;
  writeFileSync(resolve(SKK_DIR, `purwa-${colName}.svg`), purwaSvg);

  // Madya (Square)
  const madyaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-${colName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.stop1}" />
      <stop offset="100%" stop-color="${col.stop2}" />
    </linearGradient>
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <rect x="14" y="14" width="172" height="172" rx="20" fill="url(#bg-${colName})" stroke="url(#goldFrame)" stroke-width="12" />
  <rect x="22" y="22" width="156" height="156" rx="14" fill="none" stroke="#fef08a" stroke-width="2" stroke-opacity="0.6" />
  ${col.stroke ? `<rect x="24" y="24" width="152" height="152" rx="12" fill="none" stroke="${col.stroke}" stroke-width="1" />` : ""}
</svg>`;
  writeFileSync(resolve(SKK_DIR, `madya-${colName}.svg`), madyaSvg);

  // Utama (Pentagon)
  const utamaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-${colName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.stop1}" />
      <stop offset="100%" stop-color="${col.stop2}" />
    </linearGradient>
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <polygon points="100,12 188,76 154,180 46,180 12,76" fill="url(#bg-${colName})" stroke="url(#goldFrame)" stroke-width="12" stroke-linejoin="round" />
  <polygon points="100,22 178,79 148,172 52,172 22,79" fill="none" stroke="#fef08a" stroke-width="2" stroke-opacity="0.6" stroke-linejoin="round" />
  ${col.stroke ? `<polygon points="100,25 175,81 146,169 54,169 25,81" fill="none" stroke="${col.stroke}" stroke-width="1" stroke-linejoin="round" />` : ""}
</svg>`;
  writeFileSync(resolve(SKK_DIR, `utama-${colName}.svg`), utamaSvg);
}

// 2. Icon SVGs for the 10 TKK wajib + penabung
const ICONS: Record<string, string> = {
  "berkemah": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Tent -->
  <polygon points="50,15 88,72 12,72" fill="#fed7aa" stroke="#7c2d12" stroke-width="3" />
  <polygon points="50,15 50,72 12,72" fill="#ea580c" stroke="#7c2d12" stroke-width="2.5" />
  <line x1="50" y1="15" x2="50" y2="72" stroke="#431407" stroke-width="2.5" />
  <!-- Tent Door flap open -->
  <polygon points="50,42 66,72 50,72" fill="#7c2d12" stroke="#431407" stroke-width="1.5" />
  <!-- Ground pegs and rope -->
  <line x1="12" y1="72" x2="4" y2="78" stroke="#7c2d12" stroke-width="2" />
  <line x1="88" y1="72" x2="96" y2="78" stroke="#7c2d12" stroke-width="2" />
  <!-- Campfire -->
  <path d="M50,78 Q53,73 56,76 Q59,81 53,85 Q50,87 47,85 Q41,81 44,76 Q47,73 50,78 Z" fill="#facc15" stroke="#dc2626" stroke-width="1.5" />
  <line x1="42" y1="87" x2="58" y2="83" stroke="#78350f" stroke-width="2" />
  <line x1="42" y1="83" x2="58" y2="87" stroke="#78350f" stroke-width="2" />
</svg>`,

  "juru-masak": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Chef Hat -->
  <path d="M30,46 C20,44 18,30 28,24 C28,14 42,10 50,16 C58,10 72,14 72,24 C82,30 80,44 70,46 Z" fill="#ffffff" stroke="#14532d" stroke-width="2.5" />
  <rect x="28" y="46" width="44" height="12" rx="2" fill="#ffffff" stroke="#14532d" stroke-width="2.5" />
  <line x1="36" y1="46" x2="36" y2="58" stroke="#86efac" stroke-width="1.5" />
  <line x1="50" y1="46" x2="50" y2="58" stroke="#86efac" stroke-width="1.5" />
  <line x1="64" y1="46" x2="64" y2="58" stroke="#86efac" stroke-width="1.5" />
  <!-- Frying Pan & Spoon -->
  <ellipse cx="48" cy="74" rx="26" ry="12" fill="#dcfce7" stroke="#14532d" stroke-width="2.5" />
  <line x1="74" y1="74" x2="90" y2="82" stroke="#14532d" stroke-width="4" stroke-linecap="round" />
  <!-- Steam curls -->
  <path d="M42,66 Q40,62 44,58" stroke="#16a34a" stroke-width="1.5" fill="none" />
  <path d="M52,66 Q54,62 50,58" stroke="#16a34a" stroke-width="1.5" fill="none" />
</svg>`,

  "pengamat": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Binoculars -->
  <!-- Left Barrel -->
  <rect x="18" y="32" width="22" height="36" rx="4" fill="#dcfce7" stroke="#14532d" stroke-width="2.5" />
  <ellipse cx="29" cy="68" rx="11" ry="6" fill="#86efac" stroke="#14532d" stroke-width="2.5" />
  <ellipse cx="29" cy="32" rx="7" ry="4" fill="#14532d" />
  <!-- Right Barrel -->
  <rect x="60" y="32" width="22" height="36" rx="4" fill="#dcfce7" stroke="#14532d" stroke-width="2.5" />
  <ellipse cx="71" cy="68" rx="11" ry="6" fill="#86efac" stroke="#14532d" stroke-width="2.5" />
  <ellipse cx="71" cy="32" rx="7" ry="4" fill="#14532d" />
  <!-- Bridge & Focus Knob -->
  <rect x="40" y="44" width="20" height="8" rx="2" fill="#14532d" />
  <rect x="46" y="36" width="8" height="12" rx="2" fill="#166534" stroke="#14532d" stroke-width="1.5" />
  <!-- Compass star mark -->
  <path d="M50,16 L53,24 L61,24 L55,29 L57,37 L50,32 L43,37 L45,29 L39,24 L47,24 Z" fill="#eab308" stroke="#ca8a04" stroke-width="1" />
</svg>`,

  "p3k": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- First Aid Kit Bag -->
  <rect x="16" y="30" width="68" height="52" rx="8" fill="#eff6ff" stroke="#1e3a8a" stroke-width="3" />
  <!-- Bag Handle -->
  <path d="M36,30 L36,20 C36,16 64,16 64,20 L64,30" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" />
  <!-- Clasp clips -->
  <rect x="26" y="28" width="6" height="5" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1" />
  <rect x="68" y="28" width="6" height="5" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1" />
  <!-- Red Cross Emblem -->
  <circle cx="50" cy="56" r="20" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.5" />
  <path d="M46,42 H54 V52 H64 V60 H54 V70 H46 V60 H36 V52 H46 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1" />
</svg>`,

  "pengatur-ruangan": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Window with Curtains -->
  <rect x="28" y="14" width="44" height="34" rx="2" fill="#fee2e2" stroke="#7f1d1d" stroke-width="2" />
  <line x1="50" y1="14" x2="50" y2="48" stroke="#7f1d1d" stroke-width="1.5" />
  <line x1="28" y1="31" x2="72" y2="31" stroke="#7f1d1d" stroke-width="1.5" />
  <!-- Curtains drape -->
  <path d="M28,14 Q38,30 32,48" stroke="#b91c1c" stroke-width="2.5" fill="none" />
  <path d="M72,14 Q62,30 68,48" stroke="#b91c1c" stroke-width="2.5" fill="none" />
  <!-- Desk Table -->
  <rect x="18" y="58" width="64" height="8" rx="2" fill="#fca5a5" stroke="#7f1d1d" stroke-width="2" />
  <!-- Desk Legs -->
  <line x1="24" y1="66" x2="24" y2="86" stroke="#7f1d1d" stroke-width="2.5" />
  <line x1="76" y1="66" x2="76" y2="86" stroke="#7f1d1d" stroke-width="2.5" />
  <!-- Flower Vase on table -->
  <path d="M46,58 L45,50 Q50,48 55,50 L54,58 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5" />
  <!-- Flower sprout -->
  <circle cx="50" cy="44" r="3.5" fill="#facc15" stroke="#7f1d1d" stroke-width="1" />
</svg>`,

  "menjahit": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Sewing Machine -->
  <!-- Base -->
  <rect x="14" y="70" width="72" height="10" rx="2" fill="#dcfce7" stroke="#14532d" stroke-width="2.5" />
  <!-- Arm & Head -->
  <path d="M22,70 L22,34 C22,26 36,24 58,24 L74,24 C80,24 82,30 82,36 L82,48 C82,54 78,54 74,54 L62,54" fill="#dcfce7" stroke="#14532d" stroke-width="2.5" />
  <!-- Needle bar & presser foot -->
  <line x1="36" y1="42" x2="36" y2="66" stroke="#14532d" stroke-width="2" />
  <path d="M32,66 L40,66" stroke="#14532d" stroke-width="2.5" />
  <!-- Handwheel -->
  <ellipse cx="78" cy="40" rx="4" ry="12" fill="#86efac" stroke="#14532d" stroke-width="2" />
  <!-- Thread spool -->
  <rect x="52" y="16" width="8" height="8" fill="#fde047" stroke="#14532d" stroke-width="1.5" />
  <!-- Thread line -->
  <path d="M56,16 Q48,22 36,44" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2 2" fill="none" />
</svg>`,

  "juru-kebun": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Flower Pot -->
  <polygon points="32,56 68,56 62,84 38,84" fill="#fed7aa" stroke="#7c2d12" stroke-width="2.5" />
  <rect x="28" y="52" width="44" height="6" rx="2" fill="#fdba74" stroke="#7c2d12" stroke-width="2" />
  <!-- Sprout Stem -->
  <path d="M50,52 C50,38 50,30 50,22" stroke="#15803d" stroke-width="3" fill="none" stroke-linecap="round" />
  <!-- Left Leaf -->
  <path d="M50,38 C36,36 32,24 46,26 C49,30 49,36 50,38 Z" fill="#4ade80" stroke="#14532d" stroke-width="2" />
  <!-- Right Leaf -->
  <path d="M50,30 C64,28 68,16 54,18 C51,22 51,28 50,30 Z" fill="#4ade80" stroke="#14532d" stroke-width="2" />
  <!-- Flower Blossom on top -->
  <circle cx="50" cy="20" r="5" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
</svg>`,

  "pengatur-lalu-lintas": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Traffic Light Housing -->
  <rect x="34" y="14" width="32" height="66" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
  <!-- Red Light -->
  <circle cx="50" cy="28" r="7" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" />
  <!-- Yellow Light -->
  <circle cx="50" cy="47" r="7" fill="#eab308" stroke="#a16207" stroke-width="1.5" />
  <!-- Green Light -->
  <circle cx="50" cy="66" r="7" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
  <!-- Light visors (shades) -->
  <path d="M34,24 Q50,20 66,24" stroke="#64748b" stroke-width="2" fill="none" />
  <path d="M34,43 Q50,39 66,43" stroke="#64748b" stroke-width="2" fill="none" />
  <path d="M34,62 Q50,58 66,62" stroke="#64748b" stroke-width="2" fill="none" />
  <!-- Whistle icon at side -->
  <g transform="translate(14, 46)">
    <circle cx="8" cy="8" r="6" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.5" />
    <rect x="8" y="4" width="10" height="5" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.5" />
  </g>
</svg>`,

  "pengaman-kampung": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Security Shield Backdrop -->
  <path d="M50,14 C68,14 82,20 82,38 C82,62 50,86 50,86 C50,86 18,62 18,38 C18,20 32,14 50,14 Z" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.5" />
  <!-- Slit Drum (Kentongan) inside -->
  <rect x="42" y="26" width="16" height="38" rx="5" fill="#fde68a" stroke="#78350f" stroke-width="2" />
  <!-- Kentongan Slit opening -->
  <rect x="48" y="34" width="4" height="22" rx="2" fill="#78350f" />
  <!-- Hanging Loop -->
  <path d="M47,26 C47,20 53,20 53,26" stroke="#78350f" stroke-width="2" fill="none" />
  <!-- Striker stick (Pemukul) -->
  <line x1="62" y1="46" x2="74" y2="62" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <circle cx="73" cy="61" r="3.5" fill="#92400e" stroke="#78350f" stroke-width="1" />
</svg>`,

  "gerak-jalan": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Marching / Hiking Boots silhouette & footsteps -->
  <!-- Lead Boot -->
  <path d="M30,38 L42,38 L42,54 L58,54 C64,54 68,58 68,64 L68,68 L24,68 L24,44 C24,40 26,38 30,38 Z" fill="#e2e8f0" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" />
  <!-- Sole tread -->
  <line x1="22" y1="68" x2="70" y2="68" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
  <line x1="28" y1="68" x2="28" y2="72" stroke="#0f172a" stroke-width="2" />
  <line x1="38" y1="68" x2="38" y2="72" stroke="#0f172a" stroke-width="2" />
  <line x1="52" y1="68" x2="52" y2="72" stroke="#0f172a" stroke-width="2" />
  <line x1="64" y1="68" x2="64" y2="72" stroke="#0f172a" stroke-width="2" />
  <!-- Boot Laces -->
  <line x1="32" y1="44" x2="40" y2="44" stroke="#dc2626" stroke-width="2" />
  <line x1="32" y1="48" x2="40" y2="48" stroke="#dc2626" stroke-width="2" />
  <line x1="32" y1="52" x2="40" y2="52" stroke="#dc2626" stroke-width="2" />
  <!-- Motion Trail lines behind -->
  <path d="M14,48 L20,48" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
  <path d="M10,56 L18,56" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
  <path d="M12,64 L18,64" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
</svg>`,

  "penabung": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <!-- Piggy Bank -->
  <ellipse cx="48" cy="54" rx="28" ry="20" fill="#fef08a" stroke="#854d0e" stroke-width="2.5" />
  <!-- Snout -->
  <ellipse cx="20" cy="54" rx="5" ry="8" fill="#fde047" stroke="#854d0e" stroke-width="2" />
  <circle cx="19" cy="52" r="1" fill="#713f12" />
  <circle cx="19" cy="56" r="1" fill="#713f12" />
  <!-- Eye -->
  <circle cx="32" cy="46" r="2.5" fill="#713f12" />
  <!-- Ear -->
  <polygon points="36,36 44,28 44,38" fill="#fde047" stroke="#854d0e" stroke-width="2" />
  <!-- Tail curl -->
  <path d="M76,50 Q84,46 80,40" stroke="#854d0e" stroke-width="2" fill="none" stroke-linecap="round" />
  <!-- Legs -->
  <rect x="32" y="70" width="8" height="8" rx="2" fill="#fde047" stroke="#854d0e" stroke-width="2" />
  <rect x="56" y="70" width="8" height="8" rx="2" fill="#fde047" stroke="#854d0e" stroke-width="2" />
  <!-- Coin Drop Slot -->
  <rect x="42" y="34" width="14" height="3" rx="1.5" fill="#713f12" />
  <!-- Gold Coin falling -->
  <circle cx="49" cy="22" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
  <text x="49" y="25" font-size="8" font-weight="bold" fill="#78350f" text-anchor="middle" font-family="sans-serif">Rp</text>
</svg>`
};

for (const [name, svgContent] of Object.entries(ICONS)) {
  writeFileSync(resolve(SKK_DIR, `${name}.svg`), svgContent);
}

console.log("Successfully generated all SKK frames and icons in public/images/skk!");
