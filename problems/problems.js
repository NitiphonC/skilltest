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
    desc: 'นักวิทยาศาสตร์บันทึกรหัสนกที่พบในแต่ละรอบสำรวจ แต่ละตัวในอาเรย์คือรหัสของนกตัวหนึ่ง'
      + 'ต้องการรหัสที่ "พบมากที่สุด" ในรอบนั้น'
      + 'ถ้ามีหลายรหัสพบเท่ากัน ให้เลือก "รหัสที่เล็กที่สุด"'
      + 'พิมพ์รหัสนั้นออกมาหนึ่งค่า',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม เช่น [1,1,2,2,2,3]',
    outputDesc: 'ตัวเลขรหัสนกที่ตรงตามเงื่อนไข (หนึ่งค่า)',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ทุกรหัสโผล่เท่ากัน และรหัสที่มาก่อนในอาเรย์ไม่ใช่ตัวที่น้อยที่สุด เพราะต้องเลือก "รหัสที่เล็กที่สุด" ไม่ใช่ตัวที่เจอก่อน · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[1,1,2,2,2,3]", output: "2" }, { input: "[2,2,1,1]", output: "1" }],
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
    desc: 'มีงบประมาณ b บาท ต้องซื้อคีย์บอร์ด 1 ตัว และไดรฟ์ USB 1 ตัว'
      + 'ต้องหา "ราคารวมที่มากที่สุด" ที่ยังไม่เกินงบ'
      + 'ถ้าไม่มีคู่ไหนเลยที่รวมได้ไม่เกินงบ ให้ตอบ -1',
    inputDesc: '{ b: งบประมาณ, k: [ราคาคีย์บอร์ด...], u: [ราคา USB...] }',
    outputDesc: 'ราคารวมที่มากที่สุดที่จ่ายได้ หรือ -1',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีคู่ใดที่พอเงิน ต้องตอบ -1 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"b\":10,\"k\":[3,1],\"u\":[5,2,8]}", output: "9" }, { input: "{\"b\":5,\"k\":[7,8],\"u\":[9,10]}", output: "-1" }],
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
    desc: 'นับจำนวน "กำลังสองสมบูรณ์" ที่อยู่ในช่วงตั้งแต่ A ถึง B'
      + 'ช่วงนี้รวมทั้ง A และ B เข้าไปด้วย'
      + 'กำลังสองสมบูรณ์คือตัวเลขที่เกิดจากจำนวนเต็มคูณตัวเองพอดี เช่น 1, 4, 9, 16, 25'
      + 'พิมพ์จำนวนที่นับได้ออกมา',
    inputDesc: '{ A: เลขเริ่มต้น, B: เลขสุดท้าย }',
    outputDesc: 'จำนวนเลขกำลังสองสมบูรณ์ในช่วงนั้น',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีกำลังสองสมบูรณ์ในช่วงเลย ต้องได้ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"A\":3,\"B\":9}", output: "2" }, { input: "{\"A\":20,\"B\":24}", output: "0" }],
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
    desc: 'หาตัวเลขที่น้อยที่สุดที่ผ่านทั้ง 2 เงื่อนไขพร้อมกัน'
      + '(1) ตัวเลขนั้นหารด้วยทุกตัวใน A ลงตัวพอดี'
      + '(2) ตัวเลขนั้นถูกหารด้วยทุกตัวใน B ลงตัวพอดี'
      + 'ถ้าไม่มีตัวเลขใดผ่านทั้งสองเงื่อนไข ให้ตอบ -1',
    inputDesc: '{ A: [ตัวเลข...], B: [ตัวเลข...] }',
    outputDesc: 'ตัวเลขที่น้อยที่สุดที่เป็นไปได้ หรือ -1',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีตัวเลขที่ผ่านทั้งสองเงื่อนไข ต้องตอบ -1 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"A\":[2,6],\"B\":[24,36]}", output: "6" }, { input: "{\"A\":[2,3],\"B\":[5,7]}", output: "-1" }],
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
    desc: 'ถนนแบ่งเป็นช่วง ๆ ช่วงละ 1 หน่วย แต่ละช่วงมีค่าความกว้าง 1 ถึง 3'
      + '1 = จักรยาน, 2 = รถยนต์, 3 = รถบรรทุก'
      + 'คำถามแต่ละข้อคือช่วง [i, j] โดยนับดัชนีจาก 0 และรวมทั้งปลายสองด้าน'
      + 'ต้องหาความกว้างที่ "แคบที่สุด" ในช่วงนั้น'
      + 'พิมพ์คำตอบเรียงตามลำดับคำถาม เป็น Array',
    inputDesc: '{ width: [ความกว้างแต่ละช่วง], cases: [[i,j], ...] }',
    outputDesc: 'Array ของความกว้างที่แคบที่สุด เรียงตาม cases',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ถามทั้งถนนทีเดียว · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"width\":[2,3,1,2,3,2,3,3],\"cases\":[[0,3],[4,6],[6,7]]}", output: "[1,2,3]" }, { input: "{\"width\":[1,2,3,2,1,2,3,2,1,2,3,1,2,3,1,2],\"cases\":[[0,15]]}", output: "[1]" }],
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
    desc: 'p เป็นอาร์เรย์ที่เก็บค่าตามดัชนี 1 ถึง n (ค่าแรกในอาเรย์คือ p(1))'
      + 'สำหรับแต่ละ x ตั้งแต่ 1 ถึง n ให้หา y ที่ p(p(y)) = x'
      + 'คำตอบคือ y ของแต่ละ x เรียงตาม x = 1, 2, ..., n เป็น Array',
    inputDesc: '{ p: [ค่าของ p ตาม index 1..n] }',
    outputDesc: 'Array ของ y เรียงตาม x = 1 ถึง n',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: n = 2 ซึ่งเป็นการสลับค่าเดียว · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"p\":[5,2,1,3,4]}", output: "[4,2,5,1,3]" }, { input: "{\"p\":[2,1]}", output: "[1,2]" }],
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
    desc: 'หาวันที่ลำดับที่ 256 ของปีที่ให้มา (256 = 2 ยกกำลัง 8)'
      + 'ปี 1700 ถึง 1917 ใช้ปฏิทินจูเลียน: ปีอธิกสุรคือปีที่หาร 4 ลงตัว'
      + 'ปี 1918 เป็นข้อยกเว้น ตอบ 26.09.1918 เสมอ ไม่ต้องคำนวณ'
      + 'ปี 1919 ถึง 2700 ใช้ปฏิทินเกรกอเรียน: ปีอธิกสุรคือปีที่หาร 400 ลงตัว หรือ (หาร 4 ลงตัว และหาร 100 ไม่ลงตัว)'
      + 'พิมพ์วันที่เป็นสตริงรูปแบบ dd.mm.yyyy โดยวันและเดือนเติม 0 ข้างหน้า',
    inputDesc: '{ year: ปี ค.ศ. (1700-2700) }',
    outputDesc: 'สตริงวันที่ dd.mm.yyyy',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ปี 1900 ไม่ใช่ปีอธิกสุร (หาร 4 ลง แต่หาร 100 ลง) ก่อนสมัยปฏิทินจูเลียน · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"year\":2016}", output: "12.09.2016" }, { input: "{\"year\":1900}", output: "12.09.1900" }],
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
    desc: 'ช็อกโกแลตแต่ละช่องมีตัวเลข ต้องตัดออกเป็นช่วงติดกัน (subarray)'
      + 'ช่วงที่ถูกต้องต้องมี "ความยาวเท่ากับ m" และ "ผลรวมเท่ากับ d" พร้อมกัน'
      + 'นับจำนวนช่วงที่ถูกต้องทั้งหมด (ช่วงที่ติดกันถือเป็นคนละช่วงกัน)'
      + 'ถ้าไม่มีช่วงไหนเลยที่ถูกต้อง ให้ตอบ 0',
    inputDesc: '{ s: [ตัวเลขแต่ละช่อง], d: วันเกิด, m: เดือนเกิด }',
    outputDesc: 'จำนวนวิธีที่ตัดได้ทั้งหมด',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีช่วงไหนผ่านเลย ต้องได้ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"s\":[2,2,1,3,2],\"d\":4,\"m\":2}", output: "2" }, { input: "{\"s\":[1,5,1,5,1],\"d\":3,\"m\":1}", output: "0" }],
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
    desc: 'นักสถิติต้องการผลรวมของตัวเลขทั้งหมดในอาเรย์'
      + 'เลขติดลบก็ต้องนับเข้าไปด้วย'
      + 'พิมพ์ผลรวมออกมาหนึ่งค่า',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม (อาจมีทั้งบวกและลบ)',
    outputDesc: 'ผลรวมของทุกตัวใน Array',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ผลรวมเป็นศูนย์ ต้องได้ 0 ไม่ใช่ค่าว่าง · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[1,2,3]", output: "6" }, { input: "[0,0,0]", output: "0" }],
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
    desc: 'ต้องการนับว่ามีเครื่องจักรกี่เครื่องที่ "หมายเลขเป็นเลขคู่"'
      + 'เลขคู่คือเลขที่หาร 2 ลงตัวพอดี โดยนับ 0 ด้วย'
      + 'พิมพ์จำนวนที่นับได้ออกมา',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม',
    outputDesc: 'จำนวนเลขที่หาร 2 ลงตัวใน Array',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: 0 เป็นเลขคู่ ต้องนับ และเลขติดลบก็มีคู่เหมือนกัน · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[1,2,3,4]", output: "2" }, { input: "[0,-4,3,-1]", output: "2" }],
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
    desc: 'ต้องการหาราคาที่ "ต่ำที่สุด" ของสินค้าในสต็อก เพื่อจัดราคาขายต่อ'
      + 'ราคาอาจติดลบได้ และมีสินค้าอย่างน้อย 1 ชิ้น'
      + 'พิมพ์ราคาที่ต่ำที่สุดออกมา',
    inputDesc: 'Array ของตัวเลขราคา',
    outputDesc: 'ราคาที่ต่ำที่สุดใน Array',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ราคาติดลบทั้งหมด ค่าต่ำสุดต้องติดลบ · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[3,7,2,9]", output: "2" }, { input: "[-3,-8,-5]", output: "-8" }],
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
    desc: 'เครื่องมือนับคำในข้อความ โดยคำถูกคั่นด้วยช่องว่าง'
      + 'ประโยคอาจมีช่องว่างเกินหลายช่องติดกัน และอาจมีช่องว่างหัวท้ายประโยค'
      + 'ช่องว่างเหล่านี้ไม่ถือเป็นคำ'
      + 'พิมพ์จำนวนคำออกมา',
    inputDesc: 'สตริงประโยค (อาจมีช่องว่างเกินหรือช่องว่างหัวท้าย)',
    outputDesc: 'จำนวนคำในประโยค',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ประโยคที่มีแต่ช่องว่าง ต้องได้ 0 คำ · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"hello world\"", output: "2" }, { input: "\"     \"", output: "0" }],
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
    desc: 'แบบฟอร์มต้องการ "อักษรย่อชื่อ" โดยเอาตัวอักษรแรกของทุกคำ'
      + 'แปลงให้เป็นตัวพิมพ์ใหญ่ทั้งหมด แล้วต่อกันโดยไม่มีช่องว่าง'
      + 'เก็บลำดับคำตามเดิม เช่น "john smith" ได้ "JS"',
    inputDesc: 'สตริงชื่อ-นามสกุล คั่นด้วยช่องว่าง',
    outputDesc: 'สตริงอักษรย่อ เช่น "JS"',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ชื่อมีคำเดียว · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"john smith\"", output: "\"JS\"" }, { input: "\"madonna\"", output: "M" }],
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
    desc: 'แปลงจำนวนวินาที เป็นเวลาแบบ h:mm:ss'
      + 'ชั่วโมง "ไม่ต้อง" เติม 0 ข้างหน้า'
      + 'นาทีและวินาที "ต้อง" เติม 0 ข้างหน้าให้ครบ 2 หลักเสมอ'
      + 'พิมพ์เป็นสตริง เช่น 3661 ให้ "1:01:01"',
    inputDesc: 'จำนวนวินาทีเป็นจำนวนเต็มตั้งแต่ 0 ถึง 86399',
    outputDesc: 'สตริงเวลารูปแบบ h:mm:ss',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: วินาทีที่ต้องเติม 0 ข้างหน้าให้เห็นชัด เช่น 5 วินาที · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "3661", output: "\"1:01:01\"" }, { input: "65", output: "0:01:05" }],
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
    desc: 'ตรวจว่าคำนี้เป็นพาลินโดรมหรือไม่ โดยอ่านจากซ้ายไปขวาต้องเหมือนอ่านจากขวาไปซ้าย'
      + 'ไม่สนใจตัวพิมพ์เล็กใหญ่ (a กับ A ถือเป็นตัวเดียวกัน)'
      + 'พิมพ์ 1 ถ้าเป็นพาลินโดรม หรือ 0 ถ้าไม่ใช่',
    inputDesc: 'สตริงคำที่ต้องการตรวจ',
    outputDesc: '1 ถ้าเป็นพาลินโดรม, 0 ถ้าไม่ใช่',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: คำที่ไม่ใช่พาลินโดรม ต้องได้ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"level\"", output: "1" }, { input: "\"chat\"", output: "0" }],
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
    desc: 'เลขเรียง 1, 2, 3, ... ไปเรื่อย ๆ แต่มีตัวเลขหายไป 1 ตัว'
      + 'ที่เหลืออยู่ในอาเรย์เรียงจากน้อยไปมาก'
      + 'พิมพ์ตัวเลขที่หายไป',
    inputDesc: 'Array ของตัวเลขที่เรียงจากน้อยไปมาก ขาดไป 1 ตัว',
    outputDesc: 'ตัวเลขที่หายไป',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: หายไปเลข 1 เพราะขาดตัวแรก · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[1,2,4,5]", output: "3" }, { input: "[2,3,4,5]", output: "1" }],
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
    desc: 'ต้องการอันดับของนักเรียนคนที่ระบุชื่อ โดยอันดับ 1 คือคะแนนสูงสุด'
      + 'เงื่อนไขสำคัญ 2 ข้อ:'
      + '(1) อันดับขึ้นอยู่กับ "จำนวนคนที่ได้คะแนนมากกว่า" ไม่ใช่ตำแหน่งในรายการ'
      + '(2) คนที่ได้คะแนนเท่ากันใช้อันดับเดียวกัน แล้วอันดับถัดไปต้องข้ามเท่าจำนวนคนที่เท่ากัน'
      + 'พิมพ์อันดับของชื่อที่ถาม',
    inputDesc: '{ people: [{ name, score }, ...], name: ชื่อที่ต้องการหาอันดับ }',
    outputDesc: 'อันดับของ name (เริ่มที่ 1)',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ทุกคนได้คะแนนเท่ากัน ทุกคนได้อันดับ 1 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"people\":[{\"name\":\"A\",\"score\":50},{\"name\":\"B\",\"score\":60},{\"name\":\"C\",\"score\":60},{\"name\":\"D\",\"score\":70}],\"name\":\"A\"}", output: "4" }, { input: "{\"people\":[{\"name\":\"A\",\"score\":50},{\"name\":\"B\",\"score\":50},{\"name\":\"C\",\"score\":50}],\"name\":\"C\"}", output: "1" }],
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
    desc: 'นับความถี่ของแต่ละคำในข้อความ โดยคำคั่นด้วยช่องว่าง และไม่สนตัวพิมพ์เล็กใหญ่'
      + 'ต้องการคำที่พบมากที่สุด โดยเรียงลำดับความสำคัญได้ดังนี้:'
      + '(1) พบบ่อยที่สุด'
      + '(2) ถ้าพบเท่ากัน ให้เลือกคำที่สั้นที่สุด'
      + '(3) ถ้ายาวเท่ากันด้วย ให้เลืองคำที่ปรากฏมาก่อนในข้อความ'
      + 'พิมพ์คำนั้นตามตัวพิมพ์ที่เขียนครั้งแรก',
    inputDesc: 'สตริงข้อความหลายคำ คั่นด้วยช่องว่าง',
    outputDesc: 'คำที่พบบ่อยที่สุด (เป็นตัวพิมพ์เล็กตามที่เขียนครั้งแรก)',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ทุกคำโผล่ครั้งเดียว ให้เลือกคำที่สั้นที่สุด · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"a b a c b a\"", output: "\"a\"" }, { input: "\"aa b ccc\"", output: "b" }],
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
    desc: 'พนักงานแต่ละคนทำงานเป็นกะ กะหนึ่งคือช่วง [เวลาเริ่ม, เวลาสิ้นสุด] ในหน่วยชั่วโมง'
      + 'บริษัทจ่ายค่ากะเป็น "จำนวนวัน" โดยกะหนึ่งทำครบ 8 ชั่วโมงได้ 1 วัน'
      + 'เงื่อนไขสำคัญ: เศษชั่วโมงของแต่ละกะ "ทิ้งทิ้ง ไม่สะสมข้ามกะ"'
      + 'เช่น สองกะคู่ละ 6 ชั่วโมง รวม 12 ชั่วโมง แต่ได้เพียง 0 วัน ไม่ใช่ 1 วัน'
      + 'พิมพ์จำนวนวันรวมทั้งหมด',
    inputDesc: 'Array ของคู่ [เวลาเริ่ม, เวลาสิ้นสุด] แต่ละคู่คือ 1 กะ',
    outputDesc: 'จำนวนวันทำงานรวม (8 ชั่วโมงต่อ 1 วัน นับแยกทีละกะ)',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: รวมเป็น 12 ชั่วโมง แต่ต้องได้ 0 วัน เพราะนับแยกกะและกะละไม่ครบ 8 ชั่วโมง · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[[0,16]]", output: "2" }, { input: "[[0,6],[0,6]]", output: "0" }],
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
    desc: 'ในชุดตัวเลขที่ให้มา ต้องหาค่า x ที่ "มากที่สุด" ซึ่งมี 2x อยู่ในชุดเดียวกันด้วย'
      + 'เช่น 2 และ 4 ถือเป็นคู่กัน เพราะ 2 × 2 = 4'
      + 'ค่าที่ต้องการคือ "x" ตัวเล็ก ไม่ใช่ 2x'
      + 'ถ้าไม่มีคู่เลย ให้ตอบ -1',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม',
    outputDesc: 'ค่า x ที่มากที่สุดที่มี 2x ในชุด หรือ -1 ถ้าไม่มี',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: มีหลายคู่ ต้องเลือก x ที่มากที่สุด ไม่ใช่ 2x และไม่ใช่ค่าที่น้อยสุด · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[1,2,4]", output: "2" }, { input: "[2,4,8]", output: "4" }],
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
    desc: 'แปลงชื่อให้เป็นรูปแบบมาตรฐาน คือทุ่มคำขึ้นต้นด้วยตัวพิมพ์ใหญ่ แล้วที่เหลือเป็นตัวพิมพ์เล็ก'
      + 'คำคั่นด้วยช่องว่าง และช่องว่างเดิมต้องยังอยู่'
      + 'เช่น "jOHN sMITH" ต้องได้ "John Smith"',
    inputDesc: 'สตริงชื่อ-นามสกุล (อาจพิมพ์ตัวเล็กใหญ่ปนกัน)',
    outputDesc: 'สตริงชื่อที่แปลงแล้ว',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: คำเดียวที่เขียนเล็กหมด · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"jOHN sMITH\"", output: "\"John Smith\"" }, { input: "\"cher\"", output: "Cher" }],
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
    desc: 'ระบบค้นหาต้องการนับว่ามีกี่คำในประโยคที่ "ขึ้นต้นด้วย" ตัวอักษรที่ระบุ'
      + 'ไม่สนตัวพิมพ์เล็กใหญ่ คำคั่นด้วยช่องว่าง'
      + 'ดูแค่ตัวอักษรแรกของแต่ละคำเท่านั้น ไม่ใช่คำที่มีตัวอักษรนั้นอยู่',
    inputDesc: '{ sentence: ประโยค, letter: ตัวอักษรที่ต้องการ }',
    outputDesc: 'จำนวนคำที่ขึ้นต้นด้วย letter',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีคำไหนขึ้นต้นด้วยตัวอักษรนี้ ต้องได้ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"sentence\":\"Apple apple banana\",\"letter\":\"a\"}", output: "2" }, { input: "{\"sentence\":\"one two three\",\"letter\":\"z\"}", output: "0" }],
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
    desc: 'ตรวจรูปแบบอีเมลแบบง่าย ต้องผ่านทุกข้อพร้อมกัน:'
      + '(1) มีเครื่องหมาย @ พอดี 1 ตัว'
      + '(2) ทั้งสตริงไม่มีช่องว่าง'
      + '(3) ข้อความก่อน @ ต้องไม่ว่าง และต้องไม่ลงท้ายด้วยจุด'
      + '(4) ข้อความหลัง @ ต้องไม่ขึ้นต้นด้วยจุด ต้องมีจุดอย่างน้อย 1 จุด และข้อความหลังจุดสุดท้ายต้องไม่ว่าง'
      + 'พิมพ์ 1 ถ้าถูกต้องทั้งหมด หรือ 0 ถ้าข้อใดข้อหนึ่งไม่ผ่าน',
    inputDesc: 'สตริงที่ต้องการตรวจ',
    outputDesc: '1 ถ้ารูปแบบถูกต้อง, 0 ถ้าไม่ถูกต้อง',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: มี @ สองตัว ต้องตอบ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"a@b.co\"", output: "1" }, { input: "\"kim@@b.co\"", output: "0" }],
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
    desc: 'ตัวอักษรแต่ละตัวคือการเดิน 1 ก้าว (U ขึ้น, D ลง, L ซ้าย, R ขวา)'
      + 'คู่ตัวอักษรที่ "หันหลังกลับ" มี 4 แบบ คือ UD, DU, LR, RL'
      + 'UR และ DL เป็นการเดินตั้งฉาก ไม่นับ'
      + 'ต้องนับ "จำนวนคู่" ที่เกิดจากตัวอักษรที่ติดกัน โดยคู่ที่ซ้อนทับกันนับแยกกัน'
      + 'เช่น "UDUD" มีคู่ที่ติดกัน 3 คู่ คือ UD, DU, UD',
    inputDesc: 'สตริงตัวอักษร U D L R',
    outputDesc: 'จำนวนคู่ตัวอักษรที่เป็นการเดินกลับทาง',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีคู่ที่หันหลังกันเลย ต้องได้ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"UDUD\"", output: "3" }, { input: "\"UUUULLLL\"", output: "0" }],
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
    desc: 'ทำให้อาเรย์ไม่มีค่าซ้ำ โดยเก็บค่าแต่ละตัวไว้ "ครั้งเดียว"'
      + 'แล้วเรียงผลลัพธ์จากน้อยไปมาก'
      + 'พิมพ์เป็น Array',
    inputDesc: 'Array ของตัวเลขจำนวนเต็ม',
    outputDesc: 'Array ของค่าที่ไม่ซ้ำ เรียงจากน้อยไปมาก',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ค่าติดลบซ้ำกัน ต้องเรียงจากน้อยสุด · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[1,2,2,3,1]", output: "[1,2,3]" }, { input: "[2,-1,2,-1,0]", output: "[-1, 0, 2]" }],
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
    desc: 'ในอาเรย์ตัวเลข ต้องหา "ค่าที่เล็กที่สุด" ที่มีอีกค่าหนึ่งในอาเรย์ ซึ่งเอามาบวกกันได้เท่ากับ k'
      + 'ถ้ามีหลายคู่ที่ผ่าน ให้เลือกตัวเลขที่เล็กที่สุดของคู่นั้น'
      + 'ถ้าไม่มีคู่เลย ให้ตอบ -1',
    inputDesc: '{ numbers: [ตัวเลข...], k: ค่าที่ต้องการรวมได้ }',
    outputDesc: 'ค่าที่เล็กที่สุดในคู่ที่รวมเป็น k หรือ -1',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีคู่ที่รวมได้ k ต้องตอบ -1 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"numbers\":[2,7,11,15],\"k\":9}", output: "2" }, { input: "{\"numbers\":[1,2,3],\"k\":100}", output: "-1" }],
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
    desc: 'ตัวเลขที่มีค่าสูงมากอาจยาวหลายหลักจนเกินขอบเขตของ Number จึงถูกส่งมาเป็น "สตริง"'
      + 'ต้องนำสองสตริงนี้มาบวกกัน โดยทำทีละหลักจากขวามาซ้ายพร้อมทำ carry เหมือนการบวกด้วยมือ'
      + 'คืนผลลัพธ์เป็นสตริง (ทั้งสองเลขเป็นจำนวนเต็มไม่ติดลบ)',
    inputDesc: '[ตัวเลขสตริงที่ 1, ตัวเลขสตริงที่ 2]',
    outputDesc: 'ผลบวกเป็นสตริง',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ผลบวกที่ต้อง carry ทั้งหมด · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[\"12\",\"5\"]", output: "\"17\"" }, { input: "[\"999\",\"999\"]", output: "1998" }],
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
    desc: 'สตริงประกอบด้วยวงเล็บเหลี่ยม (), ปีกกา {} และเหลี่ยมก้าม []'
      + 'จะสมดุลก็ต่อเมื่อผ่านทั้ง 2 เงื่อนไข:'
      + '(1) ไม่มีวงเล็บเปิดค้างไว้เลย'
      + '(2) วงเล็บที่ปิดต้องตรงชนิดกับวงเปิดที่อยู่บนสุดเสมอ'
      + 'เช่น "(]" ไม่สมดุล แม้จำนวนเปิดกับปิดจะเท่ากันก็ตาม'
      + 'พิมพ์ 1 ถ้าสมดุล หรือ 0 ถ้าไม่สมดุล',
    inputDesc: 'สตริงวงเล็บ (อาจเป็นสตริงว่าง)',
    outputDesc: '1 ถ้าสมดุล, 0 ถ้าไม่สมดุล',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: จำนวนเปิดเท่ากับจำนวนปิด แต่ปิดผิดชนิด จึงไม่สมดุล · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "\"([{}])\"", output: "1" }, { input: "\"{]\"", output: "0" }],
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
    desc: 'หาตัวคูณร่วมน้อยที่สุด (ห.ร.ม.) ของตัวเลขทั้งหมดในอาเรย์'
      + 'ห.ร.ม. คือตัวเลขที่หารทุกตัวในอาเรย์ลงตัวพอดี และเป็นตัวที่เล็กที่สุดที่ทำได้'
      + 'สูตรที่ใช้ได้: ห.ร.ม.(a,b) = (a คูณ b) หาร ห.ร.ก.(a,b)'
      + 'และ ห.ร.ม. ของเลขใดกับ 0 คือ 0',
    inputDesc: 'Array ของตัวเลขจำนวนเต็มบวก',
    outputDesc: 'ห.ร.ม. ของทุกตัว',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: มีเลขเดียว ห.ร.ม. คือตัวเลขนั้นเอง · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "[2,3]", output: "6" }, { input: "[7]", output: "7" }],
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
    desc: 'เดินบนกริดขนาด n × n จากมุมบนซ้าย (0,0) ไปมุมขวาล่าง (n-1,n-1)'
      + 'ขยับได้ 2 ทิศทางเท่านั้น คือ ขวา (x+1) และ ลง (y+1) ห้ามเหยียบช่องที่ถูกบล็อก'
      + 'พิกัดเริ่มที่ 0'
      + 'ต้องนับ "จำนวนเส้นทาง" ที่ต่างกันทั้งหมด ไม่ใช่จำนวนก้าว',
    inputDesc: '{ n: ขนาดกริด, blocked: [[x,y], ...] } (พิกัด 0-based)',
    outputDesc: 'จำนวนเส้นทางทั้งหมด',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: บล็อกทั้งสองทางของจุดเริ่ม ตอบ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"n\":3,\"blocked\":[[1,1]]}", output: "2" }, { input: "{\"n\":3,\"blocked\":[[0,1],[1,0],[0,2]]}", output: "0" }],
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
    desc: 'หาจำนวนวิธีที่จะ "แบ่งจำนวน n เป็นกลุ่มของจำนวนเต็มบวก"'
      + 'ไม่สนลำดับของกลุ่ม เช่น 3+2 กับ 2+3 นับเป็นวิธีเดียวกัน'
      + 'นับทุกกลุ่มที่ได้ รวมทั้งกรณีที่ไม่แบ่งเลย'
      + 'กำหนดว่า n = 0 มี 1 วิธี',
    inputDesc: '{ total: จำนวนเต็ม n }',
    outputDesc: 'จำนวนวิธีแบ่งทั้งหมด',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: n = 2 มี 2 วิธี คือ 2 และ 1+1 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"total\":5}", output: "7" }, { input: "{\"total\":2}", output: "2" }],
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
    desc: 'เลือกคำที่ "ยาวที่สุด" ในประโยคที่ขึ้นต้นด้วยตัวอักษรที่ระบุ (ไม่สนตัวพิมพ์เล็กใหญ่)'
      + 'ถ้ามีหลายคำยาวเท่ากัน ให้เลือกคำที่ปรากฏมาก่อนในประโยค'
      + 'ถ้าไม่มีคำไหนตรงเงื่อนไขเลย ให้ตอบ "none"'
      + 'คืนคำตามตัวพิมพ์ที่เขียนในประโยค ไม่ต้องเปลี่ยนเป็นตัวพิมพ์เล็กหรือใหญ่',
    inputDesc: '{ sentence: ประโยค, letter: ตัวอักษรที่ต้องการ }',
    outputDesc: 'คำที่ยาวที่สุดที่ขึ้นต้นด้วย letter หรือ "none"',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ไม่มีคำไหนตรงเงื่อนไข ต้องตอบ "none" · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"sentence\":\"apple avocado banana\",\"letter\":\"a\"}", output: "\"avocado\"" }, { input: "{\"sentence\":\"hello world\",\"letter\":\"w\"}", output: "world" }],
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
    desc: 'มีเสาสูง h[i] วางเรียงจากซ้ายไปขวา เมื่อฝนตกน้ำจะขังในหลุมที่เกิดจากเสาที่สูงกว่าข้างเคียง'
      + 'น้ำที่ขังได้ในช่องที่ i คำนวณได้จาก:'
      + '  ความสูงที่ต่ำที่สุดของ (เสาสูงสุดฝั่งซ้าย, เสาสูงสุดฝั่งขวา) เอาลบด้วยความสูงของช่องนั้น'
      + 'ผลลัพธ์ต้องไม่ติดลบ (ช่องที่ไม่มีหลุมให้นับเป็น 0) และต้องรวมทุกช่อง',
    inputDesc: '{ heights: [ความสูงของเสาแต่ละต้น...], minPillars: จำนวนเสาขั้นต่ำ (ใช้ตรวจว่าข้อมูลถูกต้อง) }',
    outputDesc: 'ปริมาณน้ำขังรวมทั้งหมด',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: ทรงราบ ต้องไม่มีหลุม ได้ 0 · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"heights\":[1,8,6,2,5,4,8,3,7],\"minPillars\":2}", output: "19" }, { input: "{\"heights\":[3,1,2,1,3],\"minPillars\":2}", output: "5" }],
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
    desc: 'มีราคาสินค้าเรียงกันเป็นแถว ต้องซื้อ "กลุ่มติดกัน" เท่านั้น ข้ามสินค้าไม่ได้'
      + 'ต้องหากลุ่มติดกันที่ราคารวมมากที่สุด โดยยังไม่เกินเงินที่มี'
      + 'กลุ่มยาว 1 ชิ้นก็นับได้'
      + 'ถ้าไม่มีกลุ่มไหนเลยที่รวมได้ไม่เกินเงิน ให้ตอบ 0 (คือไม่ซื้ออะไรเลย)',
    inputDesc: '{ prices: [ราคาของสินค้าตามลำดับ...], budget: เงินที่มี }',
    outputDesc: 'ราคารวมของกลุ่มที่ซื้อได้มากที่สุด (ไม่เกิน budget)',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: กลุ่มที่ยาวที่สุดมี 3 ชิ้นแต่รวมเกินงบ ต้องเลือกกลุ่มที่รวมได้จริงและยังไม่เกินงบ · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"prices\":[2,4,3,5,1],\"budget\":10}", output: "9" }, { input: "{\"prices\":[2,9,2],\"budget\":5}", output: "2" }],
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
    desc: 'สร้างรายการโยง (linked list) ที่เก็บค่า 1, 2, ..., n เรียงกัน โดยแต่ละช่องเก็บค่าเดียวและเชื่อมด้วย next (ช่องสุดท้ายเป็น null)'
      + 'จากนั้นทำ 3 ขั้นตามลำดับ:'
      + '(1) แตกเป็นสองสาย โดยสายแรกเก็บ "ครึ่งแรกที่มีจำนวนมากกว่า" ส่วนสายหลังเก็บที่เหลือ'
      + '(2) กลับด้านสายหลัง ให้เดินจากท้ายมาหัว'
      + '(3) ต่อสายหลังที่กลับด้านแล้วต่อท้ายสายแรก'
      + 'พิมพ์ค่าในรายการใหม่เรียงติดกันเป็นข้อความเดียว',
    inputDesc: '{ n: จำนวนช่องทั้งหมด }',
    outputDesc: 'ค่าในรายการใหม่เรียงติดกัน (เช่น "12354")',
    /* ตัวอย่างที่ 2 เป็นเคสขอบ: n = 9 สายแรกได้ 5 ช่อง สายหลังได้ 4 ช่อง (ตัวเลขหลายหลัก) · input ทั้งสองตัวเป็นข้อความ JSON เพราะแผง Run Sample ส่งตรง ๆ เป็น stdin */
    examples: [{ input: "{\"n\":5}", output: "\"12354\"" }, { input: "{\"n\":9}", output: "123459876" }],
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
