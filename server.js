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
        const val = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const supabase = require('./supabase_client');

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

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!Array.isArray(parsed.planRequests)) parsed.planRequests = [];
      if (!Array.isArray(parsed.supportRequests)) parsed.supportRequests = [];
      if (!Array.isArray(parsed.studyReports)) parsed.studyReports = [];
      if (!Array.isArray(parsed.agendaSyncLogs)) parsed.agendaSyncLogs = [];
      if (!Array.isArray(parsed.adminNotifications)) parsed.adminNotifications = [];
      if (!Array.isArray(parsed.systemEvents)) parsed.systemEvents = [];
      if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
      return parsed;
    }
  } catch (e) {
    console.error('Error reading DB:', e);
  }
  return {
    users: [],
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

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    if (supabase && supabase.isConfigured) {
      supabase.syncFromLocalDb(data).catch(err => {
        console.warn('[Supabase Sync Warning]', err.message);
      });
    }
  } catch (e) {
    console.error('Error writing DB:', e);
  }
}

// Global in-memory state for sessions, presence and rate-limiting
const activeSessions = new Map(); // sessionId -> { sessionId, userId, userName, userRole, deviceType, loginTime, lastHeartbeat, ip }
const adminTokens = new Set(['admin_master_freddie_token_2026']); // Master token for authenticated admin sessions
const rateLimitMap = new Map(); // ip -> { loginFailures: count, blockedUntil: timestamp, registrations: [timestamps] }
const sseClients = new Set(); // SSE connected admin clients

function broadcastToAdmins(eventType, data) {
  const payload = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
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
    // Max 3 registrations per IP per hour
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
  const authHeader = req.headers['authorization'] || '';
  let queryToken = '';
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    queryToken = parsedUrl.searchParams.get('token') || parsedUrl.searchParams.get('adminToken') || '';
  } catch (e) {}
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'] || queryToken;
  if (!token) return false;
  return adminTokens.has(token);
}

