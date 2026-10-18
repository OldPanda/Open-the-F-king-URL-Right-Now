import assert from 'node:assert/strict';
import test from 'node:test';
import { runRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { browser } from './helpers/browser.js';

// PR #163: QQ sometimes embeds the destination without escaping its query.
const reportedTarget = 'https://miaobi.baidu.com/video/preview?project_id=NVNiNsWsoTuAAdbjWcLlj0HQT6Mk5lbCv-uAnLwM2oQir5KY_6bIEr5AAv0FGROd&type=3&sub_type=1&effect=undefined&from=my&sa=';
const cases = [
  ['raw PR #163 destination', `level=14&url=${reportedTarget}`, reportedTarget],
  ['raw destination with reordered wrapper fields', 'sublevel=293&level=99&url=https://example.com/page?first=1&second=2', 'https://example.com/page?first=1&second=2'],
  ['raw escapes, plus signs, repeated and empty values, and fragment', 'url=https://example.com/a%2Fb?q=a+b&encoded=a%26b&key=one&key=two&empty=#part', 'https://example.com/a%2Fb?q=a+b&encoded=a%26b&key=one&key=two&empty=#part'],
  ['raw HTTP destination', 'url=http://example.com/page?a=1&b=2', 'http://example.com/page?a=1&b=2'],
  ['encoded destination with outer parameters after url', `level=99&url=${encodeURIComponent(reportedTarget)}&sublevel=293`, reportedTarget],
  ['encoded destination preserves its own encoding', `url=${encodeURIComponent('https://example.com/a%2Fb?q=a+b&encoded=a%26b&empty=#part')}&level=14`, 'https://example.com/a%2Fb?q=a+b&encoded=a%26b&empty=#part'],
  ['double-encoded destination', `url=${encodeURIComponent(encodeURIComponent(reportedTarget))}`, reportedTarget],
  ['encoded legitimate trailing slash', `url=${encodeURIComponent('https://example.com/path/')}&sublevel=293`, 'https://example.com/path/'],
  ['raw legitimate trailing slash', 'url=https://example.com/path/', 'https://example.com/path/'],
  ['raw tail is preserved without guessing wrapper parameter ownership', 'level=14&url=https://example.com/?level=1&sublevel=2&url=inner&next=3', 'https://example.com/?level=1&sublevel=2&url=inner&next=3'],
  ['bare-domain destination', 'url=example.com%2Fpath', 'https://example.com/path'],
];

for (const page of ['ios', 'pc', 'android']) {
  for (const [label, query, target] of cases) {
    test(`QQ ${page}: ${label}`, (t) => {
      const fixture = browser(`https://c.pc.qq.com/${page}.html?${query}`);
      t.after(() => fixture.dom.window.close());
      assert.equal(runRules(fixture.context, rules), true);
      assert.deepEqual(fixture.navigations, [target]);
      assert.deepEqual(fixture.warnings, []);
    });
  }
  for (const query of ['', 'level=14', 'url=', 'url=javascript%3Aalert(1)', 'url=https%253A%252F%252Fexample.com%252F%25ZZ']) {
    test(`QQ ${page}: invalid or missing destination (${query})`, (t) => {
      const fixture = browser(`https://c.pc.qq.com/${page}.html?${query}`);
      t.after(() => fixture.dom.window.close());
      assert.equal(runRules(fixture.context, rules), false);
      assert.deepEqual(fixture.navigations, []);
      assert.deepEqual(fixture.warnings, []);
    });
  }
}

test('QQ special parsing does not change other query redirectors', (t) => {
  const fixture = browser('https://link.zhihu.com/?target=https%3A%2F%2Fexample.com%2F%3Fa%3D1%26b%3D2&tracking=outer');
  t.after(() => fixture.dom.window.close());
  assert.equal(runRules(fixture.context, rules), true);
  assert.deepEqual(fixture.navigations, ['https://example.com/?a=1&b=2']);
});
