const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'gammon_config.json');
const OUTPUT_FILE = path.join(__dirname, 'gammon_tpcs.json');
const STATUS_FILE = path.join(__dirname, 'gammon_sync_status.json');

function getBrowserExecutable() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('Nenhum navegador Chrome ou Edge compatível foi encontrado.');
}

async function syncGammonPortal() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error('Arquivo de configuração gammon_config.json não encontrado.');
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const executablePath = getBrowserExecutable();

  console.log(`[${new Date().toISOString()}] Iniciando sincronização Gammon+...`);
  fs.writeFileSync(STATUS_FILE, JSON.stringify({
    status: 'running',
    startedAt: new Date().toISOString(),
    message: 'Conectando ao Portal Gammon...'
  }, null, 2));

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1280,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  let occurrencesData = null;

  page.on('response', async (res) => {
    const u = res.url();
    if (u.includes('FrameHTML/RM/API/TOTVSEducacional/Ocorrencias')) {
      try {
        const ct = res.headers()['content-type'] || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          if (json && (json.data || Array.isArray(json))) {
            occurrencesData = json.data || json;
            console.log(`[API Gammon] ${occurrencesData.length} ocorrências capturadas com sucesso!`);
          }
        }
      } catch (e) {}
    }
  });

  try {
    // 1. Acessar tela de login ou contexto do portal
    await page.goto('https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Aguardar ou formulário de login ou tela de contexto já autenticada
    await page.waitForFunction(() => {
      return !!document.getElementById('User') || !!document.querySelector('.div-item-curso') || window.location.hash.includes('main');
    }, { timeout: 30000 }).catch(() => {});

    await new Promise(r => setTimeout(r, 2000));

    // Se estiver na tela de login, preencher credenciais
    const hasUserInput = await page.$('#User');
    if (hasUserInput) {
      console.log('Preenchendo credenciais no formulário do Portal Gammon...');
      await page.evaluate((u, p) => {
        const userInput = document.getElementById('User');
        const passInput = document.getElementById('Pass');
        const aliasSelect = document.getElementById('Alias');

        if (userInput) {
          userInput.focus();
          userInput.value = u;
          userInput.dispatchEvent(new Event('input', { bubbles: true }));
          userInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (passInput) {
          passInput.focus();
          passInput.value = p;
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (aliasSelect) {
          for (let i = 0; i < aliasSelect.options.length; i++) {
            if (aliasSelect.options[i].text.includes('CorporeRM') || aliasSelect.options[i].value.includes('CorporeRM')) {
              aliasSelect.selectedIndex = i;
              break;
            }
          }
          aliasSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        try {
          const scope = window.angular.element(userInput).scope();
          if (scope) {
            scope.user = u;
            scope.pass = p;
            if (scope.controller) scope.controller.alias = 'CorporeRM';
            scope.$apply();
          }
        } catch (e) {}
      }, config.email, config.password);

      await page.evaluate(() => {
        const btn = document.querySelector('button[ng-click*="validarDadosLogin"]') || document.querySelector('button.btn-acessar-mobile');
        if (btn) btn.click();
      });

      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 35000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('Sessão pré-existente ou já autenticada no Portal Gammon!');
    }

    // 5. Selecionar o contexto 7º ANO 2026
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      for (const el of all) {
        if (el.children.length === 0 && el.innerText && el.innerText.includes('7º ANO')) {
          const card = el.closest('.item-contexto') || el.closest('.card') || el.closest('[ng-click]') || el.parentElement;
          if (card) {
            card.click();
            break;
          }
        }
      }
    });

    await new Promise(r => setTimeout(r, 1500));

    // 6. Clicar em "Confirmar"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], a.btn'));
      for (const btn of buttons) {
        if (btn.innerText && btn.innerText.includes('Confirmar')) {
          btn.click();
          break;
        }
      }
    });

    await new Promise(r => setTimeout(r, 6000));

    // 7. Navegar diretamente para #/ocorrencias
    await page.goto('https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(r => setTimeout(r, 10000));

    if (!occurrencesData || !Array.isArray(occurrencesData)) {
      throw new Error('Não foi possível obter a lista de ocorrências da API.');
    }

    // Filtrar, deduplicar e normalizar TPCs
    const tpcMap = new Map();
    occurrencesData
      .filter(o => o.DESCTIPOOCOR === 'TPC Diário' || o.DESCTIPOOCOR === 'TPC incompleto' || o.DESCTIPOOCOR === 'Não realizou TPC')
      .forEach(o => {
        const idKey = `gammon_${o.IDOCORALUNO}`;
        // Formatar data limpa YYYY-MM-DD
        const dataRaw = o.DATAOCORRENCIA ? o.DATAOCORRENCIA.slice(0, 10) : new Date().toISOString().slice(0, 10);
        const [year, month, day] = dataRaw.split('-');
        const dateBr = `${day}/${month}/${year}`;

        // Extrair prazo da observação se existir (ex: "para o dia 05/10", "para 02/10", "até 04/10")
        let dueDate = null;
        const dueMatch = (o.OBSERVACOES || '').match(/para\s+(?:o\s+dia\s+)?(\d{1,2}\/\d{1,2})|até\s+(?:o\s+dia\s+)?(\d{1,2}\/\d{1,2})/i);
        if (dueMatch) {
          const rawMatch = dueMatch[1] || dueMatch[2];
          const parts = rawMatch.split('/');
          dueDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else {
          dueDate = dataRaw;
        }

        const tpcItem = {
          id: idKey,
          gammonId: o.IDOCORALUNO,
          subject: (o.DISCIPLINA || 'Geral').trim(),
          title: `TPC Diário - ${(o.DISCIPLINA || 'Geral').trim()}`,
          description: (o.OBSERVACOES || '').trim(),
          teacher: (o.NOMEPROF || '').trim(),
          classGroup: o.CODTURMA || '17B',
          term: o.ETAPA || '3º T',
          type: o.DESCTIPOOCOR,
          createdDate: dataRaw,
          createdDateBr: dateBr,
          dueDate: dueDate,
          source: 'portal_gammon_sync',
          status: 'pending',
          done: false,
          syncedAt: new Date().toISOString()
        };

        // Atualiza ou insere (sem duplicatas)
        tpcMap.set(idKey, tpcItem);
      });

    // Ordenação consistente pelos mais recentes (data e ID Gammon)
    const sortedTpcs = Array.from(tpcMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdDate || a.dueDate || 0).getTime();
      const timeB = new Date(b.createdDate || b.dueDate || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.gammonId) || 0) - (Number(a.gammonId) || 0);
    });

    // REGRA PRINCIPAL: Selecionar e manter ESTRITAMENTE os 5 TPCs DIÁRIOS MAIS RECENTES
    const top5Tpcs = sortedTpcs.slice(0, 5);

    // Salvar arquivo de TPCs sincronizados (apenas os 5 mais recentes)
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(top5Tpcs, null, 2), 'utf8');

    // Salvar status de sucesso
    const statusPayload = {
      status: 'success',
      lastSync: new Date().toISOString(),
      lastSyncFormatted: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      totalCaptured: occurrencesData.length,
      totalTpcs: top5Tpcs.length,
      latestTpc: top5Tpcs[0] || null,
      message: `Sincronização concluída! Os ${top5Tpcs.length} TPCs Diários mais recentes foram importados do Portal Gammon.`
    };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusPayload, null, 2), 'utf8');

    console.log(`[${new Date().toISOString()}] SUCESSO: ${top5Tpcs.length} TPCs recentes sincronizados com o Gammon!`);
    return statusPayload;

  } catch (err) {
    console.error(`[${new Date().toISOString()}] ERRO na sincronização:`, err.message);
    const errorPayload = {
      status: 'error',
      lastSync: new Date().toISOString(),
      lastSyncFormatted: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      message: err.message
    };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(errorPayload, null, 2), 'utf8');
    throw err;
  } finally {
    await browser.close();
  }
}

// Se executado diretamente via linha de comando
if (require.main === module) {
  syncGammonPortal()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { syncGammonPortal };
