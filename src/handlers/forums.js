import { normalizeDestination } from '../core/url.js';

export function removeFwinDialog({ document, window, url }) {
  for (const link of document.querySelectorAll('a[href]')) {
    if (!/^https?:/.test(link.href) || new URL(link.href).host === url.host) continue;
    link.addEventListener('click', () => {
      window.open(link.href, '_blank', 'noopener');
      if (typeof window.hideMenu === 'function') window.hideMenu('fwin_dialog', 'dialog');
    });
  }
}

export function enableNgaLinks({ window }) {
  if (!window.ubbcode) return false;
  window.ubbcode.showUrlAlert = (...args) => {
    const target = normalizeDestination(args[1]?.href);
    if (target) window.open(target, '_blank', 'noopener');
  };
}

export function enable360DocLinks({ document }) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('#articlecontent table tbody tr td#artContent a[href]');
    if (link) event.stopPropagation();
  }, true);
}

export function enableQQSurveyLinks({ document }) {
  document.addEventListener('click', (event) => {
    if (event.target.classList?.contains('pe-link')) event.stopPropagation();
  }, true);
}

/** Let direct external anchors use their native action before React opens a modal. */
export function enable2LibraLinks({ document, url }) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || !/^https?:$/.test(link.protocol) || link.origin === url.origin) return;
    // Keep href, target, rel and modifier keys intact; delegation also covers SPA content.
    event.stopPropagation();
  }, true);
}
