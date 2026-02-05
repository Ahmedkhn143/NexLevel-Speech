#!/bin/bash

# 🧪 NexLevel Speech API Test Script
# Tests all major endpoints

API_URL="http://localhost:3001/api"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Test123456"

echo "🧪 Testing NexLevel Speech API"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Demo Endpoint (No Auth Required)
echo -e "${YELLOW}1. Testing Demo TTS (No Auth)${NC}"
DEMO_RESPONSE=$(curl -s -X POST "$API_URL/demo/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Experience the next generation of AI voice cloning",
    "voiceId": "sarah",
    "lang": "en"
  }')

if echo "$DEMO_RESPONSE" | head -c 4 | grep -q "ID3"; then
  echo -e "${GREEN}✅ Demo TTS works (got audio file)${NC}"
else
  echo -e "${RED}❌ Demo TTS failed${NC}"
  echo "Response: $DEMO_RESPONSE"
fi
echo ""

# Test Signup
echo -e "${YELLOW}2. Testing Signup${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"testuser_$(date +%s)@example.com\",
    \"password\": \"Test123456\",
    \"name\": \"Test User\"
  }")

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✅ Signup works${NC}"
  ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
  echo -e "${RED}❌ Signup failed${NC}"
  echo "Response: $SIGNUP_RESPONSE"
fi
echo ""

# Test Login
echo -e "${YELLOW}3. Testing Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✅ Login works${NC}"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  echo "Token: ${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  echo "Make sure test user exists. Run: npx ts-node prisma/seed.ts"
fi
echo ""

# Test Get Profile (requires auth)
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo -e "${YELLOW}4. Testing Get Profile (With Auth)${NC}"
  PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  if echo "$PROFILE_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✅ Get Profile works${NC}"
    echo "User: $(echo $PROFILE_RESPONSE | grep -o '"email":"[^"]*"' | head -1)"
  else
    echo -e "${RED}❌ Get Profile failed${NC}"
    echo "Response: $PROFILE_RESPONSE"
  fi
else
  echo -e "${RED}⚠️  Skipping authenticated tests (no token)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 API Tests Complete!${NC}"
