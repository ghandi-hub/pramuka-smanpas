import re
import json
import unicodedata

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).lower()
    return re.sub(r'[-\s]+', '-', text).strip('-')

with open('/home/hermes/.hermes/profiles/dev/skills/pramuka/pramuka-tkk-skk/references/juklak-sk-134-1976.md') as f:
    raw_text = f.read()

sections = [
    ('Agama, Mental, Moral, Spiritual, Pembentukan Pribadi dan Watak', 'Kuning', 'kuning', r'##\s+\*\*I\.\s+SYARAT-SYARAT KECAKAPAN KHUSUS \(SKK\) BIDANG AGAMA', r'##\s+\*\*I\.\s+GAMBAR'),
    ('Patriotisme dan Seni Budaya', 'Merah', 'merah', r'##\s+\*\*II\.\s+SYARAT-SYARAT KECAKAPAN KHUSUS \(SKK\) BIDANG PATRIOTISME', r'##\s+\*\*II\.\s+GAMBAR'),
    ('Ketangkasan dan Kesehatan', 'Putih', 'putih', r'##\s+\*\*III\.\s+SYARAT-SYARAT KECAKAPAN KHUSUS \(SKK\) BIDANG KETANGKASAN', r'##\s+\*\*III\.\s+GAMBAR'),
    ('Keterampilan dan Teknik Pembangunan', 'Hijau', 'hijau', r'##\s+\*\*IV\.\s+SYARAT-SYARAT TANDA KECAKAPAN KHUSUS \(SKK\) BIDANG KETERAMPILAN', r'##\s+\*\*V\.\s+SYARAT-SYARAT'),
    ('Sosial, Perikemanusiaan, Gotong Royong, Ketertiban Masyarakat, Perdamaian Dunia, Lingkungan Hidup', 'Biru', 'biru', r'##\s+\*\*V\.\s+SYARAT-SYARAT KECAKAPAN KHUSUS \(SKK\) BIDANG SOSIAL', r'##\s+\*\*V\.\s+GAMBAR|Kwartir Nasional Gerakan Pramuka\s*$')
]

def clean_ocr(text):
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        l = line.strip()
        if not l:
            continue
        if re.match(r'^\d+$', l):
            continue
        if 'Kwartir Nasional Gerakan Pramuka' in l:
            continue
        if '<!--' in l or '-->' in l:
            continue
        if re.match(r'^[A-Za-z0-9+/=]{4,}<br>$', l):
            continue
        cleaned.append(l)
    return '\n'.join(cleaned)

def extract_levels(body):
    body = clean_ocr(body)
    
    m_purwa = re.search(r'(?:(?:^|\n)\s*(?:[-*]\s*)?(?:1\)|a\.|1\.)\s*(?:Untuk mencapai\s+)?Tingkat\s+Purwa|Tingkat\s+Purwa,?\s+yaitu\s+apabila)', body, re.I)
    m_madya = re.search(r'(?:(?:^|\n)\s*(?:[-*]\s*)?(?:2\)|b\.|2\.)\s*(?:Untuk mencapai\s+)?Tingkat\s+Madya|Tingkat\s+Madya,?\s+yaitu\s+apabila)', body, re.I)
    m_utama = re.search(r'(?:(?:^|\n)\s*(?:[-*]\s*)?(?:3\)|c\.|3\.)\s*(?:Untuk mencapai\s+)?Tingkat\s+Utama|Tingkat\s+Utama,?\s+yaitu\s+apabila)', body, re.I)
    
    if not (m_purwa and m_madya and m_utama):
        return None
        
    purwa_text = body[m_purwa.start():m_madya.start()]
    utama_end_m = re.search(r'(?:(?:^|\n)\s*(?:[-*]\s*)?(?:c\.|d\.|4\.)\s*(?:Gambar\s+TKK|Catatan)|###|\Z)', body[m_utama.start():], re.I)
    if utama_end_m and utama_end_m.start() > 0:
        madya_text = body[m_madya.start():m_utama.start()]
        utama_text = body[m_utama.start():m_utama.start() + utama_end_m.start()]
    else:
        madya_text = body[m_madya.start():m_utama.start()]
        utama_text = body[m_utama.start():]
        
    return {
        'purwa': purwa_text,
        'madya': madya_text,
        'utama': utama_text
    }

