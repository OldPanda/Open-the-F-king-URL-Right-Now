import assert from 'node:assert/strict';
import test from 'node:test';
import { getDestination, normalizeDestination, splitMultiURLs } from '../src/core/url.js';

test('normalizes HTTP(S), bare domains, and protocol-relative destinations', () => {
  for (const [input, expected] of [
    ['https://example.com/path?a=1#part', 'https://example.com/path?a=1#part'],
    ['http://example.com/', 'http://example.com/'],
    [' example.com/path ', 'https://example.com/path'],
    ['//example.com/path', 'https://example.com/path'],
    ['example.com:8080/path', 'https://example.com:8080/path'],
  ]) assert.equal(normalizeDestination(input), expected);
});

test('missing, malformed, and non-web destinations do not navigate', () => {
  for (const input of [null, undefined, '', ' ', 'https://', 'https://exa mple.com',
    'javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd']) {
    assert.equal(normalizeDestination(input), null, String(input));
  }
});

test('unwraps whole-URL encoding without altering encoded destination query values', () => {
  const target = 'https://example.com/path?next=a%26b&value=%2520#section';
  assert.equal(normalizeDestination(encodeURIComponent(target)), target);
  assert.equal(normalizeDestination(encodeURIComponent(encodeURIComponent(target))), target);
  assert.equal(normalizeDestination('https%3A%2F%2Fexample.com%ZZ'), null);
  assert.equal(normalizeDestination('https://example.com/100%'), 'https://example.com/100%');
  const wrapper = new URL(`https://link.zhihu.com/?other=1&target=${encodeURIComponent(target)}`);
  assert.equal(getDestination(wrapper, 'target'), target);
});

test('query extraction handles absent and empty parameters', () => {
  assert.equal(getDestination(new URL('https://example.com/?target='), 'target'), null);
  assert.equal(getDestination(new URL('https://example.com/'), 'target'), null);
});

test('decodes base64 destinations and tolerates invalid base64', () => {
  const target = 'https://example.com/?a=1&b=2';
  const wrapper = new URL(`https://example.com/?url=${encodeURIComponent(btoa(target))}`);
  assert.equal(getDestination(wrapper, 'url', { base64: true }), target);
  assert.equal(getDestination(new URL('https://example.com/?url=%%%'), 'url', { base64: true }), null);
});

test('splits concatenated article URLs and trims separators', () => {
  assert.deepEqual(splitMultiURLs('https://one.example/a&&https://two.example/b$http://three.example/c'), [
    'https://one.example/a', 'https://two.example/b', 'http://three.example/c',
  ]);
  assert.deepEqual(splitMultiURLs('https://example.com/path?key=value'), ['https://example.com/path?key=value']);
  assert.deepEqual(splitMultiURLs(''), []);
  assert.deepEqual(splitMultiURLs('plain text'), []);
});
