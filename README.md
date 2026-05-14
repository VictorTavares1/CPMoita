# Centro Paroquial da Moita — Website Institucional

Website institucional do Centro Paroquial da Moita . A aplicação é composta por um website público e um backoffice de gestão de conteúdos, permitindo à instituição gerir de forma autónoma toda a informação apresentada ao público.

---

## Tecnologias Utilizadas

**Frontend**
- Angular 21 (componentes standalone, signals, OnPush change detection)
- Bootstrap 5.3
- Font Awesome 7
- Quill 2 (editor de texto rico)
- TypeScript 5.9

**Backend**
- PHP 8 (API REST)
- MySQL / MariaDB
- XAMPP (ambiente de desenvolvimento local)

---

## Estrutura do Projeto

```
CPMoita/
├── api/                  # API REST em PHP
│   ├── auth-login.php
│   ├── auth-logout.php
│   ├── auth-check.php
│   ├── services.php
│   ├── news.php
│   ├── page-contents.php
│   ├── docs.php
│   ├── admin-*.php
│   └── db.php
├── db/                   # Configuração da base de dados
├── docs_upload/          # Documentos enviados em tempo de execução
├── public/               # Ficheiros estáticos (imagens, documentos, etc.)
├── src/
│   ├── app/
│   │   ├── pages/        # Páginas públicas e backoffice
│   │   ├── services/     # Serviços Angular (HTTP)
│   │   ├── guards/       # Guards de autenticação
│   │   └── environments/ # Configuração de ambiente
│   └── styles.css
├── dist/                 # Build de produção (gerado pelo ng build)
└── uploads/              # Imagens enviadas pelos utilizadores
```

---

## Funcionalidades

### Website Público
- **Início** — apresentação da instituição com carrossel e notícias recentes
- **Instituição** — história, valores e documentos institucionais (ex.: estatutos)
- **Serviços** — páginas dedicadas a cada valência: Creche "O Regaço", Pré-Escolar "O Ninho", CATL "O Barco" e ERPI
- **Notícias** — listagem e detalhe de artigos publicados, com pesquisa e paginação
- **Horários** — tabela de horários de funcionamento
- **Contactos** — morada, telefones e e-mails

### Backoffice de Gestão
Acesso restrito a utilizadores autenticados, com proteção por token e verificação de expiração.

- **Notícias** — criar, editar, ativar/desativar e gerir imagens
- **Serviços** — editar conteúdos (descrição, coordenação, capacidade, funcionamento, serviços prestados, documentos)
- **Relatórios** — carregar e gerir documentos PDF
- **Páginas** — editar conteúdos dinâmicos das páginas públicas com editor Quill
- **Contactos** — gerir contactos apresentados no website
- **Administradores** — criar e ativar/desativar contas (sem possibilidade de desativar a própria conta)
- **Registos (Logs)** — histórico de todas as operações realizadas no backoffice

---

## Pré-requisitos

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL + PHP 8)
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Angular CLI](https://angular.dev/tools/cli) 21

```bash
npm install -g @angular/cli
```

---

## Instalação e Configuração

### 1. Base de Dados

1. Iniciar o XAMPP e ativar os serviços **Apache** e **MySQL**
2. Abrir o **phpMyAdmin** em `http://localhost/phpmyadmin`
3. Criar uma base de dados com o nome `centro-paroquial-moita`
4. Importar o ficheiro SQL disponível em `db/`

### 2. Configuração da Ligação à Base de Dados

Editar o ficheiro `db/info.json` com as credenciais da base de dados:

```json
{
  "host": "localhost",
  "user": "root",
  "password": "",
  "database": "centro-paroquial-moita",
  "prefixo": "...",
  "sufixo": "..."
}
```

### 3. Instalar Dependências do Frontend

```bash
npm install
```

### 4. Compilar o Frontend

Para desenvolvimento (com reconstrução automática):

```bash
ng build --configuration=development --watch
```

Para produção:

```bash
ng build
```

O resultado é colocado em `dist/CPMoita/browser/`, que é servido pelo Apache.

---

## Execução em Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento Angular (porta 4200)
ng serve
```

> **Nota:** O servidor `ng serve` não serve ficheiros adicionados em tempo de execução à pasta `public/`. Para garantir o correto funcionamento dos documentos carregados dinamicamente, utilizar sempre o Apache (XAMPP) com o build compilado.

---

## Autenticação

O backoffice utiliza um sistema de autenticação por token:

- O token é gerado no login e guardado na tabela `admin_tokens` da base de dados
- A validade do token é de **8 horas**
- O token e a data de expiração são armazenados no `localStorage` do browser
- Todas as rotas `/admin/*` são protegidas pelo `AuthGuard`
- Após o logout, o utilizador é redirecionado para a página principal do website

---

## Ambiente de Produção

O ficheiro de ambiente de produção encontra-se em `src/environments/environment.prod.ts`. Antes de publicar, atualizar o valor de `apiUrl` com o URL do servidor de produção.

---

## Autor

Desenvolvido por **Victor Tavares**

