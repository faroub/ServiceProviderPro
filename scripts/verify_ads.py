#!/usr/bin/env python3
"""Verification script to check ad generation coverage."""
import os
from pathlib import Path

# Categories from reference_data.py
CATEGORIES = [
    "plumbing", "electrical", "cleaning", "carpentry", "painting",
    "landscaping", "it_support", "admin_consulting", "education",
    "photography", "moving"
]

FORMATS = ["hero_portrait_4x5", "square_1x1", "vertical_9x16_tiktok"]
LANGUAGES = ["fr", "ar"]

def check_existing_ads():
    """Check what ads currently exist."""
    ads_dir = Path("./generated_ads")  # Relative to current directory
    if not ads_dir.exists():
        return set()

    existing = set(f.name for f in ads_dir.glob("*.png"))
    return existing

def calculate_required_ads():
    """Calculate what ads should exist for complete coverage."""
    required = set()

    # Hero/general ads: 2 languages x 2 variations each
    for lang in LANGUAGES:
        for v in [1, 2]:
            required.add(f"hero_portrait_4x5_{lang}_v{v}.png")

    # Generic ads: 1 each format x language
    for fmt in FORMATS:
        for lang in LANGUAGES:
            required.add(f"{fmt}_{lang}.png")

    # Category-specific ads: 11 categories x 2 languages x 3 formats
    for cat in CATEGORIES:
        for lang in LANGUAGES:
            for fmt in FORMATS:
                required.add(f"{fmt}_{lang}_{cat}.png")

    return required

def main():
    existing = check_existing_ads()
    required = calculate_required_ads()

    print(f"Existing ads: {len(existing)}")
    print(f"Required ads: {len(required)}")
    print(f"Missing ads: {len(required - existing)}")
    print(f"Extra ads: {len(existing - required)}")

    if required - existing:
        print("\nMissing ads:")
        for ad in sorted(required - existing):
            print(f"  - {ad}")

    if existing - required:
        print("\nExtra ads (may be obsolete):")
        for ad in sorted(existing - required):
            print(f"  - {ad}")

    print(f"\nCoverage: {len(existing & required)}/{len(required)} ({100*len(existing & required)/len(required):.1f}%)")

if __name__ == "__main__":
    main()