--
-- PostgreSQL database dump
--

\restrict J3eBk8BFpabUpTZGbvFJ9xWfMO7VmNph3PyKPsZiwdmPZYwjECrA8aUmfUmQJQc

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: viet
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO viet;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: behavior_action; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.behavior_action AS ENUM (
    'view_post',
    'like_post',
    'comment_post',
    'click_affiliate',
    'save_post',
    'follow_user'
);


ALTER TYPE public.behavior_action OWNER TO viet;

--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'ongoing',
    'completed',
    'cancelled'
);


ALTER TYPE public.booking_status OWNER TO viet;

--
-- Name: discount_type; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.discount_type AS ENUM (
    'percent',
    'fixed'
);


ALTER TYPE public.discount_type OWNER TO viet;

--
-- Name: media_type; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.media_type AS ENUM (
    'image',
    'video'
);


ALTER TYPE public.media_type OWNER TO viet;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.payment_method AS ENUM (
    'wallet',
    'momo',
    'sepay',
    'vnpay',
    'banking'
);


ALTER TYPE public.payment_method OWNER TO viet;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO viet;

--
-- Name: post_visibility; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.post_visibility AS ENUM (
    'public',
    'private'
);


ALTER TYPE public.post_visibility OWNER TO viet;

--
-- Name: provider_status; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.provider_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'suspended'
);


ALTER TYPE public.provider_status OWNER TO viet;

--
-- Name: report_status; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'resolved',
    'dismissed'
);


ALTER TYPE public.report_status OWNER TO viet;

--
-- Name: report_type; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.report_type AS ENUM (
    'spam',
    'fraud',
    'inappropriate',
    'misleading'
);


ALTER TYPE public.report_type OWNER TO viet;

--
-- Name: service_status; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.service_status AS ENUM (
    'draft',
    'pending_review',
    'active',
    'rejected'
);


ALTER TYPE public.service_status OWNER TO viet;

--
-- Name: service_type; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.service_type AS ENUM (
    'tour',
    'hotel',
    'homestay',
    'vehicle'
);


ALTER TYPE public.service_type OWNER TO viet;

--
-- Name: tag_type; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.tag_type AS ENUM (
    'location',
    'category',
    'activity'
);


ALTER TYPE public.tag_type OWNER TO viet;

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.transaction_type AS ENUM (
    'deposit',
    'booking_payment',
    'refund',
    'commission',
    'affiliate_reward'
);


ALTER TYPE public.transaction_type OWNER TO viet;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.user_role AS ENUM (
    'tourist',
    'provider',
    'admin'
);


ALTER TYPE public.user_role OWNER TO viet;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: viet
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'banned',
    'pending'
);


ALTER TYPE public.user_status OWNER TO viet;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: automation_logs; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.automation_logs (
    id uuid NOT NULL,
    user_id uuid,
    email character varying(191) NOT NULL,
    display_name character varying(191) NOT NULL,
    campaign_type character varying(191) NOT NULL,
    service_name character varying(191),
    status character varying(191) DEFAULT 'success'::character varying NOT NULL,
    metadata json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.automation_logs OWNER TO viet;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_code character varying(20) NOT NULL,
    user_id uuid NOT NULL,
    service_id uuid NOT NULL,
    provider_id uuid NOT NULL,
    check_in_date date NOT NULL,
    check_out_date date,
    num_adults integer DEFAULT 1 NOT NULL,
    num_children integer DEFAULT 0 NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    discount_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    coupon_code character varying(50),
    total_amount numeric(15,2) NOT NULL,
    paid_at timestamp(0) with time zone,
    cancel_reason text,
    cancelled_at timestamp(0) with time zone,
    contact_name character varying(255) NOT NULL,
    contact_phone character varying(20) NOT NULL,
    contact_email character varying(255),
    special_requests text,
    affiliate_post_id uuid,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payment_method public.payment_method,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    status public.booking_status DEFAULT 'pending'::public.booking_status NOT NULL,
    coupon_id uuid,
    room_type_id uuid,
    checked_in_at timestamp(0) without time zone,
    checked_out_at timestamp(0) without time zone,
    tourist_check_in_at timestamp(0) without time zone,
    is_checked_in boolean DEFAULT false NOT NULL,
    last_reminded_at timestamp(0) without time zone,
    review_requested_at timestamp(0) without time zone,
    is_abandoned_reminder_sent boolean DEFAULT false NOT NULL,
    is_review_request_sent boolean DEFAULT false NOT NULL
);


