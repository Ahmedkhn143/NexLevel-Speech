# 🧪 NexLevel Speech API Test Script (PowerShell)
# Tests all major endpoints

$API_URL = "http://localhost:3001/api"
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "Test123456"

Write-Host "🧪 Testing NexLevel Speech API" -ForegroundColor Cyan
Write-Host "API URL: $API_URL" -ForegroundColor Cyan
Write-Host ""

# Test Demo Endpoint (No Auth Required)
Write-Host "1. Testing Demo TTS (No Auth)" -ForegroundColor Yellow

try {
    $demoResponse = Invoke-WebRequest -Uri "$API_URL/demo/generate" `
        -Method POST `
        -ContentType "application/json" `
        -Body @{
            text = "Experience the next generation of AI voice cloning"
            voiceId = "sarah"
            lang = "en"
        } | ConvertTo-Json

    Write-Host "✅ Demo TTS works (got response)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Demo TTS failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Signup
Write-Host "2. Testing Signup" -ForegroundColor Yellow

try {
    $timestamp = Get-Date -UFormat %s
    $signupResponse = Invoke-WebRequest -Uri "$API_URL/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = "testuser_$timestamp@example.com"
            password = "Test123456"
            name = "Test User"
        } | ConvertTo-Json)
    
    $signupData = $signupResponse.Content | ConvertFrom-Json
    
    if ($signupData.accessToken) {
        Write-Host "✅ Signup works" -ForegroundColor Green
        $script:ACCESS_TOKEN = $signupData.accessToken
    }
}
catch {
    Write-Host "❌ Signup failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Login
Write-Host "3. Testing Login" -ForegroundColor Yellow

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $TEST_EMAIL
            password = $TEST_PASSWORD
        } | ConvertTo-Json)
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.accessToken) {
        Write-Host "✅ Login works" -ForegroundColor Green
        $script:ACCESS_TOKEN = $loginData.accessToken
        Write-Host "Token: $($script:ACCESS_TOKEN.Substring(0, 20))..." -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    Write-Host "Make sure test user exists. Run: npx ts-node prisma/seed.ts" -ForegroundColor Yellow
}
Write-Host ""

# Test Get Profile (requires auth)
if ($script:ACCESS_TOKEN) {
    Write-Host "4. Testing Get Profile (With Auth)" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Authorization" = "Bearer $script:ACCESS_TOKEN"
        }
        
        $profileResponse = Invoke-WebRequest -Uri "$API_URL/auth/me" `
            -Method GET `
            -Headers $headers
        
        $profileData = $profileResponse.Content | ConvertFrom-Json
        
        if ($profileData.email) {
            Write-Host "✅ Get Profile works" -ForegroundColor Green
            Write-Host "User: $($profileData.email)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Get Profile failed: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "⚠️  Skipping authenticated tests (no token)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 API Tests Complete!" -ForegroundColor Green
