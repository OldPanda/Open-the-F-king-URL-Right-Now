import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import { createContext } from '../../src/core/runner.js';

export function browser(url, html = '') {
  const dom = new JSDOM(html, { url });
  const navigations = [];
  const opened = [];
  const warnings = [];
  const window = {
    document: dom.window.document,
    NodeFilter: dom.window.NodeFilter,
    setTimeout: dom.window.setTimeout.bind(dom.window),
    location: {
      href: url,
      replace: (target) => navigations.push(target),
    },
    atob: (value) => dom.window.atob(value),
    open: (...args) => opened.push(args),
  };
  const $ = jquery(dom.window);
  const context = createContext(window, $, { warn: (...args) => warnings.push(args) });
  return { dom, context, navigations, opened, warnings, $ };
}
