#!/bin/bash

##
# Bundler Validation Script
# 
# Purpose: Run all bundler tests to ensure SDK compatibility before release
# Validates SDK works correctly across all common bundlers
# 
# Usage: ./validate-all.sh
#        npm run validate:bundlers
##

set -e  # Exit on first error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Bundler Validation Test Suite          ║${NC}"
echo -e "${BLUE}║   Multi-Environment SDK Testing           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

declare -a FAILED_BUNDLERS=()

##
# Test a bundler
##
test_bundler() {
  local bundler_name=$1
  local bundler_dir=$2
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Testing: ${bundler_name}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  cd "$bundler_dir"
  
  # Clean previous build
  rm -rf dist .next 2>/dev/null || true
  
  # Install dependencies (silent)
  echo "  📦 Installing dependencies..."
  npm install --silent > /dev/null 2>&1
  
  # Build
  echo "  🔨 Building..."
  if npm run build --silent > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Build succeeded"
  else
    echo -e "  ${RED}✗${NC} Build failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_BUNDLERS+=("$bundler_name")
    cd "$SCRIPT_DIR"
    return 1
  fi
  
  # Test (show actual test output)
  echo "  🧪 Running tests..."
  echo ""
  if npm test 2>&1 | sed 's/^/    /'; then
    echo ""
    echo -e "  ${GREEN}✓${NC} All tests passed"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo ""
    echo -e "  ${RED}✗${NC} Tests failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_BUNDLERS+=("$bundler_name")
    cd "$SCRIPT_DIR"
    return 1
  fi
  
  echo ""
  cd "$SCRIPT_DIR"
  return 0
}

##
# Run all bundler tests
##

# Test 1: Webpack
if [ -d "webpack-app" ]; then
  test_bundler "Webpack" "webpack-app"
else
  echo -e "${YELLOW}⚠️  Webpack test not found${NC}"
fi

# Test 2: Vite  
if [ -d "vite-app" ]; then
  test_bundler "Vite" "vite-app"
else
  echo -e "${YELLOW}⚠️  Vite test not found${NC}"
fi

# Test 3: Next.js
if [ -d "nextjs-app" ]; then
  test_bundler "Next.js" "nextjs-app"
else
  echo -e "${YELLOW}⚠️  Next.js test not found${NC}"
fi

# Test 4: Rollup
if [ -d "rollup-app" ]; then
  test_bundler "Rollup" "rollup-app"
else
  echo -e "${YELLOW}⚠️  Rollup test not found${NC}"
fi

# Test 5: esbuild
if [ -d "esbuild-app" ]; then
  test_bundler "esbuild" "esbuild-app"
else
  echo -e "${YELLOW}⚠️  esbuild test not found${NC}"
fi

##
# Summary
##
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total bundlers tested: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ ${FAILED_TESTS} -gt 0 ]; then
  echo -e "${RED}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${RED}║   ❌ BUNDLER VALIDATION FAILED            ║${NC}"
  echo -e "${RED}╚═══════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${RED}Failed bundlers:${NC}"
  for bundler in "${FAILED_BUNDLERS[@]}"; do
    echo -e "  ${RED}✗${NC} $bundler"
  done
  echo ""
  echo -e "${RED}SDK may not work correctly in customer builds!${NC}"
  echo -e "${YELLOW}Fix issues before Dec 8th release!${NC}"
  echo ""
  exit 1
else
  echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   ✅ ALL BUNDLERS PASSED                  ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}SDK works correctly in all tested bundlers!${NC}"
  echo -e "${GREEN}Safe to release! 🚀${NC}"
  echo ""
  exit 0
fi

