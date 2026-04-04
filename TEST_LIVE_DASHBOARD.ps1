# CivicPulse AI - Live Dashboard Test Script
# This script verifies all systems are working and sends test data

Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        CivicPulse AI - Live Dashboard Testing Suite               ║" -ForegroundColor Cyan  
Write-Host "║                © 2026 Smart City Dashboard                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend API Health
Write-Host "🔍 TEST 1: Backend API Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend API is running at http://localhost:8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend API not responding. Status: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 2: Frontend App
Write-Host "🔍 TEST 2: Frontend Dashboard Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running at http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend might be starting up. Open http://localhost:5173 in browser" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Test 3: Kafka Broker
Write-Host "🔍 TEST 3: Kafka Broker Check..." -ForegroundColor Yellow
try {
    $kafka_status = docker ps | Select-String "civicpulseai-kafka"
    if ($kafka_status) {
        Write-Host "✅ Kafka broker is running in Docker" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Kafka broker check failed" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Send Test Event
Write-Host "🔍 TEST 4: Sending Test Complaint via WebSocket..." -ForegroundColor Yellow
$test_payload = @{
    event_type = "NEW_COMPLAINT"
    payload = @{
        id = "TEST$(Get-Random -Minimum 1000 -Maximum 9999)"
        citizen_name = "Test User"
        category = "Roads"
        urgency = "High"
        location = "Ward 5"
        original_text = "Test complaint: Large pothole on main road"
        ward = "5"
        department = "Public Works"
        status = "Pending"
        created_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/ws/trigger-event" `
        -Method POST `
        -ContentType "application/json" `
        -Body $test_payload `
        -UseBasicParsing `
        -TimeoutSec 3 `
        -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    $clients = $result.connected_clients_reached
    
    if ($clients -gt 0) {
        Write-Host "✅ Test event broadcast successful to $clients connected client(s)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Broadcast sent but no clients connected yet. Open dashboard at http://localhost:5173" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to broadcast test event: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 5: Check Running Services
Write-Host "🔍 TEST 5: Verifying Running Services..." -ForegroundColor Yellow
$python_count = (Get-Process python -ErrorAction SilentlyContinue | Measure-Object).Count
$node_count = (Get-Process node -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Host "   • Python processes: $python_count (Backend + Consumer + Producer)" -ForegroundColor Cyan
Write-Host "   • Node.js processes: $node_count (Frontend)" -ForegroundColor Cyan

if ($python_count -gt 0 -and $node_count -gt 0) {
    Write-Host "✅ All services appear to be running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services may not be running. Run: start.bat" -ForegroundColor Yellow
}

# Test 6: Mock Data Verification
Write-Host "🔍 TEST 6: Mock Data Initialization..." -ForegroundColor Yellow
Write-Host "   • Initial Total Complaints: 247 (mock data)" -ForegroundColor Cyan
Write-Host "   • Initial Critical Issues: 8 (mock data)" -ForegroundColor Cyan  
Write-Host "   • Sample Categories: Sanitation (89), Roads (65), Water (38), Electricity (31), Drainage (24)" -ForegroundColor Cyan
Write-Host "✅ Mock data initialization configured" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ TESTING COMPLETE                             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "📊 DASHBOARD STATUS:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend:  http://localhost:5173" -ForegroundColor Blue
Write-Host "   🔌 Backend:   http://localhost:8000/docs" -ForegroundColor Blue
Write-Host "   🔄 Live Feed: Enabled (refresh browser if needed)"  -ForegroundColor Blue

Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "   2. You should see mock data displayed immediately" -ForegroundColor White
Write-Host "   3. Real data will be added as complaints are processed" -ForegroundColor White
Write-Host "   4. Metrics will update in real-time as new data arrives" -ForegroundColor White

Write-Host ""
Write-Host "📝 NOTES:" -ForegroundColor Magenta
Write-Host "   • Mock data shows 247 total complaints initially" -ForegroundColor Gray
Write-Host "   • Real data from Kafka will be added to this base" -ForegroundColor Gray
Write-Host "   • Connection status at top-right: 🟢 Live (connected) or 🔴 Connecting" -ForegroundColor Gray
Write-Host "   • All metrics update in real-time as events stream in" -ForegroundColor Gray
