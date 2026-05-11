-- ============================================================
--  indexes.sql — Índices de performance
--  Executar UMA VEZ após instalação:
--  mysql -u root centro-paroquial-moita < db/indexes.sql
--
--  Usar IF NOT EXISTS para ser seguro em re-execuções.
-- ============================================================

-- news: filtro por estado + ordenação por data (queries mais frequentes)
CREATE INDEX IF NOT EXISTS idx_news_idstate_datehour ON news (idState, dateHour DESC);

-- images: lookup por notícia (elimina full scan no N+1)
CREATE INDEX IF NOT EXISTS idx_images_idnews ON images (idNews);

-- services: filtro por estado
CREATE INDEX IF NOT EXISTS idx_services_idstate ON services (idState);

-- contacts: filtro por estado
CREATE INDEX IF NOT EXISTS idx_contacts_idstate ON contacts (idState);

-- docs: filtro por estado + ano + tipo (listagem e download de relatórios)
CREATE INDEX IF NOT EXISTS idx_docs_idstate_year ON docs (idState, year DESC);

-- page_contents: lookup por nome da página (chamada em cada página pública)
CREATE INDEX IF NOT EXISTS idx_pagecontents_nomepagina ON page_contents (nomePagina);

-- admin_tokens: lookup por token (chamado em TODOS os pedidos autenticados)
CREATE INDEX IF NOT EXISTS idx_tokens_token ON admin_tokens (token);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON admin_tokens (expires_at);

-- login_attempts: lookup por IP + data (rate limiting)
CREATE INDEX IF NOT EXISTS idx_loginattempts_ip_time ON login_attempts (ip, attempted_at);

-- logs: ordenação por data (listagem de logs)
CREATE INDEX IF NOT EXISTS idx_logs_datehour ON logs (dateHour DESC);
