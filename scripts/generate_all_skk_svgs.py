#!/usr/bin/env python3
"""
Generate minimal vector SVG icons for all Pramuka SKK/TKK Penegak.
Based on SK Kwarnas No. 134 Tahun 1976 official guidelines.
"""
import os
import xml.etree.ElementTree as ET

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "skk")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SVGS = {}

# ==========================================
# 1. KUNING (Agama, Mental, Moral, Spiritual)
# ==========================================

SVGS["sholat"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M42,22 C42,15 50,10 50,10 C50,10 58,15 58,22 Z" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
  <circle cx="50" cy="8" r="2" fill="#b45309" />
  <rect x="25" y="24" width="50" height="62" rx="3" fill="#fef9c3" stroke="#854d0e" stroke-width="2.5" />
  <rect x="30" y="29" width="40" height="52" rx="2" fill="none" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3 2" />
  <path d="M34,54 V42 C34,34 50,28 50,28 C50,28 66,34 66,42 V54" fill="#fde047" stroke="#b45309" stroke-width="2" />
  <polygon points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43" fill="#ca8a04" />
  <path d="M25,86 L25,92 M33,86 L33,92 M41,86 L41,92 M50,86 L50,92 M59,86 L59,92 M67,86 L67,92 M75,86 L75,92" stroke="#854d0e" stroke-width="2" />
</svg>"""

SVGS["khotib"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32,84 H76 V44 H46 L38,54 V84" fill="#fed7aa" stroke="#78350f" stroke-width="2.5" />
  <path d="M18,84 H32 V68 H26 V52 H20" fill="none" stroke="#78350f" stroke-width="2" />
  <polygon points="42,44 76,44 70,36 36,36" fill="#f97316" stroke="#78350f" stroke-width="2" />
  <path d="M42,35 Q52,32 62,35" stroke="#78350f" stroke-width="3" />
  <path d="M60,35 Q64,24 62,18" fill="none" stroke="#451a03" stroke-width="2" />
  <circle cx="62" cy="16" r="3.5" fill="#451a03" />
  <path d="M70,14 Q74,17 70,20" stroke="#b45309" stroke-width="2" />
  <path d="M74,11 Q80,17 74,23" stroke="#b45309" stroke-width="2" />
</svg>"""

SVGS["qori"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22,82 L78,54 M78,82 L22,54" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
  <path d="M24,78 Q50,68 76,78" fill="none" stroke="#92400e" stroke-width="2" />
  <path d="M18,48 Q34,42 50,48 Q66,42 82,48 L80,24 Q65,18 50,24 Q35,18 20,24 Z" fill="#fefce8" stroke="#166534" stroke-width="2.5" />
  <line x1="50" y1="24" x2="50" y2="48" stroke="#166534" stroke-width="2" />
  <line x1="26" y1="30" x2="44" y2="30" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="26" y1="36" x2="44" y2="36" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="26" y1="42" x2="44" y2="42" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="56" y1="30" x2="74" y2="30" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="56" y1="36" x2="74" y2="36" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="56" y1="42" x2="74" y2="42" stroke="#ca8a04" stroke-width="1.5" />
  <path d="M50,48 Q54,60 48,68" stroke="#dc2626" stroke-width="2" />
</svg>"""

SVGS["muadzin"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="38" y="32" width="24" height="54" fill="#f1f5f9" stroke="#334155" stroke-width="2.5" />
  <rect x="32" y="86" width="36" height="6" rx="1" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
  <rect x="34" y="30" width="32" height="6" rx="1" fill="#94a3b8" stroke="#334155" stroke-width="2" />
  <path d="M38,30 C38,16 50,10 50,10 C50,10 62,16 62,30 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2.5" />
  <line x1="50" y1="10" x2="50" y2="4" stroke="#b45309" stroke-width="2" />
  <circle cx="50" cy="4" r="2" fill="#b45309" />
  <polygon points="38,42 24,36 24,50 38,46" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" />
  <polygon points="62,42 76,36 76,50 62,46" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" />
  <path d="M19,37 Q14,43 19,49" stroke="#2563eb" stroke-width="2" />
  <path d="M81,37 Q86,43 81,49" stroke="#2563eb" stroke-width="2" />
</svg>"""

# ==========================================
# 2. MERAH (Patriotisme dan Seni Budaya)
# ==========================================

SVGS["pengatur-meja-makan"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="52" r="26" fill="#ffffff" stroke="#991b1b" stroke-width="2.5" />
  <circle cx="50" cy="52" r="18" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5" />
  <line x1="15" y1="36" x2="15" y2="76" stroke="#475569" stroke-width="2.5" />
  <path d="M11,36 V48 C11,52 19,52 19,48 V36" fill="none" stroke="#475569" stroke-width="2" />
  <line x1="15" y1="36" x2="15" y2="48" stroke="#475569" stroke-width="2" />
  <line x1="85" y1="44" x2="85" y2="76" stroke="#475569" stroke-width="2.5" />
  <ellipse cx="85" cy="38" rx="4" ry="7" fill="#f1f5f9" stroke="#475569" stroke-width="2" />
  <polygon points="50,14 42,22 58,22" fill="#fee2e2" stroke="#991b1b" stroke-width="2" />
</svg>"""

SVGS["pemimpin-menyanyi-dirigenconductor"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="22" y1="82" x2="78" y2="18" stroke="#facc15" stroke-width="3" stroke-linecap="round" />
  <circle cx="20" cy="84" r="5" fill="#ca8a04" stroke="#713f12" stroke-width="2" />
  <path d="M14,88 L26,76 L34,84 L22,94 Z" fill="#fed7aa" stroke="#9a3412" stroke-width="2" />
  <path d="M30,35 Q50,15 75,35 T90,55" fill="none" stroke="#fee2e2" stroke-width="2" stroke-dasharray="3 3" />
  <circle cx="68" cy="46" r="4" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5" />
  <line x1="72" y1="46" x2="72" y2="30" stroke="#7f1d1d" stroke-width="2" />
  <path d="M72,30 Q80,28 82,34" stroke="#7f1d1d" stroke-width="2" />
  <circle cx="44" cy="56" r="3.5" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5" />
  <line x1="47.5" y1="56" x2="47.5" y2="42" stroke="#7f1d1d" stroke-width="2" />
</svg>"""

SVGS["penyanyi"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="36" y="18" width="28" height="40" rx="14" fill="#f1f5f9" stroke="#334155" stroke-width="2.5" />
  <line x1="36" y1="38" x2="64" y2="38" stroke="#334155" stroke-width="2" />
  <line x1="50" y1="18" x2="50" y2="58" stroke="#334155" stroke-width="2" />
  <path d="M30,36 V48 C30,60 70,60 70,48 V36" fill="none" stroke="#475569" stroke-width="3" />
  <line x1="50" y1="58" x2="50" y2="82" stroke="#334155" stroke-width="3" />
  <rect x="34" y="82" width="32" height="6" rx="3" fill="#64748b" stroke="#334155" stroke-width="2" />
  <path d="M80,24 Q86,20 84,28 Q80,34 86,40" stroke="#b91c1c" stroke-width="2" />
  <path d="M18,26 Q12,32 16,38" stroke="#b91c1c" stroke-width="2" />
</svg>"""

SVGS["pelukis"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22,50 C18,30 38,18 58,20 C78,22 86,40 78,64 C74,76 60,82 46,78 C36,75 34,62 26,64 C20,66 18,58 22,50 Z" fill="#ffedd5" stroke="#9a3412" stroke-width="2.5" />
  <circle cx="34" cy="62" r="4.5" fill="#ffffff" stroke="#9a3412" stroke-width="2" />
  <circle cx="36" cy="30" r="4" fill="#dc2626" />
  <circle cx="50" cy="26" r="4" fill="#facc15" />
  <circle cx="66" cy="32" r="4" fill="#2563eb" />
  <circle cx="72" cy="48" r="4" fill="#16a34a" />
  <line x1="16" y1="84" x2="68" y2="40" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <polygon points="68,40 76,34 78,42" fill="#475569" stroke="#1e293b" stroke-width="1.5" />
  <path d="M76,34 Q84,30 80,38 Z" fill="#dc2626" />
</svg>"""

SVGS["juru-gambar"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="20" y="24" width="60" height="54" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="2" />
  <polygon points="26,72 68,72 26,30" fill="#fed7aa" stroke="#c2410c" stroke-width="2.5" />
  <polygon points="34,66 54,66 34,46" fill="#f8fafc" stroke="#c2410c" stroke-width="1.5" />
  <line x1="42" y1="20" x2="78" y2="56" stroke="#475569" stroke-width="3" stroke-linecap="round" />
  <polygon points="78,56 84,62 76,64" fill="#facc15" stroke="#713f12" stroke-width="1" />
  <line x1="44" y1="18" x2="48" y2="22" stroke="#dc2626" stroke-width="3" />
</svg>"""

SVGS["mengarang"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="24" width="52" height="60" rx="3" fill="#fefce8" stroke="#78350f" stroke-width="2.5" />
  <line x1="28" y1="36" x2="60" y2="36" stroke="#92400e" stroke-width="2" />
  <line x1="28" y1="44" x2="60" y2="44" stroke="#92400e" stroke-width="2" />
  <line x1="28" y1="52" x2="60" y2="52" stroke="#92400e" stroke-width="2" />
  <line x1="28" y1="60" x2="48" y2="60" stroke="#92400e" stroke-width="2" />
  <path d="M84,16 Q78,38 60,66 L56,72 L62,68 Q74,48 84,16 Z" fill="#ffffff" stroke="#991b1b" stroke-width="2" />
  <line x1="56" y1="72" x2="76" y2="34" stroke="#991b1b" stroke-width="1.5" />
  <rect x="70" y="68" width="16" height="16" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
  <rect x="74" y="64" width="8" height="4" fill="#475569" stroke="#0f172a" stroke-width="1.5" />
</svg>"""

# ==========================================
# 3. PUTIH (Ketangkasan dan Kesehatan)
# ==========================================

SVGS["penyelidik"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="44" cy="46" rx="6" ry="10" transform="rotate(-15 44 46)" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
  <circle cx="41" cy="32" r="2.5" fill="#64748b" />
  <circle cx="47" cy="34" r="2.5" fill="#64748b" />
  <circle cx="48" cy="45" r="24" fill="#e0f2fe" fill-opacity="0.3" stroke="#0369a1" stroke-width="3" />
  <path d="M36,32 A 18 18 0 0 1 60,32" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
  <line x1="66" y1="63" x2="84" y2="81" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
</svg>"""

SVGS["perenang"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="36" cy="34" r="7" fill="#fed7aa" stroke="#0369a1" stroke-width="2" />
  <path d="M42,37 Q60,20 74,24 L68,36" fill="none" stroke="#0369a1" stroke-width="3.5" stroke-linecap="round" />
  <path d="M28,42 Q45,40 58,46" stroke="#0369a1" stroke-width="4" stroke-linecap="round" />
  <path d="M12,56 Q24,50 36,56 T60,56 T84,56" fill="none" stroke="#0284c7" stroke-width="2.5" />
  <path d="M18,68 Q30,62 42,68 T66,68 T90,68" fill="none" stroke="#0369a1" stroke-width="2.5" />
  <path d="M12,80 Q24,74 36,80 T60,80 T84,80" fill="none" stroke="#075985" stroke-width="2.5" />
</svg>"""

SVGS["juru-layar"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="48" y1="18" x2="48" y2="68" stroke="#78350f" stroke-width="3" />
  <path d="M50,22 Q76,46 50,62 Z" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
  <polygon points="46,26 22,62 46,62" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
  <path d="M16,68 L82,68 L72,80 L26,80 Z" fill="#92400e" stroke="#451a03" stroke-width="2.5" />
  <path d="M10,84 Q22,80 34,84 T58,84 T82,84" fill="none" stroke="#0284c7" stroke-width="2.5" />
</svg>"""

SVGS["juru-selam"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="32" width="52" height="34" rx="14" fill="#e0f2fe" stroke="#0369a1" stroke-width="3" />
  <circle cx="36" cy="49" r="10" fill="#bae6fd" stroke="#0284c7" stroke-width="2" />
  <circle cx="60" cy="49" r="10" fill="#bae6fd" stroke="#0284c7" stroke-width="2" />
  <line x1="12" y1="48" x2="22" y2="48" stroke="#0369a1" stroke-width="3" />
  <line x1="74" y1="48" x2="84" y2="48" stroke="#0369a1" stroke-width="3" />
  <path d="M70,54 Q82,56 82,42 V18" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="48" cy="22" r="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
  <circle cx="56" cy="14" r="2" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
</svg>"""

SVGS["pendayung"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="20" x2="82" y2="80" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <polygon points="14,16 26,22 18,30" fill="#f97316" stroke="#78350f" stroke-width="2" />
  <line x1="82" y1="20" x2="18" y2="80" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <polygon points="86,16 82,30 74,22" fill="#f97316" stroke="#78350f" stroke-width="2" />
  <ellipse cx="50" cy="50" rx="9" ry="34" fill="#fed7aa" stroke="#9a3412" stroke-width="2.5" />
  <line x1="44" y1="44" x2="56" y2="44" stroke="#9a3412" stroke-width="2" />
  <line x1="44" y1="56" x2="56" y2="56" stroke="#9a3412" stroke-width="2" />
  <path d="M28,86 Q50,92 72,86" stroke="#0284c7" stroke-width="2" fill="none" />
</svg>"""

SVGS["ski-air"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="60" cy="22" r="6" fill="#fed7aa" stroke="#0369a1" stroke-width="2" />
  <path d="M58,28 L50,46 L40,64" stroke="#0369a1" stroke-width="3.5" stroke-linecap="round" />
  <line x1="52" y1="40" x2="22" y2="34" stroke="#0284c7" stroke-width="2" />
  <line x1="22" y1="30" x2="22" y2="38" stroke="#0f172a" stroke-width="2.5" />
  <line x1="32" y1="72" x2="72" y2="62" stroke="#ea580c" stroke-width="4" stroke-linecap="round" />
  <line x1="38" y1="78" x2="78" y2="68" stroke="#ea580c" stroke-width="4" stroke-linecap="round" />
  <path d="M14,82 Q28,76 42,82 T70,82 T92,82" stroke="#38bdf8" stroke-width="2.5" fill="none" />
</svg>"""

# ==========================================
# 4. BIRU (Sosial, Perikemanusiaan, Lingkungan)
# ==========================================

SVGS["pemadam-kebakaran"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M28,46 C28,26 50,22 50,22 C50,22 72,26 72,46 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2.5" />
  <path d="M22,46 H78 Q82,50 78,54 H22 Q18,50 22,46 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
  <polygon points="50,28 56,34 50,42 44,34" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="22" y1="84" x2="52" y2="58" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <polygon points="18,80 26,88 28,82 22,76" fill="#94a3b8" stroke="#334155" stroke-width="1.5" />
  <line x1="78" y1="84" x2="52" y2="62" stroke="#ca8a04" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="58" cy="74" r="2" fill="#38bdf8" />
  <circle cx="64" cy="70" r="1.5" fill="#38bdf8" />
</svg>"""

SVGS["penunjuk-jalan"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="50" y1="14" x2="50" y2="88" stroke="#334155" stroke-width="4" stroke-linecap="round" />
  <circle cx="50" cy="14" r="4" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
  <path d="M38,26 H66 L74,32 L66,38 H38 Z" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2" />
  <path d="M62,42 H34 L26,48 L34,54 H62 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2" />
  <path d="M40,58 H68 L76,64 L68,70 H40 Z" fill="#bbf7d0" stroke="#15803d" stroke-width="2" />
  <path d="M38,88 H62" stroke="#334155" stroke-width="3" stroke-linecap="round" />
</svg>"""

SVGS["juru-bahasa"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="32" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" />
  <ellipse cx="50" cy="50" rx="14" ry="32" fill="none" stroke="#93c5fd" stroke-width="1.5" />
  <line x1="18" y1="50" x2="82" y2="50" stroke="#93c5fd" stroke-width="1.5" />
  <path d="M20,24 H48 C52,24 54,28 54,32 V44 C54,48 50,48 44,48 L36,54 V48 H20 C16,48 16,44 16,40 V32 C16,24 20,24 20,24 Z" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" />
  <text x="32" y="42" font-family="sans-serif" font-weight="bold" font-size="16" fill="#1d4ed8" text-anchor="middle">A</text>
  <path d="M80,56 H54 C50,56 48,60 48,64 V76 C48,80 52,80 58,80 L66,86 V80 H80 C84,80 84,76 84,72 V64 C84,56 80,56 80,56 Z" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
  <text x="68" y="74" font-family="sans-serif" font-weight="bold" font-size="15" fill="#2563eb" text-anchor="middle">文</text>
</svg>"""

SVGS["perawat-anak"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="38" width="22" height="42" rx="4" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.5" />
  <rect x="26" y="32" width="14" height="6" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <path d="M30,32 C30,26 36,26 36,32 Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="26" y1="48" x2="32" y2="48" stroke="#3b82f6" stroke-width="1.5" />
  <line x1="26" y1="56" x2="34" y2="56" stroke="#3b82f6" stroke-width="1.5" />
  <line x1="26" y1="64" x2="32" y2="64" stroke="#3b82f6" stroke-width="1.5" />
  <circle cx="68" cy="34" r="14" fill="#fbcfe8" stroke="#db2777" stroke-width="2.5" />
  <circle cx="68" cy="34" r="6" fill="#f472b6" />
  <line x1="68" y1="48" x2="68" y2="76" stroke="#db2777" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="68" cy="78" r="4" fill="#fbcfe8" stroke="#db2777" stroke-width="2" />
</svg>"""

SVGS["perawatan-keluarga-home-nursing"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50,34 C44,22 28,22 24,36 C20,50 50,72 50,72 C50,72 80,50 76,36 C72,22 56,22 50,34 Z" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
  <rect x="46" y="36" width="8" height="20" rx="1" fill="#dc2626" />
  <rect x="40" y="42" width="20" height="8" rx="1" fill="#dc2626" />
  <path d="M30,24 C14,24 16,56 34,70 L50,82 L66,70 C84,56 86,24 70,24" fill="none" stroke="#1d4ed8" stroke-width="2.5" />
  <circle cx="30" cy="24" r="3" fill="#1d4ed8" />
  <circle cx="70" cy="24" r="3" fill="#1d4ed8" />
  <circle cx="50" cy="84" r="5" fill="#94a3b8" stroke="#334155" stroke-width="2" />
</svg>"""

SVGS["penerima-tamu"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="20" y="20" width="38" height="64" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2" />
  <polygon points="20,20 48,26 48,80 20,84" fill="#93c5fd" stroke="#1e40af" stroke-width="2.5" />
  <circle cx="44" cy="54" r="2.5" fill="#facc15" stroke="#b45309" stroke-width="1" />
  <path d="M64,68 C64,52 86,52 86,68 Z" fill="#facc15" stroke="#b45309" stroke-width="2" />
  <rect x="60" y="68" width="30" height="5" rx="2" fill="#ca8a04" stroke="#78350f" stroke-width="1.5" />
  <circle cx="75" cy="50" r="2.5" fill="#78350f" />
  <path d="M70,44 Q75,40 80,44" stroke="#eab308" stroke-width="2" />
</svg>"""

SVGS["juru-penerang"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="34,36 66,22 66,74 34,60" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5" />
  <ellipse cx="66" cy="48" rx="6" ry="26" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2.5" />
  <rect x="22" y="42" width="12" height="12" rx="2" fill="#1e3a8a" stroke="#1e3a8a" stroke-width="2" />
  <path d="M30,58 L28,76 L36,74 L36,59" fill="#94a3b8" stroke="#334155" stroke-width="2" />
  <path d="M76,34 Q84,48 76,62" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" />
  <path d="M84,26 Q96,48 84,70" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" />
</svg>"""

SVGS["korespondensi"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="32" width="64" height="44" rx="4" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.5" />
  <path d="M18,34 L50,58 L82,34" fill="none" stroke="#1d4ed8" stroke-width="2.5" />
  <path d="M18,74 L40,52 M82,74 L60,52" stroke="#93c5fd" stroke-width="1.5" />
  <rect x="66" y="38" width="12" height="14" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2 2" />
  <line x1="36" y1="20" x2="62" y2="44" stroke="#475569" stroke-width="3" stroke-linecap="round" />
  <polygon points="36,20 32,16 38,18" fill="#ca8a04" stroke="#78350f" stroke-width="1" />
</svg>"""

SVGS["pembantu-penyuluh-padi"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="24" width="38" height="52" rx="3" fill="#ffffff" stroke="#1e40af" stroke-width="2" />
  <rect x="32" y="20" width="18" height="6" rx="2" fill="#94a3b8" stroke="#334155" stroke-width="1.5" />
  <line x1="28" y1="36" x2="48" y2="36" stroke="#3b82f6" stroke-width="2" />
  <line x1="28" y1="44" x2="52" y2="44" stroke="#3b82f6" stroke-width="2" />
  <line x1="28" y1="52" x2="42" y2="52" stroke="#3b82f6" stroke-width="2" />
  <path d="M54,82 Q68,64 74,32" fill="none" stroke="#15803d" stroke-width="2.5" />
  <ellipse cx="72" cy="30" rx="3.5" ry="6" transform="rotate(30 72 30)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <ellipse cx="68" cy="40" rx="3.5" ry="6" transform="rotate(45 68 40)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <ellipse cx="76" cy="48" rx="3.5" ry="6" transform="rotate(-30 76 48)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <ellipse cx="64" cy="56" rx="3.5" ry="6" transform="rotate(45 64 56)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
</svg>"""

SVGS["keadaan-darurat-penerbangan-emergency"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M78,28 L62,38 L42,32 L36,36 L48,46 L34,54 L24,52 L20,56 L30,62 L26,76 L32,74 L42,66 L66,54 L78,28 Z" fill="#ffffff" stroke="#1e40af" stroke-width="2" />
  <polygon points="46,54 26,82 14,82 38,54" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
  <circle cx="82" cy="74" r="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
  <path d="M82,69 V79 M77,74 H87" stroke="#dc2626" stroke-width="2" />
</svg>"""

SVGS["keadaan-darurat-laut-emergency"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="28" fill="#ffffff" stroke="#ea580c" stroke-width="6" />
  <circle cx="50" cy="50" r="14" fill="#eff6ff" stroke="#ea580c" stroke-width="2" />
  <path d="M44,22 H56 V28 H44 Z" fill="#dc2626" />
  <path d="M44,72 H56 V78 H44 Z" fill="#dc2626" />
  <path d="M22,44 H28 V56 H22 Z" fill="#dc2626" />
  <path d="M72,44 H78 V56 H72 Z" fill="#dc2626" />
  <circle cx="50" cy="50" r="33" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="8 6" />
  <path d="M12,86 Q24,80 36,86 T60,86 T84,86" stroke="#0284c7" stroke-width="2.5" />
</svg>"""

# ==========================================
# 5. HIJAU (Keterampilan dan Pembangunan)
# ==========================================

# Satwa & Peternakan
SVGS["peternak-ulat-sutera"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20,68 C24,36 56,22 84,24 C82,56 64,80 20,68 Z" fill="#bbf7d0" stroke="#15803d" stroke-width="2" />
  <path d="M20,68 Q50,54 84,24" stroke="#166534" stroke-width="2" />
  <ellipse cx="64" cy="62" rx="10" ry="16" transform="rotate(-30 64 62)" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
  <circle cx="34" cy="46" r="5" fill="#fbcfe8" stroke="#db2777" stroke-width="2" />
  <circle cx="42" cy="43" r="5" fill="#fbcfe8" stroke="#db2777" stroke-width="2" />
  <circle cx="50" cy="42" r="5" fill="#fbcfe8" stroke="#db2777" stroke-width="2" />
</svg>"""

SVGS["peternak-kelinci"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="40" cy="28" rx="6" ry="18" transform="rotate(-15 40 28)" fill="#fce7f3" stroke="#475569" stroke-width="2" />
  <ellipse cx="60" cy="28" rx="6" ry="18" transform="rotate(15 60 28)" fill="#fce7f3" stroke="#475569" stroke-width="2" />
  <circle cx="50" cy="60" r="22" fill="#ffffff" stroke="#334155" stroke-width="2.5" />
  <circle cx="42" cy="56" r="3" fill="#1e293b" />
  <circle cx="58" cy="56" r="3" fill="#1e293b" />
  <polygon points="50,64 46,60 54,60" fill="#f43f5e" />
  <path d="M46,66 Q50,70 54,66" stroke="#334155" stroke-width="2" />
  <line x1="28" y1="62" x2="16" y2="60" stroke="#64748b" stroke-width="1.5" />
  <line x1="28" y1="66" x2="16" y2="70" stroke="#64748b" stroke-width="1.5" />
  <line x1="72" y1="62" x2="84" y2="60" stroke="#64748b" stroke-width="1.5" />
  <line x1="72" y1="66" x2="84" y2="70" stroke="#64748b" stroke-width="1.5" />
</svg>"""

SVGS["peternak-lebah"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="34,26 46,19 58,26 58,40 46,47 34,40" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
  <polygon points="58,40 70,33 82,40 82,54 70,61 58,54" fill="#fde047" stroke="#ca8a04" stroke-width="2" />
  <polygon points="34,54 46,47 58,54 58,68 46,75 34,68" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
  <ellipse cx="44" cy="58" rx="10" ry="14" transform="rotate(35 44 58)" fill="#f59e0b" stroke="#78350f" stroke-width="2" />
  <line x1="38" y1="52" x2="52" y2="62" stroke="#451a03" stroke-width="2.5" />
  <line x1="42" y1="58" x2="54" y2="68" stroke="#451a03" stroke-width="2.5" />
  <ellipse cx="38" cy="44" rx="6" ry="10" transform="rotate(-30 38 44)" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
  <ellipse cx="52" cy="46" rx="6" ry="10" transform="rotate(30 52 46)" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
</svg>"""

SVGS["peternak-itikmentokangsa"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M54,26 C54,18 64,16 68,22 C72,28 66,34 60,38 L60,50 C60,54 78,52 82,64 C86,76 66,80 48,80 C32,80 20,74 24,62 C26,56 34,54 46,54 L52,38 C54,34 54,30 54,26 Z" fill="#ffffff" stroke="#334155" stroke-width="2.5" />
  <polygon points="68,22 84,26 70,30" fill="#f97316" stroke="#c2410c" stroke-width="1.5" />
  <circle cx="62" cy="24" r="2" fill="#0f172a" />
  <path d="M14,84 Q28,78 42,84 T70,84 T92,84" stroke="#0284c7" stroke-width="2.5" />
</svg>"""

SVGS["peternak-ayam"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50,18 Q46,12 40,16 Q44,22 46,26" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
  <circle cx="52" cy="30" r="12" fill="#ffffff" stroke="#334155" stroke-width="2" />
  <polygon points="62,28 74,32 62,36" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" />
  <circle cx="54" cy="28" r="2" fill="#0f172a" />
  <path d="M58,38 Q60,46 54,44" fill="#dc2626" stroke="#991b1b" stroke-width="1.5" />
  <path d="M44,38 Q32,46 28,62 Q26,78 50,78 Q74,78 68,54 L58,40" fill="#ffffff" stroke="#334155" stroke-width="2.5" />
  <line x1="44" y1="78" x2="40" y2="88" stroke="#b45309" stroke-width="2.5" />
  <line x1="56" y1="78" x2="56" y2="88" stroke="#b45309" stroke-width="2.5" />
</svg>"""

SVGS["pemelihara-ternak"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30,30 Q18,20 20,12 Q28,14 36,24" fill="#fed7aa" stroke="#78350f" stroke-width="2" />
  <path d="M70,30 Q82,20 80,12 Q72,14 64,24" fill="#fed7aa" stroke="#78350f" stroke-width="2" />
  <ellipse cx="22" cy="38" rx="8" ry="4" transform="rotate(-20 22 38)" fill="#fbcfe8" stroke="#78350f" stroke-width="1.5" />
  <ellipse cx="78" cy="38" rx="8" ry="4" transform="rotate(20 78 38)" fill="#fbcfe8" stroke="#78350f" stroke-width="1.5" />
  <path d="M32,28 H68 L64,64 H36 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" />
  <circle cx="42" cy="44" r="3" fill="#1e293b" />
  <circle cx="58" cy="44" r="3" fill="#1e293b" />
  <rect x="30" y="62" width="40" height="22" rx="10" fill="#fed7aa" stroke="#78350f" stroke-width="2" />
  <circle cx="42" cy="72" r="3" fill="#78350f" />
  <circle cx="58" cy="72" r="3" fill="#78350f" />
</svg>"""

SVGS["pemelihara-merpati"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30,54 Q20,32 40,24 Q54,18 64,30 Q78,22 84,36 Q88,52 74,62 L78,78 L66,72 Q56,76 46,74 Q32,74 26,64 Z" fill="#ffffff" stroke="#334155" stroke-width="2.5" />
  <polygon points="26,38 14,40 24,44" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" />
  <circle cx="32" cy="38" r="2.5" fill="#0f172a" />
  <path d="M46,46 Q64,48 68,64" stroke="#94a3b8" stroke-width="2" />
  <path d="M14,40 Q10,48 18,52" stroke="#16a34a" stroke-width="2" />
  <ellipse cx="14" cy="48" rx="2" ry="4" fill="#22c55e" stroke="#15803d" stroke-width="1" />
</svg>"""

# Kriya, Kerajinan & Pertukangan
SVGS["penenun"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16,50 C24,42 76,42 84,50 C76,58 24,58 16,50 Z" fill="#fed7aa" stroke="#78350f" stroke-width="2.5" />
  <rect x="40" y="46" width="20" height="8" rx="4" fill="#ffffff" stroke="#c2410c" stroke-width="1.5" />
  <line x1="28" y1="20" x2="28" y2="80" stroke="#0284c7" stroke-width="2" />
  <line x1="38" y1="20" x2="38" y2="80" stroke="#0284c7" stroke-width="2" />
  <line x1="62" y1="20" x2="62" y2="80" stroke="#0284c7" stroke-width="2" />
  <line x1="72" y1="20" x2="72" y2="80" stroke="#0284c7" stroke-width="2" />
  <line x1="20" y1="30" x2="80" y2="30" stroke="#ea580c" stroke-width="2" />
  <line x1="20" y1="70" x2="80" y2="70" stroke="#ea580c" stroke-width="2" />
</svg>"""

SVGS["juru-bambu"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="30" y="16" width="12" height="70" fill="#bbf7d0" stroke="#15803d" stroke-width="2.5" />
  <line x1="28" y1="38" x2="44" y2="38" stroke="#166534" stroke-width="3" />
  <line x1="28" y1="62" x2="44" y2="62" stroke="#166534" stroke-width="3" />
  <rect x="48" y="24" width="12" height="62" fill="#bbf7d0" stroke="#15803d" stroke-width="2.5" />
  <line x1="46" y1="48" x2="62" y2="48" stroke="#166534" stroke-width="3" />
  <line x1="46" y1="72" x2="62" y2="72" stroke="#166534" stroke-width="3" />
  <path d="M30,38 Q18,34 16,24 Q24,28 30,36" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
  <path d="M60,48 Q72,44 76,34 Q70,40 60,46" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
</svg>"""

SVGS["juru-anyam"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="22" width="56" height="56" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />
  <line x1="36" y1="22" x2="36" y2="78" stroke="#a16207" stroke-width="2.5" />
  <line x1="50" y1="22" x2="50" y2="78" stroke="#a16207" stroke-width="2.5" />
  <line x1="64" y1="22" x2="64" y2="78" stroke="#a16207" stroke-width="2.5" />
  <line x1="22" y1="36" x2="78" y2="36" stroke="#ca8a04" stroke-width="2.5" />
  <line x1="22" y1="50" x2="78" y2="50" stroke="#ca8a04" stroke-width="2.5" />
  <line x1="22" y1="64" x2="78" y2="64" stroke="#ca8a04" stroke-width="2.5" />
  <rect x="36" y="36" width="14" height="14" fill="#ca8a04" />
  <rect x="50" y="50" width="14" height="14" fill="#ca8a04" />
</svg>"""

SVGS["juru-kayu"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20,62 L70,36 L76,46 L26,72 Z" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
  <path d="M20,62 L14,72 C10,78 18,84 24,80 L30,70" fill="#fed7aa" stroke="#78350f" stroke-width="2.5" />
  <path d="M26,72 L28,70 L32,71 L34,69 L38,70 L40,68 L44,69 L46,67 L50,68 L52,66 L56,67 L58,65 L62,66 L64,64 L68,65 L70,63 L74,64 L76,46" fill="#e2e8f0" stroke="#334155" stroke-width="1.5" />
  <rect x="42" y="18" width="42" height="16" rx="2" fill="#fed7aa" stroke="#78350f" stroke-width="2" />
</svg>"""

SVGS["juru-batu"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="58" width="28" height="14" fill="#fca5a5" stroke="#991b1b" stroke-width="2" />
  <rect x="48" y="58" width="34" height="14" fill="#fca5a5" stroke="#991b1b" stroke-width="2" />
  <rect x="32" y="42" width="36" height="14" fill="#fca5a5" stroke="#991b1b" stroke-width="2" />
  <path d="M42,18 L68,34 L46,42 Z" fill="#94a3b8" stroke="#334155" stroke-width="2" />
  <path d="M42,18 L32,22 L32,32 L22,34" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
</svg>"""

SVGS["juru-logam"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16,42 H76 L66,54 H62 V72 H74 V82 H26 V72 H38 V54 H26 L16,42 Z" fill="#64748b" stroke="#1e293b" stroke-width="2.5" />
  <line x1="74" y1="20" x2="52" y2="40" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
  <rect x="68" y="16" width="16" height="12" rx="2" transform="rotate(-40 76 22)" fill="#94a3b8" stroke="#0f172a" stroke-width="2" />
  <circle cx="48" cy="34" r="1.5" fill="#facc15" />
  <circle cx="56" cy="32" r="2" fill="#f59e0b" />
</svg>"""

SVGS["juru-kulit"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M28,20 Q50,26 72,20 Q66,40 82,48 Q66,58 74,80 Q50,72 26,80 Q34,58 18,48 Q34,40 28,20 Z" fill="#fed7aa" stroke="#9a3412" stroke-width="2.5" />
  <line x1="38" y1="52" x2="62" y2="52" stroke="#7c2d12" stroke-width="2" stroke-dasharray="3 3" />
  <circle cx="34" cy="52" r="2" fill="#7c2d12" />
  <circle cx="66" cy="52" r="2" fill="#7c2d12" />
</svg>"""

SVGS["penjilid-buku"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="24" y="62" width="56" height="14" rx="2" fill="#bfdbfe" stroke="#1e40af" stroke-width="2" />
  <rect x="22" y="44" width="56" height="14" rx="2" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
  <rect x="26" y="26" width="56" height="14" rx="2" fill="#fecaca" stroke="#dc2626" stroke-width="2" />
  <line x1="34" y1="26" x2="34" y2="40" stroke="#7f1d1d" stroke-width="2" />
  <line x1="30" y1="44" x2="30" y2="58" stroke="#854d0e" stroke-width="2" />
  <line x1="32" y1="62" x2="32" y2="76" stroke="#1e3a8a" stroke-width="2" />
</svg>"""

# Visual & Perikanan
SVGS["juru-potret"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="32" width="64" height="46" rx="6" fill="#334155" stroke="#0f172a" stroke-width="2.5" />
  <polygon points="36,32 42,24 58,24 64,32" fill="#475569" stroke="#0f172a" stroke-width="2" />
  <circle cx="50" cy="55" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5" />
  <circle cx="50" cy="55" r="8" fill="#0f172a" />
  <circle cx="28" cy="40" r="3" fill="#facc15" />
</svg>"""

SVGS["penangkap-ikan"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22,30 Q50,18 78,30 L74,70 Q50,86 26,70 Z" fill="#e0f2fe" stroke="#0369a1" stroke-width="2" />
  <line x1="34" y1="26" x2="66" y2="76" stroke="#0284c7" stroke-width="1.5" />
  <line x1="66" y1="26" x2="34" y2="76" stroke="#0284c7" stroke-width="1.5" />
  <path d="M38,50 Q50,42 62,50 Q50,58 38,50 Z" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2" />
  <polygon points="62,50 72,44 72,56" fill="#93c5fd" stroke="#1d4ed8" stroke-width="1.5" />
</svg>"""

SVGS["petani-padi"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M26,82 Q42,50 68,28" fill="none" stroke="#15803d" stroke-width="3" />
  <ellipse cx="68" cy="26" rx="4" ry="7" transform="rotate(35 68 26)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <ellipse cx="60" cy="36" rx="4" ry="7" transform="rotate(45 60 36)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <ellipse cx="50" cy="48" rx="4" ry="7" transform="rotate(55 50 48)" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <path d="M48,68 Q72,50 62,38 Q50,48 48,68 Z" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
  <line x1="48" y1="68" x2="38" y2="82" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
</svg>"""

SVGS["pengendara-sepeda"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="28" cy="62" r="16" stroke="#334155" stroke-width="3" />
  <circle cx="72" cy="62" r="16" stroke="#334155" stroke-width="3" />
  <polygon points="28,62 50,62 66,42 44,42" fill="none" stroke="#dc2626" stroke-width="3" />
  <line x1="50" y1="62" x2="44" y2="34" stroke="#dc2626" stroke-width="3" />
  <line x1="72" y1="62" x2="64" y2="34" stroke="#dc2626" stroke-width="3" />
  <line x1="58" y1="34" x2="70" y2="34" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
  <line x1="38" y1="34" x2="48" y2="34" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
</svg>"""

# Koleksi (Pengumpul)
SVGS["pengumpul-perangko"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="20" width="56" height="60" rx="3" fill="#fef2f2" stroke="#dc2626" stroke-width="3" stroke-dasharray="4 3" />
  <rect x="28" y="26" width="44" height="48" fill="#ffffff" stroke="#991b1b" stroke-width="1.5" />
  <path d="M50,38 C42,38 42,50 50,58 C58,50 58,38 50,38 Z" fill="#15803d" stroke="#166534" stroke-width="1.5" />
</svg>"""

SVGS["pengumpul-lencana"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="36" cy="40" r="14" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
  <polygon points="36,32 38,38 44,38 40,42 42,48 36,44 30,48 32,42 28,38 34,38" fill="#dc2626" />
  <polygon points="64,28 76,40 64,52 52,40" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5" />
  <path d="M36,68 L50,86 L64,68 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2" />
</svg>"""

SVGS["pengumpul-mata-uang"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="44" cy="68" rx="24" ry="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
  <ellipse cx="44" cy="56" rx="24" ry="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
  <ellipse cx="44" cy="44" rx="24" ry="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
  <text x="44" y="48" font-family="sans-serif" font-weight="bold" font-size="12" fill="#a16207" text-anchor="middle">Rp</text>
  <rect x="52" y="20" width="30" height="42" rx="2" transform="rotate(25 67 41)" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
</svg>"""

SVGS["pengumpul-tanaman-kering"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="16" width="56" height="68" rx="2" fill="#fefce8" stroke="#78350f" stroke-width="2" />
  <line x1="50" y1="26" x2="50" y2="70" stroke="#15803d" stroke-width="2" />
  <path d="M50,34 Q38,30 36,36 Q46,40 50,42" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
  <path d="M50,44 Q62,40 64,46 Q54,50 50,52" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
  <path d="M50,54 Q38,50 36,56 Q46,60 50,62" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
  <line x1="42" y1="64" x2="58" y2="64" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" />
</svg>"""

SVGS["pengumpul-tanaman-hidup"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30,82 L70,82 L64,54 L36,54 Z" fill="#fdba74" stroke="#c2410c" stroke-width="2.5" />
  <rect x="32" y="48" width="36" height="6" rx="2" fill="#ea580c" stroke="#9a3412" stroke-width="2" />
  <path d="M50,48 C38,48 38,24 50,20 C62,24 62,48 50,48 Z" fill="#86efac" stroke="#16a34a" stroke-width="2.5" />
  <line x1="50" y1="20" x2="50" y2="48" stroke="#15803d" stroke-width="2" />
</svg>"""

SVGS["pengumpul-benda"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="20" width="64" height="60" rx="3" fill="#fed7aa" stroke="#78350f" stroke-width="3" />
  <line x1="50" y1="20" x2="50" y2="80" stroke="#78350f" stroke-width="2.5" />
  <line x1="18" y1="50" x2="82" y2="50" stroke="#78350f" stroke-width="2.5" />
  <circle cx="34" cy="35" r="7" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5" />
  <polygon points="66,28 72,42 60,42" fill="#fde047" stroke="#ca8a04" stroke-width="1.5" />
  <rect x="28" y="60" width="12" height="12" rx="2" fill="#93c5fd" stroke="#1d4ed8" stroke-width="1.5" />
  <circle cx="66" cy="65" r="6" fill="#86efac" stroke="#16a34a" stroke-width="1.5" />
</svg>"""

SVGS["pengumpul-hewan-keringbasah"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="26" y="28" width="48" height="56" rx="10" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" />
  <rect x="32" y="20" width="36" height="8" rx="2" fill="#94a3b8" stroke="#334155" stroke-width="2" />
  <line x1="50" y1="42" x2="50" y2="68" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
  <path d="M50,48 Q34,36 34,48 Q34,60 50,56" fill="#f472b6" stroke="#be185d" stroke-width="1.5" />
  <path d="M50,48 Q66,36 66,48 Q66,60 50,56" fill="#f472b6" stroke="#be185d" stroke-width="1.5" />
</svg>"""

# Kedirgantaraan & Komunikasi
SVGS["juru-semboyan"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="50" y1="82" x2="20" y2="28" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <polygon points="20,28 36,20 44,36 28,44" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" />
  <polygon points="20,28 36,20 28,44" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
  <line x1="50" y1="82" x2="80" y2="28" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
  <polygon points="80,28 64,20 56,36 72,44" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" />
  <polygon points="80,28 64,20 72,44" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
</svg>"""

SVGS["pencinta-dirgantara"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50,14 L60,44 L86,60 L86,68 L60,58 L58,78 L68,86 L60,88 L50,82 L40,88 L32,86 L42,78 L40,58 L14,68 L14,60 L40,44 Z" fill="#ffffff" stroke="#0284c7" stroke-width="2.5" />
  <path d="M16,84 Q28,78 40,84 T70,84 T92,84" stroke="#cbd5e1" stroke-width="2" />
</svg>"""

SVGS["pembuat-pesawat-model"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="50" y1="18" x2="50" y2="82" stroke="#78350f" stroke-width="3" />
  <path d="M16,42 Q50,34 84,42 L80,48 Q50,42 20,48 Z" fill="#fed7aa" stroke="#9a3412" stroke-width="2" />
  <path d="M34,74 H66 L64,80 H36 Z" fill="#fed7aa" stroke="#9a3412" stroke-width="1.5" />
  <ellipse cx="50" cy="18" rx="8" ry="3" fill="#64748b" stroke="#0f172a" stroke-width="1.5" />
</svg>"""

SVGS["pengenal-cuaca"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30,46 C24,46 20,40 22,34 C24,28 32,26 36,30 C38,22 52,20 58,26 C64,22 76,26 76,34 C82,36 82,46 74,46 Z" fill="#ffffff" stroke="#0284c7" stroke-width="2.5" />
  <line x1="32" y1="56" x2="28" y2="66" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
  <line x1="46" y1="56" x2="42" y2="66" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
  <line x1="60" y1="56" x2="56" y2="66" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
  <rect x="74" y="52" width="6" height="32" rx="3" fill="#ffffff" stroke="#dc2626" stroke-width="1.5" />
  <circle cx="77" cy="80" r="5" fill="#dc2626" />
</svg>"""

SVGS["komunikasi"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="50,22 36,84 64,84" fill="none" stroke="#334155" stroke-width="2.5" />
  <line x1="43" y1="52" x2="57" y2="52" stroke="#334155" stroke-width="2" />
  <line x1="40" y1="68" x2="60" y2="68" stroke="#334155" stroke-width="2" />
  <circle cx="50" cy="20" r="4" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
  <path d="M38,14 Q50,4 62,14" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
  <path d="M28,8 Q50,-6 72,8" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
</svg>"""

SVGS["konstruksi-pesawat-udara"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50,16 L84,66 H16 Z" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="4 3" />
  <line x1="50" y1="16" x2="50" y2="66" stroke="#0284c7" stroke-width="2" />
  <line x1="33" y1="41" x2="67" y2="41" stroke="#0284c7" stroke-width="2" />
  <circle cx="50" cy="16" r="3" fill="#0369a1" />
  <circle cx="16" cy="66" r="3" fill="#0369a1" />
  <circle cx="84" cy="66" r="3" fill="#0369a1" />
  <line x1="26" y1="78" x2="74" y2="78" stroke="#eab308" stroke-width="3" stroke-linecap="round" />
</svg>"""

SVGS["juru-motor-pesawat-terbang"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="12" fill="#64748b" stroke="#1e293b" stroke-width="2.5" />
  <path d="M50,38 C42,20 58,20 50,38 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2" />
  <path d="M60,56 C78,64 70,78 60,56 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2" />
  <path d="M40,56 C22,64 30,78 40,56 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2" />
  <line x1="20" y1="20" x2="36" y2="36" stroke="#ea580c" stroke-width="3.5" stroke-linecap="round" />
</svg>"""

SVGS["navigasi-udara"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="32" fill="#0f172a" stroke="#334155" stroke-width="3" />
  <path d="M18,50 H82" stroke="#38bdf8" stroke-width="2.5" />
  <circle cx="50" cy="50" r="3" fill="#facc15" />
  <line x1="38" y1="42" x2="62" y2="42" stroke="#ffffff" stroke-width="1.5" />
  <line x1="42" y1="34" x2="58" y2="34" stroke="#ffffff" stroke-width="1.5" />
  <line x1="38" y1="58" x2="62" y2="58" stroke="#ffffff" stroke-width="1.5" />
</svg>"""

SVGS["evakuasi-medis-dirgantara"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="20" y1="26" x2="80" y2="26" stroke="#334155" stroke-width="3" stroke-linecap="round" />
  <line x1="50" y1="26" x2="50" y2="34" stroke="#334155" stroke-width="2.5" />
  <ellipse cx="48" cy="46" rx="24" ry="14" fill="#ffffff" stroke="#dc2626" stroke-width="2.5" />
  <rect x="44" y="40" width="8" height="12" fill="#dc2626" />
  <rect x="42" y="42" width="12" height="8" fill="#dc2626" />
  <line x1="72" y1="46" x2="88" y2="42" stroke="#dc2626" stroke-width="3" />
  <line x1="88" y1="36" x2="88" y2="48" stroke="#334155" stroke-width="2" />
  <line x1="34" y1="60" x2="34" y2="68" stroke="#334155" stroke-width="2" />
  <line x1="60" y1="60" x2="60" y2="68" stroke="#334155" stroke-width="2" />
  <line x1="26" y1="68" x2="68" y2="68" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
</svg>"""

SVGS["pengenal-pesawat-terbang"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50,14 C52,24 54,42 54,54 L84,64 V70 L54,62 V78 L64,84 V88 L50,84 L36,88 V84 L46,78 V62 L16,70 V64 L46,54 C46,42 48,24 50,14 Z" fill="#334155" stroke="#0f172a" stroke-width="2" />
  <circle cx="50" cy="50" r="36" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" />
</svg>"""

# Kebaharian & Sinyal Laut
SVGS["juru-peta"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="18,28 38,20 62,28 82,20 82,72 62,80 38,72 18,80" fill="#fefce8" stroke="#78350f" stroke-width="2.5" />
  <line x1="38" y1="20" x2="38" y2="72" stroke="#ca8a04" stroke-width="2" stroke-dasharray="2 2" />
  <line x1="62" y1="28" x2="62" y2="80" stroke="#ca8a04" stroke-width="2" stroke-dasharray="2 2" />
  <circle cx="50" cy="50" r="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
  <polygon points="50,42 53,50 50,47 47,50" fill="#dc2626" />
</svg>"""

SVGS["navigasi-laut"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="22" fill="#fed7aa" stroke="#78350f" stroke-width="4" />
  <circle cx="50" cy="50" r="8" fill="#78350f" stroke="#451a03" stroke-width="2" />
  <line x1="50" y1="12" x2="50" y2="88" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
  <line x1="12" y1="50" x2="88" y2="50" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
  <line x1="23" y1="23" x2="77" y2="77" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
  <line x1="23" y1="77" x2="77" y2="23" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
</svg>"""

SVGS["juru-isyarat-bendera"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="28" y1="14" x2="28" y2="86" stroke="#334155" stroke-width="3" />
  <rect x="28" y="20" width="36" height="20" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
  <rect x="40" y="20" width="12" height="20" fill="#ffffff" />
  <polygon points="28,46 64,56 28,66" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" />
  <circle cx="40" cy="56" r="4" fill="#ffffff" />
</svg>"""

SVGS["pelaut"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="24" r="7" fill="none" stroke="#1e293b" stroke-width="3" />
  <line x1="50" y1="31" x2="50" y2="80" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
  <line x1="32" y1="40" x2="68" y2="40" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" />
  <path d="M22,58 C22,78 78,78 78,58" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
  <polygon points="18,58 26,58 22,50" fill="#1e293b" />
  <polygon points="74,58 82,58 78,50" fill="#1e293b" />
</svg>"""

SVGS["juru-isyarat-listrik"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="66" width="64" height="14" rx="2" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
  <circle cx="34" cy="56" r="6" fill="#ca8a04" stroke="#713f12" stroke-width="2" />
  <path d="M26,54 L58,46 L76,52" fill="none" stroke="#334155" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="76" cy="52" r="5" fill="#0f172a" />
  <polygon points="62,18 52,32 60,32 54,44 68,28 60,28" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
</svg>"""

SVGS["juru-isyarat-optik"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="22" y="32" width="32" height="36" rx="4" fill="#334155" stroke="#0f172a" stroke-width="2.5" />
  <line x1="38" y1="68" x2="38" y2="86" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
  <polygon points="54,36 84,20 84,80 54,64" fill="#fef08a" fill-opacity="0.4" stroke="#eab308" stroke-width="2" />
  <line x1="54" y1="42" x2="80" y2="30" stroke="#facc15" stroke-width="2" stroke-linecap="round" />
  <line x1="54" y1="58" x2="80" y2="70" stroke="#facc15" stroke-width="2" stroke-linecap="round" />
</svg>"""

SVGS["perencana-kapal"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="18" y="24" width="64" height="52" rx="3" fill="#0284c7" stroke="#0369a1" stroke-width="2" />
  <path d="M26,56 Q50,68 74,48 L70,40 Q46,44 30,42 Z" fill="#ffffff" stroke="#e0f2fe" stroke-width="1.5" />
  <line x1="24" y1="36" x2="76" y2="36" stroke="#93c5fd" stroke-width="1" stroke-dasharray="2 2" />
  <line x1="24" y1="64" x2="76" y2="64" stroke="#93c5fd" stroke-width="1" stroke-dasharray="2 2" />
  <polygon points="50,14 44,30 56,30" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
</svg>"""

SVGS["perahu-motor"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18,60 L78,54 L84,66 L26,72 Z" fill="#ffffff" stroke="#0284c7" stroke-width="2.5" />
  <polygon points="34,60 48,42 62,56" fill="#93c5fd" stroke="#0369a1" stroke-width="2" />
  <rect x="14" y="56" width="8" height="14" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.5" />
  <path d="M10,76 Q26,70 42,76 T74,76 T94,76" stroke="#38bdf8" stroke-width="2.5" />
</svg>"""

# ==========================================
# Execution & Validation
# ==========================================
print(f"Total SVGs defined in script: {len(SVGS)}")

success_count = 0
for key, svg_content in SVGS.items():
    filepath = os.path.join(OUTPUT_DIR, f"{key}.svg")
    try:
        # Validate XML
        ET.fromstring(svg_content)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content.strip() + "\n")
        success_count += 1
    except ET.ParseError as e:
        print(f"XML Error in {key}: {e}")

print(f"Successfully generated {success_count} valid SVGs in {OUTPUT_DIR}")
