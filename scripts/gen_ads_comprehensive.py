"""Comprehensive ad-photo generator for khedmaPro.

Generates COMPLETE set of 70 marketing/social-media ad images using Gemini Nano Banana
(via EMERGENT_LLM_KEY) covering all categories, formats, and languages.
All taglines are in French or Arabic only (per Algeria target).
The brand wordmark "khedmaPro" always stays in Latin letters.

Run: `python /app/scripts/gen_ads_comprehensive.py`
Output: `/app/generated_ads/*.png` → also mirrored to `/app/backend/static/ads/`.
"""
import asyncio
import base64
import os
import shutil
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, "/app/backend")
load_dotenv("/app/backend/.env")

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
except Exception as e:
    print(f"emergentintegrations import failed: {e}", file=sys.stderr)
    raise

OUT_DIR = Path("/app/generated_ads")
MIRROR_DIR = Path("/app/backend/static/ads")
OUT_DIR.mkdir(parents=True, exist_ok=True)
MIRROR_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.getenv("EMERGENT_LLM_KEY")
MODEL = "gemini-3.1-flash-image-preview"

BRAND = "khedmaPro"

# Taglines: French + Arabic ONLY. English is intentionally excluded.
# MAIN/HERO TAGLINES
TAGLINE_FR_MAIN = "Des pros de confiance, en un click"
TAGLINE_FR_MAIN_V2 = "Trouvez le pro idéal en quelques taps"
TAGLINE_AR_MAIN = "محترفون موثوقون بضغطة واحدة"
TAGLINE_AR_MAIN_V2 = "احصل على الخدمة التي تحتاجها فوراً"
TAGLINE_AR_HERO = "احجز محترفاً موثوقاً في ثوانٍ"

# CATEGORY-SPECIFIC TAGLINES - FRENCH
TAGLINE_FR_PLUMB = "Des plombiers de confiance — réservez en quelques secondes"
TAGLINE_FR_ELEC = "Des électriciens certifiés — même jour"
TAGLINE_FR_CLEAN = "Un ménage impeccable, à la demande"
TAGLINE_FR_CARP = "Des menuisiers de qualité — travail soigné et précis"
TAGLINE_FR_PAINT = "Des peintres professionnels — fini parfait et durable"
TAGLINE_FR_LAND = "Des jardiniers experts — espaces verts magnifiques"
TAGLINE_FR_IT = "Support informatique rapide — résolution efficace en ligne"
TAGLINE_FR_ADMIN = "Consultants administratifs — solutions sur mesure pour vos besoins"
TAGLINE_FR_EDU = "Cours particuliers qualifiés — progrès garantis et suivi personnalisé"
TAGLINE_FR_PHOTO = "Photographes professionnels — souvenirs immortels de qualité"
TAGLINE_FR_MOVE = "Déménageurs pros — transfert sans stress et sécurisé"

# CATEGORY-SPECIFIC TAGLINES - ARABIC
TAGLINE_AR_PLUMB = "سباكون موثوقون — احجز خدمة سباكة في ثوانٍ"
TAGLINE_AR_ELEC = "كهربائيون Certified — خدمة فورية mesmo اليوم"
TAGLINE_AR_CLEAN = "منظّفون بضغطة — نظافة فوريةและ عميقة"
TAGLINE_AR_CARP = "نجارون ماهرون — عمل خشبي دقيق وجميل"
TAGLINE_AR_PAINT = "رسامون محترفون — تشطيب مثالي 및 طويل الأمد"
TAGLINE_AR_LAND = "بستانيون خبراء — تحويل مساحاتك إلى جنان خضراء"
TAGLINE_AR_IT = "دعم تقني سريع — حل فوري لمشكلات أجهزتك"
TAGLINE_AR_ADMIN = "مستشارون إداريون — حلول مخصصة لاحتياجاتك الرسمية"
TAGLINE_AR_EDU = "معلمين مؤهلين — تقدم أكاديمي مضمون مع متابعة شخصية"
TAGLINE_AR_PHOTO = "مصورون محترفون — لحظات ثمينة بجودة احترافية"
TAGLINE_AR_MOVE = "نقل اثاث محترف — انتقال سلس وآمن لممتلكاتك"

