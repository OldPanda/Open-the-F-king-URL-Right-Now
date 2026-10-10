import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { browser } from './helpers/browser.js';

const root = new URL('../', import.meta.url);
const bundle = await readFile(new URL('userscript.js', root), 'utf8');

test('generated userscript has metadata first, consistent version, and standalone syntax', async () => {
  const metadata = await readFile(new URL('src/userscript.meta.txt', root), 'utf8');
  const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  assert.ok(bundle.startsWith(metadata));
  assert.ok(metadata.includes(`// @version        ${version}\n`));
  assert.match(metadata, /@require\s+https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jquery\/3\.7\.1\/jquery\.min\.js/);
  assert.doesNotThrow(() => new vm.Script(bundle));
  assert.doesNotMatch(bundle, /^\s*(import|export)\s/m);
});

test('generated userscript runs on document-ready with the real jQuery boundary', async (t) => {
  const target = 'https://example.com/?value=a%26b#section';
  const fixture = browser(`https://link.csdn.net/?tracking=1&target=${encodeURIComponent(target)}`);
  t.after(() => fixture.dom.window.close());
  const pageDollar = () => 'page library';
  fixture.dom.window.$ = pageDollar;
  fixture.dom.window.jQuery = fixture.$;
  vm.runInNewContext(bundle, {
    window: fixture.context.window,
    document: fixture.context.document,
    jQuery: fixture.$,
    URL,
    console,
  });
  fixture.$.ready();
  await new Promise((resolve) => fixture.$(resolve));
  assert.deepEqual(fixture.navigations, [target]);
  assert.equal(fixture.dom.window.$, pageDollar);
  assert.equal(fixture.dom.window.jQuery, undefined);
});

test('generated userscript performs WeChat DOM updates', async (t) => {
  const fixture = browser('https://mp.weixin.qq.com/s/article', '<div id="js_content"><section>https://example.com/123.</section></div>');
  t.after(() => fixture.dom.window.close());
  vm.runInNewContext(bundle, {
    window: fixture.context.window,
    document: fixture.context.document,
    jQuery: fixture.$,
    URL,
    console,
  });
  fixture.$.ready();
  await new Promise((resolve) => fixture.$(resolve));
  assert.equal(fixture.context.document.querySelector('a').getAttribute('href'), 'https://example.com/123');
  assert.deepEqual(fixture.navigations, []);
});

test('generated userscript automatically redirects t.cn/A6WDOjcb to doubanbook.plus', async (t) => {
  const html = await readFile(new URL('./fixtures/weibo-A6WDOjcb.html', import.meta.url), 'utf8');
  const fixture = browser('https://t.cn/A6WDOjcb', html);
  t.after(() => fixture.dom.window.close());

  vm.runInNewContext(bundle, {
    window: fixture.context.window,
    document: fixture.context.document,
    jQuery: fixture.$,
    URL,
    atob: fixture.context.window.atob,
    console,
  });
  fixture.$.ready();
  await new Promise((resolve) => fixture.$(resolve));

  assert.deepEqual(fixture.navigations, ['https://doubanbook.plus/']);
  assert.deepEqual(fixture.opened, []);
});
