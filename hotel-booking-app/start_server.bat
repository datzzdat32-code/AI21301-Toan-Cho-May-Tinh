@echo off
title VnStay.vn Hotel Booking System Launcher
cls
echo ===================================================
echo  VNSTAY.VN - DANG KHOI DONG HE THONG FULL-STACK...
echo ===================================================

echo [1/2] Khoi dong Backend Server (Port 5000)...
start "VnStay Backend API" cmd /k "cd /d %~dp0backend && node server.js"

echo [2/2] Khoi dong Frontend Website (Port 3000)...
start "VnStay Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ===================================================
echo  He thong dang khoi chay thanh cong!
echo  Website: http://localhost:3000
echo  Backend API: http://localhost:5000
echo ===================================================
timeout /t 3 >nul
start http://localhost:3000
exit
