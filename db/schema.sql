-- thelocaldesk.au — initial MySQL schema
-- Payments live in Stripe (Checkout + Billing); these tables only mirror
-- the state we need locally: who the member is and whether they're current.

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NULL,
  stripe_customer_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_stripe_customer_id (stripe_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per Stripe Subscription — mirrors membership status so the app
-- can gate access without calling Stripe on every request.
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) NULL,
  plan_key VARCHAR(50) NOT NULL, -- hot_desk | dedicated_desk | private_office
  status VARCHAR(50) NOT NULL,   -- mirrors Stripe subscription status: trialing, active, past_due, canceled, ...
  current_period_end TIMESTAMP NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subscriptions_stripe_id (stripe_subscription_id),
  KEY idx_subscriptions_user_id (user_id),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One-time purchases: day passes and per-hour meeting room bookings.
CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  stripe_checkout_session_id VARCHAR(255) NOT NULL,
  item_key VARCHAR(50) NOT NULL, -- day_pass | meeting_room_hourly
  amount_total INT NOT NULL,     -- in cents (AUD)
  currency VARCHAR(10) NOT NULL DEFAULT 'aud',
  status VARCHAR(50) NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookings_session_id (stripe_checkout_session_id),
  KEY idx_bookings_user_id (user_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Webhook idempotency log — Stripe can and will deliver the same event
-- more than once; this lets the handler skip work it already did.
CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stripe_event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_webhook_events_stripe_id (stripe_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Get in touch form submissions — kept as a durable record independent of
-- the Brevo transactional email actually sending (it can fail or land in
-- spam without us knowing otherwise).
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_contact_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Print jobs ("Printing" page): uploaded files live here, split into small
-- chunks so a single INSERT never exceeds a managed DB's max_allowed_packet.
-- Customers upload before paying, so rows start 'pending' and the Stripe
-- webhook flips them to 'paid'. Rows are purged lazily (see
-- src/lib/printFiles.ts) — unpaid after 2 days, everything after 30.
CREATE TABLE IF NOT EXISTS print_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ref CHAR(8) NOT NULL,
  price_id VARCHAR(255) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_print_orders_ref (ref),
  KEY idx_print_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS print_files (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  KEY idx_print_files_order_id (order_id),
  CONSTRAINT fk_print_files_order FOREIGN KEY (order_id) REFERENCES print_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS print_file_chunks (
  file_id BIGINT UNSIGNED NOT NULL,
  seq INT UNSIGNED NOT NULL,
  data MEDIUMBLOB NOT NULL,
  PRIMARY KEY (file_id, seq),
  CONSTRAINT fk_print_chunks_file FOREIGN KEY (file_id) REFERENCES print_files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
