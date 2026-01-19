#!/bin/bash
##############################################################################
# Run Bundler Tests and Generate JSON Report
# 
# Output: test-results/bundler-results.json
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results"
OUTPUT_FILE="$RESULTS_DIR/bundler-results.json"

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

echo "🧪 Running bundler tests with reporting..."
echo ""

# Initialize results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)
BUNDLERS=()

# Function to run bundler test
run_bundler_test() {
  local bundler=$1
  local bundler_dir="$SCRIPT_DIR/${bundler}-app"
  
  echo "═══════════════════════════════════════════════════════"
  echo "  Testing: $bundler"
  echo "═══════════════════════════════════════════════════════"
  
  local start=$(date +%s)
  local tests=0
  local passed=0
  local failed=0
  local output=""
  
  if [ -d "$bundler_dir" ]; then
    cd "$bundler_dir"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install --silent > /dev/null 2>&1
    
    # Build
    echo "🔨 Building..."
    if npm run build > /dev/null 2>&1; then
      echo "✅ Build succeeded"
      tests=$((tests + 1))
      passed=$((passed + 1))
    else
      echo "❌ Build failed"
      tests=$((tests + 1))
      failed=$((failed + 1))
    fi
    
    # Run tests
    echo "🧪 Running tests..."
    if npm test 2>&1 | tee /tmp/${bundler}-test-output.txt; then
      # Count passing tests from output
      local test_count=$(grep -c "✓" /tmp/${bundler}-test-output.txt || echo "0")
      tests=$((tests + test_count))
      passed=$((passed + test_count))
      echo "✅ Tests passed ($test_count tests)"
    else
      local test_count=$(grep -c "✓\|✗" /tmp/${bundler}-test-output.txt || echo "1")
      local pass_count=$(grep -c "✓" /tmp/${bundler}-test-output.txt || echo "0")
      local fail_count=$((test_count - pass_count))
      tests=$((tests + test_count))
      passed=$((passed + pass_count))
      failed=$((failed + fail_count))
      echo "❌ Tests failed ($pass_count passed, $fail_count failed)"
    fi
    
    output=$(cat /tmp/${bundler}-test-output.txt 2>/dev/null || echo "No output")
  else
    echo "⚠️  Directory not found: $bundler_dir"
    tests=1
    failed=1
    output="Directory not found"
  fi
  
  local end=$(date +%s)
  local duration=$((end - start))
  duration=$((duration * 1000))  # Convert to milliseconds
  
  TOTAL_TESTS=$((TOTAL_TESTS + tests))
  PASSED_TESTS=$((PASSED_TESTS + passed))
  FAILED_TESTS=$((FAILED_TESTS + failed))
  
  # Add to bundlers array
  BUNDLERS+=("{\"bundler\":\"$bundler\",\"total\":$tests,\"passed\":$passed,\"failed\":$failed,\"duration\":$duration,\"success\":$([ $failed -eq 0 ] && echo "true" || echo "false")}")
  
  echo ""
}

# Run all bundler tests
run_bundler_test "webpack"
run_bundler_test "vite"
run_bundler_test "nextjs"
run_bundler_test "rollup"
run_bundler_test "esbuild"

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
TOTAL_DURATION=$((TOTAL_DURATION * 1000))  # Convert to milliseconds

# Generate JSON report
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "total": $TOTAL_TESTS,
  "passed": $PASSED_TESTS,
  "failed": $FAILED_TESTS,
  "duration": $TOTAL_DURATION,
  "success": $([ $FAILED_TESTS -eq 0 ] && echo "true" || echo "false"),
  "bundlers": [
    $(IFS=,; echo "${BUNDLERS[*]}")
  ]
}
EOF

echo "════════════════════════════════════════════════════════════════"
echo "  📊 Bundler Tests Summary"
echo "════════════════════════════════════════════════════════════════"
echo "Total Tests:  $TOTAL_TESTS"
echo "✅ Passed:    $PASSED_TESTS"
echo "❌ Failed:    $FAILED_TESTS"
echo "⏱️  Duration:  $((TOTAL_DURATION / 1000)).$((TOTAL_DURATION % 1000))s"
echo "Status:       $([ $FAILED_TESTS -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILURE")"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Report saved: $OUTPUT_FILE"
echo ""

# Exit with appropriate code
[ $FAILED_TESTS -eq 0 ] && exit 0 || exit 1

