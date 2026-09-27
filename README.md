# Code Practice — ฝึกเขียนโค้ด JavaScript แบบ HackerRank

เว็บสำหรับฝึกเขียนโค้ด 8 โจทย์ รันและตรวจ Test Case ในเบราว์เซอร์
ไม่ต้องติดตั้ง Node.js หรือ Python ไม่ต้องต่อเน็ตไปหาเซิร์ฟเวอร์รันโค้ด

## เปิดใช้งาน

เข้า `index.html` เพื่อเลือกโจทย์ หรือกดลิงก์ตรง ๆ ได้เลย

## วิธีเขียน (เหมือนกันทุกโจทย์)

ระบบเตรียมส่วนที่ต้องรับ input ให้แล้ว เขียนแค่ส่วนที่เหลือ:

```javascript
const fs = require('fs');
const rawInput = fs.readFileSync(0, 'utf-8').trim();
const birds = JSON.parse(rawInput);

// เขียนโค้ดตรงนี้ แล้วสั่งพิมพ์คำตอบออกมาด้วย console.log
console.log(คำตอบ);
```

- ระบบส่ง Test Case เข้า `stdin` ให้อัตโนมัติ
- ตรวจผลจากสิ่งที่ `console.log` พิมพ์ออกมา
- ชื่อตัวแปรหลัง `JSON.parse` ต่างกันตามโจทย์ (`birds`, `shop`, `houses`, `groups`, `road`, `perm`, `info`, `chocolate`) ให้ดูตัวอย่างในแต่ละหน้า

## ปุ่มในหน้า

| ปุ่ม | ทำอะไร |
|---|---|
| Run Sample | รัน Test Case ตัวอย่างเดียว แสดงผลลัพธ์ดิบ |
| Submit | ตรวจทุก Test Case พร้อมให้คะแนน |
| Debug | เดินทีละบรรทัด ดูค่าตัวแปร และ call stack |
| รีเซ็ต | คืนโค้ดเป็นโค้ดเริ่มต้น |
| ส่งออก / นำเข้า | เก็บงานทั้งหมดเป็นไฟล์ `.json` ไว้สำรอง |

## งานที่เขียนไว้จะไม่หาย

ทุกครั้งที่พิมพ์ ระบบจะบันทึกโค้ดไว้ในเครื่องของผู้ใช้เอง (localStorage)
กลับมาเปิดโจทย์เดิมก็จะกลับไปต่อที่เขียนค้างไว้ พร้อมหัวข้อบนการ์ดว่าโจทย์ไหนยังมีงานค้าง

> ข้อมูลนี้ผูกกับเบราว์เซอร์และเครื่องนั้น ๆ ถ้าเปลี่ยนเครื่องหรือล้างข้อมูลเว็บไซต์
> ให้กด **ส่งออก** เก็บเป็นไฟล์ `.json` ไว้สำรอง

## ข้อจำกัด

รันได้เฉพาะ JavaScript (ES2020 ประมาณนั้น) เพราะมี interpreter ที่เขียนขึ้นเอง
รองรับตัวแปร, ฟังก์ชัน, arrow function, if/else, for, for-of, for-in, while, do-while,
switch, try/catch, spread, destructuring, template literal, optional chaining,
ternary, Map, Set และอื่น ๆ

ถ้าเปิดไฟล์ตรง ๆ โดยไม่ผ่านเว็บเซิร์ฟเวอร์ (ดับเบิลคู่คลิก `index.html`)
ระบบจะบันทึกงานไม่ได้ เพราะเบราว์เซอร์ไม่อนุญาตในโหมดนั้น — ต้องเข้าผ่าน URL ของเว็บ

## ไฟล์ในโปรเจกต์

```
index.html        หน้าแรก รายการโจทย์ 8 ข้อ
editor.html       หน้าเขียนโค้ด
js/interpreter.js ตัวแปล JavaScript เขียนเอง (tokenizer + parser + ตัวรัน)
js/editor.js      code editor เขียนเอง (ไฮไลต์ไวยากรณ์ เลขบรรทัด เติมวงเล็บ ฯลฯ)
js/app.js         เชื่อม editor + interpreter + debugger
js/theme.css      ระบบดีไซน์
problems/problems.js  ข้อมูลโจทย์ ตัวอย่าง และ Test Case ทั้งหมด
```
