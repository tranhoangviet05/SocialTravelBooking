# 🌏 Social Travel Booking

> Ứng dụng đặt tour du lịch và chỗ ở trực tuyến tích hợp mạng xã hội và hệ thống gợi ý Upsell & Cross-sell.

---

## 📌 Giới thiệu

**Social Travel Booking** là đề tài đồ án chuyên ngành, xây dựng nền tảng kết hợp giữa:
- 🏨 Đặt tour du lịch & chỗ ở trực tuyến (Có sinh mã QR Ticket)
- 💬 Mạng xã hội du lịch (NewsFeed, chia sẻ bài viết, đánh giá, Follower)
- 🤖 Gợi ý dịch vụ tự động (Upsell & Cross-sell) bằng N8N + Gemini API
- 💳 Thanh toán linh hoạt qua chuyển khoản QR Code (SePay Webhook) & Ví MoMo
- ⚙️ Dashboard Quản lý Dịch Vụ thời gian thực (Real-time Firebase Firestore)

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
| Thanh toán         | SePay (Quét QR Code tự động) & MoMo Sandbox API        |
| Upload Ảnh         | Cloudinary                                             |
| Container          | Docker + Docker Compose                                |

---

## 📁 Cấu trúc thư mục chi tiết

### 1. Backend (Laravel 12 REST API)
Hệ thống được xây dựng theo kiến trúc phân lớp chuyên nghiệp.
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/           # Đăng nhập & Đồng bộ người dùng Firebase
│   │   │   ├── Admin/          # Quản lý hệ thống (Phê duyệt tour, quản lý user)
│   │   │   ├── Provider/       # Chức năng dành cho Nhà cung cấp (Đăng tour, xem booking)
│   │   │   ├── Tourist/        # Chức năng dành cho Khách du lịch
│   │   │   └── General/        # API công khai (Lấy danh sách địa điểm, tìm kiếm tour)
│   │   ├── Middleware/         # FirebaseAuthMiddleware: Kiểm tra Token từ mobile/web
│   │   └── Requests/           # Validation Layer: Kiểm tra tính hợp lệ của dữ liệu gửi lên
│   ├── Services/               # Business Logic: Nơi xử lý các nghiệp vụ phức tạp
│   ├── Models/                 # Eloquent Models: Định nghĩa cấu trúc bảng Database
│   └── Providers/              # Nơi cấu hình và khởi tạo các dịch vụ hệ thống
├── database/migrations/         # Lịch sử thay đổi cấu trúc bảng PostgreSQL
├── routes/api.php              # Lộ trình API (Endpoint) theo chuẩn vaitro/hanhdong/chucnang
└── .env                        # Chứa các mã bảo mật (DB, Firebase, Gemini API)
```

### 2. Frontend Web (React 19 + Tailwind v4)
Ứng dụng web dùng cho quản trị viên và giao diện khách hàng trên máy tính.
```
frontend_web/src/
├── api/                        # Chứa các cấu hình Axios để gọi API Backend
├── components/                 # Các thành phần giao diện dùng chung (Button, Card, Modal)
├── firebase/                   # Cấu hình kết nối Firebase Authentication & Firestore
├── hooks/                      # Custom Hooks (useAuth, useFetchData...)
├── pages/                      # Giao diện các trang chính (Home, Explore, Management)
├── utils/                      # Các hàm tiện ích (Format tiền tệ, xử lý ngày tháng)
├── App.jsx                     # File điều hướng (Routing) chính của ứng dụng
└── main.jsx                    # Điểm vào (Entry point) của dự án React
```

### 3. Mobile App (Flutter)
Ứng dụng di động dành cho khách du lịch trên Android & iOS.
```
mobile_app/lib/
├── core/                       # Chứa các dịch vụ cốt lõi (AuthService, APIClient)
├── features/                   # Chia thư mục theo tính năng (Login, Home, Booking...)
├── models/                     # Định nghĩa các đối tượng dữ liệu (User, Tour, Location)
├── widgets/                    # Các UI Widgets dùng lại nhiều lần trong App
├── main.dart                   # Điểm khởi chạy của ứng dụng Flutter
└── firebase_options.dart       # Cấu hình Firebase dành riêng cho nền tảng di động
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
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
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

# SePay Webhook
SEPAY_ACCOUNT_NUMBER=your_bank_account
SEPAY_BANK_CODE=MB
SEPAY_WEBHOOK_TOKEN=your_sepay_token
```

> ⚠️ Đặt file `firebase-service-account.json` vào thư mục `backend/` (tải từ Firebase Console → Project Settings → Service Accounts)
> ⚠️ Sử dụng [Ngrok](https://ngrok.com/) (`ngrok http 8000`) để tạo public URL cho backend, giúp SePay có thể gọi webhook.

### Bước 3 — Cấu hình Frontend Web

```bash
cd frontend_web
npm install
copy .env.example .env.local
```

Mở `frontend_web/.env.local` và điền thông tin Firebase:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... (xem .env.example để đầy đủ)
```

### Bước 4 — Cấu hình Mobile App (Flutter)

```bash
cd mobile_app
flutter pub get
```


### Bước 5 — Chạy script cài đặt tự động

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
