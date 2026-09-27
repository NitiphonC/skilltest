/* =========================================================================
   interpreter.js — ตัวแปลเกรชชัน JavaScript เขียนเอง ใช้สอน + debug
   รองรับ: var/let/const, function, arrow, if/else, for, for..of, for..in,
           while, do..while, switch, try/catch/finally, break/continue,
           destructuring, spread, template literal, optional chaining,
           ternary, ++/--, compound assign, Map/Set, builtins ที่ใช้ทั่วไป
   ทุก statement คืนค่าเป็น generator step ได้ → ใช้เดินทีละบรรทัดได้
   ========================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Interp = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ============================ TOKENIZER ============================ */
  const KEYWORDS = new Set(['const','let','var','function','return','if','else','for','while',
    'do','break','continue','switch','case','default','try','catch','finally','throw','new',
    'typeof','instanceof','in','of','null','undefined','true','false','this','delete','void','async','await']);

  const PUNCT = ['>>>=','...','===','!==','**=','<<=','>>=','>>>','&&=','||=','??=','=>','==','!=','<=','>=',
    '&&','||','??','?.','++','--','+=','-=','*=','/=','%=','&=','|=','^=','**','<<','>>',
    '{','}','(',')','[',']',';',',','<','>','+','-','*','/','%','&','|','^','!','~','?',':','=','.'];

  function SyntaxErr(msg, line, col) {
    const e = new Error(msg);
    e.name = 'SyntaxError'; e.line = line; e.col = col; e.isSyntax = true;
    return e;
  }

  function tokenize(src) {
    const t = []; let i = 0; const n = src.length;
    let line = 1, col = 1;
    const push = (type, value) => t.push({ type, value, line, col });
    const adv = k => { for (let j = 0; j < k; j++){ if (src[i] === '\n'){ line++; col = 1; } else col++; i++; } };

    while (i < n) {
      const c = src[i];

      if (c === ' ' || c === '\t' || c === '\r' || c === '\n'){ adv(1); continue; }

      /* comment */
      if (c === '/' && src[i + 1] === '/'){ while (i < n && src[i] !== '\n') adv(1); continue; }
      if (c === '/' && src[i + 1] === '*'){
        adv(2);
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) adv(1);
        adv(2); continue;
      }

      /* string */
      if (c === '"' || c === "'"){
        const q = c; const s = i; adv(1); let val = '';
        while (i < n && src[i] !== q){
          if (src[i] === '\\'){ val += unescapeChar(src[i + 1]); adv(2); }
          else { val += src[i]; adv(1); }
        }
        if (i >= n) throw SyntaxErr('Unterminated string', line, col);
        adv(1);
        push('str', val); continue;
      }

      /* template literal */
      if (c === '`'){
        const startLine = line;
        adv(1);
        const quasis = []; const exprs = [];
        let cur = '';
        while (i < n && src[i] !== '`'){
          if (src[i] === '\\'){ cur += unescapeChar(src[i + 1]); adv(2); continue; }
          if (src[i] === '$' && src[i + 1] === '{'){
            quasis.push(cur); cur = '';
            adv(2);
            const estart = i, eline = line, ecol = col;
            let depth = 1;
            while (i < n && depth > 0){
              const ch = src[i];
              if (ch === '{') depth++;
              else if (ch === '}'){ depth--; if (depth === 0) break; }
              else if (ch === '"' || ch === "'" || ch === '`'){
                const q2 = ch; adv(1);
                while (i < n && src[i] !== q2){ if (src[i] === '\\') adv(1); adv(1); }
              }
              adv(1);
            }
            const sub = src.slice(estart, i);
            adv(1);
            exprs.push({ code: sub, line: eline, col: ecol });
            continue;
          }
          cur += src[i]; adv(1);
        }
        if (i >= n) throw SyntaxErr('Unterminated template literal', startLine, col);
        adv(1);
        quasis.push(cur);
        push('template', { quasis, exprs });
        continue;
      }

      /* number */
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))){
        const s = i;
        if (c === '0' && /[xXbBoO]/.test(src[i + 1] || '')){
          adv(2); while (i < n && /[0-9a-fA-F]/.test(src[i])) adv(1);
        } else {
          while (i < n && /[0-9]/.test(src[i])) adv(1);
          if (src[i] === '.'){ adv(1); while (i < n && /[0-9]/.test(src[i])) adv(1); }
          if (/[eE]/.test(src[i] || '')){ adv(1); if (/[+-]/.test(src[i] || '')) adv(1); while (i < n && /[0-9]/.test(src[i])) adv(1); }
        }
        push('num', Number(src.slice(s, i))); continue;
      }

      /* identifier */
      if (/[A-Za-z_$]/.test(c)){
        const s = i;
        while (i < n && /[A-Za-z0-9_$]/.test(src[i])) adv(1);
        const w = src.slice(s, i);
        push(KEYWORDS.has(w) ? 'kw' : 'name', w);
        continue;
      }

      /* punctuation */
      let matched = null;
      for (const p of PUNCT) if (src.startsWith(p, i)){ matched = p; break; }
      if (matched){
        /* ?? and ?. must not swallow a digit (1?.5 is invalid anyway) */
        adv(matched.length);
        push('punc', matched); continue;
      }

      throw SyntaxErr('Unexpected character ' + JSON.stringify(c), line, col);
    }
    push('eof', null);
    return t;
  }

  function unescapeChar(c) {
    switch (c) {
      case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r';
      case 'b': return '\b'; case 'f': return '\f'; case 'v': return '\v';
      case '0': return '\0';
      default: return c;
    }
  }

  /* ============================== PARSER ============================= */
  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = (k = 0) => toks[Math.min(p + k, toks.length - 1)];
    const at = (v) => { const t = peek(); return (t.type === 'punc' || t.type === 'kw') && t.value === v; };
    const atT = (ty, v) => { const t = peek(); return t.type === ty && (v === undefined || t.value === v); };
    const next = () => toks[p++];
    const eat = (v) => { if (at(v)){ p++; return true; } return false; };
    const expect = (v) => {
      if (!eat(v)) throw SyntaxErr("Expected '" + v + "' but found '" + (peek().value ?? 'end of input') + "'", peek().line, peek().col);
    };
    const node = (type, line, extra) => Object.assign({ type, line: line ?? peek().line }, extra);

    /* ---- program ---- */
    function parseProgram() {
      const body = [];
      while (!atT('eof')) body.push(parseStatement());
      return node('Program', 1, { body });
    }

    /* ---- statements ---- */
    function parseStatement() {
      const t = peek(); const ln = t.line;

      if (at(';')){ next(); return node('Empty', ln); }
      if (at('{')) return parseBlock();

      if (atT('kw')) {
        switch (t.value) {
          case 'const': case 'let': case 'var': {
            next();
            const decls = [];
            do {
              const id = parseBindingTarget();
              let init = null;
              if (eat('=')) init = parseAssign();
              decls.push({ id, init });
            } while (eat(','));
            eat(';');
            return node('VarDecl', ln, { kind: t.value, decls });
          }
          case 'function': {
            next();
            const id = parseBindingTarget();
            const fn = parseFunctionRest(false);
            return node('FunctionDecl', ln, { id, params: fn.params, body: fn.body });
          }
          case 'return': {
            next();
            let arg = null;
            if (!at(';') && !at('}') && !atT('eof') && !toksLineHasNL()) arg = parseExpression();
            eat(';');
            return node('Return', ln, { arg });
          }
          case 'if': {
            next(); expect('(');
            const test = parseExpression(); expect(')');
            const cons = parseStatement();
            let alt = null;
            if (at('else')){ next(); alt = parseStatement(); }
            return node('If', ln, { test, cons, alt });
          }
          case 'while': {
            next(); expect('(');
            const test = parseExpression(); expect(')');
            const body = parseStatement();
            return node('While', ln, { test, body });
          }
          case 'do': {
            next();
            const body = parseStatement();
            if (!eat('while')) throw SyntaxErr("Expected 'while'", peek().line, peek().col);
            expect('('); const test = parseExpression(); expect(')'); eat(';');
            return node('DoWhile', ln, { test, body });
          }
          case 'for': return parseFor();
          case 'break': { next(); eat(';'); return node('Break', ln); }
          case 'continue': { next(); eat(';'); return node('Continue', ln); }
          case 'switch': return parseSwitch();
          case 'try': return parseTry();
          case 'throw': { next(); const arg = parseExpression(); eat(';'); return node('Throw', ln, { arg }); }
        }
      }

      const expr = parseExpression(); eat(';');
      return node('ExprStmt', ln, { expr });
    }

    function toksLineHasNL(){ return false; }

    function parseBlock() {
      const ln = peek().line;
      expect('{');
      const body = [];
      while (!at('}')) {
        if (atT('eof')) throw SyntaxErr("Expected '}'", peek().line, peek().col);
        body.push(parseStatement());
      }
      expect('}');
      return node('Block', ln, { body });
    }

    function parseFor() {
      const ln = peek().line;
      expect('for'); expect('(');
      let init = null;
      if (!at(';')){
        if (atT('kw', 'const') || atT('kw', 'let') || atT('kw', 'var')){
          const kind = next().value;
          const id = parseBindingTarget();
          if (atT('kw', 'of') || atT('kw', 'in')){
            const isOf = next().value === 'of';
            const right = isOf ? parseAssign() : parseExpression();
            expect(')');
            return node(isOf ? 'ForOf' : 'ForIn', ln, { kind, id, right, body: parseStatement() });
          }
          const decls = [{ id, init: eat('=') ? parseAssign() : null }];
          while (eat(',')){ const i2 = parseBindingTarget(); decls.push({ id: i2, init: eat('=') ? parseAssign() : null }); }
          init = node('VarDecl', ln, { kind, decls });
        } else {
          init = node('ExprStmt', ln, { expr: parseExpression() });
        }
      }
      expect(';');
      const test = at(';') ? null : parseExpression();
      expect(';');
      const update = at(')') ? null : parseExpression();
      expect(')');
      return node('For', ln, { init, test, update, body: parseStatement() });
    }

    function parseSwitch() {
      const ln = peek().line;
      expect('switch'); expect('(');
      const disc = parseExpression(); expect(')'); expect('{');
      const cases = [];
      while (!at('}')){
        let test = null;
        if (eat('case')) test = parseExpression();
        else if (eat('default')) test = null;
        else throw SyntaxErr("Expected 'case' or 'default'", peek().line, peek().col);
        expect(':');
        const body = [];
        while (!at('}') && !at('case') && !at('default')) body.push(parseStatement());
        cases.push({ test, body });
      }
      expect('}');
      return node('Switch', ln, { disc, cases });
    }

    function parseTry() {
      const ln = peek().line;
      expect('try');
      const block = parseBlock();
      let param = null, handler = null, finalizer = null;
      if (eat('catch')){
        if (eat('(')){ param = parseBindingTarget(); expect(')'); }
        handler = parseBlock();
      }
      if (eat('finally')) finalizer = parseBlock();
      if (!handler && !finalizer) throw SyntaxErr('Missing catch or finally after try', ln, 1);
      return node('Try', ln, { block, param, handler, finalizer });
    }

    function parseBindingTarget() {
      if (at('[')) return parseArrayPattern();
      if (at('{')) return parseObjectPattern();
      return parseIdent();
    }

    function parseIdent() {
      const t = peek();
      if (t.type === 'name'){ next(); return node('Ident', t.line, { name: t.value }); }
      if (t.type === 'kw' && (t.value === 'of' || t.value === 'in')) return node('Ident', t.line, { name: t.value });
      throw SyntaxErr('Expected identifier but found ' + JSON.stringify(t.value), t.line, t.col);
    }

    function parseArrayPattern() {
      const ln = peek().line;
      expect('[');
      const elems = [];
      while (!at(']')){
        if (eat(',')){ elems.push(null); continue; }
        if (eat('...')){ elems.push({ rest: true, target: parseBindingTarget() }); }
        else {
          const target = parseBindingTarget();
          elems.push({ target, def: eat('=') ? parseAssign() : null });
        }
        if (!at(']')) expect(',');
      }
      expect(']');
      return node('ArrayPattern', ln, { elems });
    }

    function parseObjectPattern() {
      const ln = peek().line;
      expect('{');
      const props = [];
      while (!at('}')){
        if (eat('...')){ props.push({ rest: true, target: parseIdent() }); }
        else {
          let key;
          if (at('[')){ next(); key = node('Computed', ln, { expr: parseAssign() }); expect(']'); }
          else { const t = next(); key = { type: 'Literal', value: String(t.value), line: t.line }; }
          let target;
          if (eat(':')) target = parseBindingTarget();
          else target = node('Ident', key.line, { name: key.value });
          props.push({ key, target, def: eat('=') ? parseAssign() : null });
        }
        if (!at('}')) expect(',');
      }
      expect('}');
      return node('ObjectPattern', ln, { props });
    }

    /* ---- expressions ---- */
    function parseExpression() {
      let e = parseAssign();
      while (at(',')){ const ln = peek().line; next(); const r = parseAssign(); e = node('Sequence', ln, { left: e, right: r }); }
      return e;
    }

    const ASSIGN_OPS = new Set(['=','+=','-=','*=','/=','%=','**=','&&=','||=','??=','&=','|=','^=','<<=','>>=','>>>=']);

    function parseAssign() {
      const arrow = tryParseArrow();
      if (arrow) return arrow;
      const left = parseConditional();
      const t = peek();
      if (t.type === 'punc' && ASSIGN_OPS.has(t.value)){
        const ln = t.line; next();
        const right = parseAssign();
        return node('Assign', ln, { op: t.value, left, right });
      }
      return left;
    }

    function tryParseArrow() {
      const start = p;
      let isAsync = false;
      if (atT('kw', 'async') && !peek(1) || (atT('kw','async') && at(1) === '(') || (atT('kw','async') && peek(1).type === 'name')){
        next(); isAsync = true;
      }
      /* ident => */
      if (peek().type === 'name' && peek(1).type === 'punc' && peek(1).value === '=>'){
        const ln = peek().line; const name = next().value; next();
        if (at('{')) return node('Arrow', ln, { params: [node('Ident', ln, { name })], body: parseBlock(), expr: false });
        return node('Arrow', ln, { params: [node('Ident', ln, { name })], body: parseAssign(), expr: true });
      }
      /* ( ... ) => */
      if (at('(') || atT('kw','async') || at('[')){
        try {
          const params = at('[') ? [parseArrayPattern()] : parseParams();
          if (at('=>')){
            const ln = toks[start].line; next();
            if (at('{')) return node('Arrow', ln, { params, body: parseBlock(), expr: false });
            return node('Arrow', ln, { params, body: parseAssign(), expr: true });
          }
        } catch (e){ /* not an arrow */ }
        p = start;
        return null;
      }
      p = start;
      return null;
    }

    function parseParams() {
      expect('(');
      const params = [];
      while (!at(')')){
        if (eat('...')) params.push(node('Rest', peek().line, { target: parseBindingTarget() }));
        else {
          const target = parseBindingTarget();
          params.push(node('Param', target.line, { target, def: eat('=') ? parseAssign() : null }));
        }
        if (!at(')')) expect(',');
      }
      expect(')');
      return params;
    }

    function parseFunctionRest() {
      const params = parseParams();
      return { params, body: parseBlock() };
    }

    function parseConditional() {
      const test = parseBinary(0);
      if (at('?')){
        const ln = peek().line; next();
        const cons = parseAssign();
        expect(':');
        const alt = parseAssign();
        return node('Conditional', ln, { test, cons, alt });
      }
      return test;
    }

    const BIN_PREC = {
      '??': 1, '||': 2, '&&': 3, '|': 4, '^': 5, '&': 6,
      '==': 7, '!=': 7, '===': 7, '!==': 7,
      '<': 8, '>': 8, '<=': 8, '>=': 8, 'in': 8, 'instanceof': 8,
      '<<': 9, '>>': 9, '>>>': 9,
      '+': 10, '-': 10,
      '*': 11, '/': 11, '%': 11,
      '**': 12
    };

    function parseBinary(minPrec) {
      let left = parseUnary();
      for (;;) {
        const t = peek();
        const op = t.value;
        const prec = (t.type === 'punc' || t.type === 'kw') ? BIN_PREC[op] : undefined;
        if (prec === undefined || prec < minPrec) break;
        const ln = t.line; next();
        const right = parseBinary(op === '**' ? prec : prec + 1);
        left = node('Binary', ln, { op, left, right });
      }
      return left;
    }

    function parseUnary() {
      const t = peek();
      if (t.type === 'punc' && (t.value === '!' || t.value === '-' || t.value === '+' || t.value === '~')){
        const ln = t.line; next();
        return node('Unary', ln, { op: t.value, arg: parseUnary() });
      }
      if (t.type === 'kw' && (t.value === 'typeof' || t.value === 'void' || t.value === 'delete')){
        const ln = t.line; next();
        return node('Unary', ln, { op: t.value, arg: parseUnary() });
      }
      if (t.type === 'punc' && (t.value === '++' || t.value === '--')){
        const ln = t.line; next();
        return node('Update', ln, { op: t.value, prefix: true, arg: parseUnary() });
      }
      if (t.type === 'kw' && t.value === 'await'){ const ln = t.line; next(); return node('Await', ln, { arg: parseUnary() }); }
      if (t.type === 'kw' && t.value === 'new'){
        const ln = t.line; next();
        let callee = parsePrimary();
        /* new X.y.z(...) — อ่านสมาชิกได้แต่ห้ามกินวงเล็บของ argument */
        for (;;) {
          if (at('.')) { next(); const nm = next(); callee = node('Member', ln, { obj: callee, prop: { type:'Literal', value:String(nm.value), line:nm.line }, optional:false }); }
          else if (at('[')) { next(); const ix = parseExpression(); expect(']'); callee = node('Member', ln, { obj: callee, prop: ix, optional:false }); }
          else break;
        }
        let args = [];
        if (at('(')) args = parseArguments();
        /* ต้องต่อ postfix ต่อได้ ไม่งั้น new Array(n).fill(0) จะตัด .fill(0) ทิ้ง
           (เช่นเดียวกับ foo().bar() ที่ต้องผ่าน parsePostfix) */
        return parseMemberOnly(node('New', ln, { callee, args }));
      }
      let e = parsePostfix();
      return e;
    }

    function parsePostfix() {
      let e = parseMemberOnly(parsePrimary());
      const t = peek();
      if (t.type === 'punc' && (t.value === '++' || t.value === '--') && !t.lineBreakBefore){
        const ln = t.line; next();
        e = node('Update', ln, { op: t.value, prefix: false, arg: e });
      }
      return e;
    }

    function parseMemberOnly(e) {
      for (;;) {
        if (at('.')){
          const ln = peek().line; next();
          const name = next();
          e = node('Member', ln, { obj: e, prop: { type: 'Literal', value: String(name.value), line: name.line }, optional: false });
        } else if (at('?.')){
          const ln = peek().line; next();
          if (at('(')){ const args = parseArguments(); e = node('Call', ln, { callee: e, args, optional: true }); continue; }
          if (at('[')){ next(); const idx = parseExpression(); expect(']'); e = node('Member', ln, { obj: e, prop: idx, optional: true }); continue; }
          const name = next();
          e = node('Member', ln, { obj: e, prop: { type: 'Literal', value: String(name.value), line: name.line }, optional: true });
        } else if (at('[')){
          const ln = peek().line; next();
          const prop = parseExpression(); expect(']');
          e = node('Member', ln, { obj: e, prop, optional: false });
        } else if (at('(')){
          const ln = peek().line;
          const args = parseArguments();
          e = node('Call', ln, { callee: e, args, optional: false });
        } else if (atT('eof')){ break; }
        else break;
      }
      return e;
    }

    function parseArguments() {
      expect('(');
      const args = [];
      while (!at(')')){
        if (eat('...')) args.push(node('Spread', peek().line, { arg: parseAssign() }));
        else args.push(parseAssign());
        if (!at(')')) expect(',');
      }
      expect(')');
      return args;
    }

    function parsePrimary() {
      const t = peek();
      if (t.type === 'num'){ next(); return node('Literal', t.line, { value: t.value }); }
      if (t.type === 'str'){ next(); return node('Literal', t.line, { value: t.value }); }
      if (t.type === 'template'){
        next();
        return node('Template', t.line, { quasis: t.value.quasis, exprs: t.value.exprs.map(e => parseSub(e.code, e.line)) });
      }
      if (t.type === 'name'){ next(); return node('Ident', t.line, { name: t.value }); }

      if (t.type === 'kw'){
        switch (t.value) {
          case 'true': next(); return node('Literal', t.line, { value: true });
          case 'false': next(); return node('Literal', t.line, { value: false });
          case 'null': next(); return node('Literal', t.line, { value: null });
          case 'undefined': next(); return node('Ident', t.line, { name: 'undefined' });
          case 'this': next(); return node('This', t.line);
          case 'function': {
            next();
            let id = null;
            if (peek().type === 'name') id = next().value;
            const fn = parseFunctionRest();
            return node('FunctionExpr', t.line, { name: id, params: fn.params, body: fn.body });
          }
        }
      }

      if (at('(')){ next(); const e = parseExpression(); expect(')'); return node('Paren', t.line, { expr: e }); }
      if (at('[')){
        next();
        const elems = [];
        while (!at(']')){
          if (eat(',')){ elems.push(null); continue; }
          if (eat('...')) elems.push(node('Spread', peek().line, { arg: parseAssign() }));
          else elems.push(parseAssign());
          if (!at(']')) expect(',');
        }
        expect(']');
        return node('ArrayLit', t.line, { elems });
      }
      if (at('{')){
        next();
        const props = [];
        while (!at('}')){
          if (eat('...')){ props.push({ spread: true, arg: parseAssign() }); }
          else {
            let key, computed = false;
            if (at('[')){ next(); key = parseAssign(); computed = true; expect(']'); }
            else if (peek().type === 'num' || peek().type === 'str'){ const kt = next(); key = { type: 'Literal', value: String(kt.value), line: kt.line }; }
            else if (at('[')) { /* unreachable */ }
            else { const kt = next(); key = { type: 'Literal', value: String(kt.value), line: kt.line }; }
            if (eat(':')) props.push({ key, value: parseAssign(), computed });
            else props.push({ key, value: key, computed: false, shorthand: true });
          }
          if (!at('}')) expect(',');
        }
        expect('}');
        return node('ObjectLit', t.line, { props });
      }

      throw SyntaxErr('Unexpected token ' + JSON.stringify(t.value), t.line, t.col);
    }

    function parseSub(code, line) {
      const sub = parse(code);
      return sub.body[0] ? sub.body[0].expr || sub.body[0] : node('Literal', line, { value: undefined });
    }

    return parseProgram();
  }

  /* ============================ INTERPRETER ============================ */
  const BREAK = { sig: '@@break' };
  const CONTINUE = { sig: '@@continue' };
  const RETURN = { sig: '@@return' };

  function newScope(parent) { return Object.create(parent || null); }
  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function lookup(scope, name) { return scope[name]; }
  function declare(scope, name, v) { scope[name] = v; }
  function assignVar(scope, name, v) {
    let s = scope;
    while (s){ if (hasOwn(s, name)){ s[name] = v; return true; } s = Object.getPrototypeOf(s); }
    return false;
  }

  const MAX_DEPTH = 400;

  function RuntimeError(name, msg, line) {
    const e = new Error(msg); e.name = name; e.line = line; e.isRuntime = true; return e;
  }

  function createRunner(ast, opts) {
    const out = [];
    let steps = 0;
    const maxSteps = (opts && opts.maxSteps) || 2000000;
    let stopped = false;

    const ctx = {
      out,
      line: 0,
      step(n) { steps += (n || 1); return steps > maxSteps; },
      stack: []
    };

    /* ---------- helpers ---------- */
    function* tick(node, env) {
      ctx.line = node.line;
      yield { type: 'step', line: node.line, scope: env, out: out.length, node: node };
    }

    function* evalExpr(node, env) {
      switch (node.type) {
        case 'Literal': return node.value;
        case 'Paren': return yield* evalExpr(node.expr, env);
        case 'Ident': {
          if (node.name === 'undefined') return undefined;
          const v = lookup(env, node.name);
          if (v === undefined && !hasOwn(env, node.name) && !hasAncestor(env, node.name))
            throw RuntimeError('ReferenceError', node.name + ' is not defined', node.line);
          return v;
        }
        case 'This': return undefined;
        case 'Template': {
          let s = node.quasis[0];
          for (let i = 0; i < node.exprs.length; i++){
            const v = yield* evalExpr(node.exprs[i], env);
            s += toStr(v) + node.quasis[i + 1];
          }
          return s;
        }
        case 'ArrayLit': {
          const arr = [];
          for (const el of node.elems){
            if (el === null){ arr.length++; continue; }
            if (el.type === 'Spread'){
              const v = yield* evalExpr(el.arg, env);
              if (Array.isArray(v)) arr.push(...v);
              else if (typeof v === 'string') arr.push(...v);
              else if (v && typeof v[Symbol.iterator] === 'function') arr.push(...v);
              else arr.push(v);
              continue;
            }
            arr.push(yield* evalExpr(el, env));
          }
          return arr;
        }
        case 'ObjectLit': {
          const o = {};
          for (const pr of node.props){
            if (pr.spread){
              const v = yield* evalExpr(pr.arg, env);
              if (v && typeof v === 'object') Object.assign(o, v);
              continue;
            }
            const k = pr.computed ? String(yield* evalExpr(pr.key, env)) : pr.key.value;
            o[k] = yield* evalExpr(pr.value, env);
          }
          return o;
        }
        case 'Sequence': {
          yield* evalExpr(node.left, env);
          return yield* evalExpr(node.right, env);
        }
        case 'Conditional':
          return (yield* evalExpr(node.test, env)) ? yield* evalExpr(node.cons, env) : yield* evalExpr(node.alt, env);
        case 'Unary': {
          const v = yield* evalExpr(node.arg, env);
          switch (node.op){
            case '!': return !v;
            case '-': return -v;
            case '+': return +v;
            case '~': return ~v;
            case 'typeof': return typeof v;
            case 'void': return undefined;
            case 'delete': return true;
          }
          return v;
        }
        case 'Update': {
          const old = toNum(yield* evalExpr(node.arg, env));
          const nv = node.op === '++' ? old + 1 : old - 1;
          yield* storeTo(node.arg, nv, env);
          return node.prefix ? nv : old;
        }
        case 'Binary': return yield* evalBinary(node, env);
        case 'Logical': {
          const l = yield* evalExpr(node.left, env);
          if (node.op === '&&') return l ? yield* evalExpr(node.right, env) : l;
          if (node.op === '||') return l ? l : yield* evalExpr(node.right, env);
          return (l === null || l === undefined) ? yield* evalExpr(node.right, env) : l;
        }
        case 'Assign': {
          if (node.op === '='){
            const v = yield* evalExpr(node.right, env);
            yield* storeTo(node.left, v, env);
            return v;
          }
          if (node.op === '&&=' || node.op === '||=' || node.op === '??='){
            const cur = yield* evalExpr(node.left, env);
            const doIt = node.op === '&&=' ? cur
              : node.op === '||=' ? !cur
              : (cur === null || cur === undefined);
            if (!doIt) return cur;
            const v = yield* evalExpr(node.right, env);
            yield* storeTo(node.left, v, env);
            return v;
          }
          const cur = yield* evalExpr(node.left, env);
          const r = yield* evalExpr(node.right, env);
          const v = applyBinary(node.op.slice(0, -1), cur, r, node.line);
          yield* storeTo(node.left, v, env);
          return v;
        }
        case 'ArrayPattern': case 'ObjectPattern':
          throw RuntimeError('SyntaxError', 'Destructuring is not valid here', node.line);
        case 'Arrow': case 'FunctionExpr': case 'FunctionDecl':
          return makeFunction(node, env, ctx);
        case 'New': {
          const args = yield* evalArgs(node.args, env);
          const C = yield* evalExpr(node.callee, env);
          return yield* construct(C, args, node.line);
        }
        case 'Member': {
          const o = yield* evalExpr(node.obj, env);
          if ((o === null || o === undefined) && node.optional) return undefined;
          if (o === null || o === undefined) throw RuntimeError('TypeError', "Cannot read properties of " + String(o) + " (reading '" + propName(node.prop) + "')", node.line);
          const k = node.prop.type === 'Literal' ? node.prop.value : String(yield* evalExpr(node.prop, env));
          if (o instanceof InterpFn) return o.getMember(k, env);
          return readMember(o, k, node.line);
        }
        case 'Call': {
          let callee = node.callee;
          let thisVal;
          if (callee.type === 'Member'){
            const o = yield* evalExpr(callee.obj, env);
            if ((o === null || o === undefined) && callee.optional) return undefined;
            if (o === null || o === undefined) throw RuntimeError('TypeError', "Cannot read properties of " + String(o), node.line);
            thisVal = o;
            callee = { type: 'Member', obj: callee.obj, prop: callee.prop, line: callee.line, optional: false };
          }
          const args = yield* evalArgs(node.args, env);
          if (callee.type === 'Arrow' || callee.type === 'FunctionExpr' || callee.type === 'FunctionDecl'){
            return yield* callFunction(makeFunction(callee, env, ctx), args, node.line);
          }
          const f = yield* evalExpr(callee, env);
          if (f instanceof InterpFn){
            if (node.optional && (f === undefined || f === null)) return undefined;
            return yield* callFunction(f, args, node.line, thisVal);
          }
          return yield* callNative(f, thisVal, args, node.line);
        }
        case 'Await': return yield* evalExpr(node.arg, env);
        case 'Spread': throw RuntimeError('SyntaxError', 'Unexpected spread', node.line);
      }
      throw RuntimeError('SyntaxError', 'Unsupported expression ' + node.type, node.line);
    }

    function propName(prop) {
      if (prop.type === 'Literal') return String(prop.value);
      return 'computed';
    }

    function* evalArgs(nodes, env) {
      const args = [];
      for (const a of nodes){
        if (a.type === 'Spread'){
          const v = yield* evalExpr(a.arg, env);
          if (Array.isArray(v)) args.push(...v);
          else if (typeof v === 'string') args.push(...v);
          else if (v && typeof v[Symbol.iterator] === 'function') args.push(...v);
          continue;
        }
        args.push(yield* evalExpr(a, env));
      }
      return args;
    }

    /* Math.min / Math.max / Number.isInteger ฯลฯ คืนค่าธรรมดา ไม่ใช่ generator */
    function* mathCall(fn, args, line) {
      const spread = [];
      for (const a of args) { if (Array.isArray(a)) spread.push(...a); else spread.push(a); }
      return fn.apply(null, spread.map(x => typeof x === 'boolean' ? Number(x) : x));
    }

    function* evalBinary(node, env) {
      /* short-circuit สำหรับ && || ?? (parser เก็บเป็น Binary) */
      if (node.op === '&&' || node.op === '||' || node.op === '??'){
        const l = yield* evalExpr(node.left, env);
        if (node.op === '&&') return l ? (yield* evalExpr(node.right, env)) : l;
        if (node.op === '||') return l ? l : (yield* evalExpr(node.right, env));
        return (l === null || l === undefined) ? (yield* evalExpr(node.right, env)) : l;
      }
      if (node.op === 'in'){
        const o = yield* evalExpr(node.right, env);
        const k = yield* evalExpr(node.left, env);
        return o != null && hasOwn(o, k);
      }
      if (node.op === 'instanceof'){
        const C = yield* evalExpr(node.right, env);
        const v = yield* evalExpr(node.left, env);
        return v instanceof InterpFn ? v.ctor : false;
      }
      const l = yield* evalExpr(node.left, env);
      const r = yield* evalExpr(node.right, env);
      return applyBinary(node.op, l, r, node.line);
    }

    function applyBinary(op, l, r, line) {
      switch (op){
        case '+': {
          if (typeof l === 'string' || typeof r === 'string') return toStr(l) + toStr(r);
          return toNum(l) + toNum(r);
        }
        case '-': return toNum(l) - toNum(r);
        case '*': return toNum(l) * toNum(r);
        case '/': return toNum(l) / toNum(r);
        case '%': return toNum(l) % toNum(r);
        case '**': return Math.pow(toNum(l), toNum(r));
        case '==': return looseEq(l, r);
        case '!=': return !looseEq(l, r);
        case '===': return strictEq(l, r);
        case '!==': return !strictEq(l, r);
        case '<': return compare(l, r) < 0;
        case '>': return compare(l, r) > 0;
        case '<=': return compare(l, r) <= 0;
        case '>=': return compare(l, r) >= 0;
        case '&': return toNum(l) & toNum(r);
        case '|': return toNum(l) | toNum(r);
        case '^': return toNum(l) ^ toNum(r);
        case '<<': return toNum(l) << toNum(r);
        case '>>': return toNum(l) >> toNum(r);
        case '>>>': return toNum(l) >>> toNum(r);
      }
      throw RuntimeError('SyntaxError', 'Unsupported operator ' + op, line);
    }

    function compare(l, r) {
      if (typeof l === 'string' && typeof r === 'string') return l < r ? -1 : l > r ? 1 : 0;
      const a = toNum(l), b = toNum(r);
      return a < b ? -1 : a > b ? 1 : 0;
    }

    function* storeTo(target, value, env) {
      if (target.type === 'Ident'){
        if (!assignVar(env, target.name, value)) declare(env, target.name, value);
        return;
      }
      if (target.type === 'Member'){
        const o = yield* evalExpr(target.obj, env);
        if (o === null || o === undefined) throw RuntimeError('TypeError', "Cannot set properties of " + String(o), target.line);
        const k = target.prop.type === 'Literal' ? target.prop.value : String(yield* evalExpr(target.prop, env));
        if (o instanceof InterpFn) return o.setMember(k, value);
        if (Array.isArray(o)){
          if (k === 'length'){ o.length = toNum(value); return; }
          const idx = toNum(k);
          if (idx >= 0){ o[idx] = value; return; }
        }
        if (o instanceof Map){ o.set(String(k), value); return; }
        if (o instanceof Set){ return; }
        o[k] = value;
        return;
      }
      throw RuntimeError('SyntaxError', 'Invalid assignment target', target.line);
    }

    function hasAncestor(scope, name) {
      let s = Object.getPrototypeOf(scope);
      while (s){ if (hasOwn(s, name)) return true; s = Object.getPrototypeOf(s); }
      return false;
    }

    /* ---------- statements ---------- */
    function* execBlock(stmts, env) {
      for (const s of stmts){
        const r = yield* execStmt(s, env);
        if (r) return r;
      }
      return null;
    }

    function* execStmt(node, env) {
      if (ctx.step()) throw RuntimeError('Error', 'โค้ดทำงานนานเกินกำหนด (อาจมี infinite loop)', node.line);
      if (ctx.stack.length > MAX_DEPTH) throw RuntimeError('RangeError', 'Maximum call stack size exceeded', node.line);

      switch (node.type) {
        case 'Empty': return null;
        case 'ExprStmt': { yield* tick(node, env); yield* evalExpr(node.expr, env); return null; }
        case 'VarDecl': {
          yield* tick(node, env);
          for (const d of node.decls){
            let v;
            if (d.init) v = yield* evalMaybePattern(d.init, d.id, env);
            else if (d.id.type === 'Ident') v = undefined;
            else throw RuntimeError('SyntaxError', 'Missing initializer in destructuring declaration', node.line);
            yield* bindPattern(d.id, v, env, node.line);
          }
          return null;
        }
        case 'FunctionDecl': {
          yield* tick(node, env);
          declare(env, node.id.name, makeFunction(node, env, ctx));
          return null;
        }
        case 'Return': {
          yield* tick(node, env);
          const v = node.arg ? yield* evalExpr(node.arg, env) : undefined;
          return { sig: '@@return', value: v };
        }
        case 'If': {
          yield* tick(node, env);
          const t = yield* evalExpr(node.test, env);
          if (t) return yield* execStmt(node.cons, env);
          if (node.alt) return yield* execStmt(node.alt, env);
          return null;
        }
        case 'While': {
          for (;;){
            yield* tick(node, env);
            if (!(yield* evalExpr(node.test, env))) break;
            const r = yield* execStmt(node.body, newScope(env));
            if (r){
              if (r === BREAK) break;
              if (r === CONTINUE) continue;
              return r;
            }
            if (ctx.stopFlag) return null;
          }
          return null;
        }
        case 'DoWhile': {
          for (;;){
            yield* tick(node, env);
            const r = yield* execStmt(node.body, newScope(env));
            if (r){
              if (r === BREAK) break;
              if (r !== CONTINUE) return r;
            }
            if (ctx.stopFlag) return null;
            if (!(yield* evalExpr(node.test, env))) break;
          }
          return null;
        }
        case 'For': {
          const loopEnv = newScope(env);
          if (node.init) yield* execStmt(node.init, loopEnv);
          for (;;){
            yield* tick(node, env);
            if (node.test && !(yield* evalExpr(node.test, loopEnv))) break;
            const iterEnv = newScope(loopEnv);
            const r = yield* execStmt(node.body, iterEnv);
            if (r){
              if (r === BREAK) break;
              if (r !== CONTINUE) return r;
            }
            if (ctx.stopFlag) return null;
            if (node.update) yield* evalExpr(node.update, loopEnv);
          }
          return null;
        }
        case 'ForOf': {
          const it = yield* evalExpr(node.right, env);
          for (const v of iterate(it, node.line)){
            yield* tick(node, env);
            const iterEnv = newScope(env);
            yield* bindPattern(node.id, v, iterEnv, node.line);
            const r = yield* execStmt(node.body, iterEnv);
            if (r){
              if (r === BREAK) break;
              if (r !== CONTINUE) return r;
            }
            if (ctx.stopFlag) return null;
          }
          return null;
        }
        case 'ForIn': {
          const o = yield* evalExpr(node.right, env);
          const keys = [];
          if (Array.isArray(o)) for (let i = 0; i < o.length; i++) keys.push(String(i));
          else if (typeof o === 'string') for (let i = 0; i < o.length; i++) keys.push(String(i));
          else for (const k in o) keys.push(k);
          for (const k of keys){
            yield* tick(node, env);
            const iterEnv = newScope(env);
            yield* bindPattern(node.id, k, iterEnv, node.line);
            const r = yield* execStmt(node.body, iterEnv);
            if (r){
              if (r === BREAK) break;
              if (r !== CONTINUE) return r;
            }
            if (ctx.stopFlag) return null;
          }
          return null;
        }
        case 'Block': {
          /* ไม่ tick ที่ Block เพราะ statement ข้างในจะ tick เองอยู่แล้ว
             (ไม่งั้นลูป 1 รอบจะกิน 3 step ซ้ำ ๆ) */
          return yield* execBlock(node.body, newScope(env));
        }
        case 'Break': return BREAK;
        case 'Continue': return CONTINUE;
        case 'Switch': {
          yield* tick(node, env);
          const d = yield* evalExpr(node.disc, env);
          const sEnv = newScope(env);
          let start = -1;
          for (let i = 0; i < node.cases.length; i++){
            if (node.cases[i].test === null) continue;
            const t = yield* evalExpr(node.cases[i].test, sEnv);
            if (strictEq(d, t)){ start = i; break; }
          }
          if (start === -1) start = node.cases.findIndex(c => c.test === null);
          if (start === -1) return null;
          for (let i = start; i < node.cases.length; i++){
            const r = yield* execBlock(node.cases[i].body, sEnv);
            if (r){
              if (r === BREAK) return null;
              return r;
            }
            if (ctx.stopFlag) return null;
          }
          return null;
        }
        case 'Try': {
          yield* tick(node, env);
          let r = null;
          try {
            r = yield* execStmt(node.block, newScope(env));
          } catch (e) {
            if (e && e.isControl) throw e;
            if (node.handler){
              const hEnv = newScope(env);
              if (node.param){
                const ev = makeErrorValue(e);
                yield* bindPattern(node.param, ev, hEnv, node.line);
              }
              r = yield* execStmt(node.handler, hEnv);
            } else throw e;
          }
          if (node.finalizer){
            const fr = yield* execStmt(node.finalizer, newScope(env));
            if (fr) return fr;
          }
          return r;
        }
        case 'Throw': {
          yield* tick(node, env);
          const v = yield* evalExpr(node.arg, env);
          throw makeErrorValue(v, node.line);
        }
      }
      return null;
    }

    function* evalMaybePattern(exprNode, target, env) {
      if (target && target.type === 'Ident' && exprNode.type === 'Ident' && exprNode.name === target.name
          && !hasAncestor(env, exprNode.name) && !hasOwn(env, exprNode.name)){
        return yield* evalExpr(exprNode, env);
      }
      return yield* evalExpr(exprNode, env);
    }

    function* bindPattern(pat, value, env, line) {
      if (pat.type === 'Ident'){ declare(env, pat.name, value); return; }
      if (pat.type === 'ArrayPattern'){
        const arr = Array.isArray(value) ? value : (value == null ? [] : iterate(value, line));
        const used = new Set();
        for (let i = 0; i < pat.elems.length; i++){
          const el = pat.elems[i];
          if (el === null) continue;
          if (el.rest){ const rest = arr.slice(i).filter((_, k) => !used.has(i + k)); yield* bindPattern(el.target, rest, env, line); break; }
          let v = arr[i];
          if (v === undefined && el.def) v = yield* evalExpr(el.def, env);
          yield* bindPattern(el.target, v, env, line);
        }
        return;
      }
      if (pat.type === 'ObjectPattern'){
        const src = (value !== null && value !== undefined && typeof value === 'object') ? value : {};
        const usedKeys = [];
        for (const pr of pat.props){
          if (pr.rest){
            const rest = {};
            for (const k in src) if (!usedKeys.includes(k)) rest[k] = src[k];
            yield* bindPattern(pr.target, rest, env, line);
            continue;
          }
          const k = pr.key.value;
          usedKeys.push(k);
          let v = src[k];
          if (v === undefined && pr.def) v = yield* evalExpr(pr.def, env);
          yield* bindPattern(pr.target, v, env, line);
        }
        return;
      }
      if (pat.type === 'Param' || pat.type === 'Rest') return yield* bindPattern(pat.target, value, env, line);
      throw RuntimeError('SyntaxError', 'Invalid binding pattern', line);
    }

    function iterate(v, line) {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') return v.split('');
      if (v instanceof Set) return [...v];
      if (v instanceof Map) return [...v.entries()];
      if (v && typeof v[Symbol.iterator] === 'function') return [...v];
      if (v && typeof v === 'object') return Object.values(v);
      throw RuntimeError('TypeError', String(v) + ' is not iterable', line);
    }

    /* ---------- functions ---------- */
    class InterpFn {
      constructor(node, defEnv, c, thisVal) {
        this.node = node; this.env = defEnv; this.ctx = c; this.ctor = false;
        this.name = node.id ? node.id.name : (node.name || (node.params ? '' : ''));
        this.thisVal = thisVal;
      }
      getMember(k, env) {
        if (k === 'name') return this.name;
        if (k === 'length') return this.node.params ? this.node.params.length : 0;
        return undefined;
      }
      setMember() {}
    }

    function makeFunction(node, defEnv, c) {
      return new InterpFn(node, defEnv, c);
    }

    function* callFunction(fn, args, line, thisVal) {
      const node = fn.node;
      if (node.type !== 'Arrow' && node.type !== 'FunctionExpr' && node.type !== 'FunctionDecl') return fn;
      if (ctx.stack.length > MAX_DEPTH) throw RuntimeError('RangeError', 'Maximum call stack size exceeded', line);
      const fEnv = newScope(fn.env);
      fEnv.thisVal = thisVal;
      if (node.params){
        for (let i = 0; i < node.params.length; i++){
          const p = node.params[i];
          /* arrow แบบ x => ... เก็บ param เป็น Ident ตรง ๆ ไม่ใช่ Param */
          const pTarget = (p && p.target) ? p.target : p;
          const pDef = p ? p.def : null;
          if (pTarget && pTarget.type === 'Rest'){
            yield* bindPattern(pTarget.target, args.slice(i), fEnv, line);
            break;
          }
          let v = args[i];
          if (v === undefined && pDef) v = yield* evalExpr(pDef, fEnv);
          yield* bindPattern(pTarget, v, fEnv, line);
        }
      }
      const argNames = (node.params || []).map(function (p) {
        return (p && p.target) ? (p.target.name || '...') : (p ? (p.name || '...') : '...');
      });
      const frame = { name: fn.name || 'anonymous', line: node.line, env: fEnv, args: argNames };
      ctx.stack.push(frame);
      let result;
      try {
        if (node.type === 'Arrow' && node.expr){
          result = yield* evalExpr(node.body, fEnv);
        } else {
          const r = yield* execBlock(node.body.body, fEnv);
          if (r && r.sig === '@@return') result = r.value;
          else result = undefined;
        }
      } finally {
        ctx.stack.pop();
      }
      return result;
    }

    const ERR_CTORS = { Error, TypeError, RangeError, SyntaxError, ReferenceError, EvalError, URIError };

    function* construct(C, args, line) {
      if (C === Error || C === TypeError || C === RangeError || C === SyntaxError
          || C === ReferenceError || C === EvalError || C === URIError){
        const msg = args[0] === undefined ? '' : toStr(args[0]);
        const e = new ERR_CTORS[C.name](msg);
        e.line = line;
        return e;
      }
      if (C === Array){
        /* new Array(n) = อาร์เรย์ยาว n (ไม่ใช่อาร์เรย์ที่มี n เป็นสมาชิก)
           new Array(1,2) = [1,2]  ต่างจาก Array(1,2) ที่คืน [2] ใน JS จริง */
        if (args.length === 1 && typeof args[0] === 'number'){
          const len = args[0];
          if (!Number.isInteger(len) || len < 0) throw RuntimeError('RangeError', 'Invalid array length', line);
          return new Array(len);
        }
        return args.slice();
      }
      if (C === Object) return Object.assign({}, ...args.filter(a => a && typeof a === 'object'));
      /* new Set([1,2]) ต้องกระจาย array ออกเป็นสมาชิกแยก
         ถ้าไม่กระจาย Set จะมี array นั้นเป็นสมาชิกเดียว (ต่างจาก JS จริง) */
      const spreadArgs = a => (a.length === 1 && Array.isArray(a[0]) ? a[0] : a);
      if (C === Map){
        const pairs = spreadArgs(args).map(a => [a[0], a[1]]);
        return new Map(pairs);
      }
      if (C === Set) return new Set(spreadArgs(args));
      if (C === String) return args.map(a => toStr(a)).join('');
      if (C === Number) return toNum(args[0]);
      if (C instanceof InterpFn){
        const obj = { __fn: C };
        const r = yield* callFunction(C, args, line, obj);
        return r === undefined ? obj : r;
      }
      throw RuntimeError('TypeError', 'ไม่สามารถสร้างค่าด้วย ' + str1(C), line);
    }

    /* ---------- member read ---------- */
    function readMember(o, k, line) {
      if (o === null || o === undefined) throw RuntimeError('TypeError', "Cannot read properties of " + String(o) + " (reading '" + k + "')", line);

      if (typeof o === 'string'){
        if (k === 'length') return o.length;
        const SM = STRING_MEMBERS;
        if (k in SM) return (...a) => SM[k](o, ...a);
        if (o[k] !== undefined) return o[k];
        return undefined;
      }
      if (Array.isArray(o)){
        if (k === 'length') return o.length;
        const A = ARRAY_MEMBERS; if (A[k]) return { __arr: A[k], arr: o, key: k };
        return o[k];
      }      if (o instanceof Map){
        if (k === 'size') return o.size;
        if (k === 'get') return (kk) => o.get(kk);
        if (k === 'has') return (kk) => o.has(kk);
        if (k === 'set') return (kk, vv) => { o.set(kk, vv); return o; };
        if (k === 'delete') return (kk) => o.delete(kk);
        if (k === 'keys') return () => [...o.keys()];
        if (k === 'values') return () => [...o.values()];
        if (k === 'entries') return () => [...o.entries()];
        if (k === 'forEach') return (f) => { o.forEach((v, kk) => f(v, kk, o)); };
        return o[k];
      }
      if (o instanceof Set){
        if (k === 'size') return o.size;
        if (k === 'has') return (kk) => o.has(kk);
        if (k === 'add') return (vv) => o.add(vv);
        if (k === 'delete') return (kk) => o.delete(kk);
        if (k === 'values' || k === 'keys') return () => [...o];
        if (k === 'forEach') return (f) => { o.forEach((v) => f(v, v, o)); };
        return o[k];
      }
      if (typeof o === 'function'){
        if (k === 'call') return (...a) => o.apply(null, a);
        if (k === 'apply') return (t, a) => o.apply(t, a || []);
        if (k === 'bind') return () => o;
        return o[k];
      }
      return o[k];
    }

    /* ---------- native call dispatch ---------- */
    const isGen = v => v != null && typeof v.next === 'function' && typeof v.throw === 'function';
    function* maybe(v) { return isGen(v) ? yield* v : v; }

    function* callNative(f, thisVal, args, line) {
      if (f === undefined || f === null) throw RuntimeError('TypeError', str1(f) + ' is not a function', line);

      /* bound array method */
      if (f && f.__arr){
        return yield* maybe(f.__arr(f.arr, args, GLOBAL, line));
      }

      /* bound string/primitive method (readMember คืนฟังก์ชันจริงมาแล้ว) */
      if (typeof f === 'function'){
        const name = f.__name;
        if (name && BUILTINS[name]) return yield* maybe(BUILTINS[name].fn(args, thisVal, line));
        return f.apply(thisVal, args);
      }

      throw RuntimeError('TypeError', str1(f) + ' is not a function', line);
    }

    /* ================= STRING MEMBERS ================= */
    const STRING_MEMBERS = {
      charAt(s, i){ return s[toNum(i)] ?? ''; },
      charCodeAt(s, i){ return s.charCodeAt(toNum(i)); },
      codePointAt(s, i){ return String.fromCodePoint(s.codePointAt(toNum(i))); },
      concat(s, ...a){ return s.concat(...a.map(toStr)); },
      endsWith(s, t, pos){ return pos === undefined ? s.endsWith(toStr(t)) : s.slice(0, toNum(pos)).endsWith(toStr(t)); },
      includes(s, t, pos){ return s.includes(toStr(t), pos === undefined ? 0 : toNum(pos)); },
      indexOf(s, t, pos){ return s.indexOf(toStr(t), pos === undefined ? 0 : toNum(pos)); },
      lastIndexOf(s, t){ return s.lastIndexOf(toStr(t)); },
      padStart(s, n, c){ return s.padStart(toNum(n), c === undefined ? ' ' : toStr(c)); },
      padEnd(s, n, c){ return s.padEnd(toNum(n), c === undefined ? ' ' : toStr(c)); },
      repeat(s, n){ return s.repeat(toNum(n)); },
      replace(s, a, b){ return s.replace(a instanceof RegExp ? a : toStr(a), toStr(b)); },
      replaceAll(s, a, b){ return s.split(toStr(a)).join(toStr(b)); },
      slice(s, a, b){ return s.slice(a === undefined ? 0 : toNum(a), b === undefined ? undefined : toNum(b)); },
      split(s, sep, lim){
        if (sep === undefined) return [s];
        if (sep instanceof RegExp) return s.split(sep);
        const parts = s.split(toStr(sep));
        return lim === undefined ? parts : parts.slice(0, toNum(lim));
      },
      startsWith(s, t, pos){ return s.startsWith(toStr(t), pos === undefined ? 0 : toNum(pos)); },
      substr(s, a, l){ return s.substr(toNum(a), l === undefined ? undefined : toNum(l)); },
      substring(s, a, b){ return s.substring(a === undefined ? 0 : toNum(a), b === undefined ? undefined : toNum(b)); },
      toLowerCase(s){ return s.toLowerCase(); },
      toUpperCase(s){ return s.toUpperCase(); },
      toString(s){ return s; },
      trim(s){ return s.trim(); },
      trimStart(s){ return s.trimStart(); },
      trimEnd(s){ return s.trimEnd(); },
      valueOf(s){ return s; },
      __call(s, args){ const m = STRING_MEMBERS[args[0]]; return m ? m(s, ...args.slice(1)) : s; }
    };
    STRING_MEMBERS.__call = function (s, args){
      const m = STRING_MEMBERS[args[0]];
      return m ? m(s, ...args.slice(1)) : s;
    };

    /* ================= ARRAY MEMBERS ================= */
    const ARRAY_MEMBERS = {
      push:         (arr, args) => { for (const v of args) arr.push(v); return arr.length; },
      pop:          (arr) => (arr.length ? arr.pop() : undefined),
      shift:        (arr) => (arr.length ? arr.shift() : undefined),
      unshift:      (arr, args) => { arr.unshift(...args); return arr.length; },
      slice:        (arr, args) => arr.slice(args[0] === undefined ? 0 : toNum(args[0]), args[1] === undefined ? undefined : toNum(args[1])),
      splice:       (arr, args) => arr.splice(...args.map(x => toNum(x))),
      concat:       (arr, args) => { const o = arr.slice(); for (const v of args){ if (Array.isArray(v)) o.push(...v); else o.push(v); } return o; },
      join:         (arr, args) => arr.map(toStr).join(args[0] === undefined ? ',' : toStr(args[0])),
      indexOf:      (arr, args) => arr.indexOf(args[0], args[1] === undefined ? 0 : toNum(args[1])),
      lastIndexOf:  (arr, args) => arr.lastIndexOf(args[0]),
      includes:     (arr, args) => arr.includes(args[0], args[1] === undefined ? 0 : toNum(args[1])),
      reverse:      (arr) => arr.reverse(),
      at:           (arr, args) => arr.at(toNum(args[0])),
      fill:         (arr, args) => arr.fill(args[0], args[1] === undefined ? 0 : toNum(args[1]), args[2] === undefined ? undefined : toNum(args[2])),
      flat:         (arr, args) => (args[0] === undefined ? arr.flat() : arr.flat(toNum(args[0]))),
      keys:         (arr) => arr.map((_, i) => i),
      values:       (arr) => arr.slice(),
      entries:      (arr) => arr.map((v, i) => [i, v]),
      toString:     (arr) => toStr(arr)
    };
    function async0(){ return undefined; }

    /* wrap array methods that receive a callback */
    const ARR_CB = {
      map: function* (arr, args, env, line) {
        const out = [];
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return out;
          out.push(yield* callFunction(args[0], [arr[i], i, arr], line));
        }
        return out;
      },
      filter: function* (arr, args, env, line) {
        const out = [];
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return out;
          if (yield* callFunction(args[0], [arr[i], i, arr], line)) out.push(arr[i]);
        }
        return out;
      },
      forEach: function* (arr, args, env, line) {
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return undefined;
          yield* callFunction(args[0], [arr[i], i, arr], line);
        }
        return undefined;
      },
      find: function* (arr, args, env, line) {
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return undefined;
          if (yield* callFunction(args[0], [arr[i], i, arr], line)) return arr[i];
        }
        return undefined;
      },
      findIndex: function* (arr, args, env, line) {
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return -1;
          if (yield* callFunction(args[0], [arr[i], i, arr], line)) return i;
        }
        return -1;
      },
      some: function* (arr, args, env, line) {
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return false;
          if (yield* callFunction(args[0], [arr[i], i, arr], line)) return true;
        }
        return false;
      },
      every: function* (arr, args, env, line) {
        for (let i = 0; i < arr.length; i++){
          if (ctx.stopFlag) return true;
          if (!(yield* callFunction(args[0], [arr[i], i, arr], line))) return false;
        }
        return true;
      },
      reduce: function* (arr, args, env, line) {
        const fn = args[0];
        let acc, start = 0;
        if (args.length > 1) acc = args[1];
        else { if (!arr.length) throw RuntimeError('TypeError', 'Reduce of empty array with no initial value', line); acc = arr[0]; start = 1; }
        for (let i = start; i < arr.length; i++){
          if (ctx.stopFlag) return acc;
          acc = yield* callFunction(fn, [acc, arr[i], i, arr], line);
        }
        return acc;
      },
      sort: function* (arr, args, env, line) {
        const cmp = args[0];
        if (cmp === undefined){ arr.sort((a, b) => compare(a, b)); return arr; }
        /* merge sort เพื่อให้ comparator ที่เป็น user function ทำงานแบบ step ได้
           ต้องแยก buffer อ่าน (src) กับ buffer เขียน (dst)
           ถ้าเขียนทับ src ระหว่าง merge ค่าที่ยังไม่ได้อ่านจะถูกทับหาย */
        const n = arr.length;
        if (n < 2) return arr;
        const src = arr.slice();
        const dst = new Array(n);
        function* msort(lo, hi){
          if (hi - lo <= 1) return;
          const mid = (lo + hi) >> 1;
          yield* msort(lo, mid);
          yield* msort(mid, hi);
          let i = lo, j = mid, k = lo;
          while (i < mid && j < hi){
            const c = yield* callFunction(cmp, [src[i], src[j]], line);
            if (c <= 0) dst[k++] = src[i++]; else dst[k++] = src[j++];
          }
          while (i < mid) dst[k++] = src[i++];
          while (j < hi) dst[k++] = src[j++];
          /* คัดลอกกลับ เพื่อให้ระดับบนอ่านค่าที่ merge แล้วเห็น */
          for (let x = lo; x < hi; x++) src[x] = dst[x];
        }
        yield* msort(0, n);
        for (let i = 0; i < n; i++) arr[i] = src[i];
        return arr;
      }
    };
    Object.assign(ARRAY_MEMBERS, ARR_CB);

    /* ================= BUILTINS ================= */
    const BUILTINS = {
      console: { __name: 'console' },
      log: { __name: 'log', fn: function* (args){ out.push(args.map(toStr).join(' ')); return undefined; } },
      error: { __name: 'error', fn: function* (args){ out.push('Error: ' + args.map(toStr).join(' ')); return undefined; } },
      warn: { __name: 'warn', fn: function* (args){ out.push('Warning: ' + args.map(toStr).join(' ')); return undefined; } },
      info: { __name: 'info', fn: function* (args){ out.push(args.map(toStr).join(' ')); return undefined; } },
      debug: { __name: 'debug', fn: function* (args){ out.push(args.map(toStr).join(' ')); return undefined; } },
      trace: { __name: 'trace', fn: function* (){ return undefined; } },

      parseInt: { __name: 'parseInt', fn(v){ const s = toStr(v[0]).trim(); const r = parseInt(s, v[1] === undefined ? 10 : toNum(v[1])); return Number.isNaN(r) ? NaN : r; } },
      parseFloat: { __name: 'parseFloat', fn(v){ return parseFloat(toStr(v[0])); } },
      Number: { __name: 'Number', fn(v){ return v.length === 0 ? 0 : toNum(v[0]); } },
      String: { __name: 'String', fn(v){ return v.length === 0 ? '' : toStr(v[0]); } },
      Boolean: { __name: 'Boolean', fn(v){ return !!v[0]; } },
      isNaN: { __name: 'isNaN', fn(v){ return isNaN(toNum(v[0])); } },
      isFinite: { __name: 'isFinite', fn(v){ return isFinite(toNum(v[0])); } },
      Array: { __name: 'Array' },
      Object: { __name: 'Object' },
      Map: { __name: 'Map' },
      Set: { __name: 'Set' },
      JSON: { __name: 'JSON' },
      Math: { __name: 'Math' },
      Infinity: { __name: 'Infinity' },
      NaN: { __name: 'NaN' },
      undefined: { __name: 'undefined' }
    };

    const GLOBAL = newScope(null);
    GLOBAL.require = makeRequire(opts && opts.input);
    GLOBAL.process = { argv: ['node', 'solution.js', String((opts && opts.input) || '')], env: {}, platform: 'linux', version: 'v20.0.0' };
    GLOBAL.console = {
      log:   function(){ out.push(Array.prototype.map.call(arguments, toStr).join(' ')); },
      info:  function(){ out.push(Array.prototype.map.call(arguments, toStr).join(' ')); },
      debug: function(){ out.push(Array.prototype.map.call(arguments, toStr).join(' ')); },
      warn:  function(){ out.push('Warning: ' + Array.prototype.map.call(arguments, toStr).join(' ')); },
      error: function(){ out.push('Error: ' + Array.prototype.map.call(arguments, toStr).join(' ')); },
      trace: function(){}
    };
    GLOBAL.Math = Math;
    GLOBAL.JSON = {
      stringify: (v, r, s) => JSON.stringify(toPlain(v), replacerFn(r), s === undefined ? undefined : toNum(s)),
      parse: (s, rv) => JSON.parse(toStr(s), rv ? function (k, v2){ return v2; } : undefined)
    };
    GLOBAL.Number = function Number_(x){ return x === undefined ? 0 : toNum(x); };
    GLOBAL.Number.isInteger = Number.isInteger;
    GLOBAL.Number.isFinite = Number.isFinite;
    GLOBAL.Number.isNaN = Number.isNaN;
    GLOBAL.Number.parseFloat = parseFloat;
    GLOBAL.Number.parseInt = parseInt;
    GLOBAL.Number.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
    GLOBAL.Number.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
    GLOBAL.Number.EPSILON = Number.EPSILON;
    GLOBAL.Number.MAX_VALUE = Number.MAX_VALUE;
    GLOBAL.Number.MIN_VALUE = Number.MIN_VALUE;
    GLOBAL.Number.POSITIVE_INFINITY = Infinity;
    GLOBAL.Number.NEGATIVE_INFINITY = -Infinity;
    GLOBAL.parseInt = (s, r) => BUILTINS.parseInt.fn([s, r]);
    GLOBAL.parseFloat = (s) => BUILTINS.parseFloat.fn([s]);
    GLOBAL.isNaN = (v) => isNaN(toNum(v));
    GLOBAL.isFinite = (v) => isFinite(toNum(v));
    /* String(undefined) ต้องได้ "undefined" ตามมาตรฐาน JS */
    GLOBAL.String = function String_(x){ return toStr(x); };
    GLOBAL.String.fromCharCode = String.fromCharCode;
    GLOBAL.String.fromCodePoint = String.fromCodePoint;
    GLOBAL.Boolean = Boolean;
    GLOBAL.Array = Array;
    GLOBAL.Array.isArray = Array.isArray;
    /* ต้องเก็บของจริงไว้ก่อน ไม่งั้นข้างในจะเรียกตัวเองวนไม่จบ
       เพราะ GLOBAL.Array.from ถูกเขียนทับไปแล้ว */
    const realArrayFrom = Array.from;
    GLOBAL.Array.from = (a, f) => realArrayFrom(a == null ? [] : toPlain(a));
    GLOBAL.Array.of = (...a) => a;
    GLOBAL.Object = Object.assign(function Object_(){}, {
      keys: (o) => o == null ? [] : Object.keys(toPlain(o)),
      values: (o) => o == null ? [] : Object.values(toPlain(o)),
      entries: (o) => o == null ? [] : Object.entries(toPlain(o)),
      assign: (t, ...s) => Object.assign(t, ...s.map(toPlain)),
      freeze: (o) => o,
      fromEntries: (e) => Object.fromEntries(e)
    });
    GLOBAL.Map = Map; GLOBAL.Set = Set;
    GLOBAL.Error = Error;
    GLOBAL.TypeError = TypeError;
    GLOBAL.RangeError = RangeError;
    GLOBAL.SyntaxError = SyntaxError;
    GLOBAL.ReferenceError = ReferenceError;
    GLOBAL.EvalError = EvalError;
    GLOBAL.URIError = URIError;
    GLOBAL.Infinity = Infinity;
    GLOBAL.NaN = NaN;
    GLOBAL.globalThis = GLOBAL;

    function replacerFn(r){ return typeof r === 'function' ? r : undefined; }

    function toPlain(v) {
      if (v instanceof InterpFn) return undefined;
      if (Array.isArray(v)) return v.map(toPlain);
      if (v instanceof Map) return Object.fromEntries(v);
      if (v instanceof Set) return [...v];
      return v;
    }

    /* ================= runner ================= */
    const gen = execBlock(ast.body, GLOBAL);

    function* drive() {
      yield* gen;
      return undefined;
    }

    return {
      ctx,
      GLOBAL,
      steps: () => steps,
      stop(){ ctx.stopFlag = true; },
      next() {
        const r = gen.next();
        if (r.done){
          return { type: 'done', value: r.value, output: out.slice(), scope: GLOBAL };
        }
        return r.value;
      }
    };
  }

  /* ============================ coercions ============================ */
  function toStr(v) {
    if (typeof v === 'string') return v;
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (v instanceof InterpFnPublic) return 'function ' + (v.name || '') + '() { ... }';
    if (Array.isArray(v)) return '[' + v.map(x => (typeof x === 'object' && x !== null ? str1(x) : toStr(x))).join(', ') + ']';
    if (v instanceof Map) return 'Map(' + v.size + ') {' + [...v].map(([k, x]) => k + ' => ' + str1(x)).join(', ') + '}';
    if (v instanceof Set) return 'Set(' + v.size + ') {' + [...v].map(x => str1(x)).join(', ') + '}';
    if (typeof v === 'object'){
      const keys = Object.keys(v);
      if (keys.length === 0) return '{}';
      return '{ ' + keys.map(k => k + ': ' + str1(v[k])).join(', ') + ' }';
    }
    return String(v);
  }
  const InterpFnPublic = InterpFnRef();
  function InterpFnRef(){ return function(){}; }

  function str1(v) {
    if (typeof v === 'string') return JSON.stringify(v);
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (typeof v === 'boolean') return String(v);
    if (v instanceof InterpFnPublic) return 'function ' + (v.name || '') + '()';
    if (Array.isArray(v)) return '[' + v.map(str1).join(', ') + ']';
    if (v instanceof Map) return 'Map(' + v.size + ')';
    if (v instanceof Set) return 'Set(' + v.size + ')';
    if (typeof v === 'function') return 'function ' + (v.name || 'anonymous') + '()';
    return '{ ' + Object.keys(v).map(k => k + ': ' + str1(v[k])).join(', ') + ' }';
  }

  function toNum(v) {
    if (typeof v === 'number') return v;
    if (v === null) return 0;
    if (v === undefined) return NaN;
    if (v === true) return 1;
    if (v === false) return 0;
    if (Array.isArray(v)) return v.length === 0 ? 0 : (v.length === 1 ? toNum(v[0]) : NaN);
    if (typeof v === 'object') return NaN;
    const s = String(v).trim();
    if (s === '') return 0;
    return Number(s);
  }

  function strictEq(a, b) {
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (a === undefined || b === undefined) return a === b;
    if (typeof a === 'number' && typeof b === 'number') return a === b || (Number.isNaN(a) && Number.isNaN(b));
    if (typeof a === 'object') return a === b;
    return a === b;
  }

  function looseEq(a, b) {
    if (a === null && b === undefined) return true;
    if (a === undefined && b === null) return true;
    if (a === null || a === undefined) return b === null || b === undefined;
    if (b === null || b === undefined) return false;
    if (typeof a === 'object') a = toStr(a);
    if (typeof b === 'object') b = toStr(b);
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    if (typeof a === 'boolean') return looseEq(toNum(a), b);
    if (typeof b === 'boolean') return looseEq(a, toNum(b));
    return toNum(a) === toNum(b);
  }

  function makeErrorValue(e, line) {
    if (e instanceof Error) return e;
    const err = new Error(toStr(e));
    err.name = 'Error';
    err.line = line;
    return err;
  }

  /* require สำหรับโค้ดผู้เรียน — รองรับ 'fs' ตามสูตร input ของโจทย์ */
  function makeRequire(inputText) {
    const text = inputText === undefined || inputText === null ? '' : String(inputText);
    return function (mod) {
      if (mod === 'fs') {
        return {
          readFileSync: function () { return text; },
          existsSync: function () { return true; },
          writeFileSync: function () {}
        };
      }
      const e = new Error("Cannot find module '" + mod + "'");
      e.name = 'Error';
      throw e;
    };
  }

  /* ==================== ตัวแปรที่ statement หนึ่ง ๆ มีการใช้ ====================
     คืน [{ name, mode }]  mode = 'r' อ่านค่า, 'w' เขียนค่า, 'rw' ทั้งสองอย่าง
     ใช้แสดงใน debug ว่า "บรรทัดนี้กำลังคำนวณด้วยอะไร"
     ==================================================================== */
  function identsOf(node) {
    const out = [];
    const seen = new Map();

    const put = (name, mode) => {
      if (!name) return;
      const prev = seen.get(name);
      if (prev === undefined) { seen.set(name, mode); out.push({ name: name, mode: mode }); return; }
      if (prev !== mode) seen.set(name, prev === 'r' || mode === 'r' ? 'rw' : 'rw');
    };

    /* เดินลง AST โดยข้าม key ที่เป็นชื่อ property และชื่อที่ประกาศ */
    function walk(n, skip) {
      if (n === null || n === undefined) return;
      if (Array.isArray(n)){ for (const x of n) walk(x, skip); return; }
      if (typeof n !== 'object') return;
      if (typeof n.type === 'string'){

        if (n.type === 'Ident'){ if (!skip) put(n.name, 'r'); return; }

        if (n.type === 'Assign'){
          walk(n.right, false);
          const L = n.left;
          if (L && L.type === 'Ident'){
            /* x += 1 คือทั้งอ่านและเขียน */
            put(L.name, (n.op === '=' || n.op === '&&=' || n.op === '||=' || n.op === '??=') ? 'w' : 'rw');
          }
          else walk(L, true);              // obj.x = v -> อ่าน obj, ไม่นับ x
          return;
        }

        if (n.type === 'Update'){
          if (n.arg && n.arg.type === 'Ident') put(n.arg.name, 'rw');
          else walk(n.arg, false);
          return;
        }

        if (n.type === 'VarDecl'){
          for (const d of n.decls){
            walk(d.init, false);
            if (d.id && d.id.type === 'Ident') put(d.id.name, 'w');
            else if (d.id) walk(d.id, true);
          }
          return;
        }

        if (n.type === 'For' || n.type === 'ForOf' || n.type === 'ForIn'){
          walk(n.init, false);
          walk(n.test, false);
          walk(n.update, false);
          if (n.id && n.id.type === 'Ident') put(n.id.name, 'w');
          else if (n.id) walk(n.id, true);
          walk(n.right, false);
          walk(n.body, false);
          return;
        }

        if (n.type === 'Member'){
          walk(n.obj, false);
          if (n.prop && n.prop.type !== 'Literal') walk(n.prop, false);
          return;
        }

        if (n.type === 'ObjectLit'){
          for (const pr of n.props){
            if (pr.spread){ walk(pr.arg, false); continue; }
            if (pr.computed) walk(pr.key, false);
            walk(pr.value, false);
          }
          return;
        }

        if (n.type === 'FunctionDecl' || n.type === 'FunctionExpr' || n.type === 'Arrow'){
          if (n.id && n.id.name) put(n.id.name, 'w');
          walk(n.params, true);
          walk(n.body, false);
          return;
        }

        if (n.type === 'ArrayPattern' || n.type === 'ObjectPattern'){ walk(n, true); return; }
        if (n.type === 'Param' || n.type === 'Rest'){ walk(n.target, true); return; }
      }
      for (const k in n) walk(n[k], false);
    }

    walk(node, false);
    return out;
  }

  /* ============================ PUBLIC API ============================ */
  return {
    parse,
    identsOf,
    createRunner,
    str: str1,
    inspect: toStr,
    makeRequire,
    _isError: (e) => e instanceof Error
  };
});
