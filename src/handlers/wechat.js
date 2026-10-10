import { splitMultiURLs } from '../core/url.js';

const urlPattern = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b[-a-zA-Z0-9@:%_+.~#?&/=,$^*()-]*/g;
const excluded = 'a, pre, code, script, style, .code-snippet__js';

/** Link text nodes only, preserving existing markup, event listeners, and code blocks. */
function linkifySection(section, document, window) {
  const walker = document.createTreeWalker(section, window.NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (!walker.currentNode.parentElement.closest(excluded)) nodes.push(walker.currentNode);
  }

  for (const node of nodes) {
    const text = node.textContent;
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const match of text.matchAll(urlPattern)) {
      let innerOffset = 0;
      for (let url of splitMultiURLs(match[0])) {
        const start = match.index + match[0].indexOf(url, innerOffset);
        innerOffset = start - match.index + url.length;
        // A sentence-ending period is punctuation, including after a numeric path.
        url = url.replace(/\.$/, '');
        let parsed;
        try { parsed = new URL(url); } catch { continue; }
        if (['localhost', '127.0.0.1'].includes(parsed.hostname)) continue;

        fragment.append(text.slice(offset, start));
        const link = document.createElement('a');
        link.href = url;
        link.textContent = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        fragment.append(link);
        offset = start + url.length;
      }
    }
    if (offset > 0) {
      fragment.append(text.slice(offset));
      node.replaceWith(fragment);
    }
  }
}

export function enableWechatURLs({ document, window }) {
  for (const section of document.querySelectorAll('#js_content > section')) {
    if (!section.closest(excluded)) linkifySection(section, document, window);
  }

  for (const image of document.querySelectorAll('img[data-src]')) {
    if (!image.dataset.src) continue;
    image.src = image.dataset.src;
    image.style.cssText = 'width: 100% !important; height: auto !important; display: initial; visibility: visible !important;';
  }
  for (const placeholder of document.querySelectorAll('span.js_img_placeholder')) {
    placeholder.remove();
  }
}
