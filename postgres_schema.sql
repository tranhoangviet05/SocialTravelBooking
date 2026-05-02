-- ============================================================
-- POSTGRESQL SCHEMA — Social Travel Booking
-- Compatible: PostgreSQL 14+
-- Deploy: Render / Supabase / Railway
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role             AS ENUM ('tourist', 'provider', 'admin');
CREATE TYPE user_status           AS ENUM ('active', 'banned', 'pending');
CREATE TYPE provider_status       AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE service_type          AS ENUM ('tour', 'hotel', 'homestay', 'vehicle');
CREATE TYPE service_status        AS ENUM ('draft', 'pending_review', 'active', 'rejected');
CREATE TYPE media_type            AS ENUM ('image', 'video');
CREATE TYPE booking_status        AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled');
CREATE TYPE payment_method        AS ENUM ('wallet', 'momo');
CREATE TYPE payment_status        AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE transaction_type      AS ENUM ('deposit', 'booking_payment', 'refund', 'commission', 'affiliate_reward');
CREATE TYPE discount_type         AS ENUM ('percent', 'fixed');
CREATE TYPE report_type           AS ENUM ('spam', 'fraud', 'inappropriate', 'misleading');
CREATE TYPE report_status         AS ENUM ('pending', 'resolved', 'dismissed');

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid    VARCHAR(255) UNIQUE,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    phone           VARCHAR(20),
    role            user_role    NOT NULL DEFAULT 'tourist',
    status          user_status  NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. PROVIDER_PROFILES
-- ============================================================
CREATE TABLE provider_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name       VARCHAR(255) NOT NULL,
    business_type       VARCHAR(100),
    address             TEXT,
    status              provider_status NOT NULL DEFAULT 'pending',
    rejection_reason    TEXT,
    approved_by         UUID        REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. LOCATIONS
-- ============================================================
CREATE TABLE locations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    parent_id   INT          REFERENCES locations(id),
    image_url   TEXT,
    is_popular  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    icon_url    TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. SERVICES
