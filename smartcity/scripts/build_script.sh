#!/bin/bash

# Define variables
APP_NAME="IoT Fleet Management Demo"
BUILD_DIR="build_output"
ZIP_FILE="iot_fleet_management_demo.zip"
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

# Install production dependencies
echo -n " - Installing dependencies... "
npm install --omit=dev --legacy-peer-deps > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

# Build the Next.js application
echo -n " - Building the Next.js application... "
npm run build > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

# Copy necessary files and directories to the build directory
echo -n " - Copying files... "
cp -r .next "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp -r public "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp -r node_modules "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp -r data "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp package.json "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp package-lock.json "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp next.config.mjs "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
cp .env "${BUILD_DIR}/" > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

# Package the build directory into a zip file
echo -n " - Creating zip package... "
cd "${BUILD_DIR}"
zip -r "${ZIP_FILE}" . > /dev/null 2>&1 || { echo "ERROR"; exit 1; }
echo "OK"

echo ""
echo "Application build finished!"

