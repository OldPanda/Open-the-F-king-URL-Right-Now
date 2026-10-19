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
  assert.match(metadata, /@run-at\s+document-start/);
  assert.doesNotMatch(metadata, /@require/);
  assert.doesNotThrow(() => new vm.Script(bundle));
  assert.doesNotMatch(bundle, /^\s*(import|export)\s/m);
});

test('generated userscript redirects synchronously without jQuery while preserving page globals', async (t) => {
  const target = 'https://example.com/?value=a%26b#section';
  const fixture = browser(`https://link.csdn.net/?tracking=1&target=${encodeURIComponent(target)}`);
  t.after(() => fixture.dom.window.close());
  const pageDollar = () => 'page library';
  fixture.dom.window.$ = pageDollar;
  fixture.dom.window.jQuery = fixture.$;
  vm.runInNewContext(bundle, {
    window: fixture.context.window,
    document: fixture.context.document,
    URL,
    console,
  });
  assert.deepEqual(fixture.navigations, [target]);
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  assert.deepEqual(fixture.navigations, [target]);
  assert.equal(fixture.dom.window.$, pageDollar);
  assert.equal(fixture.dom.window.jQuery, fixture.$);
});

test('generated userscript performs WeChat DOM updates', async (t) => {
  const fixture = browser('https://mp.weixin.qq.com/s/article', '<div id="js_content"><section>https://example.com/123.</section></div>');
  t.after(() => fixture.dom.window.close());
  vm.runInNewContext(bundle, {
    window: fixture.context.window,
    document: fixture.context.document,
    URL,
    console,
  });
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
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
    URL,
    atob: fixture.context.window.atob,
    console,
  });
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));

  assert.deepEqual(fixture.navigations, ['https://doubanbook.plus/']);
  assert.deepEqual(fixture.opened, []);
});

for (const page of ['ios', 'pc', 'android']) {
  for (const encoded of [false, true]) {
    test(`generated userscript redirects QQ ${page} with ${encoded ? 'encoded' : 'raw'} query parameters`, async (t) => {
      const target = 'https://example.com/a%2Fb?q=a+b&value=a%26b&empty=#section';
      const query = encoded ? `${encodeURIComponent(target)}&sublevel=293` : target;
      const fixture = browser(`https://c.pc.qq.com/${page}.html?level=99&url=${query}`);
      t.after(() => fixture.dom.window.close());
      vm.runInNewContext(bundle, {
        window: fixture.context.window,
        document: fixture.context.document,
        URL,
        atob: fixture.context.window.atob,
        console,
      });
      assert.deepEqual(fixture.navigations, [target]);
      fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
      assert.deepEqual(fixture.navigations, [target]);
    });
  }
}


test('generated userscript enables native 2libra external links from dynamically added content', async (t) => {
  const fixture = browser('https://2libra.com/post/personal-works/1ZFDQFd', '<main></main>');
  t.after(() => fixture.dom.window.close());
  const metadata = bundle.split('// ==/UserScript==')[0];
  assert.match(metadata, /@match\s+https:\/\/2libra\.com\/\*/);
  let dialogs = 0;
  const main = fixture.context.document.querySelector('main');
  main.addEventListener('click', (event) => { dialogs++; event.preventDefault(); });
  vm.runInNewContext(bundle, {
    window: fixture.context.window,
    document: fixture.context.document,
    URL,
    console,
  });
  fixture.context.document.dispatchEvent(new fixture.dom.window.Event('DOMContentLoaded'));
  const target = 'https://tenyears.app/#backtest=1&symbols=ASHR&lang=zh';
  const link = fixture.context.document.createElement('a');
  link.href = target;
  link.target = '_blank';
  main.append(link);
  const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
  assert.equal(link.dispatchEvent(event), true);
  assert.equal(dialogs, 0);
  assert.equal(link.getAttribute('href'), target);
  assert.deepEqual(fixture.opened, []);
  assert.deepEqual(fixture.navigations, []);
});