-- ============================================================
CREATE TABLE services (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id         UUID            NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id         INT             REFERENCES categories(id),
    location_id         INT             REFERENCES locations(id),
    name                VARCHAR(255)    NOT NULL,
    slug                VARCHAR(300)    UNIQUE NOT NULL,
    description         TEXT,
    type                service_type    NOT NULL,
    status              service_status  NOT NULL DEFAULT 'draft',
    rejection_reason    TEXT,
    base_price          DECIMAL(15,2)   NOT NULL,
    price_unit          VARCHAR(20)     NOT NULL DEFAULT 'per_person',
    max_guests          INT,
    duration_days       INT,
    duration_nights     INT,
    address             TEXT,
    amenities           JSONB           NOT NULL DEFAULT '[]',
    includes            JSONB           NOT NULL DEFAULT '[]',
    excludes            JSONB           NOT NULL DEFAULT '[]',
    rating_avg          DECIMAL(3,2)    NOT NULL DEFAULT 0,
    total_bookings      INT             NOT NULL DEFAULT 0,
    tags                TEXT[]          NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

-- ============================================================
-- 6. SERVICE_MEDIA
-- ============================================================
CREATE TABLE service_media (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id  UUID            NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    url         TEXT            NOT NULL,
    type        media_type      NOT NULL DEFAULT 'image',
    is_cover    BOOLEAN         NOT NULL DEFAULT FALSE,
    sort_order  INT             NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. SERVICE_SCHEDULES
-- ============================================================
CREATE TABLE service_schedules (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id  UUID            NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    day_number  INT             NOT NULL,
    title       VARCHAR(255),
    description TEXT,
    activities  JSONB           NOT NULL DEFAULT '[]',
    meals       JSONB           NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. SERVICE_AVAILABILITY
-- ============================================================
CREATE TABLE service_availability (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id      UUID            NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    available_date  DATE            NOT NULL,
    total_slots     INT             NOT NULL DEFAULT 0,
    booked_slots    INT             NOT NULL DEFAULT 0,
    price_override  DECIMAL(15,2),
    is_blocked      BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE(service_id, available_date)
);

-- ============================================================
-- 9. BOOKINGS
-- ============================================================
CREATE TABLE bookings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code            VARCHAR(20)     UNIQUE NOT NULL,
    user_id                 UUID            NOT NULL REFERENCES users(id),
    service_id              UUID            NOT NULL REFERENCES services(id),
    provider_id             UUID            NOT NULL REFERENCES provider_profiles(id),
    check_in_date           DATE            NOT NULL,
    check_out_date          DATE,
    num_adults              INT             NOT NULL DEFAULT 1,
    num_children            INT             NOT NULL DEFAULT 0,
    unit_price              DECIMAL(15,2)   NOT NULL,
    subtotal                DECIMAL(15,2)   NOT NULL,
    discount_amount         DECIMAL(15,2)   NOT NULL DEFAULT 0,
    coupon_code             VARCHAR(50),
    total_amount            DECIMAL(15,2)   NOT NULL,
    payment_method          payment_method,
    payment_status          payment_status  NOT NULL DEFAULT 'pending',
    paid_at                 TIMESTAMPTZ,
    escrow_amount           DECIMAL(15,2)   NOT NULL DEFAULT 0,
    released_to_provider    BOOLEAN         NOT NULL DEFAULT FALSE,
    released_at             TIMESTAMPTZ,
    status                  booking_status  NOT NULL DEFAULT 'pending',
    cancel_reason           TEXT,
    cancelled_at            TIMESTAMPTZ,
    refund_amount           DECIMAL(15,2)   NOT NULL DEFAULT 0,
    refunded_at             TIMESTAMPTZ,
    contact_name            VARCHAR(255)    NOT NULL,
    contact_phone           VARCHAR(20)     NOT NULL,
    contact_email           VARCHAR(255),
    special_requests        TEXT,
    affiliate_post_id       UUID,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. WALLETS
-- ============================================================
CREATE TABLE wallets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance         DECIMAL(15,2)   NOT NULL DEFAULT 0 CHECK (balance >= 0),
    locked_balance  DECIMAL(15,2)   NOT NULL DEFAULT 0,
    currency        VARCHAR(5)      NOT NULL DEFAULT 'VND',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. WALLET_TRANSACTIONS
-- ============================================================
CREATE TABLE wallet_transactions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id           UUID            NOT NULL REFERENCES wallets(id),
    booking_id          UUID            REFERENCES bookings(id),
    type                transaction_type NOT NULL,
    amount              DECIMAL(15,2)   NOT NULL,
    balance_before      DECIMAL(15,2)   NOT NULL,
    balance_after       DECIMAL(15,2)   NOT NULL,
    note                TEXT,
    momo_trans_id       VARCHAR(100),
    momo_result_code    INT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id          UUID            UNIQUE REFERENCES bookings(id),
    service_id          UUID            NOT NULL REFERENCES services(id),
    user_id             UUID            NOT NULL REFERENCES users(id),
    rating              SMALLINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    rating_cleanliness  SMALLINT        CHECK (rating_cleanliness BETWEEN 1 AND 5),
    rating_service      SMALLINT        CHECK (rating_service BETWEEN 1 AND 5),
    rating_value        SMALLINT        CHECK (rating_value BETWEEN 1 AND 5),
    content             TEXT,
    images              TEXT[]          NOT NULL DEFAULT '{}',
    is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,
    provider_reply      TEXT,
    provider_reply_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. COUPONS
-- ============================================================
CREATE TABLE coupons (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50)     UNIQUE NOT NULL,
    discount_type       discount_type   NOT NULL,
    discount_value      DECIMAL(15,2)   NOT NULL,
    min_order_amount    DECIMAL(15,2)   NOT NULL DEFAULT 0,
    usage_limit         INT,
    used_count          INT             NOT NULL DEFAULT 0,
    per_user_limit      INT             NOT NULL DEFAULT 1,
    valid_from          TIMESTAMPTZ,
    valid_until         TIMESTAMPTZ,
    created_by          UUID            REFERENCES users(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 15. REPORTS
-- ============================================================
CREATE TABLE reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id         UUID            NOT NULL REFERENCES users(id),
    post_id             VARCHAR(255),   -- Firestore post ID
    service_id          UUID            REFERENCES services(id),
    type                report_type     NOT NULL,
    status              report_status   NOT NULL DEFAULT 'pending',
    description         TEXT,
    reviewed_by         UUID            REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    resolution_note     TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 16. USER_RECOMMENDATIONS (Behavioral Targeting)
-- ============================================================
CREATE TABLE user_recommendations (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    location_id         INT             REFERENCES locations(id) ON DELETE SET NULL,
    last_anchor_type    service_type,
    suggested_services  JSONB,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 17. SYSTEM_SETTINGS
-- ============================================================
CREATE TABLE system_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT         NOT NULL,
    type        VARCHAR(20)  NOT NULL DEFAULT 'string',
    description TEXT,
    updated_by  UUID         REFERENCES users(id),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_users_firebase_uid    ON users(firebase_uid);
CREATE INDEX idx_users_role_status     ON users(role, status);

CREATE INDEX idx_provider_user         ON provider_profiles(user_id);
CREATE INDEX idx_provider_status       ON provider_profiles(status);

CREATE INDEX idx_services_provider     ON services(provider_id);
CREATE INDEX idx_services_location     ON services(location_id);
CREATE INDEX idx_services_type_status  ON services(type, status);
CREATE INDEX idx_services_price        ON services(base_price);
CREATE INDEX idx_services_deleted      ON services(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_tags         ON services USING GIN(tags);
CREATE INDEX idx_services_fulltext     ON services USING GIN(
    to_tsvector('simple', name || ' ' || COALESCE(description, ''))
);

CREATE INDEX idx_availability_service_date ON service_availability(service_id, available_date);

CREATE INDEX idx_bookings_user         ON bookings(user_id);
CREATE INDEX idx_bookings_service      ON bookings(service_id);
CREATE INDEX idx_bookings_provider     ON bookings(provider_id);
CREATE INDEX idx_bookings_status       ON bookings(status);
CREATE INDEX idx_bookings_checkin      ON bookings(check_in_date);

CREATE INDEX idx_wallet_txn_wallet     ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txn_booking    ON wallet_transactions(booking_id);

CREATE INDEX idx_reviews_service       ON reviews(service_id);
CREATE INDEX idx_reviews_user          ON reviews(user_id);

CREATE INDEX idx_recommendations_updated ON user_recommendations(updated_at);

-- ============================================================
-- SEED: System Settings
-- ============================================================
INSERT INTO system_settings (key, value, type, description) VALUES
('platform_commission_rate',    '10',    'number',  'Tỷ lệ hoa hồng sàn thu (%)'),
('affiliate_commission_rate',   '5',     'number',  'Tỷ lệ hoa hồng tiếp thị liên kết (%)'),
('affiliate_tracking_hours',    '24',    'number',  'Thời gian tracking affiliate (giờ)'),
('escrow_release_after_hours',  '48',    'number',  'Giải phóng escrow sau khi check-in xong (giờ)'),
('ai_moderation_threshold',     '0.85',  'number',  'Ngưỡng điểm AI tự động từ chối bài viết'),
('ad_min_budget',               '50000', 'number',  'Ngân sách quảng cáo tối thiểu (VND)');