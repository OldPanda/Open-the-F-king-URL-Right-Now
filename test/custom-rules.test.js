import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { runRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { browser } from './helpers/browser.js';

const target = 'https://example.com/path?a=1&b=2';
const elementCases = [
  ['https://blzxteam.com/gowild.htm?url=ignored', `<div class="_2VEbEOHfDtVWiQAJxSIrVi_0" title="${target}"></div>`],
  ['https://www.bookmarkearth.com/view/123', '<p class="link">https://example.com/path?a=1&amp;b=2</p>'],
  ['https://www.iplaysoft.com/link/?url=ignored', `<div id="targetUrl"><a href="${target}">Go</a></div>`],
  ...['paste', 'discuss', 'article'].map((path) => [`https://www.luogu.com.cn/${path}/123`, '<span id="url">https://example.com/path?a=1&amp;b=2</span>']),
  ['https://jump2.bdimg.com/safecheck/index?url=ignored', `<a class="btn" href="${target}">Go</a>`],
  ['https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi', '<p class="weui-msg__desc">https://example.com/path?a=1&amp;b=2</p>'],
  ['https://mp.weixin.qq.com/s?foo=bar', `<a id="js_access_msg" href="${target}">Go</a>`],
];

for (const [url, html] of elementCases) {
  test(`reads destination from page: ${url}`, (t) => {
    const fixture = browser(url, html);
    t.after(() => fixture.dom.window.close());
    assert.equal(runRules(fixture.context, rules), true);
    assert.deepEqual(fixture.navigations, [target]);
    assert.deepEqual(fixture.warnings, []);
  });

  test(`missing page destination is a no-op: ${url}`, (t) => {
    const fixture = browser(url);
    t.after(() => fixture.dom.window.close());
    assert.equal(runRules(fixture.context, rules), false);
    assert.deepEqual(fixture.navigations, []);
    assert.deepEqual(fixture.warnings, []);
  });
}

const embeddedCases = [
  `https://blog.51cto.com/transfer?${target}`,
  `https://www.pixiv.net/jump.php?${encodeURIComponent(target)}`,
  `https://www.pixiv.net/jump.php?url=${encodeURIComponent(target)}`,
  `https://www.pixiv.net/jump.php?${encodeURIComponent(target)}=`,
  `https://ref.gamer.com.tw/redir.php/url=${encodeURIComponent(target)}`,
  `https://unsafelink.com/${target}`,
  `https://link.mcmod.cn/target/${btoa(target)}`,
  `http://t.techlife.app/#/${btoa(target)}`,
];
for (const url of embeddedCases) {
  test(`extracts embedded destination: ${url}`, (t) => {
    const fixture = browser(url);
    t.after(() => fixture.dom.window.close());
    assert.equal(runRules(fixture.context, rules), true);
    assert.deepEqual(fixture.navigations, [target]);
  });
}

test('invalid Base64 path and absent hash never navigate', (t) => {
  for (const url of ['https://link.mcmod.cn/target/%%%', 'https://t.techlife.app/']) {
    const fixture = browser(url);
    t.after(() => fixture.dom.window.close());
    assert.equal(runRules(fixture.context, rules), false);
    assert.deepEqual(fixture.navigations, []);
  }
});

const weiboCases = [
  ['https://t.cn/abc', `<div class="wrap"><span class="link">${target}&amp;continueFlag=1</span></div>`],
  ['http://t.cn/abc', `<div class="open-url"><a href="${target}&continueFlag=1">Go</a></div>`],
  [`https://weibo.cn/sinaurl?u=${encodeURIComponent(`${target}&continueFlag=1`)}`, ''],
  [`https://weibo.cn/sinaurl?toasturl=${encodeURIComponent(`${target}&continueFlag=1`)}`, ''],
  [`https://weibo.cn/sinaurl?luicode=123&u=${encodeURIComponent(`${target}&continueFlag=1`)}`, ''],
  ['https://weibo.cn/sinaurl?luicode=123', `<div class="wrap"><span class="link">${target}&amp;continueFlag=1</span></div>`],
];

test('automatically redirects https://t.cn/A6WDOjcb to https://doubanbook.plus/', async (t) => {
  const html = await readFile(new URL('./fixtures/weibo-A6WDOjcb.html', import.meta.url), 'utf8');
  const fixture = browser('https://t.cn/A6WDOjcb', html);
  t.after(() => fixture.dom.window.close());

  assert.equal(runRules(fixture.context, rules), true);
  assert.deepEqual(fixture.navigations, ['https://doubanbook.plus/']);
  assert.deepEqual(fixture.opened, []);
  assert.deepEqual(fixture.warnings, []);
});

for (const [url, html] of weiboCases) {
  test(`resolves Weibo destination and removes continueFlag: ${url}`, (t) => {
    const fixture = browser(url, html);
    t.after(() => fixture.dom.window.close());
    assert.equal(runRules(fixture.context, rules), true);
    assert.deepEqual(fixture.navigations, [target]);
    assert.deepEqual(fixture.warnings, []);
  });
}

test('missing Weibo destination does not throw', (t) => {
  const fixture = browser('https://weibo.cn/sinaurl?luicode=123');
  t.after(() => fixture.dom.window.close());
  assert.equal(runRules(fixture.context, rules), false);
  assert.deepEqual(fixture.warnings, []);
});

test('Anime Subtitle Club opens external links and hides the dialog', (t) => {
  const fixture = browser('https://bbs.acgrip.com/topic', `
    <a id="external" href="${target}">External</a>
    <a id="internal" href="/another">Internal</a>
    <a id="script" href="javascript:void(0)">Script</a>`);
  t.after(() => fixture.dom.window.close());
  const hidden = [];
  fixture.context.window.hideMenu = (...args) => hidden.push(args);
  runRules(fixture.context, rules);
  for (const id of ['external', 'internal', 'script']) {
    fixture.context.document.getElementById(id).dispatchEvent(new fixture.dom.window.Event('click'));
  }
  assert.deepEqual(fixture.opened, [[target, '_blank', 'noopener']]);
  assert.deepEqual(hidden, [['fwin_dialog', 'dialog']]);
});

for (const host of ['nga.178.com', 'bbs.nga.cn']) {
  test(`NGA overrides the page's link alert: ${host}`, (t) => {
    const fixture = browser(`https://${host}/read.php?tid=123`);
    t.after(() => fixture.dom.window.close());
    assert.equal(runRules(fixture.context, rules), false);
    fixture.context.window.ubbcode = {};
    assert.equal(runRules(fixture.context, rules), true);
    fixture.context.window.ubbcode.showUrlAlert(null, { href: target });
    assert.deepEqual(fixture.opened, [[target, '_blank', 'noopener']]);
  });
}

test('NGA never opens executable or non-web destinations from page-controlled links', (t) => {
  const fixture = browser('https://bbs.nga.cn/read.php?tid=123');
  t.after(() => fixture.dom.window.close());
  fixture.context.window.ubbcode = {};
  runRules(fixture.context, rules);
  for (const href of ['javascript:alert(document.domain)', 'data:text/html,<script>alert(1)</script>', 'file:///etc/passwd', '']) {
    fixture.context.window.ubbcode.showUrlAlert(null, { href });
  }
  fixture.context.window.ubbcode.showUrlAlert(null);
  assert.deepEqual(fixture.opened, []);
});

test('360doc article links bypass site handlers without jQuery and preserve native actions', (t) => {
  const fixture = browser('http://www.360doc.com/content/123', '<div id="articlecontent"><table><tbody><tr><td id="artContent"><a href="https://example.com/" target="_blank"><span>Link</span></a></td></tr></tbody></table></div><button>Other</button>');
  t.after(() => fixture.dom.window.close());
  let clicks = 0;
  fixture.$('#artContent a, button').on('click', (event) => { clicks++; event.preventDefault(); });
  runRules(fixture.context, rules);
  const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
  assert.equal(fixture.context.document.querySelector('span').dispatchEvent(event), true);
  assert.equal(event.defaultPrevented, false);
  assert.equal(clicks, 0);
  fixture.context.document.querySelector('button').click();
  assert.equal(clicks, 1);
  assert.equal(fixture.context.document.querySelector('a').target, '_blank');
});

test('QQ Survey intercepts link propagation while preserving other clicks', (t) => {
  const fixture = browser('https://wj.qq.com/s2/123', '<a class="pe-link extra">Link</a><button>Other</button>');
  t.after(() => fixture.dom.window.close());
  let clicks = 0;
  fixture.context.document.addEventListener('click', () => { clicks++; });
  runRules(fixture.context, rules);
  fixture.context.document.querySelector('a').dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal(clicks, 0);
  fixture.context.document.querySelector('button').dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal(clicks, 1);
});