BASE_STYLE = (
    "Ultra-high-quality photorealistic marketing / advertising still, cinematic "
    "lighting, warm sunset accents, deep navy/amber brand palette. The composition "
    "MUST include: (a) a modern smartphone floating in mid-air, rendered in a stylish "
    "3D isometric view with a soft drop-shadow, showing the khedmaPro app's home "
    "screen with a list of service categories (plumbing, electrical, cleaning, "
    "painting, carpentry) and a bright amber CTA button labelled in the ad's language; "
    "(b) subtle iconography hinting at those trades (wrench, wire, spray bottle, brush, hammer, "
    "laptop, briefcase, school, camera, truck, etc.) tastefully arranged around the phone; "
    "(c) large brand wordmark text that reads "
    "'khedmaPro' in a clean sans-serif type — spelled EXACTLY as provided, no "
    "misspellings, brand ALWAYS in Latin letters even when the tagline is in Arabic. "
    "IMPORTANT: NEVER render meta phrases like 'Brand name TEXT OVERLAY', 'TAGLINE', "
    "'CTA', 'ASPECT', 'CONTEXT' or any other prompt-instruction words as visible text "
    "on the image. Only render the exact brand name and the exact tagline provided below. "
    "No English text anywhere in the image (except the brand wordmark). "
    "No fake logos, no watermarks, no lorem-ipsum. Text must be crisp and legible."
)

# Define all categories from reference_data.py
CATEGORIES = [
    {"id": "plumbing", "name": "Plumbing", "icon": "water"},
    {"id": "electrical", "name": "Electrical", "icon": "flash"},
    {"id": "cleaning", "name": "Cleaning", "icon": "sparkles"},
    {"id": "carpentry", "name": "Carpentry", "icon": "hammer"},
    {"id": "painting", "name": "Painting", "icon": "brush"},
    {"id": "landscaping", "name": "Landscaping", "icon": "leaf"},
    {"id": "it_support", "name": "IT Support", "icon": "laptop"},
    {"id": "admin_consulting", "name": "Administrative Consultants", "icon": "briefcase"},
    {"id": "education", "name": "Education (Private Tutoring)", "icon": "school"},
    {"id": "photography", "name": "Photography", "icon": "camera"},
    {"id": "moving", "name": "Moving", "icon": "cube"},
]