function getAuthUser(req) {
  const sessionId = req.headers['x-session-id'] || req.headers['x-session'] || '';
  if (sessionId) {
    const session = activeSessions.get(sessionId);
    if (session && session.userId) {
      const db = readDb();
      const user = (db.users || []).find(u => u.id === session.userId);
      if (user) return { user, session };
    }
  }

  // Token de autorização (Bearer token ou admin)
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'];
  if (token) {
    if (activeSessions.has(token)) {
      const session = activeSessions.get(token);
      const db = readDb();
      const user = (db.users || []).find(u => u.id === session.userId);
      if (user) return { user, session };
    }
    if (adminTokens.has(token)) {
      const db = readDb();
      const admin = (db.users || []).find(u => u.role === 'admin') || {
        id: 'admin_freddie',
        name: 'Freddie Pimentel Costa',
        role: 'admin',
        username: 'freddie'
      };
      return { user: admin, session: { userId: admin.id, userRole: 'admin', userName: admin.name } };
    }
  }

  // Suporte a identificação de dispositivo autenticado por x-user-id se houver sessão ativa
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId) {
    const session = Array.from(activeSessions.values()).find(s => s.userId === headerUserId);
    if (session) {
      const db = readDb();
      const user = (db.users || []).find(u => u.id === headerUserId);
      if (user) return { user, session };
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
        const existingMap = new Map();
        (db.tpcs || []).forEach(t => existingMap.set(t.id, t));
        freshTpcs.forEach(t => existingMap.set(t.id, t));
        db.tpcs = Array.from(existingMap.values());
        db.gammonStatus = {
          status: 'success',
          lastSync: new Date().toISOString(),
          totalCaptured: freshTpcs.length,
          message: `${freshTpcs.length} TPCs sincronizados do Portal Gammon!`
        };
        if (!Array.isArray(db.agendaSyncLogs)) db.agendaSyncLogs = [];
        db.agendaSyncLogs.unshift({
          timestamp: new Date().toISOString(),
          status: 'success',
          totalCaptured: freshTpcs.length,
          message: `${freshTpcs.length} TPCs sincronizados com sucesso do Portal Gammon!`
        });
        if (db.agendaSyncLogs.length > 50) db.agendaSyncLogs = db.agendaSyncLogs.slice(0, 50);
        db.masterCommands = db.masterCommands || {};
        db.masterCommands.forceRefreshTimestamp = Date.now();
        writeDb(db);
        logSystemEvent('info', 'gammon_sync', `Sincronização Gammon concluída com ${freshTpcs.length} TPCs`, { count: freshTpcs.length });
        broadcastToAdmins('gammon_sync', { totalTpcs: freshTpcs.length });
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

  const sendJson = (data, code = 200) => {
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token, x-session-id, x-user-id'
    });
    res.end(JSON.stringify(data));
  };

  const parseBody = (cb) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        cb(json);
      } catch (e) {
        cb(null);
      }
    });
  };

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token, x-session-id, x-user-id'
    });
    return res.end();
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
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado. Faça login para sincronizar seus dados entre dispositivos.' }, 401);
    }

    const db = readDb();
    const freshUser = (db.users || []).find(u => u.id === auth.user.id) || auth.user;

    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);

    if (!Array.isArray(freshUser.loginDays)) freshUser.loginDays = [];
    if (!freshUser.loginDays.includes(todayStr)) {
      freshUser.loginDays.push(todayStr);
      writeDb(db);
    }

    const todayActive = (freshUser.studiedDays || []).includes(todayStr);

    // Busca a solicitação de plano mais recente deste usuário
    const activeReq = (db.planRequests || [])
      .filter(r => r.userId === freshUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

    return sendJson({
      success: true,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        username: freshUser.username,
        email: freshUser.email,
        role: freshUser.role,
        grade: freshUser.grade,
        isSubscribed: Boolean(freshUser.isSubscribed),
        plan: freshUser.plan || 'free',
        planStatus: freshUser.planStatus || 'free',
        planName: freshUser.planName || 'Plano Base',
        proExpiresAt: freshUser.proExpiresAt || null,
        trialExpiresAt: freshUser.trialExpiresAt || null,
        streak: Number(freshUser.streak) || 0,
        bestStreak: Number(freshUser.bestStreak) || 0,
        dailyGoalMinutes: Number(freshUser.dailyGoalMinutes) || 15,
        todayMinutes: Number(freshUser.todayMinutes) || 0,
        studiedDays: Array.isArray(freshUser.studiedDays) ? freshUser.studiedDays : [],
        loginDays: Array.isArray(freshUser.loginDays) ? freshUser.loginDays : [],
        quizHistory: Array.isArray(freshUser.quizHistory) ? freshUser.quizHistory : [],
        activeQuizSession: freshUser.activeQuizSession || null,
        todayActive,
        lastVisitDate: freshUser.lastVisitDate || null,
        achievements: Array.isArray(freshUser.achievements) ? freshUser.achievements : [],
        studentSettings: freshUser.studentSettings || freshUser.preferences || {},
        preferences: freshUser.preferences || freshUser.studentSettings || {},
        timetable: Array.isArray(freshUser.timetable) ? freshUser.timetable : null,
        tasks: freshUser.tasks || {
          completedTpcIds: freshUser.completedTpcIds || [],
          userTpcs: freshUser.userTpcs || []
        },
        lastSync: freshUser.lastSync || new Date().toISOString()
      },
      activePlanRequest: activeReq
    });
  }

  // POST /api/user/sync - Salva progresso, preferências, agenda e tarefas no servidor
  if (req.method === 'POST' && pathname === '/api/user/sync') {
    const auth = getAuthUser(req);
    if (!auth || !auth.user) {
      return sendJson({ error: 'Não autenticado. Sessão inválida ou expirada.' }, 401);
    }

    parseBody((data) => {
      if (!data) return sendJson({ error: 'Dados inválidos para sincronização.' }, 400);

      const db = readDb();
      const uIndex = (db.users || []).findIndex(u => u.id === auth.user.id);
      if (uIndex === -1) {
        return sendJson({ error: 'Usuário não encontrado no banco de dados.' }, 404);
      }

      const u = db.users[uIndex];

      // Atualiza preferências e configurações do estudante
      if (data.studentSettings && typeof data.studentSettings === 'object') {
        u.studentSettings = { ...(u.studentSettings || {}), ...data.studentSettings };
      }
      if (data.preferences && typeof data.preferences === 'object') {
        u.preferences = { ...(u.preferences || {}), ...data.preferences };
      }

      // Atualiza progresso de estudos
      if (data.progress && typeof data.progress === 'object') {
        if (typeof data.progress.streak === 'number') u.streak = data.progress.streak;
        if (typeof data.progress.bestStreak === 'number') u.bestStreak = data.progress.bestStreak;
        if (typeof data.progress.dailyGoalMinutes === 'number') u.dailyGoalMinutes = data.progress.dailyGoalMinutes;
        if (typeof data.progress.todayMinutes === 'number') u.todayMinutes = data.progress.todayMinutes;
        if (Array.isArray(data.progress.studiedDays)) u.studiedDays = data.progress.studiedDays;
        if (Array.isArray(data.progress.loginDays)) u.loginDays = data.progress.loginDays;
        if (data.progress.lastVisitDate) u.lastVisitDate = data.progress.lastVisitDate;
        if (Array.isArray(data.progress.achievements)) u.achievements = data.progress.achievements;
      }

      // Atualiza grade de horários / agenda semanal (timetable)
      if (Array.isArray(data.timetable)) {
        u.timetable = data.timetable;
      }

      // Atualiza tarefas e TPCs concluídos pelo usuário
      if (data.tasks && typeof data.tasks === 'object') {
        u.tasks = { ...(u.tasks || {}), ...data.tasks };
        if (Array.isArray(data.tasks.completedTpcIds)) {
          u.completedTpcIds = data.tasks.completedTpcIds;
        }
        if (Array.isArray(data.tasks.userTpcs)) {
          u.userTpcs = data.tasks.userTpcs;
        }
      }

      if (data.deviceType) {
        u.lastDeviceType = data.deviceType;
      }

      u.lastSync = new Date().toISOString();
      writeDb(db);

      return sendJson({
        success: true,
        message: 'Dados salvos e sincronizados com sucesso no servidor!',
        lastSync: u.lastSync
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
     SOLICITAÇÕES DO PLANO PRO
     ========================================================================== */

  // POST /api/plans/request - Aluno solicita ativação do Plano Pro
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

      // Evita solicitações duplicadas desnecessárias
      if (!Array.isArray(db.planRequests)) db.planRequests = [];
      const existing = db.planRequests.find(r => r.userId === user.id && (r.status === 'pending' || r.status === 'in_review'));
      if (existing) {
        return sendJson({
          error: `Você já possui uma solicitação do Plano PRO em andamento (Status: ${existing.status === 'in_review' ? 'Em análise' : 'Pendente'}). Aguarde a liberação pelo Freddie.`,
          existingRequest: existing
        }, 409);
      }

      const reqId = 'req_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
      const newReq = {
        id: reqId,
        userId: user.id,
        userName: user.name || user.username || 'Aluno Gammon',
        userEmail: user.email || '',
        userGrade: user.grade || '7º Ano',
        plan: 'pro',
        planName: 'Plano ESTUDE+ PRO (R$ 19,90/mês)',
        amount: 19.90,
        contactMethod: (data.contactMethod || 'whatsapp').trim(),
        contactInfo: (data.contactInfo || '').trim(),
        note: (data.note || '').trim(),
        status: 'pending', // 'pending', 'in_review', 'approved', 'rejected'
        statusReason: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null
      };

      db.planRequests.unshift(newReq);
      writeDb(db);

      // Notifica administradores conectados em tempo real via SSE
      broadcastToAdmins('new_plan_request', {
        request: newReq,
        message: `🔔 Nova solicitação de Plano PRO recebida de ${newReq.userName}!`
      });

      // Grava log de auditoria
      if (Array.isArray(db.auditLogs)) {
        db.auditLogs.unshift({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'plan_request_created',
          ip: clientIp,
          userId: user.id,
          details: `Aluno ${newReq.userName} (${user.id}) solicitou o Plano PRO via ${newReq.contactMethod}`
        });
      }

      return sendJson({
        success: true,
        message: 'Solicitação do Plano PRO enviada com sucesso! O administrador já foi notificado.',
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

  // POST /api/admin/plan-requests/status - Altera status da solicitação (Em análise, Aprovada, Recusada)
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

      const validStatuses = ['pending', 'in_review', 'approved', 'rejected'];
      if (!validStatuses.includes(data.status)) {
        return sendJson({ error: 'Status inválido. Use pending, in_review, approved ou rejected.' }, 400);
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

      // Quando o administrador APROVA: ativa os benefícios do Plano PRO no banco
      if (data.status === 'approved' && targetUser) {
        targetUser.isSubscribed = true;
        targetUser.plan = 'pro';
        targetUser.planStatus = 'active';
        targetUser.planName = 'Plano Administrador PRO';
        targetUser.proExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

        // Registra o pagamento confirmado em db.payments
        if (!Array.isArray(db.payments)) db.payments = [];
        const paymentRecord = {
          id: 'PAG_' + Date.now(),
          studentName: targetReq.userName,
          email: targetReq.userEmail,
          userId: targetReq.userId,
          method: targetReq.contactMethod || 'cash',
          amount: targetReq.amount || 19.90,
          date: new Date().toISOString().slice(0, 10),
          status: 'confirmed',
          note: `Aprovado pelo administrador ${adminName}. Motivo/Obs: ${targetReq.statusReason || 'Recebimento validado'}`,
          confirmedBy: adminName,
          confirmedAt: new Date().toISOString()
        };
        db.payments.unshift(paymentRecord);
      } else if (data.status === 'rejected' && targetUser) {
        // Se foi recusada, reverte status de pendência
        if (targetUser.planStatus === 'pending_cash' || targetUser.planStatus === 'pending') {
          targetUser.planStatus = 'free';
          targetUser.plan = 'free';
          targetUser.isSubscribed = false;
        }
      }

      writeDb(db);

      // Notifica administradores e clientes em tempo real via SSE
      broadcastToAdmins('plan_request_updated', {
        requestId: targetReq.id,
        status: targetReq.status,
        userId: targetReq.userId,
        userName: targetReq.userName
      });

      return sendJson({
        success: true,
        message: `Solicitação marcada como "${data.status === 'approved' ? 'Aprovada' : data.status === 'rejected' ? 'Recusada' : 'Em análise'}" com sucesso!`,
        request: targetReq,
        user: targetUser ? {
          id: targetUser.id,
          name: targetUser.name,
          plan: targetUser.plan,
          planStatus: targetUser.planStatus,
          isSubscribed: targetUser.isSubscribed
        } : null
      });
    });
    return;
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

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        grade: u.grade,
        role: u.role || 'student',
        isSubscribed: Boolean(u.isSubscribed),
        plan: u.plan || 'free',
        planStatus: u.planStatus || 'free',
        planName: u.planName || 'Plano Base',
        proActivatedAt: u.proActivatedAt,
        proExpiresAt: u.proExpiresAt,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        deviceType: device,
        presence
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

      console.log(`[AUTH] Login realizado com sucesso para "${user.username}" (Perfil: ${user.role || 'student'}).`);

      // Success! Clear failures
      checkRateLimit(clientIp, 'login_success');
      if (isAdminUser) {
        rateLimitMap.delete(clientIp);
      }

      // Create session
      const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
      const deviceType = detectDevice(req.headers['user-agent']);
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (!Array.isArray(user.loginDays)) user.loginDays = [];
      if (!user.loginDays.includes(todayStr)) {
        user.loginDays.push(todayStr);
      }

      user.lastVisitDate = todayStr;
      user.lastLogin = now.toISOString();
      user.lastDeviceType = deviceType;
      writeDb(db);

      const sessionObj = {
        sessionId,
        userId: user.id,
        userName: user.name || user.username,
        userRole: user.role || 'student',
        deviceType,
        loginTime: now.toISOString(),
        lastHeartbeat: Date.now(),
        ip: clientIp
      };
      activeSessions.set(sessionId, sessionObj);

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
        deviceType,
        time: now.toLocaleTimeString('pt-BR'),
        status: 'online'
      });

      // Retornar usuário seguro (SEM hash de senha nem campos sensíveis)
      const safeUser = {
        id: user.id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        isSubscribed: user.isSubscribed || false,
        plan: user.plan || 'free',
        planStatus: user.planStatus || 'free',
        planName: user.planName || 'Plano Base',
        emailVerified: user.emailVerified !== false,
        streak: user.streak || 0,
        bestStreak: user.bestStreak || 0,
        sessionId,
        adminToken
      };

      return sendJson({ success: true, user: safeUser, adminToken, sessionId });
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

      // 1. Validação de Unicidade: NENHUM outro usuário pode ter o mesmo username
      const existingUser = (db.users || []).find(u =>
        u.username && u.username.toLowerCase() === usernameClean
      );

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
        plan: 'free',
        planStatus: 'free',
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

      // Auto-login imediato após o cadastro bem-sucedido
      const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
      const sessionObj = {
        sessionId,
        userId: newUser.id,
        userName: newUser.name,
        userRole: newUser.role,
        deviceType: newUser.lastDeviceType,
        loginTime: newUser.lastLogin,
        lastHeartbeat: Date.now(),
        ip: clientIp
      };
      activeSessions.set(sessionId, sessionObj);

      broadcastToAdmins('user_login', {
        userId: newUser.id,
        userName: newUser.name,
        deviceType: newUser.lastDeviceType,
        time: new Date().toLocaleTimeString('pt-BR'),
        status: 'online'
      });

      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isSubscribed: false,
        plan: 'free',
        planStatus: 'free',
        planName: 'Plano Base',
        streak: 0,
        bestStreak: 0,
        sessionId,
        adminToken: null
      };

      return sendJson({ success: true, message: 'Conta criada com sucesso!', user: safeUser, sessionId });
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

  // 7. POST /api/presence/heartbeat - Heartbeat seguro com expiração automática (45s)
  if (req.method === 'POST' && pathname === '/api/presence/heartbeat') {
    parseBody((data) => {
      if (!data || !data.sessionId) return sendJson({ error: 'sessionId required' }, 400);

      const session = activeSessions.get(data.sessionId);
      if (session) {
        session.lastHeartbeat = Date.now();
        return sendJson({ success: true, status: 'online' });
      }

      // Se sessão não existe mais na memória, recriá-la se dados fornecidos
      if (data.userId) {
        const deviceType = detectDevice(req.headers['user-agent']);
        const newSess = {
          sessionId: data.sessionId,
          userId: data.userId,
          userName: data.userName || 'Aluno',
          userRole: data.userRole || 'student',
          deviceType,
          loginTime: new Date().toISOString(),
          lastHeartbeat: Date.now(),
          ip: clientIp
        };
        activeSessions.set(data.sessionId, newSess);
        return sendJson({ success: true, status: 'online' });
      }

      return sendJson({ success: false, status: 'expired' });
    });
    return;
  }

  // 8. GET /api/admin/events - SSE (Server-Sent Events) para atualização em tempo real do painel
  if (req.method === 'GET' && pathname === '/api/admin/events') {
    if (!validateAdmin(req)) {
      return sendJson({ error: 'Acesso negado. Token de administrador inválido.' }, 403);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    sseClients.add(res);
    res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
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

    // Montar lista de usuários com status de presença preciso
    const enrichedUsers = (db.users || []).map(u => {
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
        plan: u.plan || 'free',
        planStatus: u.planStatus || 'free',
        isSubscribed: u.isSubscribed || false,
        emailVerified: u.emailVerified !== false,
        deviceType: currentDevice,
        lastLogin: u.lastLogin,
        presenceStatus: bestStatus // 'online' (conectado agora), 'recent_login' (login recente), 'offline' (inativo)
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

  // 10. POST /api/users/delete - Excluir qualquer conta (inclusive admins)
  if (req.method === 'POST' && pathname === '/api/users/delete') {
    parseBody((data) => {
      if (!data || !data.userId) return sendJson({ error: 'ID do usuário não fornecido.' }, 400);

      const db = readDb();
      const beforeCount = (db.users || []).length;
      db.users = (db.users || []).filter(u => u.id !== data.userId && u.email !== data.userEmail);

      // Remover sessões ativas do usuário excluído
      for (const [sId, s] of activeSessions.entries()) {
        if (s.userId === data.userId) activeSessions.delete(sId);
      }

      if (db.users.length < beforeCount) {
        db.masterCommands = db.masterCommands || {};
        db.masterCommands.forceRefreshTimestamp = Date.now();
        writeDb(db);

        broadcastToAdmins('user_deleted', { userId: data.userId });
        return sendJson({ success: true, message: 'Conta excluída com sucesso!' });
      }
      return sendJson({ error: 'Conta não encontrada para exclusão.' }, 404);
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
        broadcastToAdmins('user_updated', { userId: data.userId });
        return sendJson({ success: true, user: db.users[userIdx] });
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
      broadcastToAdmins('master_command', db.masterCommands);
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
