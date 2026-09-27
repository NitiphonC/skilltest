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

  const BUILTINS = ['console.log','console.error','console.warn','JSON.stringify','JSON.parse',
    'Math.floor','Math.ceil','Math.round','Math.abs','Math.sqrt','Math.min','Math.max','Math.pow',
    'Object.keys','Object.values','Object.entries','Array.isArray','Number.isInteger',
    'parseInt','parseFloat','isNaN','String','Number','Boolean','Array','Object','Map','Set','require'];

  const SNIPPETS = {
    'for': 'for (let ${1:i} = 0; ${1:i} < ${2:len}; ${1:i}++) {\n\t${0}\n}',
    'forof': 'for (const ${1:x} of ${2:arr}) {\n\t${0}\n}',
    'forin': 'for (const ${1:k} in ${2:obj}) {\n\t${0}\n}',
    'if': 'if (${1:cond}) {\n\t${0}\n}',
    'ifelse': 'if (${1:cond}) {\n\t${2}\n} else {\n\t${0}\n}',
    'while': 'while (${1:cond}) {\n\t${0}\n}',
    'fn': 'function ${1:name}(${2:args}) {\n\t${0}\n}',
    'log': 'console.log(${1:value});',
    'return': 'return ${1:value};',
    'try': 'try {\n\t${0}\n} catch (err) {\n\tconsole.log(err);\n}',
    'switch': 'switch (${1:val}) {\n\tcase ${2:a}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${0}\n}'
  };

  const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };

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

      this.ta.addEventListener('input', () => {
        this._idxDirty = true; this._idxLen = -1;
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
      this._measure();
      this.render();
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
    _replace(a, b, text){
      this.ta.setSelectionRange(a, b);
      if (!this.ta.setRangeText) return;
      this.ta.setRangeText(text, a, b, 'end');
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
      if (this.ac.classList.contains('on')){
        if (e.key === 'ArrowDown'){ e.preventDefault(); this._acMove(1); return; }
        if (e.key === 'ArrowUp'){ e.preventDefault(); this._acMove(-1); return; }
        if (e.key === 'Enter' || e.key === 'Tab'){ e.preventDefault(); this._acAccept(); return; }
        if (e.key === 'Escape'){ e.preventDefault(); this.closeAC(); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/'){ e.preventDefault(); this._toggleComment(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd'){ e.preventDefault(); this._dupLine(); return; }
      if (e.key === 'Tab'){ e.preventDefault(); this._tab(e.shiftKey); return; }
      if (e.key === 'Enter'){ e.preventDefault(); this._newline(); return; }
      if (PAIRS[e.key] && this.ta.selectionStart === this.ta.selectionEnd){
        const nxt = this.ta.value[this.ta.selectionStart] || '';
        if (!/[\w$]/.test(nxt)){
          e.preventDefault();
          const p = this.ta.selectionStart;
          this._replace(p, p, e.key + PAIRS[e.key]);
          this.ta.selectionStart = this.ta.selectionEnd = p + 1;
          return;
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
            return;
          }
        }
      }
    }

    _tab(shift){
      const v = this.ta.value;
      const [a, b] = this._sel();
      if (a === b && !shift){
        this._replace(a, b, '    ');
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
        if (i === 0) firstDelta = 4;
        totalDelta += 4;
        return '    ' + ln;
      }).join('\n');
      this._replace(ls, le, out);
      this.ta.selectionStart = Math.max(0, ls + firstDelta);
      this.ta.selectionEnd = Math.max(0, ls + (le - ls) + totalDelta);
    }

    _newline(){
      const ln = this._currentLine();
      const indent = (ln.text.match(/^[ \t]*/) || [''])[0];
      const before = this.ta.value.slice(0, ln.start).trimEnd();
      const opens = /[{([]\s*$/.test(before) || /^(for|while|if|else|switch|try|do|function)\b.*[{([]?\s*$/.test(ln.text.trim());
      const closesNext = /^\s*[}\])]/.test(this.ta.value.slice(ln.end));
      const ins = '\n' + indent + (opens ? '    ' : '');
      const [a] = this._sel();
      this._replace(a, a, ins);
      if (opens && closesNext){
        const p = this.ta.selectionStart;
        this._replace(p, p, '\n' + indent);
        this.ta.selectionStart = this.ta.selectionEnd = p;
      }
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

    _maybeAutocomplete(){
      const { word, start } = this._wordBefore();
      if (word.length === 0 || /[.]$/.test(word)) { if (!/[.]$/.test(word)) this.closeAC(); return; }
      const q = word.toLowerCase();
      let items = [];

      for (const v of this.vars) if (v.name.toLowerCase().startsWith(q)) items.push({ label: v.name, kind: 'var', detail: v.type });

      const snipLabels = new Set(Object.keys(SNIPPETS));
      for (const k of KEYWORDS) if (k.toLowerCase().startsWith(q) && !snipLabels.has(k)) items.push({ label: k, kind: 'kw' });
      for (const s of Object.keys(SNIPPETS)) if (s.startsWith(q)) items.push({ label: s, kind: 'snip', snippet: SNIPPETS[s] });
      for (const b of BUILTINS) if (b.toLowerCase().startsWith(q)) items.push({ label: b, kind: 'fn' });

      if (!items.length) { this.closeAC(); return; }
      const seen = new Set();
      const uniq = items.filter(it => { const k = it.label + '|' + it.kind; if (seen.has(k)) return false; seen.add(k); return true; });
      uniq.sort((a, b) => rank(a) - rank(b));
      items = uniq;
      this.acItems = items.slice(0, 12);
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
    let out = '';
    let zero = -1;
    const re = /\$\{(\d+)(?::([^}]*))?\}/g;
    let m, last = 0;
    while ((m = re.exec(tpl))) {
      out += tpl.slice(last, m.index);
      if (m[1] === '0') zero = out.length;
      else out += m[2] === undefined ? '' : m[2];
      last = m.index + m[0].length;
    }
    out += tpl.slice(last);
    return { text: out, zero: zero };
  }

  function rank(i){ return (i.hot ? -1 : 0) + (i.kind === 'var' ? 0 : i.kind === 'snip' ? 1 : i.kind === 'kw' ? 2 : 3); }

  root.CodeEditor = Editor;
  root.EditorHighlight = highlight;
})(typeof window !== 'undefined' ? window : globalThis);
