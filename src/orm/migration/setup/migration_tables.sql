-- LyraJS Migration System - Tracking Tables
-- These tables are automatically created when running migrations for the first time

-- Main migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
  version VARCHAR(255) PRIMARY KEY,
  executed_at DATETIME NOT NULL,
  execution_time INT,
  batch INT NOT NULL,
  squashed BOOLEAN DEFAULT FALSE,
  backup_path VARCHAR(500) NULL,
  INDEX idx_batch (batch),
  INDEX idx_squashed (squashed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration lock table (prevents concurrent migrations)
CREATE TABLE IF NOT EXISTS migration_lock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  locked_at DATETIME NOT NULL,
  hostname VARCHAR(255) NOT NULL,
  process_id INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