def parse_requirements(level_text):
    lines = level_text.split('\n')
    items = []
    current_item = []
    
    is_penegak_extra = False
    
    for line in lines:
        raw_l = line.strip()
        if not raw_l:
            continue
            
        if re.search(r'(?:Untuk mencapai\s+)?Tingkat\s+(?:Purwa|Madya|Utama)\s+seorang\s+Pramuka\s+harus(?:\s+dapat)?:?|Tingkat\s+(?:Purwa|Madya|Utama),?\s+yaitu\s+apabila', raw_l, re.I):
            continue
            
        if re.search(r'Khusus\s+untuk\s+Pramuka\s+Penegak\s+dan\s+Pandega[,\s]+ditambah\s+dengan:?', raw_l, re.I):
            is_penegak_extra = True
            continue
            
        m_letter = re.match(r'^(?:[-*]\s*)?([a-z])\)\s+(.+)$', raw_l, re.I)
        m_digit = re.match(r'^(?:[-*]\s*)?(\d+)\)\s+(.+)$', raw_l, re.I)
        
        if m_letter:
            if current_item:
                items.append(' '.join(current_item).strip())
                current_item = []
            content = m_letter.group(2).strip()
            if is_penegak_extra:
                content = f"Khusus Penegak/Pandega: {content}"
                is_penegak_extra = False
            current_item.append(content)
        elif m_digit:
            if current_item:
                sub_num = m_digit.group(1)
                sub_text = m_digit.group(2).strip()
                current_item.append(f"({sub_num}) {sub_text}")
            else:
                content = m_digit.group(2).strip()
                if is_penegak_extra:
                    content = f"Khusus Penegak/Pandega: {content}"
                    is_penegak_extra = False
                current_item.append(content)
        else:
            if current_item:
                current_item.append(raw_l)
            else:
                current_item.append(raw_l)
                
    if current_item:
        items.append(' '.join(current_item).strip())
        
    cleaned_items = []
    for item in items:
        item = re.sub(r'^(?:[-*]\s*)+', '', item)
        item = re.sub(r'\s+', ' ', item).strip()
        if item and item[0].islower():
            item = item[0].upper() + item[1:]
        if item:
            cleaned_items.append(item)
            
    return cleaned_items

MANDATORY_MAP = {
    'pertolongan-pertama-pada-kecelakaan': True,
    'p3k': True,
    'pengatur-rumah': True,
    'pengamat': True,
    'juru-masak': True,
    'penabung': True,
    'menjahit': True,
    'juru-kebun': True,
    'pengaman-kampungdesa': True,
    'pengatur-lalu-lintas': True,
    'pengaman-lalu-lintas': True,
    'gerak-jalan': True
}

order_no = 1
items_data = []

for field_name, color, color_code, start_pat, end_pat in sections:
    m_start = re.search(start_pat, raw_text)
    if not m_start:
        continue
    m_end = re.search(end_pat, raw_text[m_start.end():])
    if m_end:
        sec_text = raw_text[m_start.end():m_start.end() + m_end.start()]
    else:
        sec_text = raw_text[m_start.end():]
    
    skk_splits = re.split(r'(###\s+\*\*(?:\d+\.\s*)?SKK\s+[^\n]+)', sec_text)
    for i in range(1, len(skk_splits), 2):
        header = skk_splits[i].strip()
        body = skk_splits[i+1]
        
        # Exclude Siaga-only SKKs
        if re.search(r'SKK Pengatur Ruangan\b|SKK Pengumpul\s*\*\*|SKK Pembantu Ibu\b', header):
            continue
            
        m_name = re.search(r'SKK\s+(.+?)(?:\s*\*\*)?$', header)
        raw_name = m_name.group(1).strip() if m_name else header
        clean_name = re.sub(r'[*_]', '', raw_name).strip()
        clean_name = re.sub(r'\s+', ' ', clean_name)
        
        slug = slugify(clean_name)
        
        # Compatibility IDs
        if slug in ['pertolongan-pertama-pada-kecelakaan', 'pertolongan-pertama-pada-kecelakaan-p3k']:
            item_id = 'p3k'
            code = 'TKK-P3K'
        else:
            item_id = slug
            code = f"TKK-{slug.upper()}"
            
        is_mand = bool(MANDATORY_MAP.get(item_id) or MANDATORY_MAP.get(slug))
        
        levels_raw = extract_levels(body)
        if not levels_raw:
            print(f"ERROR: Cannot extract levels for {clean_name}")
            continue
            
        purwa_reqs = parse_requirements(levels_raw['purwa'])
        madya_reqs = parse_requirements(levels_raw['madya'])
        utama_reqs = parse_requirements(levels_raw['utama'])
        
        item_obj = {
            '_id': item_id,
            'id': item_id,
            'code': code,
            'name': clean_name,
            'field': field_name,
            'color': color,
            'color_code': color_code,
            'icon_key': item_id,
            'badge_shape': 'lingkaran',
            'is_mandatory': is_mand,
            'is_wajib': is_mand,
            'order_number': order_no,
            'description': f"Syarat Kecakapan Khusus (SKK) {clean_name} untuk Pramuka Penegak sesuai Keputusan Kwarnas No. 132 Tahun 1979.",
            'levels': {
                'purwa': {
                    'shape': 'lingkaran',
                    'requirements': purwa_reqs
                },
                'madya': {
                    'shape': 'persegi',
                    'requirements': madya_reqs
                },
                'utama': {
                    'shape': 'segilima',
                    'requirements': utama_reqs
                }
            },
            'created_at': "2026-10-09T00:00:00.000Z",
            'updated_at': "2026-10-09T00:00:00.000Z"
        }
        items_data.append(item_obj)
        order_no += 1

print(f"Total processed items: {len(items_data)}")

# Check uniqueness of IDs and codes
id_set = set()
code_set = set()
for item in items_data:
    if item['id'] in id_set:
        print(f"DUPLICATE ID: {item['id']}")
    if item['code'] in code_set:
        print(f"DUPLICATE CODE: {item['code']}")
    id_set.add(item['id'])
    code_set.add(item['code'])

print(f"Unique IDs: {len(id_set)}, Unique Codes: {len(code_set)}")

with open('/home/hermes/projects/pramuka-landing-page/scripts/skk-penegak-data.json', 'w') as f:
    json.dump(items_data, f, indent=2, ensure_ascii=False)
print("Saved to scripts/skk-penegak-data.json")
