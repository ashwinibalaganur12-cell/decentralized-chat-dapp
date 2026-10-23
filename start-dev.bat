@echo off
setlocal
echo ==========================================
echo 🚀 ChatApp Development Environment Startup
echo ==========================================

:: 1. Start Hardhat Node in a new window
echo.
echo [1/3] Starting Hardhat Node...
echo This will open a new terminal window. Keep it open!
start "Hardhat Node" cmd /k "npx hardhat node"

:: 2. Wait for node to initialize
echo.
echo [Waiting 10s for node to initialize...]
timeout /t 10 /nobreak >nul

:: 3. Run Usage/Deployment Script
echo.
echo [2/3] Running Deployment & Setup...
:: We use call to ensure variable scope is preserved if needed, though node is an executable
call node deploy-and-setup.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Deployment failed! 
    echo Please check if the Hardhat Node window is running and not showing errors.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Start Frontend
echo.
echo [3/3] Starting Frontend...
npm run dev
