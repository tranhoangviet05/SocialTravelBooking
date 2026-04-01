# 🌏 Social Travel Booking

> Ứng dụng đặt tour du lịch và chỗ ở trực tuyến tích hợp mạng xã hội và hệ thống gợi ý Upsell & Cross-sell.

---

## 📌 Giới thiệu

**Social Travel Booking** là đề tài đồ án chuyên ngành, xây dựng nền tảng kết hợp giữa:
- 🏨 Đặt tour du lịch & chỗ ở trực tuyến
- 💬 Mạng xã hội du lịch (chia sẻ bài viết, đánh giá, check-in)
- 🤖 Gợi ý dịch vụ tự động (Upsell & Cross-sell) bằng N8N + Gemini API
- 💳 Thanh toán qua ví điện tử nội bộ & MoMo Sandbox

---

## 🛠️ Công nghệ sử dụng

| Thành phần         | Công nghệ                                              |
|--------------------|--------------------------------------------------------|
| Backend            | Laravel 12 (REST API)                                  |
| Frontend Web       | React 19 + Vite + Tailwind CSS v4                      |
| Mobile             | Flutter (Android & iOS)                                |
| Database chính     | PostgreSQL 16                                          |
| Database real-time | Firebase Cloud Firestore                               |
| Xác thực           | Firebase Authentication + Laravel Middleware           |
| Automation         | N8N                                                    |
| AI                 | Gemini API                                             |
| Thanh toán         | MoMo Sandbox API                                       |
| Container          | Docker + Docker Compose                                |

---

## 📁 Cấu trúc thư mục

```
SocialTravelBooking/
├── backend/              # Laravel 12 REST API
│   ├── app/
│   ├── routes/api.php
│   ├── Dockerfile
│   ├── .env.example
│   └── firebase-service-account.json  # ⚠️ KHÔNG commit
│
├── frontend_web/         # React 19 + Vite
│   ├── src/
│   │   ├── firebase/     # Firebase config & services
│   │   └── hooks/        # Custom hooks (useAuth, ...)
│   ├── Dockerfile
│   └── .env.example
│
├── mobile_app/           # Flutter (Android & iOS)
│   └── lib/
│       ├── core/services/  # AuthService, FirestoreService
│       └── firebase_options.dart
│
├── docker-compose.yml    # Chạy toàn bộ stack bằng Docker
├── firestore_schema.js   # Seed dữ liệu mẫu Firestore
└── README.md
```

---

## ✅ Yêu cầu cài đặt (môi trường thủ công)

| Công cụ | Phiên bản | Link tải |
|---------|-----------|----------|
| Node.js | LTS (v20+) | https://nodejs.org |
| PHP | 8.2+ | https://www.php.net |
| Composer | Latest | https://getcomposer.org |
| Flutter SDK | Latest stable | https://docs.flutter.dev/get-started/install/windows |
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Git | Latest | https://git-scm.com/download/win |

---

## 🚀 Hướng dẫn cài đặt

### Bước 1 — Clone repository

```bash
git clone https://github.com/your-username/SocialTravelBooking.git
cd SocialTravelBooking
```

### Bước 2 — Cấu hình Backend

```bash
cd backend
copy .env.example .env
```

Mở `backend/.env` và điền thông tin thật:

```env
DB_HOST=127.0.0.1
DB_DATABASE=social_travel_booking
DB_USERNAME=postgres
DB_PASSWORD=your_password

FIREBASE_CREDENTIALS=firebase-service-account.json
GEMINI_API_KEY=your_gemini_api_key
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
```

> ⚠️ Đặt file `firebase-service-account.json` vào thư mục `backend/` (tải từ Firebase Console → Project Settings → Service Accounts)

### Bước 3 — Cấu hình Frontend Web

```bash
cd frontend_web
copy .env.example .env.local
```

Mở `frontend_web/.env.local` và điền thông tin Firebase:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... (xem .env.example để đầy đủ)
```

### Bước 4 — Chạy script cài đặt tự động

```bash
setup.bat
```

---

## 🐳 Chạy bằng Docker (khuyến nghị)

```bash
# Đảm bảo Docker Desktop đang chạy
docker compose up --build
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| Frontend Web | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

Dừng:
```bash
docker compose down
```

---

## ▶️ Chạy thủ công (không dùng Docker)

Mở **3 terminal riêng biệt**:

**Terminal 1 — Backend:**
```bash
cd backend
php artisan serve
# → http://localhost:8000
```

**Terminal 2 — Frontend Web:**
```bash
cd frontend_web
npm run dev
# → http://localhost:5173
```

**Terminal 3 — Mobile (cần bật Android Emulator trước):**
```bash
cd mobile_app
flutter run
```

---

## 🔗 API Documentation

Sau khi chạy backend:
```
GET http://localhost:8000/api/ping   → Kiểm tra server
GET http://localhost:8000/api/me     → Thông tin user (cần Firebase token)
```
