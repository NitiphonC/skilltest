/* =========================================================================
   glossary.js — คำศัพท์ประกอบเฉลย
   -------------------------------------------------------------------------
   ทำไมต้องมี
     นักเรียนที่เปิดเฉลยแล้วจะสงสัยเสมอว่า "ตรงนี้คืออะไร" เช่น
     slice กับ splice ต่างกันยังไง, push คืนค่าอะไร, Map กับ Set ต่างกันไหม
     การอธิบายไว้ตรงจุดที่เขาค้าง จะได้เรียนรู้โครงสร้างของโค้ดจริง
     ไม่ใช่แค่จำคำสั่งไปใช้

   หลักการออกแบบ
     1. api    = คำอธิบายที่ใช้ซ้ำได้ทุกโจทย์ (Array.push, Math.floor, ...)
     2. helpers = คำอธิบายเฉพาะชื่อที่เฉลยเขียนขึ้นเอง (gcd, splitAt, ways, ...)
        เพราะชื่อเหล่านี้มีความหมายเฉพาะในบริบทนั้น
     3. map    = บอกว่าเฉลยแบบไหนใช้ศัพท์อะไรบ้าง และใช้ที่บรรทัดไหน
        สร้างโดยสแกนโค้ดจริง ไม่ได้เขียนด้วยมือ -> ไม่มีทางตกหล่น
        (ตรวจด้วย test-glossary.js ว่าทุกศัพท์ที่โค้ดใช้ ต้องมีคำอธิบายครบ)
     4. ทุกศัพท์มี "บรรทัดที่ใช้" -> คลิกแล้วกระโดดไปเห็นโค้ดตัวจริงในเฉลยนั้นทันที
        เพราะตัวอย่างทั่วไปไม่ช่วยเท่ากับเห็นบรรทัดของตัวเอง
   ========================================================================= */
