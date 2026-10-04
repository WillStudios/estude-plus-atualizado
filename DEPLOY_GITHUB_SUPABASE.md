# 🚀 Guia de Publicação • GitHub & Supabase (ESTUDE+)

Este guia ensina como colocar o **ESTUDE+** no ar na nuvem com **GitHub**, **Supabase (Banco de Dados PostgreSQL)** e **Hospedagem 24h Gratuita**.

---

## 🗄️ PARTE 1: Configurar o Supabase (Banco de Dados em Nuvem)

O Supabase fornece banco de dados PostgreSQL gratuito, veloz e seguro.

1. Acesse **[supabase.com](https://supabase.com)** e faça login (pode entrar com sua conta do GitHub).
2. Clique em **"New Project"** (Novo Projeto).
3. Preencha os campos:
   - **Name:** `estude-plus`
   - **Database Password:** Escolha uma senha segura e guarde-a.
   - **Region:** Selecione `South America (São Paulo)` para ter a menor latência.
4. Clique em **"Create new project"** e aguarde ~1 minuto para o banco ser provisionado.

### 📋 Criar as Tabelas com 1 Clique:
1. No menu lateral esquerdo do Supabase, clique em **SQL Editor** (ícone de terminal `>_`).
2. Abra o arquivo [`supabase_schema.sql`](supabase_schema.sql) deste projeto.
3. Copie todo o código SQL e cole na caixa de texto do SQL Editor.
4. Clique no botão verde **"Run"** (ou aperte `Ctrl + Enter`).
   - ✅ Pronto! Todas as tabelas (`users`, `tpcs`, `payments`, `audit_logs`, `app_config`) foram criadas com as regras de segurança e o usuário administrador Freddie Costa!

### 🔑 Obter as Chaves de Conexão:
1. No menu lateral, clique na engrenagem **Project Settings** (Configurações do Projeto).
2. Vá em **API**.
3. Copie:
   - **Project URL:** Ex: `https://abcdefghijklm.supabase.co`
   - **anon public key:** Chave pública (para conexão da aplicação)
   - **service_role secret:** Chave com privilégios completos
4. Cole no seu arquivo local [`.env`](.env):
   ```env
   PORT=8080
   SUPABASE_URL=https://abcdefghijklm.supabase.co
   SUPABASE_ANON_KEY=sua_chave_anon_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
   ADMIN_PASSWORD=adm@123
   ```

---

## 🐙 PARTE 2: Publicar o Código no GitHub

O repositório Git local já foi inicializado com a branch `main` e commit inicial pronto!

1. Acesse **[github.com/new](https://github.com/new)**.
2. Crie um novo repositório:
   - **Repository name:** `estude-plus` (ou o nome que preferir).
   - Deixe como **Public** ou **Private**.
   - **NÃO** marque a opção de adicionar README, .gitignore ou License (pois nós já criamos todos!).
   - Clique em **"Create repository"**.
3. Copie a URL do repositório gerado (ex: `https://github.com/SEU-USUARIO/estude-plus.git`).
4. No terminal PowerShell, execute:
   ```powershell
   .\deploy_github.ps1 -RepoUrl "https://github.com/SEU-USUARIO/estude-plus.git"
   ```
   *(Ou execute manualmente os comandos abaixo)*:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/estude-plus.git
   git push -u origin main
   ```

---

## 🌐 PARTE 3: Colocar o App no AR 24h na Nuvem (Render / Vercel)

Já deixamos o arquivo [`render.yaml`](render.yaml) configurado para deploy automático na nuvem gratuita do **Render**:

1. Acesse **[render.com](https://render.com)** e crie uma conta gratuita com seu GitHub.
2. No painel, clique em **"New +"** ➔ **"Web Service"**.
3. Conecte sua conta do GitHub e selecione o repositório `estude-plus`.
4. O Render detectará automaticamente o arquivo `render.yaml`:
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Em **Environment Variables** (Variáveis de Ambiente), adicione:
   - `SUPABASE_URL`: sua URL do Supabase
   - `SUPABASE_ANON_KEY`: sua chave pública do Supabase
   - `ADMIN_PASSWORD`: sua senha mestre
6. Clique em **"Create Web Service"**.
7. Em cerca de 2 minutos, o Render gerará o link oficial do seu aplicativo no ar (ex: `https://estude-plus.onrender.com`) com HTTPS seguro e gratuito!

---

## 🎯 Arquivos Criados & Configurados no Projeto:
- [`supabase_schema.sql`](supabase_schema.sql): Script SQL completo com tabelas, RLS e dados iniciais.
- [`supabase_client.js`](supabase_client.js): Cliente nativo Node.js 18+ que sincroniza dados com Supabase sem dependências extras.
- [`.env.example`](.env.example): Modelo com todas as chaves documentadas.
- [`.env`](.env): Arquivo com variáveis de ambiente locais.
- [`deploy_github.ps1`](deploy_github.ps1): Script para envio rápido ao GitHub com 1 comando.
- [`render.yaml`](render.yaml): Blueprint de deploy na nuvem.
