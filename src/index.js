import { createContext, startRules } from './core/runner.js';
import { rules } from './rules/index.js';

startRules(createContext(window), rules);
