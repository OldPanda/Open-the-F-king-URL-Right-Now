import assert from 'node:assert/strict';
import test from 'node:test';
import { startRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { browser } from './helpers/browser.js';

const target = 'https://example.com/a%2Fb?q=a+b&value=a%26b&empty=#section';
const earlyURLs = [
  `https://link.zhihu.com/?target=${encodeURIComponent(target)}`,
  `https://blog.51cto.com/transfer?${encodeURIComponent(target)}`,
  `https://ref.gamer.com.tw/redir.php/url=${encodeURIComponent(target)}`,
  `https://link.mcmod.cn/target/${btoa(target)}`,
  `https://www.pixiv.net/jump.php?${encodeURIComponent(target)}`,
  `https://docs.qq.com/scenario/link.html?u=${encodeURIComponent(target)}`,
  `https://t.techlife.app/#/${btoa(target)}`,
  `https://unsafelink.com/${target}`,
  ...['ios', 'pc', 'android'].flatMap((page) => [target, encodeURIComponent(target)]
    .map((value) => `https://c.pc.qq.com/${page}.html?url=${value}`)),
];

for (const url of earlyURLs) {
  test(`starts URL redirect before DOM exists, once: ${url}`, (t) => {
    const fixture = browser(url);
    t.after(() => fixture.dom.window.close());
    assert.equal(fixture.context.document.readyState, 'loading');
    assert.equal(fixture.context.document.body.childElementCount, 0);
    startRules(fixture.context, rules);
    assert.deepEqual(fixture.navigations, [target]);
    fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
    assert.deepEqual(fixture.navigations, [target]);
    assert.deepEqual(fixture.warnings, []);
  });
}

test('DOM redirect waits for parsed content and runs once', async (t) => {
  const fixture = browser('https://www.iplaysoft.com/link/');
  t.after(() => fixture.dom.window.close());
  startRules(fixture.context, rules);
  assert.deepEqual(fixture.navigations, []);
  const container = fixture.context.document.createElement('div');
  container.id = 'targetUrl';
  const link = fixture.context.document.createElement('a');
  link.href = target;
  container.append(link);
  fixture.context.document.body.append(container);
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  await new Promise((resolve) => fixture.dom.window.setTimeout(resolve, 0));
  assert.deepEqual(fixture.navigations, [target]);
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  await new Promise((resolve) => fixture.dom.window.setTimeout(resolve, 0));
  assert.deepEqual(fixture.navigations, [target]);
});

for (const readyState of ['interactive', 'complete']) {
  test(`late injection does not miss DOM initialization: ${readyState}`, async (t) => {
    const fixture = browser('https://www.iplaysoft.com/link/', `<div id="targetUrl"><a href="${target}">Go</a></div>`);
    t.after(() => fixture.dom.window.close());
    Object.defineProperty(fixture.context.document, 'readyState', { value: readyState });
    startRules(fixture.context, rules);
    assert.deepEqual(fixture.navigations, []);
    await new Promise((resolve) => fixture.dom.window.setTimeout(resolve, 0));
    assert.deepEqual(fixture.navigations, [target]);
  });
}

test('unmatched URLs and invalid early targets do not register fallback redirects', (t) => {
  for (const url of ['https://example.com/', 'https://link.zhihu.com/?target=javascript%3Aalert(1)']) {
    const fixture = browser(url);
    t.after(() => fixture.dom.window.close());
    startRules(fixture.context, rules);
    fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
    assert.deepEqual(fixture.navigations, []);
  }
});

test('deferred startup preserves first matching rule precedence', async (t) => {
  const fixture = browser('https://example.com/');
  t.after(() => fixture.dom.window.close());
  const calls = [];
  startRules(fixture.context, [
    { id: 'dom', host: 'example.com', path: '/', handler: () => calls.push('dom') },
    { id: 'early', host: 'example.com', path: '/', runAt: 'start', handler: () => calls.push('early') },
  ]);
  assert.deepEqual(calls, []);
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  await new Promise((resolve) => fixture.dom.window.setTimeout(resolve, 0));
  assert.deepEqual(calls, ['dom']);
});

test('NGA waits for page DOMContentLoaded listeners and their microtasks', async (t) => {
  const fixture = browser('https://bbs.nga.cn/read.php?tid=123');
  t.after(() => fixture.dom.window.close());
  startRules(fixture.context, rules);
  fixture.context.document.addEventListener('DOMContentLoaded', () => {
    queueMicrotask(() => { fixture.context.window.ubbcode = {}; });
  }, { once: true });
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  await new Promise((resolve) => fixture.dom.window.setTimeout(resolve, 0));
  assert.equal(typeof fixture.context.window.ubbcode.showUrlAlert, 'function');
  fixture.context.window.ubbcode.showUrlAlert(null, { href: target });
  assert.deepEqual(fixture.opened, [[target]]);
});

test('DOM targets created by later page ready listeners are available to redirects', async (t) => {
  const fixture = browser('https://www.iplaysoft.com/link/');
  t.after(() => fixture.dom.window.close());
  startRules(fixture.context, rules);
  fixture.context.document.addEventListener('DOMContentLoaded', () => {
    fixture.context.document.body.innerHTML = `<div id="targetUrl"><a href="${target}">Go</a></div>`;
  }, { once: true });
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  await new Promise((resolve) => fixture.dom.window.setTimeout(resolve, 0));
  assert.deepEqual(fixture.navigations, [target]);
});
