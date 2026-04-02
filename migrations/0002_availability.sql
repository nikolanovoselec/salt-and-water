-- Availability blocks table
-- Uses half-open interval: [check_in, check_out) — checkout day is available for new check-in

CREATE TABLE IF NOT EXISTS availability_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id TEXT NOT NULL,
  check_in TEXT NOT NULL,  -- YYYY-MM-DD
  check_out TEXT NOT NULL, -- YYYY-MM-DD (exclusive)
  source TEXT DEFAULT 'manual', -- manual | ics | inquiry
  inquiry_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_avail_apartment ON availability_blocks(apartment_id);
CREATE INDEX IF NOT EXISTS idx_avail_dates ON availability_blocks(apartment_id, check_in, check_out);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- booking | question
  apartment_id TEXT,
  check_in TEXT,
  check_out TEXT,
  adults INTEGER,
  children_under_12 INTEGER DEFAULT 0,
  children_12_to_17 INTEGER DEFAULT 0,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  has_pets INTEGER DEFAULT 0,
  pet_note TEXT,
  locale TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new | read | responded | confirmed | declined | spam
  email_status TEXT NOT NULL DEFAULT 'pending', -- pending | sent | retry | failed
  retry_at TEXT,
  email_attempts INTEGER DEFAULT 0,
  gdpr_consent_at TEXT NOT NULL,
  turnstile_verified INTEGER DEFAULT 0,
  source TEXT DEFAULT 'form', -- form | quick-question
  referrer TEXT,
  price_estimate REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_email_status ON inquiries(email_status);
CREATE INDEX IF NOT EXISTS idx_inquiries_apartment ON inquiries(apartment_id);

-- Analytics events table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- inquiry_submit | whatsapp_click | call_click | gallery_open | language_switch | calendar_select
  apartment_slug TEXT,
  locale TEXT,
  page_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(created_at);

-- Redirects table for slug history
CREATE TABLE IF NOT EXISTS redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  old_slug TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- apartment | page | guide-entry
  entity_id TEXT NOT NULL,
  current_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_redirects_lookup ON redirects(locale, old_slug);
