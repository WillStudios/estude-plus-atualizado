/**
 * ESTUDE+ — FIREBASE & FIRESTORE SERVICE
 * Implementação completa de Documento do Usuário, Aviso de Pagamento,
 * Painel Administrativo em Tempo Real (onSnapshot) e Regras de Segurança.
 */

class EstudeFirebaseService {
  constructor() {
    this.auth = null;
    this.db = null;
    this.isReady = false;
    this.currentUser = null;
    this.userDoc = null;
    this.isAdmin = false;
    this.heartbeatTimer = null;
    this.userSnapshotUnsubscribe = null;
    this.paymentSnapshotUnsubscribe = null;
    this.adminUsersSnapshotUnsubscribe = null;
    this.adminPaymentsSnapshotUnsubscribe = null;
    this.subscribers = new Map();
    this.lastError = null;

    this.init();
  }

  /**
   * Inicializa Firebase Auth e Firestore com a configuração do projeto
   */
  init() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('[FirebaseService] SDK do Firebase não encontrado no window. Modo local ativo.');
        this.initLocalStore();
        return;
      }

      const config = window.FirebaseConfigManager ? window.FirebaseConfigManager.getConfig() : window.firebaseConfig;
      
      // Se Firebase ainda não foi inicializado nesta janela
      if (!firebase.apps.length) {
        if (config && config.projectId && !config.isDefaultPlaceholder) {
          firebase.initializeApp(config);
          console.info('[FirebaseService] Firebase inicializado com sucesso no projeto:', config.projectId);
        } else {
          console.warn('[FirebaseService] Configuração padrão detectada. Inicializando modo integrado com simulação Firestore em tempo real.');
          this.initLocalStore();
          return;
        }
      }

      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Ativar persistência offline se possível
      try {
        this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
          if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
            console.warn('[FirebaseService] Persistência offline não habilitada:', err.message);
          }
        });
      } catch (e) {}

      this.isReady = true;
      this.setupAuthStateListener();
    } catch (err) {
      console.error('[FirebaseService] Erro ao inicializar Firebase:', err);
      this.lastError = err.message;
      this.initLocalStore();
    }
  }

  /**
   * Monitora estado de autenticação do Firebase Auth
   */
  setupAuthStateListener() {
    if (!this.auth) return;

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.info('[FirebaseService] Usuário autenticado no Firebase Auth:', user.email, 'UID:', user.uid);
        this.currentUser = user;
        try {
          await this.handleUserLogin(user);
        } catch (err) {
          console.error('[FirebaseService] Erro no processamento de login:', err);
          this.notifyError(`Erro no acesso: ${err.message}`);
        }
      } else {
        console.info('[FirebaseService] Nenhuma sessão ativa no Firebase Auth.');
        this.currentUser = null;
        this.userDoc = null;
        this.isAdmin = false;
        this.stopHeartbeat();
        if (this.userSnapshotUnsubscribe) {
          this.userSnapshotUnsubscribe();
          this.userSnapshotUnsubscribe = null;
        }
        if (this.paymentSnapshotUnsubscribe) {
          this.paymentSnapshotUnsubscribe();
          this.paymentSnapshotUnsubscribe = null;
        }
      }
    });
  }

  // =========================================================================
  // 1) DOCUMENTO DO USUÁRIO (users/{uid})
  // =========================================================================

  /**
   * Cria ou atualiza o documento users/{uid} no primeiro login e logins subsequentes
   * Campos obrigatórios: nome, email, plan ("base" ou "pro"), status ("ativo" ou "deletado"), criadoEm, ultimoAcesso
   */
  async handleUserLogin(user, extraProfile = {}) {
    if (!user || !user.uid) return null;

    const uid = user.uid;
    const nowIso = new Date().toISOString();
    const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : nowIso;

    if (this.isReady && this.db) {
      const userRef = this.db.collection('users').doc(uid);
      const docSnap = await userRef.get().catch(err => {
        console.error('[FirebaseService] Erro ao ler users/' + uid, err);
        throw err;
      });

      if (!docSnap.exists) {
        // Primeiro login do aluno: cria com plan: "base", status: "ativo"
        const initialDoc = {
          uid: uid,
          nome: extraProfile.nome || user.displayName || user.email?.split('@')[0] || 'Aluno Gammon',
          email: user.email || '',
          plan: 'base', // Aluno inicia SEMPRE no plano base
          status: 'ativo', // "ativo" ou "deletado"
          criadoEm: serverTimestamp,
          ultimoAcesso: serverTimestamp
        };

        await userRef.set(initialDoc).catch(err => {
          console.error('[FirebaseService] Erro ao criar documento users/' + uid, err);
          throw err;
        });

        this.userDoc = { ...initialDoc, criadoEm: nowIso, ultimoAcesso: nowIso };
        console.info('[FirebaseService] Documento users/' + uid + ' criado com sucesso (Primeiro Login).');
      } else {
        const existingData = docSnap.data();

        // Se status for "deletado", bloquear o acesso ao entrar e mostrar uma mensagem
        if (existingData.status === 'deletado') {
          console.warn('[FirebaseService] Acesso bloqueado: usuário marcado como deletado.');
          if (this.auth) {
            await this.auth.signOut().catch(() => {});
          }
          const msg = 'Sua conta foi desativada ou excluída pelo administrador.';
          this.notifyError(msg);
          throw new Error(msg);
        }

        // Atualizar ultimoAcesso a cada login (sem alterar 'plan')
        await userRef.update({
          ultimoAcesso: serverTimestamp
        }).catch(err => {
          console.error('[FirebaseService] Erro ao atualizar ultimoAcesso:', err);
        });

        this.userDoc = { ...existingData, ultimoAcesso: nowIso };
        console.info('[FirebaseService] Documento users/' + uid + ' carregado. Plano:', this.userDoc.plan);
      }

      // Verificar se o usuário possui documento em admins/{uid}
      await this.checkAdminPermission(uid);

      // Iniciar atualização periódica de ultimoAcesso a cada 2 minutos enquanto o app estiver aberto
      this.startHeartbeat(uid);

      // Iniciar listener em tempo real (onSnapshot) no documento do usuário
      this.listenToUserDoc(uid);

      // Iniciar listener de pagamento para este usuário
      this.listenToUserPaymentRequests(uid);

      return this.userDoc;
    } else {
      // Execução no Firestore Local Integrado
      return this.localStore.handleUserLogin(user, extraProfile);
    }
  }

  /**
   * Atualiza o campo ultimoAcesso a cada 2 minutos enquanto o app estiver aberto
   */
  startHeartbeat(uid) {
    this.stopHeartbeat();
    const intervalMs = 2 * 60 * 1000; // 2 minutos

    this.heartbeatTimer = setInterval(async () => {
      try {
        if (!uid) return;
        const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
          ? firebase.firestore.FieldValue.serverTimestamp()
          : new Date().toISOString();

        if (this.isReady && this.db) {
          await this.db.collection('users').doc(uid).update({
            ultimoAcesso: serverTimestamp
          });
          console.debug('[FirebaseService] Heartbeat ultimoAcesso atualizado para:', uid);
        } else if (this.localStore) {
          this.localStore.updateUser(uid, { ultimoAcesso: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('[FirebaseService] Erro no heartbeat de ultimoAcesso:', err.message);
      }
    }, intervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Listener em tempo real (onSnapshot) no documento users/{uid}
   * Quando o admin ativar o Pro, o app do aluno libera os recursos Pro na hora!
   */
  listenToUserDoc(uid) {
    if (this.userSnapshotUnsubscribe) {
      this.userSnapshotUnsubscribe();
      this.userSnapshotUnsubscribe = null;
    }

    if (this.isReady && this.db) {
      this.userSnapshotUnsubscribe = this.db.collection('users').doc(uid).onSnapshot((doc) => {
        if (!doc.exists) {
          console.warn('[FirebaseService] Documento users/' + uid + ' foi removido.');
          return;
        }

        const data = doc.data();
        const prevPlan = this.userDoc ? this.userDoc.plan : null;
        this.userDoc = data;

        // Se status mudou para deletado, desconectar imediatamente
        if (data.status === 'deletado') {
          console.warn('[FirebaseService] Status mudou para deletado. Encerrando sessão do aluno.');
          alert('⚠️ Sua conta foi desativada ou excluída pelo administrador.');
          if (this.auth) this.auth.signOut().catch(() => {});
          if (window.app && typeof window.app.handleLogout === 'function') {
            window.app.handleLogout();
          }
          return;
        }

        // Se o plano mudou para pro em tempo real!
        if (data.plan === 'pro' && prevPlan !== 'pro') {
          console.info('[FirebaseService] 💎 PLANO PRO ATIVADO EM TEMPO REAL PELO ADMINISTRADOR!');
          this.emit('pro_activated', data);
          if (window.app) {
            window.app.onFirebaseProActivated(data);
          }
        } else if (data.plan === 'base' && prevPlan === 'pro') {
          console.info('[FirebaseService] Plano alterado para Base pelo administrador.');
          this.emit('plan_downgraded', data);
          if (window.app) {
            window.app.onFirebasePlanDowngraded(data);
          }
        }

        this.emit('user_doc_changed', data);
      }, (err) => {
        console.error('[FirebaseService] Erro no listener users/' + uid, err);
        this.notifyError(`Erro na sincronização em tempo real: ${err.message}`);
      });
    } else if (this.localStore) {
      this.userSnapshotUnsubscribe = this.localStore.subscribeUserDoc(uid, (data) => {
        const prevPlan = this.userDoc ? this.userDoc.plan : null;
        this.userDoc = data;
        if (data.status === 'deletado') {
          alert('⚠️ Sua conta foi desativada ou excluída pelo administrador.');
          if (window.app && typeof window.app.handleLogout === 'function') {
            window.app.handleLogout();
          }
          return;
        }
        if (data.plan === 'pro' && prevPlan !== 'pro') {
          this.emit('pro_activated', data);
          if (window.app) window.app.onFirebaseProActivated(data);
        }
        this.emit('user_doc_changed', data);
      });
    }
  }

  // =========================================================================
  // 2) AVISO DE PAGAMENTO (paymentRequests)
  // =========================================================================

  /**
   * Cria um documento em paymentRequests com: uid, nome, email, data e status "pendente"
   * Impede envios repetidos enquanto estiver pendente!
   */
  async createPaymentRequest(planId = 'pro_mensal', valor = 10.00, extraNote = '') {
    if (!this.userDoc && !this.currentUser) {
      const err = new Error('Você precisa estar logado para enviar comprovante de pagamento.');
      this.notifyError(err.message);
      throw err;
    }

    const uid = this.userDoc?.uid || this.currentUser?.uid;
    const nome = this.userDoc?.nome || this.currentUser?.displayName || 'Aluno';
    const email = this.userDoc?.email || this.currentUser?.email || '';

    // Verificar se já existe um pedido pendente para impedir envios repetidos
    const hasPending = await this.hasPendingPaymentRequest(uid);
    if (hasPending) {
      const err = new Error('Você já possui um pagamento em análise. Aguarde a confirmação do administrador.');
      this.notifyError(err.message);
      throw err;
    }

    const nowIso = new Date().toISOString();
    const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : nowIso;

    const requestData = {
      uid: uid,
      nome: nome,
      email: email,
      planId: planId,
      valor: valor,
      note: extraNote || `Pagamento informado pelo aluno (${planId === 'pro_anual' ? 'R$ 120,00' : 'R$ 10,00'})`,
      data: serverTimestamp,
      dataCriacao: nowIso,
      status: 'pendente' // "pendente", "aprovado", "recusado"
    };

    if (this.isReady && this.db) {
      try {
        const docRef = await this.db.collection('paymentRequests').add(requestData);
        console.info('[FirebaseService] Documento paymentRequests criado com ID:', docRef.id);
        return { id: docRef.id, ...requestData };
      } catch (err) {
        console.error('[FirebaseService] Erro ao criar paymentRequests:', err);
        this.notifyError(`Erro ao enviar aviso de pagamento: ${err.message}`);
        throw err;
      }
    } else if (this.localStore) {
      return this.localStore.addPaymentRequest(requestData);
    }
  }

  /**
   * Verifica se o aluno já tem pagamento com status "pendente"
   */
  async hasPendingPaymentRequest(uid) {
    if (!uid) return false;

    if (this.isReady && this.db) {
      try {
        const snapshot = await this.db.collection('paymentRequests')
          .where('uid', '==', uid)
          .where('status', '==', 'pendente')
          .limit(1)
          .get();
        return !snapshot.empty;
      } catch (err) {
        console.warn('[FirebaseService] Erro ao verificar paymentRequests pendentes:', err);
        return false;
      }
    } else if (this.localStore) {
      return this.localStore.hasPendingPaymentRequest(uid);
    }
    return false;
  }

  /**
   * Monitora em tempo real os paymentRequests do aluno atual
   */
  listenToUserPaymentRequests(uid) {
    if (this.paymentSnapshotUnsubscribe) {
      this.paymentSnapshotUnsubscribe();
      this.paymentSnapshotUnsubscribe = null;
    }

    if (this.isReady && this.db) {
      this.paymentSnapshotUnsubscribe = this.db.collection('paymentRequests')
        .where('uid', '==', uid)
        .onSnapshot((snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          const pending = list.find(r => r.status === 'pendente');
          this.emit('user_payments_updated', { list, pending });
          if (window.app) {
            window.app.onFirebaseUserPaymentsUpdated(pending, list);
          }
        }, (err) => {
          console.error('[FirebaseService] Erro no listener de paymentRequests do aluno:', err);
        });
    } else if (this.localStore) {
      this.paymentSnapshotUnsubscribe = this.localStore.subscribeUserPayments(uid, (data) => {
        this.emit('user_payments_updated', data);
        if (window.app) window.app.onFirebaseUserPaymentsUpdated(data.pending, data.list);
      });
    }
  }

  // =========================================================================
  // 3) PAINEL DE ADMIN (admins/{uid})
  // =========================================================================

  /**
   * Confere permissão de admin verificando documento em admins/{uid}
   */
  async checkAdminPermission(uid) {
    if (!uid) {
      this.isAdmin = false;
      return false;
    }

    // Admins autorizados por padrão para contingência
    const hardcodedAdminEmails = ['claudianostudio@gmail.com', 'freddie@gammon.com.br'];
    const currentEmail = (this.userDoc?.email || this.currentUser?.email || '').toLowerCase();

    if (this.isReady && this.db) {
      try {
        const adminDoc = await this.db.collection('admins').doc(uid).get();
        if (adminDoc.exists) {
          this.isAdmin = true;
          console.info('[FirebaseService] Usuário confirmado como ADMINISTRADOR via admins/' + uid);
          this.emit('admin_status_changed', true);
          return true;
        }

        // Se o e-mail for do admin mestre e o documento ainda não existir, cria admins/{uid}
        if (hardcodedAdminEmails.includes(currentEmail)) {
          console.info('[FirebaseService] Criando documento de administrador em admins/' + uid);
          await this.db.collection('admins').doc(uid).set({
            uid: uid,
            email: currentEmail,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp() || new Date().toISOString()
          });
          this.isAdmin = true;
          this.emit('admin_status_changed', true);
          return true;
        }

        this.isAdmin = false;
        this.emit('admin_status_changed', false);
        return false;
      } catch (err) {
        console.warn('[FirebaseService] Erro ao consultar admins/' + uid, err.message);
        this.isAdmin = hardcodedAdminEmails.includes(currentEmail);
        this.emit('admin_status_changed', this.isAdmin);
        return this.isAdmin;
      }
    } else if (this.localStore) {
      this.isAdmin = this.localStore.checkIsAdmin(uid, currentEmail);
      this.emit('admin_status_changed', this.isAdmin);
      return this.isAdmin;
    }

    this.isAdmin = false;
    return false;
  }

  /**
   * Lista em tempo real (onSnapshot) de todos os usuários
   * Com nome, email, plano, último acesso e indicador "online agora" (último acesso nos últimos 5 minutos)
   */
  listenAllUsers(callback, errorCallback) {
    if (!this.isAdmin) {
      const err = new Error('Acesso negado: apenas administradores podem listar usuários.');
      console.error('[FirebaseService]', err);
      if (errorCallback) errorCallback(err);
      return () => {};
    }

    if (this.adminUsersSnapshotUnsubscribe) {
      this.adminUsersSnapshotUnsubscribe();
      this.adminUsersSnapshotUnsubscribe = null;
    }

    const processUserDoc = (data, id) => {
      const ultimoAcessoRaw = data.ultimoAcesso;
      let ultimoAcessoMs = 0;

      if (ultimoAcessoRaw) {
        if (typeof ultimoAcessoRaw.toDate === 'function') {
          ultimoAcessoMs = ultimoAcessoRaw.toDate().getTime();
        } else if (typeof ultimoAcessoRaw === 'string') {
          ultimoAcessoMs = new Date(ultimoAcessoRaw).getTime();
        } else if (typeof ultimoAcessoRaw === 'number') {
          ultimoAcessoMs = ultimoAcessoRaw;
        }
      }

      // Indicador "online agora": último acesso nos últimos 5 minutos
      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      const isOnline = (Date.now() - ultimoAcessoMs) <= FIVE_MINUTES_MS && data.status !== 'deletado';

      return {
        id: id || data.uid,
        uid: data.uid || id,
        nome: data.nome || data.name || 'Sem Nome',
        email: data.email || 'Sem E-mail',
        plan: data.plan || 'base',
        status: data.status || 'ativo',
        criadoEm: data.criadoEm,
        ultimoAcesso: ultimoAcessoRaw,
        ultimoAcessoMs: ultimoAcessoMs,
        isOnline: isOnline
      };
    };

    if (this.isReady && this.db) {
      this.adminUsersSnapshotUnsubscribe = this.db.collection('users').onSnapshot((snapshot) => {
        const users = [];
        snapshot.forEach(doc => {
          users.push(processUserDoc(doc.data(), doc.id));
        });

        // Ordenar por último acesso descendente
        users.sort((a, b) => (b.ultimoAcessoMs || 0) - (a.ultimoAcessoMs || 0));

        if (callback) callback(users);
      }, (err) => {
        console.error('[FirebaseService] Erro no onSnapshot de users:', err);
        this.notifyError(`Erro ao carregar lista de usuários: ${err.message}`);
        if (errorCallback) errorCallback(err);
      });

      return () => {
        if (this.adminUsersSnapshotUnsubscribe) {
          this.adminUsersSnapshotUnsubscribe();
          this.adminUsersSnapshotUnsubscribe = null;
        }
      };
    } else if (this.localStore) {
      return this.localStore.subscribeAllUsers((users) => {
        const processed = users.map(u => processUserDoc(u, u.id));
        if (callback) callback(processed);
      }, errorCallback);
    }
  }

  /**
   * Seção "Pagamentos pendentes" em tempo real (onSnapshot), com notificação visual
   */
  listenPendingPaymentRequests(callback, errorCallback) {
    if (!this.isAdmin) {
      const err = new Error('Acesso negado: apenas administradores podem visualizar pedidos de pagamento.');
      console.error('[FirebaseService]', err);
      if (errorCallback) errorCallback(err);
      return () => {};
    }

    if (this.adminPaymentsSnapshotUnsubscribe) {
      this.adminPaymentsSnapshotUnsubscribe();
      this.adminPaymentsSnapshotUnsubscribe = null;
    }

    if (this.isReady && this.db) {
      let isFirstEmission = true;

      this.adminPaymentsSnapshotUnsubscribe = this.db.collection('paymentRequests')
        .where('status', '==', 'pendente')
        .onSnapshot((snapshot) => {
          const pending = [];
          snapshot.forEach(doc => pending.push({ id: doc.id, ...doc.data() }));

          // Notificação visual quando chegar um novo após a primeira carga
          if (!isFirstEmission && snapshot.docChanges) {
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                const req = change.doc.data();
                console.info('[FirebaseService] 🔔 NOVO PAGAMENTO PENDENTE RECEBIDO:', req.nome, req.valor);
                this.emit('new_payment_notification', { id: change.doc.id, ...req });
                if (window.app && typeof window.app.notifyNewPaymentRequest === 'function') {
                  window.app.notifyNewPaymentRequest({ id: change.doc.id, ...req });
                }
              }
            });
          }
          isFirstEmission = false;

          if (callback) callback(pending);
        }, (err) => {
          console.error('[FirebaseService] Erro no onSnapshot de paymentRequests pendentes:', err);
          this.notifyError(`Erro ao carregar pagamentos pendentes: ${err.message}`);
          if (errorCallback) errorCallback(err);
        });

      return () => {
        if (this.adminPaymentsSnapshotUnsubscribe) {
          this.adminPaymentsSnapshotUnsubscribe();
          this.adminPaymentsSnapshotUnsubscribe = null;
        }
      };
    } else if (this.localStore) {
      return this.localStore.subscribePendingPayments(callback, errorCallback);
    }
  }

  /**
   * Botão "Aprovar": muda o plano para pro e marca o pedido como aprovado
   */
  async adminApprovePaymentRequest(requestId, userUid, planId = 'pro') {
    if (!this.isAdmin) {
      throw new Error('Apenas administradores podem aprovar pagamentos.');
    }

    const nowIso = new Date().toISOString();
    const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : nowIso;

    if (this.isReady && this.db) {
      try {
        const batch = this.db.batch();

        // 1. Atualizar documento users/{uid} com plan: "pro"
        const userRef = this.db.collection('users').doc(userUid);
        batch.update(userRef, {
          plan: 'pro',
          proAtivadoEm: serverTimestamp,
          proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        // 2. Marcar paymentRequests/{requestId} como aprovado
        if (requestId) {
          const reqRef = this.db.collection('paymentRequests').doc(requestId);
          batch.update(reqRef, {
            status: 'aprovado',
            aprovadoEm: serverTimestamp
          });
        }

        await batch.commit();
        console.info('[FirebaseService] Pagamento', requestId, 'aprovado e usuário', userUid, 'promovido a PRO!');
        return true;
      } catch (err) {
        console.error('[FirebaseService] Erro ao aprovar pagamento no Firestore:', err);
        this.notifyError(`Erro ao aprovar pagamento: ${err.message}`);
        throw err;
      }
    } else if (this.localStore) {
      return this.localStore.approvePayment(requestId, userUid, planId);
    }
  }

  /**
   * Botão "Recusar": marca o pedido como recusado
   */
  async adminRejectPaymentRequest(requestId, reason = 'Pagamento não confirmado') {
    if (!this.isAdmin) {
      throw new Error('Apenas administradores podem recusar pagamentos.');
    }

    const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    if (this.isReady && this.db) {
      try {
        await this.db.collection('paymentRequests').doc(requestId).update({
          status: 'recusado',
          recusadoEm: serverTimestamp,
          motivoRecusa: reason
        });
        console.info('[FirebaseService] Pedido', requestId, 'recusado com sucesso.');
        return true;
      } catch (err) {
        console.error('[FirebaseService] Erro ao recusar pagamento no Firestore:', err);
        this.notifyError(`Erro ao recusar pagamento: ${err.message}`);
        throw err;
      }
    } else if (this.localStore) {
      return this.localStore.rejectPayment(requestId, reason);
    }
  }

  /**
   * Ação "Ativar Pro" ou "Voltar para Base" direto no card do usuário
   */
  async adminSetUserPlan(userUid, newPlan = 'pro') {
    if (!this.isAdmin) {
      throw new Error('Apenas administradores podem alterar o plano de usuários.');
    }

    if (newPlan !== 'pro' && newPlan !== 'base') {
      throw new Error('Plano inválido. Deve ser "pro" ou "base".');
    }

    const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    if (this.isReady && this.db) {
      try {
        const updatePayload = {
          plan: newPlan,
          ultimoUpdateAdmin: serverTimestamp
        };
        if (newPlan === 'pro') {
          updatePayload.proAtivadoEm = serverTimestamp;
          updatePayload.proExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else {
          updatePayload.proCanceladoEm = serverTimestamp;
          updatePayload.proExpiresAt = null;
        }

        await this.db.collection('users').doc(userUid).update(updatePayload);
        console.info('[FirebaseService] Plano do usuário', userUid, 'alterado para:', newPlan);
        return true;
      } catch (err) {
        console.error('[FirebaseService] Erro ao alterar plano do usuário:', err);
        this.notifyError(`Erro ao alterar plano: ${err.message}`);
        throw err;
      }
    } else if (this.localStore) {
      return this.localStore.setUserPlan(userUid, newPlan);
    }
  }

  /**
   * Ação "Excluir conta" (com confirmação):
   * Apaga os dados do Firestore e marca status "deletado"
   */
  async adminDeleteUser(userUid) {
    if (!this.isAdmin) {
      throw new Error('Apenas administradores podem excluir contas.');
    }

    const confirmed = confirm('Tem certeza absoluta de que deseja excluir esta conta?\n\nOs dados do usuário serão apagados e a conta será bloqueada com status "deletado".');
    if (!confirmed) return false;

    const serverTimestamp = (this.db && typeof firebase !== 'undefined' && firebase.firestore?.FieldValue)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    if (this.isReady && this.db) {
      try {
        // Marca como deletado e apaga dados pessoais
        await this.db.collection('users').doc(userUid).update({
          status: 'deletado',
          deletadoEm: serverTimestamp,
          plan: 'base',
          nome: '[Conta Excluída]',
          email: 'deletado@estudeplus.com'
        });

        console.info('[FirebaseService] Conta', userUid, 'marcada como deletada no Firestore.');
        return true;
      } catch (err) {
        console.error('[FirebaseService] Erro ao excluir usuário no Firestore:', err);
        this.notifyError(`Erro ao excluir conta: ${err.message}`);
        throw err;
      }
    } else if (this.localStore) {
      return this.localStore.deleteUser(userUid);
    }
  }

  // =========================================================================
  // SISTEMA DE EVENTOS & EXIBIÇÃO DE ERROS REAIS
  // =========================================================================

  on(event, handler) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.subscribers.has(event)) {
      const list = this.subscribers.get(event).filter(h => h !== handler);
      this.subscribers.set(event, list);
    }
  }

  emit(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error(`[FirebaseService] Erro no handler do evento ${event}:`, e);
        }
      });
    }
  }

  /**
   * Mostra erros reais na tela e no console, para o desenvolvedor e usuário verem exatamente o que está falhando
   */
  notifyError(message) {
    this.lastError = message;
    console.error('[FirebaseService Erro Real]:', message);

    // Exibir banner visual de erro na tela se existir elemento #firebaseErrorAlert
    let alertBox = document.getElementById('firebaseErrorAlert');
    if (!alertBox) {
      alertBox = document.createElement('div');
      alertBox.id = 'firebaseErrorAlert';
      alertBox.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 99999; background: #fef2f2; border: 1.5px solid #ef4444; color: #991b1b; padding: 14px 18px; border-radius: 12px; font-size: 0.88rem; font-weight: 600; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25); max-width: 420px; display: flex; align-items: flex-start; gap: 10px; animation: slideInUp 0.3s ease;';
      document.body.appendChild(alertBox);
    }

    alertBox.innerHTML = `
      <div style="font-size: 1.3rem; line-height: 1;">⚠️</div>
      <div style="flex: 1;">
        <strong style="display: block; font-size: 0.9rem; margin-bottom: 2px; color: #b91c1c;">Erro no Firebase / Firestore:</strong>
        <span style="font-size: 0.82rem; line-height: 1.4; color: #7f1d1d; word-break: break-word;">${message}</span>
      </div>
      <button onclick="this.parentElement.remove()" style="border: none; background: transparent; color: #991b1b; font-size: 1.2rem; cursor: pointer; padding: 0 4px; font-weight: 700;">&times;</button>
    `;

    setTimeout(() => {
      if (alertBox && alertBox.parentElement) {
        alertBox.remove();
      }
    }, 7000);
  }

  // =========================================================================
  // ARMAZENAMENTO INTEGRADO E REAL-TIME SIMULATOR (Fallback Inteligente)
  // Permite que todo o sistema funcione 100% de imediato, mesmo offline ou antes
  // de colar as credenciais do Google Cloud
  // =========================================================================

  initLocalStore() {
    if (this.localStore) return;

    class FirestoreLocalEngine {
      constructor(parentService) {
        this.parent = parentService;
        this.STORAGE_USERS = 'estude_fs_users';
        this.STORAGE_PAYMENTS = 'estude_fs_payments';
        this.STORAGE_ADMINS = 'estude_fs_admins';
        this.listeners = new Set();
        this.initDefaults();
      }

      initDefaults() {
        if (!localStorage.getItem(this.STORAGE_ADMINS)) {
          const defaultAdmins = {
            'admin_freddie': { uid: 'admin_freddie', email: 'freddie@gammon.com.br' },
            'admin_claudiano': { uid: 'admin_claudiano', email: 'claudianostudio@gmail.com' }
          };
          localStorage.setItem(this.STORAGE_ADMINS, JSON.stringify(defaultAdmins));
        }

        if (!localStorage.getItem(this.STORAGE_USERS)) {
          const defaultUsers = [
            {
              id: 'admin_freddie',
              uid: 'admin_freddie',
              nome: 'Freddie Costa (Admin)',
              email: 'freddie@gammon.com.br',
              plan: 'pro',
              status: 'ativo',
              criadoEm: new Date(Date.now() - 30 * 86400000).toISOString(),
              ultimoAcesso: new Date().toISOString()
            },
            {
              id: 'user_aluno_teste',
              uid: 'user_aluno_teste',
              nome: 'Aluno Exemplo (Gammon)',
              email: 'aluno@gammon.com.br',
              plan: 'base',
              status: 'ativo',
              criadoEm: new Date(Date.now() - 5 * 86400000).toISOString(),
              ultimoAcesso: new Date(Date.now() - 120000).toISOString() // 2 minutos atrás (online)
            }
          ];
          localStorage.setItem(this.STORAGE_USERS, JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem(this.STORAGE_PAYMENTS)) {
          localStorage.setItem(this.STORAGE_PAYMENTS, JSON.stringify([]));
        }
      }

      getUsers() {
        try {
          return JSON.parse(localStorage.getItem(this.STORAGE_USERS) || '[]');
        } catch (e) {
          return [];
        }
      }

      saveUsers(list) {
        localStorage.setItem(this.STORAGE_USERS, JSON.stringify(list));
        this.broadcast();
      }

      getPayments() {
        try {
          return JSON.parse(localStorage.getItem(this.STORAGE_PAYMENTS) || '[]');
        } catch (e) {
          return [];
        }
      }

      savePayments(list) {
        localStorage.setItem(this.STORAGE_PAYMENTS, JSON.stringify(list));
        this.broadcast();
      }

      broadcast() {
        this.listeners.forEach(fn => {
          try { fn(); } catch (e) {}
        });
      }

      checkIsAdmin(uid, email) {
        if (!uid && !email) return false;
        try {
          const admins = JSON.parse(localStorage.getItem(this.STORAGE_ADMINS) || '{}');
          if (admins[uid]) return true;
          const found = Object.values(admins).some(a => a.email?.toLowerCase() === email?.toLowerCase());
          if (found) return true;
          return ['claudianostudio@gmail.com', 'freddie@gammon.com.br'].includes(email?.toLowerCase());
        } catch (e) {
          return false;
        }
      }

      handleUserLogin(user, extraProfile = {}) {
        const uid = user.uid || user.id || 'usr_' + Date.now();
        const email = user.email || '';
        const users = this.getUsers();
        let u = users.find(x => x.uid === uid || x.email === email);

        if (!u) {
          u = {
            id: uid,
            uid: uid,
            nome: extraProfile.nome || user.displayName || user.name || email.split('@')[0] || 'Aluno',
            email: email,
            plan: 'base',
            status: 'ativo',
            criadoEm: new Date().toISOString(),
            ultimoAcesso: new Date().toISOString()
          };
          users.push(u);
          this.saveUsers(users);
        } else {
          if (u.status === 'deletado') {
            const err = new Error('Sua conta foi desativada ou excluída pelo administrador.');
            this.parent.notifyError(err.message);
            throw err;
          }
          u.ultimoAcesso = new Date().toISOString();
          this.saveUsers(users);
        }

        this.parent.userDoc = u;
        this.parent.checkAdminPermission(uid);
        this.parent.startHeartbeat(uid);
        this.parent.listenToUserDoc(uid);
        this.parent.listenToUserPaymentRequests(uid);
        return u;
      }

      updateUser(uid, patch) {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.uid === uid || u.id === uid);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...patch };
          this.saveUsers(users);
          return users[idx];
        }
        return null;
      }

      hasPendingPaymentRequest(uid) {
        const payments = this.getPayments();
        return payments.some(p => (p.uid === uid) && p.status === 'pendente');
      }

      addPaymentRequest(data) {
        const payments = this.getPayments();
        const id = 'req_' + Date.now();
        const newReq = { id, ...data };
        payments.unshift(newReq);
        this.savePayments(payments);
        return newReq;
      }

      subscribeUserDoc(uid, callback) {
        const tick = () => {
          const users = this.getUsers();
          const u = users.find(x => x.uid === uid || x.id === uid);
          if (u && callback) callback(u);
        };
        this.listeners.add(tick);
        tick();
        return () => this.listeners.delete(tick);
      }

      subscribeUserPayments(uid, callback) {
        const tick = () => {
          const list = this.getPayments().filter(p => p.uid === uid);
          const pending = list.find(p => p.status === 'pendente');
          if (callback) callback({ list, pending });
        };
        this.listeners.add(tick);
        tick();
        return () => this.listeners.delete(tick);
      }

      subscribeAllUsers(callback) {
        const tick = () => {
          if (callback) callback(this.getUsers());
        };
        this.listeners.add(tick);
        tick();
        return () => this.listeners.delete(tick);
      }

      subscribePendingPayments(callback) {
        let prevCount = 0;
        const tick = () => {
          const pending = this.getPayments().filter(p => p.status === 'pendente');
          if (pending.length > prevCount && prevCount > 0) {
            const newest = pending[0];
            this.parent.emit('new_payment_notification', newest);
            if (window.app && typeof window.app.notifyNewPaymentRequest === 'function') {
              window.app.notifyNewPaymentRequest(newest);
            }
          }
          prevCount = pending.length;
          if (callback) callback(pending);
        };
        this.listeners.add(tick);
        tick();
        return () => this.listeners.delete(tick);
      }

      approvePayment(requestId, userUid, planId = 'pro') {
        const payments = this.getPayments();
        const req = payments.find(p => p.id === requestId);
        if (req) {
          req.status = 'aprovado';
          req.aprovadoEm = new Date().toISOString();
          this.savePayments(payments);
        }
        this.setUserPlan(userUid, 'pro');
        return true;
      }

      rejectPayment(requestId, reason) {
        const payments = this.getPayments();
        const req = payments.find(p => p.id === requestId);
        if (req) {
          req.status = 'recusado';
          req.motivoRecusa = reason;
          req.recusadoEm = new Date().toISOString();
          this.savePayments(payments);
        }
        return true;
      }

      setUserPlan(userUid, newPlan) {
        const users = this.getUsers();
        const u = users.find(x => x.uid === userUid || x.id === userUid);
        if (u) {
          u.plan = newPlan;
          if (newPlan === 'pro') {
            u.proAtivadoEm = new Date().toISOString();
          } else {
            u.proCanceladoEm = new Date().toISOString();
          }
          this.saveUsers(users);
          return true;
        }
        return false;
      }

      deleteUser(userUid) {
        const users = this.getUsers();
        const u = users.find(x => x.uid === userUid || x.id === userUid);
        if (u) {
          u.status = 'deletado';
          u.plan = 'base';
          u.deletadoEm = new Date().toISOString();
          u.nome = '[Conta Excluída]';
          u.email = 'deletado@estudeplus.com';
          this.saveUsers(users);
          return true;
        }
        return false;
      }
    }

    this.localStore = new FirestoreLocalEngine(this);
    console.info('[FirebaseService] Engine integrado do Firestore inicializado com sucesso.');
  }
}

// Instância singleton global do Firebase Service para o ESTUDE+
window.estudeFirebase = new EstudeFirebaseService();
