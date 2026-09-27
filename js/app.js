/* =========================================================================
   app.js — เชื่อม editor + interpreter + debugger
   ========================================================================= */
(function () {
  'use strict';

  const QS = new URLSearchParams(location.search);
  const P = PROBLEMS[QS.get('id')] || PROBLEMS.p1;
  const KEY = 'cp_progress_v1';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---------------- บันทึกงานอัตโนมัติ ----------------
     เก็บแยกทีละโจทย์ใน localStorage คีย์เดียว เพื่อให้กลับมาทำต่อได้
       cp_draft_v1 = { p1: { code, sel, at }, p2: {...}, ... }
     หมายเหตุ: localStorage เป็นของ browser+โดเมนนี้เท่านั้น
              ถ้ากลัวข้อมูลหาย ใช้ปุ่ม "ส่งออก" เก็บเป็นไฟล์ไว้ด้วย        */
  const DRAFT_KEY = 'cp_draft_v1';
  let saveTimer = null;

  function readAll(){
    try {
      const o = JSON.parse(localStorage.getItem(DRAFT_KEY));
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function writeAll(o){
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(o)); return true; }
    catch (e) { return false; }   // โหมดส่วนตัว/ลบข้อมูลเว็บไซต์หรือพื้นที่เต็ม
  }

  function getDraft(id){ return readAll()[id] || null; }

  function dropDraft(id){
    const all = readAll();
    if (!(id in all)) return;
    delete all[id];
    writeAll(all);
  }

  /* บันทึกทันที (ใช้ตอนก่อนปิดหน้า เพื่อไม่ให้งานหายทั้งที่ยังไม่ถึงเวลา debounce) */
  function saveDraftNow(){
    if (!ed) return;
    const all = readAll();
    const sel = ed.getSelection();
    all[P.id] = { code: ed.getValue(), sel: sel.start, at: Date.now() };
    if (writeAll(all)) paintSaveTag('ok', Date.now());
  }

  /* หน่วงการบันทึกไว้ ไม่ให้เขียนทุกตัวอักษรที่พิมพ์ */
  function queueSave(){
    if (saveTimer) clearTimeout(saveTimer);
    paintSaveTag('saving');
    saveTimer = setTimeout(() => { saveTimer = null; saveDraftNow(); }, 400);
  }

  function draftIsEmpty(code){
    return String(code == null ? '' : code).trim() === starterCode().trim();
  }

  /* ป้ายสถานะการบันทึก: 'none' | 'saving' | 'ok' */
  function paintSaveTag(state, at){
    const el = $('saveTag');
    if (!el) return;
    if (state === 'ok') {
      const d = new Date(at || Date.now());
      const p = n => (n < 10 ? '0' : '') + n;
      el.textContent = 'บันทึกแล้ว ' + p(d.getHours()) + ':' + p(d.getMinutes());
      el.className = 'tag ok';
      el.title = 'บันทึกล่าสุดเมื่อ ' + d.toLocaleString() + '\nเก็บไว้ในเครื่องคุณ (localStorage)';
    } else if (state === 'saving') {
      el.textContent = 'กำลังบันทึก...';
      el.className = 'tag saving';
      el.title = '';
    } else {
      el.textContent = '';
      el.className = 'tag';
      el.title = '';
    }
  }

  /* ---------------- ส่งออก / นำเข้าไฟล์ ----------------
     localStorage ผูกกับ browser + โดเมนนี้ ถ้าล้างข้อมูลเว็บไซต์หรือเปลี่ยนเครื่อง
     งานที่เขียนไว้จะหาย จึงต้องมีทางออกเป็นไฟล์ด้วย                        */
  function exportDrafts(){
    const all = readAll();
    const keys = Object.keys(all);
    if (!keys.length) { alert('ยังไม่มีงานที่บันทึกไว้เลย'); return; }
    const payload = {
      app: 'code-practice',
      version: 1,
      savedAt: new Date().toISOString(),
      drafts: all
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const p = n => (n < 10 ? '0' : '') + n;
    a.href = url;
    a.download = 'code-practice-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function importDrafts(){
    const inp = $('fileImport');
    if (!inp) return;
    inp.value = '';        /* เลือกไฟล์เดิมซ้ำต้องเริ่มใหม่ */
    inp.click();
  }

  /* อ่านไฟล์ที่ผู้ใช้เลือก แล้วรวมเข้ากับงานที่มีอยู่ */
  function handleImportFile(f){
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      let data;
      try { data = JSON.parse(String(fr.result)); }
      catch (e) { alert('เปิดไฟล์ไม่ได้: ไฟล์นี้ไม่ใช่ JSON'); return; }
      const drafts = (data && typeof data === 'object' && data.drafts) ? data.drafts : data;
      if (!drafts || typeof drafts !== 'object' || Array.isArray(drafts)) {
        alert('ไฟล์นี้ไม่มีข้อมูลงานที่บันทึกไว้'); return;
      }
      const cur = readAll();
      let n = 0;
      Object.keys(drafts).forEach(k => {
        const d = drafts[k];
        if (d && typeof d.code === 'string') { cur[k] = { code: d.code, sel: d.sel | 0, at: d.at || Date.now() }; n++; }
      });
      if (!n) { alert('ไม่พบโค้ดที่นำเข้าได้เลย'); return; }
      if (!writeAll(cur)) { alert('บันทึกลงเครื่องไม่สำเร็จ (พื้นที่เต็ม หรือเบราว์เซอร์ปิดกั้น)'); return; }
      alert('นำเข้างานที่บันทึกไว้ ' + n + ' โจทย์เรียบร้อย\nกดรีเฟรชหน้าเพื่อดูผล');
    };
    fr.onerror = () => alert('อ่านไฟล์ไม่สำเร็จ');
    fr.readAsText(f);
  }

  /* ---------------- starter code ----------------
     ชื่อตัวแปรถูกเลือกให้สื่อความหมายจริง ๆ ตามรูปแบบข้อมูลของแต่ละโจทย์
       rawInput = ข้อความดิบที่อ่านมาจาก stdin (ยังเป็นสตริง)
       ตัวที่สอง  = ข้อมูลที่ JSON.parse แล้ว (ใช้ชื่อตามโจทย์)            */
  const RAW = 'rawInput';

  function starterCode(){
    const name = P.inputName || 'data';
    return [
      "const fs = require('fs');",
      "const " + RAW + " = fs.readFileSync(0, 'utf-8').trim();",
      '',
      '// แปลงสตริงให้กลายเป็น Array ด้วย JSON.parse',
      'const ' + name + ' = JSON.parse(' + RAW + ');',
      '',
      '// CODE HERE',
      ''
    ].join('\n');
  }

  /* ---------------- ตัวแปรระบบที่ไม่ต้องแสดง ---------------- */
  const HIDDEN = new Set(['console', 'Math', 'JSON', 'require', 'process', 'Number', 'String',
    'Boolean', 'Array', 'Object', 'Map', 'Set', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
    'globalThis', 'Infinity', 'NaN', 'Error', 'TypeError', 'RangeError', 'SyntaxError',
    'ReferenceError', 'EvalError', 'URIError', 'fs', 'thisVal']);

  let ed = null;
  const nextTick = fn => setTimeout(fn, 0);
  let runner = null;
  let dbgOn = false;
  let prevVars = {};
  let curScope = null;
  let curUses = [];

  /* ================= sidebar ================= */
  function paintSidebar() {
    $('probName').textContent = P.title;
    $('pTitle').textContent = P.title;
    $('pSub').textContent = P.subtitle;
    $('pDiff').textContent = P.difficulty;
    $('pDiff').className = 'chip ' + P.difficulty;
    $('pScore').textContent = P.score + ' คะแนน';
    $('pDesc').textContent = P.desc;
    $('pInput').textContent = P.inputDesc;
    $('varName').textContent = P.inputName || 'data';
    $('pOutput').textContent = P.outputDesc;
    $('pExamples').innerHTML = P.examples.map((e, i) => `
      <div class="ex">
        <div class="ex-head">ตัวอย่างที่ ${i + 1}</div>
        <div class="blk in"><pre>${esc(e.input)}</pre></div>
        <div class="blk out"><pre>${esc(e.output)}</pre></div>
      </div>`).join('');
    document.title = P.title + ' — Code Practice';
  }

  /* ================= helpers ================= */
  function parseLoose(s) {
    const t = String(s).trim();
    if (t === '') return t;
    try { return JSON.parse(t); } catch (e) { return t; }
  }
  function looseEq(a, b) {
    if (a === b) return true;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
    }
    return String(a) === String(b);
  }
  const isPass = (logs, expected) => logs.some(l => looseEq(parseLoose(l), expected));

  function typeOf(v) {
    if (Array.isArray(v)) return 'array[' + v.length + ']';
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'function') return 'function';
    if (typeof v === 'object') return (v instanceof Map ? 'Map' : v instanceof Set ? 'Set' : 'object');
    return typeof v;
  }

  /* ================= RUN SAMPLE (ล่างซ้าย = ดิบ) ================= */
  function rawLine(t, cls) { return '<div class="' + (cls || '') + '">' + esc(t) + '</div>'; }

  function showRaw(lines, err) {
    const box = $('rawOut');
    if (!lines.length && !err){
      box.innerHTML = '<span class="dimline">(ยังไม่มีผลลัพธ์)</span>';
      $('runTag').textContent = '';
      return;
    }
    let h = '';
    for (const l of lines) h += rawLine(l);
    if (err) h += rawLine(err.name + ': ' + err.message + (err.line ? '  (บรรทัด ' + err.line + ')' : ''), 'errline');
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
  }

  function runSample() {
    const tc = P.testCases[0];
    const inputText = JSON.stringify(tc.input);
    $('runTag').textContent = 'กำลังรัน…';
    setBusy(true);
    nextTick(() => {
      let out = [], err = null;
      try {
        const ast = Interp.parse(ed.getValue());
        const r = Interp.createRunner(ast, { input: inputText, maxSteps: 3000000 });
        let ev, guard = 0;
        for (;;) {
          ev = r.next();
          if (!ev || ev.type === 'done') break;
          if (++guard > 3000000) break;
        }
        out = r.ctx.out;
      } catch (e) { err = e; }
      showRaw(out, err);
      $('runTag').textContent = out.length ? out.length + ' บรรทัด' : '';
      setBusy(false);
    });
  }

  /* ================= SUBMIT (ล่างขวา) ================= */
  function submit() {
    $('subTag').textContent = 'กำลังตรวจ…';
    $('subBody').innerHTML = '<div class="empty">กำลังทำงาน…</div>';
    setBusy(true);
    nextTick(() => {
      const code = ed.getValue();
      const results = [];
      let syntax = null;
      try { Interp.parse(code); } catch (e) { syntax = e; }

      if (syntax) {
        results.push({ err: syntax, passed: false });
      } else {
        for (let i = 0; i < P.testCases.length; i++) {
          const tc = P.testCases[i];
          let out = [], err = null;
          try {
            const ast = Interp.parse(code);
            const r = Interp.createRunner(ast, { input: JSON.stringify(tc.input), maxSteps: 3000000 });
            let ev, guard = 0;
            for (;;) {
              ev = r.next();
              if (!ev || ev.type === 'done') break;
              if (++guard > 3000000){ err = { name: 'Error', message: 'ทำงานนานเกินกำหนด' }; break; }
            }
            out = r.ctx.out;
          } catch (e) { err = e; }
          results.push({
            caseNum: i + 1,
            input: JSON.stringify(tc.input),
            expect: JSON.stringify(tc.output),
            out,
            err,
            passed: isPass(out, tc.output)
          });
        }
      }

      renderSubmit(results);
      $('subTag').textContent = '';
      setBusy(false);

      const ok = results.filter(r => r.passed).length;
      if (!syntax && ok === P.testCases.length) saveProgress();
    });
  }

  function renderSubmit(results) {
    const total = P.testCases.length;
    const ok = results.filter(r => r.passed).length;
    const bad = results.length - ok;

    let h = `<div class="sum">
      <span class="ok">ผ่าน ${ok}</span>
      <span class="dim">/ ${total}</span>
      ${bad ? '<span class="no">ไม่ผ่าน ' + bad + '</span>' : ''}
      <span class="dim">· คะแนน ${Math.round(P.score * ok / total)}/${P.score}</span>
    </div>`;

    results.forEach((r, i) => {
      const n = r.caseNum || (i + 1);
      h += `<div class="tc" data-i="${i}">
        <div class="tc-h">
          <span class="tc-n">#${n}</span>
          <span class="tc-s ${r.passed ? 'ok' : 'no'}">${r.passed ? 'PASS' : 'FAIL'}</span>
        </div>
        <div class="tc-b">`;
      if (r.err) {
        h += `<b>error</b> <span class="r">${esc(r.err.name + ': ' + r.err.message)}</span>${r.err.line ? ' <b>line ' + r.err.line + '</b>' : ''}<br>`;
      }
      h += `<b>input&nbsp;&nbsp;</b>${esc(r.input || '—')}<br>`;
      h += `<b>expect&nbsp;</b><span class="g">${esc(r.expect || '—')}</span><br>`;
      h += `<b>output&nbsp;</b>${r.out && r.out.length
        ? r.out.map(l => `<span class="${isPass([l], JSON.parse(r.expect)) ? 'g' : 'r'}">${esc(l)}</span>`).join('<br>')
        : '<span class="r">(ไม่มี console.log)</span>'}`;
      h += `</div></div>`;
    });

    $('subBody').innerHTML = h;
    $('subBody').querySelectorAll('.tc-h').forEach(el => {
      el.addEventListener('click', () => el.parentElement.classList.toggle('open'));
    });
  }

  function saveProgress() {
    let d = {}; try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    d[P.id] = { at: Date.now(), score: P.score };
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }

  /* ================= DEBUG ================= */
  function dbgToggle(on) {
    dbgOn = on;
    $('dbgWrap').classList.toggle('on', on);
    $('btnDebug').classList.toggle('on', on);
    $('bottom').style.display = on ? 'none' : 'flex';
    if (!on) {
      ed.setDebugLine(0);
      curUses = [];
      $('dbgVars').innerHTML = '';
      $('dbgStack').innerHTML = '';
    }
  }

  function dbgStart() {
    const tc = P.testCases[0];
    try {
      const ast = Interp.parse(ed.getValue());
      runner = Interp.createRunner(ast, { input: JSON.stringify(tc.input), maxSteps: 3000000 });
    } catch (e) {
      runner = null;
      $('dbgOut').innerHTML = rawLine(e.name + ': ' + e.message + (e.line ? '  (บรรทัด ' + e.line + ')' : ''), 'errline');
      ed.setErrorLine(e.line || 0);
      $('dbgVars').innerHTML = '';
      $('dbgStack').innerHTML = '';
      return;
    }
    dbgToggle(true);
    ed.setErrorLine(0);
    prevVars = {};
    $('dbgOut').innerHTML = '';
    $('dbgStepN').textContent = '0';
    setDbgBtns('ready');
    dbgStep();
  }

  function dbgStep() {
    if (!runner) return;
    let ev;
    try {
      ev = runner.next();
    } catch (e) {
      dbgError(e);
      return;
    }
    if (!ev || ev.type === 'done'){
      const out = runner.ctx.out;
      $('dbgOut').innerHTML = (out.length ? out.map(l => rawLine(l)).join('') : rawLine('(ไม่มี console.log)', 'dimline'))
        + rawLine('— จบโปรแกรม —', 'dimline');
      ed.setDebugLine(0);
      $('dbgLine').textContent = '—';
      $('dbgStack').innerHTML = '<div class="empty">—</div>';
      setDbgBtns('done');
      return;
    }

    const n = parseInt($('dbgStepN').textContent, 10) + 1;
    $('dbgStepN').textContent = n;
    $('dbgLine').textContent = ev.line;
    ed.setDebugLine(ev.line);
    scrollToLine(ev.line);

    // output สะสม
    const out = runner.ctx.out;
    $('dbgOut').innerHTML = (out.length ? out.map(l => rawLine(l)).join('') : rawLine('(ยังไม่มี output)', 'dimline'));

    curScope = ev.scope || runner.GLOBAL;
    curUses = (ev.node && Interp.identsOf) ? Interp.identsOf(ev.node) : [];
    renderVars(curScope);
    renderStack();
    setDbgBtns('running');
  }

  function dbgError(e) {
    $('dbgOut').innerHTML += rawLine(e.name + ': ' + e.message + (e.line ? '  (บรรทัด ' + e.line + ')' : ''), 'errline');
    ed.setErrorLine(e.line || 0);
    ed.setDebugLine(0);
    $('dbgLine').textContent = e.line || '—';
    setDbgBtns('done');
  }

  function dbgGo() {
    if (!runner) return;
    dbgGo.disabled = true;
    dbgStep.disabled = true;
    dbgStop.disabled = true;
    let guard = 0;
    const CHUNK = 2000;
    const pump = () => {
      let done = false;
      const t0 = performance.now();
      /* ทำเป็นก้อน ๆ เพื่อไม่ให้หน้าจอค้าง และไม่พึ่ง rAF (แท็บที่ไม่ active) */
      while (performance.now() - t0 < 24) {
        let ev;
        try { ev = runner.next(); }
        catch (e) { dbgError(e); return; }
        if (!ev || ev.type === 'done'){ done = true; break; }
        dbgStepN.textContent = parseInt(dbgStepN.textContent, 10) + 1;
        if (++guard > 5000000){ done = true; break; }
      }
      if (done){
        const out = runner.ctx.out;
        dbgOut.innerHTML = (out.length ? out.map(l => rawLine(l)).join('') : rawLine('(ไม่มี console.log)', 'dimline'))
          + rawLine('— จบโปรแกรม —', 'dimline');
        ed.setDebugLine(0);
        dbgLine.textContent = '—';
        setDbgBtns('done');
        return;
      }
      const out = runner.ctx.out;
      dbgOut.innerHTML = (out.length ? out.map(l => rawLine(l)).join('') : rawLine('(ยังไม่มี output)', 'dimline'));
      ed.setDebugLine(runner.ctx.line);
      dbgLine.textContent = runner.ctx.line;
      renderVars(curScope || runner.GLOBAL);
      renderStack();
      nextTick(pump);
    };
    pump();
  }

  function dbgStop() {
    if (runner) runner.stop();
    $('dbgOut').innerHTML += rawLine('— หยุดแล้ว —', 'dimline');
    setDbgBtns('stopped');
  }

  function setDbgBtns(state) {
    const running = state === 'running' || state === 'ready';
    $('dbgStart').disabled = false;
    $('dbgStep').disabled = !running;
    $('dbgGo').disabled = !running;
    $('dbgStop').disabled = !running;
  }

  /* แยก scope ตามชั้น: ขอบเขตที่กำลังทำงาน → ออกไปนอกสุด */
  function scopeLevels(scope){
    const levels = [];
    let s = scope;
    let guard = 0;
    while (s && guard++ < 50){
      const own = [];
      for (const k in s){
        if (Object.prototype.hasOwnProperty.call(s, k)) own.push(k);
      }
      if (own.length) levels.push(own);
      s = Object.getPrototypeOf(s);
    }
    return levels;
  }

  function fmtVal(v){
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    let t;
    try { t = Interp.str(v); } catch (e) { return '?'; }
    if (t.length > 260) t = t.slice(0, 260) + '…';
    return t;
  }
  function valClass(v){
    if (Array.isArray(v)) return 'vval arr';
    if (typeof v === 'string') return 'vval str';
    if (typeof v === 'number') return 'vval num';
    if (typeof v === 'boolean') return 'vval bool';
    if (v === null || v === undefined) return 'vval nul';
    return 'vval obj';
  }

  function renderVars(scope){
    if (!scope){ $('dbgVars').innerHTML = '<div class="empty">(ยังไม่มีข้อมูล)</div>'; return; }

    const levels = scopeLevels(scope);
    const frame = (runner && runner.ctx.stack && runner.ctx.stack.length)
      ? runner.ctx.stack[runner.ctx.stack.length - 1] : null;
    const frameLabel = frame
      ? (frame.name || 'anonymous') + '(' + (frame.args || []).join(', ') + ')'
      : 'top level';

    /* รวบรวมชื่อตัวแปรที่ควรแนะนำตอน autocomplete */
    const forAC = [];
    let html = '';
    let first = true;

    /* บรรทัดที่กำลังทำงานใช้ตัวแปรอะไรบ้าง */
    if (curUses && curUses.length){
      const chips = curUses.map(u => {
        const v = scopeChainGet(scope, u.name);
        const shown = (HIDDEN.has(u.name) || v === undefined) ? '' :
          ' <span class="use-v">' + esc(fmtVal(v)) + '</span>';
        const tag = u.mode === 'w' ? 'เขียน' : u.mode === 'rw' ? 'อ่าน+เขียน' : 'อ่าน';
        return '<div class="use"><span class="use-n">' + esc(u.name) + '</span>' +
               '<span class="use-m m-' + u.mode + '">' + tag + '</span>' + shown + '</div>';
      }).join('');
      html += '<div class="vgroup vgroup-use"><div class="vgroup-t">บรรทัดนี้ใช้ตัวแปร</div>' + chips + '</div>';
    }

    levels.forEach((names, li) => {
      const rows = [];
      names.forEach(n => {
        if (HIDDEN.has(n)) return;
        let v, t;
        try { v = scopeChainGet(scope, n); t = typeof v === 'function' ? 'function' : null; } catch (e) { return; }
        const txt = fmtVal(v);
        const changed = prevVars[n] !== txt;
        prevVars[n] = txt;
        forAC.push({
          name: n,
          type: t || (Array.isArray(v) ? 'array' : typeof v),
          hot: (curUses || []).some(u => u.name === n)
        });
        const inUse = (curUses || []).some(u => u.name === n);
        rows.push(
          '<div class="vrow' + (inUse ? ' used' : '') + '">' +
            '<span class="vdot"></span>' +
            '<span class="vname">' + esc(n) + '</span>' +
            '<span class="' + valClass(v) + (changed ? ' chg' : '') + '">' + esc(txt) + '</span>' +
          '</div>'
        );
      });
      if (!rows.length) return;
      let label;
      if (li === 0){
        label = frame && frame.name !== 'top level'
          ? 'ในฟังก์ชัน ' + esc(frameLabel)
          : 'ตัวแปรระดับบนสุด';
      } else if (li === levels.length - 1){
        label = 'ตัวแปรที่ประกาศนอกฟังก์ชัน';
      } else {
        label = 'ตัวแปรในบล็อก';
      }
      html += '<div class="vgroup"><div class="vgroup-t">' + label + '</div>' + rows.join('') + '</div>';
      first = false;
    });

    ed.setVars(forAC);
    $('dbgVars').innerHTML = html || '<div class="empty">(ยังไม่มีตัวแปร)</div>';
  }

  /* อ่านค่าจาก scope chain ตามชื่อ */
  function scopeChainGet(scope, name){
    let s = scope;
    while (s){
      if (Object.prototype.hasOwnProperty.call(s, name)) return s[name];
      s = Object.getPrototypeOf(s);
    }
    return undefined;
  }

  function renderStack() {
    const st = runner.ctx.stack || [];
    if (!st.length){ $('dbgStack').innerHTML = '<div class="empty">(อยู่ที่ระดับบนสุด)</div>'; return; }
    $('dbgStack').innerHTML = st.map((f, i) =>
      '<div class="' + (i === st.length - 1 ? 'cur' : '') + '">' +
        (i === st.length - 1 ? '\u25b8 ' : '  ') +
        esc(f.name) + '(' + esc((f.args || []).join(', ')) + ')' +
        ' \u00b7 line ' + f.line +
      '</div>'
    ).join('');
  }

  function scrollToLine(n){
    if (ed && ed.revealLine) ed.revealLine(n);
  }

  /* ================= UI wiring ================= */
  function setBusy(on) {
    $('btnRun').disabled = on;
    $('btnSubmit').disabled = on;
  }

  function init() {
    paintSidebar();
    ed = new CodeEditor($('code'), {});

    /* คืนงานที่ค้างไว้จากครั้งก่อน (ถ้ามี) */
    const draft = getDraft(P.id);
    if (draft && typeof draft.code === 'string' && !draftIsEmpty(draft.code)) {
      ed.setValue(draft.code);
      if (typeof draft.sel === 'number') {
        try { ed.setSelection(draft.sel, draft.sel); } catch (e) {}
      }
      paintSaveTag('ok', draft.at || Date.now());
    } else {
      ed.setValue(starterCode());
      paintSaveTag('none');
    }

    /* บันทึกทุกครั้งที่พิมพ์ (หน่วง 400ms) + ก่อนปิดหน้า */
    ed.onChange = queueSave;
    window.addEventListener('beforeunload', () => { if (saveTimer) saveDraftNow(); });
    window.addEventListener('pagehide', () => { if (saveTimer) saveDraftNow(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && saveTimer) saveDraftNow();
    });

    $('rawOut').innerHTML = '<span class="dimline">(ยังไม่มีผลลัพธ์)</span>';
    $('subBody').innerHTML = '<div class="empty">กด Submit เพื่อตรวจทุก Test Case</div>';

    $('btnRun').addEventListener('click', runSample);
    $('btnSubmit').addEventListener('click', submit);
    $('btnDebug').addEventListener('click', () => dbgToggle(!dbgOn));
    $('btnReset').addEventListener('click', () => {
      if (confirm('คืนค่าโค้ดกลับเป็นโค้ดเริ่มต้น? ข้อมูลที่คุณเขียนจะหาย')) {
        dropDraft(P.id);
        ed.setValue(starterCode());
        ed.setErrorLine(0);
        ed.setDebugLine(0);
        paintSaveTag('none');
        ed.focus();
      }
    });
    $('btnExport').addEventListener('click', exportDrafts);
    $('btnImport').addEventListener('click', importDrafts);
    $('fileImport').addEventListener('change', e => handleImportFile(e.target.files && e.target.files[0]));
    /* ปุ่ม sidebar: จอกว้างยุบ/ขยายในแถบ, จอแคบเป็น panel เลื่อนเข้ามา */
    const sideEl = $('side');
    const bgEl = $('sidebg');
    const setSideOpen = on => {
      sideEl.classList.toggle('open', on);
      bgEl.classList.toggle('on', on);
    };
    const toggleSide = () => {
      if (window.innerWidth <= 1000) setSideOpen(!sideEl.classList.contains('open'));
      else sideEl.classList.toggle('hide');
    };
    $('btnSide').addEventListener('click', toggleSide);
    /* จอแคบ: ปิด sidebar ไว้ก่อน ไม่ให้บังโค้ด (CSS ก็ซ่อนไว้แล้ว) */
    if (window.innerWidth <= 1000) setSideOpen(false);
    /* จอแคบ: คลิกที่พื้นที่นอก sidebar (ฉากมืด) แล้วปิด */
    bgEl.addEventListener('click', () => setSideOpen(false));
    document.addEventListener('mousedown', e => {
      if (window.innerWidth > 1000) return;
      if (!sideEl.classList.contains('open')) return;
      if (sideEl.contains(e.target)) return;
      setSideOpen(false);
    });
    /* จอแคบ: กด Esc แล้วปิด */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && window.innerWidth <= 1000) setSideOpen(false);
    });
    $('btnClearRaw').addEventListener('click', () => {
      $('rawOut').innerHTML = '<span class="dimline">(ยังไม่มีผลลัพธ์)</span>';
      $('runTag').textContent = '';
    });

    $('dbgStart').addEventListener('click', dbgStart);
    $('dbgStep').addEventListener('click', dbgStep);
    $('dbgGo').addEventListener('click', dbgGo);
    $('dbgStop').addEventListener('click', dbgStop);

    window.addEventListener('resize', () => { if (ed && ed.onResize) ed.onResize(); });

    document.addEventListener('keydown', e => {
      if (!(e.ctrlKey || e.metaKey)) {
        if (e.key === 'F5'){ e.preventDefault(); dbgStart(); }
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'enter'){ e.preventDefault(); e.shiftKey ? submit() : runSample(); }
      else if (k === 'b'){ e.preventDefault(); toggleSide(); }
      else if (k === 'f10'){ e.preventDefault(); if (dbgOn) dbgStep(); }
      else if (k === 'f8'){ e.preventDefault(); if (dbgOn) dbgGo(); }
    });

    /* ลากปรับขนาดแผงล่าง */
    (() => {
      const grip = $('grip'), bottom = $('bottom');
      let drag = false;
      grip.addEventListener('mousedown', e => { drag = true; e.preventDefault(); document.body.style.cursor = 'ns-resize'; });
      window.addEventListener('mousemove', e => {
        if (!drag) return;
        const h = Math.min(Math.max(window.innerHeight - e.clientY, 120), window.innerHeight - 260);
        bottom.style.height = h + 'px';
      });
      window.addEventListener('mouseup', () => { if (drag){ drag = false; document.body.style.cursor = ''; } });
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
