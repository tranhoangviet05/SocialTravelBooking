@echo off
echo ========================================
echo   Social Travel Booking - Setup Script
echo ========================================

:: ── BACKEND ──────────────────────────────
echo.
echo [1/3] Cai dat Backend (Laravel)...
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
cd ..

:: ── FRONTEND ─────────────────────────────
echo.
echo [2/3] Cai dat Frontend (React)...
cd frontend_web
npm install
cd ..

:: ── FLUTTER ──────────────────────────────
echo.
echo [3/3] Cai dat Mobile (Flutter)...
cd mobile_app
flutter pub get
cd ..

echo.
echo ========================================
echo   Hoan tat! Chay theo huong dan sau:
echo.
echo   Backend  : cd backend     ^& php artisan serve
echo   Frontend : cd frontend_web ^& npm run dev
echo   Mobile   : cd mobile_app  ^& flutter run
echo ========================================
pause