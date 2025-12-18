#!/bin/bash

# Check if --dry-run flag is passed
SCRIPT_DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    SCRIPT_DRY_RUN=true
    echo "🧪 Running script in dry-run mode (no actual submission)"
fi

# Extract version from package.json
VERSION=$(grep '"version":' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')

echo "📦 Starting submission process for version $VERSION"

# Check for old zip files to cleanup (always show, only delete in non-dry-run)
echo "🧹 Checking for old zip files (keeping last 3 versions)..."
if [ -d ".output" ]; then
    cleanup_happened=false
    # Find all clean-twitch zip files, sort by modification time, keep only the newest 3 of each type
    for pattern in "*-chrome.zip" "*-firefox.zip" "*-sources.zip" "*-edge.zip"; do
        files_to_delete=$(ls -t .output/clean-twitch-*-${pattern#*-} 2>/dev/null | tail -n +4)
        if [ -n "$files_to_delete" ]; then
            if [ "$SCRIPT_DRY_RUN" = true ]; then
                echo "  Would delete old ${pattern#*-} files:"
            else
                echo "  Deleting old ${pattern#*-} files:"
            fi
            echo "$files_to_delete" | sed 's/^/    /'
            if [ "$SCRIPT_DRY_RUN" = false ]; then
                echo "$files_to_delete" | xargs rm -f
            fi
            cleanup_happened=true
        fi
    done
    if [ "$cleanup_happened" = true ]; then
        if [ "$SCRIPT_DRY_RUN" = true ]; then
            echo "✅ Cleanup check completed (dry-run mode)"
        else
            echo "✅ Cleanup completed"
        fi
    else
        echo "✅ No old files to clean up"
    fi
fi

# Step 1: Run zip command from package.json
echo "🔨 Building zip packages..."
if ! pnpm wxt zip && wxt zip -b firefox && wxt zip -b edge; then
    echo "❌ Zip build failed!"
    exit 1
fi

echo "✅ Zip packages built successfully"

# Step 2: Run dry-run submission
echo "🧪 Running dry-run submission..."
DRY_RUN_CMD="pnpm wxt submit --dry-run --chrome-zip .output/clean-twitch-$VERSION-chrome.zip --firefox-zip .output/clean-twitch-$VERSION-firefox.zip --firefox-sources-zip .output/clean-twitch-$VERSION-sources.zip --edge-zip .output/clean-twitch-$VERSION-edge.zip"

echo "Running: $DRY_RUN_CMD"
if ! eval "$DRY_RUN_CMD"; then
    echo ""
    echo "❌ Dry-run failed! Please fix the issues above and run manually:"
    echo "$DRY_RUN_CMD"
    exit 1
fi

echo "✅ Dry-run successful!"

# Step 3: Run actual submission (skip if script dry-run)
if [ "$SCRIPT_DRY_RUN" = true ]; then
    echo "⏭️  Skipping actual submission (script dry-run mode)"
    echo "🎉 Script dry-run completed successfully!"
    echo ""
    echo "To run actual submission, run: ./submit.sh"
else
    echo "🚀 Running actual submission..."
    SUBMIT_CMD="pnpm wxt submit --chrome-zip .output/clean-twitch-$VERSION-chrome.zip --firefox-zip .output/clean-twitch-$VERSION-firefox.zip --firefox-sources-zip .output/clean-twitch-$VERSION-sources.zip --edge-zip .output/clean-twitch-$VERSION-edge.zip"

    echo "Running: $SUBMIT_CMD"
    if ! eval "$SUBMIT_CMD"; then
        echo ""
        echo "❌ Submission failed! Please check the error above and run manually:"
        echo "$SUBMIT_CMD"
        exit 1
    fi

    echo "🎉 Submission completed successfully!"
fi