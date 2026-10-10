import { createContext, runRules } from './core/runner.js';
import { rules } from './rules/index.js';

// Tampermonkey loads jQuery through @require; keep it private to the userscript.
const $ = jQuery.noConflict(true);
$(document).ready(() => runRules(createContext(window, $), rules));
