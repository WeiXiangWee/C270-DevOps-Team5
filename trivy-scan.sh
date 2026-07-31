#!/bin/bash
set -e

# ============================================================
# Trivy vulnerability scan script
# Usage: ./trivy-scan.sh <image-name> [severity] [exit-on-fail]
#   image-name    - required, the Docker image to scan
#   severity      - optional, default "HIGH,CRITICAL"
#   exit-on-fail  - optional, "true" or "false" (default "false")
# ============================================================

IMAGE_NAME=$1
SEVERITY=${2:-"HIGH,CRITICAL"}
EXIT_ON_FAIL=${3:-"false"}
REPORT_FILE="trivy-report.txt"

if [ -z "$IMAGE_NAME" ]; then
    echo "Error: no image name provided."
    echo "Usage: ./trivy-scan.sh <image-name> [severity] [exit-on-fail]"
    exit 1
fi

echo "=================================================="
echo "Scanning image: $IMAGE_NAME"
echo "Severity filter: $SEVERITY"
echo "Fail build on findings: $EXIT_ON_FAIL"
echo "=================================================="

# Decide whether Trivy itself should exit non-zero on findings
if [ "$EXIT_ON_FAIL" = "true" ]; then
    TRIVY_EXIT_CODE=1
else
    TRIVY_EXIT_CODE=0
fi

docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v trivy-cache:/root/.cache/ \
    aquasec/trivy image \
    --severity "$SEVERITY" \
    --exit-code "$TRIVY_EXIT_CODE" \
    --format table \
    --output "$REPORT_FILE" \
    "$IMAGE_NAME"

SCAN_RESULT=$?

echo "--- Scan report ---"
cat "$REPORT_FILE"
echo "--------------------"

if [ $SCAN_RESULT -ne 0 ]; then
    echo "Trivy found $SEVERITY vulnerabilities. Failing build."
    exit 1
fi

echo "Trivy scan completed. No vulnerabilities found."
exit 0