window.GLOSSARY = {

  /* ================= คำอธิบาย API ที่ใช้ซ้ำได้ ================= */
  api: {

    'require': {
      kind: 'function',
      what: 'ขอ "เครื่องมือ" จากนอกมาใช้ ในเว็บนี้มีให้ใช้แค่ตัวเดียวคือ fs',
      how: 'โจทย์ทุกข้อเริ่มด้วย require("fs") เพื่อเอาความสามารถอ่านข้อมูลจาก stdin',
      returns: 'คืน "ตัวแปร fs" ที่มี readFileSync อยู่ข้างใน',
      eg: 'const fs = require("fs");\nconsole.log(typeof fs);   // object\nconsole.log(typeof fs.readFileSync);   // function',
      gotcha: '0 ใน readFileSync(0) คือ "ช่องที่ 0" ของอินพุต = stdin ไม่ใช่เลขศูนย์'
    },

    'fs.readFileSync': {
      kind: 'function',
      what: 'อ่านข้อมูลทั้งหมดจาก "อินพุตมาตรฐาน" (stdin) แบบรอผลทันที',
      how: 'สั่งให้หยุดรอจนกว่าจะได้ข้อมูลครบ แล้วคืนเป็นข้อความ ถ้าไม่บอกว่าจะเข้ารหัสแบบไหน จะได้ข้อมูลดิบซึ่งภาษาไทยจะเพี้ยน',
      returns: 'ข้อความ (สตริง)',
      eg: 'const fs = require("fs");\nconsole.log(typeof fs.readFileSync);   // function',
      gotcha: 'ต้องใส่ \'utf-8\' เสมอ ไม่งั้นข้อความภาษาไทยจะเพี้ยนเป็นอักขระแปลก\nต้อง .trim() ต่อท้ายด้วย เพราะอินพุตมักมีขีดบรรทัดตอนท้าย ซึ่งทำให้ JSON.parse แล้ว error'
    },

    'console.log': {
      kind: 'function',
      what: 'พิมพ์ค่าออกทางหน้าจอ',
      how: 'รับค่าได้หลายค่า คั่นด้วยช่องว่าง แล้วแปลงเป็นข้อความก่อนพิมพ์',
      returns: 'ไม่คืนค่า (undefined)',
      eg: 'console.log(6);   // 6\nconsole.log("a", 1);   // a 1\nconsole.log([1,2].join(","));   // 1,2',
      gotcha: 'ถ้าโจทย์ไม่ได้พิมพ์อะไรเลย จะได้คำตอบว่างเปล่า ไม่ใช่ 0 และไม่ใช่ error — ตอนส่งงานจึงขึ้นว่า "ไม่มี console.log"\nถ้าคำตอบเป็น Array ต้องใช้ console.log(JSON.stringify(ans)) ไม่งั้นจะได้ 1,2,3 ซึ่งตัวตรวจอ่านไม่ออก'
    },

    'JSON.parse': {
      kind: 'function',
      what: 'แปลง "ข้อความ JSON" ให้เป็นค่าจริง (Array หรือ object)',
      how: 'ข้อความที่เข้ามาต้องเป็น JSON ที่ถูกต้องเท่านั้น จึงจะได้ค่าที่ใช้ต่อได้',
      returns: 'Array ถ้าข้อความขึ้นต้นด้วย [ · object ถ้าขึ้นต้นด้วย {',
      eg: 'console.log(JSON.stringify(JSON.parse("[1,2,3]")));   // [1,2,3]\nconsole.log(JSON.stringify(JSON.parse(\'{"a":1}\')));   // {"a":1}\nconsole.log(typeof JSON.parse(\'{"a":1}\'));   // object',
      gotcha: 'ถ้า input ไม่ใช่ JSON จะ error — เช่น JSON.parse(1234) ใน Node จะได้ 1234 แต่ JSON.parse("[1,2") จะ error เสมอ\nในหน้าเว็บนี้ input ถูกส่งมาเป็น JSON เสมอ แต่ถ้าลองใส่อะไรแปลก ๆ ในแผง "ทดลองเอง" จะเห็น error ตรงนี้'
    },

    'JSON.stringify': {
      kind: 'function',
      what: 'แปลงค่าจริง (Array / object) ให้เป็น "ข้อความ JSON"',
      how: 'ตรงข้ามกับ JSON.parse — ใช้ตอนคำตอบที่ต้องพิมพ์ออกมาเป็น Array หรือ object',
      returns: 'ข้อความ (สตริง)',
      eg: 'console.log(JSON.stringify([1,2]));   // [1,2]\nconsole.log(JSON.stringify({a:1}));   // {"a":1}',
      gotcha: 'ต้องใส่เลข 0 นำหน้าตอนพิมพ์ตัวเลขเองด้วย ไม่งั้นจะโดนตัดทึ้งไป เช่น 0 ไม่ใช่ ""'
    },

    'length': {
      kind: 'property',
      what: 'ความยาวของอาเรย์หรือสตริง (จำนวนตัวอักษร/สมาชิก)',
      how: 'เป็นค่าที่อ่านได้อย่างเดียว ห้ามเขียนทับ และติดลบไม่ได้ — ลบสมาชิกต้องใช้ pop หรือ splice',
      returns: 'ตัวเลข (จำนวนสมาชิก)',
      eg: 'console.log("hello".length);   // 5\nconsole.log([1,2,3].length);   // 3\nconsole.log([].length);   // 0',
      gotcha: 'length นับ "ช่อง" ไม่ใช่ "ค่าที่ไม่ว่าง" — [1,,3].length คือ 3 แต่มีแค่ 2 ค่าที่ใช้ได้\nดัชนีเริ่มที่ 0 เสมอ ตัวสุดท้ายคือ length - 1'
    },

    'Array.fill': {
      kind: 'method',
      what: 'เติมค่าเดียวกันลงทุกช่องของอาเรย์',
      how: 'วนตั้งแต่ต้นจนถึงท้าย แล้วใส่ค่าที่ให้มาลงทุกช่อง',
      returns: 'อาเรย์ต้นฉบับที่เติมแล้ว (แก้ต้นฉบับ)',
      eg: 'console.log(new Array(3).fill(0).join(","));   // 0,0,0\nconsole.log(new Array(3).fill(1).length);   // 3',
      gotcha: 'new Array(3) สร้างอาเรย์ยาว 3 ที่ยังไม่มีค่า (เป็นช่องว่าง ไม่ใช่ 0) ต้อง fill เสมอ\n[3].fill(0) ไม่ได้ เพราะ [3] คืออาเรย์ที่มีค่า 3 อยู่แล้ว ต้องใช้ new Array(3)'
    },

    'Array.push': {
      kind: 'method',
      what: 'เพิ่มค่าต่อท้ายอาเรย์',
      how: 'เอาค่าที่ให้มาไปวางไว้ปลายสุดของอาเรย์ แล้วอาเรย์เดิมจะยาวขึ้น',
      returns: 'ความยาวใหม่ของอาเรย์ (มักไม่ต้องใช้ค่าที่ได้กลับ)',
      eg: 'const a = [1, 2];\na.push(3);\nconsole.log(a.join(","));   // 1,2,3',
      gotcha: 'push แก้อาเรย์ต้นฉบับเสมอ (ไม่ใช่การคืนอาเรย์ใหม่) ต่างจาก map/filter/slice ที่คืนอาเรย์ใหม่\nใส่ได้ทีละหลายค่า ถ้าใส่ค่าเดียวให้แน่นอน'
    },

    'Array.pop': {
      kind: 'method',
      what: 'ดึงสมาชิกตัวสุดท้ายออกมา',
      how: 'เอาตัวสุดท้ายออกจากอาเรย์ แล้วคืนค่านั้นให้ (อาเรย์สั้นลง 1)',
      returns: 'ค่าของสมาชิกที่ถูกดึงออก (ถ้าอาเรย์ว่างจะได้ undefined)',
      eg: 'const a = [1, 2, 3];\nconst last = a.pop();\nconsole.log(last);   // 3\nconsole.log(a.join(","));   // 1,2',
      gotcha: 'เป็นคู่กับ push ที่ปลายสุดเหมือนกัน นึกว่า "กอง" — push วางทับ, pop ดึงออกจากบน\nถ้าอยากได้ตัวแรกต้องใช้ shift และ unshift แทน ซึ่งช้ากว่า'
    },

    'Array.slice': {
      kind: 'method',
      what: 'ตัด "ช่วง" ออกมาเป็นอาเรย์ใหม่',
      how: 'slice(a, b) เอาตั้งแต่ดัชนี a ถึง b-1 (ไม่เอา b) คืนเป็นอาเรย์ใหม่ ต้นฉบับไม่เปลี่ยน',
      returns: 'อาเรย์ใหม่',
      eg: 'const a = [1, 2, 3, 4, 5];\nconsole.log(a.slice(1, 3).join(","));   // 2,3\nconsole.log(a.slice(2).join(","));   // 3,4,5\nconsole.log(a.slice(-2).join(","));   // 4,5',
      gotcha: 'ขอบปลายขวาไม่รวมตัวสุดท้าย — นี่คือจุดที่คนพลาดบ่อยที่สุด\na.slice() คืนการ "คัดลอก" อาเรย์ทั้งก้อน (ต้องทำแบบนี้ก่อน sort เพราะ sort แก้ต้นฉบับ)'
    },

    'Array.sort': {
      kind: 'method',
      what: 'เรียงลำดับค่าในอาเรย์',
      how: 'เปรียบเทียบสองค่าทีละคู่ ถ้าไม่บอกว่าจะเรียงอย่างไร จะเรียงเป็น "ข้อความ" ตามตัวอักษร',
      returns: 'อาเรย์เดิมที่ถูกเรียงแล้ว (แก้ต้นฉบับ!)',
      eg: 'const a = [10, 9, 2];\nconsole.log(a.slice().sort((x, y) => x - y).join(","));   // 2,9,10\nconsole.log(a.slice().sort((x, y) => y - x).join(","));   // 10,9,2\nconsole.log(a.slice().sort().join(","));   // 10,2,9   <- ไม่ใส่ comparator',
      gotcha: 'ลืม comparator แล้ว [10, 9, 2] จะได้ [10, 2, 9] เพราะ "10" มากกว่า "2" ในแบบข้อความ\nsort แก้อาเรย์ต้นฉบับ — ถ้าต้องเก็บของเดิมไว้ให้ใช้ a.slice().sort(...)\n(x, y) => x - y คือน้อยไปมาก · (x, y) => y - x คือมากไปน้อย'
    },

    'Array.reverse': {
      kind: 'method',
      what: 'กลับลำดับในอาเรย์ (หัวไปท้าย)',
      how: 'สลับตัวแรกกับตัวสุดท้าย ไล่เข้าหากลาง',
      returns: 'อาเรย์เดิมที่กลับลำดับแล้ว (แก้ต้นฉบับ)',
      eg: 'const a = [1, 2, 3];\na.reverse();\nconsole.log(a.join(","));   // 3,2,1',
      gotcha: 'แก้ต้นฉบับเสมอ ถ้าต้องการแค่ดูลำดับที่กลับแล้วโดยไม่ทำลายของเดิม ให้ใช้ a.slice().reverse()'
    },

    'Array.join': {
      kind: 'method',
      what: 'รวมสมาชิกทั้งหมดเป็นสตริงเดียว',
      how: 'เอาทุกสมาชิกมาแปลงเป็นข้อความ แล้ววางตัวคั่นระหว่างแต่ละคู่',
      returns: 'สตริงที่ได้',
      eg: 'console.log([1,2,3].join("-"));   // 1-2-3\nconsole.log([1,2,3].join(""));   // 123\nconsole.log(["a","b"].join(" "));   // a b',
      gotcha: 'join("") คือการ "ต่อข้อความ" ต่างจากการบวกสตริงตรง ๆ (["1"] + "2" ได้ "12" แต่ถ้าตัวเลขจริง 1 + 2 ได้ 3)\nถ้าสมาชิกเป็น null หรือ undefined จะกลายเป็นข้อความว่าง ไม่ใช่คำว่า "null"'
    },

    'Array.map': {
      kind: 'method',
      what: 'แปลงทุกสมาชิกให้เป็นค่าใหม่ ได้อาเรย์ใหม่ที่ยาวเท่าเดิม',
      how: 'เรียกฟังก์ชันกับทีละสมาชิก เอาค่าที่ฟังก์ชันคืนมาเป็นสมาชิกตัวใหม่',
      returns: 'อาเรย์ใหม่ (ต้นฉบับไม่เปลี่ยน) ความยาวเท่าเดิมเสมอ',
      eg: 'console.log([1,2,3].map(n => n * 2).join(","));   // 2,4,6\nconsole.log(["a","b"].map(s => s.toUpperCase()).join(","));   // A,B',
      gotcha: 'map ไม่ใช่ filter — map คืนค่าครบทุกตัว (ยาวเท่าเดิม) ส่วน filter คืนเฉพาะตัวที่ผ่านเงื่อนไข\nฟังก์ชันได้รับ 3 อาร์กิวเมนต์: (สมาชิก, ดัชนี, อาเรย์ทั้งหมด)\nถ้าไม่ return ค่า จะได้ undefined เต็มอาเรย์'
    },

    'Array.filter': {
      kind: 'method',
      what: 'กรองเอาก็เฉพาะสมาชิกที่ผ่านเงื่อนไข',
      how: 'เรียกฟังก์ชันกับทีละสมาชิก ถ้าได้ค่าจริง (true) ก็เก็บสมาชิกนั้นไว้',
      returns: 'อาเรย์ใหม่ที่มีเฉพาะตัวที่ผ่าน (ยาวไม่เท่าต้นฉบับ)',
      eg: 'console.log([1,2,3,4].filter(n => n % 2 === 0).join(","));   // 2,4\nconsole.log(["a","b"].filter(s => s.length > 0).join(","));   // a,b',
      gotcha: 'คืนค่าที่เป็น "ความจริง" ไม่ใช่แค่ true — 0, "" และ null ถือว่า "ไม่จริง" ด้วย\nถ้าต้องการนับจำนวนที่ผ่าน ให้ใช้ .filter(...).length แต่ถ้าไม่ได้เอาตัวไหนไปใช้ การนับใน loop จะชัดกว่า'
    },

    'Array.reduce': {
      kind: 'method',
      what: 'ยุบอาเรย์ทั้งก้อนให้เหลือ "ค่าเดียว"',
      how: 'เรียกฟังก์ชันทีละสมาชิก โดยส่ง "ตัวสะสม" เข้าไปด้วย แล้วเอาค่าที่คืนมาเป็นตัวสะสมรอบถัดไป',
      returns: 'ตัวสะสมสุดท้าย (ชนิดตามที่ฟังก์ชันคืน)',
      eg: 'console.log([1,2,3].reduce((s, n) => s + n, 0));   // 6\nconsole.log([1,2,3].reduce((s, n) => s + n));   // 6\nconsole.log([1,2,3].reduce((s, n) => s + "-" + n, "x"));   // x-1-2-3',
      gotcha: 'ตัวที่สองของ reduce คือ "ค่าเริ่มต้น" — ถ้าไม่ใส่ ฟังก์ชันจะเริ่มด้วยสมาชิกตัวแรก ซึ่งทำให้ผลต่างกัน\nเขียน (sum, n) => sum + n ต้องเป็นแบบนี้เสมอ ถ้าเขียนกลับด้านจะได้ผลผิด\nถ้าไม่ใส่ค่าเริ่มต้นแล้วอาเรย์ว่าง จะ error'
    },

    'Array.indexOf': {
      kind: 'method',
      what: 'หาตำแหน่งแรกที่ค่านั้นปรากฏ',
      how: 'ไล่ดูทีละสมาชิก เทียบด้วยการเท่ากันแบบเข้มงวด (ต้องเป็นชนิดเดียวกันด้วย)',
      returns: 'ดัชนีของตัวแรกที่เจอ หรือ -1 ถ้าไม่มี',
      eg: 'console.log([1,2,3].indexOf(2));   // 1\nconsole.log([1,2,3].indexOf(9));   // -1',
      gotcha: 'คืน -1 ไม่ใช่ undefined — ต้องตรวจด้วย if (i === -1) หรือ if (i !== -1)\nเทียบแบบเข้มงวด: [1,"1"].indexOf("1") คือ 1 แต่ [1,"1"].indexOf(1) คือ 0\nถ้าต้องการ "มีอยู่ไหม" ในเว็บนี้ใช้ Set.has จะเร็วกว่ามาก'
    },

    'Array.lastIndexOf': {
      kind: 'method',
      what: 'หาตำแหน่ง "สุดท้าย" ที่ค่านั้นปรากฏ',
      how: 'เหมือน indexOf แต่ไล่จากท้ายเข้าหาหัว',
      returns: 'ดัชนีของตัวสุดท้ายที่เจอ หรือ -1',
      eg: 'console.log([1,2,1,2].lastIndexOf(2));   // 3',
      gotcha: 'ใช้คู่กับ indexOf เพื่อตรวจว่า "@ มีพอดี 1 ตัว" — ถ้าสองค่านี้เท่ากัน แปลว่ามีตัวเดียว'
    },

    'String.charAt': {
      kind: 'method',
      what: 'ดึงตัวอักษรที่ตำแหน่ง n (นับจาก 0)',
      how: 'คืนสตริงยาว 1 ตัวอักษรที่ตำแหน่งนั้น',
      returns: 'สตริง 1 ตัวอักษร (ถ้าเกินความยาวจะได้ "ข้อความว่าง" ไม่ใช่ undefined)',
      eg: 'console.log("hello".charAt(0));   // h\nconsole.log("hello".charAt(4));   // o\nconsole.log(JSON.stringify("hello".charAt(99)));   // ""   <- ข้อความว่าง',
      gotcha: 'คืน "ตัวอักษร" ไม่ใช่ "ตัวเลข" — ต้องเอาไปเทียบกับ "h" ไม่ใช่ 104\nถ้าเกินขอบเขตจะได้ "" ซึ่งเทียบกับอะไรก็ไม่เท่ากัน ฟังดูเหมือนทำงานแต่ไม่ error (ถ้าต้องการเลข ใช้ charCodeAt แทน)\nสตริงที่มีภาษาไทย/อีโมจิ 1 ตัวอักษรอาจกิน 2 ช่อง ทำให้ charAt ไม่ตรงกับสายตา'
    },

    'String.charCodeAt': {
      kind: 'method',
      what: 'ดึง "รหัสตัวเลข" ของตัวอักษรที่ตำแหน่ง n',
      how: 'JavaScript เก็บตัวอักษรไว้เป็นตัวเลขขนาด 16 บิต ค่านี้คือเลขที่เก็บไว้',
      returns: 'ตัวเลข (0 ถึง 65535) ถ้าเกินขอบเขตจะได้ NaN',
      eg: 'console.log("a".charCodeAt(0));   // 97\nconsole.log("1".charCodeAt(0));   // 49\nconsole.log("0".charCodeAt(0));   // 48',
      gotcha: 'รหัสของ "0" คือ 48 ไม่ใช่ 0 — ถ้าต้องแปลงตัวเลขที่อยู่ในสตริงต้องลบ 48 ทิ้ง\nเลขที่ได้จะเป็นเลขทศนิยมเสมอ ต้องใช้ Math.floor ตัดเศษทิ้งก่อน'
    },

    'String.split': {
      kind: 'method',
      what: 'ตัดสตริงเป็นอาเรย์ของชิ้นส่วน',
      how: 'หาตัวคั่นที่ระบุ แล้วตัดตามตัวคั่นนั้น (ถ้าไม่เจอตัวคั่นเลย จะได้อาเรย์ที่มีสตริงเดิม 1 ชิ้น)',
      returns: 'อาเรย์ของชิ้นส่วน',
      eg: 'console.log("a,b,c".split(",").join("|"));   // a|b|c\nconsole.log("a b".split(" ").join("|"));   // a|b\nconsole.log("abc".split("").join("|"));   // a|b|c\nconsole.log("a  b".split(" ").length);   // 3   <- มีช่องว่างว่าง',
      gotcha: 'ตัวคั่นต้องเป็น "ข้อความ" ไม่ใช่ regex — "a1b2".split(/[0-9]/) ใช้ไม่ได้ในเว็บนี้\n"a  b".split(" ") ได้ ["a", "", "b"] เพราะมีช่องว่างว่างอยู่ตรงกลาง — นี่คือเหตุผลที่ต้อง trim แล้วกรองคำว่างทิ้ง\nค่าที่คืนมาเป็นสตริงเสมอ ไม่ใช่ตัวเลข'
    },

    'String.toLowerCase': {
      kind: 'method',
      what: 'แปลงตัวอักษรให้เป็นตัวพิมพ์เล็กทั้งหมด',
      how: 'เทียบทีละตัวอักษรกับตารางตัวพิมพ์เล็ก',
      returns: 'สตริงใหม่ (ต้นฉบับไม่เปลี่ยน)',
      eg: 'console.log("The THE".toLowerCase());   // the the',
      gotcha: 'ผลลัพธ์เป็นสตริงใหม่เสมอ ตัวเดิมไม่เปลี่ยน — ต้องเก็บค่าที่ได้ไปใช้\nถ้าต้องการ "เทียบโดยไม่สนตัวพิมพ์" ให้แปลงทั้งสองฝั่งก่อนเทียบ ไม่ใช่แก้ข้อมูลต้นฉบับ'
    },

    'String.toUpperCase': {
      kind: 'method',
      what: 'แปลงตัวอักษรเป็นตัวพิมพ์ใหญ่ทั้งหมด',
      how: 'เทียบทีละตัวอักษรกับตารางตัวพิมพ์ใหญ่',
      returns: 'สตริงใหม่ (ต้นฉบับไม่เปลี่ยน)',
      eg: 'console.log("abc".toUpperCase());   // ABC\nconsole.log("AbC".toUpperCase());   // ABC',
      gotcha: 'ตัวเลขและเครื่องหมายไม่มีตัวพิมพ์ใหญ่ จึงคงเดิม\nผลลัพธ์เป็นสตริงใหม่เสมอ ต้องเก็บค่าที่ได้ไว้ใช้'
    },

    'String.trim': {
      kind: 'method',
      what: 'ตัดช่องว่างหัวและท้ายออก',
      how: 'ลบช่องว่าง ขึ้นบรรทัดใหม่ และแท็บ ที่อยู่ต้นและปลายสตริงออกทั้งหมด',
      returns: 'สตริงใหม่ที่ไม่มีช่องว่างหัวท้าย',
      eg: 'console.log(JSON.stringify("  a b  ".trim()));   // "a b"\nconsole.log(JSON.stringify("a  b".trim()));   // "a  b"   <- ตรงกลางไม่โดน',
      gotcha: 'ตัดแค่หัวท้าย ไม่ได้ตัดช่องว่างตรงกลาง — "a  b".trim() ยังเป็น "a  b" อยู่\nต้องใช้คู่กับ filter ทิ้งคำว่าง ถ้าจะนับคำ (ดูเฉลย p12)'
    },

    'String.padStart': {
      kind: 'method',
      what: 'เติมอักขระที่กำหนดไว้ข้างหน้าให้ยาวครบ',
      how: 'ถ้าสตริงยาวเกินเป้าหมายจะไม่แก้ ถ้าสั้นกว่าจะเติมให้ครบโดยวางข้างหน้า',
      returns: 'สตริงใหม่ที่ยาวตามที่กำหนด',
      eg: 'console.log("7".padStart(2, "0"));   // 07\nconsole.log("12".padStart(4, "0"));   // 0012\nconsole.log("12345".padStart(2, "0"));   // 12345   <- ยาวแล้วไม่ตัด',
      gotcha: 'padStart เติมให้ "ครบ" ไม่ใช่ตัดให้สั้น — ถ้าใส่ค่าที่ยาวกว่าเป้าหมาย จะได้สตริงเดิม\nต้องแปลงเป็นสตริงก่อน (String(x).padStart) เพราะตัวเลขไม่มีเมธอดนี้\nมี padEnd ด้วย สำหรับเติมท้าย'
    },

    'String': {
      kind: 'function',
      what: 'แปลงค่าให้เป็น "สตริง"',
      how: 'เอาค่าใด ๆ มาแปลงเป็นข้อความ โดยใช้กฎของตัวแปลงแต่ละชนิด',
      returns: 'สตริง',
      eg: 'console.log(String(5));   // 5\nconsole.log(String(5 + 1));   // 6\nconsole.log(String(1 + "1"));   // 11',
      gotcha: 'String(5 + 1) ได้ "6" แต่ String([1,2]) ได้ "1,2" เพราะอาเรย์ถูกแปลงเป็นข้อความด้วยจุลภาค\nถ้าต้องการ JSON ที่ถูกต้องต้องใช้ JSON.stringify ไม่ใช่ String'
    },

    'Number': {
      kind: 'function',
      what: 'แปลงค่าให้เป็น "ตัวเลข"',
      how: 'ถ้าแปลงไม่ได้จะได้ NaN (ไม่ใช่ error) ซึ่งต่อไปจะทำให้ตัวเลขอื่นกลายเป็น NaN หมด',
      returns: 'ตัวเลข หรือ NaN',
      eg: 'console.log(Number("7"));   // 7\nconsole.log(Number("abc"));   // NaN\nconsole.log(Number(""));   // 0',
      gotcha: 'ถ้าเก็บผลไว้ใน object แล้วอยากใช้เป็น "คีย์" ต้องแปลงกลับเป็นตัวเลขด้วย Number(key) เพราะชื่อ key ของ object เป็นสตริงเสมอ\nค่าว่างกลายเป็น 0 ซึ่งมักไม่ใช่สิ่งที่ตั้งใจ'
    },

    'Math.floor': {
      kind: 'function',
      what: 'ปัดทศนิยมลง (เล็กลงเสมอ)',
      how: 'เลข 3.9 กลายเป็น 3 · เลข -3.1 กลายเป็น -4 (ไปทางลบเสมอ)',
      returns: 'จำนวนเต็ม',
      eg: 'console.log(Math.floor(3.9));   // 3\nconsole.log(Math.floor(-3.1));   // -4\nconsole.log(Math.floor(8 / 3));   // 2',
      gotcha: 'ใช้เมื่อ "หารแล้วได้เศษ" เสมอ เช่น 5 กะ ๆ กะละ 8 ชั่วโมง = 5 กะ\nMath.sqrt ไม่ได้ปัดให้ ต้องใช้ Math.floor ต่อ ไม่งั้นเลขทศนิยมจะคูณกลับไม่ได้ค่าเดิม'
    },

    'Math.ceil': {
      kind: 'function',
      what: 'ปัดทศนิยมขึ้น (ใหญ่ขึ้นเสมอ)',
      how: 'เลข 3.1 กลายเป็น 4 · เลข 4 กลายเป็น 4 (ไม่เปลี่ยน)',
      returns: 'จำนวนเต็ม',
      eg: 'console.log(Math.ceil(3.1));   // 4\nconsole.log(Math.ceil(4));   // 4\nconsole.log(Math.ceil(5 / 2));   // 3',
      gotcha: 'ใช้เมื่อต้อง "แบ่งให้ครบ" เช่น n ชิ้น หาร 2 คน จะได้ n/2 คนถ้าเศษต้องปัดขึ้น\nn = 5 แบ่งสองคนได้ 3 คน ไม่ใช่ 2.5 คน'
    },

    'Math.min': {
      kind: 'function',
      what: 'หาค่าที่เล็กที่สุดจากที่ให้มาทั้งหมด',
      how: 'เทียบทีละคู่แล้วเก็บค่าที่เล็กกว่าไว้',
      returns: 'ตัวเลขที่เล็กที่สุด',
      eg: 'console.log(Math.min(3, 7, 2));   // 2\nconsole.log(Math.min(...[3, 7, 2]));   // 2',
      gotcha: 'ต้อง "กระจาย" อาเรย์ด้วย ... ก่อน ถ้าส่งอาเรย์เข้าไปตรง ๆ จะได้ NaN\nถ้าเป็นอาเรย์ยาวมาก การกระจายจะเต็มขีดจำกัดของ JavaScript — ในโจทย์ชุดนี้ใช้ได้สบาย'
    },

    'Math.max': {
      kind: 'function',
      what: 'หาค่าที่ใหญ่ที่สุดจากที่ให้มาทั้งหมด',
      how: 'เทียบทีละคู่แล้วเก็บค่าที่ใหญ่กว่าไว้',
      returns: 'ตัวเลขที่ใหญ่ที่สุด',
      eg: 'console.log(Math.max(1, 9, 4));   // 9\nconsole.log(Math.max(...[2, 7, 3]));   // 7',
      gotcha: 'ถ้าใช้หาค่าเริ่มต้นของ "ตัวสะสม" ต้องระวังเรื่องค่าติดลบ — รับประกันว่าคำตอบเป็นตัวเลขที่ไม่ติดลบ จึงเริ่มที่ 0 ได้ แต่ถ้าโจทย์ให้ค่าติดลบ ต้องเริ่มที่ -Infinity'
    },

    'Math.sqrt': {
      kind: 'function',
      what: 'หารากที่สอง (ยกกำลังสองแล้วได้ตัวเลขนี้)',
      how: 'คำนวณจากกฎกำลังสอง',
      returns: 'ตัวเลขทศนิยม',
      eg: 'console.log(Math.sqrt(9));   // 3\nconsole.log(Math.sqrt(16));   // 4\nconsole.log(Math.sqrt(17) * Math.sqrt(17) === 17);   // false   <- ลอย ๆ ไม่กลับเป็นค่าเดิม',
      gotcha: 'สำคัญมาก: sqrt ไม่ได้คืนจำนวนเต็ม — Math.sqrt(17) * Math.sqrt(17) ได้ 16.999999999999996 ไม่ใช่ 17\nถ้าจะตรวจว่าเป็นกำลังสองสมบูรณ์ ต้อง Math.floor ก่อน แล้วคูณกลับ'
    },

    'Map.set': {
      kind: 'method',
      what: 'เก็บ "คู่" ของ key กับ value ลง Map',
      how: 'ถ้ามี key นี้อยู่แล้วจะทับค่าเดิม ถ้ายังไม่มีจะเพิ่มเข้าไปใหม่',
      returns: 'ตัว Map เอง (จึงต่อ .set ได้ติด ๆ กัน)',
      eg: 'const m = new Map();\nm.set("a", 1);\nm.set("b", 2);\nconsole.log(m.size);   // 2',
      gotcha: 'Map เก็บ key ได้ทุกชนิดรวมถึง object และ array (object ธรรมดาเก็บเป็นกุญแจข้อความ ต้องแปลงเป็นข้อความก่อน)\nMap เก็บลำดับการเพิ่มตามที่ใส่เข้าไป จึง for...of ออกมาตามลำดับ'
    },

    'Map.get': {
      kind: 'method',
      what: 'อ่าน value ของ key ที่ระบุ',
      how: 'ค้นใน Map ด้วย key',
      returns: 'value ที่เก็บไว้ หรือ undefined ถ้าไม่มี key นี้',
      eg: 'const m = new Map([["a", 1]]);\nconsole.log(m.get("a"));   // 1\nconsole.log(String(m.get("z")));   // undefined',
      gotcha: 'ถ้า value เป็น 0 หรือ "" ก็ถือว่ามีค่า แต่ undefined แปลว่าไม่มี — ถ้าต้องการค่าเริ่มต้นให้ส่งเข้าไป: m.get(key, ค่าเริ่มต้น)'
    },

    'Map.has': {
      kind: 'method',
      what: 'ตรวจว่ามี key นี้อยู่ใน Map ไหม',
      how: 'ค้นด้วย key แล้วตอบว่าเจอหรือไม่',
      returns: 'true ถ้ามี · false ถ้าไม่มี',
      eg: 'const m = new Map([["a", 1]]);\nconsole.log(m.has("a"));   // true\nconsole.log(m.has("b"));   // false',
      gotcha: 'Map.has ตรวจได้เร็วกว่า object เพราะไม่ต้องเปรียบเทียบข้อความ\nแต่ถ้า key เป็นตัวเลข object จะเก็บเป็น "1" (ข้อความ) ส่วน Map เก็บเป็นตัวเลขจริง — 1 กับ "1" ไม่เท่ากัน'
    },

    'Set.add': {
      kind: 'method',
      what: 'เพิ่มค่าเข้า Set',
      how: 'ถ้าค่านั้นมีอยู่แล้วจะไม่เพิ่มซ้ำ (จึงใช้ทำ "ตัดค่าซ้ำ" ได้)',
      returns: 'ตัว Set เอง',
      eg: 'const s = new Set();\ns.add(3);\ns.add(3);\ns.add(1);\nconsole.log(s.size);   // 2   <- เพิ่ม 3 ซ้ำไม่นับ',
      gotcha: 'Set เก็บค่าไม่ซ้ำเสมอ จึง "นับความถี่" ไม่ได้ ถ้าต้องนับต้องใช้ Map หรือ object\nSet เก็บตามลำดับที่เพิ่มเข้า ไม่ใช่เรียงตามค่า — ถ้าต้องเรียงต้อง sort เอง'
    },

    'Set.has': {
      kind: 'method',
      what: 'ตรวจว่ามีค่านี้อยู่ใน Set ไหม',
      how: 'ค้นด้วยค่า แล้วตอบว่าเจอหรือไม่',
      returns: 'true ถ้ามี · false ถ้าไม่มี',
      eg: 'const s = new Set([1, 2]);\nconsole.log(s.has(2));   // true\nconsole.log(s.has(9));   // false',
      gotcha: 'เร็วมากแม้ข้อมูลจะเยอะ เหมาะกับโจทย์ที่ต้องถามว่า "มีค่านี้ไหม" ซ้ำ ๆ เช่น หาเลขที่หายไป\nถ้าไม่ใช้ Set แล้วไล่ indexOf ทีละคู่ จะช้าเป็น O(n²)'
    }
  },

  /* ================= คำอธิบายเฉพาะชื่อที่เฉลยเขียนเอง =================
     แยกตามโจทย์ เพราะชื่อเดียวกันในคนละโจทย์อาจแปลว่าคนละอย่าง */
  helpers: {

    p4: {
      'gcd': {
        kind: 'function',
        what: 'ห.ร.ก. (ตัวประกอบร่วมมากที่สุด) ของ a กับ b',
        how: 'ใช้หลักของ Euclidean algorithm: ถ้า b ไม่ใช่ 0 ให้แทน (a, b) ด้วย (b, a % b) แล้วทำซ้ำจน b เป็น 0 ค่า a ที่เหลือคือคำตอบ',
        returns: 'ตัวประกอบร่วมมากที่สุด (ตัวเลขบวกเสมอ)',
        eg: 'function gcd(a, b) {\n  while (b !== 0) {\n    const rest = a % b;\n    a = b;\n    b = rest;\n  }\n  return a;\n}\nconsole.log(gcd(12, 18));   // 6\nconsole.log(gcd(48, 18));   // 6',
        note: 'ชื่อย่อมาจาก Greatest Common Divisor — โจทย์ p4 และ p29 ใช้ฟังก์ชันนี้เหมือนกัน'
      }
    },

    p14: {
      'pad': {
        kind: 'function',
        what: 'เติม 0 ข้างหน้าให้ตัวเลขที่มีหลักเดียวกลายเป็นสองหลัก',
        how: 'ถ้า n น้อยกว่า 10 ให้เอา "0" ไปต่อหน้า แล้วแปลงกลับเป็นข้อความ',
        returns: 'สตริง',
        eg: 'function pad(n) { return n < 10 ? "0" + n : String(n); }\nconsole.log(pad(5));   // 05\nconsole.log(pad(12));   // 12',
        note: 'เขียนเองแทนที่ใช้ String(n).padStart(2, "0") เพื่อให้เห็นว่าเป็นเงื่อนไข if/else ธรรมดา เข้าใจง่ายกว่า'
      }
    },

    p23: {
      'hasNoSpace': {
        kind: 'function',
        what: 'ตรวจว่าสตริงไม่มีช่องว่างปนอยู่',
        how: 'ใช้ indexOf หาช่องว่าง ถ้าได้ -1 แปลว่าไม่มี',
        returns: 'true ถ้าไม่มีช่องว่าง · false ถ้ามี',
        eg: 'function hasNoSpace(s) { return s.indexOf(" ") === -1; }\nconsole.log(hasNoSpace("a@b.co"));   // true\nconsole.log(hasNoSpace("a b@c.co"));   // false',
      },
      'checkLocal': {
        kind: 'function',
        what: 'ตรวจข้อความ "ก่อน @" ว่าถูกต้องไหม',
        how: 'ต้องไม่ว่าง และตัวสุดท้ายต้องไม่ใช่จุด',
        returns: 'true ถ้าถูกต้อง · false ถ้าไม่ถูก',
        eg: 'function checkLocal(s) { return s.length > 0 && s.charAt(s.length - 1) !== "."; }\nconsole.log(checkLocal("a"));   // true\nconsole.log(checkLocal(""));   // false\nconsole.log(checkLocal("a."));   // false',
      },
      'checkDomain': {
        kind: 'function',
        what: 'ตรวจข้อความ "หลัง @" ว่าถูกต้องไหม',
        how: 'ต้องไม่ขึ้นต้นด้วยจุด ต้องมีจุดอย่างน้อย 1 จุด และหลังจุดสุดท้ายต้องไม่ว่าง',
        returns: 'true ถ้าถูกต้อง · false ถ้าไม่ถูก',
        eg: 'function checkDomain(s) {\n  if (s.charAt(0) === ".") return false;\n  const dot = s.indexOf(".");\n  if (dot === -1) return false;\n  return s.slice(dot + 1).length > 0;\n}\nconsole.log(checkDomain("b.co"));   // true\nconsole.log(checkDomain(".co"));   // false\nconsole.log(checkDomain("b"));   // false',
        note: 'แยกเป็นฟังก์ชันเพื่อให้ if/else ในตัวหลักสั้นลง และเพิ่มกฎใหม่ได้ง่าย'
      }
    },

    p29: {
      'gcd': {
        kind: 'function',
        what: 'ห.ร.ก. ของ a กับ b',
        how: 'Euclidean algorithm — หมุนคู่ (a, b) เป็น (b, a % b) จน b เป็น 0',
        returns: 'ตัวประกอบร่วมมากที่สุด',
        eg: 'function gcd(a, b) {\n  while (b !== 0) {\n    const rest = a % b;\n    a = b;\n    b = rest;\n  }\n  return a;\n}\nconsole.log(gcd(12, 18));   // 6\nconsole.log(gcd(48, 18));   // 6',
        note: 'ใช้ร่วมกับสูตร ห.ร.ก. = (a * b) หาร gcd(a, b) เพื่อหาห.ร.ม. ทีละคู่'
      }
    },

    p30: {
      'ways': {
        kind: 'function',
        what: 'จำนวนเส้นทางทั้งหมดที่เดินจาก (x, y) ไปถึงปลายทาง',
        how: 'ฐานคืออยู่ที่มุมขวาล่างแล้ว = 1 · นอกกริดหรือช่องที่บล็อก = 0 · ที่อื่นคือผลรวมของทางขวาและทางลง',
        returns: 'จำนวนเส้นทาง (ตัวเลข)',
        eg: 'function ways(x, y) {\n  if (x >= n || y >= n) return 0;\n  if (x === n - 1 && y === n - 1) return 1;\n  return ways(x + 1, y) + ways(x, y + 1);\n}\nconst n = 2;\nconsole.log(ways(0, 0));   // 2',
        note: 'ใช้ memo เก็บคำตอบของช่องที่เคยคำนวณแล้ว จึงไม่ต้องคิดซ้ำ'
      },
      'walk': {
        kind: 'function',
        what: 'เดินทุกเส้นทางโดยไม่จำผลของช่องที่เคยคำนวณ',
        how: 'ทำเหมือน ways แต่ไม่มี memo — จึงเดินช่องกลาง ๆ ซ้ำหลายครั้ง',
        returns: 'จำนวนเส้นทาง (ถูกต้อง แต่ช้า)',
        eg: 'function walk(x, y) {\n  if (x >= n || y >= n) return 0;\n  if (x === n - 1 && y === n - 1) return 1;\n  return walk(x + 1, y) + walk(x, y + 1);\n}\nconst n = 2;\nconsole.log(walk(0, 0));   // 2',
        note: 'มีไว้เป็นบันไดแรกเพื่อ "ดูว่าทำไมช้า" แล้วค่อยเพิ่ม memo ทีหลัง'
      }
    },

    p31: {
      'ways': {
        kind: 'function',
        what: 'จำนวนวิธีแบ่งยอด remaining โดยใช้กลุ่มที่ไม่เกิน maxPart',
        how: 'แบ่งเป็นสองกรณี — ไม่ใช้กลุ่มขนาด maxPart เลย หรือใช้อย่างน้อยหนึ่งครั้ง (หัก maxPart ออกแล้วที่เหลือยังใช้ maxPart ได้)',
        returns: 'จำนวนวิธี (ตัวเลข)',
        eg: 'function ways(x, y) {\n  if (x >= n || y >= n) return 0;\n  if (x === n - 1 && y === n - 1) return 1;\n  return ways(x + 1, y) + ways(x, y + 1);\n}\nconst n = 2;\nconsole.log(ways(0, 0));   // 2',
        note: 'พารากิเมอร์ maxPart คือสิ่งที่ทำให้ "ไม่นับลำดับซ้ำ" — 3+2 กับ 2+3 จะนับเป็นวิธีเดียว'
      }
    },

    p35: {
      'Node': {
        kind: 'class',
        what: 'ช่องหนึ่งช่องของรายการโยง',
        how: 'เก็บ 2 อย่าง: value คือค่าในช่อง · next คือช่องถัดไป (ช่องสุดท้ายเป็น null)',
        returns: 'ช่องใหม่ที่สร้างจาก new Node(ค่า)',
        eg: 'class Node {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\nconst a = new Node(1);\nconsole.log(a.value);   // 1\nconsole.log(a.next);   // null',
        note: 'นี่คือหัวใจของ linked list — ช่องหนึ่งไม่รู้ว่าตัวก่อนหน้าคืออะไร มีแค่ "ถัดไป"'
      },
      'LinkedList': {
        kind: 'class',
        what: 'ตัวห่อรายการโยง มี head ชี้ช่องแรก และ size เก็บจำนวนช่อง',
        how: 'เก็บการกระทำ (เพิ่ม แตก กลับด้าน ต่อท้าย) ไว้ในเมธอด เพื่อไม่ให้โค้ดหลักต้องเดินสายเองทุกครั้ง',
        returns: 'ออบเจกต์รายการที่มี head และ size',
        eg: 'class Node {\n  constructor(v) { this.value = v; this.next = null; }\n}\nclass LinkedList {\n  constructor() { this.head = null; this.size = 0; }\n}\nconst list = new LinkedList();\nconsole.log(list.size);   // 0\nconsole.log(list.head);   // null',
        note: 'แยก "ข้อมูล" (Node) ออกจาก "การกระทำ" (LinkedList) คือหลัก OOP ที่สำคัญ'
      },
      'constructor': {
        kind: 'method',
        what: 'ฟังก์ชันที่ทำงานอัตโนมัติเมื่อใช้ new',
        how: 'คืนค่าเริ่มต้นของออบเจกต์ใหม่ มักใช้ตั้งค่า field ทุกตัวให้พร้อมใช้งาน',
        returns: 'this (ออบเจกต์ที่ถูกสร้าง)',
        eg: 'class Point {\n  constructor(x) { this.x = x; }\n}\nconst p = new Point(3);\nconsole.log(p.x);   // 3',
        note: 'this คือ "ออบเจกต์ตัวที่ถูกเรียก" เสมอ'
      },
      'add': {
        kind: 'method',
        what: 'เพิ่มช่องใหม่ต่อท้ายรายการ',
        how: 'ถ้ายังว่างให้ head ชี้ช่องใหม่ ถ้าไม่ว่างให้เดินหาช่องสุดท้ายแล้วผูกต่อ',
        returns: 'this (เพื่อให้เรียกต่อได้)',
        eg: 'class Node {\n  constructor(v) { this.value = v; this.next = null; }\n}\nclass Bag {\n  constructor() { this.head = null; }\n  add(value) {\n    const node = new Node(value);\n    if (this.head === null) {\n      this.head = node;\n    } else {\n      let tail = this.head;\n      while (tail.next !== null) tail = tail.next;\n      tail.next = node;\n    }\n    return this;\n  }\n}\nconst bag = new Bag();\nbag.add(1);\nbag.add(2);\nconsole.log(bag.head.value);   // 1\nconsole.log(bag.head.next.value);   // 2',
        note: 'ชื่อ add เหมือน Set.add แต่คนละอย่าง — ของ Set เก็บ "ค่า" ส่วนนี่เก็บ "ช่อง" ต่อท้ายสาย'
      },
      'pushBack': {
        kind: 'function',
        what: 'เพิ่มช่องต่อท้าย โดยรับ head มาแล้วคืน head เดิม',
        how: 'ถ้า head เป็น null คืนช่องใหม่เลย ถ้าไม่ใช่ให้เดินหาท้ายแล้วผูก สุดท้ายคืน head',
        returns: 'หัวของรายการ (ช่องแรก)',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction pushBack(head, value) {\n  const node = makeNode(value);\n  if (head === null) return node;\n  let tail = head;\n  while (tail.next !== null) tail = tail.next;\n  tail.next = node;\n  return head;\n}\nlet head = null;\nhead = pushBack(head, 1);\nhead = pushBack(head, 2);\nconsole.log(head.value);   // 1\nconsole.log(head.next.value);   // 2',
        note: 'เป็นแบบที่ไม่ใช้ class — ใช้ object ธรรมดา คือ linked list ที่ถูกต้องเหมือนกัน และ add ต้อง "คืนหัวกลับมา" เพราะตอนแรกรายการยังว่างอยู่'
      },
      'buildList': {
        kind: 'function',
        what: 'สร้างรายการโยงที่เก็บ 1 ถึง n',
        how: 'วนสร้างช่องทีละตัว เก็บหัวไว้ใน head และหาตัวท้ายไว้ใน tail เพื่อผูกได้โดยไม่ต้องเดินใหม่',
        returns: 'หัวของรายการ',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction buildList(n) {\n  let head = null, tail = null;\n  for (let v = 1; v <= n; v++) {\n    const node = makeNode(v);\n    if (head === null) head = node; else tail.next = node;\n    tail = node;\n  }\n  return head;\n}\nconst head = buildList(3);\nconsole.log(String(head.value) + head.next.value + head.next.next.value);   // 123\nconsole.log(head.value + head.next.value + head.next.next.value);   // 6   <- บวกกันเป็นตัวเลข',
        note: 'เก็บ tail ไว้ด้วยจะได้ O(n) แทนที่จะเดินหาท้ายทุกครั้งซึ่งเป็น O(n²)'
      },
      'makeNode': {
        kind: 'function',
        what: 'สร้างช่องใหม่ที่มี value และ next = null',
        how: 'คืน object ที่มี 2 คีย์ คือ value กับ next',
        returns: 'ช่องใหม่',
        eg: 'function makeNode(value) { return { value: value, next: null }; }\nconst n = makeNode(7);\nconsole.log(n.value);   // 7\nconsole.log(n.next);   // null',
        note: 'แบบ object ธรรมดาแทน class — เห็นว่า linked list ไม่จำเป็นต้องใช้ OOP'
      },
      'splitAt': {
        kind: 'function',
        what: 'ตัดรายการหลังจากช่องที่ k',
        how: 'เดินไปหาช่องที่ k (นับจาก 1) เก็บ next ของมันไว้เป็นหัวของสายหลัง แล้วตัดการเชื่อมทิ้ง',
        returns: 'หัวของสายหลัง (หรือ null ถ้าสั้นเกินไป)',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction splitAt(head, k) {\n  let cur = head;\n  for (let i = 1; i < k; i++) cur = cur.next;\n  const rest = cur.next;\n  cur.next = null;\n  return rest;\n}\nconst a = makeNode(1), b = makeNode(2), c = makeNode(3);\na.next = b; b.next = c;\nconst rest = splitAt(a, 2);\nconsole.log(a.value);   // 1\nconsole.log(a.next.value);   // 2\nconsole.log(rest.value);   // 3   <- สายหลังเริ่มที่ช่องที่ 3',
        note: 'สำคัญมาก: ต้องเก็บ next ไว้ก่อน แล้วค่อยตัด ถ้าสลับลำดับข้อมูลจะหาย'
      },
      'appendList': {
        kind: 'function',
        what: 'ต่อหัวของอีกสายเข้าท้ายสายนี้',
        how: 'ถ้าสายที่จะต่อว่างอยู่ก็ไม่ต้องทำอะไร มิฉะนั้นเดินหาท้ายของสายนี้แล้วชี้ next ไปที่หัวของอีกสาย',
        returns: 'ไม่คืนค่า',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction appendList(head, other) {\n  if (other === null) return;\n  let tail = head;\n  while (tail.next !== null) tail = tail.next;\n  tail.next = other;\n}\nconst a = makeNode(1), b = makeNode(2), c = makeNode(3);\na.next = b;\nappendList(a, c);\nconsole.log(a.next.next.value);   // 3',
      },
      'reverse': {
        kind: 'function',
        what: 'กลับด้านรายการโยงทั้งสาย',
        how: 'เก็บ next เดิมไว้ก่อน แล้วชี้ next ปัจจุบันไปที่ตัวก่อนหน้า แล้วเลื่อนทั้งสองตัวไปข้างหน้า',
        returns: 'หัวใหม่ของสายที่กลับแล้ว',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction reverse(head) {\n  let prev = null, cur = head;\n  while (cur !== null) {\n    const saved = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = saved;\n  }\n  return prev;\n}\nconst a = makeNode(1), b = makeNode(2);\na.next = b;\nconst r = reverse(a);\nconsole.log(r.value);   // 2\nconsole.log(r.next.value);   // 1',
        note: 'ใช้ prev = null เป็นจุดเริ่มต้น เพราะหัวเดิมต้องกลายเป็นหางของสายใหม่'
      },
      'reverseRest': {
        kind: 'method',
        what: 'กลับด้านสายหลัง แล้วคืนหัวใหม่',
        how: 'เหมือนฟังก์ชัน reverse แต่อยู่ในคลาสและคืนหัวใหม่ให้ผู้เรียก',
        returns: 'หัวของสายที่กลับด้านแล้ว',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction reverseRest(head) {\n  let prev = null, cur = head;\n  while (cur !== null) {\n    const saved = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = saved;\n  }\n  return prev;\n}\nconst a = makeNode(4), b = makeNode(5);\na.next = b;\nconst r = reverseRest(a);\nconsole.log(r.value);   // 5\nconsole.log(r.next.value);   // 4',
        note: 'ต้อง "เก็บค่า next เดิมไว้ก่อน" แล้วค่อยทับ มิฉะนั้นสายจะขาด'
      },
      'concat': {
        kind: 'function',
        what: 'ต่อสายที่สองเข้าท้ายสายแรก',
        how: 'เดินหาท้ายของสายแรก แล้วชี้ next ไปที่หัวของสายที่สอง',
        returns: 'หัวของสายแรก',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction concat(head, other) {\n  if (other === null) return head;\n  let tail = head;\n  while (tail.next !== null) tail = tail.next;\n  tail.next = other;\n  return head;\n}\nconst a = makeNode(1), b = makeNode(2);\nconsole.log(concat(a, b).next.value);   // 2',
        note: 'ถ้าสายที่สองเป็น null ต้องไม่ทำอะไร ไม่งั้น head จะกลายเป็น null'
      },
      'toText': {
        kind: 'function',
        what: 'อ่านค่าทุกช่องตามลำดับ แล้วต่อเป็นสตริงเดียว',
        how: 'เดินจากหัวไปหาง ต่อ String(cur.value) ทีละช่อง แล้ว join เป็นข้อความเดียว',
        returns: 'สตริงที่รวมค่าทั้งหมด',
        eg: 'function makeNode(v) { return { value: v, next: null }; }\nfunction toText(head) {\n  let out = "", cur = head;\n  while (cur !== null) { out = out + cur.value; cur = cur.next; }\n  return out;\n}\nconst a = makeNode(1), b = makeNode(2);\na.next = b;\nconsole.log(toText(a));   // 12',
        note: 'ต้อง String() ก่อนต่อ เพราะการบวกสตริงกับตัวเลขจะเอาไปบวกกัน'
      },
      'toString': {
        kind: 'method',
        what: 'แปลงรายการเป็นสตริง (ชื่อมาตรฐานของ JavaScript)',
        how: 'เดินสายแล้วเก็บ String(cur.value) ทุกช่อง มา join(ตัวคั่น)',
        returns: 'สตริง',
        eg: 'class LinkedList {\n  constructor() { this.head = null; }\n  toString() { return String(this.head); }\n}\nconst list = new LinkedList();\nlist.head = 12;\nconsole.log(list.toString());   // 12\nconsole.log(String(list));   // { head: 12 }   <- ต้องเรียก toString() เอง',
        note: 'ชื่อนี้เป็นของ JavaScript เอง — เว็บนี้ต้องเรียก list.toString() ตรง ๆ เท่านั้น\nถ้าสังเกตว่าในเฉลยมี console.log(list.toString()) แทน console.log(list) เหตุผลคือเครื่องแปลงข้อความอัตโนมัติของเว็บนี้ยังไม่เรียก toString ให้'
      },
      'head': {
        kind: 'field',
        what: 'ตัวชี้ของช่องแรกในรายการ',
        how: 'ถ้ายังไม่มีช่อง จะเป็น null',
        returns: 'ช่องแรก หรือ null',
        eg: 'const list = { head: null, size: 0 };\nconsole.log(list.head);   // null\nconsole.log(list.head === null);   // true',
        note: 'ข้อนี้ต้องตรวจก่อนเดินสายเสมอ ไม่งั้นจะพัง'
      },
      'next': {
        kind: 'field',
        what: 'ตัวชี้ของช่องถัดไป',
        how: 'ช่องสุดท้ายเก็บ null ไว้เป็นจุดจบของสาย',
        returns: 'ช่องถัดไป หรือ null',
        eg: 'const a = { value: 1, next: null };\nconsole.log(a.next);   // null\nlet count = 0, cur = a;\nwhile (cur !== null) { count++; cur = cur.next; }\nconsole.log(count);   // 1',
        note: 'null คือ "จุดสิ้นสุดของรายการ" — ทุกลูปที่เดินสายต้องเช็คเงื่อนไขนี้'
      },
      'size': {
        kind: 'field',
        what: 'จำนวนช่องทั้งหมดในรายการ',
        how: 'นับเพิ่มทีละครั้งที่ add และปรับตอน splitAt',
        returns: 'ตัวเลข',
        eg: 'const list = { head: null, size: 0 };\nlist.size = 3;\nconsole.log(list.size);   // 3',
        note: 'เก็บไว้เพื่อไม่ต้องเดินนับใหม่ทุกครั้ง'
      },
      'value': {
        kind: 'field',
        what: 'ค่าที่เก็บอยู่ในช่องนั้น',
        how: 'เก็บตัวเลขหรือข้อความก็ได้ ไม่เกี่ยวกับการเชื่อมโยง',
        returns: 'ค่าที่ใส่เข้ามา',
        eg: 'const a = { value: 1, next: null };\nconsole.log(a.value);   // 1',
        note: 'value คือ "ข้อมูล" · next คือ "การเชื่อมโยง" — สองอย่างนี้แยกกันคือหัวใจของ linked list'
      }
    }
  }
  ,
  map: {
  'p1': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'นับใน object แล้วหว่านหา',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Number',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            21
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Number': [],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับด้วย Map',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Map.get',
          'Map.set',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            19
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Map.get': [
            8
          ],
          'Map.set': [
            8
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงลำดับแล้วนับทีละกลุ่ม',
        'recommended': false,
        'terms': [
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            6
          ],
          'Array.sort': [
            6
          ],
          'console.log': [
            23
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p2': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนซ้อนสองชั้น',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            13
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงราคาแล้วเดินด้วย pointer',
        'recommended': false,
        'terms': [
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            6,
            7
          ],
          'Array.sort': [
            6,
            7
          ],
          'console.log': [
            21
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11,
            12
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'สร้างรายการคู่ทั้งหมดแล้วหาค่ามากสุด',
        'recommended': false,
        'terms': [
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Math.max',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            9
          ],
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            12
          ],
          'Math.max': [
            12
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p3': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนทุกเลขแล้วตรวจรากที่สอง',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.floor',
          'Math.sqrt',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.floor': [
            9
          ],
          'Math.sqrt': [
            9
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับย้อนจากรากที่สอง',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            11
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'สร้างชุดของกำลังสองสมบูรณ์แล้วนับที่อยู่ในช่วง',
        'recommended': false,
        'terms': [
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            8
          ],
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p4': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ห.ร.ม. ของ A + ห.ร.ก. ของ B',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            27
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'gcd'
        ],
        'helperLines': {
          'gcd': []
        }
      },
      {
        'name': 'เดินทีละตัวคูณของ ห.ร.ม.',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            33
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'gcd'
        ],
        'helperLines': {
          'gcd': []
        }
      },
      {
        'name': 'ลองทุกตัวเลขตั้งแต่ 1',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            27
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p5': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนทีละช่วงตามคำขอ',
        'recommended': true,
        'terms': [
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'JSON.stringify',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            12
          ],
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'JSON.stringify': [
            14
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ slice แล้วหาค่าต่ำสุด',
        'recommended': false,
        'terms': [
          'Array.map',
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'JSON.stringify',
          'Math.min',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.map': [
            6
          ],
          'Array.slice': [
            7
          ],
          'console.log': [
            10
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'JSON.stringify': [
            10
          ],
          'Math.min': [
            8
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p6': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วันซ้อนสองชั้น ลองทุกคู่',
        'recommended': true,
        'terms': [
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'JSON.stringify',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            11
          ],
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'JSON.stringify': [
            14
          ],
          'length': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'สร้างตารางผกผันแล้วใช้ซ้ำ',
        'recommended': false,
        'terms': [
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'JSON.stringify',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            16
          ],
          'console.log': [
            18
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'JSON.stringify': [
            18
          ],
          'length': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p7': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'นับทีละเดือน',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String',
          'String.padStart',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            10,
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String': [],
          'String.padStart': [
            28,
            29
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ตารางผสสมวัน',
        'recommended': false,
        'terms': [
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String',
          'String.padStart',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            20
          ],
          'console.log': [
            9,
            29
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            20
          ],
          'require': [],
          'String': [],
          'String.padStart': [
            27,
            28
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p8': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนทุกช่วงที่เป็นไปได้',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'prefix sum แล้วเทียบค่า',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            20
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11,
            13,
            16
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'sliding window',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            17
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            12
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p9': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนด้วย for...of แล้วบวกสะสม',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            10
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ reduce',
        'recommended': false,
        'terms': [
          'Array.reduce',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.reduce': [
            7
          ],
          'console.log': [
            8
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'วนด้วย while และใช้ตัวชี้',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            8
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p10': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'นับใน loop',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'filter แล้วนับความยาว',
        'recommended': false,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            7
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'reduce นับ',
        'recommended': false,
        'terms': [
          'Array.reduce',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.reduce': [
            6
          ],
          'console.log': [
            10
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p11': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนเทียบเอง',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ Math.min',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.min',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            8
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.min': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงแล้วอ่านตัวแรก',
        'recommended': false,
        'terms': [
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            6
          ],
          'Array.sort': [
            6
          ],
          'console.log': [
            7
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p12': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'trim + split + filter',
        'recommended': true,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.split',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            7
          ],
          'console.log': [
            8
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7,
            8
          ],
          'require': [],
          'String.split': [
            7
          ],
          'String.trim': [
            2,
            7
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับจุดที่เริ่มคำใหม่',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับรอยตัดระหว่างคำ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            9,
            17
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            8,
            12
          ],
          'require': [],
          'String.charAt': [
            13
          ],
          'String.trim': [
            2,
            7
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p13': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'split แล้ววนทีละคำ',
        'recommended': true,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toUpperCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6
          ],
          'require': [],
          'String.charAt': [
            10
          ],
          'String.split': [
            6
          ],
          'String.toUpperCase': [
            10
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'map แล้ว join',
        'recommended': false,
        'terms': [
          'Array.filter',
          'Array.join',
          'Array.map',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toUpperCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'Array.join': [
            8
          ],
          'Array.map': [
            7
          ],
          'console.log': [
            8
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6
          ],
          'require': [],
          'String.charAt': [
            7
          ],
          'String.split': [
            6
          ],
          'String.toUpperCase': [
            7
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เดินด้วยตัวชี้ ไม่ต้องแยกคำ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.toUpperCase',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.charAt': [
            8,
            9,
            11
          ],
          'String.toUpperCase': [
            11
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p14': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'หารด้วยสูตร',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.floor',
          'require',
          'String',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            13
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.floor': [
            6,
            7
          ],
          'require': [],
          'String': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'pad'
        ],
        'helperLines': {
          'pad': []
        }
      },
      {
        'name': 'หักลบทีละหน่วย',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'pad'
        ],
        'helperLines': {
          'pad': []
        }
      },
      {
        'name': 'ใช้ padStart',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.floor',
          'require',
          'String',
          'String.padStart',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            11
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.floor': [
            6,
            7
          ],
          'require': [],
          'String': [],
          'String.padStart': [
            11
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p15': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'เทียบสองปลาย',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Math.floor',
          'require',
          'String.charAt',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9,
            11
          ],
          'Math.floor': [
            9
          ],
          'require': [],
          'String.charAt': [
            11
          ],
          'String.toLowerCase': [
            6
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'กลับด้านแล้วเทียบ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            13
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9
          ],
          'require': [],
          'String.charAt': [
            10
          ],
          'String.toLowerCase': [
            6
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เทียบครึ่งหนึ่งกับอีกครึ่งหนึ่ง',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Math.floor',
          'require',
          'String.charAt',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7,
            11
          ],
          'Math.floor': [
            7
          ],
          'require': [],
          'String.charAt': [
            11
          ],
          'String.toLowerCase': [
            6
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p16': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ใช้ Set แล้วไล่หา',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'Set.add',
          'Set.has',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            18
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            12
          ],
          'require': [],
          'Set.add': [
            8
          ],
          'Set.has': [
            13
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ผลรวม',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เทียบกับตำแหน่งในอาเรย์',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            8
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p17': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'นับคนที่ได้คะแนนมากกว่า',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            25
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงแล้วหาตำแหน่งแรกที่คะแนนเท่ากัน',
        'recommended': false,
        'terms': [
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            15
          ],
          'Array.sort': [
            15
          ],
          'console.log': [
            24
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            18
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับทีละชั้นคะแนน',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            26
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p18': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'นับให้ครบ แล้วค่อยเลือก',
        'recommended': true,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            36
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            23
          ],
          'require': [],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            11,
            19,
            31
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ Map เก็บความถี่',
        'recommended': false,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Map.get',
          'Map.set',
          'require',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            17
          ],
          'Map.get': [
            11
          ],
          'Map.set': [
            11
          ],
          'require': [],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            10,
            25
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ตัดสินใต้ระหว่างนับ',
        'recommended': false,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            17
          ],
          'require': [],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            12,
            25
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p19': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนแล้วรวมทีละกะ',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.floor',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            11
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.floor': [
            9
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'map ความยาวแล้วรวม',
        'recommended': false,
        'terms': [
          'Array.map',
          'Array.reduce',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.floor',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.map': [
            7
          ],
          'Array.reduce': [
            10
          ],
          'console.log': [
            10
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.floor': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'หักทีละ 8 ชั่วโมงในแต่ละกะ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p20': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'เก็บใน Set แล้วเช็คทีละตัว',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'Set.add',
          'Set.has',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            17
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'Set.add': [
            8
          ],
          'Set.has': [
            13
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'วนซ้อนสองชั้น',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงแล้วเดินด้วยสอง pointer',
        'recommended': false,
        'terms': [
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            6
          ],
          'Array.sort': [
            6
          ],
          'console.log': [
            24
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            10
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p21': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'map แล้ว join',
        'recommended': true,
        'terms': [
          'Array.join',
          'Array.map',
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.toUpperCase',
          'String.trim'
        ],
        'lines': {
          'Array.join': [
            13
          ],
          'Array.map': [
            8
          ],
          'Array.slice': [
            10
          ],
          'console.log': [
            13
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.charAt': [
            10
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            9
          ],
          'String.toUpperCase': [
            10
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'วนแล้วต่อสตริงทีละคำ',
        'recommended': false,
        'terms': [
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.toUpperCase',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            11
          ],
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9
          ],
          'require': [],
          'String.charAt': [
            11
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            10
          ],
          'String.toUpperCase': [
            11
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เดินด้วยตัวชี้ ไม่ต้องแยกคำ',
        'recommended': false,
        'terms': [
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.toLowerCase',
          'String.toUpperCase',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            17,
            18
          ],
          'console.log': [
            22
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            8,
            15
          ],
          'require': [],
          'String.charAt': [
            9,
            15,
            18
          ],
          'String.toLowerCase': [
            17
          ],
          'String.toUpperCase': [
            18
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p22': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'filter แล้วนับความยาว',
        'recommended': true,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6,
            9
          ],
          'console.log': [
            10
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            10
          ],
          'require': [],
          'String.charAt': [
            9
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            7,
            9
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'วนแล้วนับ',
        'recommended': false,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6
          ],
          'require': [],
          'String.charAt': [
            11
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            7,
            11
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับจุดที่ขึ้นต้นคำ ไม่ต้องแยกคำ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            19
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.toLowerCase': [
            6,
            15
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p23': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ใช้ indexOf / lastIndexOf / slice',
        'recommended': true,
        'terms': [
          'Array.indexOf',
          'Array.lastIndexOf',
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'Array.indexOf': [
            6,
            11,
            15
          ],
          'Array.lastIndexOf': [
            10
          ],
          'Array.slice': [
            13,
            14,
            21
          ],
          'console.log': [
            23
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            17,
            18,
            21
          ],
          'require': [],
          'String.charAt': [
            18,
            19
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'แยกเป็นฟังก์ชันตรวจทีละข้อ',
        'recommended': false,
        'terms': [
          'Array.indexOf',
          'Array.lastIndexOf',
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'Array.indexOf': [
            7,
            16,
            21
          ],
          'Array.lastIndexOf': [
            23
          ],
          'Array.slice': [
            18,
            24
          ],
          'console.log': [
            26
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11,
            18
          ],
          'require': [],
          'String.charAt': [
            11,
            15
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'checkDomain',
          'checkLocal',
          'hasNoSpace'
        ],
        'helperLines': {
          'checkDomain': [],
          'checkLocal': [],
          'hasNoSpace': []
        }
      },
      {
        'name': 'นับ @ และ . ด้วยการวนสตริง',
        'recommended': false,
        'terms': [
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            21
          ],
          'console.log': [
            28
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            10,
            22,
            26
          ],
          'require': [],
          'String.charAt': [
            11,
            22
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p24': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ตารางคู่ตรงข้าม',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11
          ],
          'require': [],
          'String.charAt': [
            12
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เขียนเงื่อนไขตรง ๆ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            15
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.charAt': [
            8,
            9
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เทียบเป็นคู่ด้วย charAt',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.charAt': [
            8,
            9
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p25': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'Set แล้วกระจายออกมา',
        'recommended': true,
        'terms': [
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.sort': [
            10
          ],
          'console.log': [
            12
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ Set เป็นที่เก็บ แล้วดูค่าที่เก็บได้',
        'recommended': false,
        'terms': [
          'Array.push',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'Set.add',
          'Set.has',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            11
          ],
          'Array.sort': [
            15
          ],
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'Set.add': [
            10
          ],
          'Set.has': [
            9
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงก่อน แล้วเก็บเฉพาะตัวที่ต่างจากตัวก่อน',
        'recommended': false,
        'terms': [
          'Array.push',
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.push': [
            11
          ],
          'Array.slice': [
            6
          ],
          'Array.sort': [
            6
          ],
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p26': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนซ้อนสองชั้น',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            20
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            10,
            11
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้ Map เก็บค่าที่เจอแล้ว',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Map.has',
          'Map.set',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            22
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Map.has': [
            13
          ],
          'Map.set': [
            20
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เรียงแล้วเดินด้วยสอง pointer',
        'recommended': false,
        'terms': [
          'Array.slice',
          'Array.sort',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            6
          ],
          'Array.sort': [
            6
          ],
          'console.log': [
            27
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            11
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p27': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'charCodeAt + เก็บเป็นสตริง',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Math.floor',
          'require',
          'String',
          'String.charCodeAt',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            26
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9,
            10
          ],
          'Math.floor': [
            21
          ],
          'require': [],
          'String': [],
          'String.charCodeAt': [
            16,
            17
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'Number() + เก็บเป็นสตริง',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Math.floor',
          'Number',
          'require',
          'String',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            25
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9,
            10
          ],
          'Math.floor': [
            20
          ],
          'Number': [],
          'require': [],
          'String': [],
          'String.charAt': [
            15,
            16
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'Number() + เก็บเป็นอาเรย์แล้วกลับด้าน',
        'recommended': false,
        'terms': [
          'Array.join',
          'Array.push',
          'Array.reverse',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'Math.floor',
          'Number',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'Array.join': [
            27
          ],
          'Array.push': [
            19
          ],
          'Array.reverse': [
            26
          ],
          'console.log': [
            27
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            9,
            10
          ],
          'Math.floor': [
            20
          ],
          'Number': [],
          'require': [],
          'String.charAt': [
            15,
            16
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p28': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ใช้ array เป็นสแต็ก',
        'recommended': true,
        'terms': [
          'Array.pop',
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.pop': [
            19
          ],
          'Array.push': [
            13
          ],
          'console.log': [
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            15,
            28
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ใช้สตริงเป็นสแต็ก',
        'recommended': false,
        'terms': [
          'Array.slice',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.trim'
        ],
        'lines': {
          'Array.slice': [
            23
          ],
          'console.log': [
            28
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            14,
            18,
            23,
            27
          ],
          'require': [],
          'String.charAt': [
            18
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'เก็บเป็นอาเรย์ + ตัวชี้',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            29
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p29': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'gcd แบบเรียกซ้ำ + สูตร ห.ร.ก.',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'gcd'
        ],
        'helperLines': {
          'gcd': []
        }
      },
      {
        'name': 'gcd แบบวนลูป',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            19
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'gcd'
        ],
        'helperLines': {
          'gcd': []
        }
      },
      {
        'name': 'ไล่หาตัวคูณที่น้อยที่สุด',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            18
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            8
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p30': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ฟังก์ชันเรียกซ้ำ + จำคำตอบ',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Map.get',
          'Map.has',
          'Map.set',
          'require',
          'Set.add',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Map.get': [
            18
          ],
          'Map.has': [
            18,
            22
          ],
          'Map.set': [
            26
          ],
          'require': [],
          'Set.add': [
            11
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'ways'
        ],
        'helperLines': {
          'ways': []
        }
      },
      {
        'name': 'ตารางคำนวณแบบวนลูป',
        'recommended': false,
        'terms': [
          'Array.fill',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'Set.add',
          'Set.has',
          'String.trim'
        ],
        'lines': {
          'Array.fill': [
            14
          ],
          'console.log': [
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'Set.add': [
            11
          ],
          'Set.has': [
            18
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'นับทุกเส้นทางแยก (ยังไม่จำผลซ้ำ)',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'Set.add',
          'Set.has',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            21
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'Set.add': [
            10
          ],
          'Set.has': [
            16
          ],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'walk'
        ],
        'helperLines': {
          'walk': []
        }
      }
    ]
  },
  'p31': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'ตารางจำยอด วนค่าขึ้น',
        'recommended': true,
        'terms': [
          'Array.fill',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.fill': [
            9
          ],
          'console.log': [
            19
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ฟังก์ชันเรียกซ้ำ + จำคำตอบ',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Map.get',
          'Map.has',
          'Map.set',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            27
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Map.get': [
            16
          ],
          'Map.has': [
            16
          ],
          'Map.set': [
            23
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'ways'
        ],
        'helperLines': {
          'ways': []
        }
      },
      {
        'name': 'เรียกซ้ำโดยไม่จำผล',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            14
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'ways'
        ],
        'helperLines': {
          'ways': []
        }
      }
    ]
  },
  'p32': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'วนแล้วเทียบความยาว',
        'recommended': true,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            18
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            12
          ],
          'require': [],
          'String.charAt': [
            11
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            7,
            11
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'filter แล้ว reduce',
        'recommended': false,
        'terms': [
          'Array.filter',
          'Array.reduce',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6,
            9
          ],
          'Array.reduce': [
            15
          ],
          'console.log': [
            12,
            16
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            11,
            15
          ],
          'require': [],
          'String.charAt': [
            9
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            7,
            9
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'วนสองรอบ: หาความยาว แล้วค่อยหาคำ',
        'recommended': false,
        'terms': [
          'Array.filter',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.charAt',
          'String.split',
          'String.toLowerCase',
          'String.trim'
        ],
        'lines': {
          'Array.filter': [
            6
          ],
          'console.log': [
            18,
            28
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            6,
            12,
            13,
            23
          ],
          'require': [],
          'String.charAt': [
            12,
            23
          ],
          'String.split': [
            6
          ],
          'String.toLowerCase': [
            7,
            12,
            23
          ],
          'String.trim': [
            2,
            6
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p33': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'pointer สองตัวเดินเข้าหากัน',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            28
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            10
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ทำตารางเสาสูงสุดสองฝั่งก่อน',
        'recommended': false,
        'terms': [
          'Array.fill',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.fill': [
            10,
            17
          ],
          'console.log': [
            30
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'วิ่งหาสูงสุดของแต่ละช่อง (ตรงตามนิยามที่สุด)',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            26
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            7
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p34': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'sliding window',
        'recommended': true,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            21
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            13
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'prefix sum',
        'recommended': false,
        'terms': [
          'Array.fill',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'Array.fill': [
            10
          ],
          'console.log': [
            23
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            10,
            11,
            16,
            17
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      },
      {
        'name': 'ลองทุกกลุ่มที่เป็นไปได้',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'length',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            18
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'length': [
            10,
            12
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [],
        'helperLines': {}
      }
    ]
  },
  'p35': {
    'starter': [
      'fs.readFileSync',
      'JSON.parse',
      'require',
      'String.trim'
    ],
    'solutions': [
      {
        'name': 'class Node + class LinkedList',
        'recommended': true,
        'terms': [
          'Array.join',
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.ceil',
          'require',
          'String',
          'String.trim'
        ],
        'lines': {
          'Array.join': [
            71
          ],
          'Array.push': [
            68
          ],
          'console.log': [
            85
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.ceil': [
            79
          ],
          'require': [],
          'String': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'add',
          'appendList',
          'constructor',
          'head',
          'LinkedList',
          'next',
          'Node',
          'reverseRest',
          'size',
          'splitAt',
          'toString',
          'value'
        ],
        'helperLines': {
          'add': [
            76
          ],
          'appendList': [
            83
          ],
          'constructor': [],
          'head': [
            15,
            21,
            22,
            25,
            35
          ],
          'LinkedList': [],
          'next': [
            9,
            26,
            27,
            36,
            37
          ],
          'Node': [],
          'reverseRest': [
            82
          ],
          'size': [
            16,
            29,
            39
          ],
          'splitAt': [
            80
          ],
          'toString': [
            85
          ],
          'value': [
            8,
            68
          ]
        }
      },
      {
        'name': 'object ธรรมดา + ฟังก์ชันคุมการเดิน',
        'recommended': false,
        'terms': [
          'Array.join',
          'Array.push',
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.ceil',
          'require',
          'String',
          'String.trim'
        ],
        'lines': {
          'Array.join': [
            55
          ],
          'Array.push': [
            52
          ],
          'console.log': [
            65
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.ceil': [
            61
          ],
          'require': [],
          'String': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'concat',
          'makeNode',
          'pushBack',
          'reverse',
          'splitAt',
          'toText'
        ],
        'helperLines': {
          'concat': [],
          'makeNode': [],
          'pushBack': [],
          'reverse': [],
          'splitAt': [],
          'toText': []
        }
      },
      {
        'name': 'class Node อย่างเดียว + logic เป็นฟังก์ชัน',
        'recommended': false,
        'terms': [
          'console.log',
          'fs.readFileSync',
          'JSON.parse',
          'Math.ceil',
          'require',
          'String.trim'
        ],
        'lines': {
          'console.log': [
            63
          ],
          'fs.readFileSync': [
            2
          ],
          'JSON.parse': [
            3
          ],
          'Math.ceil': [
            56
          ],
          'require': [],
          'String.trim': [
            2
          ]
        },
        'helpers': [
          'buildList',
          'constructor',
          'next',
          'Node',
          'reverse',
          'splitAt',
          'toText',
          'value'
        ],
        'helperLines': {
          'buildList': [],
          'constructor': [],
          'next': [
            9,
            19,
            27,
            28,
            29
          ],
          'Node': [],
          'reverse': [],
          'splitAt': [],
          'toText': [],
          'value': [
            8,
            49
          ]
        }
      }
    ]
  }
}
};
