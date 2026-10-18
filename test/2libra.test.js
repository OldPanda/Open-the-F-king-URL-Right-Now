import assert from 'node:assert/strict';
import test from 'node:test';
import { runRules } from '../src/core/runner.js';
import { rules } from '../src/rules/index.js';
import { browser } from './helpers/browser.js';

const post = 'https://2libra.com/post/personal-works/1ZFDQFd';
const destinations = [
  'https://tenyears.app/?lang=zh',
  'https://tenyears.app/#backtest=1&symbols=ASHR&start=2013-11-06&end=2026-10-15&amount=1000&frequency=monthly&reinvest=1&range=0&lang=zh',
  'https://example.com/a%2Fb?q=a+b&value=a%26b&empty=#section',
  'http://example.com/?next=https%3A%2F%2Fexample.org%2Fa%3Fx%3D1%26y%3D2',
];

// The live site renders direct hrefs, then its React click handler cancels the
// native action and opens a confirmation dialog. Model that delegated handler.
function setup(t, url = post) {
  const fixture = browser(url, '<main><div id="content"></div></main>');
  t.after(() => fixture.dom.window.close());
  let dialogs = 0;
  fixture.context.document.querySelector('main').addEventListener('click', (event) => {
    dialogs++;
    event.preventDefault();
  });
  const handled = runRules(fixture.context, rules);
  return { ...fixture, handled, dialogs: () => dialogs };
}

for (const target of destinations) {
  test(`2libra preserves the native external link action: ${target}`, (t) => {
    const fixture = setup(t);
    assert.equal(fixture.handled, true);
    const link = fixture.context.document.createElement('a');
    link.href = target;
    link.target = '_blank';
    link.rel = 'nofollow ugc noopener noreferrer';
    link.innerHTML = '<span>Visit</span>';
    fixture.context.document.getElementById('content').append(link);
    const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    assert.equal(link.firstChild.dispatchEvent(event), true);
    assert.equal(event.defaultPrevented, false);
    assert.equal(fixture.dialogs(), 0);
    assert.equal(link.getAttribute('href'), target);
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'nofollow ugc noopener noreferrer');
    assert.deepEqual(fixture.opened, []);
    assert.deepEqual(fixture.navigations, []);
    assert.deepEqual(fixture.warnings, []);
  });
}

for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { detail: 0 }]) {
  test(`2libra keeps modifier/keyboard link activation native: ${JSON.stringify(options)}`, (t) => {
    const fixture = setup(t);
    const link = fixture.context.document.createElement('a');
    link.href = destinations[0];
    link.target = '_blank';
    fixture.context.document.querySelector('main').append(link);
    const event = new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ...options });
    assert.equal(link.dispatchEvent(event), true);
    assert.equal(event.defaultPrevented, false);
    assert.equal(fixture.dialogs(), 0);
    assert.deepEqual(fixture.opened, []);
  });
}

for (const href of ['/post/latest', '#comments', 'https://2libra.com/help/about', 'mailto:hello@example.com', 'javascript:void(0)', 'data:text/plain,hello', '']) {
  test(`2libra leaves internal and non-HTTP links to the site: ${href}`, (t) => {
    const fixture = setup(t);
    const link = fixture.context.document.createElement('a');
    link.setAttribute('href', href);
    fixture.context.document.querySelector('main').append(link);
    assert.equal(link.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true })), false);
    assert.equal(fixture.dialogs(), 1);
  });
}

test('2libra leaves buttons, anchors without href and non-element targets alone', (t) => {
  const fixture = setup(t);
  const main = fixture.context.document.querySelector('main');
  main.innerHTML = '<button>Other</button><a>No URL</a>';
  for (const element of main.children) {
    element.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  }
  assert.equal(fixture.dialogs(), 2);
  assert.doesNotThrow(() => fixture.context.document.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true })));
});

test('2libra handler stays active across client-side navigation and added content', (t) => {
  const fixture = setup(t, 'https://2libra.com/');
  fixture.dom.window.history.pushState({}, '', '/post/personal-works/1ZFDQFd');
  const main = fixture.context.document.querySelector('main');
  main.innerHTML = '<a target="_blank" href="https://tenyears.app/?lang=zh">Visit</a>';
  assert.equal(main.firstChild.dispatchEvent(new fixture.dom.window.MouseEvent('click', { bubbles: true, cancelable: true })), true);
  assert.equal(fixture.dialogs(), 0);
});

test('2libra handler does not run on unrelated hosts', (t) => {
  assert.equal(setup(t, 'https://example.com/post/personal-works/1ZFDQFd').handled, false);
});
