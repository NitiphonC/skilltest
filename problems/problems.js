/* =========================================================
   PROBLEMS DATA — ทั้งหมด 8 ข้อ
   รูปแบบ Input สำหรับผู้เรียน:
     const fs = require('fs');
     const input = fs.readFileSync(0, 'utf-8').trim();
     const words = JSON.parse(input);
   ผลลัพธ์: console.log(...)
   ========================================================= */

const PROBLEMS = {

  /* ---------- 1. นับนก ---------- */
  p1: {
    id: 'p1',
    inputName: 'birds',
    title: 'นับนก',
    subtitle: 'Bird Count',
    score: 20,
    difficulty: 'easy',
    desc: 'นักวิทยาศาสตร์นับนกเป็นตัวเลขรหัสประเภท (1, 2, 3, ...) ต้องการหารหัสที่มีจำนวนมากที่สุด และถ้าเท่ากันให้เลือกรหัสที่น้อยที่สุด',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม เช่น [1,1,2,2,2,3]',
    outputDesc: 'ตัวเลขรหัสนกที่ตรงตามเงื่อนไข (หนึ่งค่า)',
    examples: [{ input: '[1,1,2,2,2,3]', output: '2' }],
    testCases: [
      { input: [1,1,2,2,2,3], output: 2 },
      { input: [3,2,2,2,1,1,1,1], output: 1 },
      { input: [5,5,5,5,1,2,3], output: 5 },
      { input: [1], output: 1 },
      { input: [1,2,3,4,5,6,7,8,9,10,10], output: 10 }
    ]
  },

  /* ---------- 2. ซื้อยังไงดี ---------- */
  p2: {
    id: 'p2',
    inputName: 'shop',
    title: 'ซื้อยังไงดี',
    subtitle: 'Electronics Shop',
    score: 25,
    difficulty: 'easy',
    desc: 'มีงบประมาณ b บาท ต้องซื้อคีย์บอร์ด 1 ตัว และไดรฟ์ USB 1 ตัว ราคารวมต้องไม่เกิน b และต้องได้ราคารวมที่มากที่สุด ถ้าไม่มีคู่ใดที่พอเงิน ให้ตอบ -1',
    inputDesc: '{ b: งบประมาณ, k: [ราคาคีย์บอร์ด...], u: [ราคา USB...] }',
    outputDesc: 'ราคารวมที่มากที่สุดที่จ่ายได้ หรือ -1',
    examples: [{ input: '{ "b": 10, "k": [3,1], "u": [5,2,8] }', output: '9' }],
    testCases: [
      { input: { b: 10, k: [3,1],  u: [5,2,8] },        output: 9 },
      { input: { b: 5,  k: [4],    u: [5] },            output: -1 },
      { input: { b: 100,k: [5,10,15], u: [20,30,40] },  output: 55 },
      { input: { b: 10, k: [1],    u: [1] },            output: 2 },
      { input: { b: 9,  k: [4,9],  u: [5,1] },          output: 9 }
    ]
  },

  /* ---------- 3. จัตุรัสปริศนา ---------- */
  p3: {
    id: 'p3',
    inputName: 'houses',
    title: 'จัตุรัสปริศนา',
    subtitle: 'Perfect Square Houses',
    score: 25,
    difficulty: 'easy',
    desc: 'นับจำนวนเลขกำลังสองสมบูรณ์ในช่วง A ถึง B (รวมเข้า A และ B) เลขกำลังสองสมบูรณ์คือเลขที่เกิดจากจำนวนเต็มคูณตัวเองพอดี เช่น 1, 4, 9, 16, 25',
    inputDesc: '{ A: เลขเริ่มต้น, B: เลขสุดท้าย }',
    outputDesc: 'จำนวนเลขกำลังสองสมบูรณ์ในช่วงนั้น',
    examples: [{ input: '{ "A": 3, "B": 9 }', output: '2' }],
    testCases: [
      { input: { A: 3,  B: 9  },  output: 2 },
      { input: { A: 1,  B: 4  },  output: 2 },
      { input: { A: 1,  B: 9  },  output: 3 },
      { input: { A: 16, B: 16 },  output: 1 },
      { input: { A: 17, B: 24 },  output: 0 },
      { input: { A: 1,  B: 100 }, output: 10 }
    ]
  },

  /* ---------- 4. ตัวเลขปริศนา ---------- */
  p4: {
    id: 'p4',
    inputName: 'groups',
    title: 'ตัวเลขปริศนา',
    subtitle: 'Mystery Number',
    score: 30,
    difficulty: 'hard',
    desc: 'หาตัวเลขที่น้อยที่สุดที่ (1) หารด้วยทุกตัวในกลุ่ม A ลงตัว และ (2) ตัวเลขนั้นหารกลุ่ม B ลงตัวทุกตัว ถ้าไม่มีให้ตอบ -1',
    inputDesc: '{ A: [ตัวเลข...], B: [ตัวเลข...] }',
    outputDesc: 'ตัวเลขที่น้อยที่สุดที่เป็นไปได้ หรือ -1',
    examples: [{ input: '{ "A": [2,6], "B": [24,36] }', output: '6' }],
    testCases: [
      { input: { A: [2,6],   B: [24,36] },      output: 6 },
      { input: { A: [2,4],   B: [16,32,96] },   output: 4 },
      { input: { A: [3,4],   B: [24,48] },      output: 12 },
      { input: { A: [4,6],   B: [12,18] },      output: -1 },
      { input: { A: [5,7],   B: [35] },         output: 35 }
    ]
  },

  /* ---------- 5. ถนนบริการ ---------- */
  p5: {
    id: 'p5',
    inputName: 'road',
    title: 'ถนนบริการ',
    subtitle: 'Service Lane',
    score: 25,
    difficulty: 'easy',
    desc: 'ถนนถูกแบ่งเป็นช่วง ๆ ความกว้างแต่ละช่วงมีค่า 1-3 (1=จักรยาน, 2=รถยนต์, 3=รถบรรทุก) สำหรับแต่ละช่วง [i, j] ให้หาความกว้างที่แคบที่สุดในช่วงนั้น',
    inputDesc: '{ width: [ความกว้างแต่ละช่วง], cases: [[i,j], ...] }',
    outputDesc: 'Array ของความกว้างที่แคบที่สุด เรียงตาม cases',
    examples: [{ input: '{ "width": [2,3,1,2,3,2,3,3], "cases": [[0,3],[4,6],[6,7]] }', output: '[1,2,3]' }],
    testCases: [
      { input: { width: [2,3,1,2,3,2,3,3], cases: [[0,3],[4,6],[6,7]] }, output: [1,2,3] },
      { input: { width: [2,3,1,2,3,2,3,3], cases: [[0,3]] },                  output: [1] },
      { input: { width: [1,1,1],            cases: [[0,2],[1,2],[2,2]] },  output: [1,1,1] },
      { input: { width: [3,3,3,3],          cases: [[0,3],[1,2]] },        output: [3,3] }
    ]
  },

  /* ---------- 6. สมการจัดเรียง ---------- */
  p6: {
    id: 'p6',
    inputName: 'perm',
    title: 'สมการจัดเรียง',
    subtitle: 'Sequence Equation',
    score: 30,
    difficulty: 'medium',
    desc: 'อาร์เรย์ p มีค่าตั้งแต่ 1 ถึง n แต่สลับตำแหน่ง (นับ index จาก 1) สำหรับ x ตั้งแต่ 1 ถึง n ให้หา y ที่ทำให้ p(p(y)) = x แล้วเรียงคำตอบตามลำดับ x = 1, 2, ..., n',
    inputDesc: '{ p: [ค่าของ p ตาม index 1..n] }',
    outputDesc: 'Array ของ y เรียงตาม x = 1 ถึง n',
    examples: [{ input: '{ "p": [5,2,1,3,4] }', output: '[4,2,5,1,3]' }],
    testCases: [
      { input: { p: [5,2,1,3,4] },   output: [4,2,5,1,3] },
      { input: { p: [2,3,1] },       output: [2,3,1] },
      { input: { p: [4,2,5,3,1] },   output: [3,2,1,5,4] },
      { input: { p: [1] },           output: [1] }
    ]
  },

  /* ---------- 7. วันของโปรแกรมเมอร์ ---------- */
  p7: {
    id: 'p7',
    inputName: 'info',
    title: 'วันของโปรแกรมเมอร์',
    subtitle: "Day of the Programmer",
    score: 30,
    difficulty: 'medium',
    desc: 'หาวันที่ 256 ของปี (256 = 2^8) ในรูปแบบ dd.mm.yyyy — ปี 1700-1917 ใช้ปฏิทินจูเลียน (ปีอธิกสุร = หาร 4 ลงตัว), ปี 1918 ตอบ 26.09.1918 เสมอ, ปี 1919-2700 ใช้เกรกอเรียน (หาร 400 ลง หรือ หาร 4 ลงและหาร 100 ไม่ลง)',
    inputDesc: '{ year: ปี ค.ศ. (1700-2700) }',
    outputDesc: 'สตริงวันที่ dd.mm.yyyy',
    examples: [{ input: '{ "year": 2016 }', output: '12.09.2016' }],
    testCases: [
      { input: { year: 2016 }, output: '12.09.2016' },
      { input: { year: 2017 }, output: '13.09.2017' },
      { input: { year: 1918 }, output: '26.09.1918' },
      { input: { year: 1919 }, output: '13.09.1919' },
      { input: { year: 2000 }, output: '12.09.2000' },
      { input: { year: 1800 }, output: '12.09.1800' },
      { input: { year: 2100 }, output: '13.09.2100' }
    ]
  },

  /* ---------- 8. แบ่งช็อกโกแลตวันเกิด ---------- */
  p8: {
    id: 'p8',
    inputName: 'chocolate',
    title: 'แบ่งช็อกโกแลตวันเกิด',
    subtitle: 'Subarray Division',
    score: 30,
    difficulty: 'medium',
    desc: 'ช็อกโกแลตแต่ละช่องมีตัวเลข (s) ต้องหาวิธีตัดเป็นช่วงติดกัน (subarray) ที่ความยาวเท่ากับเดือนเกิด m และผลรวมเท่ากับวันเกิด d',
    inputDesc: '{ s: [ตัวเลขแต่ละช่อง], d: วันเกิด, m: เดือนเกิด }',
    outputDesc: 'จำนวนวิธีที่ตัดได้ทั้งหมด',
    examples: [{ input: '{ "s": [2,2,1,3,2], "d": 4, "m": 2 }', output: '2' }],
    testCases: [
      { input: { s: [2,2,1,3,2], d: 4, m: 2 }, output: 2 },
      { input: { s: [3,4,7,2],    d: 7, m: 2 }, output: 1 },
      { input: { s: [1,2,3,4],    d: 4, m: 1 }, output: 1 },
      { input: { s: [1,1,1,1],    d: 2, m: 2 }, output: 3 },
      { input: { s: [5,5,5],       d: 15, m: 3 }, output: 1 }
    ]
  },

  /* ========================================================
     ชั้นที่ 1 — พื้นฐาน
     ======================================================== */

  /* ---------- 9. ผลรวมตัวเลข ---------- */
  p9: {
    id: 'p9',
    inputName: 'numbers',
    title: 'ผลรวมตัวเลข',
    subtitle: 'Total Sum',
    score: 20,
    difficulty: 'easy',
    desc: 'นักสถิติต้องการหาผลรวมของชุดตัวเลยทั้งหมดที่มีอยู่ ให้หาผลรวมแล้วสั่งพิมพ์ออกมา',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม (อาจมีทั้งบวกและลบ)',
    outputDesc: 'ผลรวมของทุกตัวใน Array',
    examples: [{ input: '[1,2,3]', output: '6' }],
    testCases: [
      { input: [1,2,3],           output: 6 },
      { input: [10,20,30,40],     output: 100 },
      { input: [-5,5,0],          output: 0 },
      { input: [7],               output: 7 },
      { input: [2,2,2,2,2,2],     output: 12 },
      { input: [-1,-2,-3],        output: -6 }
    ]
  },

  /* ---------- 10. นับเลขคู่ ---------- */
  p10: {
    id: 'p10',
    inputName: 'numbers',
    title: 'นับเลขคู่',
    subtitle: 'Count Evens',
    score: 20,
    difficulty: 'easy',
    desc: 'ตรวจสอบระบบเซ็นเซอร์ของโรงงาน ต้องการรู้ว่ามีเครื่องจักรกี่เครื่องที่หมายเลขเป็นเลขคู่ (หาร 2 ลงตัว) รวมทั้งเลข 0 ด้วย',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม',
    outputDesc: 'จำนวนเลขที่หาร 2 ลงตัวใน Array',
    examples: [{ input: '[1,2,3,4]', output: '2' }],
    testCases: [
      { input: [1,2,3,4],   output: 2 },
      { input: [2,4,6],     output: 3 },
      { input: [1,3,5],     output: 0 },
      { input: [0,8],       output: 2 },
      { input: [7],         output: 0 },
      { input: [-4,-3,-2],  output: 2 }
    ]
  },

  /* ---------- 11. ราคาถูกที่สุด ---------- */
  p11: {
    id: 'p11',
    inputName: 'prices',
    title: 'ราคาถูกที่สุด',
    subtitle: 'Cheapest Price',
    score: 20,
    difficulty: 'easy',
    desc: 'ร้านค้าต้องการรู้ราคาที่ต่ำที่สุดของสินค้าแต่ละชิ้นในสต็อก เพื่อจัดราคาขายต่อ (รับประกันว่ามีสินค้าอย่างน้อย 1 ชิ้น และราคาอาจติดลบได้)',
    inputDesc: 'Array ของตัวเลขราคา',
    outputDesc: 'ราคาที่ต่ำที่สุดใน Array',
    examples: [{ input: '[3,7,2,9]', output: '2' }],
    testCases: [
      { input: [3,7,2,9],  output: 2 },
      { input: [5],        output: 5 },
      { input: [-3,-8],    output: -8 },
      { input: [4,4],      output: 4 },
      { input: [10,1,6],   output: 1 },
      { input: [2,9,2,9],  output: 2 }
    ]
  },

  /* ---------- 12. นับคำ ---------- */
  p12: {
    id: 'p12',
    inputName: 'sentence',
    title: 'นับคำ',
    subtitle: 'Word Count',
    score: 20,
    difficulty: 'easy',
    desc: 'เครื่องมือตรวจหาคีย์เวิร์ดนับจำนวนคำในข้อความ คำถูกคั่นด้วยช่องว่าง ซึ่งอาจมีหลายช่องติดกันหรือช่องว่างหัวท้ายประโยค ต้องไม่นับช่องว่างเป็นคำ',
    inputDesc: 'สตริงประโยค (อาจมีช่องว่างเกินหรือช่องว่างหัวท้าย)',
    outputDesc: 'จำนวนคำในประโยค',
    examples: [{ input: '"hello world"', output: '2' }],
    testCases: [
      { input: 'hello world',     output: 2 },
      { input: '  a  b  ',         output: 2 },
      { input: 'one',             output: 1 },
      { input: 'a b c d e',       output: 5 },
      { input: 'x   y',           output: 2 },
      { input: '   ',             output: 0 }
    ]
  },

  /* ---------- 13. อักษรย่อชื่อ ---------- */
  p13: {
    id: 'p13',
    inputName: 'fullName',
    title: 'อักษรย่อชื่อ',
    subtitle: 'Initials',
    score: 20,
    difficulty: 'easy',
    desc: 'แบบฟอร์มลงทะเบียนต้องการอักษรย่อของชื่อ โดยเอาตัวอักษรแรกของทุกคำ ตัดพิมพ์ใหญ่ทั้งหมด แล้วต่อกันโดยไม่มีช่องว่าง (เก็บลำดับคำตามเดิม)',
    inputDesc: 'สตริงชื่อ-นามสกุล คั่นด้วยช่องว่าง',
    outputDesc: 'สตริงอักษรย่อ เช่น "JS"',
    examples: [{ input: '"john smith"', output: '"JS"' }],
    testCases: [
      { input: 'john smith',         output: 'JS' },
      { input: 'mary jane watson',   output: 'MJW' },
      { input: 'a b',                output: 'AB' },
      { input: 'single',             output: 'S' },
      { input: 'lee bo young',       output: 'LBY' },
      { input: 'AB cd',              output: 'AC' }
    ]
  },

  /* ---------- 14. แปลงวินาทีเป็นเวลา ---------- */
  p14: {
    id: 'p14',
    inputName: 'seconds',
    title: 'แปลงวินาทีเป็นเวลา',
    subtitle: 'Seconds to Clock',
    score: 20,
    difficulty: 'easy',
    desc: 'ระบบบันทึกเวลาต้องแสดงจำนวนวินาทีเป็นนาฬิกาดิจิทัลรูปแบบ h:mm:ss โดยชั่วโมงไม่ต้องเติม 0 ข้างหน้า แต่นาทีและวินาทีต้องเติม 0 ข้างหน้าให้ครบ 2 หลักเสมอ',
    inputDesc: 'จำนวนวินาทีเป็นจำนวนเต็มตั้งแต่ 0 ถึง 86399',
    outputDesc: 'สตริงเวลารูปแบบ h:mm:ss',
    examples: [{ input: '3661', output: '"1:01:01"' }],
    testCases: [
      { input: 3661,  output: '1:01:01' },
      { input: 59,    output: '0:00:59' },
      { input: 60,    output: '0:01:00' },
      { input: 3600,  output: '1:00:00' },
      { input: 86399, output: '23:59:59' },
      { input: 0,     output: '0:00:00' }
    ]
  },

  /* ---------- 15. ตรวจพาลินโดรม ---------- */
  p15: {
    id: 'p15',
    inputName: 'word',
    title: 'ตรวจพาลินโดรม',
    subtitle: 'Palindrome Check',
    score: 20,
    difficulty: 'easy',
    desc: 'โจทย์ตรวจคำว่าเป็นพาลินโดรมหรือไม่ คืออ่านจากซ้ายไปขวาแล้วเหมือนกับอ่านจากขวาไปซ้าย ไม่สนใจตัวพิมพ์เล็กใหญ่ (a กับ A ถือเป็นตัวเดียวกัน)',
    inputDesc: 'สตริงคำที่ต้องการตรวจ',
    outputDesc: '1 ถ้าเป็นพาลินโดรม, 0 ถ้าไม่ใช่',
    examples: [{ input: '"level"', output: '1' }],
    testCases: [
      { input: 'level',    output: 1 },
      { input: 'hello',    output: 0 },
      { input: 'a',        output: 1 },
      { input: 'AbA',      output: 1 },
      { input: 'racecar',  output: 1 },
      { input: 'abcba',    output: 1 },
      { input: 'abcd',     output: 0 }
    ]
  },

  /* ---------- 16. หาเลขที่หายไป ---------- */
  p16: {
    id: 'p16',
    inputName: 'sequence',
    title: 'หาเลขที่หายไป',
    subtitle: 'Missing Number',
    score: 20,
    difficulty: 'easy',
    desc: 'เลขเรียง 1, 2, 3, ... ไปเรื่อย ๆ แต่มีตัวเลขหายไป 1 ตัว เหลือมาใน Array เรียงจากน้อยไปมาก ต้องหาตัวเลขที่หายไป',
    inputDesc: 'Array ของตัวเลขที่เรียงจากน้อยไปมาก ขาดไป 1 ตัว',
    outputDesc: 'ตัวเลขที่หายไป',
    examples: [{ input: '[1,2,4,5]', output: '3' }],
    testCases: [
      { input: [1,2,4,5],       output: 3 },
      { input: [1,3,4],         output: 2 },
      { input: [1,2,3,4,6,7],   output: 5 },
      { input: [2,3],           output: 1 },
      { input: [1,2,3,5],       output: 4 },
      { input: [1,2,3,4,5,6,8,9], output: 7 }
    ]
  },

  /* ========================================================
     ชั้นที่ 2 — ปานกลาง
     ======================================================== */

  /* ---------- 17. เรียงคะแนนและหาอันดับ ---------- */
  p17: {
    id: 'p17',
    inputName: 'report',
    title: 'เรียงคะแนนและหาอันดับ',
    subtitle: 'Rank Scores',
    score: 25,
    difficulty: 'medium',
    desc: 'ผลการสอบของนักเรียนแต่ละคน ต้องการอันดับของนักเรียนคนที่ระบุชื่อ โดยอันดับ 1 คือคะแนนสูงสุด (ไม่จำเป็นต้องมีคนได้ 1 คะแนน) ถ้าคะแนนเท่ากันให้ใช้อันดับเดียวกัน แล้วอันดับถัดไปข้ามตามจำนวนคนที่ได้คะแนนเท่ากัน',
    inputDesc: '{ people: [{ name, score }, ...], name: ชื่อที่ต้องการหาอันดับ }',
    outputDesc: 'อันดับของ name (เริ่มที่ 1)',
    examples: [{ input: '{ "people": [{"name":"A","score":50},{"name":"B","score":60},{"name":"C","score":60},{"name":"D","score":70}], "name": "A" }', output: '4' }],
    testCases: [
      { input: { people: [{name:'A',score:50},{name:'B',score:60},{name:'C',score:60},{name:'D',score:70}], name: 'A' }, output: 4 },
      { input: { people: [{name:'A',score:10},{name:'B',score:20},{name:'C',score:30}], name: 'B' },                       output: 2 },
      { input: { people: [{name:'A',score:5},{name:'B',score:5},{name:'C',score:5}], name: 'C' },                         output: 1 },
      { input: { people: [{name:'A',score:1}], name: 'A' },                                                                 output: 1 },
      { input: { people: [{name:'A',score:90},{name:'B',score:80},{name:'C',score:70},{name:'D',score:95}], name: 'D' }, output: 1 },
      { input: { people: [{name:'A',score:70},{name:'B',score:60},{name:'C',score:50},{name:'D',score:40}], name: 'A' }, output: 1 }
    ]
  },

  /* ---------- 18. คำที่พบบ่อยที่สุด ---------- */
  p18: {
    id: 'p18',
    inputName: 'text',
    title: 'คำที่พบบ่อยที่สุด',
    subtitle: 'Most Frequent Word',
    score: 25,
    difficulty: 'medium',
    desc: 'นับความถี่ของแต่ละคำในข้อความ (คำคั่นด้วยช่องว่าง ไม่สนตัวพิมพ์เล็กใหญ่) แล้วหาคำที่พบมากที่สุด ถ้ามีหลายคำพบเท่ากันให้เลือกคำที่สั้นที่สุด และถ้ายาวเท่ากันด้วยให้เลือกคำที่ปรากฏมาก่อนในข้อความ',
    inputDesc: 'สตริงข้อความหลายคำ คั่นด้วยช่องว่าง',
    outputDesc: 'คำที่พบบ่อยที่สุด (เป็นตัวพิมพ์เล็กตามที่เขียนครั้งแรก)',
    examples: [{ input: '"a b a c b a"', output: '"a"' }],
    testCases: [
      { input: 'a b a c b a',       output: 'a' },
      { input: 'dog cat dog bird',  output: 'dog' },
      { input: 'x y',              output: 'x' },
      { input: 'apple pie',        output: 'pie' },
      { input: 'The the THE',      output: 'The' },
      { input: 'one two three',    output: 'one' }
    ]
  },

  /* ---------- 19. รวมเวลาทำงาน ---------- */
  p19: {
    id: 'p19',
    inputName: 'shifts',
    title: 'รวมเวลาทำงาน',
    subtitle: 'Total Work Shifts',
    score: 25,
    difficulty: 'medium',
    desc: 'พนักงานแต่ละคนทำงานกะเป็นช่วง [เวลาเริ่ม, เวลาสิ้นสุด] ในหน่วยชั่วโมง บริษัทจ่ายค่ากะให้เป็นจำนวนวัน โดยนับแยกทีละกะ กะหนึ่งทำครบ 8 ชั่วโมงได้ 1 วัน เศษที่เหลือของกะนั้นทิ้งไป ไม่สะสมข้ามกะ (เช่น สองกะคู่ละ 6 ชั่วโมง รวม 12 ชั่วโมง แต่ได้ 0 วัน ไม่ใช่ 1 วัน)',
    inputDesc: 'Array ของคู่ [เวลาเริ่ม, เวลาสิ้นสุด] แต่ละคู่คือ 1 กะ',
    outputDesc: 'จำนวนวันทำงานรวม (8 ชั่วโมงต่อ 1 วัน นับแยกทีละกะ)',
    examples: [{ input: '[[0,16]]', output: '2' }],
    testCases: [
      { input: [[0,8]],               output: 1 },
      { input: [[0,16]],              output: 2 },
      { input: [[0,24]],              output: 3 },
      { input: [[1,3],[4,6]],         output: 0 },
      { input: [[0,12],[0,4]],        output: 1 },
      { input: [[0,4],[0,4],[0,4],[0,4]], output: 0 }
    ]
  },

  /* ---------- 20. หาคู่ที่เป็นสองเท่า ---------- */
  p20: {
    id: 'p20',
    inputName: 'numbers',
    title: 'หาคู่ที่เป็นสองเท่า',
    subtitle: 'Double Pair',
    score: 25,
    difficulty: 'medium',
    desc: 'ในชุดตัวเลข ต้องหาค่า x ที่มากที่สุดที่มี 2x อยู่ในชุดนั้นด้วย (เช่น 2 และ 4 เป็นคู่กัน) ถ้าไม่มีคู่ให้ตอบ -1',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม',
    outputDesc: 'ค่า x ที่มากที่สุดที่มี 2x ในชุด หรือ -1 ถ้าไม่มี',
    examples: [{ input: '[1,2,4]', output: '2' }],
    testCases: [
      { input: [1,2,4],      output: 2 },
      { input: [3,6,12],     output: 6 },
      { input: [1,3],        output: -1 },
      { input: [5,10,20],    output: 10 },
      { input: [7],          output: -1 },
      { input: [2,4,8,16],   output: 8 }
    ]
  },

  /* ---------- 21. แปลงชื่อเป็นตัวพิมพ์ใหญ่ ---------- */
  p21: {
    id: 'p21',
    inputName: 'fullName',
    title: 'แปลงชื่อเป็นตัวพิมพ์ใหญ่',
    subtitle: 'Title Case',
    score: 25,
    difficulty: 'medium',
    desc: 'แปลงชื่อให้เป็นรูปแบบมาตรฐาน คือ ขึ้นต้นด้วยตัวพิมพ์ใหญ่ ตัวที่เหลือเป็นตัวพิมพ์เล็ก แยกแต่ละคำด้วยช่องว่าง',
    inputDesc: 'สตริงชื่อ-นามสกุล (อาจพิมพ์ตัวเล็กใหญ่ปนกัน)',
    outputDesc: 'สตริงชื่อที่แปลงแล้ว',
    examples: [{ input: '"jOHN sMITH"', output: '"John Smith"' }],
    testCases: [
      { input: 'jOHN sMITH',    output: 'John Smith' },
      { input: 'aLICE',         output: 'Alice' },
      { input: 'bob',           output: 'Bob' },
      { input: 'mary jane',     output: 'Mary Jane' },
      { input: 'x',             output: 'X' },
      { input: 'ALREADY FINE',  output: 'Already Fine' }
    ]
  },

  /* ---------- 22. นับคำที่ขึ้นต้นด้วยตัวอักษร ---------- */
  p22: {
    id: 'p22',
    inputName: 'query',
    title: 'นับคำที่ขึ้นต้นด้วยตัวอักษร',
    subtitle: 'Count Words Starting With',
    score: 25,
    difficulty: 'medium',
    desc: 'ระบบค้นหาต้องการนับว่ามีคำกี่คำในประโยคที่ขึ้นต้นด้วยตัวอักษรที่ระบุ (ไม่สนตัวพิมพ์เล็กใหญ่) คำถูกคั่นด้วยช่องว่าง',
    inputDesc: '{ sentence: ประโยค, letter: ตัวอักษรที่ต้องการ }',
    outputDesc: 'จำนวนคำที่ขึ้นต้นด้วย letter',
    examples: [{ input: '{ "sentence": "Apple apple banana", "letter": "a" }', output: '2' }],
    testCases: [
      { input: { sentence: 'Apple apple banana', letter: 'a' }, output: 2 },
      { input: { sentence: 'one two three',      letter: 't' }, output: 2 },
      { input: { sentence: 'hello',              letter: 'h' }, output: 1 },
      { input: { sentence: 'a b c',              letter: 'z' }, output: 0 },
      { input: { sentence: 'Cat cow cot',        letter: 'C' }, output: 3 }
    ]
  },

  /* ---------- 23. ตรวจรูปแบบอีเมล ---------- */
  p23: {
    id: 'p23',
    inputName: 'email',
    title: 'ตรวจรูปแบบอีเมล',
    subtitle: 'Email Validator',
    score: 25,
    difficulty: 'medium',
    desc: 'ตรวจรูปแบบอีเมลแบบง่าย โดยต้องผ่านทุกข้อ: (1) มีเครื่องหมาย @ พอดี 1 ตัว (2) ทั้งสตริงไม่มีช่องว่าง (3) ข้อความก่อน @ ไม่ว่าง และต้องไม่ลงท้ายด้วยจุด (4) ข้อความหลัง @ ต้องไม่ขึ้นต้นด้วยจุด ต้องมีจุดอย่างน้อย 1 จุด และข้อความหลังจุดสุดท้ายต้องไม่ว่าง',
    inputDesc: 'สตริงที่ต้องการตรวจ',
    outputDesc: '1 ถ้ารูปแบบถูกต้อง, 0 ถ้าไม่ถูกต้อง',
    examples: [{ input: '"a@b.co"', output: '1' }],
    testCases: [
      { input: 'a@b.co',        output: 1 },
      { input: 'a@b',           output: 0 },
      { input: '@b.co',         output: 0 },
      { input: 'a b@c.co',      output: 0 },
      { input: 'a@.co',         output: 0 },
      { input: 'john@school.th', output: 1 },
      { input: 'a@@b.co',       output: 0 },
      { input: 'a.@b.co',       output: 0 }
    ]
  },

  /* ---------- 24. นับระยะเดินกลับ ---------- */
  p24: {
    id: 'p24',
    inputName: 'moves',
    title: 'นับระยะเดินกลับ',
    subtitle: 'Count Backtracks',
    score: 25,
    difficulty: 'medium',
    desc: 'ตัวอักษรแต่ละตัวคือการเดิน 1 ก้าว (U ขึ้น, D ลง, L ซ้าย, R ขวา) เมื่อเดินแล้วกลับมาที่จุดเดิมทันทีเรียกว่า "เดินกลับทาง" ซึ่งเกิดได้เฉพาะคู่ที่ตรงข้ามกันคือ UD, DU, LR, RL (ส่วน UR หรือ DL เป็นการเดินตั้งฉาก ไม่นับ) ให้นับจำนวนคู่ที่ติดกันในสตริง โดย "UDUD" นับได้ 3 ครั้ง เพราะ UD, DU, UD',
    inputDesc: 'สตริงตัวอักษร U D L R',
    outputDesc: 'จำนวนคู่ตัวอักษรที่เป็นการเดินกลับทาง',
    examples: [{ input: '"UDUD"', output: '3' }],
    testCases: [
      { input: 'UDUD',    output: 3 },
      { input: 'UU',      output: 0 },
      { input: 'URDL',    output: 0 },
      { input: 'UDLR',    output: 2 },
      { input: 'LLUU',    output: 0 },
      { input: 'LURD',    output: 0 },
      { input: 'LRLR',    output: 3 },
      { input: 'UDUDUD',  output: 5 }
    ]
  },

  /* ---------- 25. ลบตัวเลขซ้ำ ---------- */
  p25: {
    id: 'p25',
    inputName: 'numbers',
    title: 'ลบตัวเลขซ้ำ',
    subtitle: 'Remove Duplicates',
    score: 25,
    difficulty: 'medium',
    desc: 'ทำให้ Array ไม่มีค่าซ้ำ โดยเก็บค่าแต่ละตัวไว้ครั้งเดียว แล้วเรียงผลลัพธ์จากน้อยไปมาก',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม',
    outputDesc: 'Array ของค่าที่ไม่ซ้ำ เรียงจากน้อยไปมาก',
    examples: [{ input: '[1,2,2,3,1]', output: '[1,2,3]' }],
    testCases: [
      { input: [1,2,2,3,1],  output: [1,2,3] },
      { input: [5,5,5],      output: [5] },
      { input: [3,1,2],      output: [1,2,3] },
      { input: [1,2,3],      output: [1,2,3] },
      { input: [4,2,4,2],    output: [2,4] },
      { input: [2,1,2,1,1],  output: [1,2] }
    ]
  },

  /* ---------- 26. หาคู่ตัวเลขที่รวมเป็น k ---------- */
  p26: {
    id: 'p26',
    inputName: 'query',
    title: 'หาคู่ตัวเลขที่รวมเป็น k',
    subtitle: 'Two Sum',
    score: 25,
    difficulty: 'medium',
    desc: 'ใน Array ตัวเลข ต้องหาค่าที่เล็กที่สุดที่มีอีกค่าหนึ่งใน Array ที่เอามาบวกกันได้เท่ากับ k ถ้าไม่มีให้ตอบ -1',
    inputDesc: '{ numbers: [ตัวเลข...], k: ค่าที่ต้องการรวมได้ }',
    outputDesc: 'ค่าที่เล็กที่สุดในคู่ที่รวมเป็น k หรือ -1',
    examples: [{ input: '{ "numbers": [2,7,11,15], "k": 9 }', output: '2' }],
    testCases: [
      { input: { numbers: [2,7,11,15], k: 9  }, output: 2 },
      { input: { numbers: [3,1,4],     k: 5  }, output: 1 },
      { input: { numbers: [1,2],        k: 10 }, output: -1 },
      { input: { numbers: [5,5,5],      k: 10 }, output: 5 },
      { input: { numbers: [10,2,6],     k: 8  }, output: 2 },
      { input: { numbers: [1,4,2,3],    k: 6  }, output: 2 }
    ]
  },

  /* ========================================================
     ชั้นที่ 3 — ยาก
     ======================================================== */

  /* ---------- 27. บวกเลขยาวมาก ---------- */
  p27: {
    id: 'p27',
    inputName: 'numbers',
    title: 'บวกเลขยาวมาก',
    subtitle: 'Big Number Sum',
    score: 30,
    difficulty: 'hard',
    desc: 'ตัวเลขที่มีค่าสูงมาก ๆ อาจยาวหลายหลักจนเกินขอบเขตของ Number จึงถูกส่งมาเป็นสตริง ให้นำสองสตริงนี้มาบวกกันแล้วคืนผลลัพธ์เป็นสตริง (ตัวเลขทั้งสองเป็นจำนวนเต็มไม่ติดลบ) ต้องทำการบวกทีละหลักจากขวามาซ้ายพร้อมทำ carry เหมือนการบวกด้วยมือ',
    inputDesc: '[ตัวเลขสตริงที่ 1, ตัวเลขสตริงที่ 2]',
    outputDesc: 'ผลบวกเป็นสตริง',
    examples: [{ input: '["12","5"]', output: '"17"' }],
    testCases: [
      { input: ['12','5'],            output: '17' },
      { input: ['999','1'],           output: '1000' },
      { input: ['0','0'],             output: '0' },
      { input: ['123456789','987654321'], output: '1111111110' },
      { input: ['5','12345'],         output: '12350' },
      { input: ['0','999'],           output: '999' }
    ]
  },

  /* ---------- 28. ตรวจวงเล็บสมดุล ---------- */
  p28: {
    id: 'p28',
    inputName: 'brackets',
    title: 'ตรวจวงเล็บสมดุล',
    subtitle: 'Balanced Brackets',
    score: 30,
    difficulty: 'hard',
    desc: 'สตริงประกอบด้วยวงเล็บเหลี่ยม (), วงเล็บปีกกา {} และวงเล็บกลม [] จะสมดุลก็ต่อเมื่อ (1) เหลือวงเล็บเปิดค้างไว้ 0 ตัว และ (2) ไม่มีวงเล็บปิดที่ปิดผิดชนิด เช่น "(]" ไม่สมดุล ให้คืน 1 ถ้าสมดุล 0 ถ้าไม่สมดุล',
    inputDesc: 'สตริงวงเล็บ (อาจเป็นสตริงว่าง)',
    outputDesc: '1 ถ้าสมดุล, 0 ถ้าไม่สมดุล',
    examples: [{ input: '"([{}])"', output: '1' }],
    testCases: [
      { input: '()',        output: 1 },
      { input: '([{}])',    output: 1 },
      { input: '(]',        output: 0 },
      { input: '(((',       output: 0 },
      { input: '',          output: 1 },
      { input: '){',        output: 0 },
      { input: '{[()]}',    output: 1 },
      { input: '([)]',      output: 0 }
    ]
  },

  /* ---------- 29. ห.ร.ม. ของทั้งชุด ---------- */
  p29: {
    id: 'p29',
    inputName: 'numbers',
    title: 'ห.ร.ม. ของทั้งชุด',
    subtitle: 'LCM of All',
    score: 30,
    difficulty: 'hard',
    desc: 'หาตัวคูณร่วมน้อยที่สุด (ห.ร.ม.) ของตัวเลขทั้งหมดใน Array โดยทฤษฎีบทว่า ห.ร.ม.(a,b) = a หาร ห.ร.ม.ของ a และ b คูณ b หาร ห.ร.ม.(a,b) และ ห.ร.ม. ของ a กับ b = (a คูณ b) หาร ห.ร.ม.(a,b) โดย ห.ร.ม. ของเลขใดกับ 0 คือ 0',
    inputDesc: 'Array ของตัวเลขจำนวนเต็มบวก',
    outputDesc: 'ห.ร.ม. ของทุกตัว',
    examples: [{ input: '[2,3]', output: '6' }],
    testCases: [
      { input: [2,3],      output: 6 },
      { input: [4,6],      output: 12 },
      { input: [5],        output: 5 },
      { input: [1,1,1],    output: 1 },
      { input: [2,4,8],    output: 8 },
      { input: [3,5,7],    output: 105 }
    ]
  },

  /* ---------- 30. นับเส้นทางเดินบนกริด ---------- */
  p30: {
    id: 'p30',
    inputName: 'grid',
    title: 'นับเส้นทางเดินบนกริด',
    subtitle: 'Count Grid Paths',
    score: 30,
    difficulty: 'hard',
    desc: 'เดินบนกริดขนาด n x n เริ่มที่มุมบนซ้าย (0,0) ไปจบที่มุมขวาล่าง (n-1,n-1) ขยับได้ 2 ทิศทางเท่านั้น คือ ขวา (x+1) และ ลง (y+1) ห้ามเหยียบช่องที่ถูกบล็อก ต้องนับจำนวนเส้นทางที่แตกต่างกันทั้งหมด ลองคิดแบบเดินทีละก้าวดูว่าจะได้กี่ทาง แล้วค่อยหาวิธีที่เร็วขึ้น',
    inputDesc: '{ n: ขนาดกริด, blocked: [[x,y], ...] } (พิกัด 0-based)',
    outputDesc: 'จำนวนเส้นทางทั้งหมด',
    examples: [{ input: '{ "n": 3, "blocked": [[1,1]] }', output: '2' }],
    testCases: [
      { input: { n: 2, blocked: [] },             output: 2 },
      { input: { n: 3, blocked: [[1,1]] },        output: 2 },
      { input: { n: 1, blocked: [] },             output: 1 },
      { input: { n: 2, blocked: [[0,1]] },        output: 1 },
      { input: { n: 3, blocked: [] },             output: 6 },
      { input: { n: 2, blocked: [[0,1],[1,0]] },  output: 0 },
      { input: { n: 4, blocked: [] },             output: 20 }
    ]
  },

  /* ---------- 31. จำนวนวิธีแบ่งเป็นกลุ่ม ---------- */
  p31: {
    id: 'p31',
    inputName: 'total',
    title: 'จำนวนวิธีแบ่งเป็นกลุ่ม',
    subtitle: 'Count Partitions',
    score: 30,
    difficulty: 'hard',
    desc: 'หาจำนวนวิธีที่จะแบ่งจำนวน n เป็นกลุ่มของจำนวนเต็มบวก โดยไม่สนลำดับของกลุ่ม เช่น 5 มี 7 วิธี ได้แก่ 5 / 4+1 / 3+2 / 3+1+1 / 2+2+1 / 2+1+1+1 / 1+1+1+1+1 ให้ถือว่า n = 0 มี 1 วิธี (ไม่แบ่งเลย)',
    inputDesc: '{ total: จำนวนเต็ม n }',
    outputDesc: 'จำนวนวิธีแบ่งทั้งหมด',
    examples: [{ input: '{ "total": 5 }', output: '7' }],
    testCases: [
      { input: { total: 5 }, output: 7 },
      { input: { total: 4 }, output: 5 },
      { input: { total: 3 }, output: 3 },
      { input: { total: 1 }, output: 1 },
      { input: { total: 0 }, output: 1 },
      { input: { total: 7 }, output: 15 }
    ]
  },

  /* ---------- 32. คำยาวที่สุดที่ผ่านเงื่อนไข ---------- */
  p32: {
    id: 'p32',
    inputName: 'query',
    title: 'คำยาวที่สุดที่ผ่านเงื่อนไข',
    subtitle: 'Longest Matching Word',
    score: 30,
    difficulty: 'hard',
    desc: 'เลือกคำที่ยาวที่สุดในประโยคที่ขึ้นต้นด้วยตัวอักษรที่ระบุ (ไม่สนตัวพิมพ์เล็กใหญ่) ถ้ามีหลายคำยาวเท่ากันให้เลือกคำที่ปรากฏมาก่อน ถ้าไม่มีคำไหนตรงเงื่อนไขเลยให้ตอบ "none" (คำถูกคั่นด้วยช่องว่าง คืนคำตามที่เขียนในประโยค ไม่ต้องเปลี่ยนตัวพิมพ์)',
    inputDesc: '{ sentence: ประโยค, letter: ตัวอักษรที่ต้องการ }',
    outputDesc: 'คำที่ยาวที่สุดที่ขึ้นต้นด้วย letter หรือ "none"',
    examples: [{ input: '{ "sentence": "apple avocado banana", "letter": "a" }', output: '"avocado"' }],
    testCases: [
      { input: { sentence: 'apple avocado banana', letter: 'a' }, output: 'avocado' },
      { input: { sentence: 'hello world',          letter: 'z' }, output: 'none' },
      { input: { sentence: 'cat car cart',          letter: 'c' }, output: 'cart' },
      { input: { sentence: 'one two',              letter: 'O' }, output: 'one' },
      { input: { sentence: 'bbb a bb',             letter: 'b' }, output: 'bbb' },
      { input: { sentence: 'Ant bat apple',        letter: 'A' }, output: 'apple' }
    ]
  },

  /* ---------- 33. ปริมาณน้ำที่ขังอยู่ระหว่างเสา ---------- */
  p33: {
    id: 'p33',
    inputName: 'skyline',
    title: 'ปริมาณน้ำที่ขังอยู่ระหว่างเสา',
    subtitle: 'Trapping Rain Water',
    score: 30,
    difficulty: 'hard',
    desc: 'มีเสาสูง h[i] วางเรียงกันจากซ้ายไปขวา เมื่อฝนตก น้ำจะขังอยู่ในหลุมที่เกิดจากเสาที่สูงกว่าข้างเคียง ในช่องที่ i น้ำจะขังได้เท่าไร คือ ความสูงที่ต่ำที่สุดของ (เสาสูงสุดทางซ้าย, เสาสูงสุดทางขวา) เอาลบด้วยความสูงของเสาตรงช่องนั้น ต้องรวมน้ำทุกช่อง ถ้าช่องไหนไม่มีหลุมก็นับเป็น 0',
    inputDesc: '{ heights: [ความสูงของเสาแต่ละต้น...], minPillars: จำนวนเสาขั้นต่ำ (ใช้ตรวจว่าข้อมูลถูกต้อง) }',
    outputDesc: 'ปริมาณน้ำขังรวมทั้งหมด',
    examples: [{ input: '{ "heights": [1,8,6,2,5,4,8,3,7], "minPillars": 2 }', output: '19' }],
    testCases: [
      { input: { heights: [1,8,6,2,5,4,8,3,7], minPillars: 2 }, output: 19 },
      { input: { heights: [0,1,0,2,1,0,1,3,2,1,2,1], minPillars: 2 }, output: 6 },
      { input: { heights: [4,2,0,3,2,5], minPillars: 2 }, output: 9 },
      { input: { heights: [1,2,3], minPillars: 2 }, output: 0 },
      { input: { heights: [3,2,1], minPillars: 2 }, output: 0 },
      { input: { heights: [5], minPillars: 1 }, output: 0 },
      { input: { heights: [2,0,2], minPillars: 2 }, output: 2 },
      { input: { heights: [6,4,2,0], minPillars: 2 }, output: 0 }
    ]
  },

  /* ---------- 34. ก้อนติดกันที่รวมได้ไม่เกินเงิน ---------- */
  p34: {
    id: 'p34',
    inputName: 'purchase',
    title: 'ก้อนติดกันที่รวมได้ไม่เกินเงิน',
    subtitle: 'Max Subarray Sum',
    score: 30,
    difficulty: 'hard',
    desc: 'มีตัวเลขเรียงกันเป็นแถว แต่ละตัวคือราคาของสินค้าหนึ่งชิ้นที่ต้องซื้อ "ติดกัน" คือซื้อเป็นกลุ่มต่อเนื่องกันเท่านั้น ข้ามสินค้าไม่ได้ ให้หากลุ่มติดกันที่ราคารวมมากที่สุดโดยที่ยังไม่เกินเงินที่มี ถ้าไม่มีกลุ่มใดที่รวมได้ไม่เกินเงินเลย ให้ตอบ 0 (คือไม่ซื้ออะไรเลย)',
    inputDesc: '{ prices: [ราคาของสินค้าตามลำดับ...], budget: เงินที่มี }',
    outputDesc: 'ราคารวมของกลุ่มที่ซื้อได้มากที่สุด (ไม่เกิน budget)',
    examples: [{ input: '{ "prices": [2,4,3,5,1], "budget": 10 }', output: '9' }],
    testCases: [
      { input: { prices: [2,4,3,5,1], budget: 10 }, output: 9 },
      { input: { prices: [2,4,3,5,1], budget: 14 }, output: 14 },
      { input: { prices: [2,4,3,5,1], budget: 15 }, output: 15 },
      { input: { prices: [1,2,3],     budget: 0  }, output: 0 },
      { input: { prices: [5,1,1],     budget: 100 }, output: 7 },
      { input: { prices: [3,3,3],     budget: 8  }, output: 6 },
      { input: { prices: [4,2],        budget: 3  }, output: 2 },
      { input: { prices: [3,4],        budget: 5  }, output: 4 },
      { input: { prices: [7],          budget: 6  }, output: 0 }
    ]
  },

  /* ---------- 35. แตกสายแล้วกลับด้านครึ่งหลัง ---------- */
  p35: {
    id: 'p35',
    inputName: 'order',
    title: 'แตกสายแล้วกลับด้านครึ่งหลัง',
    subtitle: 'Reverse The Second Half',
    score: 30,
    difficulty: 'hard',
    desc: 'สร้างรายการโยง (linked list) ยาว n ที่เก็บค่า 1, 2, ..., n เรียงกัน จากนั้น (1) แตกรายการเป็นสองสาย โดยสายแรกเก็บครึ่งแรกที่มีจำนวนมากกว่า (เช่น n = 5 แบ่งเป็น 1,2,3 กับ 4,5) ส่วนสายหลังเก็บที่เหลือ (2) กลับด้านสายหลังให้ตัวชี้เดินจากท้ายมาหัว (3) ต่อสายหลังที่กลับด้านแล้วต่อท้ายสายแรก สุดท้ายให้พิมพ์ค่าในรายการใหม่เรียงติดกันเป็นข้อความ (ตัวอย่าง n = 5 ได้ 12354 เพราะสายหลัง 4,5 ถูกกลับเป็น 5,4 แล้วต่อท้าย 1,2,3) แต่ละช่องเก็บค่าเดียวและเชื่อมด้วย next',
    inputDesc: '{ n: จำนวนช่องทั้งหมด }',
    outputDesc: 'ค่าในรายการใหม่เรียงติดกัน (เช่น "12354")',
    examples: [{ input: '{ "n": 5 }', output: '"12354"' }],
    testCases: [
      { input: { n: 1 }, output: '1' },
      { input: { n: 2 }, output: '12' },
      { input: { n: 3 }, output: '123' },
      { input: { n: 4 }, output: '1243' },
      { input: { n: 5 }, output: '12354' },
      { input: { n: 6 }, output: '123654' },
      { input: { n: 7 }, output: '1234765' },
      { input: { n: 8 }, output: '12348765' }
    ]
  }
};
