#!/bin/bash
# ServiceProviderPro Ad Generation Script
# Run this script to generate all missing marketing ads

echo "🚀 Starting ServiceProviderPro Comprehensive Ad Generation..."
echo "📊 This will generate 70 missing ads for complete market coverage"
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/gen_ads_comprehensive.py" ]; then
    echo "❌ Error: Please run this script from the ServiceProviderPro root directory"
    echo "📍 Current directory: $(pwd)"
    echo "📍 Expected to find: scripts/gen_ads_comprehensive.py"
    exit 1
fi

# Check if emergentintegrations is available
echo "🔍 Checking for required dependencies..."
if python3 -c "import emergentintegrations" 2>/dev/null; then
    echo "✅ emergentintegrations package found"
else
    echo "❌ Error: emergentintegrations package not found"
    echo ""
    echo "🔧 To fix this issue, try one of:"
    echo "   1) pip install --user emergentintegrations"
    echo "   2) Check if available in backend virtual environment"
    echo "   3) Contact system administrator for package installation"
    echo ""
    echo "📋 Once dependency is resolved, re-run this script"
    exit 1
fi

# Ask for confirmation
read -p "🤔 Generate 70 ads? This may take 2-10 minutes. Continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Generation cancelled"
    exit 0
fi

echo ""
echo "⏳ Starting ad generation..."
echo "📱 Generated ads will be saved to:"
echo "   • ./generated_ads/"
echo "   • ./backend/static/ads/ (mirrored for admin access)"
echo ""

# Run the generation script
START_TIME=$(date +%s)
python3 scripts/gen_ads_comprehensive.py
END_TIME=$(date +%s)

echo ""
if [ $? -eq 0 ]; then
    DURATION=$((END_TIME - START_TIME))
    MINUTES=$((DURATION / 60))
    SECONDS=$((DURATION % 60))
    echo "✅ Ad generation completed successfully!"
    echo "⏱️  Time elapsed: ${MINUTES}m${SECONDS}s"
    echo ""
    echo "📊 To verify completion, run:"
    echo "   python3 scripts/verify_ads.py"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Review generated ads in ./generated_ads/"
    echo "   2. Check admin interface at /admin/ads"
    echo "   3. Use ads in marketing campaigns"
else
    echo "❌ Ad generation failed"
    echo "📋 Check error messages above and troubleshoot dependencies"
    exit 1
fi