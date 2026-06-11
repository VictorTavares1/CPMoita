-- ============================================================
--  producao.sql — Base de dados limpa para cpasmo_site
--  Importar via phpMyAdmin: selecionar cpasmo_site → Import
-- ============================================================

SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;

-- ------------------------------------------------------------
--  Tabela: states
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `states`;
CREATE TABLE `states` (
  `id` int(1) NOT NULL AUTO_INCREMENT,
  `state` varchar(7) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `states` VALUES (1,'ativo'),(2,'inativo');

-- ------------------------------------------------------------
--  Tabela: types
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `types`;
CREATE TABLE `types` (
  `id` int(1) NOT NULL AUTO_INCREMENT,
  `type` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `types` VALUES (1,'Relatório de Contas'),(2,'Relatório de Atividades');

-- ------------------------------------------------------------
--  Tabela: operations
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `operations`;
CREATE TABLE `operations` (
  `id` int(1) NOT NULL AUTO_INCREMENT,
  `title` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `operations` VALUES
  (1,'INSERIR_NOTICIA'),
  (2,'EDITAR_NOTICIA'),
  (3,'DESATIVAR_NOTICIA'),
  (4,'INSERIR_RELATORIO'),
  (5,'EDITAR_RELATORIO'),
  (6,'DESATIVAR_RELATORIO'),
  (7,'INSERIR_SERVIÇO'),
  (8,'EDITAR_SERVIÇO'),
  (9,'DESATIVAR_SERVIÇO'),
  (10,'INSERIR_CONTACTO'),
  (11,'EDITAR_CONTACTO'),
  (12,'DESATIVAR_CONTACTO'),
  (13,'EDITAR_CONTEUDO_PAGINA'),
  (14,'LOGIN');

-- ------------------------------------------------------------
--  Tabela: users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `email` varchar(320) NOT NULL,
  `password` varchar(255) NOT NULL,
  `idState` int(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idState` (`idState`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`idState`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- ------------------------------------------------------------
--  Tabela: news
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `dateHour` datetime NOT NULL DEFAULT current_timestamp(),
  `idState` int(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idState` (`idState`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`idState`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ------------------------------------------------------------
--  Tabela: images
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `images`;
CREATE TABLE `images` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `url` varchar(150) NOT NULL,
  `idNews` int(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idNews` (`idNews`),
  CONSTRAINT `images_ibfk_1` FOREIGN KEY (`idNews`) REFERENCES `news` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ------------------------------------------------------------
--  Tabela: docs
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `docs`;
CREATE TABLE `docs` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `url` varchar(150) NOT NULL,
  `idType` int(3) NOT NULL,
  `idState` int(1) NOT NULL DEFAULT 1,
  `year` int(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idType` (`idType`),
  KEY `idState` (`idState`),
  CONSTRAINT `docs_ibfk_1` FOREIGN KEY (`idType`) REFERENCES `types` (`id`),
  CONSTRAINT `docs_ibfk_2` FOREIGN KEY (`idState`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ------------------------------------------------------------
--  Tabela: services
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descricao` text NOT NULL,
  `coordenador` varchar(255) DEFAULT NULL,
  `capacidade` varchar(100) DEFAULT NULL,
  `funcionamento` varchar(100) DEFAULT NULL,
  `servicosPrestados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`servicosPrestados`)),
  `descricaoCentroDia` text DEFAULT NULL,
  `links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`links`)),
  `iconeOuImagem` varchar(200) NOT NULL,
  `idState` int(1) NOT NULL DEFAULT 1,
  `criadoEm` datetime NOT NULL DEFAULT current_timestamp(),
  `atualizadoEm` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idState` (`idState`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`idState`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `services` (`titulo`, `descricao`, `iconeOuImagem`) VALUES
  ('Creche O Regaço', 'Resposta social que acolhe crianças dos 4 meses aos 3 anos de idade, proporcionando um ambiente seguro e estimulante para o seu desenvolvimento.', 'fa-solid fa-baby'),
  ('Pré-Escolar O Ninho', 'Resposta educativa para crianças dos 3 aos 6 anos, com atividades pedagógicas que promovem a criatividade e a socialização.', 'fa-solid fa-children'),
  ('CATL O Barco', 'Centro de Atividades de Tempos Livres que apoia crianças em idade escolar com acompanhamento ao estudo e atividades de lazer.', 'fa-solid fa-book-open'),
  ('ERPI', 'Estrutura Residencial para Pessoas Idosas que garante cuidados de saúde, bem-estar e qualidade de vida aos nossos seniores.', 'fa-solid fa-house-medical');

-- ------------------------------------------------------------
--  Tabela: contacts
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(30) NOT NULL,
  `valor` varchar(150) NOT NULL,
  `icone` varchar(80) NOT NULL,
  `idState` int(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idState` (`idState`),
  CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`idState`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `contacts` (`tipo`, `valor`, `icone`) VALUES
  ('telefone', '+351 265 539 941', 'fa-solid fa-phone'),
  ('email', 'geral@diocese-setubal.pt', 'fa-solid fa-envelope'),
  ('morada', 'Rua Bartolomeu Dias, nºs 11-13, 2860-438 Moita', 'fa-solid fa-location-dot'),
  ('facebook', 'https://www.facebook.com/centroparoquialmoita', 'fa-brands fa-facebook');

-- ------------------------------------------------------------
--  Tabela: page_contents
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `page_contents`;
CREATE TABLE `page_contents` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `nomePagina` varchar(50) NOT NULL,
  `chaveSecção` varchar(80) NOT NULL,
  `tipoConteudo` varchar(10) NOT NULL,
  `conteudoPagina` text NOT NULL,
  `atualizadoEm` datetime NOT NULL DEFAULT current_timestamp(),
  `idUtilizador` int(2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idUtilizador` (`idUtilizador`),
  CONSTRAINT `page_contents_ibfk_1` FOREIGN KEY (`idUtilizador`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `page_contents` (`nomePagina`, `chaveSecção`, `tipoConteudo`, `conteudoPagina`) VALUES
  ('inicio', 'hero_titulo', 'text', 'Centro Paroquial da Moita'),
  ('inicio', 'hero_subtitulo', 'text', 'Ao serviço da comunidade da Moita'),
  ('inicio', 'missao_titulo', 'text', 'A Nossa Missão'),
  ('inicio', 'missao_texto', 'html', 'Prestar assistência, educação e acompanhamento a pessoas de diferentes idades, promovendo a inclusão e o bem-estar social.'),
  ('sobre_nos', 'historia_titulo', 'text', 'A Nossa História'),
  ('sobre_nos', 'historia_texto', 'html', '<p>O Centro Paroquial de Ação Social da Moita é uma Instituição Particular de Solidariedade Social (IPSS) sem fins lucrativos, integrada na Paróquia da Moita (Diocese de Setúbal).</p><p>Fundado em abril de 1952, tem como propósito apoiar os mais carenciados, promovendo a dignidade humana, o respeito pelo próximo e o espírito de solidariedade cristã.</p><p>Com 73 anos de história, desenvolve atualmente a sua atividade nas áreas da Infância e Sénior, apoiando diariamente cerca de 300 utentes, com o contributo de 82 colaboradores e uma Direção voluntária.</p><h5>Percurso Histórico</h5><ul><li>1952 – Fundado pelo Padre João Evangelista como Centro Paroquial de Assistência da Moita, com orfanatos para meninas e rapazes e um asilo para idosos.</li><li>Padre Fernando Belo – Transferiu o lar de idosos para Sarilhos Pequenos, criando o Lar Nossa Senhora da Boa Viagem, o Centro de Dia (1982), o Jardim de Infância "O Ninho" e o CATL "O Barco".</li><li>Padre João Tavares – Construiu o novo edifício do Jardim de Infância e CATL, inaugurado em 2004.</li><li>Padre Sílvio Couto – Criou a resposta social Creche "O Regaço".</li><li>Atualmente – Sob a presidência do Padre Nuno Pacheco, a instituição continua a crescer e a responder aos desafios sociais.</li></ul><h5>Missão</h5><p>Promover a dignidade humana através de respostas sociais dirigidas a crianças, famílias e idosos, especialmente os mais vulneráveis.</p><h5>Visão</h5><p>Ser uma instituição de referência regional pela qualidade das respostas sociais e pelo impacto positivo na comunidade.</p><h5>Objetivos Estratégicos</h5><ul><li>Valorizar a qualidade dos serviços prestados.</li><li>Reforçar a sustentabilidade financeira.</li><li>Desenvolver a comunicação e imagem institucional.</li><li>Perspetivar a construção de um novo equipamento para a ERPI.</li></ul>'),
  ('sobre_nos', 'valores_titulo', 'text', 'Os Nossos Valores'),
  ('sobre_nos', 'valores_texto', 'html', '<ul><li><strong>Matriz Cristã</strong> – Inspiração na doutrina social da Igreja Católica.</li><li><strong>Equidade</strong> – Acesso justo e transparente aos cuidados.</li><li><strong>Sustentabilidade</strong> – Gestão responsável e equilibrada.</li></ul>'),
  ('contactos', 'mapa_url', 'text', 'https://maps.google.com/?q=Rua+Bartolomeu+Dias+11,+Moita');

-- ------------------------------------------------------------
--  Tabela: logs
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `dateHour` datetime NOT NULL DEFAULT current_timestamp(),
  `idReport` int(3) DEFAULT NULL,
  `idNews` int(3) DEFAULT NULL,
  `idAdmin` int(3) DEFAULT NULL,
  `idOperation` int(1) NOT NULL,
  `idUser` int(2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idReport` (`idReport`),
  KEY `idNews` (`idNews`),
  KEY `idAdmin` (`idAdmin`),
  KEY `idOperation` (`idOperation`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`idReport`) REFERENCES `docs` (`id`),
  CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`idNews`) REFERENCES `news` (`id`),
  CONSTRAINT `logs_ibfk_3` FOREIGN KEY (`idAdmin`) REFERENCES `users` (`id`),
  CONSTRAINT `logs_ibfk_4` FOREIGN KEY (`idOperation`) REFERENCES `operations` (`id`),
  CONSTRAINT `logs_ibfk_5` FOREIGN KEY (`idUser`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ------------------------------------------------------------
--  Tabela: admin_tokens
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `admin_tokens`;
CREATE TABLE `admin_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
--  Tabela: login_attempts
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `login_attempts`;
CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) NOT NULL,
  `attempted_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ip` (`ip`),
  KEY `idx_time` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
--  Índices de performance
-- ------------------------------------------------------------
CREATE INDEX idx_news_idstate_datehour ON news (idState, dateHour DESC);
CREATE INDEX idx_images_idnews ON images (idNews);
CREATE INDEX idx_services_idstate ON services (idState);
CREATE INDEX idx_contacts_idstate ON contacts (idState);
CREATE INDEX idx_docs_idstate_year ON docs (idState, year DESC);
CREATE INDEX idx_pagecontents_nomepagina ON page_contents (nomePagina);

SET FOREIGN_KEY_CHECKS=1;
