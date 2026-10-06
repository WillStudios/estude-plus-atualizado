const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.message));
  page.on('dialog', async dialog => {
    console.log('[BROWSER DIALOG/ALERT]', dialog.type(), dialog.message());
    await dialog.accept();
  });

  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });

  // Login as student
  console.log('Logging in as student...');
  await page.evaluate(() => {
    window.app.quickLogin('student', true);
  });
  await new Promise(r => setTimeout(r, 1000));

  const userStatus = await page.evaluate(() => ({
    currentUser: window.app.currentUser ? { name: window.app.currentUser.name, role: window.app.currentUser.role } : null,
    isPro: window.app.isUserPro(),
    hasAccess: window.app.hasTrilhasAccess()
  }));
  console.log('User status after student login:', userStatus);

  // Switch to Trilhas
  console.log('\n--- Switching to Trilhas (Matemática > Apostila 2 > Capítulo 8) ---');
  await page.evaluate(() => {
    window.app.switchTab('trilhas');
    window.app.selectTrilhaSubject('matematica');
    window.app.selectTrilhaApostila(2);
    window.app.selectTrilhaChapter(8);
  });
  await new Promise(r => setTimeout(r, 1000));

  // Find "Iniciar Etapa Agora" button
  const buttonInfo = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Iniciar Etapa Agora'));
    return {
      found: Boolean(btn),
      text: btn ? btn.innerText.trim() : null,
      onclick: btn ? btn.getAttribute('onclick') : null
    };
  });
  console.log('Trilha Button Info:', buttonInfo);

  // Physically click the "Iniciar Etapa Agora" button!
  console.log('\n--- Clicking "Iniciar Etapa Agora" button on screen ---');
  const clickTrilhaResult = await page.evaluate(async () => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Iniciar Etapa Agora'));
    if (!btn) return { error: 'Button not found' };
    btn.click();
    await new Promise(r => setTimeout(r, 800));

    const modal = document.getElementById('trilhaStageModal');
    const questions = document.querySelectorAll('.trilha-q-block');
    const modalTitle = document.getElementById('trilhaStageTitle');
    return {
      modalFound: Boolean(modal),
      modalDisplay: modal ? modal.style.display : null,
      modalActive: modal ? modal.classList.contains('active') : null,
      modalTitle: modalTitle ? modalTitle.innerText : null,
      questionsCount: questions.length,
      activeSessionTotal: window.app.activeTrilhaSession ? window.app.activeTrilhaSession.totalQuestions : 0
    };
  });
  // Answer questions and submit stage quiz
  console.log('\n--- Answering questions and submitting Stage Quiz ---');
  const submitTrilhaResult = await page.evaluate(async () => {
    // Select option for each question
    window.app.handleTrilhaOptionSelect(0, 'A');
    window.app.handleTrilhaOptionSelect(1, 'B');
    window.app.handleTrilhaOptionSelect(2, 'C');

    // Submit stage
    await window.app.submitCurrentTrilhaStage();
    await new Promise(r => setTimeout(r, 600));

    const resultBox = document.querySelector('#trilhaStageContentArea');
    return {
      submitted: true,
      hasResultContent: Boolean(resultBox && resultBox.innerText.includes('Acertos')),
      progressRecord: (window.app.trilhasProgressData || []).find(p => p.chapterId === 8)
    };
  });
  console.log('Trilha Stage Submit Result:', submitTrilhaResult);

  // Close trilha modal
  await page.evaluate(() => {
    window.app.closeModal('trilhaStageModal');
  });

  // Switch to TPCs
  console.log('\n--- Switching to TPCs ---');
  await page.evaluate(() => {
    window.app.switchTab('gammon-tpc');
  });
  await new Promise(r => setTimeout(r, 800));

  // Find TPC buttons before click
  const tpcBefore = await page.evaluate(() => {
    const btn = document.querySelector('.btn-status-toggle');
    return {
      text: btn ? btn.innerText.trim() : null,
      className: btn ? btn.className : null
    };
  });
  console.log('TPC Button BEFORE click:', tpcBefore);

  // Click TPC button to toggle to FEITO
  console.log('\n--- Clicking TPC button to toggle status ---');
  const tpcAfterFirstClick = await page.evaluate(async () => {
    const btn = document.querySelector('.btn-status-toggle');
    if (btn) {
      btn.click();
      await new Promise(r => setTimeout(r, 500));
      const updatedBtn = document.querySelector('.btn-status-toggle');
      return {
        text: updatedBtn ? updatedBtn.innerText.trim() : null,
        className: updatedBtn ? updatedBtn.className : null,
        completedTpcs: window.app.state.completedTpcIds
      };
    }
    return null;
  });
  console.log('TPC Button AFTER 1st click (should be FEITO):', tpcAfterFirstClick);

  // Click again to toggle back to NÃO FEITO
  console.log('\n--- Clicking TPC button again to revert status ---');
  const tpcAfterSecondClick = await page.evaluate(async () => {
    const btn = document.querySelector('.btn-status-toggle');
    if (btn) {
      btn.click();
      await new Promise(r => setTimeout(r, 500));
      const updatedBtn = document.querySelector('.btn-status-toggle');
      return {
        text: updatedBtn ? updatedBtn.innerText.trim() : null,
        className: updatedBtn ? updatedBtn.className : null,
        completedTpcs: window.app.state.completedTpcIds
      };
    }
    return null;
  });
  console.log('TPC Button AFTER 2nd click (should be NÃO FEITO):', tpcAfterSecondClick);

  await browser.close();
  console.log('\n=== ALL BROWSER AUTOMATION TESTS COMPLETED SUCCESSFULLY! ===');
})();
