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
  }
};
