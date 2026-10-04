-- ==============================================================================
-- ESTUDE+ SaaS • SCHEMA COMPLETO DO SUPABASE (PostgreSQL)
-- Criado para: Freddie Pimentel Costa & Colégio Gammon / SAS Educação
-- ==============================================================================

-- 1. Habilitar extensão para UUIDs se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários (Alunos, Professores e Administradores)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password_hash TEXT,
    password_salt TEXT,
    role TEXT DEFAULT 'student', -- 'student' ou 'admin'
    is_subscribed BOOLEAN DEFAULT false,
    plan TEXT DEFAULT 'free', -- 'free' ou 'pro'
    plan_status TEXT DEFAULT 'free', -- 'free', 'trial_5d', 'active', 'pending'
    plan_name TEXT DEFAULT 'Plano Base',
    grade TEXT DEFAULT '7º Ano (Campus Chácara)',
    email_verified BOOLEAN DEFAULT true,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    daily_goal_minutes INTEGER DEFAULT 15,
    today_minutes INTEGER DEFAULT 0,
    studied_days JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_ip TEXT,
    last_device_type TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de TPCs / Tarefas Escolares (Portal Gammon & SAS)
CREATE TABLE IF NOT EXISTS public.tpcs (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' ou 'completed'
    details TEXT,
    teacher TEXT,
    difficulty TEXT DEFAULT 'Média',
    tpc_type TEXT DEFAULT 'TPC Diário',
    source TEXT DEFAULT 'gammon_sync',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Solicitações de Assinatura e Pagamentos (Pix e Dinheiro Vivo)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    email TEXT,
    user_id TEXT,
    method TEXT DEFAULT 'pix', -- 'pix' ou 'cash' (dinheiro vivo em mãos)
    amount NUMERIC(10, 2) DEFAULT 19.90,
    date TEXT,
    status TEXT DEFAULT 'pending', -- 'pending' ou 'confirmed'
    note TEXT,
    confirmed_by TEXT,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Solicitações do Plano PRO
CREATE TABLE IF NOT EXISTS public.plan_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT,
    user_grade TEXT,
    plan TEXT DEFAULT 'pro',
    plan_name TEXT DEFAULT 'Plano ESTUDE+ PRO (R$ 19,90/mês)',
    amount NUMERIC(10, 2) DEFAULT 19.90,
    contact_method TEXT DEFAULT 'whatsapp',
    contact_info TEXT,
    note TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'approved', 'rejected'
    status_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Suporte e Dúvidas dos Alunos (Todas as plataformas)
CREATE TABLE IF NOT EXISTS public.support_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    category TEXT DEFAULT 'duvida', -- 'duvida', 'suporte', 'plano', 'agenda', 'questoes', 'outro'
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    device_type TEXT DEFAULT 'PC',
    contact_info TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'answered', 'resolved'
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Erros Reportados em Estudos & Quizzes
CREATE TABLE IF NOT EXISTS public.study_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    category TEXT DEFAULT 'questoes',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    device_type TEXT DEFAULT 'PC',
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Notificações do Administrador
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'info',
    category TEXT DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'unread', -- 'unread', 'read'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela de Auditoria e Logs de Segurança
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL,
    ip TEXT,
    user_id TEXT,
    details TEXT
);

-- 7. Tabela de Configurações Gerais e Status de Sincronização
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SEGURANÇA (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de solicitações de planos" ON public.plan_requests FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de solicitações de planos" ON public.plan_requests FOR ALL USING (true);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para a chave anon do Supabase (aplicação web)
CREATE POLICY "Permitir leitura pública de usuários" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir inserção e atualização de usuários" ON public.users FOR ALL USING (true);

CREATE POLICY "Permitir acesso completo a TPCs" ON public.tpcs FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo a Pagamentos" ON public.payments FOR ALL USING (true);
CREATE POLICY "Permitir gravação de Logs de Auditoria" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Permitir acesso a Configurações Gerais" ON public.app_config FOR ALL USING (true);

-- ==============================================================================
-- DADOS INICIAIS (SEED)
-- ==============================================================================

-- Administrador Mestre: Freddie Pimentel Costa
INSERT INTO public.users (
    id, name, username, email, role, is_subscribed, plan, plan_status, plan_name, grade, email_verified, streak, best_streak, password_hash, password_salt
) VALUES (
    'admin_freddie',
    'Freddie Pimentel Costa',
    'freddie',
    'freddie@gammon.com.br',
    'admin',
    true,
    'pro',
    'active',
    'Plano Administrador PRO',
    '7º Ano (Campus Chácara)',
    true,
    5,
    5,
    'a84f1dd3c2b569383df69e72446ecf04ae0d667ca45de8a6bebd91f4ce5a357de7181b112c89ffb6367d3e801cb63c2509b2c97a7087441464dcea7dfb6772f9',
    'eaedb18c203d18af0d29e2162e62c8b9'
) ON CONFLICT (id) DO UPDATE SET role = 'admin', is_subscribed = true;

-- Aluno Demonstração: Lucas Silva
INSERT INTO public.users (
    id, name, username, email, role, is_subscribed, plan, plan_status, plan_name, grade, email_verified, streak, best_streak, password_hash, password_salt
) VALUES (
    'aluno_lucas',
    'Lucas Silva',
    'lucas',
    'lucas@gammon.com.br',
    'student',
    false,
    'free',
    'free',
    'Plano Base',
    '7º Ano B',
    true,
    0,
    0,
    'cc9be4cf8432a524c09038b4dc517aebea60142311514d29ea6d1b0871974a4b3b494f41ac1c14db2c0a6739b21107d56cb893966cf27e040b7a286f6ecd979d',
    'd70fc66bbe8bbad19e3bb312dabecd06'
) ON CONFLICT (id) DO NOTHING;

-- TPCs Iniciais do Gammon
INSERT INTO public.tpcs (id, subject, title, due_date, status, details, teacher, difficulty, tpc_type) VALUES
('tpc-mat-elaine-0210', 'Matemática', 'Atividade Suplementar – pág. 50 (para 05/10)', '2026-10-05', 'pending', 'Atividade Suplementar - página 50, para o dia 05/10. Postado por Profª ELAINE APARECIDA LEANDRO DOS SANTOS (Turma 17B • 3º Trimestre).', 'Profª Elaine Aparecida Leandro dos Santos', 'Média', 'TPC Diário'),
('tpc-cie-lucas-0310', 'Ciências', 'Exercícios no Caderno – Cadeias Alimentares', '2026-10-06', 'pending', 'Exercícios de fixação sobre Cadeias Alimentares e Fluxo de Energia.', 'Prof. Lucas', 'Fácil', 'TPC Diário'),
('tpc-port-ana-0310', 'Português', 'Redação – Crônica do Cotidiano (Coleção Asas)', '2026-10-07', 'pending', 'Produção textual no caderno de Pratique Redação (Coleção Asas 2026).', 'Profª Ana Lúcia', 'Difícil', 'Redação SAS')
ON CONFLICT (id) DO NOTHING;
