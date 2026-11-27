"""
HTML parsers and metadata for Italian daily horoscopes.
Uses standard library `html` and `re` only (zero extra dependencies).
"""
import html
import re
from typing import Dict, List, Optional, Tuple
from backend.domains.horoscope.schemas import HoroscopeSignEntry

ZODIAC_SIGNS_META: List[Dict[str, str]] = [
    {"slug": "ariete", "name": "Ariete", "symbol": "♈", "date_range": "21 Mar - 19 Apr"},
    {"slug": "toro", "name": "Toro", "symbol": "♉", "date_range": "20 Apr - 20 Mag"},
    {"slug": "gemelli", "name": "Gemelli", "symbol": "♊", "date_range": "21 Mag - 20 Giu"},
    {"slug": "cancro", "name": "Cancro", "symbol": "♋", "date_range": "21 Giu - 22 Lug"},
    {"slug": "leone", "name": "Leone", "symbol": "♌", "date_range": "23 Lug - 22 Ago"},
    {"slug": "vergine", "name": "Vergine", "symbol": "♍", "date_range": "23 Ago - 22 Set"},
    {"slug": "bilancia", "name": "Bilancia", "symbol": "♎", "date_range": "23 Set - 22 Ott"},
    {"slug": "scorpione", "name": "Scorpione", "symbol": "♏", "date_range": "23 Ott - 21 Nov"},
    {"slug": "sagittario", "name": "Sagittario", "symbol": "♐", "date_range": "22 Nov - 21 Dic"},
    {"slug": "capricorno", "name": "Capricorno", "symbol": "♑", "date_range": "22 Dic - 19 Gen"},
    {"slug": "acquario", "name": "Acquario", "symbol": "♒", "date_range": "20 Gen - 18 Feb"},
    {"slug": "pesci", "name": "Pesci", "symbol": "♓", "date_range": "19 Feb - 20 Mar"},
]

ZODIAC_BY_SLUG: Dict[str, Dict[str, str]] = {item["slug"]: item for item in ZODIAC_SIGNS_META}


def _strip_html(raw: str) -> str:
    """Rimuove tag HTML, decodifica entità e normalizza gli spazi bianchi."""
    without_tags = re.sub(r"<[^>]+>", " ", raw)
    unescaped = html.unescape(without_tags)
    cleaned = re.sub(r"\s+", " ", unescaped).strip()
    # Corregge spazi prima della punteggiatura eventualmente introdotti da tag inline (es. <em>)
    cleaned = re.sub(r"\s+([,.;:!?])", r"\1", cleaned)
    return cleaned


def _split_labeled_paragraph(text: str) -> Tuple[Optional[str], str]:
    """Estrae prefissi editoriali noti (Amore, Lavoro, Benessere)."""
    patterns: List[Tuple[str, str]] = [
        ("love", r"^amore\s+ed?\s+eros\s*:\s*"),
        ("work", r"^lavoro\s+e\s+denaro\s*:\s*"),
        ("wellness", r"^benessere\s*:\s*"),
    ]
    for key, pat in patterns:
        match = re.match(pat, text, flags=re.IGNORECASE)
        if match:
            return key, text[match.end():].strip()
    return None, text


def parse_oggi_html(sign_slug: str, raw_html: str) -> Optional[HoroscopeSignEntry]:
    """Estrae l'oroscopo strutturato dalla pagina giornaliera di Oggi.it."""
    meta = ZODIAC_BY_SLUG.get(sign_slug)
    if not meta:
        return None

    block_match = re.search(
        r'<div[^>]*class="[^"]*oroscopoSign__fullTxt[^"]*"[^>]*>(.*?)</div>\s*<div[^>]*class="[^"]*gridRow__block',
        raw_html,
        flags=re.DOTALL | re.IGNORECASE,
    )
    scope_html = block_match.group(1) if block_match else raw_html

    date_match = re.search(
        r'<div[^>]*class="[^"]*oroscopoSign__fullDate[^"]*"[^>]*>(.*?)</div>',
        scope_html,
        flags=re.DOTALL | re.IGNORECASE,
    )
    date_label = _strip_html(date_match.group(1)) if date_match else None

    raw_paragraphs = re.findall(
        r'<p[^>]*class="[^"]*oroscopoSign__txt[^"]*"[^>]*>(.*?)</p>',
        scope_html,
        flags=re.DOTALL | re.IGNORECASE,
    )

    general_parts: List[str] = []
    love_text: Optional[str] = None
    work_text: Optional[str] = None
    wellness_text: Optional[str] = None

    for raw_p in raw_paragraphs:
        # Gestisce eventuali <p class="oroscopoSign__txt"><p class="oroscopoSign__txt"> annidati
        cleaned = _strip_html(raw_p)
        if len(cleaned) < 25:
            continue
        section_key, body = _split_labeled_paragraph(cleaned)
        if section_key == "love":
            love_text = body
        elif section_key == "work":
            work_text = body
        elif section_key == "wellness":
            wellness_text = body
        else:
            general_parts.append(body)

    general_text = " ".join(general_parts).strip()
    if not general_text and love_text:
        general_text = love_text

    if not general_text:
        return None

    return HoroscopeSignEntry(
        sign=sign_slug,
        name=meta["name"],
        symbol=meta["symbol"],
        date_range=meta["date_range"],
        date_label=date_label,
        general=general_text,
        love=love_text,
        work=work_text,
        wellness=wellness_text,
        source="Oggi Oroscopo",
    )


def parse_iodonna_html(sign_slug: str, raw_html: str) -> Optional[HoroscopeSignEntry]:
    """Parser secondario di emergenza dalla pagina giornaliera di iO Donna."""
    meta = ZODIAC_BY_SLUG.get(sign_slug)
    if not meta:
        return None

    blocks = re.findall(
        r'<div[^>]*class="[^"]*eltdf-post-text-main[^"]*"[^>]*>(.*?)</div>',
        raw_html,
        flags=re.DOTALL | re.IGNORECASE,
    )
    if not blocks:
        return None

    paragraphs: List[str] = []
    for block in blocks:
        for p in re.findall(r"<p[^>]*>(.*?)</p>", block, flags=re.DOTALL | re.IGNORECASE):
            txt = _strip_html(p)
            if len(txt) >= 20 and "riproduzione riservata" not in txt.lower():
                paragraphs.append(txt)

    if not paragraphs:
        return None

    general_parts: List[str] = []
    love_parts: List[str] = []
    wellness_parts: List[str] = []

    for txt in paragraphs:
        upper = txt.upper()
        if upper.startswith("PER LEI:") or upper.startswith("PER LUI:"):
            love_parts.append(txt)
        elif upper.startswith("COLORE") or upper.startswith("BAROMETRO") or upper.startswith("PAGELLINA"):
            wellness_parts.append(txt)
        else:
            general_parts.append(txt)

    general_text = " ".join(general_parts).strip()
    if not general_text and love_parts:
        general_text = love_parts[0]

    if not general_text:
        return None

    return HoroscopeSignEntry(
        sign=sign_slug,
        name=meta["name"],
        symbol=meta["symbol"],
        date_range=meta["date_range"],
        date_label=None,
        general=general_text,
        love=" ".join(love_parts) if love_parts else None,
        work=None,
        wellness=" · ".join(wellness_parts) if wellness_parts else None,
        source="iO Donna Oroscopo",
    )
