import assert from 'node:assert/strict';
import test from 'node:test';
import { runRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { browser } from './helpers/browser.js';

test('WeChat linkifies text while preserving anchors, code, markup, and event listeners', (t) => {
  const fixture = browser('https://mp.weixin.qq.com/s/article', `
    <div id="js_content">
      <section>
        <strong>Visit https://example.com/path?x=1&amp;y=2</strong>
        <a id="existing" href="https://existing.example/">https://existing.example/</a>
        <pre>https://code.example/</pre><code>https://inline.example/</code>
        <span class="code-snippet__js">https://snippet.example/</span>
        <span id="repeat">https://example.com/path?x=1&amp;y=2</span>
      </section>
      <section class="code-snippet__js">https://block.example/</section>
    </div>`);
  t.after(() => fixture.dom.window.close());
  const document = fixture.context.document;
  const existing = document.getElementById('existing');
  let clicks = 0;
  existing.addEventListener('click', () => { clicks++; });
  runRules(fixture.context, rules);
  assert.equal(document.querySelectorAll('#js_content a').length, 3);
  assert.equal(document.querySelector('strong a').getAttribute('href'), 'https://example.com/path?x=1&y=2');
  assert.equal(document.querySelector('strong a').textContent, 'https://example.com/path?x=1&y=2');
  assert.equal(document.querySelector('strong a').target, '_blank');
  assert.equal(document.querySelector('strong a').rel, 'noopener noreferrer');
  assert.equal(document.querySelectorAll('pre a, code a, .code-snippet__js a').length, 0);
  assert.equal(document.getElementById('existing'), existing);
  existing.dispatchEvent(new fixture.dom.window.Event('click'));
  assert.equal(clicks, 1);
  runRules(fixture.context, rules);
  assert.equal(document.querySelectorAll('#js_content a').length, 3);
  assert.equal(document.querySelectorAll('a a').length, 0);
});

test('WeChat splits adjacent URLs, preserves numeric endings, and skips loopback links', (t) => {
  const fixture = browser('https://mp.weixin.qq.com/s/article', `<div id="js_content"><section>
    https://one.example/a&&https://two.example/b
    https://example.com/123. https://example.com/abc.
    http://127.0.0.1/test http://localhost/test
  </section></div>`);
  t.after(() => fixture.dom.window.close());
  const before = fixture.context.document.querySelector('section').textContent;
  runRules(fixture.context, rules);
  assert.deepEqual([...fixture.context.document.querySelectorAll('a')].map((link) => link.getAttribute('href')), [
    'https://one.example/a', 'https://two.example/b', 'https://example.com/123', 'https://example.com/abc',
  ]);
  assert.equal(fixture.context.document.querySelector('section').textContent, before);
});

test('WeChat restores lazy images without erasing regular image sources', (t) => {
  const fixture = browser('https://mp.weixin.qq.com/s/article', `
    <img id="lazy" src="data:image/gif;base64,AA==" data-src="https://example.com/lazy.png">
    <img id="normal" src="https://example.com/normal.png">
    <img id="empty" src="https://example.com/empty.png" data-src="">
    <span class="js_img_placeholder"></span>`);
  t.after(() => fixture.dom.window.close());
  runRules(fixture.context, rules);
  const document = fixture.context.document;
  assert.equal(document.getElementById('lazy').src, 'https://example.com/lazy.png');
  assert.equal(document.getElementById('lazy').style.getPropertyPriority('width'), 'important');
  assert.equal(document.getElementById('normal').src, 'https://example.com/normal.png');
  assert.equal(document.getElementById('empty').src, 'https://example.com/empty.png');
  assert.equal(document.querySelector('.js_img_placeholder'), null);
});

test('WeChat tolerates missing article content', (t) => {
  const fixture = browser('https://mp.weixin.qq.com/s/article');
  t.after(() => fixture.dom.window.close());
  assert.equal(runRules(fixture.context, rules), true);
  assert.deepEqual(fixture.warnings, []);
});
