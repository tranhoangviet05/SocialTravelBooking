# 🌏 Social Travel Booking

> Ứng dụng đặt tour du lịch và chỗ ở trực tuyến tích hợp mạng xã hội và hệ thống gợi ý Upsell & Cross-sell.

---

## 📌 Giới thiệu

**Social Travel Booking** là đề tài đồ án chuyên ngành, xây dựng nền tảng kết hợp giữa:
- 🏨 Đặt tour du lịch & chỗ ở trực tuyến
- 💬 Mạng xã hội du lịch (chia sẻ bài viết, đánh giá, check-in)
- 🤖 Gợi ý dịch vụ tự động (Upsell & Cross-sell) bằng N8N + Gemini API
- 💳 Thanh toán qua ví điện tử nội bộ & MoMo Sandbox
- 🐳 Hỗ trợ triển khai nhanh qua Docker

---

## 🛠️ Công nghệ sử dụng

| Thành phần         | Công nghệ                                              |
|--------------------|--------------------------------------------------------|
| Backend            | Laravel 12 (REST API)                                  |
| Frontend Web       | React 19 + Vite + Tailwind CSS v4                      |
| Mobile             | Flutter (Android & iOS)                                |
| Database chính     | PostgreSQL 16                                          |
| Xác thực           | Firebase Authentication + Laravel Middleware           |
| AI & Automation    | Gemini API & N8N                                       |
| Thanh toán         | MoMo Sandbox API                                       |
| Container          | Docker + Docker Compose                                |

---

## 📁 Cấu trúc thư mục

- `backend/`: Laravel 12 API - Xử lý nghiệp vụ chính, thanh toán, AI.
- `frontend_web/`: React 19 - Giao diện dành cho Admin và Khách hàng (Web).
- `mobile_app/`: Flutter - Ứng dụng di động dành cho khách du lịch.
- `docker/`: Cấu hình môi trường Containerized.

---

## ⚙️ Yêu cầu cài đặt (Dành cho máy mới hoàn toàn)

### 1. Dành cho Ubuntu / Debian (LTS 22.04+)

Mở Terminal và chạy các lệnh sau:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 1. Cài đặt PHP 8.2+ và các extension cần thiết
sudo apt install -y php8.2-fpm php8.2-curl php8.2-xml php8.2-pgsql php8.2-mbstring php8.2-zip php8.2-bcmath unzip

# 2. Cài đặt Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 3. Cài đặt Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Cài đặt PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. Cài đặt Flutter SDK
# Tải tại: https://docs.flutter.dev/get-started/install/linux
```

### 2. Dành cho Windows

Cách nhanh nhất và ít lỗi nhất là sử dụng **Laravel Herd**:

- **Laravel Herd (Khuyên dùng - Đã bao gồm PHP & Composer)**: Tải tại [herd.laravel.com](https://herd.laravel.com).
  - Đây là bộ cài "one-click" tự động thiết lập môi trường PHP và Composer mà không cần cấu hình `PATH` thủ công.
- **Node.js**: Tải tại [nodejs.org](https://nodejs.org/).
- **PostgreSQL**: Tải tại [enterprisedb.com](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
- **Flutter SDK**: Tải tại [docs.flutter.dev](https://docs.flutter.dev/get-started/install/windows).
- **Git**: Tải tại [git-scm.com](https://git-scm.com/).

---

## 🚀 Hướng dẫn cài đặt chi tiết

### Bước 1: Clone dự án
```bash
git clone https://github.com/your-username/SocialTravelBooking.git
cd SocialTravelBooking
```

### Bước 2: Cấu hình Cơ sở dữ liệu (PostgreSQL)
Mở terminal của PostgreSQL (hoặc pgAdmin) và thực hiện:
```sql
CREATE DATABASE social_travel_booking;
CREATE USER travel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE social_travel_booking TO travel_user;
```

### Bước 3: Cấu hình Backend (Laravel)
```bash
cd backend
# Tạo thư mục cache (cần thiết trên máy mới)
mkdir -p bootstrap/cache
composer install --ignore-platform-req=ext-grpc
cp .env.example .env
php artisan key:generate
```
**Chỉnh sửa file `.env`:**
- `DB_DATABASE=social_travel_booking`
- `DB_USERNAME=travel_user`
- `DB_PASSWORD=your_password`
- Điền các Key: `GEMINI_API_KEY`, `MOMO_...`, `FIREBASE_PROJECT_ID`.

**Khởi tạo dữ liệu:**
```bash
php artisan migrate --seed
php artisan storage:link
```

### Bước 4: Cấu hình Frontend (React)
```bash
cd ../frontend_web
npm install
cp .env.example .env.local
```
> ⚠️ **Windows**: Nếu gặp lỗi `running scripts is disabled`, hãy chạy lệnh sau trong PowerShell **trước** rồi thử lại:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
> ```

### Bước 5: Cấu hình Mobile (Flutter)
```bash
cd ../mobile_app
flutter pub get
```
*Lưu ý: Bạn cần cài đặt Android Studio/Xcode và Emulator để chạy App.*

---

## 🔑 Chuẩn bị Credentials (Quan trọng)

Để ứng dụng hoạt động đầy đủ, bạn cần chuẩn bị:

1.  **Firebase**:
    - Truy cập [Firebase Console](https://console.firebase.google.com/).
    - Tạo Project mới, bật **Authentication** (Email/Password).
    - Tải file `firebase-service-account.json` và bỏ vào thư mục `backend/`.
    - Lấy thông tin Web Config cho `frontend_web/.env.local`.
2.  **Gemini AI**: Lấy API Key tại [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  **MoMo**: Đăng ký tài khoản Test tại [Momo Developers](https://developers.momo.vn/).

---

## ▶️ Cách khởi chạy

### Lựa chọn 1: Dùng Docker (Khuyên dùng - Nhanh nhất)
Đảm bảo đã cài Docker Desktop.
```bash
docker compose up --build
```
- Web App: `http://localhost:5173`
- Backend API: `http://localhost:8000`

### Lựa chọn 2: Chạy thủ công (3 Terminals)
1. **Backend**:
   ```bash
   cd backend
   php artisan serve
   ```
   > ⚠️ **Nếu dùng Laravel Herd trên Windows** và `php artisan serve` báo lỗi, hãy dùng lệnh thay thế:
   > ```bash
   > php -S 127.0.0.1:8000 -t public
   > ```
2. **Frontend**: `cd frontend_web && npm run dev`
3. **Mobile**: `cd mobile_app && flutter run` (Cần mở máy ảo trước)

---

## 🔗 API & Tài liệu
- **Health Check**: `GET /api/ping`
- **Tài liệu API**: Xem trong thư mục `docs/` (nếu có) hoặc dùng Postman Collection đi kèm.

---
⭐ **Ghi chú**: Nếu gặp lỗi về PHP extension trên Ubuntu, hãy đảm bảo đã cài đủ `php-pgsql` và `php-xml`.

