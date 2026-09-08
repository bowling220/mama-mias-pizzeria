import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
export default ts.config({ignores:['dist/**','node_modules/**','scripts/**','.vercel/**']},js.configs.recommended,...ts.configs.recommended,{files:['**/*.{ts,tsx,js}'],languageOptions:{globals:{...globals.browser,...globals.node}},rules:{'@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}});
