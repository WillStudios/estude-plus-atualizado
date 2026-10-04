const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'gammon_config.json');
if (!fs.existsSync(configPath)) {
  console.error('Config file gammon_config.json not found!');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Detect browser executable
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log('Using browser executable:', executablePath);

async function runGammonSync() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new", // Run headless
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Monitor network responses to capture occurrences API or data
  const capturedResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('ocorrencia') || url.includes('Ocorrencia') || url.includes('API') || url.includes('Edu')) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const json = await response.json();
          console.log(`[Captured API] ${url}`);
          capturedResponses.push({ url, json });
        }
      } catch (e) {
        // ignore non-json or stream errors
      }
    }
  });

  try {
    console.log('Navigating to login page...');
    await page.goto('https://portal.gammon.br/Corpore.net/Login.aspx', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('Current URL:', page.url());

    // Type credentials
    console.log('Typing credentials...');
    await page.waitForSelector('#txtUser', { timeout: 15000 });
    await page.type('#txtUser', config.email, { delay: 30 });
    await page.type('#txtPass', config.password, { delay: 30 });

    console.log('Clicking login button...');
    await Promise.all([
      page.click('#btnLogin'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(e => console.log('Navigation wait timed out or completed differently:', e.message))
    ]);

    console.log('After login URL:', page.url());
    await page.screenshot({ path: path.join(__dirname, 'login_step1.png') });

    // Navigate to occurrences page
    const occUrl = 'https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias';
    console.log('Navigating to occurrences URL:', occUrl);
    await page.goto(occUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Waiting for occurrence content to render...');
    await new Promise(r => setTimeout(r, 8000)); // wait for angular rendering
    await page.screenshot({ path: path.join(__dirname, 'occurrences_page.png') });

    // Extract text from the page
    const pageText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(path.join(__dirname, 'occurrences_text.txt'), pageText);
    console.log('Occurrences page preview (first 500 chars):');
    console.log(pageText.slice(0, 500));

    // Save captured API responses
    if (capturedResponses.length > 0) {
      fs.writeFileSync(path.join(__dirname, 'captured_api.json'), JSON.stringify(capturedResponses, null, 2));
      console.log(`Captured ${capturedResponses.length} API responses!`);
    } else {
      console.log('No API responses captured yet.');
    }

  } catch (err) {
    console.error('Error during Gammon sync:', err);
    await page.screenshot({ path: path.join(__dirname, 'sync_error.png') }).catch(() => {});
  } finally {
    await browser.close();
    console.log('Browser closed. Sync test complete.');
  }
}

runGammonSync();