# Each entry: (filename, aspect_ratio_hint, extra_direction)
ADS = [
    # ========== HERO/GENERAL ADS ==========
    # French Hero Ads (2 variations)
    (
        "hero_portrait_4x5_fr_v1.png",
        "portrait 4:5 (1080x1350), Facebook & Instagram feed hero",
        f"Wide vista of an Algerian city (Algiers/Oran cityscape at golden hour). "
        f"Brand text (render as-is): '{BRAND}' large centered top. French tagline below (render as-is): '{TAGLINE_FR_MAIN}'. "
        "Absolutely no other language on the image.",
    ),
    (
        "hero_portrait_4x5_fr_v2.png",
        "portrait 4:5 (1080x1350), Facebook & Instagram feed hero",
        f"Close-up of diverse Algerian service professionals smiling confidently. "
        f"Brand text (render as-is): '{BRAND}' large centered top. French tagline below (render as-is): '{TAGLINE_FR_MAIN_V2}'. "
        "Absolutely no other language on the image.",
    ),
    # Arabic Hero Ads (2 variations)
    (
        "hero_portrait_4x5_ar_v1.png",
        "portrait 4:5 (1080x1350), Facebook & Instagram feed hero, Arabic-first",
        f"Same Algerian city vista at golden hour. "
        f"Brand text (render as-is): '{BRAND}' large top (Latin letters). Arabic tagline below right-to-left (render as-is): "
        f"'{TAGLINE_AR_HERO}'. Absolutely no French or English text — only Arabic.",
    ),
    (
        "hero_portrait_4x5_ar_v2.png",
        "portrait 4:5 (1080x1350), Facebook & Instagram feed hero, Arabic-first",
        f"Group of diverse Algerian professionals in traditional and modern attire. "
        f"Brand text (render as-is): '{BRAND}' large top (Latin letters). Arabic tagline below right-to-left (render as-is): "
        f"'{TAGLINE_AR_MAIN_V2}'. Absolutely no French or English text — only Arabic.",
    ),

    # ========== SQUARE 1:1 ADS ==========
    # French Generic Square
    (
        "square_1x1_fr.png",
        "square 1:1 (1080x1080), Instagram feed",
        f"Tighter composition, three service pros (a plumber, a cleaner, an electrician) smiling "
        f"in the background, phone in foreground showing the app UI. "
        f"Brand name (render as-is): '{BRAND}'. French tagline (render as-is): '{TAGLINE_FR_MAIN}'. No English.",
    ),
    # Arabic Generic Square
    (
        "square_1x1_ar.png",
        "square 1:1, Instagram, Arabic-first",
        f"Same 3-pros composition but Arabic tagline. "
        f"Brand name '{BRAND}' stays in Latin. Arabic tagline right-to-left (render as-is): '{TAGLINE_AR_MAIN}'. "
        f"Include a small Algerian flag icon in one corner.",
    ),

    # ========== VERTICAL 9:16 ADS ==========
    # French TikTok/Reels
    (
        "vertical_9x16_tiktok_fr.png",
        "vertical 9:16 (1080x1920), TikTok / Reels story",
        f"Vertical stack layout: Brand name '{BRAND}' huge at top, phone in middle showing app, "
        f"three tiny 3D icons at bottom (wrench/spray/paint). "
        f"French tagline at bottom (render as-is): '{TAGLINE_FR_MAIN}'. "
        f"Leave clear top and bottom safe zones for TikTok UI overlays. No English.",
    ),
    # Arabic TikTok/Reels
    (
        "vertical_9x16_tiktok_ar.png",
        "vertical 9x16, TikTok / Reels story, Arabic-first",
        f"Same vertical stack but Arabic tagline right-to-left (render as-is): '{TAGLINE_AR_MAIN}'. "
        f"Brand name '{BRAND}' in Latin. Absolutely no French or English.",
    ),

    # ========== CATEGORY-SPECIFIC ADS ==========
    # Generate for each category: plumbing, electrical, cleaning, carpentry, painting, landscaping,
    # it_support, admin_consulting, education, photography, moving
    # Each category gets: FR + AR × 3 formats (4x5 portrait, 1x1 square, 9x16 vertical) = 6 ads per category
]

