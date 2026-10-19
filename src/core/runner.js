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

/** URL-only rules can run before the page exists; DOM handlers retain ready timing. */
export function startRules(context, rules) {
  const rule = rules.find((candidate) => matchesRule(context.url, candidate));
  if (!rule) return;
  const run = () => runRules(context, [rule]);
  if (rule.param || rule.runAt === 'start') {
    run();
    return;
  }
  // Registered at document-start: let later page ready listeners (and their
  // microtasks) initialize DOM targets/globals before invoking DOM handlers.
  const defer = () => context.window.setTimeout(run, 0);
  const { document, window } = context;
  // interactive also includes the period before deferred scripts finish.
  const readyEventStarted = window.performance?.getEntriesByType?.('navigation')?.[0]?.domContentLoadedEventStart > 0;
  if (document.readyState === 'complete' || readyEventStarted) {
    defer();
    return;
  }
  const onReady = () => {
    document.removeEventListener('DOMContentLoaded', onReady);
    document.removeEventListener('readystatechange', onStateChange);
    defer();
  };
  // If navigation timing is unavailable and DOMContentLoaded was already missed,
  // complete provides a conservative fallback without executing a rule twice.
  const onStateChange = () => {
    if (document.readyState === 'complete') onReady();
  };
  document.addEventListener('DOMContentLoaded', onReady);
  document.addEventListener('readystatechange', onStateChange);
}