ALTER TABLE public.bookings OWNER TO viet;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.cache (
    key character varying(191) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO viet;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.cache_locks (
    key character varying(191) NOT NULL,
    owner character varying(191) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO viet;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    icon_url text,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    updated_at timestamp(0) with time zone,
    icon character varying(191) DEFAULT 'Tag'::character varying NOT NULL
);


ALTER TABLE public.categories OWNER TO viet;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO viet;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    service_id uuid
);


ALTER TABLE public.comments OWNER TO viet;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.conversations (
    id uuid NOT NULL,
    user_one uuid NOT NULL,
    user_two uuid NOT NULL,
    last_message_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.conversations OWNER TO viet;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.coupons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    discount_value numeric(15,2) NOT NULL,
    min_order_amount numeric(15,2),
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    per_user_limit integer,
    valid_from timestamp(0) with time zone,
    valid_until timestamp(0) with time zone,
    created_by uuid,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.discount_type NOT NULL
);


ALTER TABLE public.coupons OWNER TO viet;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(191) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO viet;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO viet;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: follows; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.follows (
    id bigint NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.follows OWNER TO viet;

--
-- Name: follows_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.follows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follows_id_seq OWNER TO viet;

--
-- Name: follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.follows_id_seq OWNED BY public.follows.id;


--
-- Name: homestay_details; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.homestay_details (
    service_id uuid NOT NULL,
    checkin_time character varying(10) DEFAULT '14:00'::character varying NOT NULL,
    checkout_time character varying(10) DEFAULT '12:00'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.homestay_details OWNER TO viet;

--
-- Name: hotel_details; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.hotel_details (
    service_id uuid NOT NULL,
    star_rating integer,
    checkin_time character varying(10) DEFAULT '14:00'::character varying NOT NULL,
    checkout_time character varying(10) DEFAULT '12:00'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.hotel_details OWNER TO viet;

--
-- Name: hotel_room_types; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.hotel_room_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    name character varying(191) NOT NULL,
    description text,
    base_price numeric(15,2) NOT NULL,
    capacity_adults integer DEFAULT 2 NOT NULL,
    amenities jsonb DEFAULT '[]'::jsonb NOT NULL,
    images jsonb DEFAULT '[]'::jsonb NOT NULL,
    status character varying(191) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    rank character varying(191) DEFAULT 'standard'::character varying NOT NULL,
    inventory integer DEFAULT 1 NOT NULL,
    total_bedrooms integer DEFAULT 1 NOT NULL,
    total_bathrooms integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.hotel_room_types OWNER TO viet;

--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.job_batches (
    id character varying(191) NOT NULL,
    name character varying(191) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO viet;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(191) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO viet;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO viet;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.likes (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.likes OWNER TO viet;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.likes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.likes_id_seq OWNER TO viet;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    parent_id integer,
    image_url text,
    is_popular boolean DEFAULT false NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    updated_at timestamp(0) with time zone,
    country_code character varying(5) DEFAULT 'VN'::character varying NOT NULL
);


ALTER TABLE public.locations OWNER TO viet;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO viet;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.messages OWNER TO viet;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(191) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO viet;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO viet;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.password_reset_tokens (
    email character varying(191) NOT NULL,
    token character varying(191) NOT NULL,
    created_at timestamp(0) with time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO viet;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(191) NOT NULL,
    tokenable_id uuid NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO viet;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO viet;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: post_media; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.post_media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid NOT NULL,
    url text NOT NULL,
    type character varying(10) DEFAULT 'image'::character varying NOT NULL,
    "order" smallint DEFAULT '0'::smallint NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    width integer,
    height integer
);


ALTER TABLE public.post_media OWNER TO viet;

--
-- Name: post_tags; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.post_tags (
    post_id uuid NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.post_tags OWNER TO viet;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    content text,
    location_id integer,
    visibility character varying(10) DEFAULT 'public'::character varying NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(0) with time zone,
    service_id uuid
);


ALTER TABLE public.posts OWNER TO viet;

--
-- Name: provider_profiles; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.provider_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    business_name character varying(255) NOT NULL,
    business_type character varying(100),
    address text,
    rejection_reason text,
    approved_by uuid,
    approved_at timestamp(0) with time zone,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public.provider_status DEFAULT 'pending'::public.provider_status NOT NULL,
    phone character varying(20),
    description text
);


ALTER TABLE public.provider_profiles OWNER TO viet;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reporter_id uuid NOT NULL,
    post_id character varying(191),
    service_id uuid,
    description text,
    reviewed_by uuid,
    reviewed_at timestamp(0) with time zone,
    resolution_note text,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.report_type NOT NULL,
    status public.report_status DEFAULT 'pending'::public.report_status NOT NULL
);


ALTER TABLE public.reports OWNER TO viet;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    service_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating smallint NOT NULL,
    rating_cleanliness smallint,
    rating_service smallint,
    rating_value smallint,
    content text,
    is_verified boolean DEFAULT false NOT NULL,
    provider_reply text,
    provider_reply_at timestamp(0) with time zone,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    images text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE public.reviews OWNER TO viet;

--
-- Name: service_availability; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.service_availability (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    available_date date NOT NULL,
    total_slots integer DEFAULT 0 NOT NULL,
    booked_slots integer DEFAULT 0 NOT NULL,
    price_override numeric(15,2),
    is_blocked boolean DEFAULT false NOT NULL
);


ALTER TABLE public.service_availability OWNER TO viet;

--
-- Name: service_media; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.service_media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    url text NOT NULL,
    is_cover boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.media_type DEFAULT 'image'::public.media_type NOT NULL
);


ALTER TABLE public.service_media OWNER TO viet;

--
-- Name: service_schedules; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.service_schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    day_number integer NOT NULL,
    title character varying(255),
    description text,
    activities jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_schedules OWNER TO viet;

--
-- Name: service_upsells; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.service_upsells (
    id bigint NOT NULL,
    provider_id uuid NOT NULL,
    trigger_service_id uuid NOT NULL,
    trigger_quantity integer DEFAULT 2 NOT NULL,
    target_service_id uuid NOT NULL,
    upsell_price_adjustment numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    perk_service_id uuid,
    perk_discount_percent integer DEFAULT 100 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    trigger_room_type_id uuid,
    target_room_type_id uuid
);


ALTER TABLE public.service_upsells OWNER TO viet;

--
-- Name: service_upsells_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.service_upsells_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_upsells_id_seq OWNER TO viet;

--
-- Name: service_upsells_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.service_upsells_id_seq OWNED BY public.service_upsells.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    provider_id uuid NOT NULL,
    category_id integer,
    location_id integer,
    name character varying(255) NOT NULL,
    slug character varying(300) NOT NULL,
    description text,
    rejection_reason text,
    base_price numeric(15,2) NOT NULL,
    price_unit character varying(20) DEFAULT 'per_person'::character varying NOT NULL,
    address text,
    amenities jsonb DEFAULT '[]'::jsonb NOT NULL,
    includes jsonb DEFAULT '[]'::jsonb NOT NULL,
    excludes jsonb DEFAULT '[]'::jsonb NOT NULL,
    rating_avg numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    total_bookings integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(0) with time zone,
    type public.service_type NOT NULL,
    status public.service_status DEFAULT 'draft'::public.service_status NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    approval_note character varying(191)
);