# Generate category-specific ads for all categories in both languages and all formats
category_ads = []
for category in CATEGORIES:
    cat_id = category["id"]
    cat_name = category["name"]

    # Get French and Arabic taglines for this category
    fr_tagline = globals().get(f"TAGLINE_FR_{cat_id.upper()}", f"Service {cat_name} de qualité via khedmaPro")
    ar_tagline = globals().get(f"TAGLINE_AR_{cat_id.upper()}", f"خدمة {cat_name} محترفة عبر تطبيق khedmaPro")

    # French ads - 3 formats
    category_ads.extend([
        (
            f"hero_portrait_4x5_fr_{cat_id}.png",
            "portrait 4:5 (1080x1350), Facebook & Instagram feed hero",
            f"Algerian professional {cat_name.lower()} at work in authentic setting. "
            f"Brand text (render as-is): '{BRAND}' large centered top. French tagline below (render as-is): '{fr_tagline}'. "
            f"Show appropriate tools/icons for {cat_name.lower()} trade. Absolutely no other language on the image.",
        ),
        (
            f"square_1x1_fr_{cat_id}.png",
            "square 1:1 (1080x1080), Instagram feed",
            f"Focused shot of Algerian {cat_name.lower()} professional demonstrating expertise. "
            f"Phone with khedmaPro app visible. Brand name (render as-is): '{BRAND}'. "
            f"French tagline (render as-is): '{fr_tagline}'. Include relevant {cat_name.lower()} tools/iconography. No English.",
        ),
        (
            f"vertical_9x16_tiktok_fr_{cat_id}.png",
            "vertical 9:16 (1080x1920), TikTok / Reels story",
            f"Vertical composition: Brand '{BRAND}' at top, Algerian {cat_name.lower()} pro working in middle, "
            f"app UI and relevant icons at bottom. French tagline at bottom (render as-is): '{fr_tagline}'. "
            f"Leave clear top/bottom safe zones for TikTok overlays. No English.",
        )
    ])

    # Arabic ads - 3 formats
    category_ads.extend([
        (
            f"hero_portrait_4x5_ar_{cat_id}.png",
            "portrait 4:5 (1080x1350), Facebook & Instagram feed hero, Arabic-first",
            f"Algerian professional {cat_name.lower()} at work in authentic setting. "
            f"Brand text (render as-is): '{BRAND}' large top (Latin letters). Arabic tagline below right-to-left (render as-is): "
            f"'{ar_tagline}'. Show appropriate tools/icons for {cat_name.lower()} trade. Absolutely no French or English.",
        ),
        (
            f"square_1x1_ar_{cat_id}.png",
            "square 1:1 (1080x1080), Instagram, Arabic-first",
            f"Focused shot of Algerian {cat_name.lower()} professional demonstrating expertise. "
            f"Phone with khedmaPro app visible. Brand name '{BRAND}' stays in Latin. Arabic tagline right-to-left (render as-is): '{ar_tagline}'. "
            f"Include relevant {cat_name.lower()} tools/iconography and small Algerian flag. No English or French.",
        ),
        (
            f"vertical_9x16_tiktok_ar_{cat_id}.png",
            "vertical 9x16, TikTok / Reels story, Arabic-first",
            f"Vertical composition: Brand '{BRAND}' at top, Algerian {cat_name.lower()} pro working in middle, "
            f"app UI and relevant icons at bottom. Arabic tagline right-to-left at bottom (render as-is): '{ar_tagline}'. "
            f"Leave clear top/bottom safe zones for TikTok overlays. Absolutely no French or English.",
        )
    ])

# Add all category-specific ads to the main ADS list
ADS.extend(category_ads)


async def _generate(idx: int, filename: str, ratio: str, extra: str) -> None:
    print(f"[{idx+1}/{len(ADS)}] → {filename}  ({ratio})")
    prompt = f"{BASE_STYLE}\n\nASPECT / CONTEXT: {ratio}.\n{extra}"
    session = f"khedmapro-ad-{filename}-{int(time.time())}"
    chat = LlmChat(api_key=API_KEY, session_id=session, system_message="You are a world-class advertising art director.")
    chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
    msg = UserMessage(text=prompt)
    try:
        text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f"  ! generation failed: {e}", file=sys.stderr)
        return
    if not images:
        print(f"  ! no image returned. text={text[:120]!r}", file=sys.stderr)
        return
    img = images[0]
    data = base64.b64decode(img["data"])
    out_path = OUT_DIR / filename
    with open(out_path, "wb") as f:
        f.write(data)
    # Mirror to the static-served directory so admins can consume the URL.
    try:
        shutil.copy2(out_path, MIRROR_DIR / filename)
    except Exception as e:
        print(f"  ! mirror copy failed: {e}", file=sys.stderr)
    kb = len(data) // 1024
    print(f"  ✓ saved {out_path} ({kb} KB)")


async def main() -> None:
    if not API_KEY:
        print("EMERGENT_LLM_KEY missing from env", file=sys.stderr)
        sys.exit(1)
    print(f"Model: {MODEL}. Output dir: {OUT_DIR}. Ads to generate: {len(ADS)}")
    print(f"Breakdown: {len([a for a in ADS if 'hero' in a[0]])} hero ads, {len([a for a in ADS if any(cat['id'] in a[0] for cat in CATEGORIES)])} category ads")
    # Clear old ads so nothing stale lingers.
    for stale in list(OUT_DIR.glob("*.png")) + list(MIRROR_DIR.glob("*.png")):
        try:
            stale.unlink()
        except Exception:
            pass
    for i, (fname, ratio, extra) in enumerate(ADS):
        await _generate(i, fname, ratio, extra)
    print(f"\nAll done. Generated {len(ADS)} ads.")


if __name__ == "__main__":
    asyncio.run(main())