// Explicitly authorized public-site functional verification, separate from the
// no-network audit. Runtime injection is not a Tampermonkey installation.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const source = 'https://help.aliyun.com/zh/document_detail/37388.html';
const destination = 'https://www.gov.cn/gongbao/content/2017/content_5232377.htm';
const output = new URL('./results/live/', import.meta.url);
await mkdir(output, { recursive: true });
let bundle;
let browser;
const report = { source, destination, injection: 'current userscript via addInitScript, not Tampermonkey', cases: [], status: 'failed' };
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function until(check, description) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await pause(100);
  }
  throw new Error(`Timed out: ${description}`);
}

function mainDocument(request) {
  if (!request.isNavigationRequest()) return false;
  try { return request.frame().parentFrame() === null; }
  catch { return true; } // Initial popup navigation can precede frame creation.
}

async function runCase(injected) {
  const name = injected ? 'with-userscript' : 'without-userscript';
  const result = { name, injected, documentRequests: [], documentResponses: [], failedDocuments: [], blockedNavigations: [], status: 'failed' };
  report.cases.push(result);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', acceptDownloads: false });
  context.setDefaultTimeout(15000);
  context.setDefaultNavigationTimeout(45000);
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  // Restrict top-level browsing to the requested example, its confirmation page,
  // and the exact government document. Do not follow unrelated page links.
  await context.route('**/*', async (route) => {
    const request = route.request();
    if (mainDocument(request)) {
      const url = new URL(request.url());
      const allowed = request.url() === source || request.url() === destination ||
        (url.origin === 'https://help.aliyun.com' && url.pathname === '/redirect' && url.searchParams.get('targetUrl') === destination);
      if (!allowed) {
        result.blockedNavigations.push(request.url());
        await route.abort('blockedbyclient');
        return;
      }
    }
    await route.continue();
  });
  context.on('request', (request) => {
    if (mainDocument(request)) result.documentRequests.push(request.url());
  });
  context.on('response', (response) => {
    const request = response.request();
    if (mainDocument(request)) result.documentResponses.push({ url: response.url(), status: response.status() });
  });
  context.on('requestfailed', (request) => {
    if (mainDocument(request)) result.failedDocuments.push({ url: request.url(), error: request.failure()?.errorText });
  });
  if (injected) await context.addInitScript({ content: `if (location.href === ${JSON.stringify(source)}) {\n${bundle}\n}` });
  const page = await context.newPage();
  try {
    const response = await page.goto(source, { waitUntil: 'domcontentloaded' });
    assert.ok(response?.ok(), `Aliyun document HTTP ${response?.status()}`);
    const link = page.locator(`.markdown-body a[href="${destination}"]`);
    await link.waitFor({ state: 'visible' });
    await link.hover();
    // The inspected Aliyun aPlugin registers both click and mouseenter. This
    // site-produced attribute proves hydration installed that plugin before click.
    await page.waitForFunction((href) => document.querySelector(`.markdown-body a[href="${href}"]`)?.getAttribute('data-spm-protocol') === 'i', destination);
    result.before = await link.evaluate((anchor) => ({ href: anchor.getAttribute('href'), resolvedHref: anchor.href, target: anchor.getAttribute('target'), rel: anchor.getAttribute('rel'), query: new URL(anchor.href).search, hash: new URL(anchor.href).hash }));
    assert.equal(result.before.href, destination);
    await page.screenshot({ path: new URL(`${name}-before.png`, output).pathname });
    const count = result.documentRequests.length;
    await link.click({ noWaitAfter: true });
    await until(() => result.documentRequests.length > count, `${name} click produces a document request`);
    result.clickRequests = result.documentRequests.slice(count);
    if (injected) {
      assert.equal(result.clickRequests[0], destination, 'fixed click must navigate directly to the original href');
      assert.ok(!result.documentRequests.some((url) => new URL(url).pathname === '/redirect'), 'fixed case must never visit confirmation page');
    } else {
      const redirected = new URL(result.clickRequests[0]);
      assert.equal(redirected.origin, 'https://help.aliyun.com');
      assert.equal(redirected.pathname, '/redirect');
      assert.equal(redirected.searchParams.get('targetUrl'), destination);
    }
    const expected = result.clickRequests[0];
    await until(() => result.documentResponses.some((response) => response.url === expected), `${name} navigation response`);
    const clickResponse = result.documentResponses.find((response) => response.url === expected);
    assert.ok(clickResponse.status >= 200 && clickResponse.status < 300, `clicked document HTTP ${clickResponse.status}`);
    await until(() => context.pages().some((candidate) => candidate.url() === expected), `${name} resulting page URL`);
    const landing = context.pages().find((candidate) => candidate.url() === expected);
    await landing.waitForLoadState('domcontentloaded');
    if (!injected) {
      // The redirect shell responds before React renders the confirmation.
      // Wait for its visible destination before recording screenshot evidence.
      await landing.getByText(destination, { exact: true }).waitFor({ state: 'visible' });
      result.confirmationHeading = await landing.locator('h4').innerText();
      assert.ok(result.confirmationHeading.trim(), 'confirmation heading must be rendered');
    }
    result.landing = { url: landing.url(), title: await landing.title() };
    await landing.screenshot({ path: new URL(`${name}-after.png`, output).pathname });
    // For popup navigation the source document remains available for an exact
    // attribute comparison. A same-tab native navigation destroys that document;
    // the before snapshot plus original destination request are retained instead.
    if (page.url() === source) {
      result.after = await link.evaluate((anchor) => ({ href: anchor.getAttribute('href'), resolvedHref: anchor.href, target: anchor.getAttribute('target'), rel: anchor.getAttribute('rel'), query: new URL(anchor.href).search, hash: new URL(anchor.href).hash }));
      assert.deepEqual(result.after, result.before);
    }
    assert.deepEqual(result.blockedNavigations, [], 'unexpected navigation outside the explicitly authorized pages');
    result.status = 'passed';
  } catch (error) {
    result.error = String(error.stack || error);
    await page.screenshot({ path: new URL(`${name}-failure.png`, output).pathname }).catch(() => {});
    throw error;
  } finally {
    await context.tracing.stop({ path: new URL(`${name}-trace.zip`, output).pathname });
    await context.close();
  }
}

try {
  bundle = await readFile(new URL('../../userscript.js', import.meta.url), 'utf8');
  browser = await chromium.launch({ headless: true });
  report.chromium = browser.version();
  await runCase(false);
  await runCase(true);
  assert.deepEqual(report.cases[0].before, report.cases[1].before, 'injection must preserve original native anchor attributes');
  report.status = 'passed';
} catch (error) {
  report.error = String(error.stack || error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await writeFile(new URL('summary.json', output), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
