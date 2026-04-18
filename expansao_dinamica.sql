-- ============================================================
--  expansao_dinamica.sql
--  Novas tabelas para o projeto CPMoita (Angular Migration)
--  Adicionar à base de dados: centro-paroquial-moita
-- ============================================================

-- Novos tipos de operação para o sistema de logs
insert into operations(title) values ('INSERIR_SERVIÇO');
insert into operations(title) values ('EDITAR_SERVIÇO');
insert into operations(title) values ('DESATIVAR_SERVIÇO');
insert into operations(title) values ('INSERIR_CONTACTO');
insert into operations(title) values ('EDITAR_CONTACTO');
insert into operations(title) values ('DESATIVAR_CONTACTO');
insert into operations(title) values ('EDITAR_CONTEUDO_PAGINA');

-- ------------------------------------------------------------
--  Tabela: page_contents
--  Guarda os textos, títulos e imagens editáveis de cada página
-- ------------------------------------------------------------
create table page_contents(
    id int(3) auto_increment primary key,
    nomePagina varchar(50) not null,
    chaveSecção varchar(80) not null,
    tipoConteudo varchar(10) not null,
    conteudoPagina text not null,
    atualizadoEm datetime not null default NOW(),
    idUtilizador int(2) null,
    foreign key (idUtilizador) references users(id)
);

insert into page_contents(nomePagina, chaveSecção, tipoConteudo, conteudoPagina) values
    ('inicio', 'hero_titulo', 'text', 'Centro Social Paroquial de São Lourenço'),
    ('inicio', 'hero_subtitulo', 'text', 'Ao serviço da comunidade de Alhos Vedros'),
    ('inicio', 'missao_titulo', 'text', 'A Nossa Missão'),
    ('inicio', 'missao_texto', 'html', 'Prestar assistência, educação e acompanhamento a pessoas de diferentes idades, promovendo a inclusão e o bem-estar social.'),
    ('sobre_nos', 'historia_titulo', 'text', 'A Nossa História'),
    ('sobre_nos', 'historia_texto', 'html', 'O Centro Social Paroquial de São Lourenço de Alhos Vedros é uma instituição particular de solidariedade social da Igreja Católica, canonicamente erecta, com personalidade jurídica no foro canónico e civil.'),
    ('sobre_nos', 'valores_titulo', 'text', 'Os Nossos Valores'),
    ('contactos', 'mapa_url', 'text', 'https://maps.google.com/?q=Largo+da+Igreja,+Alhos+Vedros');

-- ------------------------------------------------------------
--  Tabela: services
--  Valências/Serviços do Centro (Creche, CATL, ERPI, etc.)
-- ------------------------------------------------------------
create table services(
    id int(3) auto_increment primary key,
    titulo varchar(100) not null,
    descricao text not null,
    iconeOuImagem varchar(200) not null,
    idState int(1) not null default 1,
    criadoEm datetime not null default NOW(),
    atualizadoEm datetime not null default NOW(),
    foreign key (idState) references states(id)
);

insert into services(titulo, descricao, iconeOuImagem) values
    ('Creche O Regaço', 'Resposta social que acolhe crianças dos 4 meses aos 3 anos de idade, proporcionando um ambiente seguro e estimulante para o seu desenvolvimento.', 'fa-solid fa-baby'),
    ('Pré-Escolar O Ninho', 'Resposta educativa para crianças dos 3 aos 6 anos, com atividades pedagógicas que promovem a criatividade e a socialização.', 'fa-solid fa-children'),
    ('CATL O Barco', 'Centro de Atividades de Tempos Livres que apoia crianças em idade escolar com acompanhamento ao estudo e atividades de lazer.', 'fa-solid fa-book-open'),
    ('ERPI', 'Estrutura Residencial para Pessoas Idosas que garante cuidados de saúde, bem-estar e qualidade de vida aos nossos seniores.', 'fa-solid fa-house-medical');

-- ------------------------------------------------------------
--  Tabela: contacts
--  Contactos dinâmicos exibidos no header, footer e página de contactos
-- ------------------------------------------------------------
create table contacts(
    id int(3) auto_increment primary key,
    tipo varchar(30) not null,
    valor varchar(150) not null,
    icone varchar(80) not null,
    idState int(1) not null default 1,
    foreign key (idState) references states(id)
);

insert into contacts(tipo, valor, icone) values
    ('telefone', '+351 212 159 200', 'fa-solid fa-phone'),
    ('email', 'geral@cpslaalhosvedros.pt', 'fa-solid fa-envelope'),
    ('morada', 'Largo da Igreja, Alhos Vedros, 2860-012 Moita', 'fa-solid fa-location-dot'),
    ('facebook', 'https://www.facebook.com/centroparoquialsaolourenco', 'fa-brands fa-facebook');
