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

  /* ไอคอนบ้าน ใช้ซ้ำหลายที่ */
  const ICON_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>';

  /* จำจุดเริ่มจอบ Submit ไว้บอกเวลาที่ใช้ไป */
  let submitStart = Date.now();

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
    const hints = readHints();
    const hintKeys = Object.keys(hints);
    if (!keys.length && !hintKeys.length) { alert('ยังไม่มีงานที่บันทึกไว้เลย'); return; }
    const payload = {
      app: 'code-practice',
      version: 1,
      savedAt: new Date().toISOString(),
      drafts: all,
      /* เก็บ "ใช้คำใบ้ไปถึงระดับไหน" ไว้ด้วย เพื่อให้ครูเห็นว่าโจทย์ไหนนักเรียนติด */
      hints: hints
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
      /* รับข้อมูล "เคยใช้คำใบ้ถึงระดับไหน" มารวมด้วย (ถ้าไฟล์เก่าไม่มีก็ข้าม) */
      let hn = 0;
      const inHints = (data && typeof data === 'object' && data.hints) ? data.hints : null;
      if (inHints && typeof inHints === 'object' && !Array.isArray(inHints)) {
        const curH = readHints();
        Object.keys(inHints).forEach(k => {
          const s = inHints[k];
          if (!s || typeof s !== 'object') return;
          const prev = (curH[k] && typeof curH[k] === 'object') ? curH[k] : { lv: 0, sols: [] };
          const lv = Math.max(Number(prev.lv) || 0, Number(s.lv) || 0);
          const sols = Array.isArray(prev.sols) ? prev.sols.slice() : [];
          if (Array.isArray(s.sols)) s.sols.forEach(x => { if (sols.indexOf(x) < 0) sols.push(x); });
          curH[k] = { lv: lv, sols: sols };
          hn++;
        });
        try { localStorage.setItem(HINT_KEY, JSON.stringify(curH)); } catch (e) { /* โหมดส่วนตัว */ }
      }
      if (!n && !hn) { alert('ไม่พบโค้ดที่นำเข้าได้เลย'); return; }
      if (!writeAll(cur)) { alert('บันทึกลงเครื่องไม่สำเร็จ (พื้นที่เต็ม หรือเบราว์เซอร์ปิดกั้น)'); return; }
      let msg = '';
      if (n) msg += 'นำเข้างาน ' + n + ' โจทย์';
      if (hn) msg += (msg ? '\n' : '') + 'นำเข้าประวัติการใช้คำใบ้ ' + hn + ' โจทย์';
      alert(msg + 'เรียบร้อย\nกดรีเฟรชหน้าเพื่อดูผล');
    };
    fr.onerror = () => alert('อ่านไฟล์ไม่สำเร็จ');
    fr.readAsText(f);
  }

  /* ---------------- คำใบ้ 3 ระดับ + เฉลยหลายแบบ ----------------
     หลักการ: โจทย์เดียวกันแก้ได้หลายวิธี จึงไม่ควรชี้ทางเดียว
       ระดับ 1 = ได้อะไรมา ต้องคืนอะไร        (ยังไม่บอกวิธี)
       ระดับ 2 = ต้องคิดเรื่องอะไรบ้าง        (ยังไม่บอกชื่อวิธี)
       ระดับ 3 = ยื่นทางเลือกพร้อมต้นทุน/ประโยชน์ ให้ผู้เรียนเลือกเอง
     บันทึกไว้ว่าเปิดถึงระดับไหนและดูเฉลยแบบไหนไปแล้ว
     เพื่อให้ครูเห็นว่าโจทย์ไหนนักเรียนต้องพึ่งคำใบ้ถึงระดับสุดท้าย */
  const HINT_KEY = 'cp_hints_v1';
  const HINT_SRC = 'problems/solutions.js?v=61';
  let hintData = null;      // window.HINTS
  let hintLoad = null;      // Promise กำลังโหลด
  let hintOpenLv = [];      // ระดับที่เปิดค้างไว้ในรอบนี้
  let hintOpenSol = [];     // การ์ดเฉลยที่เปิดค้างไว้ในรอบนี้

  function readHints(){
    try {
      const o = JSON.parse(localStorage.getItem(HINT_KEY));
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function hintState(){
    const a = readHints();
    const s = a[P.id];
    return (s && typeof s === 'object') ? s : { lv: 0, sols: [] };
  }
  function markHint(patch){
    const a = readHints();
    const s = a[P.id] && typeof a[P.id] === 'object' ? a[P.id] : { lv: 0, sols: [] };
    if (!Array.isArray(s.sols)) s.sols = [];
    if (typeof s.lv !== 'number') s.lv = 0;
    if (patch.lv > s.lv) s.lv = patch.lv;
    if (patch.sol && s.sols.indexOf(patch.sol) < 0) s.sols.push(patch.sol);
    a[P.id] = s;
    try { localStorage.setItem(HINT_KEY, JSON.stringify(a)); } catch (e) { /* โหมดส่วนตัว */ }
    paintHintBtn();
  }

  function loadHints(){
    if (window.HINTS) { hintData = window.HINTS; return Promise.resolve(hintData); }
    if (hintLoad) return hintLoad;
    hintLoad = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = HINT_SRC;
      s.onload = () => { hintData = window.HINTS || {}; resolve(hintData); };
      s.onerror = () => reject(new Error('โหลดข้อมูลคำใบ้ไม่สำเร็จ'));
      document.head.appendChild(s);
    });
    return hintLoad;
  }

  const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

  function hintEntry(){
    if (hintData) return hintData[P.id];
    return null;
  }

  function hintHead(label, open, n, seen) {
    return '<button class="hlvl-btn" type="button">'
      + '<span class="hlvl-n">' + n + '</span>'
      + '<span>' + esc(label) + '</span>'
      + (seen ? '<span class="seen">เปิดแล้ว</span>' : '')
      + CHEV + '</button>';
  }

  function renderHints() {
    const box = $('hintBody');
    const entry = hintEntry();
    if (!entry) {
      box.innerHTML = '<div class="empty">โจทย์นี้ยังไม่ได้เตรียมคำใบ้ไว้</div>';
      paintHintFoot();
      return;
    }
    const st = hintState();
    const hs = Array.isArray(entry.hints) ? entry.hints : [];
    const labels = ['ดูข้อมูล — ได้อะไรมา ต้องคืนอะไร',
                    'คิดเรื่องอะไร — ยังไม่บอกชื่อวิธี',
                    'ทางเลือก — เฉลยหลายแบบพร้อมข้อดีข้อเสีย'];

    let html = '';
    for (let i = 0; i < 3; i++) {
      const isOpen = hintOpenLv.indexOf(i + 1) >= 0;
      html += '<div class="hlvl' + (isOpen ? ' open' : '') + '" data-lv="' + (i + 1) + '">';
      html += hintHead(labels[i], isOpen, i + 1, st.lv > i);
      if (i < 2) {
        html += '<div class="hlvl-body">' + esc(hs[i] || '(ยังไม่มีคำใบ้ระดับนี้)') + '</div>';
      } else {
        html += '<div class="hlvl-body">'
          + '<div>' + esc(hs[2] || '') + '</div>'
          + renderSolutions(entry, st)
          + '</div>';
      }
      html += '</div>';
    }
    box.innerHTML = html;
    paintHintFoot();
  }

  function renderSolutions(entry, st) {
    const sols = Array.isArray(entry.solutions) ? entry.solutions : [];
    if (!sols.length) return '<div class="empty">ยังไม่มีเฉลยอ้างอิงสำหรับโจทย์นี้</div>';
    let html = '';
    for (let i = 0; i < sols.length; i++) {
      const s = sols[i];
      const key = s.name || ('sol' + i);
      const rec = !!s.recommended;
      const open = hintOpenSol.indexOf(key) >= 0;
      html += '<div class="sol' + (rec ? ' sol-rec' : '') + (open ? ' open' : '') + '" data-sol="' + esc(key) + '">';
      html += '<button class="sol-btn" type="button">'
        + '<span class="sol-nm">'
        + '<span class="sol-name">' + esc(s.name || '(ไม่มีชื่อ)') + '</span>'
        + '<span class="sol-cx">เวลา ' + esc(s.time || '-') + ' · หน่วยความจำ ' + esc(s.space || '-') + '</span>'
        + '</span>'
        + (rec ? '<span class="sol-tag">แนะนำ</span>' : '')
        + CHEV
        + '</button>';
      html += '<div class="sol-body">';
      if (s.why) html += '<div class="sol-why">' + esc(s.why) + '</div>';
      if (Array.isArray(s.pros) && s.pros.length) {
        html += '<div class="sol-lb">ข้อดี</div><ul class="sol-pro">'
          + s.pros.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>';
      }
      if (Array.isArray(s.cons) && s.cons.length) {
        html += '<div class="sol-lb">ข้อเสีย</div><ul class="sol-con">'
          + s.cons.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>';
      }
      if (s.code) {
        html += '<div class="sol-lb">โค้ด</div><div class="sol-code">'
          + '<pre><code>' + esc(s.code) + '</code></pre>'
          + '<button class="btn sm sol-copy" type="button">คัดลอก</button>'
          + '</div>';      }
      html += '<div class="sol-note">ลองเขียนเองก่อนเปิดดูนะ — ถ้าลองแล้วไม่ออก '
        + 'เทียบกับเฉลยนี้จะได้เร็วกว่าการเริ่มใหม่ตั้งแต่ต้น</div>';
      html += '</div></div>';
    }
    return html;
  }

  function paintHintFoot() {
    const st = hintState();
    const parts = [];
    parts.push(st.lv > 0 ? 'เปิดคำใบ้ถึงระดับ ' + st.lv + ' จาก 3' : 'ยังไม่ได้เปิดคำใบ้');
    if (st.sols && st.sols.length) parts.push('ดูเฉลยแล้ว ' + st.sols.length + ' แบบ');
    $('hintStat').textContent = parts.join(' · ');
  }

  function paintHintBtn() {
    const b = $('btnHint');
    if (!b) return;
    const st = hintState();
    b.classList.toggle('used', st.lv > 0 || (st.sols && st.sols.length > 0));
  }

  function openHint() {
    if (labIsOpen()) closeLab();
    const panel = $('hintPanel');
    const bg = $('hintBg');
    panel.hidden = false;
    bg.hidden = false;
    $('btnHint').classList.add('on');
    $('hintBody').innerHTML = '<div class="empty">กำลังโหลดคำใบ้…</div>';
    paintHintBtn();
    loadHints().then(() => {
      /* เปิดค้างไว้ถึงระดับที่เคยไปถึงแล้ว เพื่อให้ทำต่อได้โดยไม่ต้องกดซ้ำ */
      const st = hintState();
      hintOpenLv = [];
      for (let i = 1; i <= (st.lv > 0 ? st.lv : 0); i++) hintOpenLv.push(i);
      hintOpenSol = Array.isArray(st.sols) ? st.sols.slice() : [];
      renderHints();
    }).catch(() => {
      $('hintBody').innerHTML = '<div class="empty">โหลดข้อมูลคำใบ้ไม่สำเร็จ ลองรีเฟรชหน้า</div>';
    });
  }

  function closeHint() {
    $('hintPanel').hidden = true;
    $('hintBg').hidden = true;
    $('btnHint').classList.remove('on');
    hintOpenLv = [];
    hintOpenSol = [];
    paintHintBtn();
  }

  function hintIsOpen() { return !$('hintPanel').hidden; }

  function wireHints() {
    $('btnHint').addEventListener('click', () => (hintIsOpen() ? closeHint() : openHint()));
    $('hintClose').addEventListener('click', closeHint);
    $('hintBg').addEventListener('click', closeHint);

    $('hintBody').addEventListener('click', e => {
      /* เปิด/ปิดกล่องคำใบ้แต่ละระดับ */
      const lvlBtn = e.target.closest('.hlvl-btn');
      if (lvlBtn) {
        const box = lvlBtn.parentNode;
        const lv = Number(box.getAttribute('data-lv')) || 1;
        const willOpen = !box.classList.contains('open');
        const at = hintOpenLv.indexOf(lv);
        if (willOpen && at < 0) hintOpenLv.push(lv);
        if (!willOpen && at >= 0) hintOpenLv.splice(at, 1);
        markHint({ lv: willOpen ? lv : 0 });
        renderHints();
        return;
      }
      /* เปิด/ปิดการ์ดเฉลย และนับว่าเคยดูโค้ด */
      const solBtn = e.target.closest('.sol-btn');
      if (solBtn) {
        const box = solBtn.parentNode;
        const key = box.getAttribute('data-sol');
        const at = hintOpenSol.indexOf(key);
        if (at < 0) hintOpenSol.push(key);
        else hintOpenSol.splice(at, 1);
        markHint({ lv: 3, sol: key });
        renderHints();
        return;
      }
      /* คัดลอกเฉลยไปที่ clipboard */
      const cp = e.target.closest('.sol-copy');
      if (cp) {
        const pre = cp.parentNode.querySelector('pre');
        if (!pre) return;
        const text = pre.textContent;
        const done = () => {
          const old = cp.textContent;
          cp.textContent = 'คัดลอกแล้ว';
          setTimeout(() => { cp.textContent = old; }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, () => { window.prompt('คัดลอกโค้ดนี้', text); });
        } else {
          window.prompt('คัดลอกโค้ดนี้', text);
        }
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && hintIsOpen()) { closeHint(); return; }
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        hintIsOpen() ? closeHint() : openHint();
      }
    });
  }

  /* ---------------- แผง "ทดลองเอง" — ใส่ input อิสระ ----------------
     หลักการ
       - input ที่พิมพ์ถูกส่งเป็น stdin ตรง ๆ เหมือนตอนส่งงานจริง ไม่ผ่าน JSON.stringify ซ้ำ
         เพราะนักเรียนต้องการเขียน JSON เอง และต้องการเห็นว่า JSON เสียจะเกิดอะไรขึ้น
       - ไม่แตะ cp_progress_v1 ไม่นับจำนวนครั้งที่ส่ง ไม่กระทบผล Submit
       - เก็บ input ที่ชอบไว้เป็นรายการ เพื่อทดลองหลายชุดแล้วเทียบกันได้
       - เตือนเมื่อ JSON อ่านไม่ได้ แต่ยังให้รันได้ เพราะบางครั้งนักเรียนอยากเห็น error จริง
     เก็บคีย์ cp_lab_v1 แยกจากงาน เพื่อให้ลบทิ้งได้โดยไม่กระทบงานที่เขียนไว้ */
  const LAB_KEY = 'cp_lab_v1';
  let labDirty = false;        // ผู้ใช้แก้ input เองแล้ว ห้ามเขียนทับด้วยการกดปุ่มยกมา

  function readLab(){
    try {
      const o = JSON.parse(localStorage.getItem(LAB_KEY));
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function labState(){
    const a = readLab();
    const s = a[P.id];
    return (s && typeof s === 'object') ? s : { saved: [] };
  }
  function saveLabState(patch){
    const a = readLab();
    const s = labState();
    if (patch.saved) s.saved = patch.saved;
    if (patch.input !== undefined) s.input = patch.input;
    a[P.id] = s;
    try { localStorage.setItem(LAB_KEY, JSON.stringify(a)); } catch (e) { /* โหมดส่วนตัว */ }
  }

  /* อธิบายรูปร่างของ input ที่พิมพ์ เพื่อให้นักเรียนเห็นว่า "ที่โค้ดคาดหวัง" ตรงกันไหม
     นี่คือข้อมูลที่ช่วยได้มากที่สุดตอนคำตอบไม่ตรง เพราะส่วนใหญ่เกิดจาก "ใส่ input ผิดรูป" */
  function describeShape(text) {
    const t = String(text == null ? '' : text).trim();
    if (!t) return '';
    let v;
    try { v = JSON.parse(t); }
    catch (e) { return 'อ่านเป็น JSON ไม่ได้'; }
    const kind = Array.isArray(v) ? 'Array' : v === null ? 'null' : typeof v;
    if (Array.isArray(v)) {
      const first = v.length ? JSON.stringify(v[0]) : '';
      return 'Array ยาว ' + v.length + (first ? ' · สมาชิกแรกเป็น ' + kindOf(first) : ' · ว่างเปล่า');
    }
    if (v !== null && typeof v === 'object') {
      const keys = Object.keys(v);
      return 'Object · มี ' + keys.length + ' คีย์: ' + keys.join(', ');
    }
    return kind;
  }
  function kindOf(json) {
    try {
      const v = JSON.parse(json);
      if (Array.isArray(v)) return 'Array';
      if (v === null) return 'null';
      return typeof v;
    } catch (e) { return '?'; }
  }

  function labJsonError(text) {
    const t = String(text == null ? '' : text).trim();
    if (!t) return 'ยังไม่ได้พิมพ์ input — โค้ดจะได้ค่าว่างไป JSON.parse แล้ว error';
    try { JSON.parse(t); return null; }
    catch (e) { return String(e && e.message ? e.message : e); }
  }

  function renderLabQuick() {
    const box = $('labQuick');
    const items = [];
    const ex = (P.examples && P.examples[0]) ? String(P.examples[0].input) : null;
    if (ex) items.push({ label: 'ตัวอย่างโจทย์', text: ex });
    P.testCases.forEach((tc, i) => {
      items.push({ label: '#' + (i + 1), text: JSON.stringify(tc.input) });
    });
    box.innerHTML = items.map((it, i) =>
      '<button class="btn sm" type="button" data-q="' + i + '">' + esc(it.label) + '</button>'
    ).join('');
    box._items = items;
  }

  function labSetInput(text, fromUser) {
    $('labIn').value = text;
    if (!fromUser) labDirty = false;
    checkLabInput();
  }

  function checkLabInput() {
    const text = $('labIn').value;
    const err = labJsonError(text);
    const warn = $('labWarn');
    const ta = $('labIn');
    warn.classList.remove('on');
    ta.classList.remove('bad');
    if (err) {
      warn.textContent = (text.trim()
        ? 'JSON นี้อ่านไม่ได้: ' + err
        : err) + ' — โค้ดของโจทย์เรียก JSON.parse ตรง ๆ ถ้าปล่อยไว้จะเห็น error ตอนกดรัน';
      warn.classList.add('on');
      ta.classList.add('bad');
    }
    $('labShape').textContent = describeShape(text);
  }

  function labRun() {
    const text = $('labIn').value;
    $('labMeta').textContent = 'กำลังรัน…';
    $('labOut').innerHTML = '<span class="o-dim">กำลังรัน…</span>';
    const t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    /* หน่วงหนึ่งจังหวะก่อน เพื่อให้ข้อความ "กำลังรัน" อัปเดตทันที
       (ถ้าไม่หน่า การรันที่เสร็จเร็วมากจะไม่เห็นสถานะระหว่างทำงาน) */
    setTimeout(() => {
      const dt = ((window.performance && performance.now) ? performance.now() : Date.now()) - t0;
      let lines = [], err = null;
      try {
        const ast = Interp.parse(ed.getValue());
        const r = Interp.createRunner(ast, { input: text, maxSteps: 3000000 });
        let ev, guard = 0;
        for (;;) {
          ev = r.next();
          if (!ev || ev.type === 'done') break;
          if (++guard > 3000000) break;
        }
        if (ev && ev.type !== 'done') err = ev.err || null;
        else lines = r.ctx.out || [];
      } catch (e) {
        err = e;
      }
      const ms = Math.round(dt);
      $('labMeta').innerHTML = lines.length || err
        ? 'ใช้เวลา ' + ms + ' ms'
        : 'ใช้เวลา ' + ms + ' ms · ไม่มี console.log เลย';

      let h = '';
      if (lines.length) {
        for (const l of lines) h += esc(String(l)) + '\n';
      } else {
        h += '<span class="o-dim">' + (err ? '' : '(ไม่มี console.log — ลืมพิมพ์คำตอบหรือยัง?)') + '</span>';
      }
      if (err) {
        if (h) h += '<span class="o-sep">แล้วก็ error</span>';
        h += '<span class="o-err">' + esc((err.name || 'Error') + ': ' + (err.message || ''))
          + (err.line ? '  (บรรทัด ' + err.line + ')' : '') + '</span>';
      }
      $('labOut').innerHTML = h.replace(/\n$/, '');
      $('labOut').scrollTop = 0;
      markLabSaved(text, err ? 'error' : 'ok');
    }, 20);
  }

  function markLabSaved(text, state) {
    const st = labState();
    const item = (st.saved || []).find(x => x.input === text);
    if (!item) return;
    item.state = state;
    saveLabState({ saved: st.saved });
    renderLabSaved();
  }

  function renderLabSaved() {
    const st = labState();
    const list = Array.isArray(st.saved) ? st.saved : [];
    $('labSavedN').textContent = list.length ? list.length + ' ชุด' : '';
    $('labSaved').innerHTML = list.map((it, i) =>
      '<div class="labitem" data-i="' + i + '">'
      + '<span class="nm" title="' + esc(it.input) + '">' + esc(it.name) + '</span>'
      + (it.state === 'ok' ? '<span class="st ok">รันแล้ว</span>'
        : it.state === 'error' ? '<span class="st">error</span>' : '')
      + '<span class="mini">'
      + '<button class="btn sm" data-a="run" data-i="' + i + '">รัน</button>'
      + '<button class="btn sm" data-a="load" data-i="' + i + '" title="เอามาแก้ต่อ">แก้</button>'
      + '<button class="btn sm" data-a="del" data-i="' + i + '" title="ลบชุดนี้">ลบ</button>'
      + '</span></div>'
    ).join('');
  }

  function labAdd() {
    const text = $('labIn').value.trim();
    if (!text) { alert('ยังไม่ได้พิมพ์ input'); return; }
    const st = labState();
    const list = Array.isArray(st.saved) ? st.saved.slice() : [];
    if (list.some(x => x.input === text)) { alert('เก็บ input นี้ไว้แล้ว'); return; }
    const name = window.prompt('ตั้งชื่อชุดนี้ว่าอะไรดี', 'ชุดที่ ' + (list.length + 1));
    if (name === null) return;
    list.push({ name: (name || ('ชุดที่ ' + (list.length + 1))).slice(0, 40), input: text, state: '' });
    saveLabState({ saved: list });
    renderLabSaved();
  }

  function labFormat() {
    const text = $('labIn').value.trim();
    if (!text) return;
    try {
      $('labIn').value = JSON.stringify(JSON.parse(text), null, 2);
      labDirty = true;
      checkLabInput();
    } catch (e) {
      alert('จัดรูปไม่ได้ เพราะ JSON นี้อ่านไม่ผ่าน:\n' + (e && e.message ? e.message : e));
    }
  }

  function labLoadQuick(i) {
    const items = $('labQuick')._items;
    if (!items || !items[i]) return;
    labSetInput(items[i].text, false);
    $('labIn').value = items[i].text;
    labDirty = true;
    saveLabState({ input: items[i].text });
    /* ทำเครื่องหมายว่าปุ่มไหนถูกกดล่าสุด */
    Array.from($('labQuick').children).forEach((b, j) => b.classList.toggle('on', j === i));
  }

  function openLab() {
    if (hintIsOpen()) closeHint();
    const st = labState();
    renderLabQuick();
    renderLabSaved();
    labSetInput(st.input !== undefined ? st.input : JSON.stringify(P.testCases[0].input), false);
    $('labPanel').hidden = false;
    $('labBg').hidden = false;
    $('btnLab').classList.add('on');
    $('labOut').innerHTML = '<span class="o-dim">พิมพ์ input แล้วกดรัน — ลองแก้จากข้อมูลของโจทย์ก็ได้</span>';
    $('labMeta').textContent = '';
  }

  function closeLab() {
    $('labPanel').hidden = true;
    $('labBg').hidden = true;
    $('btnLab').classList.remove('on');
  }
  function labIsOpen() { return !$('labPanel').hidden; }

  function wireLab() {
    $('btnLab').addEventListener('click', () => (labIsOpen() ? closeLab() : openLab()));
    $('labClose').addEventListener('click', closeLab);
    $('labBg').addEventListener('click', closeLab);
    $('labRun').addEventListener('click', labRun);
    $('labSave').addEventListener('click', labAdd);
    $('labFormat').addEventListener('click', labFormat);
    $('labCopy').addEventListener('click', () => {
      const text = $('labIn').value;
      const done = () => {
        const b = $('labCopy');
        const old = b.textContent;
        b.textContent = 'คัดลอกแล้ว';
        setTimeout(() => { b.textContent = old; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => window.prompt('คัดลอก input', text));
      } else {
        window.prompt('คัดลอก input', text);
      }
    });

    /* พิมพ์ input -> เตือนเรื่องรูปร่าง และจำไว้ (หน่วง 400ms เหมือนการบันทึกงาน) */
    let labTimer = null;
    $('labIn').addEventListener('input', () => {
      checkLabInput();
      labDirty = true;
      if (labTimer) clearTimeout(labTimer);
      labTimer = setTimeout(() => { labTimer = null; saveLabState({ input: $('labIn').value }); }, 400);
    });
    /* Ctrl+Enter ในช่อง input = รัน */
    $('labIn').addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); labRun(); }
    });

    /* ปุ่มยกมาจากเคสของโจทย์ */
    $('labQuick').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      labLoadQuick(Number(b.getAttribute('data-q')));
    });

    /* รายการชุดทดลอง: รัน / แก้ / ลบ */
    $('labSaved').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const i = Number(b.getAttribute('data-i'));
      const st = labState();
      const list = Array.isArray(st.saved) ? st.saved : [];
      if (!list[i]) return;
      const act = b.getAttribute('data-a');
      if (act === 'run') {
        labSetInput(list[i].input, true);
        saveLabState({ input: list[i].input });
        labRun();
      } else if (act === 'load') {
        labSetInput(list[i].input, true);
        saveLabState({ input: list[i].input });
        $('labIn').focus();
      } else if (act === 'del') {
        if (!confirm('ลบชุด "' + list[i].name + '" ออก?')) return;
        list.splice(i, 1);
        saveLabState({ saved: list });
        renderLabSaved();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && labIsOpen()) { closeLab(); return; }
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === 'l' && e.shiftKey) {
        e.preventDefault();
        labIsOpen() ? closeLab() : openLab();
      }
    });
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
    submitStart = Date.now();
    $('subTag').textContent = 'กำลังตรวจ…';
    $('subBody').innerHTML = '<div class="empty">กำลังทำงาน…</div>';
    $('subDetail').innerHTML = '';
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
    const allPass = bad === 0 && total > 0;
    const score = Math.round(P.score * ok / total);

    /* ผ่านทุกเคส -> แสดงหน้าสรุปคะแนนใหชัดเจน (แทนที่จะเพียงข้อความสรุปเล็ก ๆ) */
    $('subBody').innerHTML = allPass ? doneCard(total, score) : tryAgainCard(total, ok, score);

    /* รายละเอียดแต่ละเคส (พับไว้ใต้หน้าสรุป) */
    let h = '';
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
    const detail = $('subDetail');
    detail.innerHTML = h;
    detail.querySelectorAll('.tc-h').forEach(el => {
      el.addEventListener('click', () => el.parentElement.classList.toggle('open'));
    });

    /* ปุ่มกาง/ยกรายละเอียดแต่ละ Test Case */
    const tg = $('finToggle');
    if (tg) tg.addEventListener('click', () => {
      const on = detail.classList.toggle('show');
      tg.textContent = on ? 'ซ่อนรายละเอียดแต่ละ Test Case' : 'ดูรายละเอียดแต่ละ Test Case';
      detail.parentElement.classList.toggle('expanded', on);
    });

    /* ปุ่มกลับไปแก้โค้ด (เฉพาะตอนยังไม่ผ่าน) — กางเคสที่ยังตกให้เห็นทันที */
    const fe = $('finEdit');
    if (fe) fe.addEventListener('click', () => {
      if (!detail.classList.contains('show') && tg) tg.click();
      const rows = detail.querySelectorAll('.tc');
      let bad = null;
      for (const row of rows) if (row.querySelector('.tc-s.no')) { bad = row; break; }
      if (bad) {
        for (const row of rows) row.classList.toggle('open', row === bad);
        bad.scrollIntoView({ block: 'nearest' });
      }
      ed.focus();
    });
  }

  /* ---------- หน้าสรุป: ผ่านหมด ---------- */
  function doneCard(total, score){
    const secs = Math.max(1, Math.round((Date.now() - submitStart) / 1000));
    const mm = Math.floor(secs / 60), ss = secs % 60;
    const pct = P.score ? Math.round(score / P.score * 100) : 0;
    const grade = pct === 100 ? 'เต็ม' : pct >= 80 ? 'ดีมาก' : pct >= 60 ? 'พอใช้' : 'ยังต้องพัฒนา';
    const nb = neighbour();
    return `<div class="finish pass">
      <div class="fin-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div class="fin-tt">ทำถูกต้องครบทุก Test Case</div>
      <div class="fin-score">${score}<span>/${P.score}</span></div>
      <div class="fin-grade">${grade} · ผ่าน ${total} เคส · ใช้เวลา ${mm} นาที ${ss} วินาที</div>
      <div class="fin-acts">
        ${nb.next ? `<a class="btn go" href="editor.html?id=${nb.next.id}">โจทย์ถัดไป
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>` : ''}
        ${nb.prev ? `<a class="btn" href="editor.html?id=${nb.prev.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>ย้อนกลับ</a>` : ''}
        <a class="btn" href="index.html">${ICON_HOME} หน้ารายการโจทย์</a>
      </div>
    </div>
    <div class="fin-toggle" id="finToggle">ดูรายละเอียดแต่ละ Test Case</div>`;
  }

  /* ---------- หน้าสรุป: ยังไม่ผ่านหมด ----------
     ไม่ใส่ปุ่ม "กลับไปเลือกโจทย์" เพราะหลังผิดคือจังหวะที่ควรแก้ต่อ ไม่ใช่เลิกทำ
     ปุ่มกลับหน้าหลักอยู่ในแถบบนตลอดอยู่แล้ว */
  function tryAgainCard(total, ok, score){
    const left = total - ok;
    return `<div class="finish fail">
      <div class="fin-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/></svg>
      </div>
      <div class="fin-tt">ยังไม่ผ่านครบ</div>
      <div class="fin-score">${score}<span>/${P.score}</span></div>
      <div class="fin-grade">ผ่าน ${ok} จาก ${total} เคส — เหลืออีก ${left} เคสที่ยังไม่ถูก</div>
      <div class="fin-acts">
        <button class="btn go" id="finEdit">กลับไปแก้โค้ดต่อ</button>
      </div>
    </div>
    <div class="fin-toggle" id="finToggle">ดูรายละเอียดแต่ละ Test Case</div>`;
  }

  /* โจทย์ก่อนหน้า / ถัดไป ตามลำดับที่แสดงบนหน้าแรก */
  function neighbour(){
    const ids = Object.keys(PROBLEMS);
    const i = ids.indexOf(P.id);
    return {
      prev: i > 0 ? PROBLEMS[ids[i - 1]] : null,
      next: i >= 0 && i < ids.length - 1 ? PROBLEMS[ids[i + 1]] : null
    };
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
    /* ส่งรูปร่างอินพุตจริงของโจทย์เข้าไป ให้ตัวช่วยพิมพ์รู้ว่า
       ตัวแปรที่รับค่าเป็น Array หรือ Object (JSON.parse ให้ได้ทั้งสองแบบ) */
    ed = new CodeEditor($('code'), {
      inputName: P.inputName || 'data',
      shape: P.testCases && P.testCases[0] ? P.testCases[0].input : undefined
    });

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
    wireHints();
    wireLab();
    paintHintBtn();
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
