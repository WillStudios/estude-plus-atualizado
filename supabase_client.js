// ==============================================================================
// ESTUDE+ SaaS • CLIENTE NATIVO SUPABASE (Node.js 18+ REST PostgREST)
// Permite sincronização em nuvem automática e independente de dependências
// ==============================================================================

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY || '';

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

function getHeaders(customHeaders = {}) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation,resolution=merge-duplicates',
    ...customHeaders
  };
}

async function request(endpoint, options = {}) {
  if (!isConfigured) return null;
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: getHeaders(options.headers || {})
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Supabase Error ${res.status}] ${endpoint}:`, errText);
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return true;
  } catch (err) {
    console.error(`[Supabase Network Error] ${endpoint}:`, err.message);
    return null;
  }
}

// -----------------------------------------------------------------------------
// OPERAÇÕES: USUÁRIOS
// -----------------------------------------------------------------------------
async function getAllUsers() {
  if (!isConfigured) return null;
  const rows = await request('users?select=*');
  if (!Array.isArray(rows)) return null;

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    username: r.username,
    email: r.email,
    passwordHash: r.password_hash,
    passwordSalt: r.password_salt,
    role: r.role,
    isSubscribed: r.is_subscribed,
    plan: r.plan,
    planStatus: r.plan_status,
    planName: r.plan_name,
    grade: r.grade,
    emailVerified: r.email_verified,
    streak: r.streak,
    bestStreak: r.best_streak,
    dailyGoalMinutes: r.daily_goal_minutes,
    todayMinutes: r.today_minutes,
    studiedDays: r.studied_days || [],
    achievements: r.achievements || [],
    createdAt: r.created_at,
    lastLogin: r.last_login
  }));
}

async function upsertUser(user) {
  if (!isConfigured || !user || !user.id) return null;
  const row = {
    id: String(user.id),
    name: user.name || 'Aluno Gammon',
    username: user.username || (user.email ? user.email.split('@')[0] : `user_${user.id}`),
    email: user.email || null,
    password_hash: user.passwordHash || null,
    password_salt: user.passwordSalt || null,
    role: user.role || 'student',
    is_subscribed: Boolean(user.isSubscribed),
    plan: user.plan || 'free',
    plan_status: user.planStatus || 'free',
    plan_name: user.planName || 'Plano Base',
    grade: user.grade || '7º Ano',
    email_verified: user.emailVerified !== false,
    streak: Number(user.streak) || 0,
    best_streak: Number(user.bestStreak) || 0,
    daily_goal_minutes: Number(user.dailyGoalMinutes) || 15,
    today_minutes: Number(user.todayMinutes) || 0,
    studied_days: Array.isArray(user.studiedDays) ? user.studiedDays : [],
    achievements: Array.isArray(user.achievements) ? user.achievements : [],
    last_device_type: user.lastDeviceType || null,
    last_login: user.lastLogin ? new Date(user.lastLogin).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return await request('users', {
    method: 'POST',
    body: JSON.stringify(row)
  });
}

// -----------------------------------------------------------------------------
// OPERAÇÕES: TPCS
// -----------------------------------------------------------------------------
async function getAllTpcs() {
  if (!isConfigured) return null;
  const rows = await request('tpcs?select=*');
  if (!Array.isArray(rows)) return null;

  return rows.map(r => ({
    id: r.id,
    subject: r.subject,
    title: r.title,
    dueDate: r.due_date,
    status: r.status,
    details: r.details,
    teacher: r.teacher,
    difficulty: r.difficulty,
    tpcType: r.tpc_type,
    createdAt: r.created_at
  }));
}

async function upsertTpc(tpc) {
  if (!isConfigured || !tpc || !tpc.id) return null;
  const row = {
    id: String(tpc.id),
    subject: tpc.subject || 'Geral',
    title: tpc.title || 'Tarefa Escolar',
    due_date: tpc.dueDate || new Date().toISOString().slice(0, 10),
    status: tpc.status || 'pending',
    details: tpc.details || '',
    teacher: tpc.teacher || '',
    difficulty: tpc.difficulty || 'Média',
    tpc_type: tpc.tpcType || 'TPC Diário',
    updated_at: new Date().toISOString()
  };

  return await request('tpcs', {
    method: 'POST',
    body: JSON.stringify(row)
  });
}

// -----------------------------------------------------------------------------
// OPERAÇÕES: PAGAMENTOS & AUDITORIA
// -----------------------------------------------------------------------------
async function getAllPayments() {
  if (!isConfigured) return null;
  return await request('payments?select=*');
}

async function upsertPayment(payment) {
  if (!isConfigured || !payment || !payment.id) return null;
  const row = {
    id: String(payment.id),
    student_name: payment.studentName || 'Aluno',
    email: payment.email || null,
    method: payment.method || 'pix',
    amount: payment.amount || 19.90,
    date: payment.date || new Date().toISOString().slice(0, 10),
    status: payment.status || 'pending',
    note: payment.note || ''
  };

  return await request('payments', {
    method: 'POST',
    body: JSON.stringify(row)
  });
}

async function recordAuditLog(log) {
  if (!isConfigured || !log) return null;
  const row = {
    id: log.id || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type: log.type || 'info',
    ip: log.ip || null,
    details: typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')
  };

  return await request('audit_logs', {
    method: 'POST',
    body: JSON.stringify(row)
  });
}

// -----------------------------------------------------------------------------
// SINCRONIZAÇÃO COMPLETA (DB LOCAL -> NUVEM SUPABASE)
// -----------------------------------------------------------------------------
async function syncFromLocalDb(db) {
  if (!isConfigured || !db) return false;
  try {
    if (Array.isArray(db.users)) {
      for (const u of db.users) {
        await upsertUser(u);
      }
    }
    if (Array.isArray(db.tpcs)) {
      for (const t of db.tpcs) {
        await upsertTpc(t);
      }
    }
    console.log('[Supabase] Sincronização inicial concluída com sucesso!');
    return true;
  } catch (e) {
    console.error('[Supabase Sync Error]', e);
    return false;
  }
}

module.exports = {
  isConfigured,
  SUPABASE_URL,
  getAllUsers,
  upsertUser,
  getAllTpcs,
  upsertTpc,
  getAllPayments,
  upsertPayment,
  recordAuditLog,
  syncFromLocalDb
};
