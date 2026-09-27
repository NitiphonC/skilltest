/* =========================================================================
   editor.js — โปรแกรมแก้ไขโค้ดที่เขียนเอง (ไม่ใช้ VS Code / Monaco)
   • syntax highlighting แบบ overlay
   • หมายเลขบรรทัด + ไฮไลต์บรรทัดที่กำลังรัน (debug)
   • Tab / Shift+Tab, auto-indent, auto-close bracket, คอมเมนต์ด้วย Ctrl+/
   • autocomplete: keyword, ตัวแปรที่อยู่ใน scope ตอน debug, ฟังก์ชันมาตรฐาน
   ========================================================================= */
(function (root) {
  'use strict';

  const KEYWORDS = ['const','let','var','function','return','if','else','for','while','do','break',
    'continue','switch','case','default','try','catch','finally','throw','new','typeof','instanceof',
    'in','of','delete','void','this','null','undefined','true','false','async','await','class','extends','super'];

  const BUILTINS = ['console.log','console.error','console.warn','console.info','console.debug',
    'JSON.stringify','JSON.parse',
    'Math.floor','Math.ceil','Math.round','Math.abs','Math.sqrt','Math.pow','Math.min','Math.max',
    'Math.trunc','Math.sign','Math.log','Math.exp','Math.hypot','Math.random',
    'Object.keys','Object.values','Object.entries','Object.assign','Object.freeze',
    'Array.isArray','Array.from','Array.of',
    'Number.isInteger','Number.isFinite','Number.isNaN','Number.parseInt','Number.parseFloat',
    'Number.MAX_SAFE_INTEGER','Number.MIN_SAFE_INTEGER',
    'parseInt','parseFloat','isNaN','isFinite',
    'Infinity','NaN','undefined','globalThis',
    /* namespace ที่เขียนเป็นชื่อเดี่ยว ๆ ไม่งั้นพิมพ์ Math จะไม่เจอ */
    'Math','JSON','console',
    'String','Number','Boolean','Array','Object','Map','Set','require'];

  /* ค่าคงที่ที่ JS มีให้แต่ไม่ใช่ keyword และไม่ใช่ตัวในตัวที่เรียกได้ */
  const GLOBALS = ['Infinity','NaN','undefined','globalThis','structuredClone','queueMicrotask'];

  /* วิธีแบบ static ของ namespace ที่รู้จัก — พิมพ์ "Math." แล้วต้องขึ้น
     (เดิมไม่ขึ้นเลย เพราะไปหาชนิดของตัวแปรแทนที่จะดูว่าเป็น namespace) */
  const STATIC = {
    console: ['log','error','warn','info','debug','table','time','timeEnd','count','group','groupEnd','assert','dir'],
    Math: ['floor','ceil','round','abs','sqrt','pow','min','max','trunc','sign','log','log2','log10',
      'exp','hypot','cbrt','random','PI','E','atan2','sin','cos'],
    JSON: ['parse','stringify'],
    Number: ['isInteger','isFinite','isNaN','parseInt','parseFloat','isSafeInteger',
      'MAX_SAFE_INTEGER','MIN_SAFE_INTEGER','EPSILON','MAX_VALUE','MIN_VALUE',
      'POSITIVE_INFINITY','NEGATIVE_INFINITY'],
    Object: ['keys','values','entries','assign','freeze','isFrozen','seal','fromEntries',
      'getPrototypeOf','defineProperty','create'],
    Array: ['isArray','from','of'],
    String: ['fromCharCode','fromCodePoint','raw'],
    globalThis: []
  };

  /* วิธีของ Array / String / Map / Set — แนะนำตอนพิมพ์หลังจุด */
  const METHODS = {
    'Array': ['length','push','pop','shift','unshift','slice','splice','concat','join','indexOf',
      'lastIndexOf','includes','reverse','find','findIndex','filter','map','forEach','reduce',
      'some','every','sort','flat','fill','at','keys','values','entries'],
    'String': ['length','charAt','charCodeAt','indexOf','lastIndexOf','includes','startsWith',
      'endsWith','slice','substring','substr','split','replace','replaceAll','toUpperCase',
      'toLowerCase','trim','trimStart','trimEnd','repeat','padStart','padEnd','concat','at'],
    'Map': ['get','set','has','delete','size','keys','values','entries','clear','forEach'],
    'Set': ['add','has','delete','size','keys','values','entries','clear','forEach'],
    'Object': ['keys','values','entries','hasOwnProperty','toString','assign','freeze']
  };
  /* ชื่อก่อนจุดที่เดาว่าเป็นอะไร เพื่อเลือกชุดวิธีให้เหมาะ (เช่น x ที่ประกาศว่าเป็น Array) */
  const OWNER_KIND = {
    console: null, JSON: 'Object', Math: null, Object: 'Object',
    Map: 'Map', Set: 'Set', WeakMap: 'Map', WeakSet: 'Set'
  };

  const SNIPPETS = {
    'for': 'for (let ${1:i} = 0; ${1:i} < ${2:len}; ${1:i}++) {\n\t${0}\n}',
    'forof': 'for (const ${1:x} of ${2:arr}) {\n\t${0}\n}',
    'forin': 'for (const ${1:k} in ${2:obj}) {\n\t${0}\n}',
    'while': 'while (${1:cond}) {\n\t${0}\n}',
    'dowhile': 'do {\n\t${0}\n} while (${1:cond});',
    'if': 'if (${1:cond}) {\n\t${0}\n}',
    'ifelse': 'if (${1:cond}) {\n\t${2}\n} else {\n\t${0}\n}',
    'elseif': '} else if (${1:cond}) {\n\t${0}\n}',
    'fn': 'function ${1:name}(${2:args}) {\n\t${0}\n}',
    'arrow': '(${1:a}, ${2:b}) => {\n\treturn ${3};\n}',
    'log': 'console.log(${1:value});',
    'return': 'return ${1:value};',
    'try': 'try {\n\t${0}\n} catch (err) {\n\tconsole.log(err);\n}',
    'switch': 'switch (${1:val}) {\n\tcase ${2:a}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${0}\n}',
    /* วิธีของ array — ใส่โครงให้ ไม่ต้องพิมพ์เอง */
    'map': 'arr.map(${1:x} => {\n\treturn ${2};\n});',
    'filter': 'arr.filter(${1:x} => ${2:true});',
    'foreach': 'arr.forEach(${1:x} => {\n\t${0}\n});',
    'reduce': 'arr.reduce((acc, ${1:x}) => {\n\t${2}\n\treturn acc;\n}, ${3:init});',
    'sortarr': 'arr.sort((${1:a}, ${2:b}) => ${3:a - b});',
    'arr': 'const ${1:name} = [${2}];',
    'obj': 'const ${1:name} = {\n\t${2:key}: ${3:value}\n};'
  };

  /* ตัวเปิด -> ตัวปิดที่ต้องใส่ให้อัตโนมัติ
     สำคัญ: กดอัตโนมัติได้เฉพาะตัวเปิด ถ้ากดตัวปิดต้อง "ข้ามผ่าน" ไม่ใช่เพิ่มคู่ใหม่ */
  const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  const CLOSERS = { ')': 1, ']': 1, '}': 1, '"': 1, "'": 1, '`': 1 };
  const INDENT = '    ';

  /* โครงสำเร็จให้เมื่อพิมพ์ method ของ array/string ตามด้วยจุด
     เช่น พิมพ์ items.red แล้วกด Tab -> ได้ items.reduce((acc, x) => { ... }, init)
     ต้องผูกกับ member path เพราะการใช้ method ต้องพิมพ์หลังจุดเสมอ */
  const METHOD_SNIPPET = {
    map: 'map(${1:x} => {\n\treturn ${2};\n})',
    filter: 'filter(${1:x} => ${2:true})',
    forEach: 'forEach(${1:x} => {\n\t${0}\n})',
    reduce: 'reduce((acc, ${1:x}) => {\n\t${2}\n\treturn acc;\n}, ${3:init})',
    sort: 'sort((${1:a}, ${2:b}) => ${3:a - b})',
    find: 'find(${1:x} => ${2:true})',
    findIndex: 'findIndex(${1:x} => ${2:true})',
    some: 'some(${1:x} => ${2:true})',
    every: 'every(${1:x} => ${2:true})',
    join: 'join(${1:", "})',
    split: 'split(${1:" "})',
    replace: 'replace(${1:from}, ${2:to})',
    replaceAll: 'replaceAll(${1:from}, ${2:to})',
    slice: 'slice(${1:start}, ${2:end})',
    indexOf: 'indexOf(${1:value})',
    includes: 'includes(${1:value})'
  };

  /* เดาว่าตัวแปรเป็นอะไร จากรูปแบบที่เขียนมัก
     ครอบคลุมรูปแบบที่เจอบ่อยในโจทย์ของเว็บนี้ เช่น JSON.parse(...) แล้วเอาไปวนต่อ
     เรียงจากเฉพาะเจาะจงไปกว้าง เพื่อให้ได้ผลที่เจาะจงที่สุดก่อน */
  const TYPE_RULES = [
    ['\\bJSON\\.parse\\s*\\(', 'Array'],
    ['\\bnew\\s+Map\\b', 'Map'],
    ['\\bnew\\s+Set\\b', 'Set'],
    ['\\bArray\\.from\\s*\\(', 'Array'],
    ['\\bObject\\.(?:keys|values|entries)\\s*\\(', 'Array'],
    ['\\b(?:fs\\.)?readFileSync\\s*\\(', 'String'],
    ['\\.trim\\s*\\(', 'String'],
    ['\\.toString\\s*\\(', 'String'],
    ['\\.split\\s*\\(', 'String'],
    ['\\.join\\s*\\(', 'String'],
    ['\\bString\\s*\\(', 'String'],
    ['\\bNumber\\s*\\(', 'Number'],
    ['^\\s*[\'\"`]', 'String'],
    ['\\[[^\\]]*\\]\\s*$', 'Array'],
    ['\\{[^}]*\\}\\s*$', 'Object']
  ];

  /* ------------------------- syntax highlighting -------------------------
     ใช้ sticky regex ทั้งหมด ไม่ slice สตริงใหม่ในทุก token
     (เดิม slice ทุกตัวอักษร = O(n^2) ทำให้ค้างเมื่อ paste โค้ดยาว)
     -------------------------------------------------------------------- */
  const KW = new Set(KEYWORDS);
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  const esc = s => s.replace(/[&<>]/g, c => ESC[c]);

  const RE_NUM  = /[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/y;
  const RE_NAME = /[A-Za-z_$][A-Za-z0-9_$]*/y;
  const RE_OP   = /[+\-*/%=<>!&|^~?:]+/y;

  function highlight(src) {
    const n = src.length;
    if (n > 300000) return esc(src);          // ไฟล์ใหญ่มาก: ข้ามการย้อมสี
    const out = [];
    let i = 0;
    const push = (cls, txt) => { if (cls) out.push('<span class="' + cls + '">' + esc(txt) + '</span>'); else out.push(esc(txt)); };

    while (i < n) {
      const c = src.charCodeAt(i);
      const ch = src[i];

      // ช่องว่าง
      if (c === 32 || c === 9 || c === 10 || c === 13){ out.push(ch); i++; continue; }

      // คอมเมนต์
      if (ch === '/' && src[i + 1] === '/'){
        let j = i + 2;
        while (j < n && src.charCodeAt(j) !== 10) j++;
        push('c', src.slice(i, j)); i = j; continue;
      }
      if (ch === '/' && src[i + 1] === '*'){
        let j = i + 2;
        while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++;
        j = Math.min(j + 2, n);
        push('c', src.slice(i, j)); i = j; continue;
      }

      // สตริง
      if (ch === '"' || ch === "'"){
        let j = i + 1;
        while (j < n){
          const d = src.charCodeAt(j);
          if (d === 92) { j += 2; continue; }
          if (src[j] === ch) { j++; break; }
          if (d === 10) break;
          j++;
        }
        push('s', src.slice(i, j)); i = j; continue;
      }

      // template literal
      if (ch === '`'){
        let j = i + 1;
        while (j < n){
          const d = src.charCodeAt(j);
          if (d === 92) { j += 2; continue; }
          if (src[j] === '`') { j++; break; }
          j++;
        }
        push('s', src.slice(i, j)); i = j; continue;
      }

      // ตัวเลข
      if ((c >= 48 && c <= 57) || (ch === '.' && src.charCodeAt(i + 1) >= 48 && src.charCodeAt(i + 1) <= 57)){
        RE_NUM.lastIndex = i;
        const m = RE_NUM.exec(src);
        if (m && m[0].length){ push('n', m[0]); i += m[0].length; continue; }
      }

      // ชื่อ / keyword
      if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || ch === '_' || ch === '$'){
        RE_NAME.lastIndex = i;
        const m = RE_NAME.exec(src);
        const w = m[0];
        i += w.length;
        // ดูตัวถัดไปเพื่อเดาว่าเป็น function หรือ property
        let k = i;
        while (k < n && (src.charCodeAt(k) === 32 || src.charCodeAt(k) === 9)) k++;
        const nx = src[k];
        if (KW.has(w)) push('k', w);
        else if (nx === '(') push('f', w);
        else push('', w);
        continue;
      }

      // operator
      if ('+-*/%=<>!&|^~?:'.indexOf(ch) >= 0){
        RE_OP.lastIndex = i;
        const m = RE_OP.exec(src);
        push('o', m[0]); i += m[0].length; continue;
      }

      // punctuation
      if ('{}()[];,.'.indexOf(ch) >= 0){ push('p', ch); i++; continue; }

      out.push(esc(ch)); i++;
    }
    return out.join('');
  }

  /* ------------------------------ Editor ------------------------------- */
  class Editor {
    constructor(rootEl, opts) {
      this.root = rootEl;
      this.opts = opts || {};
      this.debugLine = 0;
      this.errorLine = 0;
      this.vars = [];
      this.acItems = [];
      this.acIndex = 0;
      this._build();
    }

    _build() {
      this.root.classList.add('ce');
      this.root.innerHTML =
        '<div class="ce-gutter"><div class="ce-gutter-in"></div></div>' +
        '<div class="ce-scroll">' +
          '<pre class="ce-hl"></pre>' +
          '<div class="ce-bglayer"><div class="ce-hlbg"></div></div>' +
          '<textarea class="ce-input" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>' +
        '</div>' +
        '<div class="ce-ac"></div>';

      this.gutter = this.root.querySelector('.ce-gutter');
      this.gutterIn = this.root.querySelector('.ce-gutter-in');
      this.scroll = this.root.querySelector('.ce-scroll');
      this.hlPre = this.root.querySelector('.ce-hl');
      this.bglayer = this.root.querySelector('.ce-bglayer');
      this.hlb = this.root.querySelector('.ce-hlbg');
      this.ta = this.root.querySelector('.ce-input');
      this.ac = this.root.querySelector('.ce-ac');

      this.OVER = 12;          // วาดเกินล่วงหน้า/ย้อนหลังกี่บรรทัด
      this._idxDirty = true; this._idxLen = -1; this._lines = null;
      this._winStart = -1;
      this._text = null;
      this.onChange = null;    // ให้ภายนอกเข้ามาแจ้งตอนผู้ใช้แก้โค้ด (ใช้บันทึกอัตโนมัติ)
      this.undoStack = [];
      this.redoStack = [];
      this._hist = null;
      this._lastWasSimple = false;
      this._simpleNext = false;

      this.ta.addEventListener('input', () => {
        this._idxDirty = true; this._idxLen = -1;
        /* จำว่ากดอะไรมา เพื่อรู้ว่าควรรวมกับ undo ก้าวก่อนหรือไม่ */
        this._pushHistory(this._simpleNext);
        this._simpleNext = false;
        this.render();
        this._maybeAutocomplete();
        if (this.onChange) this.onChange();
      });
      this.ta.addEventListener('scroll', () => this._syncScroll());
      this.ta.addEventListener('keydown', e => this._onKey(e));
      this.ta.addEventListener('click', () => this.closeAC());
      this.ta.addEventListener('blur', () => setTimeout(() => this.closeAC(), 120));
      this.gutter.addEventListener('mousedown', e => this._gutterClick(e));
      this._measure(true);
      this.render();
      this._hist = this._snap();
    }

    /* ---------- public ---------- */
    getValue(){ return this.ta.value; }
    getSelection(){ return { start: this.ta.selectionStart, end: this.ta.selectionEnd }; }
    setSelection(a, b){
      const v = this.ta.value.length;
      a = Math.max(0, Math.min(v, a | 0));
      b = Math.max(a, Math.min(v, b == null ? a : b | 0));
      this.ta.setSelectionRange(a, b);
      this._revealCaret();
    }
    onResize(){ this._measure(true); this._update({ all: true }); }

    setValue(v){
      this.ta.value = v == null ? '' : String(v);
      this.ta.setSelectionRange(0, 0);
      this._idxDirty = true; this._idxLen = -1;
      this.undoStack.length = 0;
      this.redoStack.length = 0;
      this._measure();
      this.render();
      this._hist = this._snap();
    }
    focus(){ this.ta.focus(); }

    setDebugLine(n){ if (this.debugLine !== (n || 0)){ this.debugLine = n || 0; this._syncScroll(); } }
    setErrorLine(n){ if (this.errorLine !== (n || 0)){ this.errorLine = n || 0; this._syncScroll(); } }
    setVars(v){ this.vars = v || []; }

    /* ---------- render (วาดเฉพาะบรรทัดที่มองเห็น) ----------
       กฎสำคัญ: อ่านค่าจาก DOM ให้หมดก่อน แล้วค่อยเขียน
               ถ้าสลับไปมาระหว่างอ่าน/เขียน browser จะต้องจัด layout ซ้ำทุกครั้ง
       หมายเหตุ: ต้องทำแบบ synchronous ห้ามใช้ requestAnimationFrame
               เพราะ rAF ไม่ทำงานเมื่อแท็บไม่ได้แสดงผล -> ภาพจะค้าง
    ------------------------------------------------------------------ */
    render(){
      this._measure();
      this._update({ all: true });
    }

    _update(opts){
      opts = opts || {};
      /* --- อ่าน --- */
      const st = this.ta.scrollTop;
      const sl = this.ta.scrollLeft;
      const r = this._range(st);

      const needGutter = opts.all || (r.start !== this._gStart || r.end !== this._gEnd) || !this.gutterIn.firstChild;
      const needWin = opts.all || opts.win || (r.start !== this._winStart);

      /* --- เขียน --- */
      if (needGutter) this._renderGutter(r);
      if (needWin) this._renderWindow(r);
      this._paintMarks();

      const offY = r.start * this.lineH - st;   // อย่าบวก padTop: pre มี padding ของตัวเอง
      this.hlPre.style.transform = 'translate(' + (-sl) + 'px,' + offY + 'px)';
      /* ให้บรรทัดแรกของเลขบรรทัด ตรงกับตัวอักษรแรกของชั้นไฮไลต์เป๊ะ */
      this.gutterIn.style.transform = 'translateY(' + offY + 'px)';
      this.bglayer.style.transform = 'translateY(' + (-st) + 'px)';
      this._paintLineBg();
    }

    _measure(force){
      if (!force && this._m) return;
      const cs = getComputedStyle(this.ta);
      this.lineH = parseFloat(cs.lineHeight) || 22;
      this.padTop = parseFloat(cs.paddingTop) || 0;
      this.padLeft = parseFloat(cs.paddingLeft) || 0;
      this.gutterW = this.gutter.offsetWidth || 56;
      this._viewH = this.scroll.clientHeight || 300;
      this._cw = 0;
      this._m = true;
    }

    _ensureIndex(){
      const v = this.ta.value;
      if (this._idxLen === v.length && !this._idxDirty && this._lines) return;
      const starts = [0];
      for (let i = 0; i < v.length; i++){
        if (v.charCodeAt(i) === 10) starts.push(i + 1);
      }
      this._lines = starts;
      this._idxLen = v.length;
      this._idxDirty = false;
    }

    _countLines(){
      this._ensureIndex();
      return this._lines.length;
    }

    /* ช่วงบรรทัดที่ต้องวาด — รับ st ที่อ่านมาแล้วเพื่อไม่ให้อ่านซ้ำ */
    _range(st){
      this._ensureIndex();
      const total = this._lines.length;
      if (st === undefined) st = this.ta.scrollTop;
      const view = Math.ceil((this._viewH || 300) / this.lineH) + 1;
      let start = Math.floor(st / this.lineH) - this.OVER;
      if (start < 0) start = 0;
      let end = start + view + this.OVER * 2;
      if (end > total) end = total;
      return { start: start, end: end, total: total };
    }

    _renderWindow(r){
      r = r || this._range();
      this._winStart = r.start;
      const v = this.ta.value;
      const from = this._lines[r.start];
      const to = (r.end < this._lines.length) ? this._lines[r.end] - 1 : v.length;
      this.hlPre.innerHTML = highlight(v.slice(from, to));
      this._winEnd = r.end;
    }

    _renderGutter(r){
      r = r || this._range();
      let html = '';
      for (let i = r.start; i < r.end; i++) html += '<div class="ln" data-n="' + (i + 1) + '">' + (i + 1) + '</div>';
      this.gutterIn.innerHTML = html;
      this._gStart = r.start;
      this._gEnd = r.end;
      this._total = r.total;
    }

    _paintMarks(){
      const box = this.gutterIn;
      const idx = n => (n - 1) - (this._gStart || 0);
      if (this._mDbg){
        const e = box.children[idx(this._mDbg)];
        if (e) e.className = 'ln';
        this._mDbg = 0;
      }
      if (this._mErr){
        const e = box.children[idx(this._mErr)];
        if (e) e.className = 'ln';
        this._mErr = 0;
      }
      if (this.debugLine && idx(this.debugLine) >= 0 && idx(this.debugLine) < box.children.length){
        const e = box.children[idx(this.debugLine)];
        e.className = 'ln dbg'; this._mDbg = this.debugLine;
      }
      if (this.errorLine && idx(this.errorLine) >= 0 && idx(this.errorLine) < box.children.length){
        const e = box.children[idx(this.errorLine)];
        e.className = 'ln err'; this._mErr = this.errorLine;
      }
    }

    _paintLineBg(){
      const line = this.debugLine || this.errorLine;
      if (!line){ this.hlb.style.display = 'none'; return; }
      this.hlb.style.display = 'block';
      this.hlb.className = 'ce-hlbg ' + (this.debugLine ? 'dbg' : 'err');
      this.hlb.style.top = (this.padTop + (line - 1) * this.lineH) + 'px';
      this.hlb.style.height = this.lineH + 'px';
    }

    _syncScroll(){ this._update({}); }

    revealLine(n){
      if (!n) return;
      this._measure();
      const y = this.padTop + (n - 1) * this.lineH;
      const st = this.ta.scrollTop;
      const view = this._viewH || 300;
      if (y < st || y + this.lineH > st + view - this.lineH){
        this.ta.scrollTop = Math.max(0, y - view / 2);
        this._update({ win: true });
      }
    }

    /* คลิกที่เลขบรรทัด -> ย้ายเคอร์เซอร์ไปต้นบรรทัดนั้น
       (มิชชั่งซ้าย 56px เดิมคลิกแล้วไม่เกิดอะไร ทำให้รู้สึกว่าเมาส์ไม่ตรง) */
    _gutterClick(e){
      e.preventDefault();
      this.ta.focus();
      const el = e.target.closest ? e.target.closest('.ln') : null;
      if (!el) return;
      const n = parseInt(el.getAttribute('data-n') || el.textContent, 10);
      if (!n || isNaN(n)) return;
      const idx = this._lineStart(n - 1);
      this.ta.setSelectionRange(idx, idx);
      this._revealCaret();
    }

    /* ตำแหน่งเริ่มต้นของบรรทัดที่ index (0-based) ในค่า value
       ใช้ index ที่ _ensureIndex() สร้างไว้แล้ว -> O(1) */
    _lineStart(idx){
      this._ensureIndex();
      const L = this._lines;
      if (idx <= 0) return 0;
      if (idx >= L.length) return this.ta.value.length;
      return L[idx];
    }

    _revealCaret(){
      const before = this.ta.value.slice(0, this.ta.selectionStart);
      const line = (before.match(/\n/g) || []).length;
      this._measure();
      const y = this.padTop + line * this.lineH;
      const st = this.ta.scrollTop;
      const view = this._viewH || 300;
      if (y < st || y + this.lineH > st + view - this.lineH){
        this.ta.scrollTop = Math.max(0, y - view / 3);
        this._update({});
      }
    }

    /* ---------- editing helpers ---------- */
    _sel(){ return [this.ta.selectionStart, this.ta.selectionEnd]; }
    _snap(){ return { value: this.ta.value, start: this.ta.selectionStart, end: this.ta.selectionEnd }; }

    /* ---------- undo / redo ----------
       เขียนค่าเข้า textarea ตรง ๆ เท่ากับล้าง undo ของเบราว์เซอร์ทิ้ง
       ต้องเก็บประวัติเอง แล้วรวมการพิมพ์ติด ๆ กันเป็นก้าวเดียว */
    _pushHistory(simple){
      const before = this._hist;
      const now = Date.now();
      if (before && before.value !== this.ta.value){
        const top = this.undoStack[this.undoStack.length - 1];
        /* รวมก้าวได้ก็ต่อเมื่อเป็นการพิมพ์ธรรมดาต่อจากการพิมพ์ธรรมดา
         ถ้ามี Enter/Tab/ลบ คั่นไว้ ต้องเริ่มกลุ่มใหม่เสมอ
         ไม่งั้นกด Ctrl+Z ครั้งเดียวจะย้อนหายไปทั้งบรรทัด */
        const canGroup = simple && this._lastWasSimple && top && (now - top.time) < 700;
        if (canGroup) top.time = now;
        else {
          this.undoStack.push({ value: before.value, start: before.start, end: before.end, time: now });
          if (this.undoStack.length > 300) this.undoStack.shift();
        }
        this.redoStack.length = 0;
      }
      this._lastWasSimple = !!simple;
      this._hist = this._snap();
    }

    _restore(s){
      this.ta.value = s.value;
      const n = s.value.length;
      this.ta.setSelectionRange(Math.min(s.start, n), Math.min(s.end, n));
      this._idxDirty = true; this._idxLen = -1;
      this._hist = this._snap();
      this.render();
      this._revealCaret();
    }

    undo(){
      const s = this.undoStack.pop();
      if (!s) return;
      this.redoStack.push(this._snap());
      this._restore(s);
    }
    redo(){
      const s = this.redoStack.pop();
      if (!s) return;
      this.undoStack.push(this._snap());
      this._restore(s);
    }

    _replace(a, b, text, simple){
      this.ta.setSelectionRange(a, b);
      if (this.ta.setRangeText){
        this.ta.setRangeText(text, a, b, 'end');
      } else {
        const v = this.ta.value;
        this.ta.value = v.slice(0, a) + text + v.slice(b);
        this.ta.setSelectionRange(a + text.length, a + text.length);
      }
      this._pushHistory(simple === true);
      this.render();
    }

    _lineBounds(pos){
      const v = this.ta.value;
      const s = v.lastIndexOf('\n', pos - 1) + 1;
      let e = v.indexOf('\n', pos);
      if (e === -1) e = v.length;
      return [s, e];
    }

    _currentLine(){
      const v = this.ta.value;
      const p = this.ta.selectionStart;
      const s = v.lastIndexOf('\n', p - 1) + 1;
      let e = v.indexOf('\n', p);
      if (e === -1) e = v.length;
      return { start: s, end: e, text: v.slice(s, e) };
    }

    _onKey(e){
      /* จำไว้ก่อนว่าเป็นการพิมพ์ธรรมดา (เอาไปตัดสินใจรวมก้าว undo) */
      const plainType = !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1;
      this._simpleNext = plainType;

      if (this.ac.classList.contains('on')){
        if (e.key === 'ArrowDown'){ e.preventDefault(); this._acMove(1); return; }
        if (e.key === 'ArrowUp'){ e.preventDefault(); this._acMove(-1); return; }
        if (e.key === 'Enter' || e.key === 'Tab'){ e.preventDefault(); this._acAccept(); return; }
        if (e.key === 'Escape'){ e.preventDefault(); this.closeAC(); return; }
      }
      /* ต้องปิดกั้นเสมอ ไม่งั้น browser จะ undo ทับซ้อนกับของเรา */
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z'){ e.preventDefault(); this.undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y'
          || (e.shiftKey && e.key.toLowerCase() === 'z'))){ e.preventDefault(); this.redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === '/'){ e.preventDefault(); this._toggleComment(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd'){ e.preventDefault(); this._dupLine(); return; }
      if (e.key === 'Tab'){ e.preventDefault(); this._tab(e.shiftKey); this._simpleNext = false; return; }      if (e.key === 'Enter'){ e.preventDefault(); this._newline(); this._simpleNext = false; return; }
      if (PAIRS[e.key] || CLOSERS[e.key]){
        if (this.ta.selectionStart === this.ta.selectionEnd){
          const p = this.ta.selectionStart;
          /* ข้ามผ่านวงเล็บปิด: ถ้าหน้าเคอร์เซอร์มีตัวเดียวกันอยู่
             แปลว่าเป็นตัวที่ auto-close ใส่ไว้ ให้ขยับผ่านไป ไม่ต้องเพิ่มอีกอัน */
          if (CLOSERS[e.key]){
            if (this.ta.value[p] === e.key){
              e.preventDefault();
              this.ta.selectionStart = this.ta.selectionEnd = p + 1;
              this._simpleNext = false;
              return;
            }
          } else if (!/[\w$]/.test(this.ta.value[p] || '')){
            e.preventDefault();
            this._replace(p, p, e.key + PAIRS[e.key], true);
            this.ta.selectionStart = this.ta.selectionEnd = p + 1;
            this._simpleNext = false;
            return;
          }
        }
      }
      if (e.key === 'Backspace'){
        const p = this.ta.selectionStart;
        if (p === this.ta.selectionEnd){
          const before = this.ta.value[p - 1] || '';
          const after = this.ta.value[p] || '';
          if (PAIRS[before] && PAIRS[before] === after){
            e.preventDefault();
            this._replace(p - 1, p + 1, '');
            this._simpleNext = false;
            return;
          }
          /* ถ้าหน้าเคอร์เซอร์เป็นช่องว่างล้วนตั้งแต่ต้นบรรทัด
             ให้ถอยทีเดียวทั้งระดับ (4 ช่อง) ไม่ใช่ทีละช่อง */
          const ls = this.ta.value.lastIndexOf('\n', p - 1) + 1;
          if (p > ls && /^[ ]+$/.test(this.ta.value.slice(ls, p))){
            e.preventDefault();
            const col = p - ls;
            const rem = col % INDENT.length;
            const keep = rem === 0 ? col - INDENT.length : col - rem;
            this._replace(ls, p, ' '.repeat(Math.max(0, keep)));
            this._simpleNext = false;
            return;
          }
        }
      }
    }

    _tab(shift){
      const v = this.ta.value;
      const [a, b] = this._sel();
      if (a === b && !shift){
        /* ถ้าจากเคอร์เซอร์ไปจนสิ้นบรรทัดมีแต่ช่องว่าง
           ให้เติมให้ตรงระดับ (tab stop) แทนที่จะบวก 4 ตลอด
           กด Tab ซ้ำจะเดิน 0 -> 4 -> 8 ไม่ใช่ 0 -> 4 -> 8 -> 12 แบบเลื่อนไม่ได้ */
        const ln = this._currentLine();
        const headBlank = ln.text.slice(0, a - ln.start).trim() === '';
        const tailBlank = /^[ \t]*$/.test(v.slice(a, ln.end));
        if (headBlank && tailBlank){
          const col = a - ln.start;
          const add = INDENT.length - (col % INDENT.length);
          this._replace(a, b, ' '.repeat(add), true);
          return;
        }
        this._replace(a, b, INDENT, true);
        return;
      }
      const ls = v.lastIndexOf('\n', a - 1) + 1;
      let le = v.indexOf('\n', b); if (le === -1) le = v.length;
      const block = v.slice(ls, le);
      const lines = block.split('\n');
      let firstDelta = 0, totalDelta = 0;
      const out = lines.map((ln, i) => {
        if (shift){
          const m = ln.match(/^(\t| {1,4})/);
          const cut = m ? m[1].length : 0;
          if (i === 0) firstDelta = -cut;
          totalDelta -= cut;
          return ln.slice(cut);
        }
        if (i === 0) firstDelta = INDENT.length;
        totalDelta += INDENT.length;
        return INDENT + ln;
      }).join('\n');
      this._replace(ls, le, out);
      this.ta.selectionStart = Math.max(0, ls + firstDelta);
      this.ta.selectionEnd = Math.max(0, ls + (le - ls) + totalDelta);
    }

    _newline(){
      const v = this.ta.value;
      const [a, b] = this._sel();
      const ln = this._currentLine();
      const head = ln.text.slice(0, a - ln.start);
      const isBlank = head.trim() === '';
      const baseIndent = (ln.text.match(/^[ \t]*/) || [''])[0];
      const opensBlock = /[{([]\s*$/.test(head);

      /* ถ้าบรรทัดนี้ว่างอยู่แล้ว แปลว่าผู้ใช้เว้นระดับมาเอง (เช่นกด Tab แล้วค่อยกด Enter)
         ต้องคงระดับนั้นไว้ ไม่ใช่บวกเพิ่มอีกชั้น */
      const nextIndent = isBlank ? head : (opensBlock ? baseIndent + INDENT : baseIndent);

      /* หาวงเล็บปิดที่อยู่ถัดไปจากเคอร์เซอร์
         ข้ามช่องว่างได้หนึ่งบรรทัด เพราะเคสปกติคือพิมพ์ { แล้ว auto-close ทิ้ง } ไว้ในบรรทัดเดียวกัน */
      let j = a;
      while (j < v.length && (v[j] === ' ' || v[j] === '\t')) j++;
      if (v[j] === '\n'){
        j++;
        while (j < v.length && (v[j] === ' ' || v[j] === '\t')) j++;
      }
      const hasClose = v[j] === '}' || v[j] === ']' || v[j] === ')';

      if (opensBlock && hasClose){
        /* แทนที่ตั้งแต่เคอร์เซอร์ถึงหน้าวงเล็บปิด
           ผลคือบรรทัดใหม่เข้าไปหนึ่งชั้น และวงเล็บปิดไปอยู่บรรทัดถัดไป
           ที่ระดับเดียวกับบรรทัดที่เปิด block เสมอ */
        this._replace(a, j, '\n' + nextIndent + '\n' + baseIndent);
        this.ta.selectionStart = this.ta.selectionEnd = a + 1 + nextIndent.length;
        return;
      }
      this._replace(a, b, '\n' + nextIndent);
    }

    _toggleComment(){
      const v = this.ta.value;
      const [a, b] = this._sel();
      const ls = v.lastIndexOf('\n', a - 1) + 1;
      let le = v.indexOf('\n', b); if (le === -1) le = v.length;
      const lines = v.slice(ls, le).split('\n');
      const allCommented = lines.every(l => !l.trim() || /^\s*\/\//.test(l));
      const out = lines.map(l => {
        if (!l.trim()) return l;
        if (allCommented) return l.replace(/^(\s*)\/\/ ?/, '$1');
        const ind = (l.match(/^\s*/) || [''])[0];
        return ind + '// ' + l.slice(ind.length);
      }).join('\n');
      this._replace(ls, le, out);
    }

    _dupLine(){
      const ln = this._currentLine();
      this._replace(ln.end, ln.end, '\n' + ln.text);
    }

    /* ---------- autocomplete ---------- */
    _wordBefore(){
      const p = this.ta.selectionStart;
      const v = this.ta.value.slice(0, p);
      const m = /([A-Za-z0-9_$.]*)$/.exec(v);
      return { word: m[1], start: p - m[1].length };
    }

    /* หาตำแหน่งวงเล็บปีกกาที่ยังไม่ปิด ณ ตำแหน่งที่กำหนด
       ข้ามสตริงกับคอมเมนต์ไป ไม่งั้นจะนับผิด */
    _openBraces(src){
      const stack = [];
      let i = 0;
      const n = src.length;
      while (i < n){
        const c = src[i];
        if (c === '/' && src[i + 1] === '/'){ const e = src.indexOf('\n', i); i = e === -1 ? n : e; continue; }
        if (c === '/' && src[i + 1] === '*'){ const e = src.indexOf('*/', i + 2); i = e === -1 ? n : e + 2; continue; }
        if (c === '"' || c === "'" || c === '`'){
          const q = c; i++;
          while (i < n){
            if (src[i] === '\\'){ i += 2; continue; }
            if (src[i] === q){ i++; break; }
            i++;
          }
          continue;
        }
        if (c === '{') stack.push(i);
        else if (c === '}') stack.pop();
        i++;
      }
      return stack;
    }

    /* ชื่อตัวแปรที่ประกาศไว้ในรายการพารามิเตอร์ เช่น "a, {b, c}, d = 1, ...rest" */
    static _params(str){
      const parts = [];
      let d = 0, cur = '';
      for (const ch of str){
        if (ch === '(' || ch === '[' || ch === '{') d++;
        else if (ch === ')' || ch === ']' || ch === '}') d--;
        if (ch === ',' && d === 0){ parts.push(cur); cur = ''; } else cur += ch;
      }
      if (cur.trim()) parts.push(cur);
      const names = [];
      for (const raw of parts){
        const s = raw.trim();
        if (!s) continue;
        const head = s[0];
        if (head === '{' || head === '['){
          const close = head === '{' ? '}' : ']';
          const inner = s.slice(1, s.lastIndexOf(close));
          for (const p of inner.split(',')){
            const t = p.split(':').pop().split('=')[0].trim().replace(/^\.\.\./, '');
            if (/^[A-Za-z_$][\w$]*$/.test(t)) names.push(t);
          }
          continue;
        }
        const t = s.replace(/^\.\.\./, '').split('=')[0].trim();
        if (/^[A-Za-z_$][\w$]*$/.test(t)) names.push(t);
      }
      return names;
    }

    /* รวบรวมสิ่งที่ "ควรขึ้นตอนแท็บตรงนี้"
       เรียงจากเฉพาะที่สุด: พารามิเตอร์ที่กำลังอยู่ในฟังก์ชัน -> ตัวแปรที่ประกาศแล้ว
       -> ชื่อฟังก์ชัน -> คีย์เวิร์ด/ที่นิยม -> ตัวในตัว */
    _scopeItems(caret){
      const v = this.ta.value;
      const src = v.slice(0, caret);
      const items = [];
      const seen = new Set();
      const add = (label, kind, detail, hot) => {
        const k = label + '|' + kind;
        if (seen.has(k)) return;
        seen.add(k);
        items.push({ label, kind, detail: detail || '', hot: !!hot });
      };

      /* 1) พารามิเตอร์ของฟังก์ชันที่ครอบเคอร์เซอร์อยู่ (เจาะจงที่สุด) */
      const braces = this._openBraces(src);
      for (let i = braces.length - 1; i >= 0; i--){
        const at = braces[i];
        let c = at - 1;
        while (c >= 0 && (src[c] === ' ' || src[c] === '\t')) c--;

        /* arrow function: const f = (a, b) => {  ตัวก่อน { คือ > ไม่ใช่ ) */
        if (src[c] === '>' && src[c - 1] === '='){
          let q = c - 2;
          while (q >= 0 && (src[q] === ' ' || src[q] === '\t')) q--;
          c = (src[q] === ')') ? q : at - 1;
        }

        /* ย้อนจาก { ต้องเจอ ) ของรายการพารามิเตอร์ก่อนเสมอ
           ถ้าไม่ใช่แปลว่าไม่ใช่หัวฟังก์ชัน (เช่น if/for/try ที่ตามด้วย { ตรง ๆ) */
        if (src[c] !== ')') continue;
        const close = c;
        let d = 0, open = -1;
        for (let q = close; q >= 0; q--){
          const ch = src[q];
          if (ch === ')') d++;
          else if (ch === '('){ d--; if (d === 0){ open = q; break; } }
        }
        if (open === -1) continue;
        for (const nm of CodeEditor._params(src.slice(open + 1, close))) add(nm, 'par', 'parameter', true);
        /* ชื่อฟังก์ชันเองก็ควรอยู่ใน scope */
        const before = src.slice(Math.max(0, open - 80), open);
        const fm = /function\s+([A-Za-z_$][\w$]*)\s*$/.exec(before);
        if (fm) add(fm[1], 'fn', 'function', true);
        /* ฟังก์ชันแบบ arrow: const f = (a, b) => */
        const am = /([A-Za-z_$][\w$]*)\s*=\s*$/.exec(before);
        if (am) add(am[1], 'fn', 'function', true);
      }

      /* 2) ตัวแปรที่ประกาศไว้ทั้งไฟล์ (รวม destructuring) */
      const decl = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
      let m;
      while ((m = decl.exec(src))) add(m[1], 'var', 'ตัวแปร', false);
      const destr = /\b(?:const|let|var)\s*\{([^}]*)\}\s*=/g;
      while ((m = destr.exec(src))){
        for (const nm of CodeEditor._params(m[1])) add(nm, 'var', 'ตัวแปร', false);
      }
      /* 2b) ตัวแปรที่ assign โดยลืมเขียน let/const (ใน JS คือ global)
             นักเรียนลืมบ่อย ถ้าไม่จับไว้จะไม่เห็นตัวแปรของตัวเองเลย */
      const bare = /^[ \t]*([A-Za-z_$][\w$]*)[ \t]*=(?!=)/gm;
      while ((m = bare.exec(src))) add(m[1], 'var', 'ควรใส่ let นำหน้า', false);

      /* 3) ชื่อฟังก์ชันที่ประกาศไว้ */
      const fns = /\bfunction\s+([A-Za-z_$][\w$]*)/g;
      while ((m = fns.exec(src))) add(m[1], 'fn', 'function', false);
      const fns2 = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function\b|\([^)]*\)\s*=>)/g;
      while ((m = fns2.exec(src))) add(m[1], 'fn', 'function', false);

      /* 4) ตัวแปรที่ debug เปิดอยู่ (มีค่าจริงให้ดู) */
      for (const x of this.vars) add(x.name, 'val', x.type, true);

      return items;
    }

    /* เดาชนิดของตัวแปรจากรูปแบบที่ประกาศไว้ เช่น const x = JSON.parse(s) -> Array */
    _typeOf(name){
      /* ชื่อที่พิมพ์ตามจุดอาจไม่ใช่ชื่อตัวแปร (เช่น Object.keys(bU).)
         ต้องเป็นชื่อระบุตัวแปรเท่านั้น ไม่งั้น regex จะพัง */
      if (!/^[A-Za-z_$][\w$]*$/.test(name)) return null;
      const v = this.ta.value;
      const re = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=\\s*([^;\\n]*)', 'g');
      const m = re.exec(v);
      if (!m) return null;
      const rhs = m[1];
      for (const [pat, kind] of TYPE_RULES){
        if (new RegExp(pat).test(rhs)) return kind;
      }
      return null;
    }

    /* ชุดวิธีที่ควรแนะนำหลังจุด เช่น Math. -> floor, nums. -> push */
    _memberItems(prefix){
      const owner = prefix.replace(/\.$/, '');
      const out = [];
      const seen = new Set();
      const push = (arr, kind, detail) => {
        for (const m of arr){
          if (seen.has(m)) continue;
          seen.add(m);
          const snip = METHOD_SNIPPET[m];
          out.push({ label: m, kind: kind, detail: detail || (snip ? 'มีโครงสำเร็จ' : ''), hot: false, snippet: snip });
        }
      };

      /* 1) namespace ที่รู้จัก เช่น Math. console. JSON. — ต้องเจอก่อนเสมอ */
      if (STATIC[owner]) { push(STATIC[owner], 'fn'); return out; }
      if (OWNER_KIND[owner]) { push(METHODS[OWNER_KIND[owner]], 'meth'); return out; }

      /* 2) เดาจากรูปแบบที่ประกาศไว้ */
      const kind = this._typeOf(owner);
      if (kind && METHODS[kind]) { push(METHODS[kind], 'meth'); return out; }
      return out;
    }

    _maybeAutocomplete(){
      const { word, start } = this._wordBefore();
      const caret = this.ta.selectionStart;
      /* ดูว่าคำที่พิมพ์อยู่หลังจุดหรือไม่
         ต้องใช้ lastIndexOf ไม่ใช่ endsWith เพราะตอนพิมพ์ "nums.pu" คำคือทั้ง "nums.pu" */
      const lastDot = word.lastIndexOf('.');
      const afterDot = lastDot >= 0;
      const q = (afterDot ? word.slice(lastDot + 1) : word).toLowerCase();
      if (!afterDot && !q){ this.closeAC(); return; }
      if (q.length > 24){ this.closeAC(); return; }

      let items = [];
      /* พิมพ์หลังจุด -> แนะนำวิธีของสิ่งที่ข้างหน้า และแทนเฉพาะส่วนหลังจุด
         พิมพ์เพียงจุดเปล่า ๆ เช่น "nums." ให้แสดงวิธีทั้งหมดเลย */
      if (afterDot){
        const prefix = word.slice(0, lastDot + 1);
        for (const it of this._memberItems(prefix)){
          if (it.label.toLowerCase().startsWith(q)) items.push(it);
        }
        if (!items.length){ this.closeAC(); return; }
        items.sort((a, b) => a.label.length - b.label.length);
        this.acItems = items.slice(0, 12);
        this.acIndex = 0;
        this._acStart = start + prefix.length;
        this._acWord = word.slice(prefix.length);
        this._paintAC();
        return;
      }

      for (const it of this._scopeItems(caret)) if (it.label.toLowerCase().startsWith(q)) items.push(it);

      const snipLabels = new Set(Object.keys(SNIPPETS));
      for (const g of GLOBALS) if (g.toLowerCase().startsWith(q) && !snipLabels.has(g)) items.push({ label: g, kind: 'glb', detail: 'ค่าคงที่' });
      for (const k of KEYWORDS) if (k.toLowerCase().startsWith(q) && !snipLabels.has(k)) items.push({ label: k, kind: 'kw' });
      for (const s of Object.keys(SNIPPETS)) if (s.startsWith(q)) items.push({ label: s, kind: 'snip', snippet: SNIPPETS[s] });
      for (const b of BUILTINS){
        if (!b.toLowerCase().startsWith(q)) continue;
        /* ชื่อที่มีจุด เช่น Math.floor ให้ขึ้นต่อเมื่อพิมพ์จุดไปแล้วเท่านั้น
           ไม่งั้นพิมพ์ "Mat" ก็จะเห็น Math.abs, Math.pow รวดไปหมด */
        if (b.indexOf('.') >= 0 && word.indexOf('.') < 0) continue;
        items.push({ label: b, kind: 'fn' });
      }

      if (!items.length){ this.closeAC(); return; }
      items.sort((a, b) => rank(a) - rank(b) || a.label.length - b.label.length);
      /* กันชื่อซ้ำ: Infinity/NaN/undefined อยู่ทั้งใน GLOBALS, KEYWORDS และ BUILTINS
         ถ้าไม่กันจะขึ้น 2-3 แถวเหมือนกัน ให้เก็บแถวที่จัดอันดับดีที่สุดไว้แถวเดียว */
      const seen = new Set();
      const uniq = items.filter(it => {
        const k = it.label.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      this.acItems = uniq.slice(0, 12);
      this.acIndex = 0;
      this._acStart = start;
      this._acWord = word;
      this._paintAC();
    }
    /* หาตำแหน่งเคอร์เซอร์จากชั้นไฮไลต์ (ต้องหัก offset ของ window ด้วย) */
    _caretRect(index){
      if (this.hlPre.firstChild === null) this._renderWindow(true);
      const win = this.hlPre;
      const w = document.createTreeWalker(win, NodeFilter.SHOW_TEXT);
      let acc = 0, n;
      const rel = index - this._winOffset();
      while ((n = w.nextNode())){
        if (rel < acc + n.length){
          const off = Math.max(0, Math.min(rel - acc, n.length - 1));
          const r = document.createRange();
          r.setStart(n, off);
          r.setEnd(n, Math.min(off + 1, n.length));
          const b = r.getBoundingClientRect();
          return { x: b.left, y: b.top, h: b.height || this.lineH };
        }
        acc += n.length;
      }
      /* อยู่นอก window ที่วาดไว้ — คำนวณตำแหน่งโดยประมาณ */
      this._measure();
      const v = this.ta.value;
      const upto = v.substring(0, index);
      const lineNo = upto.length - upto.lastIndexOf('\n');
      const col = lineNo === 0 ? 0 : lineNo - 1;
      const ls = v.lastIndexOf('\n', index - 1) + 1;
      const chW = this._charWidth();
      const taBox = this.ta.getBoundingClientRect();
      return {
        x: taBox.left + this.padLeft + (index - ls) * chW - this.ta.scrollLeft,
        y: taBox.top + this.padTop + ((col - 1) + this._winStart) * this.lineH - this.ta.scrollTop,
        h: this.lineH
      };
    }

    _winOffset(){
      this._ensureIndex();
      return (this._lines && this._winStart >= 0) ? this._lines[this._winStart] : 0;
    }

    _charWidth(){
      if (this._cw) return this._cw;
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-family:' + getComputedStyle(this.ta).fontFamily + ';font-size:' + getComputedStyle(this.ta).fontSize + ';';
      probe.textContent = '0'.repeat(50);
      document.body.appendChild(probe);
      this._cw = probe.getBoundingClientRect().width / 50 || 8.4;
      document.body.removeChild(probe);
      return this._cw;
    }

    _paintAC(){
      const h = this.acItems.map((it, i) =>
        '<div class="ac-i' + (i === this.acIndex ? ' sel' : '') + '" data-i="' + i + '">' +
          '<span class="ac-l ' + it.kind + '">' + esc(it.label) + '</span>' +
          (it.detail ? '<span class="ac-d">' + esc(it.detail) + '</span>' : '') +
          '<span class="ac-k">' + (it.kind === 'snip' ? 'snippet' : it.kind) + '</span>' +
        '</div>').join('');
      this.ac.innerHTML = h;
      this.ac.classList.add('on');

      const r = this.root.getBoundingClientRect();
      const pos = this.ta.selectionStart;   // วาง popup ที่เคอร์เซอร์
      const box = this._caretRect(pos);
      let left, top;
      if (box){
        left = box.x - r.left;
        top = (box.y + box.h) - r.top + 2;
      } else {
        this._measure();
        const ls = this._lineBounds(pos)[0];
        const lineNo = this.ta.value.slice(0, ls).split('\n').length;
        left = this.padLeft + (pos - ls) * 8.4;
        top = (lineNo - 1) * this.lineH + this.padTop - this.ta.scrollTop + this.lineH + 2;
      }
      const maxLeft = Math.max(4, r.width - 300);
      const maxTop = Math.max(4, r.height - 236);
      this.ac.style.left = Math.max(4, Math.min(left, maxLeft)) + 'px';
      this.ac.style.top = Math.max(4, Math.min(top, maxTop)) + 'px';

      this.ac.querySelectorAll('.ac-i').forEach(el => {
        el.addEventListener('mousedown', e => { e.preventDefault(); this.acIndex = +el.dataset.i; this._acAccept(); });
      });
    }

    _acMove(d){
      this.acIndex = (this.acIndex + d + this.acItems.length) % this.acItems.length;
      this._paintAC();
    }

    _acAccept(){
      const it = this.acItems[this.acIndex];
      if (!it) return this.closeAC();
      const start = this._acStart, end = this.ta.selectionStart;
      if (it.snippet) {
        const f = fillSnippet(it.snippet);
        this._replace(start, end, f.text);
        if (f.zero >= 0) { this.ta.selectionStart = this.ta.selectionEnd = start + f.zero; }
      } else {
        this._replace(start, end, it.label);
      }
      this.closeAC();
    }

    closeAC(){ this.ac.classList.remove('on'); this.acItems = []; }
  }

  function fillSnippet(tpl) {
    const SENTINEL = '\u0001';   // ใช้แทนตำแหน่งที่จะวางเคอร์เซอร์ชั่วคราว
    let out = '';
    const re = /\$\{(\d+)(?::([^}]*))?\}/g;
    let m, last = 0;
    while ((m = re.exec(tpl))) {
      out += tpl.slice(last, m.index);
      if (m[1] === '0') out += SENTINEL;
      else out += m[2] === undefined ? '' : m[2];
      last = m.index + m[0].length;
    }
    out += tpl.slice(last);
    /* เทมเพลตเขียนด้วย \t แต่ตัวแก้ไขย่อด้วยช่องว่าง 4 ต้องแปลงให้ตรงกัน
       แปลงก่อนหาตำแหน่งเคอร์เซอร์ ไม่งั้นตำแหน่งจะเลื่อนผิด */
    out = out.replace(/\t/g, INDENT);
    const zero = out.indexOf(SENTINEL);
    if (zero >= 0) out = out.slice(0, zero) + out.slice(zero + 1);
    return { text: out, zero: zero };
  }

  function rank(i){
    if (i.kind === 'val') return 0;
    if (i.kind === 'par') return 1;
    if (i.kind === 'var') return 2;
    if (i.kind === 'glb') return 3;   /* ค่าคงที่ เช่น Infinity อธิบายได้ตรงกว่าการเรียกฟังก์ชัน */
    if (i.kind === 'fn') return 4;
    if (i.kind === 'snip') return 5;
    if (i.kind === 'meth') return 5;
    if (i.kind === 'kw') return 6;
    return 7;
  }

  root.CodeEditor = Editor;
  root.EditorHighlight = highlight;
})(typeof window !== 'undefined' ? window : globalThis);
