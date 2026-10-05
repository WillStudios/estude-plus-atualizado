/**
 * ESTUDE+ — CONFIGURAÇÃO DO GOOGLE FIREBASE
 * Autenticação (Firebase Auth) & Banco de Dados em Tempo Real (Cloud Firestore)
 */

(function () {
  const STORAGE_KEY = 'estude_firebase_config';

  // Obter configurações armazenadas localmente ou pré-definidas
  function loadConfig() {
    if (window.__ESTUDE_FIREBASE_CONFIG__) {
      return window.__ESTUDE_FIREBASE_CONFIG__;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.projectId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Firebase Config] Erro ao ler configuração local:', e);
    }

    // Configuração Padrão / Exemplo configurável
    return {
      apiKey: "AIzaSyEstudePlusKeyGammon2026AutoConfig",
      authDomain: "estude-plus-gammon.firebaseapp.com",
      projectId: "estude-plus-gammon",
      storageBucket: "estude-plus-gammon.appspot.com",
      messagingSenderId: "109876543210",
      appId: "1:109876543210:web:estudeplusgammon2026",
      isDefaultPlaceholder: true
    };
  }

  function saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.__ESTUDE_FIREBASE_CONFIG__ = config;
      console.info('[Firebase Config] Nova configuração do Firebase salva com sucesso.');
      return true;
    } catch (e) {
      console.error('[Firebase Config] Erro ao salvar configuração:', e);
      return false;
    }
  }

  function isConfigured() {
    const cfg = loadConfig();
    return Boolean(cfg && cfg.projectId && !cfg.isDefaultPlaceholder);
  }

  window.FirebaseConfigManager = {
    getConfig: loadConfig,
    saveConfig: saveConfig,
    isConfigured: isConfigured,
    storageKey: STORAGE_KEY
  };

  window.firebaseConfig = loadConfig();
})();