ALTER TABLE public.services OWNER TO viet;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.sessions (
    id character varying(191) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO viet;

--
-- Name: social_notifications; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.social_notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    type character varying(191) NOT NULL,
    post_id uuid,
    comment_id uuid,
    data text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.social_notifications OWNER TO viet;

--
-- Name: COLUMN social_notifications.user_id; Type: COMMENT; Schema: public; Owner: viet
--

COMMENT ON COLUMN public.social_notifications.user_id IS 'Người nhận thông báo';


--
-- Name: COLUMN social_notifications.sender_id; Type: COMMENT; Schema: public; Owner: viet
--

COMMENT ON COLUMN public.social_notifications.sender_id IS 'Người gây ra hành động';


--
-- Name: COLUMN social_notifications.type; Type: COMMENT; Schema: public; Owner: viet
--

COMMENT ON COLUMN public.social_notifications.type IS 'like, comment, follow, reply';


--
-- Name: COLUMN social_notifications.data; Type: COMMENT; Schema: public; Owner: viet
--

COMMENT ON COLUMN public.social_notifications.data IS 'Lưu thông tin bổ sung dưới dạng JSON';


--
-- Name: social_profiles; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.social_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    username character varying(30) NOT NULL,
    bio text,
    cover_photo_url text,
    website_url character varying(255),
    is_verified boolean DEFAULT false NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    following_count integer DEFAULT 0 NOT NULL,
    posts_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.social_profiles OWNER TO viet;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.system_settings (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    type character varying(20) DEFAULT 'string'::character varying NOT NULL,
    description text,
    updated_by uuid,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.system_settings OWNER TO viet;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    type character varying(20) DEFAULT 'category'::character varying NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tags OWNER TO viet;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO viet;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tour_details; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.tour_details (
    service_id uuid NOT NULL,
    duration_days integer DEFAULT 1 NOT NULL,
    duration_nights integer DEFAULT 0 NOT NULL,
    max_guests integer DEFAULT 50 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.tour_details OWNER TO viet;

--
-- Name: tourist_profiles; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.tourist_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    phone_number character varying(20),
    gender character varying(255),
    date_of_birth date,
    nationality character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(191),
    CONSTRAINT tourist_profiles_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.tourist_profiles OWNER TO viet;

--
-- Name: user_behaviors; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.user_behaviors (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    action_type character varying(30) NOT NULL,
    post_id uuid,
    tag_id bigint,
    location_id integer,
    service_id uuid,
    metadata jsonb,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    score numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    tags jsonb,
    is_pending boolean DEFAULT false NOT NULL,
    updated_at timestamp(0) without time zone,
    service_type character varying(191)
);


ALTER TABLE public.user_behaviors OWNER TO viet;

--
-- Name: user_behaviors_id_seq; Type: SEQUENCE; Schema: public; Owner: viet
--

CREATE SEQUENCE public.user_behaviors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_behaviors_id_seq OWNER TO viet;

--
-- Name: user_behaviors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: viet
--

ALTER SEQUENCE public.user_behaviors_id_seq OWNED BY public.user_behaviors.id;


--
-- Name: user_recommendations; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.user_recommendations (
    user_id uuid NOT NULL,
    location_id integer,
    suggested_services jsonb,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_anchor_type public.service_type
);


ALTER TABLE public.user_recommendations OWNER TO viet;

--
-- Name: users; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firebase_uid character varying(191),
    email character varying(191) NOT NULL,
    display_name character varying(100) NOT NULL,
    avatar_url text,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role public.user_role DEFAULT 'tourist'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    social_active boolean DEFAULT false NOT NULL,
    last_promo_sent_at timestamp(0) without time zone,
    phone character varying(20)
);


ALTER TABLE public.users OWNER TO viet;

--
-- Name: vehicle_details; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.vehicle_details (
    service_id uuid NOT NULL,
    vehicle_type character varying(50),
    seats integer,
    transmission character varying(50),
    fuel_type character varying(50),
    inventory integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.vehicle_details OWNER TO viet;

--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.wallet_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    wallet_id uuid NOT NULL,
    booking_id uuid,
    amount numeric(15,2) NOT NULL,
    balance_before numeric(15,2) NOT NULL,
    balance_after numeric(15,2) NOT NULL,
    note text,
    momo_trans_id character varying(100),
    momo_result_code integer,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public.transaction_type NOT NULL
);


ALTER TABLE public.wallet_transactions OWNER TO viet;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: viet
--

CREATE TABLE public.wallets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    locked_balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(5) DEFAULT 'VND'::character varying NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wallets OWNER TO viet;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: follows id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.follows ALTER COLUMN id SET DEFAULT nextval('public.follows_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: service_upsells id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells ALTER COLUMN id SET DEFAULT nextval('public.service_upsells_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: user_behaviors id; Type: DEFAULT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors ALTER COLUMN id SET DEFAULT nextval('public.user_behaviors_id_seq'::regclass);


--
-- Name: automation_logs automation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_code_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_code_unique UNIQUE (booking_code);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_user_one_user_two_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_one_user_two_unique UNIQUE (user_one, user_two);


--
-- Name: coupons coupons_code_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_unique UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: follows follows_follower_id_following_id_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_following_id_unique UNIQUE (follower_id, following_id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- Name: homestay_details homestay_details_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.homestay_details
    ADD CONSTRAINT homestay_details_pkey PRIMARY KEY (service_id);


--
-- Name: hotel_details hotel_details_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.hotel_details
    ADD CONSTRAINT hotel_details_pkey PRIMARY KEY (service_id);


--
-- Name: hotel_room_types hotel_room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.hotel_room_types
    ADD CONSTRAINT hotel_room_types_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_user_id_post_id_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_post_id_unique UNIQUE (user_id, post_id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: locations locations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_slug_unique UNIQUE (slug);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: post_media post_media_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.post_media
    ADD CONSTRAINT post_media_pkey PRIMARY KEY (id);


--
-- Name: post_tags post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_pkey PRIMARY KEY (post_id, tag_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: provider_profiles provider_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_booking_id_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: service_availability service_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_availability
    ADD CONSTRAINT service_availability_pkey PRIMARY KEY (id);


--
-- Name: service_media service_media_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_media
    ADD CONSTRAINT service_media_pkey PRIMARY KEY (id);


--
-- Name: service_schedules service_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_schedules
    ADD CONSTRAINT service_schedules_pkey PRIMARY KEY (id);


--
-- Name: service_upsells service_upsells_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_slug_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_slug_unique UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: social_notifications social_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_notifications
    ADD CONSTRAINT social_notifications_pkey PRIMARY KEY (id);


--
-- Name: social_profiles social_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_profiles
    ADD CONSTRAINT social_profiles_pkey PRIMARY KEY (id);


--
-- Name: social_profiles social_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_profiles
    ADD CONSTRAINT social_profiles_user_id_unique UNIQUE (user_id);


--
-- Name: social_profiles social_profiles_username_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_profiles
    ADD CONSTRAINT social_profiles_username_unique UNIQUE (username);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: tags tags_name_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_unique UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tour_details tour_details_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tour_details
    ADD CONSTRAINT tour_details_pkey PRIMARY KEY (service_id);


--
-- Name: tourist_profiles tourist_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tourist_profiles
    ADD CONSTRAINT tourist_profiles_pkey PRIMARY KEY (id);


--
-- Name: tourist_profiles tourist_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tourist_profiles
    ADD CONSTRAINT tourist_profiles_user_id_unique UNIQUE (user_id);


--
-- Name: user_behaviors user_behaviors_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors
    ADD CONSTRAINT user_behaviors_pkey PRIMARY KEY (id);


--
-- Name: user_recommendations user_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_recommendations
    ADD CONSTRAINT user_recommendations_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_firebase_uid_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_unique UNIQUE (firebase_uid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_details vehicle_details_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.vehicle_details
    ADD CONSTRAINT vehicle_details_pkey PRIMARY KEY (service_id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: provider_profiles_user_id_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX provider_profiles_user_id_index ON public.provider_profiles USING btree (user_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: social_notifications_user_id_created_at_index; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX social_notifications_user_id_created_at_index ON public.social_notifications USING btree (user_id, created_at);


--
-- Name: ub_user_action_idx; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX ub_user_action_idx ON public.user_behaviors USING btree (user_id, action_type);


--
-- Name: ub_user_location_idx; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX ub_user_location_idx ON public.user_behaviors USING btree (user_id, location_id);


--
-- Name: ub_user_tag_idx; Type: INDEX; Schema: public; Owner: viet
--

CREATE INDEX ub_user_tag_idx ON public.user_behaviors USING btree (user_id, tag_id);


--
-- Name: automation_logs automation_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_coupon_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_coupon_id_foreign FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id);


--
-- Name: bookings bookings_room_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_type_id_foreign FOREIGN KEY (room_type_id) REFERENCES public.hotel_room_types(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: bookings bookings_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comments comments_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_one_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_one_foreign FOREIGN KEY (user_one) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_two_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_two_foreign FOREIGN KEY (user_two) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coupons coupons_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: follows follows_follower_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_foreign FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_foreign FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: homestay_details homestay_details_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.homestay_details
    ADD CONSTRAINT homestay_details_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: hotel_details hotel_details_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.hotel_details
    ADD CONSTRAINT hotel_details_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: hotel_room_types hotel_room_types_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.hotel_room_types
    ADD CONSTRAINT hotel_room_types_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: likes likes_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: locations locations_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: messages messages_conversation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_foreign FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_foreign FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_media post_media_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.post_media
    ADD CONSTRAINT post_media_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_tag_id_foreign FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: posts posts_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: posts posts_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: posts posts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: provider_profiles provider_profiles_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: provider_profiles provider_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_foreign FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: reports reports_reviewed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: reports reports_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: reviews reviews_booking_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_foreign FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: reviews reviews_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: reviews reviews_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: service_availability service_availability_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_availability
    ADD CONSTRAINT service_availability_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_media service_media_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_media
    ADD CONSTRAINT service_media_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_schedules service_schedules_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_schedules
    ADD CONSTRAINT service_schedules_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_upsells service_upsells_perk_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_perk_service_id_foreign FOREIGN KEY (perk_service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: service_upsells service_upsells_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_upsells service_upsells_target_room_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_target_room_type_id_foreign FOREIGN KEY (target_room_type_id) REFERENCES public.hotel_room_types(id) ON DELETE SET NULL;


--
-- Name: service_upsells service_upsells_target_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_target_service_id_foreign FOREIGN KEY (target_service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_upsells service_upsells_trigger_room_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_trigger_room_type_id_foreign FOREIGN KEY (trigger_room_type_id) REFERENCES public.hotel_room_types(id) ON DELETE SET NULL;


--
-- Name: service_upsells service_upsells_trigger_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.service_upsells
    ADD CONSTRAINT service_upsells_trigger_service_id_foreign FOREIGN KEY (trigger_service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services services_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: services services_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: services services_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id) ON DELETE CASCADE;


--
-- Name: social_notifications social_notifications_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_notifications
    ADD CONSTRAINT social_notifications_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: social_notifications social_notifications_sender_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_notifications
    ADD CONSTRAINT social_notifications_sender_id_foreign FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: social_notifications social_notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_notifications
    ADD CONSTRAINT social_notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: social_profiles social_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.social_profiles
    ADD CONSTRAINT social_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: system_settings system_settings_updated_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_foreign FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: tour_details tour_details_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tour_details
    ADD CONSTRAINT tour_details_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: tourist_profiles tourist_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.tourist_profiles
    ADD CONSTRAINT tourist_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_behaviors user_behaviors_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors
    ADD CONSTRAINT user_behaviors_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: user_behaviors user_behaviors_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors
    ADD CONSTRAINT user_behaviors_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE SET NULL;


--
-- Name: user_behaviors user_behaviors_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors
    ADD CONSTRAINT user_behaviors_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: user_behaviors user_behaviors_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors
    ADD CONSTRAINT user_behaviors_tag_id_foreign FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE SET NULL;


--
-- Name: user_behaviors user_behaviors_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_behaviors
    ADD CONSTRAINT user_behaviors_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_recommendations user_recommendations_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_recommendations
    ADD CONSTRAINT user_recommendations_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: user_recommendations user_recommendations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.user_recommendations
    ADD CONSTRAINT user_recommendations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vehicle_details vehicle_details_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.vehicle_details
    ADD CONSTRAINT vehicle_details_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_booking_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_booking_id_foreign FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: wallet_transactions wallet_transactions_wallet_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_wallet_id_foreign FOREIGN KEY (wallet_id) REFERENCES public.wallets(id);


--
-- Name: wallets wallets_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: viet
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: FUNCTION gtrgm_in(cstring); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO viet;


--
-- Name: FUNCTION gtrgm_out(public.gtrgm); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO viet;


--
-- Name: TYPE gtrgm; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public.gtrgm TO viet;


--
-- Name: FUNCTION gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO viet;


--
-- Name: FUNCTION gin_extract_value_trgm(text, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO viet;


--
-- Name: FUNCTION gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO viet;


--
-- Name: FUNCTION gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO viet;


--
-- Name: FUNCTION gtrgm_compress(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO viet;


--
-- Name: FUNCTION gtrgm_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO viet;


--
-- Name: FUNCTION gtrgm_decompress(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO viet;


--
-- Name: FUNCTION gtrgm_distance(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO viet;


--
-- Name: FUNCTION gtrgm_options(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO viet;


--
-- Name: FUNCTION gtrgm_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO viet;


--
-- Name: FUNCTION gtrgm_picksplit(internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO viet;


--
-- Name: FUNCTION gtrgm_same(public.gtrgm, public.gtrgm, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO viet;


--
-- Name: FUNCTION gtrgm_union(internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO viet;


--
-- Name: FUNCTION set_limit(real); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_limit(real) TO viet;


--
-- Name: FUNCTION show_limit(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.show_limit() TO viet;


--
-- Name: FUNCTION show_trgm(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.show_trgm(text) TO viet;


--
-- Name: FUNCTION similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity(text, text) TO viet;


--
-- Name: FUNCTION similarity_dist(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO viet;


--
-- Name: FUNCTION similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity_op(text, text) TO viet;


--
-- Name: FUNCTION strict_word_similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO viet;


--
-- Name: FUNCTION strict_word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO viet;


--
-- Name: FUNCTION strict_word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO viet;


--
-- Name: FUNCTION strict_word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO viet;


--
-- Name: FUNCTION strict_word_similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO viet;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO viet;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO viet;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO viet;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO viet;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO viet;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_nil() TO viet;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO viet;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO viet;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO viet;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO viet;


--
-- Name: FUNCTION word_similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity(text, text) TO viet;


--
-- Name: FUNCTION word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO viet;


--
-- Name: FUNCTION word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO viet;


--
-- Name: FUNCTION word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO viet;


--
-- Name: FUNCTION word_similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO viet;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO viet;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO viet;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO viet;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO viet;


--
-- PostgreSQL database dump complete
--

\unrestrict J3eBk8BFpabUpTZGbvFJ9xWfMO7VmNph3PyKPsZiwdmPZYwjECrA8aUmfUmQJQc

