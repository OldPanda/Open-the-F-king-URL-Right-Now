import { getDestination, normalizeDestination } from './url.js';

export function matchesRule(url, rule) {
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  const hosts = Array.isArray(rule.host) ? rule.host : [rule.host];
  if (!hosts.includes(url.hostname)) return false;
  if (rule.param && !url.searchParams.has(rule.param)) return false;
  if (rule.path instanceof RegExp) return rule.path.test(url.pathname);
  return url.pathname === rule.path;
}

/** Inject browser dependencies so handlers can be exercised without actual navigation. */
export function createContext(window, $, logger = console) {
  return {
    window,
    document: window.document,
    url: new URL(window.location.href),
    $,
    logger,
    navigate(value) {
      const target = normalizeDestination(value);
      if (!target) return false;
      window.location.replace(target);
      return true;
    },
  };
}

/** Execute only the first matching rule to avoid competing navigation attempts. */
export function runRules(context, rules) {
  for (const rule of rules) {
    if (!matchesRule(context.url, rule)) continue;
    try {
      if (rule.param) {
        const target = getDestination(context.url, rule.param, {
          base64: rule.base64,
          decodeBase64: (value) => context.window.atob(value),
        });
        return target ? context.navigate(target) : false;
      }
      return rule.handler(context) !== false;
    } catch (error) {
      context.logger.warn(`[Open URL] ${rule.id} failed`, error);
      return false;
    }
  }
  return false;
}
