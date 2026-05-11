-- ============================================================
--  schema-extras.sql
--  Tabelas auxiliares criadas em runtime — passar para o schema
--  Executar UMA VEZ: mysql -u root centro-paroquial-moita < db/schema-extras.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT         NOT NULL,
    token      VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME    NOT NULL,
    created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_attempts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    ip           VARCHAR(45) NOT NULL,
    attempted_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_time (ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
