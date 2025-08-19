#!/bin/bash

echo "Creative Checker - Pre-deployment Testing Workflow"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    npm test -- --watchAll=false
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Tests passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Tests failed${NC}"
        return 1
    fi
}

# Function to build
run_build() {
    echo -e "${YELLOW}Building production...${NC}"
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Build successful${NC}"
        return 0
    else
        echo -e "${RED}✗ Build failed${NC}"
        return 1
    fi
}

# Main workflow
echo "1. Installing dependencies..."
npm install

echo ""
echo "2. Running tests..."
run_tests
TEST_RESULT=$?

echo ""
echo "3. Building for production..."
run_build
BUILD_RESULT=$?

echo ""
echo "=================================================="
if [ $TEST_RESULT -eq 0 ] && [ $BUILD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Safe to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Commit your changes: git add . && git commit -m 'Your message'"
    echo "  2. Push to develop: git push origin develop"
    echo "  3. Create PR to main: gh pr create --base main"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix issues before deploying.${NC}"
    exit 1
fi