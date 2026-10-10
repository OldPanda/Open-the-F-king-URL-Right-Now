import assert from 'node:assert/strict';
import test from 'node:test';
import { createContext, matchesRule, runRules } from '../src/core/runner.js';
import { browser } from './helpers/browser.js';

test('matches exact host/path on both web protocols, regardless of query order', () => {
  const rule = { host: 'link.zhihu.com', path: '/', param: 'target' };
  assert.equal(matchesRule(new URL('http://link.zhihu.com/?other=1&target=test'), rule), true);
  for (const url of ['https://link.zhihu.com.evil.example/?target=test',
    'https://example.com/?target=test', 'https://link.zhihu.com/other?target=test',
    'ftp://link.zhihu.com/?target=test', 'https://link.zhihu.com/?other=1']) {
    assert.equal(matchesRule(new URL(url), rule), false, url);
  }
});

test('matches multi-host and regular-expression path rules', () => {
  const rule = { host: ['txc.qq.com', 'support.qq.com'], path: /^\/products?\/\d+\/link-jump$/ };
  assert.equal(matchesRule(new URL('https://txc.qq.com/product/123/link-jump'), rule), true);
  assert.equal(matchesRule(new URL('https://support.qq.com/products/456/link-jump'), rule), true);
  assert.equal(matchesRule(new URL('https://support.qq.com/products/x/link-jump'), rule), false);
});

test('runs only one matching handler', (t) => {
  const fixture = browser('https://example.com/');
  t.after(() => fixture.dom.window.close());
  let calls = 0;
  const rule = { id: 'example', host: 'example.com', path: '/', handler: () => { calls++; } };
  assert.equal(runRules(fixture.context, [rule, rule]), true);
  assert.equal(calls, 1);
  assert.equal(runRules(fixture.context, []), false);
});

test('handles invalid destinations and handler failures without uncaught exceptions', (t) => {
  const fixture = browser('https://example.com/?url=javascript%3Aalert(1)');
  t.after(() => fixture.dom.window.close());
  const rule = { id: 'example', host: 'example.com', path: '/', param: 'url' };
  assert.equal(runRules(fixture.context, [rule]), false);
  assert.deepEqual(fixture.navigations, []);
  assert.equal(runRules(fixture.context, [{ ...rule, param: undefined, handler() { throw new Error('missing element'); } }]), false);
  assert.match(fixture.warnings[0][0], /example failed/);
});

test('context validates navigation and preserves the browser boundary', () => {
  const calls = [];
  const window = { document: {}, location: { href: 'https://example.com/', replace: (value) => calls.push(value) } };
  const context = createContext(window, null);
  assert.equal(context.document, window.document);
  assert.equal(context.navigate(null), false);
  assert.equal(context.navigate('example.org/path'), true);
  assert.deepEqual(calls, ['https://example.org/path']);
});
