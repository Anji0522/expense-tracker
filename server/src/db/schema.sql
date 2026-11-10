-- ==========================================
-- EXPENSE TRACKER DATABASE
-- PostgreSQL Database Schema
-- ==========================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash TEXT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_name_check CHECK (LENGTH(TRIM(name)) >= 2),
    CONSTRAINT users_currency_check CHECK (currency ~ '^[A-Z]{3}$')
);

-- Emails should be unique regardless of uppercase/lowercase.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- 2. DEFAULT CATEGORY TEMPLATES
-- These are shared templates, not user-owned expenses.
CREATE TABLE IF NOT EXISTS default_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    icon VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT default_categories_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- 3. USER CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    icon VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT categories_name_check CHECK (LENGTH(TRIM(name)) >= 2),
    CONSTRAINT categories_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT unique_user_category UNIQUE (user_id, name),
    CONSTRAINT unique_user_category_id UNIQUE (user_id, id)
);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description VARCHAR(200),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT expenses_amount_check CHECK (amount > 0),
    CONSTRAINT expenses_description_check CHECK (
        description IS NULL OR LENGTH(TRIM(description)) <= 200
    )
);

-- 5. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    limit_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT budgets_amount_check CHECK (limit_amount > 0),
    CONSTRAINT budgets_month_check CHECK (EXTRACT(DAY FROM month) = 1),
    CONSTRAINT unique_user_category_month UNIQUE (user_id, category_id, month)
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);

-- ==========================================
-- SCHEMA CREATION COMPLETED
-- ==========================================
