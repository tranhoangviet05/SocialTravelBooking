// ============================================================
// FIREBASE FIRESTORE SCHEMA — Social Travel Booking
// File này mô tả cấu trúc và tạo dữ liệu mẫu cho Firestore
// Chạy: node firestore_schema.js
// ============================================================

// npm install firebase-admin
const admin = require('firebase-admin');
const serviceAccount = require('./backend/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ============================================================
// SCHEMA REFERENCE (cấu trúc từng collection)
// ============================================================

/**
 * COLLECTION: posts/{postId}
 * Bài đăng mạng xã hội (blog, review, check-in)
 */
const POST_SCHEMA = {
  postId: 'string   — ID tự sinh bởi Firestore',
  userId: 'string   — ID người đăng (tham chiếu PostgreSQL users.id)',
  displayName: 'string   — Snapshot tên lúc đăng bài',
  avatarUrl: 'string   — Snapshot avatar lúc đăng bài',
  type: 'string   — blog | review | checkin | general',
  status: 'string   — pending | approved | rejected',
  content: 'string   — Nội dung bài viết',
  mediaUrls: 'array    — Danh sách URL ảnh/video',
  checkinLocation: 'map      — { name, lat, lng, locationId }',
  linkedServiceId: 'string   — UUID dịch vụ affiliate (PostgreSQL)',
  affiliateCode: 'string   — Mã tracking 24h',
  tags: 'array    — Mảng hashtag',
  likeCount: 'number   — Dùng FieldValue.increment(1)',
  commentCount: 'number   — Dùng FieldValue.increment(1)',
  shareCount: 'number   — Dùng FieldValue.increment(1)',
  aiModerationScore: 'number   — Điểm AI (0.0 - 1.0)',
  rejectionReason: 'string   — Lý do từ chối',
  isPinned: 'boolean  — Admin ghim lên đầu',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
};

/**
 * COLLECTION: comments/{postId}/items/{commentId}
 * Bình luận — subcollection theo bài viết
 */
const COMMENT_SCHEMA = {
  commentId: 'string   — ID tự sinh',
  postId: 'string   — Bài viết cha',
  userId: 'string   — Người bình luận (PostgreSQL)',
  displayName: 'string   — Snapshot tên',
  avatarUrl: 'string   — Snapshot avatar',
  content: 'string   — Nội dung bình luận',
  parentId: 'string   — NULL = gốc, có ID = reply',
  likeCount: 'number',
  isHidden: 'boolean  — Admin ẩn',
  createdAt: 'timestamp',
};

/**
 * COLLECTION: post_likes/{postId}/users/{userId}
 * Like bài viết — document ID chính là userId
 */
const POST_LIKE_SCHEMA = {
  userId: 'string   — Document ID = userId',
  createdAt: 'timestamp',
};

/**
 * COLLECTION: messages/{conversationId}/chats/{messageId}
 * Tin nhắn chat — conversationId = userId_providerId
 */
const MESSAGE_SCHEMA = {
  messageId: 'string   — ID tự sinh',
  senderId: 'string   — UID người gửi (PostgreSQL)',
  senderName: 'string   — Snapshot tên',
  senderAvatar: 'string   — Snapshot avatar',
  content: 'string   — Nội dung',
  type: 'string   — text | image | booking_card',
  bookingId: 'string   — UUID booking (PostgreSQL)',
  mediaUrl: 'string   — URL ảnh nếu type = image',
  isRead: 'boolean',
  createdAt: 'timestamp',
};

/**
 * COLLECTION: notifications/{userId}/items/{notificationId}
 * Thông báo real-time — subcollection theo userId
 */
const NOTIFICATION_SCHEMA = {
  notificationId: 'string   — ID tự sinh',
  type: 'string   — booking | payment | social | system | upsell',
  title: 'string   — Tiêu đề ngắn',
  body: 'string   — Nội dung chi tiết',
  imageUrl: 'string   — Ảnh đi kèm',
  actionUrl: 'string   — Deep link khi click',
  referenceId: 'string   — ID đối tượng liên quan',
  referenceType: 'string   — booking | post | service',
  isRead: 'boolean',
  createdAt: 'timestamp',
};

/**
 * COLLECTION: user_presence/{userId}
 * Trạng thái online/offline
 */
const USER_PRESENCE_SCHEMA = {
  isOnline: 'boolean',
  lastSeenAt: 'timestamp',
};

// ============================================================
// SEED DỮ LIỆU MẪU
// ============================================================
async function seedFirestore() {
  console.log('Bắt đầu seed Firestore...');

  // ── 1. Seed bài viết mẫu ──────────────────────────────
  const postRef = db.collection('posts').doc('post_demo_001');
  await postRef.set({
    userId: 'user-uuid-from-postgresql',
    displayName: 'Nguyễn Văn A',
    avatarUrl: 'https://example.com/avatar.jpg',
    type: 'review',
    status: 'approved',
    content: 'Chuyến đi Đà Lạt thật tuyệt vời! Khách sạn sạch sẽ, nhân viên nhiệt tình.',
    mediaUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    checkinLocation: { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, locationId: 1 },
    linkedServiceId: 'service-uuid-from-postgresql',
    affiliateCode: null,
    tags: ['dalat', 'travel', 'review'],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    aiModerationScore: 0.12,
    rejectionReason: null,
    isPinned: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Tạo bài viết mẫu');

  // ── 2. Seed bình luận mẫu ─────────────────────────────
  const commentRef = db
    .collection('comments')
    .doc('post_demo_001')
    .collection('items')
    .doc();
  await commentRef.set({
    postId: 'post_demo_001',
    userId: 'user-uuid-002',
    displayName: 'Trần Thị B',
    avatarUrl: 'https://example.com/avatar2.jpg',
    content: 'Bài viết hay quá! Mình cũng muốn đi Đà Lạt.',
    parentId: null,
    likeCount: 0,
    isHidden: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Tạo bình luận mẫu');

  // ── 3. Seed thông báo mẫu ─────────────────────────────
  const notifRef = db
    .collection('notifications')
    .doc('user-uuid-from-postgresql')
    .collection('items')
    .doc();
  await notifRef.set({
    type: 'booking',
    title: 'Đặt dịch vụ thành công!',
    body: 'Đơn đặt tour Đà Lạt của bạn đã được xác nhận.',
    imageUrl: 'https://example.com/tour.jpg',
    actionUrl: '/bookings/BK20241201',
    referenceId: 'booking-uuid-from-postgresql',
    referenceType: 'booking',
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Tạo thông báo mẫu');

  // ── 4. Seed user presence mẫu ─────────────────────────
  await db.collection('user_presence').doc('user-uuid-from-postgresql').set({
    isOnline: false,
    lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Tạo user presence mẫu');

  console.log('\n Seed Firestore hoàn tất!');
  process.exit(0);
}

// ============================================================
// FIRESTORE SECURITY RULES (copy vào Firebase Console)
// ============================================================
const SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // posts — ai cũng đọc được, chỉ chủ bài mới sửa/xóa
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // comments — ai cũng đọc được, đăng nhập mới comment
    match /comments/{postId}/items/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // post_likes — chỉ like/unlike chính mình
    match /post_likes/{postId}/users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // messages — chỉ 2 người trong conversation mới đọc/ghi
    match /messages/{conversationId}/chats/{messageId} {
      allow read, write: if request.auth != null
        && (request.auth.uid == resource.data.senderId
         || conversationId.matches(request.auth.uid + '_.*')
         || conversationId.matches('.*_' + request.auth.uid));
    }

    // notifications — chỉ chủ sở hữu mới đọc
    match /notifications/{userId}/items/{notificationId} {
      allow read, write: if request.auth.uid == userId;
    }

    // user_presence — chỉ chủ sở hữu mới cập nhật
    match /user_presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
`;

console.log('\n Firestore Security Rules:');
console.log(SECURITY_RULES);

seedFirestore().catch(console.error);