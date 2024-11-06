#!/bin/bash

# Step 1: Pack the npm package
PACKAGE_FILE=$(npm pack)
echo "Packed file: $PACKAGE_FILE"

# Step 2: Define the target directory and move the .tgz file there
TARGET_DIR="../../../testing/sdk-test-with-nuxt"

mv "$PACKAGE_FILE" "$TARGET_DIR/"
echo "Moved $PACKAGE_FILE to $TARGET_DIR"

# Step 3: Uninstall the previously installed package
cd "$TARGET_DIR"
PACKAGE_NAME="@contentstack/delivery-sdk" # replace with the actual package name
npm uninstall "$PACKAGE_NAME"
echo "Uninstalled $PACKAGE_NAME"

# Step 4: Install the new package from the .tgz file
npm install "$PACKAGE_FILE"
echo "Installed $PACKAGE_NAME from $PACKAGE_FILE"
