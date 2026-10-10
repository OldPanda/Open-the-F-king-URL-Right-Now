export function removeFwinDialog({ document, window, url }) {
  for (const link of document.querySelectorAll('a[href]')) {
    if (!/^https?:/.test(link.href) || new URL(link.href).host === url.host) continue;
    link.addEventListener('click', () => {
      window.open(link.href, '_blank');
      if (typeof window.hideMenu === 'function') window.hideMenu('fwin_dialog', 'dialog');
    });
  }
}

export function enableNgaLinks({ window }) {
  if (!window.ubbcode) return false;
  window.ubbcode.showUrlAlert = (...args) => window.open(args[1].href);
}

export function enable360DocLinks({ $ }) {
  $('#articlecontent table tbody tr td#artContent').find('a').off('click');
}

export function enableQQSurveyLinks({ document }) {
  document.addEventListener('click', (event) => {
    if (event.target.classList?.contains('pe-link')) event.stopPropagation();
  }, true);
}
