-- ============================================================
--  fix_data.sql
--  Corrige os dados errados na base de dados ao vivo
--  Executa no phpMyAdmin ou via CLI: mysql -u root centro-paroquial-moita < fix_data.sql
-- ============================================================

-- Corrigir page_contents
UPDATE page_contents SET conteudoPagina = 'Centro Paroquial da Moita'
    WHERE nomePagina = 'inicio' AND chaveSecção = 'hero_titulo';

UPDATE page_contents SET conteudoPagina = 'Ao serviço da comunidade da Moita'
    WHERE nomePagina = 'inicio' AND chaveSecção = 'hero_subtitulo';

UPDATE page_contents SET conteudoPagina = 'O Centro Paroquial da Moita é uma instituição particular de solidariedade social da Igreja Católica, canonicamente erecta, com personalidade jurídica no foro canónico e civil, pertencente à Paróquia da Moita.'
    WHERE nomePagina = 'sobre_nos' AND chaveSecção = 'historia_texto';

UPDATE page_contents SET conteudoPagina = 'https://maps.google.com/?q=Rua+Bartolomeu+Dias+11,+Moita'
    WHERE nomePagina = 'contactos' AND chaveSecção = 'mapa_url';

-- Corrigir contactos
UPDATE contacts SET valor = '+351 265 539 941'          WHERE tipo = 'telefone';
UPDATE contacts SET valor = 'geral@diocese-setubal.pt'  WHERE tipo = 'email';
UPDATE contacts SET valor = 'Rua Bartolomeu Dias, nºs 11-13, 2860-438 Moita' WHERE tipo = 'morada';
UPDATE contacts SET valor = 'https://www.facebook.com/centroparoquialmoita'  WHERE tipo = 'facebook';
