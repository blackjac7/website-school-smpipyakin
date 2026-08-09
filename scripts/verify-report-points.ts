import { calculateLatenessPoints } from "../src/lib/latenessPoints";
import { calculateAttributePoints } from "../src/lib/attributePoints";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAILED:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

console.log("Running report point checks...");

const T = 3;
const P = 2;

assert(calculateLatenessPoints(0, T, P) === 0, "0x = 0 poin");
assert(
  calculateLatenessPoints(2, T, P) === 0,
  "2x = 0 poin (belum capai threshold)",
);
assert(calculateLatenessPoints(3, T, P) === 2, "3x = 2 poin");
assert(calculateLatenessPoints(4, T, P) === 2, "4x = 2 poin");
assert(calculateLatenessPoints(6, T, P) === 4, "6x = 4 poin");
assert(calculateLatenessPoints(11, T, P) === 6, "11x = 6 poin");

// Kasus yang dijelaskan di spec: poin periode TIDAK dapat dijumlahkan.
// 2x Agustus + 2x September = 0 + 0 poin per periode,
// padahal lifetime 4x = 2 poin. Sisa pembagian hilang tiap pemotongan.
const agustus = calculateLatenessPoints(2, T, P);
const september = calculateLatenessPoints(2, T, P);
const lifetime = calculateLatenessPoints(4, T, P);
assert(agustus + september === 0, "jumlah poin per periode = 0");
assert(lifetime === 2, "poin lifetime = 2");
assert(
  agustus + september !== lifetime,
  "poin periode memang tidak sama dengan lifetime - catatan kaki wajib ada",
);

// threshold tidak wajar tidak boleh membuat NaN/Infinity
assert(calculateLatenessPoints(5, 0, P) === 0, "threshold 0 aman");
assert(calculateLatenessPoints(-1, T, P) === 0, "count negatif aman");

// Atribut memakai rumus yang sama
assert(calculateAttributePoints(3, T, P) === 2, "atribut 3x = 2 poin");
assert(calculateAttributePoints(2, T, P) === 0, "atribut 2x = 0 poin");

console.log("Report point checks done.");
