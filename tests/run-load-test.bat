@echo off
REM Run Artillery Load Tests for Scalable Chat
REM This batch file sets up and runs the Artillery load testing suite

setlocal enabledelayedexpansion

echo.
echo ================================================
echo Artillery Load Test Setup ^& Execution
echo ================================================
echo.

REM Colors are not available in batch, so we'll use text indicators
set "success=[OK]"
set "error=[ERROR]"
set "warning=[WARNING]"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo %error% Node.js is not installed. Please install Node.js first.
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %success% Node.js is installed: %NODE_VERSION%

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo %error% npm is not installed. Please install npm first.
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %success% npm is installed: %NPM_VERSION%

REM Check if Artillery is installed globally
where artillery >nul 2>&1
if errorlevel 1 (
    echo %warning% Artillery is not installed globally. Installing...
    call npm install -g artillery
    if errorlevel 1 (
        echo %error% Failed to install Artillery
        exit /b 1
    )
    echo %success% Artillery installed successfully
) else (
    for /f "tokens=*" %%i in ('artillery --version') do set ARTILLERY_VERSION=%%i
    echo %success% Artillery is already installed: !ARTILLERY_VERSION!
)

REM Install dependencies for this project
echo.
echo Installing local dependencies...
cd /d "%~dp0"
call npm install
if errorlevel 1 (
    echo %error% Failed to install dependencies
    exit /b 1
)
echo %success% Dependencies installed successfully

REM Check if services are running
echo.
echo Checking if required services are running...

setlocal enabledelayedexpansion
set "services_ok=true"

for /f "tokens=*" %%a in ('powershell -Command "try { (New-Object System.Net.Sockets.TcpClient).Connect('localhost', 3000); Write-Host 'true' } catch { Write-Host 'false' }" 2^>nul') do set "api_running=%%a"
if "!api_running!"=="true" (
    echo %success% API Gateway is running on port 3000
) else (
    echo %warning% API Gateway is NOT running on port 3000
    set "services_ok=false"
)

for /f "tokens=*" %%a in ('powershell -Command "try { (New-Object System.Net.Sockets.TcpClient).Connect('localhost', 3003); Write-Host 'true' } catch { Write-Host 'false' }" 2^>nul') do set "chat_running=%%a"
if "!chat_running!"=="true" (
    echo %success% Chat Service is running on port 3003
) else (
    echo %warning% Chat Service is NOT running on port 3003
    set "services_ok=false"
)

if "!services_ok!"=="false" (
    echo.
    echo %warning% Some services are not running. Make sure to run 'docker-compose up -d' first.
    echo Proceeding with load test anyway...
    echo.
)

REM Display test options
echo.
echo ================================================
echo Load Test Options
echo ================================================
echo.
echo 1. Run Basic Load Test (artillery-config.yml)
echo 2. Run Advanced Load Test (artillery-advanced-config.yml)
echo 3. Run with HTML Report
echo 4. View Latest Report
echo 5. Exit
echo.

setlocal disabledelayedexpansion
set /p choice="Select an option (1-5): "
setlocal enabledelayedexpansion

if "!choice!"=="1" (
    echo.
    echo Running Basic Load Test...
    call artillery run artillery-config.yml
    if errorlevel 1 (
        echo %error% Load test failed
        exit /b 1
    )
) else if "!choice!"=="2" (
    echo.
    echo Running Advanced Load Test...
    call artillery run artillery-advanced-config.yml
    if errorlevel 1 (
        echo %error% Load test failed
        exit /b 1
    )
) else if "!choice!"=="3" (
    echo.
    echo Running Load Test with Report Generation...
    call artillery run artillery-config.yml -o report.json
    if errorlevel 1 (
        echo %error% Load test failed
        exit /b 1
    )
    echo.
    echo Generating HTML Report...
    call artillery report report.json -o report.html
    echo %success% Report generated: report.html
) else if "!choice!"=="4" (
    if exist "report.html" (
        echo %success% Opening report.html...
        start report.html
    ) else (
        echo %error% No report found. Run option 3 first to generate a report.
    )
    exit /b 0
) else if "!choice!"=="5" (
    echo Exiting...
    exit /b 0
) else (
    echo %error% Invalid option
    exit /b 1
)

echo.
echo ================================================
echo %success% Load test completed successfully
echo ================================================
echo.

endlocal
exit /b 0
