import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { runRules, startRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { browser } from './helpers/browser.js';

const page = 'https://help.aliyun.com/zh/document_detail/37388.html';
const targets = [
  'https://www.gov.cn/gongbao/content/2017/content_5232377.htm',
  'https://example.com/a%2Fb?q=a+b&value=a%26b&empty=#section',
  'http://example.com/?next=https%3A%2F%2Fexample.org%2Fa%3Fx%3D1%26y%3D2',
  '//example.com/path?q=1#section',
];

function setup(t, url = page) {
  const fixture = browser(url, '<div class="markdown-body"></div><nav></nav>');
  t.after(() => fixture.dom.window.close());
  return fixture;
}

// help-portal-fe/0.12.63/js/index.js: Nxe (aPlugin) binds directly to
// .markdown-body anchors, prevents default, then opens qG(href):
// /redirect?targetUrl=<encoded href>. Model that source-observed behavior.
function addLink(fixture, href, container = '.markdown-body') {
  const { document } = fixture.context;
  const link = document.createElement('a');
  if (href !== null) link.setAttribute('href', href);
  link.target = '_blank';
  link.rel = 'nofollow noopener noreferrer';
  link.innerHTML = '<span>Visit</span>';
  const confirmations = [];
  link.addEventListener('click', (event) => {
    event.preventDefault();
    confirmations.push(`/redirect?targetUrl=${encodeURIComponent(link.getAttribute('href'))}`);
  });
  document.querySelector(container).append(link);
  return { link, confirmations };
}

for (const href of targets) {
  for (const options of [{}, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { detail: 0 }]) {
    test(`Aliyun keeps external anchor activation native: ${href} ${JSON.stringify(options)}`, (t) => {
      const fixture = setup(t);
      const { link, confirmations } = addLink(fixture, href);
      runRules(fixture.context, rules);
      const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ...options });
      assert.equal(link.firstChild.dispatchEvent(event), true);
      assert.equal(event.defaultPrevented, false);
      assert.deepEqual(confirmations, []);
      assert.equal(link.getAttribute('href'), href);
      assert.equal(link.target, '_blank');
      assert.equal(link.rel, 'nofollow noopener noreferrer');
      assert.deepEqual(fixture.opened, []);
      assert.deepEqual(fixture.navigations, []);
      assert.deepEqual(fixture.warnings, []);
    });
  }
}

for (const href of ['/zh/ecs/', '#section', page, 'mailto:hello@example.com', 'javascript:void(0)', 'data:text/plain,hello', '', null]) {
  test(`Aliyun preserves internal/non-web site handlers: ${href}`, (t) => {
    const fixture = setup(t);
    const { link, confirmations } = addLink(fixture, href);
    runRules(fixture.context, rules);
    const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    assert.equal(link.firstChild.dispatchEvent(event), false);
    assert.equal(confirmations.length, 1);
  });
}

test('Aliyun leaves links outside document content and other controls alone', (t) => {
  const fixture = setup(t);
  const { link, confirmations } = addLink(fixture, targets[0], 'nav');
  let clicks = 0;
  const button = fixture.context.document.createElement('button');
  button.addEventListener('click', () => clicks++);
  fixture.context.document.querySelector('.markdown-body').append(button);
  runRules(fixture.context, rules);
  link.firstChild.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  button.click();
  assert.equal(confirmations.length, 1);
  assert.equal(clicks, 1);
  assert.doesNotThrow(() => fixture.context.document.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true })));
});

test('Aliyun capture works at document-start, across SPA updates, and rechecks changed hrefs', (t) => {
  const fixture = setup(t, 'https://help.aliyun.com/');
  Object.defineProperty(fixture.context.document, 'readyState', { value: 'loading' });
  startRules(fixture.context, rules);
  fixture.dom.window.history.pushState({}, '', '/zh/ecs/user-guide/overview');
  const { link, confirmations } = addLink(fixture, targets[0]);
  const click = () => link.firstChild.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(click(), true);
  link.href = 'javascript:void(0)';
  assert.equal(click(), false);
  link.href = '/zh/ecs/';
  assert.equal(click(), false);
  link.href = targets[1];
  assert.equal(click(), true);
  assert.equal(confirmations.length, 2);
});

for (const host of ['example.com', 'developer.aliyun.com', 'help.aliyun.com.example.com']) {
  test(`Aliyun adaptation does not run on ${host}`, (t) => {
    const fixture = setup(t, `https://${host}/zh/document_detail/37388.html`);
    assert.equal(runRules(fixture.context, rules), false);
  });
}

test('generated userscript enables Aliyun links before DOM ready without changing native attributes', async (t) => {
  const fixture = setup(t);
  const bundle = await readFile(new URL('../userscript.js', import.meta.url), 'utf8');
  assert.match(bundle.split('// ==/UserScript==')[0], /@match\s+https:\/\/help\.aliyun\.com\/\*/);
  Object.defineProperty(fixture.context.document, 'readyState', { value: 'loading' });
  vm.runInNewContext(bundle, { window: fixture.context.window, document: fixture.context.document, URL, console });
  const { link, confirmations } = addLink(fixture, targets[0]);
  link.target = '_self';
  const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
  assert.equal(link.firstChild.dispatchEvent(event), true);
  assert.deepEqual(confirmations, []);
  assert.equal(link.target, '_self');
  assert.equal(link.getAttribute('href'), targets[0]);
  assert.deepEqual(fixture.opened, []);
  assert.deepEqual(fixture.navigations, []);
});
