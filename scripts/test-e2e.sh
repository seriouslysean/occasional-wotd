#!/bin/bash

# E2E Testing Script
# This script builds the site and runs Cypress E2E tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Cypress E2E Test Runner${NC}"
echo -e "${GREEN}========================================${NC}"

# Set default SOURCE_DIR if not provided
SOURCE_DIR=${SOURCE_DIR:-demo}

echo -e "\n${YELLOW}Step 1: Building site with SOURCE_DIR=$SOURCE_DIR${NC}"
SOURCE_DIR=$SOURCE_DIR \
SITE_URL=http://localhost:4321 \
SITE_TITLE="Demo Word of the Day" \
SITE_DESCRIPTION="A demo word of the day site" \
SITE_ID=demo-wotd \
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Step 2: Starting preview server${NC}"
npm run preview &
SERVER_PID=$!

# Wait for server to be ready
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 3

# Check if server is running
if ! curl -s http://localhost:4321 > /dev/null; then
  echo -e "${RED}Preview server failed to start!${NC}"
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

echo -e "\n${YELLOW}Step 3: Running Cypress tests${NC}"

# Run Cypress based on argument
if [ "$1" = "open" ]; then
  echo -e "${GREEN}Opening Cypress Test Runner...${NC}"
  npm run test:e2e:open
else
  echo -e "${GREEN}Running tests in headless mode...${NC}"
  npm run test:e2e
fi

CYPRESS_EXIT_CODE=$?

# Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
kill $SERVER_PID 2>/dev/null || true

if [ $CYPRESS_EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo -e "${GREEN}========================================${NC}"
else
  echo -e "\n${RED}========================================${NC}"
  echo -e "${RED}✗ Some tests failed${NC}"
  echo -e "${RED}========================================${NC}"
  exit 1
fi
