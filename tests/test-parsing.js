/* eslint-disable @typescript-eslint/no-require-imports */
// Quick test script to verify our parsing/normalization logic works exactly as expected
const assert = require('assert');

// 1. Let's test robust date parsing logic
const parseExcelDate = (dateVal) => {
  if (!dateVal) return "";

  if (typeof dateVal === "number") {
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
  }

  const dateStr = String(dateVal).trim();

  // Robustly parse DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // 0-based
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // invalid date
  }

  return dateStr;
};

// Tests
console.log("Running parseExcelDate tests...");
assert.strictEqual(parseExcelDate("2010-05-15"), "2010-05-15");
assert.strictEqual(parseExcelDate("15/05/2010"), "2010-05-15");
assert.strictEqual(parseExcelDate("15-05-2010"), "2010-05-15");
assert.strictEqual(parseExcelDate("5/8/2011"), "2011-08-05");
assert.strictEqual(parseExcelDate(40313), "2010-05-15"); // Excel serial for 15/05/2010
console.log("parseExcelDate tests passed!");

// 2. Let's test gender mapping logic
const mapGender = (rawGender) => {
  const cleanGender = String(rawGender || "").trim().toUpperCase();
  if (cleanGender.startsWith("P") || cleanGender.startsWith("F")) {
    return "FEMALE";
  } else if (cleanGender.startsWith("L") || cleanGender.startsWith("M")) {
    return "MALE";
  }
  return "MALE";
};

console.log("Running mapGender tests...");
assert.strictEqual(mapGender("P"), "FEMALE");
assert.strictEqual(mapGender("perempuan"), "FEMALE");
assert.strictEqual(mapGender("Perempuan"), "FEMALE");
assert.strictEqual(mapGender("L"), "MALE");
assert.strictEqual(mapGender("laki-laki"), "MALE");
assert.strictEqual(mapGender("Laki-Laki"), "MALE");
assert.strictEqual(mapGender("Male"), "MALE");
assert.strictEqual(mapGender("Female"), "FEMALE");
console.log("mapGender tests passed!");

// 3. Let's test email normalization
const validateEmail = (email) => {
  const rawEmail = String(email || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(rawEmail) ? rawEmail : "";
};

console.log("Running validateEmail tests...");
assert.strictEqual(validateEmail("siswa@example.com"), "siswa@example.com");
assert.strictEqual(validateEmail("   siswa@example.com   "), "siswa@example.com");
assert.strictEqual(validateEmail("invalid-email"), "");
assert.strictEqual(validateEmail(""), "");
assert.strictEqual(validateEmail(null), "");
console.log("validateEmail tests passed!");

console.log("\nALL UNIT TESTS PASSED SUCCESSFULLY!");
