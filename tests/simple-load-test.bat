@echo off
REM Simple Load Testing Script for Scalable Chat
REM Uses PowerShell for HTTP requests

echo.
echo ================================================
echo Starting Load Test - HTTP Endpoints
echo ================================================
echo.

setlocal enabledelayedexpansion

set "API_URL=http://localhost:3000"
set "ITERATIONS=10"
set "PARALLEL_REQUESTS=5"
set "TOTAL_REQUESTS=0"
set "SUCCESS_COUNT=0"
set "FAILED_COUNT=0"

echo Testing: %API_URL%
echo Iterations: %ITERATIONS%
echo Parallel Requests: %PARALLEL_REQUESTS%
echo.

REM Test 1: Health Check
echo [1/4] Testing Health Endpoints...
for /L %%i in (1,1,%ITERATIONS%) do (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/auth/health' -Method GET -TimeoutSec 5; Write-Host '[OK] Auth Health: ' $response.StatusCode } catch { Write-Host '[FAIL] Auth Health: ' $_.Exception.Message }"
    set /a TOTAL_REQUESTS+=1
)
echo Health checks complete.
echo.

REM Test 2: User Registration
echo [2/4] Testing User Registration...
for /L %%i in (1,1,5) do (
    powershell -Command "try { $json = @{ email='user-'+(Get-Date -Format 'yyyyMMddHHmmss')-%%i+'@test.local'; password='TestPassword123!' } | ConvertTo-Json; $response = Invoke-WebRequest -Uri 'http://localhost:3000/auth/register' -Method POST -ContentType 'application/json' -Body $json -TimeoutSec 5; Write-Host '[OK] Register: ' $response.StatusCode } catch { Write-Host '[FAIL] Register: ' $_.Exception.Response.StatusCode }"
    set /a TOTAL_REQUESTS+=1
)
echo Registration tests complete.
echo.

REM Test 3: Message History
echo [3/4] Testing Message History...
for /L %%i in (1,1,%ITERATIONS%) do (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/messages/history/test-room' -Method GET -TimeoutSec 5; Write-Host '[OK] Message History: ' $response.StatusCode } catch { Write-Host '[FAIL] Message History: ' $_.Exception.Response.StatusCode }"
    set /a TOTAL_REQUESTS+=1
)
echo Message history tests complete.
echo.

REM Test 4: Load Test with Concurrent Requests
echo [4/4] Concurrent Load Test (%PARALLEL_REQUESTS% simultaneous requests)...
for /L %%i in (1,1,10) do (
    echo   - Batch %%i...
    for /L %%j in (1,1,%PARALLEL_REQUESTS%) do (
        powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/auth/health' -Method GET -TimeoutSec 5; Write-Host '[OK] Batch %%i-%%j: Health Check' } catch { Write-Host '[FAIL] Batch %%i-%%j: ' $_.Exception.Message }" &
        set /a TOTAL_REQUESTS+=1
    )
    timeout /t 1 /nobreak >nul
)

REM Wait for all background jobs
timeout /t 2 /nobreak >nul

echo.
echo ================================================
echo Load Test Summary
echo ================================================
echo Total Requests: %TOTAL_REQUESTS%
echo Duration: Multiple seconds
echo Status: Tests completed
echo.
echo NOTE: For detailed metrics, use Artillery CLI:
echo       npm test
echo ================================================
echo.

endlocal
