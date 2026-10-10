import { getDestination } from '../core/url.js';

export function redirectFromElement(selector, attribute) {
  return ({ document, navigate }) => {
    const element = document.querySelector(selector);
    return navigate(attribute ? element?.getAttribute(attribute) : element?.textContent);
  };
}

export function redirectQQDocs({ url, navigate }) {
  return navigate(getDestination(url, 'url') || getDestination(url, 'u'));
}

export function redirectWeibo({ url, document, navigate }) {
  const target = getDestination(url, 'u') || getDestination(url, 'toasturl')
    || document.querySelector('#textline')?.textContent.trim()
    || document.querySelector('.wrap .link')?.textContent.trim()
    || document.querySelector('.open-url a')?.href;
  if (!target) return false;
  const destination = new URL(target);
  destination.searchParams.delete('continueFlag');
  return navigate(destination.href);
}

export function redirectPixiv({ url, navigate }) {
  const parameter = getDestination(url, 'url');
  if (parameter) return navigate(parameter);
  // Pixiv also uses a raw destination as the entire query string.
  const target = decodeURIComponent(url.search.slice(1).replace(/=$/, ''));
  return navigate(target);
}

export function redirectBase64Path(prefix, { hash = false } = {}) {
  return ({ url, window, navigate }) => {
    const encoded = hash ? url.hash.slice(2) : url.pathname.slice(prefix.length);
    if (hash && !url.hash.startsWith('#/')) return false;
    return navigate(window.atob(encoded));
  };
}

export function redirectGamerPath({ url, navigate }) {
  return navigate(decodeURIComponent(url.href.split('/redir.php/url=')[1]));
}
