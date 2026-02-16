#!/bin/bash
set -euo pipefail

# Define variables
APP_NAME="Digi IoT Application Framework"
BUILD_DIR="build_output"
ZIP_FILE="digi_iot_application_framework.zip"
LOG_FILE="build.log"

# Clear previous log.
rm -f "${LOG_FILE}"

# Start logging to file
exec > >(tee -i "${LOG_FILE}") 2>&1

echo "Starting '${APP_NAME}' build process:"
echo ""

# Clean up any previous build directories or files
echo -n " - Cleaning up previous build files... "
rm -rf .next node_modules "${BUILD_DIR}" "${ZIP_FILE}"
echo "OK"

# Create a build directory
echo -n " - Preparing build directory... "
mkdir -p "${BUILD_DIR}" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

# Install all dependencies
echo -n " - Installing dependencies (full)... "
if ! npm ci --legacy-peer-deps > /dev/null 2>&1; then
    if ! npm install --legacy-peer-deps > /dev/null 2>&1; then
        echo "ERROR"
        exit 1
    fi
fi
echo "OK"

# Build the Next.js application
echo -n " - Building the Next.js application... "
npm run build > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

# Copy necessary files and directories to the build directory
echo -n " - Copying standalone runtime... "
mkdir -p "${BUILD_DIR}/.next" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp -r .next/standalone "${BUILD_DIR}/.next/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp -r .next/static "${BUILD_DIR}/.next/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
[ -d public ] && cp -r public "${BUILD_DIR}/" || true
[ -d data ] && cp -r data "${BUILD_DIR}/" || true
# Also copy data into standalone folder so process.cwd() works correctly
[ -d data ] && cp -r data "${BUILD_DIR}/.next/standalone/" || true
cp package.json "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

# Package the build directory into a zip file
echo -n " - Creating zip package... "
cd "${BUILD_DIR}"
zip -r "${ZIP_FILE}" . > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

echo ""
echo "Application build finished!"

