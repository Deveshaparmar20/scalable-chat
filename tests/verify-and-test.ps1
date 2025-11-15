Write-Host "===== SCALABLE CHAT - SYSTEM VERIFICATION =====" -ForegroundColor Green
Write-Host ""

Write-Host "STEP 1: Docker Services" -ForegroundColor Yellow
$services = @(3000,3001,3002,3003,27017,6379,5672)
$online = 0

foreach ($port in $services) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $async = $tcp.BeginConnect("localhost", $port, $null, $null)
        if ($async.AsyncWaitHandle.WaitOne(1000, $false) -and $tcp.Connected) {
            Write-Host "  [OK] Port $port" -ForegroundColor Green
            $online = $online + 1
        }
        $tcp.Close()
    } catch {
        Write-Host "  [FAIL] Port $port" -ForegroundColor Red
    }
}

Write-Host "Online: $online/7" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 2: Test Files" -ForegroundColor Yellow
$testPath = "d:\SDE project\scalable-chat\tests"
if (Test-Path "$testPath\artillery-config.yml") { Write-Host "  [OK] artillery-config.yml" -ForegroundColor Green }
if (Test-Path "$testPath\processor.js") { Write-Host "  [OK] processor.js" -ForegroundColor Green }
if (Test-Path "$testPath\package.json") { Write-Host "  [OK] package.json" -ForegroundColor Green }
if (Test-Path "$testPath\node_modules") { Write-Host "  [OK] Dependencies installed" -ForegroundColor Green }

Write-Host ""
Write-Host "===== READY =====" -ForegroundColor Green
Write-Host "Run: cd tests; npm test" -ForegroundColor Yellow
Write-Host ""
