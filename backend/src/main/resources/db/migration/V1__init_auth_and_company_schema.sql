-- V1__init_auth_and_company_schema.sql
-- Khởi tạo bảng cho Epic 01 (Authentication) & Epic 02 (Companies Management)

-- 1. Bảng companies (Doanh nghiệp)
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subdomain VARCHAR(255) UNIQUE,
    tax_code VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain);

-- 2. Bảng users (Admin & HR)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'HR',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Gắn khóa ngoại approved_by của companies trỏ về users(id)
ALTER TABLE companies
    ADD CONSTRAINT fk_companies_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Bảng company_profiles (Branding và mô tả doanh nghiệp)
CREATE TABLE IF NOT EXISTS company_profiles (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#2563eb',
    description TEXT,
    benefits TEXT,
    social_links TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng career_sites (Cấu hình giao diện Career Site riêng)
CREATE TABLE IF NOT EXISTS career_sites (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    site_title VARCHAR(255),
    tagline VARCHAR(255),
    hero_image_url TEXT,
    accent_color VARCHAR(20) DEFAULT '#2563eb',
    font_family VARCHAR(100) DEFAULT 'Inter',
    show_company_description BOOLEAN DEFAULT TRUE,
    show_benefits BOOLEAN DEFAULT TRUE,
    footer_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed tài khoản Admin mặc định: admin@easytech.vn / Admin@123
-- Hash: $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.EmWXeUsQLmq6q (Admin@123)
INSERT INTO users (email, full_name, role, status, password_hash, created_at, updated_at)
VALUES (
    'admin@easytech.vn',
    'System Administrator',
    'ADMIN',
    'ACTIVE',
    '$2b$12$OcWdOcZLmmnqzZR2dunXj.rRC2oAzDboNqEnzAUrlZxgMfAWRzsiO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
