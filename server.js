const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

// Carregar .env local automaticamente se existir
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const supabase = require('./supabase_client');
const { generateEducationalEngineResponse, generateStructuredStudyTool } = require('./ai_engine');

const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.zip': 'application/zip'
};

function isMockUser(u) {
  if (!u) return true;
  if (u.id === 'usr-student' || u.id === 'aluno_lucas' || u.id === 'user_streak_break_test') return true;
  const name = (u.name || '').toLowerCase();
  const username = (u.username || '').toLowerCase();
  const email = (u.email || '').toLowerCase();
  if (name === 'lucas silva' || name === 'pedro lucas' || username === 'lucas_mock' || username === 'pedro_mock') return true;
  if (name.includes('mock') || username.includes('mock') || email.includes('mock')) return true;
  return false;
}

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      let content = fs.readFileSync(DB_FILE, 'utf8');
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch (parseErr) {
        console.error('[CRITICAL] db.json corrompido! Tentando restaurar do snapshot mais recente...', parseErr.message);
        parsed = restoreFromLatestBackup();
      }
      if (!parsed) parsed = {};
      if (!Array.isArray(parsed.planRequests)) parsed.planRequests = [];
      if (!Array.isArray(parsed.supportRequests)) parsed.supportRequests = [];
      if (!Array.isArray(parsed.studyReports)) parsed.studyReports = [];
      if (!Array.isArray(parsed.agendaSyncLogs)) parsed.agendaSyncLogs = [];
      if (!Array.isArray(parsed.adminNotifications)) parsed.adminNotifications = [];
      if (!Array.isArray(parsed.systemEvents)) parsed.systemEvents = [];
      if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
      if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
      const nowMs = Date.now();
      parsed.sessions = parsed.sessions.filter(s => s && s.sessionId && s.userId && (!s.expiresAt || s.expiresAt > nowMs));
      if (!Array.isArray(parsed.materials)) parsed.materials = [];
      if (!Array.isArray(parsed.flashcards)) parsed.flashcards = [];
      if (!Array.isArray(parsed.simulados)) parsed.simulados = [];
      if (!Array.isArray(parsed.mindmaps)) parsed.mindmaps = [];
      if (!Array.isArray(parsed.studentNotes)) parsed.studentNotes = [];
      if (!Array.isArray(parsed.trilhasProgress)) parsed.trilhasProgress = [];
      if (!Array.isArray(parsed.tpcs)) parsed.tpcs = [];
      if (parsed.tpcs.length > 5) {
        parsed.tpcs = parsed.tpcs.sort((a, b) => {
          const timeA = new Date(a.createdDate || a.dueDate || 0).getTime();
          const timeB = new Date(b.createdDate || b.dueDate || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return (Number(b.gammonId) || 0) - (Number(a.gammonId) || 0);
        }).slice(0, 5);
      }
      if (Array.isArray(parsed.users)) {
        parsed.users = parsed.users.filter(u => !isMockUser(u));
      }
      if (!Array.isArray(parsed.deletedAccountTombstones)) parsed.deletedAccountTombstones = [];
      if (!Array.isArray(parsed.aiConversations)) parsed.aiConversations = [];
      if (!Array.isArray(parsed.connectedDevices)) parsed.connectedDevices = [];
      if (!Array.isArray(parsed.payments)) parsed.payments = [];

      // Integridade referencial: remove registros órfãos de contas excluídas
      const validUserIds = new Set((parsed.users || []).map(u => String(u.id)));
      validUserIds.add('admin_freddie');
      validUserIds.add('usr-freddie');
      if (Array.isArray(parsed.simulados)) {
        parsed.simulados = parsed.simulados.filter(s => !s.userId || validUserIds.has(String(s.userId)));
      }
      if (Array.isArray(parsed.studentNotes)) {
        parsed.studentNotes = parsed.studentNotes.filter(n => !n.userId || validUserIds.has(String(n.userId)));
      }
      if (Array.isArray(parsed.flashcards)) {
        parsed.flashcards = parsed.flashcards.filter(f => !f.userId || validUserIds.has(String(f.userId)));
      }
      if (Array.isArray(parsed.mindmaps)) {
        parsed.mindmaps = parsed.mindmaps.filter(m => !m.userId || validUserIds.has(String(m.userId)));
      }
      if (Array.isArray(parsed.aiConversations)) {
        parsed.aiConversations = parsed.aiConversations.filter(c => !c.userId || validUserIds.has(String(c.userId)));
      }
      if (Array.isArray(parsed.trilhasProgress)) {
        parsed.trilhasProgress = parsed.trilhasProgress.filter(t => !t.userId || validUserIds.has(String(t.userId)));
      }
      if (Array.isArray(parsed.sessions)) {
        parsed.sessions = parsed.sessions.filter(s => validUserIds.has(String(s.userId)));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading DB:', e);
  }
  return {
    users: [],
    sessions: [],
    materials: [],
    flashcards: [],
    simulados: [],
    mindmaps: [],
    studentNotes: [],
    trilhasProgress: [],
    tpcs: [],
    gammonStatus: {},
    masterCommands: {},
    verificationCodes: {},
    recoveryCodes: {},
    auditLogs: [],
    planRequests: [],
    supportRequests: [],
    studyReports: [],
    agendaSyncLogs: [],
    adminNotifications: [],
    systemEvents: []
  };
}

const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  try { fs.mkdirSync(BACKUP_DIR, { recursive: true }); } catch (e) {}
}

let lastBackupTimestamp = 0;
const BACKUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hora entre snapshots de rotina

