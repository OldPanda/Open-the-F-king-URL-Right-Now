import { queryRules } from './query.js';
import { customRules } from './custom.js';

export const rules = [...queryRules, ...customRules];
