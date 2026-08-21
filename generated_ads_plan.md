# Comprehensive Ad Generation Plan for ServiceProviderPro

## Current State Analysis
Existing ads in `/app/generated_ads/`:
1. `hero_portrait_4x5_fr.png` - French hero 4:5 portrait
2. `hero_portrait_4x5_ar.png` - Arabic hero 4:5 portrait  
3. `square_1x1_fr.png` - French generic 1:1 square
4. `square_1x1_ar.png` - Arabic generic 1:1 square
5. `vertical_9x16_tiktok_fr.png` - French TikTok 9:16 vertical
6. `vertical_9x16_tiktok_ar.png` - Arabic TikTok 9:16 vertical
7. `cat_plumbing_fr.png` - French plumbing category 1:1 square
8. `cat_cleaning_ar.png` - Arabic cleaning category 9:16 vertical

## Identified Gaps
From workflow analysis:
- Missing electrical, painting, and carpentry category ads in ANY language or format
- Missing French-language cleaning ads (TAGLINE_FR_CLEAN defined but unused)
- Missing Arabic-language plumbing ads (no Arabic plumbing tagline defined)
- French plumbing ads only in square 1:1 format (missing portrait 4:5 and vertical 9:16)
- Arabic cleaning ads only in vertical 9:16 format (missing portrait 4:5 and square 1:1)

## Complete Coverage Requirements
Based on reference data, we have 11 service categories:
1. plumbing
2. electrical
3. cleaning
4. carpentry
5. painting
6. landscaping
7. it_support
8. admin_consulting
9. education
10. photography
11. moving

For complete coverage, we need:
- **Hero/General Ads**: 2 languages × 2 variations each = 4 ads
- **Category-Specific Ads**: 11 categories × 2 languages × 3 formats = 66 ads
- **TOTAL**: 70 ads needed

## Taglines Needed
### Existing Taglines (French):
- TAGLINE_FR_MAIN = "Des pros de confiance, en un click"
- TAGLINE_FR_PLUMB = "Des plombiers de confiance — réservez en quelques secondes"
- TAGLINE_FR_ELEC = "Des électriciens certifiés — même jour"
- TAGLINE_FR_CLEAN = "Un ménage impeccable, à la demande"

### Existing Taglines (Arabic):
- TAGLINE_AR_MAIN = "محترفون موثوقون بضغطة واحدة"
- TAGLINE_AR_CLEAN = "منظّفون بضغطة — نظافة فورية"
- TAGLINE_AR_HERO = "احجز محترفاً موثوقاً في ثوانٍ"

### Missing Taglines to Translate:
**French needed for categories:**
- Carpentry: "Des menuisiers de qualité — travail soigné"
- Painting: "Des peintres professionnels — fini parfait"
- Landscaping: "Des jardiniers experts — espaces verts magnifiques"
- IT Support: "Support informatique rapide — résolution efficace"
- Admin Consulting: "Consultants administratifs — solutions sur mesure"
- Education: "Cours particuliers qualifiés — progrès garantis"
- Photography: "Photographes professionnels — souvenirs immortels"
- Moving: "Déménageurs pros — transfert sans stress"

**Arabic needed for categories:**
- Plumbing: Need Arabic equivalent for plumbing tagline
- Electrical: Arabic equivalent of "Des électriciens certifiés — même jour"
- Carpentry: Arabic equivalent
- Painting: Arabic equivalent
- Landscaping: Arabic equivalent
- IT Support: Arabic equivalent
- Admin Consulting: Arabic equivalent
- Education: Arabic equivalent
- Photography: Arabic equivalent
- Moving: Arabic equivalent

## Format Specifications
Following the BASE_STYLE from gen_ads.py:
- Ultra-high-quality photorealistic marketing/advertising still
- Cinematic lighting, warm sunset accents, deep navy/amber brand palette
- MUST include: smartphone floating in mid-air (3D isometric view) showing khedmaPro app home screen
- Subtle iconography hinting at trades arranged around phone
- Brand wordmark "khedmaPro" in clean sans-serif, ALWAYS in Latin letters
- NO English text anywhere except brand wordmark
- NO fake logos, watermarks, or lorem-ipsum

### Specific Formats:
1. **4x5 Portrait** (1080x1350): Facebook & Instagram feed hero
2. **1x1 Square** (1080x1080): Instagram feed
3. **9x16 Vertical** (1080x1920): TikTok / Reels story

## Naming Convention
`{category_or_hero}_{format}_{language}.png`
Examples:
- `hero_portrait_4x5_fr_v2.png` (second hero variation)
- `square_1x1_fr_plumbing.png`
- `vertical_9x16_tiktok_ar_electrical.png`

## Implementation Plan
1. Update gen_ads.py with complete ADS array covering all 70 required ads
2. Add missing tagline translations for all categories in both languages
3. Run the generation script to produce all ads
4. Verify output meets quality standards