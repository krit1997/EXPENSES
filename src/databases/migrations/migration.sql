-- extensions (ถ้ายังไม่มี)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BUDGETS (ตั้งงบรายหมวด/งบรวม)
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,                           -- 'YYYY-MM'
  scope TEXT NOT NULL CHECK (scope IN ('category','total')),
  category_id UUID REFERENCES categories(id),    -- null เมื่อ scope='total'
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_budget UNIQUE (month, scope, category_id)
);

-- TRANSACTIONS (สำหรับสรุปรายงาน/แจ้งเตือนงบ)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  month TEXT GENERATED ALWAYS AS (to_char(date, 'YYYY-MM')) STORED
);

CREATE INDEX idx_tx_month ON transactions(month);
CREATE INDEX idx_budget_month ON budgets(month);
