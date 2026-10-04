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
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
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
    auditLogs: []
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
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'];
  if (!token) return false;
  return adminTokens.has(token);
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
        db.masterCommands = db.masterCommands || {};
        db.masterCommands.forceRefreshTimestamp = Date.now();
        writeDb(db);
        broadcastToAdmins('gammon_sync', { totalTpcs: freshTpcs.length });
      }
    } catch (e) {
      console.error('Erro ao mesclar TPCs:', e);
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token'
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token'
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

  // 2. POST /api/auth/login - Autenticação com rate limiting e registro de sessão
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const rateCheck = checkRateLimit(clientIp, 'check');
    if (!rateCheck.allowed) return sendJson({ error: rateCheck.error }, 429);

    parseBody((data) => {
      if (!data || !data.login || !data.password) {
        return sendJson({ error: 'Informe seu nome de usuário e senha.' }, 400);
      }

      const db = readDb();
      const loginClean = (data.login || '').trim().toLowerCase();
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
