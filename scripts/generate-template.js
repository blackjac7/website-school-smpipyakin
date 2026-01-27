/* eslint-disable @typescript-eslint/no-require-imports */
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const data = [
  {
    No: 1,
    Nama: "Contoh Siswa",
    NISN: "0012345678",
    Kelas: "VII A",
    Gender: "L",
    "Tanggal Lahir": "2010-05-15",
    Email: "siswa@example.com",
    "No. HP": "081234567890",
  },
  {
    No: 2,
    Nama: "Siswa Kedua",
    NISN: "0087654321",
    Kelas: "VII B",
    Gender: "P",
    "Tanggal Lahir": "2011-08-20",
    Email: "siswa2@example.com",
    "No. HP": "081234567891",
  },
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

// Ensure public/assets exists
const dir = path.join(__dirname, "../public/assets");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const filePath = path.join(dir, "template-siswa.xlsx");
XLSX.writeFile(workbook, filePath);

console.log(`Template created at ${filePath}`);