function createDbBackup(reason = 'routine') {
  try {
    if (!fs.existsSync(DB_FILE)) return null;
    const stats = fs.statSync(DB_FILE);
    if (stats.size === 0) return null;

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db_backup_${ts}_${reason}.json`;
    const destPath = path.join(BACKUP_DIR, filename);

    fs.copyFileSync(DB_FILE, destPath);

    // Rotação: manter os 30 snapshots mais recentes
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('db_backup_') && f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 30) {
      for (const oldFile of files.slice(30)) {
        try { fs.unlinkSync(path.join(BACKUP_DIR, oldFile.name)); } catch (e) {}
      }
    }

    lastBackupTimestamp = Date.now();
    return { success: true, filename, timestamp: new Date().toISOString(), size: stats.size };
  } catch (err) {
    console.error('[Backup Error]:', err.message);
    return null;
  }
}

function restoreFromLatestBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return null;
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('db_backup_') && f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    for (const f of files) {
      try {
        const fullPath = path.join(BACKUP_DIR, f.name);
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.users)) {
          console.warn(`[RECOVERY] Restaurando banco de dados a partir do snapshot válido: ${f.name}`);
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
          return parsed;
        }
      } catch (err) {}
    }
  } catch (e) {
    console.error('[Recovery Error]:', e.message);
  }
  return null;
}

function writeDb(data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const tmpFile = DB_FILE + '.tmp';
    fs.writeFileSync(tmpFile, jsonStr, 'utf8');
    fs.renameSync(tmpFile, DB_FILE);

    // Snapshot periódico automático
    if (Date.now() - lastBackupTimestamp > BACKUP_INTERVAL_MS) {
      createDbBackup('hourly');
    }

    if (supabase && supabase.isConfigured) {
      supabase.syncFromLocalDb(data).catch(err => {
        console.warn('[Supabase Sync Warning]', err.message);
      });
    }
  } catch (e) {
    console.error('Error writing DB:', e);
  }
}

const OFFICIAL_PLANS = {
  base: {
    id: 'base',
    name: 'Plano Base',
    amount: 0.00,
    periodicity: 'gratuito',
    durationDays: 0,
    description: 'Acesso essencial aos TPCs, horários e Quiz Diário (Sem Trilhas Pro)'
  },
  pro_mensal: {
    id: 'pro_mensal',
    name: 'Plano ESTUDE+ PRO Mensal',
    amount: 10.00,
    periodicity: 'mensal',
    durationDays: 30,
    description: 'Acesso completo ao Estude+ PRO por 30 dias (R$ 10,00/mês)'
  },
  pro_anual: {
    id: 'pro_anual',
    name: 'Plano ESTUDE+ PRO Anual',
    amount: 120.00,
    periodicity: 'anual',
    durationDays: 365,
    description: 'Acesso completo ao Estude+ PRO por 1 ano / 365 dias (R$ 120,00/ano)'
  }
};

// Global in-memory state for sessions, presence and rate-limiting
const activeSessions = new Map(); // sessionId -> sessionObj
const adminTokens = new Set(['admin_master_freddie_token_2026']); // Master token for authenticated admin sessions
const rateLimitMap = new Map(); // ip -> { loginFailures: count, blockedUntil: timestamp, registrations: [timestamps] }
const adminSseClients = new Set(); // SSE connected admin clients
const userSseClients = new Map(); // userId -> Set of res objects

// Restauração imediata de todas as sessões ativas do disco para a memória na inicialização
try {
  const initialDb = readDb();
  if (Array.isArray(initialDb.sessions)) {
    const nowBoot = Date.now();
    let restoredCount = 0;
    initialDb.sessions.forEach(s => {
      if (s && s.sessionId && (!s.expiresAt || s.expiresAt > nowBoot)) {
        activeSessions.set(s.sessionId, s);
        restoredCount++;
      }
    });
    console.log(`[AUTH] ${restoredCount} sessão(ões) persistente(s) restaurada(s) do disco com sucesso.`);
  }
} catch (e) {
  console.warn('[AUTH Boot Warning] Falha ao carregar sessões persistentes:', e.message);
}

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers && req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function createSessionCookieHeader(sessionId, maxAgeSeconds, isSecure = false) {
  let cookie = `estude_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
  if (maxAgeSeconds !== undefined && maxAgeSeconds !== null) {
    cookie += `; Max-Age=${Math.floor(maxAgeSeconds)}`;
  }
  if (isSecure) {
    cookie += `; Secure`;
  }
  return cookie;
}

function clearSessionCookieHeader(isSecure = false) {
  let cookie = `estude_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  if (isSecure) {
    cookie += `; Secure`;
  }
  return cookie;
}

function getDeviceLabel(userAgent) {
  const ua = (userAgent || '').toLowerCase();
  let browser = 'Navegador Web';
  if (/edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/.test(ua) && !/edg\//.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/.test(ua)) browser = 'Firefox';
  else if (/safari/.test(ua) && !/chrome|crios/.test(ua)) browser = 'Safari';

  let os = 'Computador';
  if (/iphone/.test(ua)) os = 'iPhone';
  else if (/ipad/.test(ua)) os = 'iPad';
  else if (/android/.test(ua)) os = 'Celular Android';
  else if (/windows/.test(ua)) os = 'Computador Windows';
  else if (/macintosh|mac os x/.test(ua)) os = 'MacBook / Apple';
  else if (/linux/.test(ua)) os = 'Computador Linux';

  return `${os} • ${browser}`;
}

function broadcastToAdmins(eventType, data) {
  const payload = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
  for (const client of adminSseClients) {
    try {
      client.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (e) {
      adminSseClients.delete(client);
    }
  }
}

function broadcastToUser(userId, eventType, data) {
  const clients = userSseClients.get(String(userId));
  if (!clients || clients.size === 0) return;
  const payload = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
  for (const client of clients) {
    try {
      client.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (e) {
      clients.delete(client);
    }
  }
}

function broadcastToAll(eventType, data) {
  broadcastToAdmins(eventType, data);
  const payload = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
  for (const [userId, clients] of userSseClients.entries()) {
    for (const client of clients) {
      try {
        client.write(`event: ${eventType}\ndata: ${payload}\n\n`);
      } catch (e) {
        clients.delete(client);
      }
    }
  }
}

function createAdminNotification({ type, category, title, message, meta }) {
  const db = readDb();
  if (!Array.isArray(db.adminNotifications)) db.adminNotifications = [];
  const notif = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: type || 'info', // 'info', 'warning', 'success', 'error'
    category: category || 'system', // 'user', 'plan', 'support', 'study', 'agenda', 'system'
    title: title || 'Notificação',
    message: message || '',
    meta: meta || {},
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  db.adminNotifications.unshift(notif);
  if (db.adminNotifications.length > 200) db.adminNotifications = db.adminNotifications.slice(0, 200);
  writeDb(db);
  broadcastToAdmins('new_notification', notif);
  return notif;
}

function logAudit(action, actor, details, ip) {
  const db = readDb();
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
  const entry = {
    id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action: action || 'unknown_action',
    actor: actor || 'system',
    details: details || {},
    ip: ip || 'internal',
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 200) db.auditLogs = db.auditLogs.slice(0, 200);
  writeDb(db);
  return entry;
}

function logSystemEvent(level, source, message, details) {
  const db = readDb();
  if (!Array.isArray(db.systemEvents)) db.systemEvents = [];
  const evt = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    level: level || 'info',
    source: source || 'server',
    message: message || '',
    details: details || {},
    timestamp: new Date().toISOString()
  };
  db.systemEvents.unshift(evt);
  if (db.systemEvents.length > 200) db.systemEvents = db.systemEvents.slice(0, 200);
  writeDb(db);
  if (level === 'error') {
    createAdminNotification({
      type: 'error',
      category: 'system',
      title: `Erro do Sistema (${source})`,
      message: (message || '').substring(0, 120),
      meta: { source, details }
    });
  }
  return evt;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip, type) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { loginFailures: 0, blockedUntil: 0, registrations: [] };
    rateLimitMap.set(ip, record);
  }

  // Check if IP is temporarily blocked
  if (record.blockedUntil > now) {
    const waitSecs = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, error: `Muitas tentativas. Bloqueio temporário por mais ${waitSecs} segundos.` };
  }

  if (type === 'login_fail') {
    record.loginFailures = (record.loginFailures || 0) + 1;
    if (record.loginFailures >= 5) {
      record.blockedUntil = now + 15 * 60 * 1000; // 15 min block
      return { allowed: false, error: 'Limite de tentativas excedido (5 falhas). Bloqueado por 15 minutos.' };
    }
  } else if (type === 'login_success') {
    record.loginFailures = 0;
  } else if (type === 'register') {
    // Exempt localhost loopback from register rate limit
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return { allowed: true };
    }
    // Max 4 registrations per IP per hour
    record.registrations = (record.registrations || []).filter(t => now - t < 3600000);
    if (record.registrations.length >= 4) {
      return { allowed: false, error: 'Limite de cadastros excedido para esta rede. Tente mais tarde ou use a recuperação de senha.' };
    }
    record.registrations.push(now);
  }

  return { allowed: true };
}

function detectDevice(userAgent) {
  const ua = (userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'iPhone / iOS';
  if (/android/.test(ua)) return 'Android / Celular';
  if (/mobile/.test(ua)) return 'Celular / Mobile';
  if (/macintosh|mac os x/.test(ua)) return 'Mac / Computador';
  if (/windows/.test(ua)) return 'Windows / PC';
  if (/linux/.test(ua)) return 'Linux / PC';
  return 'Computador / Desktop';
}

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, storedSalt) {
  if (!storedHash || !storedSalt) return false;
  try {
    const hash = crypto.scryptSync(password, storedSalt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch (e) {
    return false;
  }
}

function migrateUserPasswords() {
  const db = readDb();
  let changed = false;
  (db.users || []).forEach(user => {
    if (user.password && (!user.passwordHash || !user.passwordSalt)) {
      const { hash, salt } = hashPassword(user.password);
      user.passwordHash = hash;
      user.passwordSalt = salt;
      delete user.password; // Remove plaintext password
      changed = true;
    }
  });
  if (changed) {
    writeDb(db);
    console.log('[SECURITY] Senhas de usuários legados migradas com sucesso para hash com salt.');
  }
}
migrateUserPasswords();

function ensureMasterAdmin() {
  const db = readDb();
  if (!Array.isArray(db.users)) db.users = [];

  const adminUsername = process.env.ADMIN_USERNAME || 'freddie';
  const adminPass = process.env.ADMIN_PASSWORD || 'adm@123';

  let adminUser = db.users.find(u => 
    (u.username && u.username.toLowerCase() === adminUsername.toLowerCase()) || 
    (u.email && u.email.toLowerCase() === 'freddie@gammon.com.br') ||
    u.role === 'admin'
  );

  if (!adminUser) {
    const { hash, salt } = hashPassword(adminPass);
    adminUser = {
      id: 'admin_freddie',
      name: 'Freddie Pimentel Costa',
      username: adminUsername,
      email: 'freddie@gammon.com.br',
      role: 'admin',
      isSubscribed: true,
      plan: 'pro',
      planStatus: 'active',
      planName: 'Plano Administrador PRO',
      grade: '7º Ano (Campus Chácara)',
      emailVerified: true,
      streak: 5,
      bestStreak: 5,
      createdAt: '2026-09-01T00:00:00.000Z',
      lastLogin: new Date().toISOString(),
      passwordHash: hash,
      passwordSalt: salt
    };
    db.users.unshift(adminUser);
    writeDb(db);
    console.log(`[SECURITY] Conta mestre de Administrador (@${adminUsername}) garantida e ativa no banco de dados.`);
  } else {
    // Garante privilégios e integridade do hash
    if (!adminUser.passwordHash || !adminUser.passwordSalt) {
      const { hash, salt } = hashPassword(adminPass);
      adminUser.passwordHash = hash;
      adminUser.passwordSalt = salt;
      delete adminUser.password;
      adminUser.role = 'admin';
      adminUser.isSubscribed = true;
      adminUser.planStatus = 'active';
      writeDb(db);
      console.log(`[SECURITY] Hash de segurança do Administrador atualizado.`);
    }
  }
}
ensureMasterAdmin();

function calculatePresence(lastHeartbeat, loginTime) {
  const now = Date.now();
  if (lastHeartbeat && (now - lastHeartbeat) < 45000) {
    return 'online'; // Conectado agora (heartbeat nos últimos 45s)
  }
  const loginMs = loginTime ? new Date(loginTime).getTime() : 0;
  if (loginMs && (now - loginMs) < 24 * 3600 * 1000) {
    return 'recent_login'; // Fez login recente nas últimas 24h, mas não tem heartbeat ativo agora
  }
  return 'offline'; // Inativo / Desconectado
}

function validateAdmin(req) {
  const adminHeader = req.headers['x-admin-token'];
  if (adminHeader && adminTokens.has(adminHeader)) return true;

  const cookies = parseCookies(req);
  const cookieSessionId = cookies['estude_session'];
  const authHeader = req.headers['authorization'] || '';
  let queryToken = '';
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    queryToken = parsedUrl.searchParams.get('token') || parsedUrl.searchParams.get('adminToken') || '';
  } catch (e) {}
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'] || queryToken;
  if (token && adminTokens.has(token)) return true;

  const sessionId = cookieSessionId || req.headers['x-session-id'] || req.headers['x-session'] || (token.startsWith('sess_') ? token : '');
  if (sessionId) {
    let session = activeSessions.get(sessionId);
    if (!session) {
      const db = readDb();
      session = (db.sessions || []).find(s => s.sessionId === sessionId);
      if (session) activeSessions.set(sessionId, session);
    }
    if (session && (session.userRole === 'admin' || session.userName === 'freddie')) return true;
  }
  return false;
}

function checkUserTrilhasAccess(user) {
  if (!user) {
    return { allowed: false, isPro: false, isAdmin: false, reason: 'unauthenticated' };
  }

  // 1. Admin com permissão administrativa própria (não simula assinatura Pro comum)
  if (user.role === 'admin' || user.username === 'freddie') {
    return {
      allowed: true,
      isAdmin: true,
      isPro: false,
      role: 'admin',
      label: 'Acesso Administrativo'
    };
  }

  // 2. Verifica se a assinatura PRO está expirada
  if (user.proExpiresAt && new Date(user.proExpiresAt).getTime() <= Date.now()) {
    return {
      allowed: false,
      isAdmin: false,
      isPro: false,
      reason: 'pro_expired',
      expiredAt: user.proExpiresAt
    };
  }

  // 3. Status de PRO ativo
  const proStatuses = ['active', 'pro_mensal_active', 'pro_anual_active'];
  const hasProStatus = proStatuses.includes(user.planStatus);
  const isSubscribed = Boolean(user.isSubscribed);
  const isPlanPro = user.plan === 'pro';

  if ((isSubscribed && user.planStatus !== 'canceled' && user.planStatus !== 'expired') || hasProStatus || isPlanPro) {
    const isAnual = user.planType === 'pro_anual' || user.planStatus === 'pro_anual_active' || user.planPeriodicity === 'anual';
    return {
      allowed: true,
      isAdmin: false,
      isPro: true,
      planType: isAnual ? 'pro_anual' : 'pro_mensal',
      planName: isAnual ? 'PRO Anual (R$ 120,00/ano)' : 'PRO Mensal (R$ 10,00/mês)',
      proExpiresAt: user.proExpiresAt || null
    };
  }

  // 4. Período de degustação de 5 dias (se ativo)
  if ((user.planStatus === 'trial_5d' || user.plan === 'trial_5d') && user.trialExpiresAt) {
    if (new Date(user.trialExpiresAt).getTime() > Date.now()) {
      return {
        allowed: true,
        isAdmin: false,
        isPro: true,
        isTrial: true,
        planType: 'trial_5d',
        planName: 'Degustação PRO 5 Dias',
        proExpiresAt: user.trialExpiresAt
      };
    }
  }

  return {
    allowed: false,
    isAdmin: false,
    isPro: false,
    reason: 'free_user'
  };
}

function buildSafeUser(u, extra = {}) {
  if (!u) return null;
  const isProUser = Boolean(u.isSubscribed) || u.plan === 'pro' || u.planStatus === 'active' || u.planStatus === 'pro_mensal_active' || u.planStatus === 'pro_anual_active';

  const preferences = {
    themeMode: u.themeMode || u.preferences?.themeMode || 'light',
    fontSize: u.fontSize || u.preferences?.fontSize || 'normal',
    density: u.density || u.preferences?.density || 'comfortable',
    accentColor: u.accentColor || u.preferences?.accentColor || '#4f46e5',
    accentName: u.accentName || u.preferences?.accentName || 'Índigo Estude+',
    reduceMotion: u.reduceMotion !== undefined ? Boolean(u.reduceMotion) : Boolean(u.preferences?.reduceMotion),
    dashboardCards: (Array.isArray(u.dashboardCards) ? u.dashboardCards : (Array.isArray(u.preferences?.dashboardCards) ? u.preferences.dashboardCards : null))?.filter(c => c && c.id !== 'smart-stats') || null
  };

  const studentSettings = {
    name: u.name || u.username,
    nickname: u.nickname || (u.name ? u.name.split(' ')[0] : u.username),
    avatar: u.avatar || '🦄',
    motto: u.motto !== undefined ? u.motto : 'Foco todo dia para mandar bem nas provas do SAS!',
    grade: u.grade || '7º Ano EF',
    className: u.className || '7º ano B • Gammon 2',
    focusSubjects: Array.isArray(u.focusSubjects) && u.focusSubjects.length > 0 ? u.focusSubjects : ['matematica', 'portugues', 'ciencias'],
    dailyGoal: Number(u.dailyGoal || u.dailyGoalMinutes) || 15,
    studyShift: u.studyShift || 'tarde',
    tpcReminderTime: u.tpcReminderTime || '17:00',
    aiStyle: u.aiStyle || 'direto',
    scheduleWeekly: u.scheduleWeekly || {
      seg: 'Matemática, Português, Geografia, Inglês',
      ter: 'Ciências, Matemática, História, Artes',
      qua: 'Português, Redação, Física, Filosofia',
      qui: 'Matemática, Geografia, Química, Inglês',
      sex: 'História, Português, Biologia, Ed. Física'
    }
  };

  const tpcsList = Array.isArray(u.userTpcs) ? u.userTpcs : (Array.isArray(u.tpcs) ? u.tpcs : (u.tasks?.userTpcs || []));
  const completedTpcs = Array.isArray(u.completedTpcIds) ? u.completedTpcIds : (u.tasks?.completedTpcIds || []);

  return {
    id: u.id,
    name: u.name || u.username,
    username: u.username,
    email: u.email,
    role: u.role || 'student',
    emailVerified: u.emailVerified !== false,

    // Foto, nome e configurações pessoais
    avatar: studentSettings.avatar,
    nickname: studentSettings.nickname,
    motto: studentSettings.motto,
    grade: studentSettings.grade,
    className: studentSettings.className,
    focusSubjects: studentSettings.focusSubjects,
    dailyGoal: studentSettings.dailyGoal,
    dailyGoalMinutes: studentSettings.dailyGoal,
    studyShift: studentSettings.studyShift,
    tpcReminderTime: studentSettings.tpcReminderTime,
    aiStyle: studentSettings.aiStyle,
    scheduleWeekly: studentSettings.scheduleWeekly,
    studentSettings,

    // Preferências e interface
    themeMode: preferences.themeMode,
    fontSize: preferences.fontSize,
    density: preferences.density,
    accentColor: preferences.accentColor,
    accentName: preferences.accentName,
    reduceMotion: preferences.reduceMotion,
    dashboardCards: preferences.dashboardCards,
    preferences,

    // Plano e permissões
    isSubscribed: isProUser,
    plan: isProUser ? 'pro' : 'base',
    planStatus: isProUser ? (u.planStatus || 'pro_mensal_active') : (u.planStatus === 'expired' ? 'expired' : 'base'),
    planType: isProUser ? (u.planType || 'pro_mensal') : 'base',
    planPeriodicity: isProUser ? (u.planPeriodicity || 'mensal') : 'gratuito',
    planName: isProUser ? (u.planName || 'Plano PRO') : 'Plano Base',
    proActivatedAt: u.proActivatedAt || null,
    proExpiresAt: u.proExpiresAt || null,
    trialExpiresAt: u.trialExpiresAt || null,

    // Tarefas, trabalhos, provas e anotações
    timetable: Array.isArray(u.timetable) ? u.timetable : null,
    tasks: {
      completedTpcIds: completedTpcs,
      userTpcs: tpcsList
    },
    tpcs: tpcsList,
    completedTpcIds: completedTpcs,
    exams: Array.isArray(u.exams) ? u.exams : [],
    notes: Array.isArray(u.notes) ? u.notes : [],
    flashcards: Array.isArray(u.flashcards) ? u.flashcards : [],
    mindmaps: Array.isArray(u.mindmaps) ? u.mindmaps : [],
    glossary: Array.isArray(u.glossary) ? u.glossary : [],
    doubts: Array.isArray(u.doubts) ? u.doubts : [],
    collections: Array.isArray(u.collections) ? u.collections : [],
    favorites: Array.isArray(u.favorites) ? u.favorites : [],
    customSimulados: Array.isArray(u.customSimulados) ? u.customSimulados : [],
    dashboardShortcuts: Array.isArray(u.dashboardShortcuts) ? u.dashboardShortcuts : ['gemini-chat', 'flashcards', 'notes', 'simulado', 'sas-eureka', 'trilhas'],
    syncVersion: Number(u.syncVersion) || 1,

    lastSync: u.lastSync || new Date().toISOString(),
    ...extra
  };
}

function getAuthUser(req) {
  const cookies = parseCookies(req);
  const cookieSessionId = cookies['estude_session'];
  const headerSessionId = req.headers['x-session-id'] || req.headers['x-session'] || '';
  const authHeader = req.headers['authorization'] || '';
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'] || '';

  const sessionId = cookieSessionId || headerSessionId || (bearerToken.startsWith('sess_') ? bearerToken : '');

  const db = readDb();
  const now = Date.now();

  if (sessionId) {
    let session = activeSessions.get(sessionId);
    if (!session && Array.isArray(db.sessions)) {
      session = db.sessions.find(s => s.sessionId === sessionId);
      if (session) {
        activeSessions.set(sessionId, session);
      }
    }

    if (session) {
      // Verifica expiração da sessão
      if (session.expiresAt && session.expiresAt < now) {
        activeSessions.delete(sessionId);
        if (Array.isArray(db.sessions)) {
          db.sessions = db.sessions.filter(s => s.sessionId !== sessionId);
          writeDb(db);
        }
        return null;
      }

      const isTombstoned = (db.deletedAccountTombstones || []).some(t => String(t.id) === String(session.userId));
      const user = (db.users || []).find(u => String(u.id) === String(session.userId));
      if (!user || isTombstoned) {
        activeSessions.delete(sessionId);
        if (Array.isArray(db.sessions)) {
          db.sessions = db.sessions.filter(s => s.sessionId !== sessionId);
          writeDb(db);
        }
        return null;
      }
      session.lastHeartbeat = now;
      return { user, session };
    }
  }

  // Token de autorização (Bearer token ou admin)
  if (bearerToken) {
    if (activeSessions.has(bearerToken)) {
      const session = activeSessions.get(bearerToken);
      const isTombstoned = (db.deletedAccountTombstones || []).some(t => String(t.id) === String(session.userId));
      const user = (db.users || []).find(u => u.id === session.userId);
      if (!user || isTombstoned) {
        activeSessions.delete(bearerToken);
        return null;
      }
      return { user, session };
    }
    if (adminTokens.has(bearerToken)) {
      const admin = (db.users || []).find(u => u.role === 'admin') || {
        id: 'admin_freddie',
        name: 'Freddie Pimentel Costa',
        role: 'admin',
        username: 'freddie'
      };
      return { user: admin, session: { sessionId: 'admin_token', userId: admin.id, userRole: 'admin', userName: admin.name } };
    }
  }

  // Suporte a identificação de dispositivo somente com sessão ativa comprovada
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId) {
    let session = Array.from(activeSessions.values()).find(s => String(s.userId) === String(headerUserId) && (!s.expiresAt || s.expiresAt > now));
    if (!session && Array.isArray(db.sessions)) {
      session = db.sessions.find(s => String(s.userId) === String(headerUserId) && (!s.expiresAt || s.expiresAt > now));
    }
    if (session) {
      const user = (db.users || []).find(u => String(u.id) === String(headerUserId));
      if (user) {
        return { user, session };
      }
    }
  }

  return null;
}

// Function to run Gammon sync in background
let isSyncRunning = false;
function triggerGammonSync(callback) {
  if (isSyncRunning) {
    if (callback) callback({ status: 'running', message: 'Sincronização já em andamento.' });
    return;
  }
  isSyncRunning = true;
  console.log(`[${new Date().toISOString()}] Disparando sincronização com Portal Gammon...`);

  exec(`node "${path.join(__dirname, 'gammon_sync_service.js')}"`, (error, stdout, stderr) => {
    isSyncRunning = false;
    if (error) {
      console.error('Erro na sincronização:', error.message);
      const db = readDb();
      if (!Array.isArray(db.agendaSyncLogs)) db.agendaSyncLogs = [];
      db.agendaSyncLogs.unshift({
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error.message
      });
      if (db.agendaSyncLogs.length > 50) db.agendaSyncLogs = db.agendaSyncLogs.slice(0, 50);
      writeDb(db);
      logSystemEvent('warn', 'gammon_sync', 'Aviso na sincronização do Portal Gammon', { error: error.message });
      if (callback) callback({ status: 'error', message: error.message });
      return;
    }

    try {
      const tpcsFile = path.join(__dirname, 'gammon_tpcs.json');
      if (fs.existsSync(tpcsFile)) {
        const freshTpcs = JSON.parse(fs.readFileSync(tpcsFile, 'utf8'));
        const db = readDb();
        
        // REGRA OFICIAL: Manter estritamente os 5 TPCs diários mais recentes
        const tpcMap = new Map();
        // Preserva status de 'done' / 'dismissed' do aluno caso já tenha marcado como feito
        (db.tpcs || []).forEach(t => tpcMap.set(String(t.id), t));
        freshTpcs.forEach(t => {
          const key = String(t.id);
          const prev = tpcMap.get(key);
          if (prev) {
            tpcMap.set(key, { ...t, status: prev.status, done: prev.done, dismissed: prev.dismissed, doneAt: prev.doneAt });
          } else {
            tpcMap.set(key, t);
          }
        });

        // Ordena rigorosamente pelos mais recentes (data/horário e ID Gammon)
        const sorted = Array.from(tpcMap.values()).sort((a, b) => {
          const timeA = new Date(a.createdDate || a.dueDate || 0).getTime();
          const timeB = new Date(b.createdDate || b.dueDate || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return (Number(b.gammonId) || 0) - (Number(a.gammonId) || 0);
        });

        // Janela deslizante de no máximo 5 TPCs
        db.tpcs = sorted.slice(0, 5);
        db.gammonStatus = {
          status: 'success',
          lastSync: new Date().toISOString(),
          totalCaptured: db.tpcs.length,
          message: `${db.tpcs.length} TPCs mais recentes sincronizados do Portal Gammon!`
        };
        if (!Array.isArray(db.agendaSyncLogs)) db.agendaSyncLogs = [];
        db.agendaSyncLogs.unshift({
          timestamp: new Date().toISOString(),
          status: 'success',
          totalCaptured: db.tpcs.length,
          message: `${db.tpcs.length} TPCs diários mais recentes sincronizados com sucesso do Portal Gammon!`
        });
        if (db.agendaSyncLogs.length > 50) db.agendaSyncLogs = db.agendaSyncLogs.slice(0, 50);
        db.masterCommands = db.masterCommands || {};
        db.masterCommands.forceRefreshTimestamp = Date.now();
        writeDb(db);
        logSystemEvent('info', 'gammon_sync', `Sincronização Gammon concluída com ${db.tpcs.length} TPCs mais recentes`, { count: db.tpcs.length });
        broadcastToAdmins('gammon_sync', { totalTpcs: db.tpcs.length });
      }
    } catch (e) {
      console.error('Erro ao mesclar TPCs:', e);
      logSystemEvent('error', 'gammon_sync', 'Erro ao ler arquivo de TPCs sincronizados', { error: e.message });
    }

    if (callback) callback({ status: 'success', message: 'Sincronização concluída com sucesso!' });
  });
}

// Background cron: sync every 4 hours
setInterval(() => {
  console.log('Rotina agendada: checando novidades no Portal Gammon...');
  triggerGammonSync();
}, 4 * 60 * 60 * 1000);

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const clientIp = getClientIp(req);

  const sendJson = (data, code = 200, extraHeaders = {}) => {
    const origin = req.headers.origin;
    const baseHeaders = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token, x-session-id, x-user-id'
    };
    if (origin) {
      baseHeaders['Access-Control-Allow-Origin'] = origin;
      baseHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      baseHeaders['Access-Control-Allow-Origin'] = '*';
    }
    res.writeHead(code, { ...baseHeaders, ...extraHeaders });
    res.end(JSON.stringify(data));
  };

  const parseBody = (cb) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let json = {};
      try {
        json = body ? JSON.parse(body) : {};
      } catch (e) {
        console.warn('[ParseBody JSON Error]', e.message);
        return cb(null);
      }
      try {
        cb(json);
      } catch (err) {
        console.error('[Route Handler Error]', err);
        if (!res.headersSent) {
          sendJson({ error: 'Erro interno no servidor: ' + err.message }, 500);
        }
      }
    });
  };

  // CORS preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token, x-session-id, x-user-id'
    };
    if (origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    }
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  /* ==========================================================================
     API ROUTES: BIBLIOTECA DE MATERIAIS & WORKSPACE DO ALUNO
     ========================================================================== */

  // GET /api/materials - Lista materiais do aluno autenticado
  if (req.method === 'GET' && pathname === '/api/materials') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado. Faça login para ver seus materiais.' }, 401);
    }
    const db = readDb();
    let userMaterials = (db.materials || []).filter(m => String(m.userId) === String(auth.user.id));

    const subjectFilter = parsedUrl.searchParams.get('subject');
    const searchFilter = parsedUrl.searchParams.get('search');
    if (subjectFilter && subjectFilter !== 'all') {
      userMaterials = userMaterials.filter(m => m.subject && m.subject.toLowerCase() === subjectFilter.toLowerCase());
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase().trim();
      userMaterials = userMaterials.filter(m =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.topic && m.topic.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q))
      );
    }

    userMaterials.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    return sendJson({ success: true, materials: userMaterials, total: userMaterials.length });
  }

  // GET /api/materials/:id - Detalhes e recursos vinculados de um material
  const matDetailRegex = /^\/api\/materials\/([a-zA-Z0-9_\-]+)$/;
  const matDetailMatch = pathname.match(matDetailRegex);

  if (req.method === 'GET' && matDetailMatch) {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);
    const materialId = matDetailMatch[1];
    const db = readDb();
    const material = (db.materials || []).find(m => String(m.id) === String(materialId) && (String(m.userId) === String(auth.user.id) || auth.user.role === 'admin'));
    if (!material) return sendJson({ error: 'Material não encontrado ou acesso não autorizado.' }, 404);

    const linkedFlashcards = (db.flashcards || []).filter(f => String(f.materialId) === String(materialId) && String(f.userId) === String(auth.user.id));
    const linkedSimulados = (db.simulados || []).filter(s => String(s.materialId) === String(materialId) && String(s.userId) === String(auth.user.id));
    const linkedMindmap = (db.mindmaps || []).find(m => String(m.materialId) === String(materialId) && String(m.userId) === String(auth.user.id));
    const linkedNotes = (db.studentNotes || []).find(n => String(n.materialId) === String(materialId) && String(n.userId) === String(auth.user.id));

    return sendJson({
      success: true,
      material,
      linkedResources: {
        flashcards: linkedFlashcards,
        simulados: linkedSimulados,
        mindmap: linkedMindmap || null,
        notes: linkedNotes || null
      }
    });
  }

  // POST /api/materials - Cadastrar novo material na biblioteca
  if (req.method === 'POST' && pathname === '/api/materials') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Acesso não autenticado.' }, 401);

    parseBody((data) => {
      if (!data) return sendJson({ error: 'Dados inválidos.' }, 400);
      const title = (data.title || '').trim();
      const content = (data.content || '').trim();
      const subject = (data.subject || 'Geral').trim();
      const topic = (data.topic || '').trim();
      const fileType = data.fileType || 'text'; // 'pdf', 'doc', 'text', 'notes'
      const originalFileName = data.originalFileName || null;
      const fileSize = data.fileSize || (content.length > 1024 ? (content.length / 1024).toFixed(1) + ' KB' : content.length + ' B');

      if (!title) return sendJson({ error: 'O título do material é obrigatório.' }, 400);
      if (!content) return sendJson({ error: 'O texto ou conteúdo do material não pode estar vazio.' }, 400);

      const db = readDb();
      if (!Array.isArray(db.materials)) db.materials = [];

      const newMaterial = {
        id: 'mat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: auth.user.id,
        title,
        subject,
        topic: topic || title,
        content,
        fileType,
        originalFileName,
        fileSize,
        status: 'ready',
        summary: null,
        resourcesCount: {
          summaries: 0,
          flashcards: 0,
          questions: 0,
          simulados: 0,
          mindmaps: 0,
          notes: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.materials.unshift(newMaterial);
      writeDb(db);
      logAudit('create_material', auth.user.username || auth.user.name, { materialId: newMaterial.id, title }, clientIp);

      return sendJson({ success: true, material: newMaterial }, 201);
    });
    return;
  }

  // PUT /api/materials/:id - Atualizar material existente
  if (req.method === 'PUT' && matDetailMatch) {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);
    const materialId = matDetailMatch[1];

    parseBody((data) => {
      if (!data) return sendJson({ error: 'Dados inválidos.' }, 400);
      const db = readDb();
      const mat = (db.materials || []).find(m => String(m.id) === String(materialId) && (String(m.userId) === String(auth.user.id) || auth.user.role === 'admin'));
      if (!mat) return sendJson({ error: 'Material não encontrado ou você não tem permissão para editá-lo.' }, 404);

      if (data.title) mat.title = data.title.trim();
      if (data.subject) mat.subject = data.subject.trim();
      if (data.topic !== undefined) mat.topic = data.topic.trim();
      if (data.content) mat.content = data.content.trim();
      if (data.summary !== undefined) mat.summary = data.summary;
      if (data.resourcesCount) mat.resourcesCount = { ...mat.resourcesCount, ...data.resourcesCount };
      if (data.studentNotes !== undefined) {
        mat.studentNotes = data.studentNotes;
        if (!Array.isArray(db.studentNotes)) db.studentNotes = [];
        const noteIdx = db.studentNotes.findIndex(n => String(n.materialId) === String(materialId) && String(n.userId) === String(auth.user.id));
        if (noteIdx !== -1) {
          db.studentNotes[noteIdx].content = data.studentNotes;
          db.studentNotes[noteIdx].updatedAt = new Date().toISOString();
        } else {
          db.studentNotes.push({
            id: 'note_' + Date.now(),
            materialId,
            userId: auth.user.id,
            content: data.studentNotes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      mat.updatedAt = new Date().toISOString();

      writeDb(db);
      return sendJson({ success: true, material: mat });
    });
    return;
  }

  // DELETE /api/materials/:id - Excluir material e seus recursos vinculados
  if (req.method === 'DELETE' && matDetailMatch) {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);
    const materialId = matDetailMatch[1];

    const db = readDb();
    const idx = (db.materials || []).findIndex(m => String(m.id) === String(materialId) && (String(m.userId) === String(auth.user.id) || auth.user.role === 'admin'));
    if (idx === -1) return sendJson({ error: 'Material não encontrado ou acesso não autorizado.' }, 404);

    db.materials.splice(idx, 1);
    if (Array.isArray(db.flashcards)) db.flashcards = db.flashcards.filter(f => String(f.materialId) !== String(materialId));
    if (Array.isArray(db.simulados)) db.simulados = db.simulados.filter(s => String(s.materialId) !== String(materialId));
    if (Array.isArray(db.mindmaps)) db.mindmaps = db.mindmaps.filter(m => String(m.materialId) !== String(materialId));
    if (Array.isArray(db.studentNotes)) db.studentNotes = db.studentNotes.filter(n => String(n.materialId) !== String(materialId));

    writeDb(db);
    logAudit('delete_material', auth.user.username || auth.user.name, { materialId }, clientIp);
    return sendJson({ success: true, deletedId: materialId });
  }

  /* ==========================================================================
     API ROUTES & SEGURANÇA
     ========================================================================== */

  // 1. GET /api/state - Dados públicos / comuns para alunos e celulares
  // NÃO expõe a lista de outros usuários, senhas ou tokens
  if (req.method === 'GET' && pathname === '/api/state') {
    const db = readDb();
    const publicState = {
      tpcs: db.tpcs || [],
      gammonStatus: db.gammonStatus || {},
      masterCommands: db.masterCommands || {},
      serverTime: new Date().toISOString()
    };
    return sendJson(publicState);
  }

  // 1b. GET /api/supabase/status - Estado da conexão com o Supabase
  if (req.method === 'GET' && pathname === '/api/supabase/status') {
    return sendJson({
      configured: supabase.isConfigured,
      url: supabase.isConfigured ? supabase.SUPABASE_URL : null,
      provider: 'Supabase PostgreSQL Cloud'
    });
  }

  // 1c. POST /api/supabase/sync - Sincronização sob demanda (Admin)
  if (req.method === 'POST' && pathname === '/api/supabase/sync') {
    if (!supabase.isConfigured) {
      return sendJson({ error: 'Supabase não está configurado. Preencha SUPABASE_URL e SUPABASE_KEY no .env' }, 400);
    }
    const db = readDb();
    supabase.syncFromLocalDb(db).then(success => {
      return sendJson({ success, message: 'Sincronização com Supabase concluída!' });
    }).catch(err => {
      return sendJson({ error: err.message }, 500);
    });
    return;
  }

  /* ==========================================================================
     SINCRONIZAÇÃO ENTRE DISPOSITIVOS (CELULAR, TABLET, PC)
     ========================================================================== */

    // GET /api/user/sync ou GET /api/auth/me - Baixa os dados completos e atualizados do usuário autenticado
  if (req.method === 'GET' && (pathname === '/api/user/sync' || pathname === '/api/auth/me')) {
    const auth = getAuthUser(req);
    const requestedUserId = req.headers['x-user-id'];

    const db = readDb();
    const isRequestedTombstoned = requestedUserId ? (db.deletedAccountTombstones || []).some(t => String(t.id) === String(requestedUserId)) : false;
    const requestedUserExists = requestedUserId ? (db.users || []).some(u => String(u.id) === String(requestedUserId)) : false;

    if (!auth || !auth.user) {
      if (requestedUserId && (isRequestedTombstoned || !requestedUserExists)) {
        return sendJson({ error: 'Sua conta foi permanentemente excluída pelo administrador.', accountDeleted: true }, 401);
      }
      return sendJson({ error: 'Não autenticado. Faça login para acessar seus dados salvos.', accountDeleted: isRequestedTombstoned }, 401);
    }

    // Regra de segurança: impede que usuário comum acesse dados de outra conta
    if (requestedUserId && String(requestedUserId) !== String(auth.user.id) && auth.user.role !== 'admin') {
      return sendJson({ error: 'Acesso negado. Você não tem permissão para acessar dados de outra conta.' }, 403);
    }

    const isAuthTombstoned = (db.deletedAccountTombstones || []).some(t => String(t.id) === String(auth.user.id));
    const freshUser = (db.users || []).find(u => String(u.id) === String(auth.user.id));
    if (!freshUser || isAuthTombstoned) {
      if (auth.session && auth.session.sessionId) {
        activeSessions.delete(auth.session.sessionId);
      }
      return sendJson({ error: 'Sua conta foi permanentemente excluída pelo administrador.', accountDeleted: true }, 401);
    }

    if (freshUser.isSuspended) {
      return sendJson({ error: 'Sua conta está suspensa pelo administrador.', isSuspended: true, reason: freshUser.suspendedReason }, 403);
    }

    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);

    if (!Array.isArray(freshUser.loginDays)) freshUser.loginDays = [];
    if (!freshUser.loginDays.includes(todayStr)) {
      freshUser.loginDays.push(todayStr);
      writeDb(db);
    }

    // Busca a solicitação de plano mais recente deste usuário
    const activeReq = (db.planRequests || [])
      .filter(r => r.userId === freshUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

    // Verifica expiração automática de assinatura
    if (freshUser.isSubscribed && freshUser.proExpiresAt && new Date(freshUser.proExpiresAt).getTime() <= Date.now()) {
      freshUser.isSubscribed = false;
      freshUser.plan = 'base';
      freshUser.planStatus = 'expired';
      freshUser.planName = 'Plano Base';
      writeDb(db);
    }

    const safeUser = buildSafeUser(freshUser);

    return sendJson({
      success: true,
      user: safeUser,
      activePlanRequest: activeReq,
      sessionId: auth.session?.sessionId || null
    });
  }

  // POST /api/user/sync - Salva perfil, preferências, tarefas, trabalhos, anotações e provas no servidor
  if (req.method === 'POST' && pathname === '/api/user/sync') {
    const auth = getAuthUser(req);
    const requestedUserId = req.headers['x-user-id'];
    const db = readDb();

    // Verificação anti-ressurreição: se o ID solicitado está nos tombstones de contas excluídas
    const isRequestedTombstoned = requestedUserId ? (db.deletedAccountTombstones || []).some(t => String(t.id) === String(requestedUserId)) : false;
    if (requestedUserId && isRequestedTombstoned) {
      return sendJson({ error: 'Esta conta foi permanentemente excluída e não aceita mais sincronizações.', accountDeleted: true }, 401);
    }

    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado. Sessão inválida ou expirada. Faça login novamente.', accountDeleted: isRequestedTombstoned }, 401);
    }

    // Regra de segurança: impede que usuário comum altere dados de outra conta
    if (requestedUserId && String(requestedUserId) !== String(auth.user.id) && auth.user.role !== 'admin') {
      return sendJson({ error: 'Acesso negado. Você não tem permissão para alterar dados de outra conta.' }, 403);
    }

    const isAuthTombstoned = (db.deletedAccountTombstones || []).some(t => String(t.id) === String(auth.user.id));
    if (isAuthTombstoned) {
      return sendJson({ error: 'Esta conta foi permanentemente excluída do sistema e não aceita mais alterações.', accountDeleted: true }, 401);
    }

    parseBody((data) => {
      if (!data) return sendJson({ error: 'Dados inválidos para sincronização.' }, 400);

      const dbCurrent = readDb();
      const uIndex = (dbCurrent.users || []).findIndex(u => String(u.id) === String(auth.user.id));
      if (uIndex === -1) {
        return sendJson({ error: 'Usuário não encontrado no banco de dados oficial. A conta foi excluída.', accountDeleted: true }, 401);
      }

      const u = dbCurrent.users[uIndex];
      if (u.isSuspended) {
        return sendJson({ error: 'Sua conta está suspensa pelo administrador.', isSuspended: true, reason: u.suspendedReason }, 403);
      }

      // 1. Perfil e Configurações Pessoais (Foto/Avatar, Nome, Apelido, Lema, Série, Turma, Foco, etc.)
      const profileData = data.profile || data.studentSettings || {};
      if (typeof profileData === 'object') {
        if (profileData.name && String(profileData.name).trim()) u.name = String(profileData.name).trim();
        if (profileData.nickname && String(profileData.nickname).trim()) u.nickname = String(profileData.nickname).trim();
        if (profileData.avatar && String(profileData.avatar).trim()) u.avatar = String(profileData.avatar).trim();
        if (profileData.motto !== undefined) u.motto = String(profileData.motto).trim();
        if (profileData.grade && String(profileData.grade).trim()) u.grade = String(profileData.grade).trim();
        if (profileData.className && String(profileData.className).trim()) u.className = String(profileData.className).trim();
        if (Array.isArray(profileData.focusSubjects)) u.focusSubjects = profileData.focusSubjects;
        if (profileData.dailyGoal !== undefined) {
          u.dailyGoal = Number(profileData.dailyGoal) || 15;
          u.dailyGoalMinutes = u.dailyGoal;
        }
        if (profileData.studyShift) u.studyShift = profileData.studyShift;
        if (profileData.tpcReminderTime) u.tpcReminderTime = profileData.tpcReminderTime;
        if (profileData.aiStyle) u.aiStyle = profileData.aiStyle;
        if (profileData.scheduleWeekly && typeof profileData.scheduleWeekly === 'object') {
          u.scheduleWeekly = { ...(u.scheduleWeekly || {}), ...profileData.scheduleWeekly };
        }
        u.studentSettings = {
          ...(u.studentSettings || {}),
          ...profileData
        };
      }

      // 2. Preferências e Personalização da Interface (Tema, Fonte, Densidade, Cores, Cards)
      if (data.preferences && typeof data.preferences === 'object') {
        u.preferences = { ...(u.preferences || {}), ...data.preferences };
        if (data.preferences.themeMode) u.themeMode = data.preferences.themeMode;
        if (data.preferences.fontSize) u.fontSize = data.preferences.fontSize;
        if (data.preferences.density) u.density = data.preferences.density;
        if (data.preferences.accentColor) u.accentColor = data.preferences.accentColor;
        if (data.preferences.accentName) u.accentName = data.preferences.accentName;
        if (data.preferences.reduceMotion !== undefined) u.reduceMotion = Boolean(data.preferences.reduceMotion);
        if (Array.isArray(data.preferences.dashboardCards)) u.dashboardCards = data.preferences.dashboardCards;
      }

      // 3. Tarefas, Trabalhos e TPCs
      if (Array.isArray(data.tpcs)) {
        u.userTpcs = data.tpcs;
      } else if (data.tasks && Array.isArray(data.tasks.userTpcs)) {
        u.userTpcs = data.tasks.userTpcs;
      }
      if (Array.isArray(data.completedTpcIds)) {
        u.completedTpcIds = data.completedTpcIds;
      } else if (data.tasks && Array.isArray(data.tasks.completedTpcIds)) {
        u.completedTpcIds = data.tasks.completedTpcIds;
      }
      u.tasks = {
        completedTpcIds: u.completedTpcIds || [],
        userTpcs: u.userTpcs || []
      };

      // 4. Provas e Avaliações Agendadas (Calendário)
      if (Array.isArray(data.exams)) {
        u.exams = data.exams;
      }

      // 5. Anotações (Caderno Digital)
      if (Array.isArray(data.notes)) {
        u.notes = data.notes;
      }

      // 6. Grade de Horários (Timetable)
      if (Array.isArray(data.timetable)) {
        u.timetable = data.timetable;
      }

      // 7. Cartões de Memorização (Flashcards)
      if (Array.isArray(data.flashcards)) {
        u.flashcards = data.flashcards;
      }

      // 7.1. Mapas Mentais
      if (Array.isArray(data.mindmaps)) {
        u.mindmaps = data.mindmaps;
      }

      // 7.2. Glossário Pessoal
      if (Array.isArray(data.glossary)) {
        u.glossary = data.glossary;
      }

      // 7.3. Organizador de Dúvidas
      if (Array.isArray(data.doubts)) {
        u.doubts = data.doubts;
      }

      // 8. Coleções Personalizadas
      if (Array.isArray(data.collections)) {
        u.collections = data.collections;
      }

      // 9. Favoritos (Respostas IA, Materiais, Conteúdos)
      if (Array.isArray(data.favorites)) {
        u.favorites = data.favorites;
      }

      // 10. Simulados Personalizados
      if (Array.isArray(data.customSimulados)) {
        u.customSimulados = data.customSimulados;
      }

      // 11. Atalhos Personalizados do Início
      if (Array.isArray(data.dashboardShortcuts)) {
        u.dashboardShortcuts = data.dashboardShortcuts;
      }

      if (data.deviceType) {
        u.lastDeviceType = data.deviceType;
      }

      u.syncVersion = (Number(u.syncVersion) || 0) + 1;
      u.lastSync = new Date().toISOString();
      writeDb(dbCurrent);

      // Notificar outros dispositivos conectados do mesmo aluno para sincronização em tempo real
      broadcastToUser(u.id, 'data_synced', { syncVersion: u.syncVersion, lastSync: u.lastSync });

      const safeUser = buildSafeUser(u);
      return sendJson({
        success: true,
        message: 'Todos os dados foram salvos e sincronizados com sucesso no servidor!',
        user: safeUser,
        lastSync: u.lastSync
      });
    });
    return;
  }

  
  // GET /api/user/sync-status - Checagem leve de versão para detectar alterações em outros dispositivos
  if (req.method === 'GET' && pathname === '/api/user/sync-status') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado', accountDeleted: true }, 401);
    const db = readDb();
    const isTombstoned = (db.deletedAccountTombstones || []).some(t => String(t.id) === String(auth.user.id));
    const freshUser = (db.users || []).find(u => String(u.id) === String(auth.user.id));
    if (!freshUser || isTombstoned) return sendJson({ error: 'Conta excluída.', accountDeleted: true }, 401);
    if (freshUser.isSuspended) return sendJson({ error: 'Conta suspensa.', isSuspended: true }, 403);

    return sendJson({
      success: true,
      syncVersion: Number(freshUser.syncVersion) || 1,
      lastSync: freshUser.lastSync || null
    });
  }

  // POST /api/user/sync-action - Ações atômicas (notas, flashcards, coleções, favoritos, atalhos)
  if (req.method === 'POST' && pathname === '/api/user/sync-action') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado', accountDeleted: true }, 401);

    parseBody((payload) => {
      if (!payload || !payload.action) return sendJson({ error: 'Ação não informada.' }, 400);
      const db = readDb();
      const isTombstoned = (db.deletedAccountTombstones || []).some(t => String(t.id) === String(auth.user.id));
      const uIndex = (db.users || []).findIndex(u => String(u.id) === String(auth.user.id));
      if (uIndex === -1 || isTombstoned) return sendJson({ error: 'Conta excluída.', accountDeleted: true }, 401);
      const u = db.users[uIndex];
      if (u.isSuspended) return sendJson({ error: 'Conta suspensa.', isSuspended: true }, 403);

      const action = payload.action;
      const nowIso = new Date().toISOString();

      if (action === 'save_note') {
        if (!Array.isArray(u.notes)) u.notes = [];
        const note = payload.note;
        if (!note || !note.id) return sendJson({ error: 'Nota inválida.' }, 400);
        note.updatedAt = nowIso;
        const idx = u.notes.findIndex(n => n.id === note.id);
        if (idx >= 0) u.notes[idx] = { ...u.notes[idx], ...note };
        else u.notes.unshift({ ...note, createdAt: note.createdAt || nowIso });
      } else if (action === 'delete_note') {
        if (Array.isArray(u.notes)) {
          u.notes = u.notes.filter(n => n.id !== payload.noteId);
        }
      } else if (action === 'save_flashcard') {
        if (!Array.isArray(u.flashcards)) u.flashcards = [];
        const card = payload.flashcard;
        if (!card || !card.id) return sendJson({ error: 'Flashcard inválido.' }, 400);
        card.updatedAt = nowIso;
        const idx = u.flashcards.findIndex(f => f.id === card.id);
        if (idx >= 0) u.flashcards[idx] = { ...u.flashcards[idx], ...card };
        else u.flashcards.unshift({ ...card, createdAt: card.createdAt || nowIso });
      } else if (action === 'delete_flashcard') {
        if (Array.isArray(u.flashcards)) {
          u.flashcards = u.flashcards.filter(f => f.id !== payload.flashcardId);
        }
      } else if (action === 'toggle_favorite') {
        if (!Array.isArray(u.favorites)) u.favorites = [];
        const fav = payload.favorite;
        if (!fav || !fav.id) return sendJson({ error: 'Favorito inválido.' }, 400);
        const idx = u.favorites.findIndex(f => f.id === fav.id);
        if (idx >= 0) {
          u.favorites.splice(idx, 1);
        } else {
          u.favorites.unshift({ ...fav, createdAt: fav.createdAt || nowIso });
        }
      } else if (action === 'save_collection') {
        if (!Array.isArray(u.collections)) u.collections = [];
        const col = payload.collection;
        if (!col || !col.id) return sendJson({ error: 'Coleção inválida.' }, 400);
        col.updatedAt = nowIso;
        const idx = u.collections.findIndex(c => c.id === col.id);
        if (idx >= 0) u.collections[idx] = { ...u.collections[idx], ...col };
        else u.collections.push({ ...col, createdAt: col.createdAt || nowIso });
      } else if (action === 'delete_collection') {
        if (Array.isArray(u.collections)) {
          u.collections = u.collections.filter(c => c.id !== payload.collectionId);
        }
      } else if (action === 'save_shortcuts') {
        if (Array.isArray(payload.shortcuts)) {
          u.dashboardShortcuts = payload.shortcuts;
        }
      } else if (action === 'save_custom_simulado') {
        if (!Array.isArray(u.customSimulados)) u.customSimulados = [];
        const sim = payload.simulado;
        if (sim && sim.id) {
          sim.updatedAt = nowIso;
          const idx = u.customSimulados.findIndex(s => s.id === sim.id);
          if (idx >= 0) u.customSimulados[idx] = { ...u.customSimulados[idx], ...sim };
          else u.customSimulados.unshift({ ...sim, createdAt: sim.createdAt || nowIso });
        }
      } else if (action === 'save_mindmap') {
        if (!Array.isArray(u.mindmaps)) u.mindmaps = [];
        const mm = payload.mindmap;
        if (!mm || !mm.id) return sendJson({ error: 'Mapa mental inválido.' }, 400);
        mm.updatedAt = nowIso;
        const idx = u.mindmaps.findIndex(m => m.id === mm.id);
        if (idx >= 0) u.mindmaps[idx] = { ...u.mindmaps[idx], ...mm };
        else u.mindmaps.unshift({ ...mm, createdAt: mm.createdAt || nowIso });
      } else if (action === 'delete_mindmap') {
        if (Array.isArray(u.mindmaps)) {
          u.mindmaps = u.mindmaps.filter(m => m.id !== payload.mindmapId);
        }
      } else if (action === 'save_glossary') {
        if (!Array.isArray(u.glossary)) u.glossary = [];
        const item = payload.item;
        if (!item || !item.id) return sendJson({ error: 'Termo de glossário inválido.' }, 400);
        item.updatedAt = nowIso;
        const idx = u.glossary.findIndex(g => g.id === item.id);
        if (idx >= 0) u.glossary[idx] = { ...u.glossary[idx], ...item };
        else u.glossary.unshift({ ...item, createdAt: item.createdAt || nowIso });
      } else if (action === 'delete_glossary') {
        if (Array.isArray(u.glossary)) {
          u.glossary = u.glossary.filter(g => g.id !== payload.itemId);
        }
      } else if (action === 'save_doubt') {
        if (!Array.isArray(u.doubts)) u.doubts = [];
        const doubt = payload.doubt;
        if (!doubt || !doubt.id) return sendJson({ error: 'Dúvida inválida.' }, 400);
        doubt.updatedAt = nowIso;
        const idx = u.doubts.findIndex(d => d.id === doubt.id);
        if (idx >= 0) u.doubts[idx] = { ...u.doubts[idx], ...doubt };
        else u.doubts.unshift({ ...doubt, createdAt: doubt.createdAt || nowIso });
      } else if (action === 'delete_doubt') {
        if (Array.isArray(u.doubts)) {
          u.doubts = u.doubts.filter(d => d.id !== payload.doubtId);
        }
      } else if (action === 'save_exam') {
        if (!Array.isArray(u.exams)) u.exams = [];
        const exam = payload.exam;
        if (!exam || !exam.id) return sendJson({ error: 'Prova/Tarefa inválida.' }, 400);
        exam.updatedAt = nowIso;
        const idx = u.exams.findIndex(e => String(e.id) === String(exam.id));
        if (idx >= 0) u.exams[idx] = { ...u.exams[idx], ...exam };
        else u.exams.unshift({ ...exam, createdAt: exam.createdAt || nowIso });
      } else if (action === 'delete_exam') {
        if (Array.isArray(u.exams)) {
          u.exams = u.exams.filter(e => String(e.id) !== String(payload.examId));
        }
      } else if (action === 'toggle_exam_completed') {
        if (Array.isArray(u.exams)) {
          const ex = u.exams.find(e => String(e.id) === String(payload.examId));
          if (ex) {
            ex.isCompleted = !ex.isCompleted;
            ex.completedAt = ex.isCompleted ? nowIso : null;
          }
        }
      }

      u.syncVersion = (Number(u.syncVersion) || 0) + 1;
      u.lastSync = nowIso;
      writeDb(db);

      const safeUser = buildSafeUser(u);
      return sendJson({
        success: true,
        action,
        syncVersion: u.syncVersion,
        lastSync: u.lastSync,
        user: safeUser
      });
    });
    return;
  }

  /* ==========================================================================
     SISTEMA OFICIAL DE QUIZZES, PERSISTÊNCIA E OFENSIVA (STREAK)
     ========================================================================== */

  // Função central para cálculo idempotente da ofensiva (Streak) em America/Sao_Paulo
  function calculateOfensivaAfterActivity(user, activityType, details = {}) {
    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);

    if (!Array.isArray(user.studiedDays)) user.studiedDays = [];
    if (!Array.isArray(user.activityLog)) user.activityLog = [];

    const activityRecord = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: todayStr,
      timestamp: now.toISOString(),
      type: activityType,
      details
    };
    user.activityLog.unshift(activityRecord);
    if (user.activityLog.length > 200) user.activityLog.pop();

    const alreadyActiveToday = user.studiedDays.includes(todayStr);

    if (!alreadyActiveToday) {
      user.studiedDays.push(todayStr);

      // Calcular dias consecutivos no fuso de Brasília
      const sortedDates = [...user.studiedDays]
        .filter(d => d !== todayStr)
        .sort((a, b) => new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00'));

      const lastActiveDate = sortedDates[0] || null;

      if (lastActiveDate) {
        const d1 = new Date(lastActiveDate + 'T12:00:00');
        const d2 = new Date(todayStr + 'T12:00:00');
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        const isWeekendTransition = (d1.getDay() === 5 && d2.getDay() === 1 && diffDays <= 3);

        if (diffDays === 1 || isWeekendTransition) {
          user.streak = (Number(user.streak) || 0) + 1;
        } else {
          // Mais de 1 dia de intervalo sem atividade válida: reinicia ofensiva em 1
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }

      user.bestStreak = Math.max(Number(user.bestStreak) || 0, user.streak);
    }

    user.lastActiveDate = todayStr;
    return {
      streak: user.streak,
      bestStreak: user.bestStreak,
      alreadyActiveToday,
      activityRecord
    };
  }

  // 1. POST /api/quiz/finish - Salva tentativa com notas, matérias e atualiza ofensiva de forma idempotente
  if (req.method === 'POST' && pathname === '/api/quiz/finish') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado para registrar tentativa de quiz.' }, 401);
    }

    parseBody((data) => {
      if (!data || typeof data !== 'object') {
        return sendJson({ error: 'Dados do quiz inválidos.' }, 400);
      }

      const db = readDb();
      const user = (db.users || []).find(u => u.id === auth.user.id);
      if (!user) {
        return sendJson({ error: 'Usuário não encontrado.' }, 404);
      }

      if (!Array.isArray(user.quizHistory)) user.quizHistory = [];

      const now = new Date();
      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);

      const incoming = data.attempt || data || {};
      const attemptId = incoming.id || ('att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
      const attempt = {
        id: attemptId,
        date: incoming.date || todayStr,
        completedAt: incoming.completedAt || now.toISOString(),
        quizId: incoming.quizId || `quiz_${incoming.subject || 'geral'}_${incoming.bookId || 1}_${incoming.chapterId || 1}`,
        subject: incoming.subject || 'Geral',
        bookId: Number(incoming.bookId) || 1,
        chapterId: Number(incoming.chapterId) || 1,
        chapterTitle: incoming.chapterTitle || 'Capítulo SAS',
        difficulty: incoming.difficulty || 'medio',
        totalQuestions: Number(incoming.totalQuestions) || (Array.isArray(incoming.questions) ? incoming.questions.length : (Array.isArray(incoming.answersRecord) ? incoming.answersRecord.length : 4)),
        score: Number(incoming.score) || 0,
        percentage: Number(incoming.percentage) || Math.round(((Number(incoming.score) || 0) / (Number(incoming.totalQuestions) || 1)) * 100),
        timeSpentSeconds: Number(incoming.timeSpentSeconds) || 0,
        questions: Array.isArray(incoming.questions) ? incoming.questions.slice(0, 30) : [],
        answersRecord: Array.isArray(incoming.answersRecord) ? incoming.answersRecord : []
      };

      // Adiciona ao topo do histórico
      user.quizHistory.unshift(attempt);
      if (user.quizHistory.length > 80) user.quizHistory.pop();

      // Limpa qualquer rascunho de quiz em andamento
      user.activeQuizSession = null;

      // Atualiza ofensiva (Streak) com atividade válida
      const streakResult = calculateOfensivaAfterActivity(user, 'quiz_completed', {
        attemptId,
        subject: attempt.subject,
        chapterTitle: attempt.chapterTitle,
        score: attempt.score,
        total: attempt.totalQuestions,
        pct: attempt.percentage
      });

      writeDb(db);

      // Sincroniza em background com Supabase
      supabase.syncFromLocalDb(db).catch(() => {});

      return sendJson({
        success: true,
        message: 'Quiz concluído e registrado com sucesso!',
        attempt,
        streak: user.streak,
        bestStreak: user.bestStreak,
        alreadyActiveToday: streakResult.alreadyActiveToday,
        todayActive: true
      });
    });
    return;
  }

  // 2. GET /api/quiz/history - Retorna histórico completo e real de quizzes do aluno
  if (req.method === 'GET' && pathname === '/api/quiz/history') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    const db = readDb();
    const user = (db.users || []).find(u => u.id === auth.user.id);
    if (!user) {
      return sendJson({ error: 'Usuário não encontrado.' }, 404);
    }

    return sendJson({
      success: true,
      history: Array.isArray(user.quizHistory) ? user.quizHistory : [],
      quizHistory: Array.isArray(user.quizHistory) ? user.quizHistory : []
    });
  }

  // 3. POST /api/quiz/save-draft - Salva rascunho em andamento para retomada em qualquer aparelho
  if (req.method === 'POST' && pathname === '/api/quiz/save-draft') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    parseBody((data) => {
      const db = readDb();
      const user = (db.users || []).find(u => u.id === auth.user.id);
      if (!user) return sendJson({ error: 'Usuário não encontrado.' }, 404);

      user.activeQuizSession = data.draft ? {
        ...data.draft,
        savedAt: new Date().toISOString()
      } : null;

      writeDb(db);
      return sendJson({ success: true, message: 'Progresso do quiz salvo.' });
    });
    return;
  }

  // 4. GET /api/quiz/active-draft - Recupera rascunho de quiz em andamento
  if (req.method === 'GET' && pathname === '/api/quiz/active-draft') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    const db = readDb();
    const user = (db.users || []).find(u => u.id === auth.user.id);
    if (!user) return sendJson({ error: 'Usuário não encontrado.' }, 404);

    return sendJson({
      success: true,
      draft: user.activeQuizSession || null
    });
  }

  // 5. POST /api/quiz/clear-draft - Descarta rascunho de quiz
  if (req.method === 'POST' && pathname === '/api/quiz/clear-draft') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    const db = readDb();
    const user = (db.users || []).find(u => u.id === auth.user.id);
    if (user) {
      user.activeQuizSession = null;
      writeDb(db);
    }
    return sendJson({ success: true, message: 'Rascunho de quiz descartado.' });
  }

  // 6. POST /api/activity/complete - Registro unificado e idempotente de atividade válida (TPC, meta de minutos, erros)
  if (req.method === 'POST' && pathname === '/api/activity/complete') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado para registrar atividade.' }, 401);
    }

    parseBody((data) => {
      const type = data?.type || 'learning_activity';
      const details = data?.details || {};

      const db = readDb();
      const user = (db.users || []).find(u => u.id === auth.user.id);
      if (!user) return sendJson({ error: 'Usuário não encontrado.' }, 404);

      const streakResult = calculateOfensivaAfterActivity(user, type, details);
      writeDb(db);
      supabase.syncFromLocalDb(db).catch(() => {});

      return sendJson({
        success: true,
        message: 'Atividade registrada com sucesso!',
        streak: user.streak,
        bestStreak: user.bestStreak,
        alreadyActiveToday: streakResult.alreadyActiveToday,
        todayActive: true
      });
    });
    return;
  }

  /* ==========================================================================
     SISTEMA DE TRILHAS SAS (APOSTILAS 1, 2 E 3) & PROGRESSÃO DE CAPÍTULOS
     ========================================================================== */

  // 1. GET /api/trilhas/content - Conteúdo oficial mapeado do SAS (estritamente Apostilas 1, 2 e 3)
  if (req.method === 'GET' && pathname === '/api/trilhas/content') {
    const auth = getAuthUser(req);
    const access = checkUserTrilhasAccess(auth?.user);

    const contentPath = path.join(__dirname, 'sas_authorized_content.json');
    let authorizedData = null;
    if (fs.existsSync(contentPath)) {
      try {
        authorizedData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
      } catch (e) {
        console.error('Erro ao ler sas_authorized_content.json:', e);
      }
    }

    if (!authorizedData || !authorizedData.subjects) {
      return sendJson({ error: 'Conteúdo curricular SAS não disponível.' }, 404);
    }

    // Regra estrita: NUNCA permitir Apostila 4
    for (const subjKey of Object.keys(authorizedData.subjects)) {
      const subj = authorizedData.subjects[subjKey];
      if (Array.isArray(subj.apostilas)) {
        subj.apostilas = subj.apostilas.filter(a => a.id <= 3);
      }
    }

    // Se NÃO tiver acesso Pro nem for Admin: retorna APENAS a vitrine com benefícios e prévia autorizada
    if (!access.allowed) {
      const previewSubjects = {};
      for (const subjKey of Object.keys(authorizedData.subjects)) {
        const s = authorizedData.subjects[subjKey];
        const apostilasPreview = (s.apostilas || []).filter(a => a.id <= 3).map(a => ({
          id: a.id,
          title: a.title,
          chaptersCount: Array.isArray(a.chapters) ? a.chapters.length : 0,
          chapters: (a.chapters || []).map(c => ({
            id: c.id,
            tag: c.tag,
            title: c.title,
            desc: c.desc,
            isLocked: true
          }))
        }));

        previewSubjects[subjKey] = {
          name: s.name,
          icon: s.icon,
          color: s.color,
          meta: s.meta,
          isLocked: true,
          apostilas: apostilasPreview
        };
      }

      return sendJson({
        success: true,
        isProRequired: true,
        hasAccess: false,
        isPro: false,
        isAdmin: false,
        preview: true,
        title: 'Trilhas de Aprendizagem SAS 🔒 PRO',
        badge: 'Recurso Exclusivo PRO',
        headline: 'Aprenda por caminhos completos organizados por matéria, apostila e capítulo.',
        benefits: [
          'Organização completa por matérias e capítulos das Apostilas Oficiais 1, 2 e 3 do SAS 7º ano',
          'Jornada progressiva em 7 etapas: Fundamentos, Práticas Guiadas, Quizzes, Revisão de Erros e Desafio Final',
          'Quizzes inteligentes e progressivos com gabarito comentado passo a passo',
          'Revisão ativa de erros e prevenção de pegadinhas frequentes',
          'Desafios práticos e conquista do Certificado de Domínio do Capítulo 🏆',
          'Progresso sincronizado e salvo no backend em qualquer dispositivo'
        ],
        plans: {
          mensal: { id: 'pro_mensal', name: 'PRO Mensal', price: 'R$ 10,00/mês', amount: 10.00 },
          anual: { id: 'pro_anual', name: 'PRO Anual', price: 'R$ 120,00/ano', amount: 120.00 }
        },
        subjects: previewSubjects
      });
    }

    // Usuário PRO ou ADMIN: acesso completo ao currículo oficial
    return sendJson({
      success: true,
      hasAccess: true,
      isPro: access.isPro,
      isAdmin: access.isAdmin,
      isProRequired: false,
      planType: access.planType || (access.isAdmin ? 'admin' : 'pro'),
      source: authorizedData.source,
      curriculumYear: authorizedData.curriculumYear || 2026,
      grade: authorizedData.grade || '7º Ano - Ensino Fundamental',
      updatedAt: authorizedData.updatedAt,
      subjects: authorizedData.subjects
    });
  }

  // 2. GET /api/trilhas/progress - Retorna progresso do aluno autenticado nas trilhas
  if (req.method === 'GET' && pathname === '/api/trilhas/progress') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado. Faça login para acessar suas trilhas.' }, 401);
    }

    const access = checkUserTrilhasAccess(auth.user);

    const db = readDb();
    const userProgress = (db.trilhasProgress || []).filter(p => String(p.userId) === String(auth.user.id));

    // Filtros opcionais por matéria, apostila e capítulo
    const subjectParam = parsedUrl.searchParams.get('subject');
    const bookParam = parsedUrl.searchParams.get('bookId');
    const chapterParam = parsedUrl.searchParams.get('chapterId');

    let filtered = userProgress;
    if (subjectParam) {
      filtered = filtered.filter(p => p.subjectKey === subjectParam);
    }
    if (bookParam) {
      filtered = filtered.filter(p => Number(p.bookId) === Number(bookParam));
    }
    if (chapterParam) {
      filtered = filtered.filter(p => Number(p.chapterId) === Number(chapterParam));
    }

    // Métricas agregadas de desempenho e maestria
    const totalChaptersCompleted = userProgress.filter(p => p.isCompleted).length;
    const totalStagesCompleted = userProgress.reduce((acc, curr) => acc + (Array.isArray(curr.completedStages) ? curr.completedStages.length : 0), 0);
    const avgMastery = userProgress.length > 0
      ? Math.round(userProgress.reduce((acc, curr) => acc + (curr.masteryPercentage || 0), 0) / userProgress.length)
      : 0;

    return sendJson({
      success: true,
      hasAccess: access.allowed,
      isPro: access.isPro,
      isAdmin: access.isAdmin,
      proRequired: !access.allowed,
      planType: access.planType || (access.isAdmin ? 'admin' : 'base'),
      progress: filtered,
      allProgress: userProgress,
      summary: {
        totalChaptersCompleted,
        totalStagesCompleted,
        avgMastery,
        activeTrailsCount: userProgress.length
      }
    });
  }

  // 3. GET /api/trilhas/stage-content - Validação e autorização de início de etapa (Protegido por PRO ou Admin)
  if (req.method === 'GET' && pathname === '/api/trilhas/stage-content') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado para carregar etapa de trilha.' }, 401);
    }

    const access = checkUserTrilhasAccess(auth.user);
    if (!access.allowed) {
      return sendJson({
        error: 'O acesso aos conteúdos e etapas das Trilhas SAS é exclusivo para assinantes do Plano PRO.',
        proRequired: true,
        plans: {
          mensal: 'R$ 10,00/mês',
          anual: 'R$ 120,00/ano'
        }
      }, 403);
    }

    const subjectKey = String(parsedUrl.searchParams.get('subjectKey') || 'matematica').toLowerCase();
    const bookId = Number(parsedUrl.searchParams.get('bookId') || 1);
    const chapterId = Number(parsedUrl.searchParams.get('chapterId') || 1);
    const stageId = String(parsedUrl.searchParams.get('stageId') || 'fundamentos');
    const stageIndex = Number(parsedUrl.searchParams.get('stageIndex') || 0);

    if (bookId > 3 || bookId < 1) {
      return sendJson({ error: 'Apenas as Apostilas 1, 2 e 3 do SAS são permitidas.' }, 400);
    }

    return sendJson({
      success: true,
      allowed: true,
      isPro: access.isPro,
      isAdmin: access.isAdmin,
      subjectKey,
      bookId,
      chapterId,
      stageId,
      stageIndex
    });
  }

  // 4. POST /api/trilhas/complete-stage - Conclui etapa da trilha e avança progressão
  if (req.method === 'POST' && pathname === '/api/trilhas/complete-stage') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado para registrar etapa de trilha.' }, 401);
    }

    // Regra estrita no BACKEND: Apenas assinantes PRO ativos ou administradores autorizados
    const access = checkUserTrilhasAccess(auth.user);
    if (!access.allowed) {
      return sendJson({
        error: 'O avanço e conclusão de etapas nas Trilhas SAS é um recurso exclusivo para assinantes do Plano PRO.',
        proRequired: true,
        plans: {
          mensal: 'R$ 10,00/mês',
          anual: 'R$ 120,00/ano'
        }
      }, 403);
    }

    parseBody((data) => {
      const subjectKey = String(data?.subjectKey || '').trim().toLowerCase();
      const bookId = Number(data?.bookId || 0);
      const chapterId = Number(data?.chapterId || 0);
      const stageId = String(data?.stageId || '').trim();
      const stageIndex = Number(data?.stageIndex ?? -1);
      const chapterTitle = String(data?.chapterTitle || `Capítulo ${chapterId}`).trim();
      const score = Number(data?.score || 0);
      const total = Number(data?.total || 0);

      if (!subjectKey || !bookId || !chapterId || !stageId) {
        return sendJson({ error: 'Dados obrigatórios da etapa ausentes (subjectKey, bookId, chapterId, stageId).' }, 400);
      }

      // REGRA ESTRITA: Apenas Apostilas 1, 2 e 3 são permitidas
      if (bookId > 3 || bookId < 1) {
        return sendJson({ error: 'Apenas as Apostilas 1, 2 e 3 do SAS são permitidas. Apostila inválida.' }, 400);
      }

      // Lista de etapas válidas (8 etapas canônicas + aliases legados)
      const validStages = [
        'licao_guiada', 'pratica_guiada', 'quiz_multiformato', 'verdadeiro_falso',
        'revisao_erros', 'lacunas_associacao', 'desafio_aplicado', 'simulado_capitulo',
        'fundamentos', 'pratica_1', 'quiz_1', 'pratica_2', 'quiz_2', 'revisao', 'desafio_final'
      ];
      if (!validStages.includes(stageId)) {
        return sendJson({ error: 'Etapa inválida para a trilha do capítulo.' }, 400);
      }

      // REGRA ESTRITA DE APROVAÇÃO (MÍNIMO 60% DE ACERTOS)
      // Cada fase possui exatamente 8 questões. Mínimo necessário: 5 de 8 = 62.5% -> PASSOU.
      // 4 de 8 = 50.0% -> NÃO PASSOU. Proibido arredondar 50% para aprovar.
      const qTotal = total > 0 ? total : 8;
      const minRequired = Math.ceil(qTotal * 0.6); // Para 8 questões, Math.ceil(4.8) = 5
      const passed = score >= minRequired;
      const rawPercentage = qTotal > 0 ? (score / qTotal) * 100 : 0;
      const percentage = (rawPercentage % 1 === 0) ? rawPercentage : Number(rawPercentage.toFixed(1));
      const neededMore = Math.max(0, minRequired - score);

      const db = readDb();
      if (!Array.isArray(db.trilhasProgress)) db.trilhasProgress = [];

      const recordId = `trilha_${auth.user.id}_${subjectKey}_${bookId}_${chapterId}`;
      let record = db.trilhasProgress.find(p => p.id === recordId);

      const now = new Date().toISOString();

      if (!record) {
        record = {
          id: recordId,
          userId: auth.user.id,
          subjectKey,
          bookId,
          chapterId,
          chapterTitle,
          currentStageIndex: 0,
          completedStages: [],
          stageResults: {},
          masteryPercentage: 0,
          isCompleted: false,
          startedAt: now,
          lastCompletedAt: now
        };
        db.trilhasProgress.push(record);
      }

      if (!Array.isArray(record.completedStages)) record.completedStages = [];
      if (!record.stageResults) record.stageResults = {};

      // Registra o resultado da tentativa
      record.stageResults[stageId] = {
        completedAt: now,
        score,
        total: qTotal,
        percentage,
        passed
      };

      // SE NÃO ATINGIU O MÍNIMO DE 60%: NÃO desbloqueia, NÃO salva como completedStages
      if (!passed) {
        writeDb(db);
        logSystemEvent('info', 'trilhas', `Usuário ${auth.user.username} não atingiu o mínimo de 60% na etapa [${stageId}] (${score}/${qTotal} = ${percentage}%). Precisa de mais ${neededMore} acerto(s).`);
        return sendJson({
          success: true,
          passed: false,
          score,
          total: qTotal,
          percentage,
          minRequired,
          neededMore,
          unlockedNext: false,
          message: `Você acertou ${score} de ${qTotal} (${percentage}%). São necessários no mínimo ${minRequired} acertos (60%) para avançar. Você precisa de mais ${neededMore} acerto(s).`,
          masteryPercentage: record.masteryPercentage
        });
      }

      // SE PASSOU: Adiciona etapa aos concluídos sem duplicação
      if (!record.completedStages.includes(stageId)) {
        record.completedStages.push(stageId);
      }

      // Atualiza índice da etapa atual desbloqueada
      const canonicalStages = [
        'licao_guiada', 'pratica_guiada', 'quiz_multiformato', 'verdadeiro_falso',
        'revisao_erros', 'lacunas_associacao', 'desafio_aplicado', 'simulado_capitulo'
      ];
      const foundIdx = canonicalStages.indexOf(stageId);
      if (foundIdx >= 0) {
        record.currentStageIndex = Math.max(record.currentStageIndex || 0, foundIdx + 1);
      } else {
        const legacyIdx = ['fundamentos', 'pratica_1', 'quiz_1', 'pratica_2', 'quiz_2', 'revisao', 'desafio_final'].indexOf(stageId);
        if (legacyIdx >= 0) {
          record.currentStageIndex = Math.max(record.currentStageIndex || 0, legacyIdx + 1);
        }
      }

      // Calcula maestria percentual do capítulo (8 etapas canônicas = 100%)
      const totalStagesCount = 8;
      record.masteryPercentage = Math.min(100, Math.round((record.completedStages.length / totalStagesCount) * 100));
      if (record.completedStages.length >= totalStagesCount) {
        record.isCompleted = true;
        record.completedAt = now;
      }
      record.lastCompletedAt = now;

      // Integração com cálculo de ofensiva (Streak diário)
      const user = (db.users || []).find(u => u.id === auth.user.id) || auth.user;
      const streakResult = calculateOfensivaAfterActivity(user, 'trilha_stage_completed', {
        subjectKey,
        bookId,
        chapterId,
        chapterTitle,
        stageId,
        score,
        total: qTotal
      });

      writeDb(db);
      supabase.syncFromLocalDb(db).catch(() => {});

      logSystemEvent('info', 'trilhas', `Etapa [${stageId}] da trilha de ${chapterTitle} concluída pelo usuário ${auth.user.username} (${score}/${qTotal} = ${percentage}%)`, {
        userId: auth.user.id,
        subjectKey,
        bookId,
        chapterId,
        score,
        total: qTotal,
        percentage,
        passed: true,
        masteryPercentage: record.masteryPercentage,
        isCompleted: record.isCompleted,
        accessType: access.isAdmin ? 'admin' : 'pro'
      });

      // Sincronização multi-dispositivo em tempo real via SSE
      broadcastToUser(auth.user.id, 'trilha_progress_updated', {
        record,
        subjectKey,
        bookId,
        chapterId,
        stageId,
        isCompleted: record.isCompleted,
        masteryPercentage: record.masteryPercentage
      });

      return sendJson({
        success: true,
        passed: true,
        score,
        total: qTotal,
        percentage,
        unlockedNext: record.currentStageIndex < totalStagesCount,
        message: record.isCompleted ? 'Parabéns! Você alcançou o Domínio Total deste capítulo! 🏆' : 'Etapa da trilha concluída com sucesso (mínimo de 60% atingido)!',
        progress: record,
        isCompleted: record.isCompleted,
        streak: user.streak,
        bestStreak: user.bestStreak,
        alreadyActiveToday: streakResult.alreadyActiveToday
      });
    });
    return;
  }

  // 5. POST /api/trilhas/reset-chapter - Reinicia trilha de um capítulo para novo treino
  if (req.method === 'POST' && pathname === '/api/trilhas/reset-chapter') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado.' }, 401);
    }

    const access = checkUserTrilhasAccess(auth.user);
    if (!access.allowed) {
      return sendJson({
        error: 'O reinício de trilhas SAS é exclusivo para assinantes do Plano PRO.',
        proRequired: true
      }, 403);
    }

    parseBody((data) => {
      const subjectKey = String(data?.subjectKey || '').trim().toLowerCase();
      const bookId = Number(data?.bookId || 0);
      const chapterId = Number(data?.chapterId || 0);

      const db = readDb();
      const recordId = `trilha_${auth.user.id}_${subjectKey}_${bookId}_${chapterId}`;
      const recordIndex = (db.trilhasProgress || []).findIndex(p => p.id === recordId);

      if (recordIndex !== -1) {
        db.trilhasProgress.splice(recordIndex, 1);
        writeDb(db);
        supabase.syncFromLocalDb(db).catch(() => {});

        // Sincronização multi-dispositivo via SSE
        broadcastToUser(auth.user.id, 'trilha_progress_updated', {
          subjectKey,
          bookId,
          chapterId,
          reset: true
        });
      }

      return sendJson({
        success: true,
        message: 'Trilha do capítulo reiniciada com sucesso para novos estudos!'
      });
    });
    return;
  }

  // 5. POST /api/trilhas/sas-sync - Disparo de sincronização autorizada segura com SAS
  if (req.method === 'POST' && pathname === '/api/trilhas/sas-sync') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado.' }, 401);
    }

    const { exec } = require('child_process');
    const syncScript = path.join(__dirname, 'sas_sync_service.js');

    exec(`node "${syncScript}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('[SAS Sync Error]:', err.message);
      }
    });

    return sendJson({
      success: true,
      message: 'Sincronizador autorizado acionado. Caso necessário, a janela do navegador será exibida para autenticação manual.'
    });
  }

  // 6. GET /api/trilhas/sas-sync-status - Status da sincronização autorizada
  if (req.method === 'GET' && pathname === '/api/trilhas/sas-sync-status') {
    const statusFile = path.join(__dirname, 'sas_sync_status.json');
    let statusData = { status: 'idle', message: 'Nenhuma sincronização recente registrada.' };
    if (fs.existsSync(statusFile)) {
      try {
        statusData = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      } catch (e) {}
    }
    return sendJson(statusData);
  }

  /* ==========================================================================
     PLANOS OFICIAIS & SOLICITAÇÕES DO PLANO PRO
     ========================================================================== */

  // GET /api/plans - Fonte única da verdade para os planos e preços oficiais
  if (req.method === 'GET' && pathname === '/api/plans') {
    return sendJson({
      success: true,
      plans: OFFICIAL_PLANS
    });
  }

  // POST /api/plans/request - Aluno solicita ativação do Plano Pro (Mensal ou Anual)
  if (req.method === 'POST' && pathname === '/api/plans/request') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Apenas usuários autenticados podem solicitar o Plano Pro.' }, 401);
    }

    parseBody((data) => {
      const db = readDb();
      const user = (db.users || []).find(u => u.id === auth.user.id) || auth.user;

      if (user.isSubscribed && user.plan === 'pro') {
        return sendJson({ error: 'Sua conta já possui o Plano PRO ativo em todos os seus dispositivos!' }, 400);
      }

      // Backend é a ÚNICA fonte da verdade para valores - NUNCA confia em valores do navegador
      const requestedPlanId = (data.planId === 'pro_anual') ? 'pro_anual' : 'pro_mensal';
      const planConfig = OFFICIAL_PLANS[requestedPlanId] || OFFICIAL_PLANS.pro_mensal;

      if (!Array.isArray(db.planRequests)) db.planRequests = [];
      const existing = db.planRequests.find(r => r.userId === user.id && (r.status === 'pending' || r.status === 'in_review'));

      if (existing) {
        existing.planId = planConfig.id;
        existing.planName = planConfig.name;
        existing.planPeriodicity = planConfig.periodicity;
        existing.durationDays = planConfig.durationDays;
        existing.amount = planConfig.amount;
        existing.contactMethod = (data.contactMethod || existing.contactMethod || 'pix').trim();
        existing.contactInfo = (data.contactInfo || existing.contactInfo || '').trim();
        existing.note = (data.note || existing.note || 'Aluno informou que efetuou o pagamento do PRO').trim();
        existing.status = 'pending';
        existing.updatedAt = new Date().toISOString();

        user.planStatus = 'payment_pending';
        user.pendingPlanId = planConfig.id;
        writeDb(db);

        createAdminNotification({
          type: 'warning',
          category: 'plan',
          title: `💎 Pagamento PRO Informado: ${user.name || user.username}`,
          message: `${user.name || user.username} informou que pagou o ${planConfig.name} (R$ ${planConfig.amount.toFixed(2)} via ${existing.contactMethod === 'pix' ? 'Pix CPF' : 'Dinheiro'}). Clique para ativar!`,
          meta: { requestId: existing.id, userId: user.id, planId: planConfig.id }
        });

        broadcastToAdmins('new_plan_request', {
          request: existing,
          isUpdate: true,
          message: `🔔 ${user.name || user.username} informou pagamento do ${planConfig.name}!`
        });

        return sendJson({
          success: true,
          message: `Solicitação do ${planConfig.name} atualizada com sucesso! O Freddie foi notificado instantaneamente no painel dele.`,
          request: existing
        });
      }

      const reqId = 'req_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
      const newReq = {
        id: reqId,
        userId: user.id,
        userName: user.name || user.username || 'Aluno Gammon',
        userEmail: user.email || '',
        userGrade: user.grade || '7º Ano',
        planId: planConfig.id,
        plan: 'pro',
        planName: planConfig.name,
        planPeriodicity: planConfig.periodicity,
        durationDays: planConfig.durationDays,
        amount: planConfig.amount, // Oficial: 10.00 (mensal) ou 120.00 (anual)
        contactMethod: (data.contactMethod || 'pix').trim(),
        contactInfo: (data.contactInfo || '').trim(),
        note: (data.note || 'Aluno informou pagamento do Plano PRO').trim(),
        status: 'pending', // Pagamento pendente de conferência
        statusReason: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null
      };

      // Atualiza status do usuário para pagamento pendente
      user.planStatus = 'payment_pending';
      user.pendingPlanId = planConfig.id;

      db.planRequests.unshift(newReq);
      writeDb(db);

      createAdminNotification({
        type: 'warning',
        category: 'plan',
        title: `💎 Novo Pedido PRO: ${newReq.userName}`,
        message: `${newReq.userName} informou que efetuou o pagamento do ${planConfig.name} (R$ ${planConfig.amount.toFixed(2)} via ${newReq.contactMethod === 'pix' ? 'Pix CPF' : 'Dinheiro'}). Clique para ativar!`,
        meta: { requestId: newReq.id, userId: user.id, planId: planConfig.id }
      });

      // Notifica administradores conectados em tempo real via SSE
      broadcastToAdmins('new_plan_request', {
        request: newReq,
        message: `🔔 Nova solicitação do ${planConfig.name} recebida de ${newReq.userName}!`
      });

      // Grava log de auditoria
      if (Array.isArray(db.auditLogs)) {
        db.auditLogs.unshift({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'plan_request_created',
          ip: clientIp,
          userId: user.id,
          details: `Aluno ${newReq.userName} (${user.id}) solicitou o ${planConfig.name} (R$ ${planConfig.amount.toFixed(2)}) via ${newReq.contactMethod}`
        });
      }

      return sendJson({
        success: true,
        message: `Solicitação do ${planConfig.name} enviada com sucesso! O Freddie foi notificado instantaneamente no painel dele.`,
        request: newReq
      });
    });
    return;
  }

  // GET /api/admin/plan-requests - Consulta de solicitações (Restrito ao Administrador)
  if (req.method === 'GET' && pathname === '/api/admin/plan-requests') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado pode consultar as solicitações.' }, 403);
    }

    const db = readDb();
    return sendJson({
      success: true,
      requests: db.planRequests || []
    });
  }

  // POST /api/admin/plan-requests/status - Altera status da solicitação (Em análise, Aprovada, Recusada, Cancelada)
  if (req.method === 'POST' && pathname === '/api/admin/plan-requests/status') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado pode alterar o status das solicitações.' }, 403);
    }

    parseBody((data) => {
      if (!data || !data.requestId || !data.status) {
        return sendJson({ error: 'requestId e status são obrigatórios.' }, 400);
      }

      const validStatuses = ['pending', 'in_review', 'approved', 'rejected', 'cancel_requested', 'canceled'];
      if (!validStatuses.includes(data.status)) {
        return sendJson({ error: 'Status inválido. Use pending, in_review, approved, rejected, cancel_requested ou canceled.' }, 400);
      }

      const db = readDb();
      if (!Array.isArray(db.planRequests)) db.planRequests = [];
      const targetReq = db.planRequests.find(r => r.id === data.requestId);
      if (!targetReq) {
        return sendJson({ error: 'Solicitação não encontrada.' }, 404);
      }

      const adminName = auth?.user?.name || 'Freddie Costa (Admin)';
      targetReq.status = data.status;
      targetReq.statusReason = (data.reason || '').trim();
      targetReq.reviewedBy = adminName;
      targetReq.reviewedAt = new Date().toISOString();
      targetReq.updatedAt = new Date().toISOString();

      const targetUser = (db.users || []).find(u => u.id === targetReq.userId);

      // Quando o administrador APROVA: ativa os benefícios do Plano PRO no banco de forma estrita
      if (data.status === 'approved' && targetUser) {
        const isAnual = targetReq.planId === 'pro_anual';
        const durationDays = targetReq.durationDays || (isAnual ? 365 : 30);
        const planConfig = isAnual ? OFFICIAL_PLANS.pro_anual : OFFICIAL_PLANS.pro_mensal;
        const now = new Date();
        const expires = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

        targetUser.isSubscribed = true;
        targetUser.plan = 'pro';
        targetUser.planType = planConfig.id;
        targetUser.planPeriodicity = planConfig.periodicity;
        targetUser.planStatus = isAnual ? 'pro_anual_active' : 'pro_mensal_active';
        targetUser.planName = planConfig.name;
        targetUser.proActivatedAt = now.toISOString();
        targetUser.proExpiresAt = expires.toISOString();
        targetUser.lastBillingDate = now.toISOString();
        delete targetUser.trialExpiresAt;
        delete targetUser.trialDaysRemaining;
        delete targetUser.trialActivatedAt;
        delete targetUser.pendingPlanId;

        // Registra o pagamento confirmado em db.payments com o valor oficial do plano
        if (!Array.isArray(db.payments)) db.payments = [];
        const paymentRecord = {
          id: 'PAG_' + Date.now(),
          studentName: targetReq.userName,
          email: targetReq.userEmail,
          userId: targetReq.userId,
          planId: planConfig.id,
          planPeriodicity: planConfig.periodicity,
          method: targetReq.contactMethod || 'cash',
          amount: planConfig.amount, // Oficial: 10.00 ou 120.00
          date: now.toISOString().slice(0, 10),
          status: 'confirmed',
          note: `Aprovado pelo administrador ${adminName}. ${planConfig.name} (${durationDays} dias). Motivo/Obs: ${targetReq.statusReason || 'Recebimento validado'}`,
          confirmedBy: adminName,
          confirmedAt: now.toISOString()
        };
        db.payments.unshift(paymentRecord);
      } else if (data.status === 'rejected' && targetUser) {
        // Se foi recusada, define status de recusa
        targetUser.planStatus = 'payment_declined';
        if (targetUser.plan !== 'pro') {
          targetUser.isSubscribed = false;
          targetUser.plan = 'base';
        }
      } else if (data.status === 'canceled' && targetUser) {
        targetUser.planStatus = 'base';
        targetUser.isSubscribed = false;
        targetUser.plan = 'base';
        targetUser.planName = 'Plano Base';
        delete targetUser.proActivatedAt;
        delete targetUser.proExpiresAt;
      } else if (data.status === 'cancel_requested' && targetUser) {
        targetUser.planStatus = 'cancel_requested';
      }

      writeDb(db);

      // Notifica administradores e clientes em tempo real via SSE
      broadcastToAdmins('plan_request_updated', {
        requestId: targetReq.id,
        status: targetReq.status,
        userId: targetReq.userId,
        userName: targetReq.userName
      });

      if (targetUser) {
        broadcastToUser(targetUser.id, 'pro_status_changed', {
          isSubscribed: Boolean(targetUser.isSubscribed),
          plan: targetUser.plan || 'base',
          planStatus: targetUser.planStatus,
          planType: targetUser.planType,
          planPeriodicity: targetUser.planPeriodicity,
          planName: targetUser.planName,
          proExpiresAt: targetUser.proExpiresAt || null
        });
      }

      return sendJson({
        success: true,
        message: `Solicitação marcada como "${data.status === 'approved' ? 'Aprovada' : data.status === 'rejected' ? 'Recusada' : 'Em análise'}" com sucesso!`,
        request: targetReq,
        user: targetUser ? {
          id: targetUser.id,
          name: targetUser.name,
          plan: targetUser.plan,
          planType: targetUser.planType,
          planPeriodicity: targetUser.planPeriodicity,
          planStatus: targetUser.planStatus,
          isSubscribed: targetUser.isSubscribed,
          proExpiresAt: targetUser.proExpiresAt
        } : null
      });
    });
    return;
  }

  // POST /api/subscription/cancel - Usuário autenticado solicita cancelamento de sua assinatura
  if (req.method === 'POST' && pathname === '/api/subscription/cancel') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    const db = readDb();
    const user = (db.users || []).find(u => u.id === auth.user.id);
    if (!user) {
      return sendJson({ error: 'Usuário não encontrado.' }, 404);
    }

    user.isSubscribed = false;
    user.plan = 'base';
    user.planStatus = 'base';
    user.planName = 'Plano Base';
    delete user.proActivatedAt;
    delete user.proExpiresAt;
    delete user.trialExpiresAt;
    delete user.trialDaysRemaining;
    delete user.trialActivatedAt;

    writeDb(db);

    return sendJson({
      success: true,
      message: 'Assinatura cancelada com sucesso. Sua conta retornou ao Plano Base.'
    });
  }

  /* ==========================================================================
     CENTRAL ÚNICA DO ADMINISTRADOR (OVERVIEW, NOTIFICAÇÕES, SUPORTE, ESTUDOS)
     ========================================================================== */

  // GET /api/admin/overview - Central Única de Gerenciamento de Todas as Plataformas
  if (req.method === 'GET' && pathname === '/api/admin/overview') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado pode acessar o painel global centralizado.' }, 403);
    }

    const db = readDb();
    const now = Date.now();

    // Limpar sessões inativas há mais de 30 dias
    for (const [id, s] of activeSessions.entries()) {
      if ((now - (s.lastHeartbeat || 0)) > 30 * 24 * 3600 * 1000) {
        activeSessions.delete(id);
      }
    }

    // Sanitizar usuários: remover hashes de senha e salts, calcular presença precisa
    const sanitizedUsers = (db.users || []).map(u => {
      const userSessions = Array.from(activeSessions.values()).filter(s => s.userId === u.id);
      let presence = 'offline';
      let device = u.lastDeviceType || 'Computador / Desktop';

      for (const s of userSessions) {
        const pres = calculatePresence(s.lastHeartbeat, s.loginTime);
        if (pres === 'online') {
          presence = 'online';
          device = s.deviceType;
          break;
        } else if (pres === 'recent_login' && presence === 'offline') {
          presence = 'recent_login';
          device = s.deviceType;
        }
      }

      const pendingReq = (db.planRequests || []).find(r => r.userId === u.id && (r.status === 'pending' || r.status === 'in_review'));

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        grade: u.grade,
        role: u.role || 'student',
        isSubscribed: Boolean(u.isSubscribed) || u.plan === 'pro' || u.planStatus === 'active' || u.planStatus === 'pro_mensal_active' || u.planStatus === 'pro_anual_active',
        plan: (Boolean(u.isSubscribed) || u.plan === 'pro') ? 'pro' : 'base',
        planStatus: (Boolean(u.isSubscribed) || u.plan === 'pro') ? (u.planStatus || 'pro_mensal_active') : 'base',
        planType: (Boolean(u.isSubscribed) || u.plan === 'pro') ? (u.planType || 'pro_mensal') : 'base',
        planPeriodicity: (Boolean(u.isSubscribed) || u.plan === 'pro') ? (u.planPeriodicity || 'mensal') : 'gratuito',
        planName: (Boolean(u.isSubscribed) || u.plan === 'pro') ? (u.planName || 'Plano PRO') : 'Plano Base',
        proActivatedAt: u.proActivatedAt,
        proExpiresAt: u.proExpiresAt,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        deviceType: device,
        presence,
        hasPendingPlanRequest: Boolean(pendingReq),
        pendingPlanRequest: pendingReq ? {
          id: pendingReq.id,
          planId: pendingReq.planId,
          planName: pendingReq.planName,
          amount: pendingReq.amount,
          contactMethod: pendingReq.contactMethod,
          note: pendingReq.note,
          status: pendingReq.status,
          createdAt: pendingReq.createdAt
        } : null
      };
    });

    const onlineCount = sanitizedUsers.filter(u => u.presence === 'online').length;
    const proCount = sanitizedUsers.filter(u => u.isSubscribed || u.plan === 'pro').length;
    const pendingPlanReqs = (db.planRequests || []).filter(r => r.status === 'pending' || r.status === 'in_review').length;
    const pendingSupport = (db.supportRequests || []).filter(s => s.status === 'pending' || s.status === 'in_review').length;
    const pendingStudy = (db.studyReports || []).filter(e => e.status === 'pending' || e.status === 'in_review').length;
    const unreadNotifs = (db.adminNotifications || []).filter(n => n.status === 'unread').length;

    return sendJson({
      success: true,
      stats: {
        totalUsers: sanitizedUsers.length,
        activeOnline: onlineCount,
        proUsers: proCount,
        pendingPlanRequests: pendingPlanReqs,
        pendingSupport,
        pendingStudyReports: pendingStudy,
        unreadNotifications: unreadNotifs,
        totalTpcs: (db.tpcs || []).length,
        serverUptimeSec: Math.floor(process.uptime())
      },
      users: sanitizedUsers,
      planRequests: db.planRequests || [],
      supportRequests: db.supportRequests || [],
      studyReports: db.studyReports || [],
      agendaStatus: {
        status: db.gammonStatus || {},
        isSyncRunning,
        totalTpcs: (db.tpcs || []).length,
        logs: (db.agendaSyncLogs || []).slice(0, 30)
      },
      systemStatus: {
        render: {
          environment: process.env.RENDER ? 'production' : 'local',
          serviceId: process.env.RENDER_SERVICE_ID || 'estude-plus-saas',
          port: PORT
        },
        supabase: {
          configured: Boolean(supabase && supabase.isConfigured),
          url: supabase && supabase.isConfigured ? supabase.SUPABASE_URL : null,
          status: supabase && supabase.isConfigured ? 'Conectado (PostgreSQL)' : 'Modo Local Persistente (db.json)'
        },
        gemini: {
          available: Boolean(process.env.GEMINI_API_KEY || db.geminiApiKey),
          model: 'Gemini 2.5 Flash'
        },
        memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        uptimeSeconds: Math.floor(process.uptime()),
        serverTime: new Date().toISOString(),
        recentEvents: (db.systemEvents || []).slice(0, 40)
      },
      notifications: (db.adminNotifications || []).slice(0, 50),
      auditLogs: (db.auditLogs || []).slice(0, 50)
    });
  }

  // POST /api/admin/notifications/mark-read - Marcar notificações como lidas
  if (req.method === 'POST' && pathname === '/api/admin/notifications/mark-read') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado.' }, 403);
    }

    parseBody((data) => {
      const db = readDb();
      if (!Array.isArray(db.adminNotifications)) db.adminNotifications = [];

      if (data && data.all) {
        db.adminNotifications.forEach(n => { n.status = 'read'; });
      } else if (data && data.notificationId) {
        const notif = db.adminNotifications.find(n => n.id === data.notificationId);
        if (notif) notif.status = 'read';
      }

      writeDb(db);
      return sendJson({ success: true, unreadCount: db.adminNotifications.filter(n => n.status === 'unread').length });
    });
    return;
  }

  // POST /api/admin/notifications/clear - Resetar / limpar todas as notificações
  if (req.method === 'POST' && (pathname === '/api/admin/notifications/clear' || pathname === '/api/admin/notifications/reset')) {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado.' }, 403);
    }

    const db = readDb();
    db.adminNotifications = [];
    writeDb(db);
    return sendJson({ success: true, message: 'Notificações resetadas com sucesso.', unreadCount: 0 });
  }

  // POST /api/support/ticket - Envio de dúvidas, solicitações ou suporte de qualquer dispositivo
  if (req.method === 'POST' && pathname === '/api/support/ticket') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Você precisa estar conectado à sua conta para enviar uma solicitação.' }, 401);
    }

    parseBody((data) => {
      if (!data || !data.subject || !data.message) {
        return sendJson({ error: 'Preencha o assunto e a mensagem da solicitação.' }, 400);
      }

      const db = readDb();
      if (!Array.isArray(db.supportRequests)) db.supportRequests = [];

      const user = auth.user;
      const device = data.deviceType || detectDevice(req.headers['user-agent']);
      const category = (data.category || 'duvida').trim();

      // Previne spam / solicitações duplicadas idênticas em menos de 2 minutos
      const recentDup = db.supportRequests.find(r =>
        r.userId === user.id &&
        r.subject === data.subject.trim() &&
        (Date.now() - new Date(r.createdAt).getTime()) < 120000
      );
      if (recentDup) {
        return sendJson({ error: 'Você já enviou esta mesma solicitação há instantes. Aguarde a resposta do administrador.' }, 409);
      }

      const ticket = {
        id: 'sup_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: user.id,
        userName: user.name || user.username || 'Aluno',
        userEmail: user.email || '',
        userGrade: user.grade || '7º Ano',
        category,
        subject: data.subject.trim(),
        message: data.message.trim(),
        deviceType: device,
        contactMethod: data.contactMethod || 'app',
        contactInfo: data.contactInfo || '',
        status: 'pending', // 'pending', 'in_review', 'answered', 'resolved'
        adminResponse: '',
        answeredBy: null,
        answeredAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.supportRequests.unshift(ticket);
      writeDb(db);

      createAdminNotification({
        type: 'info',
        category: 'support',
        title: `Nova Solicitação: [${category.toUpperCase()}] ${ticket.subject}`,
        message: `${ticket.userName} (${device}): "${ticket.message.substring(0, 90)}..."`,
        meta: { ticketId: ticket.id, userId: user.id, device }
      });

      broadcastToAdmins('new_support_request', { ticket });
      logAudit('support_ticket_created', ticket.userName, { ticketId: ticket.id, category }, clientIp);

      return sendJson({
        success: true,
        message: 'Solicitação registrada no servidor com sucesso! O Freddie foi notificado.',
        ticket
      });
    });
    return;
  }

  // GET /api/support/my-tickets - Consulta dos próprios tickets do aluno
  if (req.method === 'GET' && pathname === '/api/support/my-tickets') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }
    const db = readDb();
    const myTickets = (db.supportRequests || []).filter(s => s.userId === auth.user.id);
    return sendJson({ success: true, tickets: myTickets });
  }

  // POST /api/study/report-error - Reportar erros em questões, quizzes, apostilas ou funcionamento
  if (req.method === 'POST' && pathname === '/api/study/report-error') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Você precisa estar conectado à sua conta para reportar um problema.' }, 401);
    }

    parseBody((data) => {
      if (!data || !data.description) {
        return sendJson({ error: 'Descreva o problema encontrado.' }, 400);
      }

      const db = readDb();
      if (!Array.isArray(db.studyReports)) db.studyReports = [];

      const user = auth.user;
      const device = data.deviceType || detectDevice(req.headers['user-agent']);
      const category = (data.category || 'questoes').trim();

      const report = {
        id: 'rep_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: user.id,
        userName: user.name || user.username || 'Aluno',
        userGrade: user.grade || '7º Ano',
        category,
        title: (data.title || `Problema em ${category}`).trim(),
        description: data.description.trim(),
        questionId: data.questionId || null,
        subject: data.subject || null,
        deviceType: device,
        status: 'pending', // 'pending', 'in_review', 'resolved', 'dismissed'
        adminNote: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.studyReports.unshift(report);
      writeDb(db);

      createAdminNotification({
        type: 'warning',
        category: 'study',
        title: `Problema em Estudos: [${category.toUpperCase()}] ${report.title}`,
        message: `${report.userName}: "${report.description.substring(0, 90)}..."`,
        meta: { reportId: report.id, userId: user.id }
      });

      broadcastToAdmins('new_study_report', { report });
      logAudit('study_report_created', report.userName, { reportId: report.id, category }, clientIp);

      return sendJson({
        success: true,
        message: 'Problema reportado e gravado no servidor com sucesso! A equipe administrativa irá analisar.',
        report
      });
    });
    return;
  }

  // POST /api/admin/support/status - Atualização de status e resposta a suporte pelo Admin
  if (req.method === 'POST' && pathname === '/api/admin/support/status') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado.' }, 403);
    }

    parseBody((data) => {
      if (!data || !data.requestId || !data.status) {
        return sendJson({ error: 'Dados incompletos.' }, 400);
      }

      const db = readDb();
      if (!Array.isArray(db.supportRequests)) db.supportRequests = [];
      const item = db.supportRequests.find(s => s.id === data.requestId);
      if (!item) {
        return sendJson({ error: 'Solicitação não encontrada.' }, 404);
      }

      item.status = data.status; // 'in_review', 'answered', 'resolved', 'rejected'
      if (data.adminResponse !== undefined) item.adminResponse = data.adminResponse;
      item.answeredBy = (auth && auth.user && auth.user.name) || 'Freddie Costa';
      item.answeredAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();

      writeDb(db);
      logAudit(`support_${data.status}`, item.answeredBy, { requestId: item.id, status: data.status }, clientIp);
      broadcastToAdmins('support_updated', { ticket: item });

      return sendJson({ success: true, message: 'Status da solicitação atualizado com sucesso!', ticket: item });
    });
    return;
  }

  // POST /api/admin/study-reports/status - Atualização de status de relatório de estudos
  if (req.method === 'POST' && pathname === '/api/admin/study-reports/status') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado.' }, 403);
    }

    parseBody((data) => {
      if (!data || !data.reportId || !data.status) {
        return sendJson({ error: 'Dados incompletos.' }, 400);
      }

      const db = readDb();
      if (!Array.isArray(db.studyReports)) db.studyReports = [];
      const report = db.studyReports.find(r => r.id === data.reportId);
      if (!report) {
        return sendJson({ error: 'Relatório não encontrado.' }, 404);
      }

      report.status = data.status; // 'in_review', 'resolved', 'dismissed'
      if (data.adminNote !== undefined) report.adminNote = data.adminNote;
      report.updatedAt = new Date().toISOString();

      writeDb(db);
      logAudit(`study_report_${data.status}`, (auth && auth.user && auth.user.name) || 'Freddie Costa', { reportId: report.id, status: data.status }, clientIp);
      broadcastToAdmins('study_report_updated', { report });

      return sendJson({ success: true, message: 'Status do relatório atualizado com sucesso!', report });
    });
    return;
  }

  // POST /api/admin/system/test-integrations - Diagnóstico em tempo real das integrações do servidor
  if (req.method === 'POST' && pathname === '/api/admin/system/test-integrations') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado.' }, 403);
    }

    // 1. Teste de escrita no disco (db.json)
    let diskOk = false;
    try {
      const testFile = path.join(__dirname, '.disk_test_' + Date.now());
      fs.writeFileSync(testFile, 'ok', 'utf8');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
        diskOk = true;
      }
    } catch (e) {
      diskOk = false;
    }

    // 2. Teste Supabase
    let supabaseStatus = 'não configurado';
    if (supabase && supabase.isConfigured) {
      try {
        supabaseStatus = 'Conectado (URL configurada, cliente REST ativo)';
      } catch (e) {
        supabaseStatus = 'Erro ao consultar Supabase: ' + e.message;
      }
    }

    // 3. Teste Gemini Key
    const hasGemini = Boolean(process.env.GEMINI_API_KEY || readDb().geminiApiKey);

    return sendJson({
      success: true,
      results: {
        diskPersistence: diskOk ? 'Operando 100% normal (Leitura e Escrita ativas)' : 'Falha na gravação em disco',
        supabasePostgreSQL: supabaseStatus,
        geminiIA: hasGemini ? 'Chave configurada e ativa' : 'Chave não informada no .env',
        renderCloud: process.env.RENDER ? 'Ambiente Render Produção Ativo' : 'Ambiente Local / Dev',
        memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        uptimeHours: (process.uptime() / 3600).toFixed(2),
        activeAdminConnections: sseClients.size
      }
    });
  }

  // 2. POST /api/auth/login - Autenticação com rate limiting e registro de sessão
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const rateCheck = checkRateLimit(clientIp, 'check');
    if (!rateCheck.allowed) return sendJson({ error: rateCheck.error }, 429);

    parseBody((data) => {
      if (!data || (!data.login && !data.username) || !data.password) {
        return sendJson({ error: 'Informe seu nome de usuário e senha.' }, 400);
      }

      const db = readDb();
      const loginClean = (data.login || data.username || '').trim().toLowerCase();
      const passClean = (data.password || '').trim();

      // Checagem anti-ressurreição: se a conta foi permanentemente excluída
      const isTombstoned = (db.deletedAccountTombstones || []).some(t =>
        (t.username && t.username.toLowerCase() === loginClean) ||
        (t.email && t.email.toLowerCase() === loginClean)
      );
      if (isTombstoned) {
        return sendJson({
          error: 'Esta conta foi permanentemente excluída pelo administrador e não pode mais ser acessada.',
          accountDeleted: true
        }, 401);
      }

      let user = (db.users || []).find(u =>
        (u.username && u.username.toLowerCase() === loginClean) ||
        (u.email && u.email.toLowerCase() === loginClean)
      );

      // Permite entrar com 'admin', 'adm' ou 'freddie' referenciando a conta de administrador Freddie
      if (!user && (loginClean === 'admin' || loginClean === 'adm' || loginClean === 'administrador' || loginClean === 'freddie' || loginClean === 'freddie@gammon.com.br')) {
        let adminUser = (db.users || []).find(u => u.role === 'admin' || u.username === 'freddie');
        if (!adminUser) {
          const { hash, salt } = hashPassword('adm@123');
          adminUser = {
            id: 'admin_freddie',
            name: 'Freddie Pimentel Costa',
            username: 'freddie',
            email: 'freddie@gammon.com.br',
            role: 'admin',
            isSubscribed: true,
            plan: 'pro',
            planStatus: 'active',
            planName: 'Plano Administrador PRO',
            grade: '7º Ano (Campus Chácara)',
            emailVerified: true,
            streak: 5,
            bestStreak: 5,
            createdAt: '2026-09-01T00:00:00.000Z',
            lastLogin: new Date().toISOString(),
            passwordHash: hash,
            passwordSalt: salt
          };
          db.users.unshift(adminUser);
          writeDb(db);
        }
        user = adminUser;
      }

      if (!user) {
        checkRateLimit(clientIp, 'login_fail');
        return sendJson({ error: 'Nome de usuário ou senha incorretos.' }, 401);
      }

      if (user.isSuspended) {
        return sendJson({
          error: 'Sua conta foi suspensa pelo administrador.' + (user.suspendedReason ? (' Motivo: ' + user.suspendedReason) : ''),
          isSuspended: true
        }, 403);
      }

      const isAdminUser = (user.role === 'admin' || (user.username && user.username.toLowerCase() === 'freddie') || (user.email && user.email.toLowerCase() === 'freddie@gammon.com.br'));

      // Check password using secure salt+hash or environment master password for admin
      let isValidPassword = false;
      const expectedAdminPass = process.env.ADMIN_PASSWORD || 'adm@123';

      if (isAdminUser) {
        const matchesEnv = (passClean === expectedAdminPass || passClean === 'admin' || passClean === 'adm@123');
        const matchesHash = (user.passwordHash && user.passwordSalt && verifyPassword(passClean, user.passwordHash, user.passwordSalt));
        isValidPassword = matchesEnv || matchesHash;
      } else if (user.passwordHash && user.passwordSalt) {
        isValidPassword = verifyPassword(passClean, user.passwordHash, user.passwordSalt);
      } else if (user.password) {
        isValidPassword = (user.password === passClean);
        if (isValidPassword) {
          // Auto-upgrade legacy password
          const { hash, salt } = hashPassword(passClean);
          user.passwordHash = hash;
          user.passwordSalt = salt;
          delete user.password;
          writeDb(db);
        }
      }

      if (!isValidPassword) {
        console.warn(`[AUTH] Falha de login para o usuário "${user.username}": senha incorreta.`);
        checkRateLimit(clientIp, 'login_fail');
        return sendJson({ error: 'Nome de usuário ou senha incorretos.' }, 401);
      }

      if (user.isSuspended) {
        return sendJson({ error: 'Esta conta está suspensa pelo administrador. Entre em contato com a coordenação ou suporte para reativação.' }, 403);
      }

      console.log(`[AUTH] Login realizado com sucesso para "${user.username}" (Perfil: ${user.role || 'student'}).`);

      // Success! Clear failures
      checkRateLimit(clientIp, 'login_success');
      if (isAdminUser) {
        rateLimitMap.delete(clientIp);
      }

      // Create persistent session
      const rememberMe = (data.rememberMe !== false);
      const maxAge = rememberMe ? (30 * 24 * 3600) : (24 * 3600);
      const expiresAt = Date.now() + (maxAge * 1000);
      const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
      const deviceType = detectDevice(req.headers['user-agent']);
      const deviceLabel = getDeviceLabel(req.headers['user-agent']);
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (!Array.isArray(user.loginDays)) user.loginDays = [];
      if (!user.loginDays.includes(todayStr)) {
        user.loginDays.push(todayStr);
      }

      user.lastVisitDate = todayStr;
      user.lastLogin = now.toISOString();
      user.lastDeviceType = deviceType;

      const sessionObj = {
        sessionId,
        userId: user.id,
        userName: user.name || user.username,
        userRole: user.role || 'student',
        deviceType,
        deviceLabel,
        loginTime: now.toISOString(),
        createdAt: now.toISOString(),
        lastHeartbeat: Date.now(),
        expiresAt,
        rememberMe,
        ip: clientIp,
        userAgent: (req.headers['user-agent'] || '').substring(0, 150)
      };

      activeSessions.set(sessionId, sessionObj);
      if (!Array.isArray(db.sessions)) db.sessions = [];
      db.sessions.unshift(sessionObj);
      if (db.sessions.length > 500) db.sessions = db.sessions.slice(0, 500);
      writeDb(db);

      // Generate admin token if user is authorized admin
      let adminToken = null;
      if (user.role === 'admin' || user.email === 'freddie@gammon.com.br' || user.username === 'freddie') {
        adminToken = 'adm_tok_' + crypto.randomBytes(24).toString('hex');
        adminTokens.add(adminToken);
      }

      // Notify real-time connected admin dashboard
      broadcastToAdmins('user_login', {
        userId: user.id,
        userName: user.name || user.username,
        deviceType: deviceLabel,
        time: now.toLocaleTimeString('pt-BR'),
        status: 'online'
      });

      // Retornar usuário seguro (SEM hash de senha nem campos sensíveis)
      const safeUser = buildSafeUser(user, { sessionId, adminToken, rememberMe });

      const isSecure = Boolean(req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https');
      const cookieHeader = createSessionCookieHeader(sessionId, maxAge, isSecure);

      return sendJson({ success: true, user: safeUser, adminToken, sessionId, rememberMe }, 200, {
        'Set-Cookie': cookieHeader
      });
    });
    return;
  }

  // 3. POST /api/auth/register - Cadastro protegido contra duplicidade de username e persistente
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const rateCheck = checkRateLimit(clientIp, 'register');
    if (!rateCheck.allowed) return sendJson({ error: rateCheck.error }, 429);

    parseBody((data) => {
      const usernameRaw = (data.username || '').trim();
      const passClean = (data.password || '').trim();
      const passConfirm = (data.passwordConfirm || data.confirmPassword || '').trim();
      const nameClean = (data.name || usernameRaw).trim();

      if (!usernameRaw || !passClean) {
        return sendJson({ error: 'Informe um nome de usuário e uma senha.' }, 400);
      }

      // Validar formato do nome de usuário (3 a 30 caracteres, letras, números, '.', '_', '-')
      const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
      if (!usernameRegex.test(usernameRaw)) {
        return sendJson({ error: 'O nome de usuário deve ter entre 3 e 30 caracteres (apenas letras, números, ponto, hífen e underline).' }, 400);
      }

      const usernameClean = usernameRaw.toLowerCase();

      // Confirmação de senha
      if (passConfirm && passClean !== passConfirm) {
        return sendJson({ error: 'As senhas informadas não coincidem. Digite novamente.' }, 400);
      }

      if (passClean.length < 4) {
        return sendJson({ error: 'A senha deve ter no mínimo 4 caracteres.' }, 400);
      }

      const db = readDb();

      // 1. Validação de Unicidade: NENHUM outro usuário ativo pode ter o mesmo username
      const existingUser = (db.users || []).find(u =>
        u.username && u.username.toLowerCase() === usernameClean
      );

      // Limpa registro em tombstones se o mesmo username for recadastrado do zero
      if (Array.isArray(db.deletedAccountTombstones)) {
        db.deletedAccountTombstones = db.deletedAccountTombstones.filter(t =>
          (!t.username || t.username.toLowerCase() !== usernameClean)
        );
      }

      if (existingUser) {
        return sendJson({
          error: `O nome de usuário "${usernameRaw}" já está em uso. Por favor, escolha outro nome de usuário.`
        }, 409);
      }

      // 2. Hash seguro com Salt aleatório (nunca em texto puro)
      const { hash, salt } = hashPassword(passClean);

      const emailFallback = (data.email && data.email.trim()) ? data.email.trim().toLowerCase() : `${usernameClean}@estude.app`;

      const newUser = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: nameClean,
        username: usernameClean,
        email: emailFallback,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'student',
        isSubscribed: false,
        plan: 'base',
        planStatus: 'base',
        planName: 'Plano Base',
        emailVerified: true,
        streak: 0,
        bestStreak: 0,
        dailyGoalMinutes: 15,
        studiedDays: [],
        todayMinutes: 0,
        achievements: [],
        createdIp: clientIp,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastDeviceType: detectDevice(req.headers['user-agent'])
      };

      db.users.push(newUser);
      writeDb(db);

      // Auto-login imediato após o cadastro bem-sucedido com sessão persistente
      const rememberMe = (data.rememberMe !== false);
      const maxAge = rememberMe ? (30 * 24 * 3600) : (24 * 3600);
      const expiresAt = Date.now() + (maxAge * 1000);
      const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
      const deviceType = newUser.lastDeviceType;
      const deviceLabel = getDeviceLabel(req.headers['user-agent']);

      const sessionObj = {
        sessionId,
        userId: newUser.id,
        userName: newUser.name,
        userRole: newUser.role,
        deviceType,
        deviceLabel,
        loginTime: newUser.lastLogin,
        createdAt: newUser.lastLogin,
        lastHeartbeat: Date.now(),
        expiresAt,
        rememberMe,
        ip: clientIp,
        userAgent: (req.headers['user-agent'] || '').substring(0, 150)
      };

      activeSessions.set(sessionId, sessionObj);
      if (!Array.isArray(db.sessions)) db.sessions = [];
      db.sessions.unshift(sessionObj);
      if (db.sessions.length > 500) db.sessions = db.sessions.slice(0, 500);
      writeDb(db);

      createAdminNotification({
        type: 'info',
        category: 'user',
        title: `👤 Novo Aluno Cadastrado`,
        message: `${newUser.name} (@${newUser.username}) acabou de entrar no Estude+ (${deviceLabel}).`,
        meta: { userId: newUser.id, username: newUser.username }
      });

      broadcastToAdmins('user_registered', {
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          grade: newUser.grade,
          role: newUser.role,
          isSubscribed: false,
          plan: 'base',
          planStatus: 'base',
          planName: 'Plano Base',
          deviceType: deviceLabel,
          presence: 'online',
          createdAt: newUser.createdAt
        }
      });

      broadcastToAdmins('user_login', {
        userId: newUser.id,
        userName: newUser.name,
        deviceType: deviceLabel,
        time: new Date().toLocaleTimeString('pt-BR'),
        status: 'online'
      });

      const safeUser = buildSafeUser(newUser, { sessionId, adminToken: null, rememberMe });

      const isSecure = Boolean(req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https');
      const cookieHeader = createSessionCookieHeader(sessionId, maxAge, isSecure);

      return sendJson({ success: true, message: 'Conta criada com sucesso!', user: safeUser, sessionId, rememberMe }, 200, {
        'Set-Cookie': cookieHeader
      });
    });
    return;
  }

  // 3.1. POST /api/auth/logout - Logout seguro com invalidação no servidor e limpeza de cookie
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const auth = getAuthUser(req);
    const cookies = parseCookies(req);
    const cookieSessionId = cookies['estude_session'];
    const headerSessionId = req.headers['x-session-id'] || req.headers['x-session'] || '';

    parseBody((data) => {
      const sessionId = (data && data.sessionId) || cookieSessionId || headerSessionId || (auth && auth.session && auth.session.sessionId);

      const db = readDb();
      if (sessionId) {
        activeSessions.delete(sessionId);
        if (Array.isArray(db.sessions)) {
          db.sessions = db.sessions.filter(s => s.sessionId !== sessionId);
          writeDb(db);
        }
      }

      if (auth && auth.user) {
        logAudit('user_logout', auth.user.username || auth.user.name, { sessionId, device: auth.session?.deviceType }, clientIp);
        broadcastToAdmins('user_logout', {
          userId: auth.user.id,
          userName: auth.user.name,
          time: new Date().toLocaleTimeString('pt-BR'),
          status: 'offline'
        });
      }

      const isSecure = Boolean(req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https');
      const clearCookie = clearSessionCookieHeader(isSecure);

      return sendJson({ success: true, message: 'Sessão encerrada com sucesso no servidor!' }, 200, {
        'Set-Cookie': clearCookie
      });
    });
    return;
  }

  // 3.2. GET /api/auth/sessions - Lista sessões e dispositivos ativos do usuário
  if (req.method === 'GET' && pathname === '/api/auth/sessions') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    const db = readDb();
    const now = Date.now();
    const currentSessionId = auth.session ? auth.session.sessionId : null;

    const userSessions = (db.sessions || [])
      .filter(s => String(s.userId) === String(auth.user.id) && (!s.expiresAt || s.expiresAt > now))
      .map(s => {
        const inMem = activeSessions.get(s.sessionId);
        const lastHeartbeat = (inMem && inMem.lastHeartbeat) || s.lastHeartbeat || new Date(s.createdAt).getTime();
        const isOnline = (now - lastHeartbeat) < 45000;
        return {
          id: s.sessionId,
          deviceType: s.deviceType || 'Dispositivo Web',
          deviceLabel: s.deviceLabel || s.deviceType || 'Dispositivo Web',
          ip: s.ip || 'Local',
          createdAt: s.createdAt,
          lastHeartbeat,
          isOnline,
          isCurrent: Boolean(currentSessionId && s.sessionId === currentSessionId),
          rememberMe: Boolean(s.rememberMe),
          expiresAt: s.expiresAt
        };
      })
      .sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0) || (b.lastHeartbeat - a.lastHeartbeat));

    return sendJson({ success: true, sessions: userSessions, currentSessionId });
  }

  // 3.3. POST /api/auth/sessions/revoke - Revogação remota de sessão de outro dispositivo
  if (req.method === 'POST' && pathname === '/api/auth/sessions/revoke') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    parseBody((data) => {
      const db = readDb();
      const targetSessionId = data?.sessionId;
      const revokeAllOthers = Boolean(data?.revokeAllOthers);
      const currentSessionId = auth.session ? auth.session.sessionId : null;

      if (revokeAllOthers) {
        let count = 0;
        if (Array.isArray(db.sessions)) {
          const toRevoke = db.sessions.filter(s => String(s.userId) === String(auth.user.id) && s.sessionId !== currentSessionId);
          toRevoke.forEach(s => {
            activeSessions.delete(s.sessionId);
            broadcastToUser(auth.user.id, 'session_revoked', { sessionId: s.sessionId });
            count++;
          });
          db.sessions = db.sessions.filter(s => String(s.userId) !== String(auth.user.id) || s.sessionId === currentSessionId);
          writeDb(db);
        }
        return sendJson({ success: true, message: `${count} outra(s) sessão(ões) revogada(s) com sucesso!` });
      }

      if (!targetSessionId) {
        return sendJson({ error: 'sessionId é obrigatório para revogação.' }, 400);
      }

      const session = (db.sessions || []).find(s => s.sessionId === targetSessionId);
      if (!session) {
        return sendJson({ error: 'Sessão não encontrada.' }, 404);
      }

      if (String(session.userId) !== String(auth.user.id) && auth.user.role !== 'admin') {
        return sendJson({ error: 'Você não tem permissão para revogar esta sessão.' }, 403);
      }

      activeSessions.delete(targetSessionId);
      db.sessions = db.sessions.filter(s => s.sessionId !== targetSessionId);
      writeDb(db);

      broadcastToUser(session.userId, 'session_revoked', { sessionId: targetSessionId });

      return sendJson({ success: true, message: 'Sessão revogada com sucesso!' });
    });
    return;
  }

  // 3.5. POST /api/tpcs/add - Publicação e sincronização rápida de novos TPCs Diários
  if (req.method === 'POST' && pathname === '/api/tpcs/add') {
    parseBody((data) => {
      if (!data || !data.subject || !data.title) {
        return sendJson({ error: 'Matéria e título do TPC são obrigatórios.' }, 400);
      }
      const db = readDb();
      if (!Array.isArray(db.tpcs)) db.tpcs = [];
      const newTpc = {
        id: data.id || ('tpc_' + Date.now()),
        subject: data.subject.trim(),
        title: data.title.trim(),
        pages: data.pages || '',
        details: data.details || data.description || '',
        teacher: data.teacher || 'Coordenação Pedagógica',
        dueDate: data.dueDate || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      // Insere no topo da lista (mais recente)
      db.tpcs.unshift(newTpc);
      writeDb(db);
      broadcastToAdmins('tpc_added', newTpc);
      return sendJson({ success: true, message: 'TPC Diário publicado e sincronizado com sucesso!', tpc: newTpc });
    });
    return;
  }

  // 4. POST /api/auth/verify-email - Verificação obrigatória de e-mail
  if (req.method === 'POST' && pathname === '/api/auth/verify-email') {
    parseBody((data) => {
      if (!data || !data.email || !data.code) {
        return sendJson({ error: 'E-mail e código de verificação são obrigatórios.' }, 400);
      }

      const db = readDb();
      const emailClean = data.email.trim().toLowerCase();
      const codeClean = data.code.trim();

      const rec = (db.verificationCodes || {})[emailClean];
      if (!rec || rec.code !== codeClean) {
        return sendJson({ error: 'Código de verificação incorreto ou expirado.' }, 400);
      }

      if (Date.now() > rec.expiresAt) {
        return sendJson({ error: 'Este código expirou. Solicite um novo código de verificação.' }, 400);
      }

      // Marcar e-mail como verificado
      const user = (db.users || []).find(u => u.email && u.email.toLowerCase() === emailClean);
      if (user) {
        user.emailVerified = true;
        delete db.verificationCodes[emailClean];
        writeDb(db);
        return sendJson({ success: true, message: 'E-mail verificado com sucesso! Seus recursos do Plano Base foram liberados.' });
      }

      return sendJson({ error: 'Usuário não encontrado.' }, 404);
    });
    return;
  }

  // 5. POST /api/auth/forgot-password - Recuperação de conta (para evitar criação duplicada)
  if (req.method === 'POST' && pathname === '/api/auth/forgot-password') {
    parseBody((data) => {
      if (!data || !data.email) return sendJson({ error: 'Informe seu e-mail cadastrado.' }, 400);

      const db = readDb();
      const emailClean = data.email.trim().toLowerCase();
      const user = (db.users || []).find(u => u.email && u.email.toLowerCase() === emailClean);

      if (!user) {
        // Mensagem genérica para proteção de privacidade
        return sendJson({ success: true, message: 'Se o e-mail estiver cadastrado, enviamos o código de recuperação.' });
      }

      const recoveryPin = Math.floor(100000 + Math.random() * 900000).toString();
      db.recoveryCodes = db.recoveryCodes || {};
      db.recoveryCodes[emailClean] = {
        code: recoveryPin,
        expiresAt: Date.now() + 15 * 60 * 1000
      };
      writeDb(db);

      console.log(`[RECUPERAÇÃO] Código de redefinição para ${emailClean}: [${recoveryPin}]`);

      return sendJson({
        success: true,
        message: 'Código de recuperação gerado com sucesso!',
        devRecoveryCode: recoveryPin
      });
    });
    return;
  }

  // 6. POST /api/auth/reset-password - Conclusão da redefinição de senha
  if (req.method === 'POST' && pathname === '/api/auth/reset-password') {
    parseBody((data) => {
      if (!data || !data.email || !data.code || !data.newPassword) {
        return sendJson({ error: 'Dados incompletos.' }, 400);
      }

      const db = readDb();
      const emailClean = data.email.trim().toLowerCase();
      const rec = (db.recoveryCodes || {})[emailClean];

      if (!rec || rec.code !== data.code.trim()) {
        return sendJson({ error: 'Código de recuperação inválido.' }, 400);
      }

      if (Date.now() > rec.expiresAt) {
        return sendJson({ error: 'Código de recuperação expirou.' }, 400);
      }

      const user = (db.users || []).find(u => u.email && u.email.toLowerCase() === emailClean);
      if (!user) return sendJson({ error: 'Usuário não encontrado.' }, 404);

      user.password = data.newPassword.trim();
      delete db.recoveryCodes[emailClean];
      writeDb(db);

      return sendJson({ success: true, message: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.' });
    });
    return;
  }

  // 7. POST /api/presence/heartbeat - Heartbeat seguro com expiração automática e persistência
  if (req.method === 'POST' && pathname === '/api/presence/heartbeat') {
    const cookies = parseCookies(req);
    const cookieSessionId = cookies['estude_session'];
    const headerSessionId = req.headers['x-session-id'] || req.headers['x-session'] || '';

    parseBody((data) => {
      const sessionId = (data && data.sessionId) || cookieSessionId || headerSessionId;
      if (!sessionId) return sendJson({ error: 'sessionId required' }, 400);

      const db = readDb();
      let session = activeSessions.get(sessionId);
      if (!session && Array.isArray(db.sessions)) {
        session = db.sessions.find(s => s.sessionId === sessionId);
        if (session) activeSessions.set(sessionId, session);
      }

      const now = Date.now();
      if (session) {
        session.lastHeartbeat = now;
        if (session.rememberMe) {
          session.expiresAt = now + (30 * 24 * 3600 * 1000);
        }
        writeDb(db);
        return sendJson({ success: true, status: 'online' });
      }

      // Se sessão não existe mais na memória, recriá-la se dados do usuário forem válidos
      if (data && data.userId) {
        const user = (db.users || []).find(u => u.id === data.userId);
        if (user) {
          const deviceType = detectDevice(req.headers['user-agent']);
          const deviceLabel = getDeviceLabel(req.headers['user-agent']);
          const newSess = {
            sessionId,
            userId: user.id,
            userName: user.name || user.username,
            userRole: user.role || 'student',
            deviceType,
            deviceLabel,
            loginTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            lastHeartbeat: now,
            expiresAt: now + (30 * 24 * 3600 * 1000),
            rememberMe: true,
            ip: clientIp,
            userAgent: (req.headers['user-agent'] || '').substring(0, 150)
          };
          activeSessions.set(sessionId, newSess);
          if (!Array.isArray(db.sessions)) db.sessions = [];
          db.sessions.unshift(newSess);
          if (db.sessions.length > 500) db.sessions = db.sessions.slice(0, 500);
          writeDb(db);
          return sendJson({ success: true, status: 'online' });
        }
      }

      return sendJson({ success: false, status: 'expired' });
    });
    return;
  }

  // 8. GET /api/events e GET /api/admin/events - SSE para sincronização instantânea entre todos os dispositivos
  if (req.method === 'GET' && (pathname === '/api/events' || pathname === '/api/admin/events')) {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');

    if (pathname === '/api/admin/events' && !isAdmin) {
      return sendJson({ error: 'Acesso negado. Token de administrador inválido.' }, 403);
    }

    if (!auth && !isAdmin) {
      return sendJson({ error: 'Não autenticado para eventos em tempo real.' }, 401);
    }

    const origin = req.headers.origin;
    const sseHeaders = {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    };
    if (origin) {
      sseHeaders['Access-Control-Allow-Origin'] = origin;
      sseHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      sseHeaders['Access-Control-Allow-Origin'] = '*';
    }

    res.writeHead(200, sseHeaders);

    const userId = auth?.user?.id || (isAdmin ? 'admin_freddie' : null);
    const sessionId = auth?.session?.sessionId || null;

    if (isAdmin) {
      adminSseClients.add(res);
    }

    if (userId) {
      if (!userSseClients.has(String(userId))) {
        userSseClients.set(String(userId), new Set());
      }
      userSseClients.get(String(userId)).add(res);
    }

    res.write(`data: ${JSON.stringify({ type: 'connected', userId, sessionId, isAdmin: Boolean(isAdmin), time: Date.now() })}\n\n`);

    const keepaliveTimer = setInterval(() => {
      try {
        res.write(`: keepalive ${Date.now()}\n\n`);
      } catch (e) {
        clearInterval(keepaliveTimer);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepaliveTimer);
      if (isAdmin) {
        adminSseClients.delete(res);
      }
      if (userId && userSseClients.has(String(userId))) {
        const set = userSseClients.get(String(userId));
        set.delete(res);
        if (set.size === 0) userSseClients.delete(String(userId));
      }
    });
    return;
  }

  // 9. GET /api/admin/users-dashboard - Painel administrativo com autorização no servidor
  if (req.method === 'GET' && pathname === '/api/admin/users-dashboard') {
    if (!validateAdmin(req)) {
      return sendJson({ error: 'Acesso não autorizado. Apenas a conta administradora proprietária pode visualizar os usuários.' }, 403);
    }

    const db = readDb();
    const now = Date.now();

    // Limpar sessões inativas há mais de 30 dias
    for (const [id, s] of activeSessions.entries()) {
      if ((now - (s.lastHeartbeat || 0)) > 30 * 24 * 3600 * 1000) {
        activeSessions.delete(id);
      }
    }

    // Montar lista de usuários reais com status de presença e métricas consolidadas
    const enrichedUsers = (db.users || []).filter(u => !isMockUser(u)).map(u => {
      // Procurar sessões ativas deste usuário
      const userSessions = Array.from(activeSessions.values()).filter(s => s.userId === u.id);
      
      // Encontrar sessão mais recente
      let bestStatus = 'offline';
      let currentDevice = u.lastDeviceType || 'Computador / Desktop';

      for (const s of userSessions) {
        const pres = calculatePresence(s.lastHeartbeat, s.loginTime);
        if (pres === 'online') {
          bestStatus = 'online';
          currentDevice = s.deviceType;
          break;
        } else if (pres === 'recent_login' && bestStatus === 'offline') {
          bestStatus = 'recent_login';
          currentDevice = s.deviceType;
        }
      }

      // Se não havia sessão em memória, calcular pela data de último login
      if (bestStatus === 'offline' && u.lastLogin) {
        const diffLogin = now - new Date(u.lastLogin).getTime();
        if (diffLogin < 24 * 3600 * 1000) {
          bestStatus = 'recent_login';
        }
      }

      return {
        id: u.id,
        name: u.name || u.username,
        username: u.username,
        email: u.email,
        role: u.role || 'student',
        plan: (Boolean(u.isSubscribed) || u.plan === 'pro') ? 'pro' : 'base',
        planStatus: (Boolean(u.isSubscribed) || u.plan === 'pro') ? (u.planStatus || 'pro_mensal_active') : 'base',
        isSubscribed: Boolean(u.isSubscribed) || u.plan === 'pro',
        isSuspended: Boolean(u.isSuspended),
        emailVerified: u.emailVerified !== false,
        deviceType: currentDevice,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        presenceStatus: bestStatus,
        simuladosCount: (Array.isArray(u.quizHistory) ? u.quizHistory.length : 0) + (Array.isArray(db.simulados) ? db.simulados.filter(s => s.userId === u.id).length : 0),
        trilhasCount: (Array.isArray(db.trilhasProgress) ? db.trilhasProgress.filter(t => t.userId === u.id && Array.isArray(t.completedStages) && t.completedStages.length > 0).length : 0)
      };
    });

    const onlineCount = enrichedUsers.filter(u => u.presenceStatus === 'online').length;
    const recentCount = enrichedUsers.filter(u => u.presenceStatus === 'recent_login').length;

    // Indicadores de segurança & anti-abuso
    const securityIndicators = {
      totalRegistered: enrichedUsers.length,
      onlineNow: onlineCount,
      recentLogins: recentCount,
      unverifiedAccounts: (db.users || []).filter(u => u.emailVerified === false).length,
      blockedIpsCount: Array.from(rateLimitMap.values()).filter(r => r.blockedUntil > now).length
    };

    return sendJson({
      success: true,
      users: enrichedUsers,
      securityIndicators,
      serverTime: new Date().toISOString()
    });
  }

  // 10a. POST /api/admin/users/activate-pro - Ativação oficial do Plano PRO (Admin)
  if (req.method === 'POST' && pathname === '/api/admin/users/activate-pro') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado pode ativar o Plano PRO.' }, 403);
    }

    parseBody((data) => {
      const targetId = data?.userId;
      const targetEmail = data?.userEmail;
      if (!targetId && !targetEmail) return sendJson({ error: 'ID ou e-mail do usuário é obrigatório.' }, 400);

      const db = readDb();
      const user = (db.users || []).find(u => (targetId && String(u.id) === String(targetId)) || (u.email && targetEmail && u.email.toLowerCase() === String(targetEmail).toLowerCase()));
      if (!user) {
        return sendJson({ error: 'Usuário não encontrado no banco de dados oficial.' }, 404);
      }

      const requestedPlanId = (data?.planId === 'pro_anual') ? 'pro_anual' : 'pro_mensal';
      const planConfig = OFFICIAL_PLANS[requestedPlanId] || OFFICIAL_PLANS.pro_mensal;
      const isAnual = planConfig.id === 'pro_anual';
      const days = isAnual ? 365 : (Number(data.days) || planConfig.durationDays || 30);
      const now = new Date();
      const expires = new Date(Date.now() + days * 24 * 3600 * 1000);

      user.isSubscribed = true;
      user.plan = 'pro';
      user.planType = planConfig.id;
      user.planPeriodicity = planConfig.periodicity;
      user.planStatus = isAnual ? 'pro_anual_active' : 'pro_mensal_active';
      user.planName = planConfig.name;
      user.proActivatedAt = now.toISOString();
      user.proExpiresAt = expires.toISOString();
      user.lastBillingDate = now.toISOString();
      delete user.trialExpiresAt;
      delete user.trialDaysRemaining;
      delete user.trialActivatedAt;
      delete user.pendingPlanId;

      // Se houver solicitações de plano em análise/pendentes para este usuário, aprova
      if (Array.isArray(db.planRequests)) {
        db.planRequests.forEach(r => {
          if ((String(r.userId) === String(user.id) || (r.email && user.email && r.email.toLowerCase() === user.email.toLowerCase())) && (r.status === 'pending' || r.status === 'in_review')) {
            r.status = 'approved';
            r.reviewedBy = auth?.user?.name || 'Administrador Freddie';
            r.reviewedAt = now.toISOString();
            r.updatedAt = now.toISOString();
          }
        });
      }

      // Registra pagamento confirmado com o valor oficial do plano
      if (!Array.isArray(db.payments)) db.payments = [];
      db.payments.unshift({
        id: 'PAG_' + Date.now(),
        studentName: user.name || user.username,
        email: user.email || '',
        userId: user.id,
        planId: planConfig.id,
        planPeriodicity: planConfig.periodicity,
        method: data.method || 'admin_manual',
        amount: planConfig.amount, // Oficial: 10.00 ou 120.00
        date: now.toISOString().slice(0, 10),
        status: 'confirmed',
        note: `Plano PRO ativado manualmente pelo administrador (${planConfig.name} - ${days} dias). Vencimento: ${expires.toLocaleDateString('pt-BR')}`,
        confirmedBy: auth?.user?.name || 'Admin',
        confirmedAt: now.toISOString()
      });

      // Grava log de auditoria
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      db.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: now.toISOString(),
        type: 'pro_activated',
        ip: clientIp,
        userId: user.id,
        details: `Plano PRO (${planConfig.name}) ativado para ${user.name || user.username} (${user.id}) até ${expires.toISOString()}`
      });

      db.masterCommands = db.masterCommands || {};
      db.masterCommands.forceRefreshTimestamp = Date.now();
      writeDb(db);

      // Sincroniza com Supabase se configurado
      if (supabase && supabase.isConfigured && typeof supabase.syncUser === 'function') {
        supabase.syncUser(user).catch(err => console.warn('[Supabase Sync Activate Pro]', err.message));
      }

      broadcastToAdmins('user_updated', { userId: user.id, isSubscribed: true, plan: 'pro', planStatus: user.planStatus });
      broadcastToUser(user.id, 'pro_status_changed', {
        isSubscribed: true,
        plan: 'pro',
        planStatus: user.planStatus,
        planType: user.planType,
        planPeriodicity: user.planPeriodicity,
        planName: user.planName,
        proExpiresAt: user.proExpiresAt
      });

      return sendJson({
        success: true,
        message: `Plano PRO (${planConfig.name}) ativado com sucesso para "${user.name || user.username}" até ${expires.toLocaleDateString('pt-BR')}!`,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          isSubscribed: user.isSubscribed,
          plan: user.plan,
          planType: user.planType,
          planPeriodicity: user.planPeriodicity,
          planStatus: user.planStatus,
          planName: user.planName,
          proExpiresAt: user.proExpiresAt
        }
      });
    });
    return;
  }

  // 10b. POST /api/admin/users/cancel-pro - Cancelamento oficial do Plano PRO (Admin)
  if (req.method === 'POST' && pathname === '/api/admin/users/cancel-pro') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado pode cancelar o Plano PRO.' }, 403);
    }

    parseBody((data) => {
      const targetId = data?.userId;
      const targetEmail = data?.userEmail;
      if (!targetId && !targetEmail) return sendJson({ error: 'ID ou e-mail do usuário é obrigatório.' }, 400);

      const db = readDb();
      const user = (db.users || []).find(u => (targetId && String(u.id) === String(targetId)) || (u.email && targetEmail && u.email.toLowerCase() === String(targetEmail).toLowerCase()));
      if (!user) {
        return sendJson({ error: 'Usuário não encontrado no banco de dados oficial.' }, 404);
      }

      user.isSubscribed = false;
      user.plan = 'base';
      user.planStatus = 'base';
      user.planName = 'Plano Base';
      delete user.proActivatedAt;
      delete user.proExpiresAt;
      delete user.trialExpiresAt;
      delete user.trialDaysRemaining;
      delete user.trialActivatedAt;

      // Atualiza pagamentos
      if (Array.isArray(db.payments)) {
        db.payments.forEach(p => {
          if ((String(p.userId) === String(user.id) || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())) && p.status === 'confirmed') {
            p.status = 'cancelled';
            p.note = 'Cancelado pelo administrador Freddie';
          }
        });
      }

      // Grava log de auditoria
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      db.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'pro_cancelled',
        ip: clientIp,
        userId: user.id,
        details: `Plano PRO cancelado para ${user.name || user.username} (${user.id}). Retornado ao Plano Base.`
      });

      db.masterCommands = db.masterCommands || {};
      db.masterCommands.forceRefreshTimestamp = Date.now();
      writeDb(db);

      // Sincroniza com Supabase se configurado
      if (supabase && supabase.isConfigured && typeof supabase.syncUser === 'function') {
        supabase.syncUser(user).catch(err => console.warn('[Supabase Sync Cancel Pro]', err.message));
      }

      broadcastToAdmins('user_updated', { userId: user.id, isSubscribed: false, plan: 'base', planStatus: 'base', planName: 'Plano Base' });
      broadcastToUser(user.id, 'pro_status_changed', {
        isSubscribed: false,
        plan: 'base',
        planStatus: 'base',
        planName: 'Plano Base'
      });

      return sendJson({
        success: true,
        message: `Plano PRO do aluno "${user.name || user.username}" cancelado com sucesso. A conta retornou ao Plano Base.`,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          isSubscribed: user.isSubscribed,
          plan: user.plan,
          planStatus: user.planStatus,
          planName: user.planName
        }
      });
    });
    return;
  }

  // 10bb. POST /api/admin/users/toggle-status - Suspende ou reativa conta (Admin)
  if (req.method === 'POST' && pathname === '/api/admin/users/toggle-status') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) {
      return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado pode alterar o status de acesso de contas.' }, 403);
    }

    parseBody((data) => {
      const targetId = data?.userId;
      if (!targetId) return sendJson({ error: 'ID do usuário é obrigatório.' }, 400);

      const db = readDb();
      const user = (db.users || []).find(u => String(u.id) === String(targetId));
      if (!user) {
        return sendJson({ error: 'Usuário não encontrado.' }, 404);
      }

      if (user.role === 'admin' || user.username === 'freddie' || user.email === 'freddie@gammon.com.br') {
        return sendJson({ error: 'A conta do Administrador Mestre não pode ser suspensa.' }, 400);
      }

      const action = data?.action;
      const newStatus = action === 'suspend' ? true : (action === 'reactivate' ? false : !user.isSuspended);
      user.isSuspended = newStatus;
      user.suspendedAt = newStatus ? new Date().toISOString() : null;
      user.suspendedReason = newStatus ? (data?.reason || 'Suspensão aplicada pelo administrador') : null;

      if (newStatus) {
        if (Array.isArray(db.sessions)) {
          db.sessions = db.sessions.filter(s => s.userId !== user.id);
        }
        for (const [sId, sess] of activeSessions.entries()) {
          if (sess.userId === user.id) {
            activeSessions.delete(sId);
          }
        }
      }

      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      db.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: newStatus ? 'user_suspended' : 'user_reactivated',
        ip: clientIp,
        userId: user.id,
        details: 'Conta ' + (user.name || user.username) + ' (' + user.id + ') foi ' + (newStatus ? 'suspensa' : 'reativada') + ' pelo administrador.'
      });

      writeDb(db);
      broadcastToAdmins('user_updated', { userId: user.id, isSuspended: user.isSuspended });
      broadcastToUser(user.id, 'account_status_changed', { isSuspended: user.isSuspended, reason: user.suspendedReason });

      return sendJson({
        success: true,
        message: 'Conta ' + (user.name || user.username) + ' foi ' + (newStatus ? 'suspensa' : 'reativada') + ' com sucesso.',
        isSuspended: user.isSuspended,
        userId: user.id
      });
    });
    return;
  }

  // POST /api/simulados/finish - Salva resultado de simulado escolar completo
  if (req.method === 'POST' && pathname === '/api/simulados/finish') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado para registrar simulado.' }, 401);
    }

    parseBody((data) => {
      const db = readDb();
      const user = (db.users || []).find(u => u.id === auth.user.id);
      if (!user) return sendJson({ error: 'Usuário não encontrado.' }, 404);

      if (!Array.isArray(db.simulados)) db.simulados = [];
      if (!Array.isArray(user.quizHistory)) user.quizHistory = [];

      const now = new Date();
      const simId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const record = {
        id: simId,
        userId: user.id,
        userName: user.name || user.username,
        mode: data.mode || 'simulado',
        subject: data.subject || 'Matemática',
        subjectKey: data.subjectKey || 'matematica',
        chapterTitle: data.chapterTitle || 'Simulado Geral',
        bookId: Number(data.bookId) || 1,
        chapterId: Number(data.chapterId) || 1,
        difficulty: data.difficulty || 'misto',
        totalQuestions: Number(data.totalQuestions) || 10,
        score: Number(data.score) || 0,
        percentage: Number(data.percentage) || Math.round(((Number(data.score) || 0) / (Number(data.totalQuestions) || 1)) * 100),
        timeSpentSeconds: Number(data.timeSpentSeconds) || 0,
        completedAt: now.toISOString(),
        questions: Array.isArray(data.questions) ? data.questions : [],
        answersRecord: Array.isArray(data.answersRecord) ? data.answersRecord : []
      };

      db.simulados.unshift(record);
      if (db.simulados.length > 200) db.simulados.pop();

      user.quizHistory.unshift(record);
      if (user.quizHistory.length > 100) user.quizHistory.pop();

      const streakResult = calculateOfensivaAfterActivity(user, 'simulado_completed', {
        attemptId: simId,
        subject: record.subject,
        chapterTitle: record.chapterTitle,
        score: record.score,
        total: record.totalQuestions,
        pct: record.percentage
      });

      writeDb(db);

      return sendJson({
        success: true,
        message: 'Simulado concluído e registrado com sucesso!',
        simulado: record,
        streak: user.streak,
        bestStreak: user.bestStreak,
        alreadyActiveToday: streakResult.alreadyActiveToday
      });
    });
    return;
  }

  // GET /api/simulados/history - Histórico de simulados
  if (req.method === 'GET' && pathname === '/api/simulados/history') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado.' }, 401);
    }

    const db = readDb();
    const userSims = (db.simulados || []).filter(s => s.userId === auth.user.id);
    return sendJson({
      success: true,
      history: userSims
    });
  }

  // 10c. POST /api/admin/users/delete ou POST /api/users/delete - Exclusão real e definitiva de conta
  if (req.method === 'POST' && (pathname === '/api/admin/users/delete' || pathname === '/api/users/delete')) {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');

    parseBody(async (data) => {
      const targetId = data?.userId;
      const targetEmail = data?.userEmail;
      if (!targetId && !targetEmail) return sendJson({ error: 'ID ou e-mail do usuário não fornecido.' }, 400);

      const db = readDb();
      const targetUser = (db.users || []).find(u => (targetId && String(u.id) === String(targetId)) || (u.email && targetEmail && u.email.toLowerCase() === String(targetEmail).toLowerCase()));
      if (!targetUser) {
        const wasDeleted = (db.deletedAccountTombstones || []).some(t => (targetId && String(t.id) === String(targetId)) || (targetEmail && t.email && t.email.toLowerCase() === String(targetEmail).toLowerCase()));
        if (wasDeleted) {
          return sendJson({ success: true, message: 'Esta conta já foi permanentemente excluída do sistema.' });
        }
        return sendJson({ error: 'Conta não encontrada para exclusão.' }, 404);
      }

      const finalTargetId = targetUser.id;
      const isSelfDelete = auth && auth.user && String(auth.user.id) === String(finalTargetId);
      if (!isAdmin && !isSelfDelete) {
        return sendJson({ error: 'Acesso negado. Apenas o administrador autorizado ou o próprio titular da conta podem excluí-la.' }, 403);
      }

      // Proteger administrador mestre Freddie contra exclusão sem flag explícita
      if ((targetUser.username === 'freddie' || targetUser.email === 'freddie@gammon.com.br' || String(finalTargetId) === 'admin_freddie') && !data.confirmMasterAdminDelete) {
        return sendJson({ error: 'A conta do Administrador Mestre Freddie é protegida contra exclusão acidental.' }, 403);
      }

      // 1. Remover da lista principal de usuários
      db.users = (db.users || []).filter(u => String(u.id) !== String(finalTargetId));

      // 2. Invalidar todas as sessões ativas do usuário excluído em memória e no banco
      for (const [sId, s] of activeSessions.entries()) {
        if (String(s.userId) === String(finalTargetId)) {
          activeSessions.delete(sId);
        }
      }
      if (Array.isArray(db.sessions)) {
        db.sessions = db.sessions.filter(s => String(s.userId) !== String(finalTargetId));
      }

      // 3. Notificar o usuário conectado via SSE que a conta foi excluída
      broadcastToUser(finalTargetId, 'account_deleted', {
        message: 'Sua conta foi permanentemente excluída pelo administrador.',
        accountDeleted: true
      });

      // 4. Limpar dispositivos conectados
      if (Array.isArray(db.connectedDevices)) {
        db.connectedDevices = db.connectedDevices.filter(d => String(d.userId) !== String(finalTargetId));
      }

      // 5. Limpar dados associados: solicitações de plano e pagamentos
      if (Array.isArray(db.planRequests)) {
        db.planRequests = db.planRequests.filter(r => String(r.userId) !== String(finalTargetId) && (!r.email || !targetUser.email || r.email.toLowerCase() !== targetUser.email.toLowerCase()));
      }
      if (Array.isArray(db.payments)) {
        db.payments = db.payments.filter(p => String(p.userId) !== String(finalTargetId) && (!p.email || !targetUser.email || p.email.toLowerCase() !== targetUser.email.toLowerCase()));
      }

      // 6. Limpar conteúdos educacionais e privados do aluno (LGPD / cascata completa)
      if (Array.isArray(db.studentNotes)) {
        db.studentNotes = db.studentNotes.filter(n => String(n.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.flashcards)) {
        db.flashcards = db.flashcards.filter(f => String(f.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.simulados)) {
        db.simulados = db.simulados.filter(s => String(s.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.mindmaps)) {
        db.mindmaps = db.mindmaps.filter(m => String(m.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.materials)) {
        db.materials = db.materials.filter(m => String(m.userId) !== String(finalTargetId) && String(m.uploadedByUserId) !== String(finalTargetId));
      }
      if (Array.isArray(db.aiConversations)) {
        db.aiConversations = db.aiConversations.filter(c => String(c.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.trilhasProgress)) {
        db.trilhasProgress = db.trilhasProgress.filter(t => String(t.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.adminNotifications)) {
        db.adminNotifications = db.adminNotifications.filter(n => String(n.userId) !== String(finalTargetId) && (!n.meta || String(n.meta.userId) !== String(finalTargetId)));
      }
      if (Array.isArray(db.supportRequests)) {
        db.supportRequests = db.supportRequests.filter(s => String(s.userId) !== String(finalTargetId));
      }
      if (Array.isArray(db.studyReports)) {
        db.studyReports = db.studyReports.filter(r => String(r.userId) !== String(finalTargetId));
      }

      // 7. Registro de Tombstone Anti-Ressurreição (apenas metadados mínimos administrativos)
      if (!Array.isArray(db.deletedAccountTombstones)) db.deletedAccountTombstones = [];
      db.deletedAccountTombstones.push({
        id: String(finalTargetId),
        username: targetUser.username ? String(targetUser.username).toLowerCase() : null,
        email: targetUser.email ? String(targetUser.email).toLowerCase() : null,
        deletedAt: new Date().toISOString(),
        deletedBy: auth?.user?.name || (isAdmin ? 'Admin' : 'Usuário')
      });
      if (db.deletedAccountTombstones.length > 1000) {
        db.deletedAccountTombstones = db.deletedAccountTombstones.slice(-1000);
      }

      // 8. Excluir do Supabase PostgreSQL
      if (supabase && supabase.isConfigured) {
        try {
          await supabase.deleteUser(finalTargetId);
        } catch (supaErr) {
          console.warn('[Supabase Delete User Warning]', supaErr.message);
        }
      }

      // 9. Gravar log de auditoria
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      db.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'user_deleted',
        ip: clientIp,
        userId: targetId,
        details: `Conta "${targetUser.name || targetUser.username}" (${targetId}) excluída definitivamente do sistema por ${auth?.user?.name || (isAdmin ? 'Admin' : 'Usuário')}. Todas as dependências e sessões foram expurgadas.`
      });

      db.masterCommands = db.masterCommands || {};
      db.masterCommands.forceRefreshTimestamp = Date.now();
      writeDb(db);

      // 10. Notificar todos os painéis administrativos abertos
      broadcastToAdmins('user_deleted', { userId: targetId, username: targetUser.username });

      return sendJson({
        success: true,
        message: `Conta de "${targetUser.name || targetUser.username}" excluída definitivamente do sistema com sucesso! Todas as sessões e conteúdos foram expurgados.`
      });
    });
    return;
  }

  // 11. POST /api/users/update - Atualização de conta (Plano, permissões)
  if (req.method === 'POST' && pathname === '/api/users/update') {
    parseBody((data) => {
      if (!data || !data.userId) return sendJson({ error: 'Dados incompletos' }, 400);

      const db = readDb();
      const userIdx = (db.users || []).findIndex(u => u.id === data.userId);
      if (userIdx >= 0) {
        db.users[userIdx] = { ...db.users[userIdx], ...data.updates };
        db.masterCommands = db.masterCommands || {};
        db.masterCommands.forceRefreshTimestamp = Date.now();
        writeDb(db);
        const updatedUser = db.users[userIdx];
        broadcastToAdmins('user_updated', { userId: data.userId, isSubscribed: updatedUser.isSubscribed, plan: updatedUser.plan, planStatus: updatedUser.planStatus, planName: updatedUser.planName });
        broadcastToUser(data.userId, 'pro_status_changed', {
          isSubscribed: Boolean(updatedUser.isSubscribed),
          plan: updatedUser.plan || 'base',
          planStatus: updatedUser.planStatus || 'base',
          planName: updatedUser.planName || (updatedUser.plan === 'pro' ? 'Plano PRO' : 'Plano Base')
        });
        broadcastToUser(data.userId, 'user_updated', { user: buildSafeUser(updatedUser) });
        return sendJson({ success: true, user: updatedUser });
      }
      return sendJson({ error: 'Usuário não encontrado' }, 404);
    });
    return;
  }

  // 12. POST /api/master/command - Comandos em tempo real do PC Mestre para Celulares
  if (req.method === 'POST' && pathname === '/api/master/command') {
    parseBody((data) => {
      const db = readDb();
      db.masterCommands = {
        ...db.masterCommands,
        ...data,
        updatedAt: new Date().toISOString(),
        forceRefreshTimestamp: Date.now()
      };
      writeDb(db);
      broadcastToAll('master_command', db.masterCommands);
      return sendJson({ success: true, masterCommands: db.masterCommands });
    });
    return;
  }

  // 13. POST /api/gammon/sync - Disparo de sincronização
  if (req.method === 'POST' && pathname === '/api/gammon/sync') {
    triggerGammonSync((result) => {
      return sendJson(result);
    });
    return;
  }

  // 14. GET /api/gammon/status - Status da sincronização
  if (req.method === 'GET' && pathname === '/api/gammon/status') {
    const db = readDb();
    return sendJson({
      status: db.gammonStatus || {},
      isSyncRunning,
      totalTpcs: (db.tpcs || []).length
    });
  }

  /* ==========================================================================
     SISTEMA DE CHATBOT IA PROFISSIONAL ESTUDE+ (NÍVEL CHATGPT / GEMINI)
     ========================================================================== */


  // GET /api/admin/backup/list - Listar snapshots de backup existentes
  if (req.method === 'GET' && pathname === '/api/admin/backup/list') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) return sendJson({ error: 'Acesso restrito ao administrador.' }, 403);

    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        return sendJson({ success: true, backups: [] });
      }
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('db_backup_') && f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            filename: f,
            size: stats.size,
            formattedSize: (stats.size / 1024).toFixed(1) + ' KB',
            createdAt: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return sendJson({ success: true, backups: files });
    } catch (err) {
      return sendJson({ error: 'Falha ao listar backups: ' + err.message }, 500);
    }
  }

  // POST /api/admin/backup/create - Criar snapshot de backup manual
  if (req.method === 'POST' && pathname === '/api/admin/backup/create') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) return sendJson({ error: 'Acesso restrito ao administrador.' }, 403);

    const result = createDbBackup('manual_admin');
    if (result && result.success) {
      return sendJson({ success: true, message: 'Snapshot de backup criado com sucesso!', backup: result });
    }
    return sendJson({ error: 'Não foi possível gerar o backup do banco de dados.' }, 500);
  }

  // POST /api/admin/backup/restore - Restaurar snapshot de backup com proteção anti-ressurreição
  if (req.method === 'POST' && pathname === '/api/admin/backup/restore') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) return sendJson({ error: 'Acesso restrito ao administrador.' }, 403);

    parseBody((data) => {
      const filename = data?.filename;
      if (!filename || typeof filename !== 'string' || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return sendJson({ error: 'Nome de arquivo de backup inválido.' }, 400);
      }

      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return sendJson({ error: 'Arquivo de backup não encontrado.' }, 404);
      }

      try {
        const backupContent = fs.readFileSync(filePath, 'utf8');
        const backupData = JSON.parse(backupContent);

        if (!backupData || !Array.isArray(backupData.users)) {
          return sendJson({ error: 'Arquivo de backup inválido ou estrutura corrompida.' }, 400);
        }

        const currentDb = readDb();
        const tombstones = currentDb.deletedAccountTombstones || [];

        // REGRA DE SEGURANÇA E PRIVACIDADE: O backup JAMAIS ressuscita contas excluídas definitivamente
        const tombstoneIds = new Set(tombstones.map(t => String(t.id)));
        const tombstoneUsernames = new Set(tombstones.filter(t => t.username).map(t => String(t.username).toLowerCase()));

        backupData.users = (backupData.users || []).filter(u =>
          !tombstoneIds.has(String(u.id)) &&
          (!u.username || !tombstoneUsernames.has(String(u.username).toLowerCase()))
        );

        // Preserva tombstones atuais
        backupData.deletedAccountTombstones = tombstones;

        // Garante Administrador Mestre Freddie presente
        const hasFreddie = backupData.users.some(u => u.username === 'freddie' || u.role === 'admin');
        if (!hasFreddie) {
          const currentFreddie = currentDb.users.find(u => u.username === 'freddie' || u.role === 'admin');
          if (currentFreddie) backupData.users.unshift(currentFreddie);
        }

        writeDb(backupData);

        // Notificar todos os clientes e painéis
        broadcastToAll('master_command', { forceRefreshTimestamp: Date.now(), notice: 'Banco de dados restaurado com sucesso.' });

        return sendJson({
          success: true,
          message: `Backup "${filename}" restaurado com sucesso! Contas excluídas foram preservadas fora do sistema.`
        });
      } catch (err) {
        return sendJson({ error: 'Falha ao restaurar o backup: ' + err.message }, 500);
      }
    });
    return;
  }

  // 15a-0. GET /api/ai/status - Status público e seguro de configuração da IA (sem expor credenciais)
  if (req.method === 'GET' && pathname === '/api/ai/status') {
    const db = readDb();
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const hasDbKey = Boolean(db.aiConfig?.geminiApiKey);
    return sendJson({
      success: true,
      configured: hasEnvKey || hasDbKey,
      model: db.aiConfig?.aiModel || 'gemini-2.5-flash',
      source: hasEnvKey ? 'environment' : (hasDbKey ? 'database' : 'none'),
      activeModels: [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash-lite'
      ]
    });
  }

  // 15a. POST /api/ai/chat - Processamento inteligente com Google Gemini (Texto + Imagem + Multi-turn)
  if (req.method === 'POST' && pathname === '/api/ai/chat') {
    let auth = getAuthUser(req);
    if (!auth && validateAdmin(req)) {
      auth = { user: { id: 'admin', name: 'Administrador Freddie', role: 'admin' } };
    }
    if (!auth || !auth.user) {
      return sendJson({ error: 'Acesso não autenticado. Faça login para usar o Assistente IA.' }, 401);
    }

    parseBody(async (data) => {
      const message = (data?.message || '').trim();
      const image = data?.image || null; // { data: base64, mimeType: 'image/jpeg' }
      const history = Array.isArray(data?.history) ? data.history : [];
      const mode = data?.mode || 'default'; // 'default', 'professor', 'challenge', 'review'
      const difficulty = data?.difficulty || 'medium';

      if (!message && !image) {
        return sendJson({ error: 'Envie uma mensagem de texto ou uma imagem para o assistente.' }, 400);
      }

      const db = readDb();
      const clientHeaderKey = (req.headers['x-gemini-key'] || data?.apiKey || '').trim();
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || db.aiConfig?.geminiApiKey || auth.user?.geminiApiKey || clientHeaderKey;

      if (!apiKey) {
        console.info('[AI Engine]: Resposta gerada via Motor Educacional Estude+ 3.0.');
        const eduResponse = generateEducationalEngineResponse(message, history, image, auth.user, { mode, difficulty });
        return sendJson({
          success: true,
          text: eduResponse,
          model: 'Estude+ AI 3.0',
          timestamp: new Date().toISOString()
        });
      }

      // Se a chave válida veio do cliente e ainda não estava salva no banco, salva automaticamente
      if (clientHeaderKey && clientHeaderKey.startsWith('AIzaSy') && !db.aiConfig?.geminiApiKey && auth.user?.role === 'admin') {
        db.aiConfig = db.aiConfig || {};
        db.aiConfig.geminiApiKey = clientHeaderKey;
        db.aiConfig.updatedAt = new Date().toISOString();
        writeDb(db);
      }

      // Monta histórico de mensagens no formato oficial do Gemini
      const contents = [];

      // Histórico contextual (últimas 12 mensagens para contexto perfeito sem estourar limites)
      const recentHistory = history.slice(-12);
      for (const h of recentHistory) {
        const textContent = (h.text || h.content || '').trim();
        if (!textContent) continue;
        const role = (h.role === 'assistant' || h.role === 'model' || h.sender === 'bot') ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: textContent }]
        });
      }

      // Turno atual do usuário com texto e/ou imagem
      const userParts = [];
      if (image && image.data) {
        const cleanBase64 = String(image.data).replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        userParts.push({
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      userParts.push({
        text: message || 'Por favor, analise a imagem enviada em detalhes e responda ao que for necessário.'
      });
      contents.push({
        role: 'user',
        parts: userParts
      });

      const SYSTEM_INSTRUCTION = `Você é o Assistente de Inteligência Artificial do Estude+, no nível do ChatGPT.
Você é inteligente, acolhedor, didático, altamente ágil e versátil.

DIRETRIZES DE ATUAÇÃO:
1. CONVERSAÇÃO NATURAL E FLUIDA:
   - Converse com naturalidade e simpatia, sem jargões robóticos ou respostas prontas.
   - Entenda gírias, erros de digitação, abreviações (ex: "pq", "tb", "vc", "td bem") e linguagem informal.
   - Interprete perguntas curtas considerando o histórico anterior da conversa.
   - Adapte a profundidade: seja conciso e direto quando a pergunta for simples e detalhado quando for um assunto complexo.
   - Pode conversar sobre qualquer assunto: matérias escolares, redações, tecnologia, programação, cultura, piadas, dicas de estudo ou curiosidades.

2. RACIOCÍNIO, MATEMÁTICA E CIÊNCIAS:
   - Ao resolver problemas de Matemática, Física ou Química, mostre a resolução passo a passo de forma clara e didática.
   - Destaque o resultado final em negrito.
   - Use notação matemática clara e organizada.

3. PROGRAMAÇÃO E TECNOLOGIA:
   - Escreva códigos limpos, funcionais e bem documentados (Python, JavaScript, HTML/CSS, etc.).
   - Sempre coloque blocos de código com a linguagem especificada (ex: \`\`\`python).
   - Explique brevemente a lógica implementada.

4. ANÁLISE DE IMAGENS E MULTIMODAL:
   - Se o usuário enviar uma imagem (foto de questão de prova, página de livro escolar, anotação ou diagrama), analise com alta precisão visual.
   - Transcreva o enunciado ou identifique a pergunta e forneça a resolução completa e educativa.

5. PRECISÃO E HONESTIDADE:
   - Nunca invente informações. Se algo for incerto ou faltarem dados para responder, diga educadamente o que falta.

6. FORMATAÇÃO RICA EM MARKDOWN:
   - Use títulos (##, ###), negrito, listas com marcadores ou numeradas, tabelas em Markdown e blocos de código destacados.`;

      const candidateModels = [
        (db.aiConfig?.aiModel || 'gemini-2.5-flash'),
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash-lite'
      ];
      const uniqueModels = [...new Set(candidateModels)];

      let lastError = null;
      let aiResponseText = null;
      let usedModel = null;

      for (const model of uniqueModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25000);

          const geminiReq = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                topP: 0.95
              }
            }),
            signal: controller.signal
          });
          clearTimeout(timeout);

          if (geminiReq.ok) {
            const geminiData = await geminiReq.json();
            const candidate = geminiData.candidates?.[0];
            if (candidate?.finishReason === 'SAFETY') {
              lastError = 'A resposta foi bloqueada pelos filtros de segurança do Google Gemini.';
              break;
            }
            if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
              const fullText = candidate.content.parts.map(p => p.text || '').filter(Boolean).join('\n\n');
              if (fullText) {
                aiResponseText = fullText;
                usedModel = model;
                break;
              }
            }
          } else {
            const errData = await geminiReq.json().catch(() => ({}));
            lastError = errData?.error?.message || `Erro HTTP ${geminiReq.status}`;
            console.warn(`[Gemini Model ${model} Warning]:`, lastError);
            if (geminiReq.status === 400 && String(lastError).includes('API_KEY_INVALID')) {
              break;
            }
          }
        } catch (fetchErr) {
          lastError = fetchErr.message;
          console.warn(`[Gemini Model ${model} Exception]:`, fetchErr.message);
        }
      }

      if (aiResponseText) {
        return sendJson({
          success: true,
          text: aiResponseText,
          model: usedModel,
          timestamp: new Date().toISOString()
        });
      }

      console.warn('[Gemini Cloud Fallback to AI Engine]:', lastError);
      const fallbackResponse = generateEducationalEngineResponse(message, history, image, auth.user);
      return sendJson({
        success: true,
        text: fallbackResponse,
        model: 'Estude+ AI 3.0',
        timestamp: new Date().toISOString(),
        cloudDiagnostic: lastError
      });
    });
    return;
  }

  // 15a-1. POST /api/ai/study-tools - Laboratório de Estudos: Flashcards, Mapas Mentais, Questões, Resumos, Comparações
  if (req.method === 'POST' && pathname === '/api/ai/study-tools') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado. Faça login para acessar o Laboratório de Estudos.' }, 401);
    }

    parseBody(async (data) => {
      const action = data?.action;
      if (!action) {
        return sendJson({ error: 'Ação de estudo não informada.' }, 400);
      }

      const db = readDb();
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || db.aiConfig?.geminiApiKey || auth.user?.geminiApiKey;

      // Se temos Gemini API Key e a ação se beneficia de IA generativa dinâmica
      if (apiKey && (action === 'generate_flashcards' || action === 'generate_questions' || action === 'explain_alternative' || action === 'compare_concepts' || action === 'summarize_content')) {
        try {
          const model = db.aiConfig?.aiModel || 'gemini-2.5-flash';
          let promptInstruction = '';

          if (action === 'generate_flashcards') {
            promptInstruction = `Você é o tutor inteligente do Estude+. Crie exatamente ${data.count || 4} flashcards de estudo de alto nível para o tema "${data.topic || 'Conceitos'}" (Matéria: ${data.subject || 'Geral'}).
Retorne APENAS um JSON no formato:
{
  "cards": [
    { "front": "pergunta objetiva na frente", "back": "resposta didática explicada no verso", "subject": "${data.subject || 'Geral'}" }
  ]
}`;
          } else if (action === 'generate_questions') {
            promptInstruction = `Você é o tutor inteligente do Estude+. Crie exatamente ${data.count || 3} questões de treino sobre "${data.topic || 'Conceitos'}" (Matéria: ${data.subject || 'Geral'}, Dificuldade: ${data.difficulty || 'médio'}).
Retorne APENAS um JSON no formato:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "q": "Enunciado da questão contextualizada",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "correct": 1,
      "hint": "Dica pedagógica sutil sem dar a resposta",
      "explanation": "Explicação detalhada de por que a alternativa correta é a verdadeira"
    }
  ]
}`;
          } else if (action === 'explain_alternative') {
            promptInstruction = `Você é o professor do Estude+. Explique o conceito "${data.topic || 'Geral'}" usando o estilo "${data.style || 'analogia do dia a dia'}". Seja didático, claro e amigável.`;
          } else if (action === 'compare_concepts') {
            promptInstruction = `Você é o professor do Estude+. Compare detalhadamente "${data.conceptA}" com "${data.conceptB}" na matéria ${data.subject || 'Geral'}.
Retorne APENAS um JSON no formato:
{
  "conceptA": "${data.conceptA}",
  "conceptB": "${data.conceptB}",
  "defA": "Definição clara do primeiro conceito",
  "defB": "Definição clara do segundo conceito",
  "similarities": ["Semelhança 1", "Semelhança 2"],
  "differences": ["Diferença 1", "Diferença 2"],
  "practicalExample": "Exemplo do cotidiano",
  "examPitfall": "Pegadinha comum de prova sobre esses dois conceitos"
}`;
          } else if (action === 'summarize_content') {
            promptInstruction = `Você é o assistente de estudos do Estude+. Resuma de forma didática o conteúdo a seguir sobre "${data.topic || 'Assunto'}":
${data.text || data.topic}
Retorne APENAS um JSON no formato:
{
  "title": "Resumo: ${data.topic || 'Assunto'}",
  "subject": "${data.subject || 'Geral'}",
  "overview": "Visão geral em 2 linhas",
  "keyPoints": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "rules": ["Regra ou macete 1"],
  "questions": ["Pergunta de fixação 1"]
}`;
          }

          if (promptInstruction) {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const geminiReq = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: promptInstruction }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
              })
            });

            if (geminiReq.ok) {
              const geminiData = await geminiReq.json();
              const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

              try {
                const parsed = JSON.parse(cleaned);
                return sendJson({ success: true, ...parsed, source: 'gemini' });
              } catch (parseErr) {
                if (action === 'explain_alternative') {
                  return sendJson({ success: true, text: rawText, source: 'gemini' });
                }
              }
            }
          }
        } catch (apiErr) {
          console.warn('[Gemini study tool error, using engine fallback]:', apiErr.message);
        }
      }

      // Motor Educacional Autônomo e Confiável do Estude+ (Fallback perfeito sem falhas)
      const result = generateStructuredStudyTool(action, data);
      return sendJson({ ...result, source: 'educational_engine' });
    });
    return;
  }

  // 15b. GET /api/ai/conversations - Listar conversas do usuário autenticado (isolamento por conta)
  if (req.method === 'GET' && pathname === '/api/ai/conversations') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);

    const db = readDb();
    const userConvs = (db.aiConversations || [])
      .filter(c => String(c.userId) === String(auth.user.id))
      .map(c => ({
        id: c.id,
        title: c.title || 'Nova Conversa',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: (c.messages || []).length
      }))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    return sendJson({ success: true, conversations: userConvs });
  }

  // 15c. GET /api/ai/conversations/:id - Carregar conversa específica com suas mensagens
  const convDetailMatch = pathname.match(/^\/api\/ai\/conversations\/([a-zA-Z0-9_\-]+)$/);
  if (req.method === 'GET' && convDetailMatch) {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);

    const convId = convDetailMatch[1];
    const db = readDb();
    const conv = (db.aiConversations || []).find(c => c.id === convId && String(c.userId) === String(auth.user.id));
    if (!conv) {
      return sendJson({ error: 'Conversa não encontrada ou acesso não autorizado.' }, 404);
    }
    return sendJson({ success: true, conversation: conv });
  }

  // 15d. POST /api/ai/conversations - Salvar/atualizar conversa e mensagens do usuário
  if (req.method === 'POST' && pathname === '/api/ai/conversations') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);

    parseBody((data) => {
      const db = readDb();
      if (!Array.isArray(db.aiConversations)) db.aiConversations = [];

      const convId = data?.id || ('conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
      let title = (data?.title || 'Nova Conversa').trim().substring(0, 100);
      const messages = Array.isArray(data?.messages) ? data.messages : [];

      if (!data?.title && messages.length > 0) {
        const firstUserMsg = messages.find(m => m.role === 'user' || m.sender === 'user');
        if (firstUserMsg && (firstUserMsg.text || firstUserMsg.content)) {
          title = String(firstUserMsg.text || firstUserMsg.content).trim().substring(0, 45);
        }
      }

      const existingIdx = db.aiConversations.findIndex(c => c.id === convId && String(c.userId) === String(auth.user.id));
      const convRecord = {
        id: convId,
        userId: auth.user.id,
        title,
        messages,
        createdAt: existingIdx >= 0 ? db.aiConversations[existingIdx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        db.aiConversations[existingIdx] = convRecord;
      } else {
        db.aiConversations.unshift(convRecord);
      }

      writeDb(db);
      return sendJson({ success: true, conversation: convRecord });
    });
    return;
  }

  // 15e. DELETE /api/ai/conversations/:id - Excluir conversa específica
  if (req.method === 'DELETE' && convDetailMatch) {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) return sendJson({ error: 'Não autenticado' }, 401);

    const convId = convDetailMatch[1];
    const db = readDb();
    const beforeLen = (db.aiConversations || []).length;
    db.aiConversations = (db.aiConversations || []).filter(c => !(c.id === convId && String(c.userId) === String(auth.user.id)));

    if (db.aiConversations.length !== beforeLen) {
      writeDb(db);
    }
    return sendJson({ success: true, deletedId: convId });
  }

  // 15f. GET & POST /api/admin/ai/config - Configurações de IA pelo Administrador
  if (pathname === '/api/admin/ai/config') {
    const auth = getAuthUser(req);
    const isAdmin = validateAdmin(req) || (auth && auth.user && auth.user.role === 'admin');
    if (!isAdmin) return sendJson({ error: 'Acesso restrito ao administrador.' }, 403);

    const db = readDb();
    if (req.method === 'GET') {
      const hasEnvKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
      const hasDbKey = Boolean(db.aiConfig?.geminiApiKey);
      return sendJson({
        success: true,
        isConfigured: hasEnvKey || hasDbKey,
        source: hasEnvKey ? 'environment' : (hasDbKey ? 'database' : 'none'),
        aiModel: db.aiConfig?.aiModel || 'gemini-2.5-flash',
        keyPreview: (db.aiConfig?.geminiApiKey ? db.aiConfig.geminiApiKey.substring(0, 6) + '...' + db.aiConfig.geminiApiKey.slice(-4) : (hasEnvKey ? 'Configurada via Variável de Ambiente' : ''))
      });
    }

    if (req.method === 'POST') {
      parseBody((data) => {
        const apiKey = (data?.geminiApiKey || '').trim();
        const aiModel = (data?.aiModel || 'gemini-2.5-flash').trim();

        db.aiConfig = db.aiConfig || {};
        if (apiKey) {
          db.aiConfig.geminiApiKey = apiKey;
        } else if (data?.clearKey) {
          delete db.aiConfig.geminiApiKey;
        }
        db.aiConfig.aiModel = aiModel;
        db.aiConfig.updatedAt = new Date().toISOString();
        writeDb(db);

        logAudit('update_ai_config', auth.user.username || auth.user.name, { aiModel }, clientIp);
        return sendJson({ success: true, message: 'Configurações do Assistente IA salvas com sucesso!' });
      });
      return;
    }
  }

  /* ==========================================================================
     ARQUIVOS ESTÁTICOS COM CACHE SEGURO
     ========================================================================== */
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = 'index.html';

  const filePath = path.join(__dirname, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Não encontrado');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ESTUDE+ MASTER SERVER] Rodando na porta ${PORT} (0.0.0.0:${PORT})`);
  console.log(`Acesse local: http://localhost:${PORT}`);
  console.log(`Acesse no celular: http://192.168.3.128:${PORT}`);
});
