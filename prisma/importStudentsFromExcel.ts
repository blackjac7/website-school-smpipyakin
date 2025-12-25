import { PrismaClient, GenderType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Interface untuk data siswa dari Excel Dapodik
 */
interface StudentData {
  nisn: string;
  name: string;
  gender: "MALE" | "FEMALE";
  class: string;
  year: number;
  birthDate?: Date;
  birthPlace?: string;
  address?: string;
  phone?: string;
  parentName?: string;
}

/**
 * Mapping kolom Excel Dapodik
 * Sesuaikan index jika format berbeda
 */
const COLUMN_MAPPING = {
  NO: 0,
  NAMA: 1,
  NIPD: 2,
  JK: 3, // L atau P
  NISN: 4,
  TEMPAT_LAHIR: 5,
  TANGGAL_LAHIR: 6,
  NIK: 7,
  AGAMA: 8,
  ALAMAT: 9,
  RT: 10,
  RW: 11,
  DUSUN: 12,
  KELURAHAN: 13,
  KECAMATAN: 14,
  KODE_POS: 15,
  JENIS_TINGGAL: 16,
  ALAT_TRANSPORTASI: 17,
  TELEPON: 18,
  HP: 19,
  EMAIL: 20,
  NAMA_AYAH: 24,
  NAMA_IBU: 30,
  ROMBEL: 42, // Kelas saat ini
};

// Row dimana data siswa mulai (0-indexed)
// Baris 0-4 adalah header, data mulai dari baris 5 tapi baris 5 kosong
const DATA_START_ROW = 6;

/**
 * Parse tanggal dari format Excel/String
 */
function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  // Jika sudah berupa Date (dari Excel)
  if (value instanceof Date) return value;

  // Jika string format YYYY-MM-DD
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }

  // Jika number (Excel serial date)
  if (typeof value === "number") {
    // Excel serial date to JS Date
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
    return jsDate;
  }

  return undefined;
}

/**
 * Ekstrak tahun masuk dari kelas
 * Contoh: KELAS 8C -> tahun sekarang - 1
 */
function extractYear(classStr: string): number {
  const currentYear = new Date().getFullYear();
  const classMatch = classStr.match(/KELAS\s*(\d+)/i);

  if (classMatch) {
    const grade = parseInt(classMatch[1]);
    // Kelas 7 = tahun ini, Kelas 8 = tahun lalu, Kelas 9 = 2 tahun lalu
    return currentYear - (grade - 7);
  }

  return currentYear;
}

/**
 * Format nama kelas
 * Contoh: "KELAS 8C" -> "VIII C"
 */
function formatClassName(rawClass: string): string {
  if (!rawClass) return "VII A";

  const match = rawClass.match(/KELAS\s*(\d+)([A-Z]?)/i);
  if (!match) return rawClass;

  const grade = parseInt(match[1]);
  const section = match[2] || "A";

  const romanMap: Record<number, string> = {
    7: "VII",
    8: "VIII",
    9: "IX",
  };

  return `${romanMap[grade] || grade} ${section}`;
}

/**
 * Generate password default: NISN@TahunLahir atau NISN@SMP
 */
function generateDefaultPassword(nisn: string, birthDate?: Date): string {
  if (birthDate) {
    const year = birthDate.getFullYear();
    return `${nisn}@${year}`;
  }
  return `${nisn}@SMP`;
}

/**
 * Bersihkan nama (hilangkan spasi berlebih)
 */
function cleanName(name: string): string {
  if (!name) return "Unknown";
  return name.replace(/\s+/g, " ").trim();
}

/**
 * Parse Excel file dan extract data siswa
 */
function parseExcelFile(filePath: string): StudentData[] {
  console.log(`📂 Reading Excel file: ${filePath}\n`);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to array of arrays
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
  });

  console.log(`📊 Sheet: "${sheetName}"`);
  console.log(`📊 Total rows: ${rawData.length}`);
  console.log(`📊 Data starts at row: ${DATA_START_ROW + 1}\n`);

  const students: StudentData[] = [];

  for (let i = DATA_START_ROW; i < rawData.length; i++) {
    const row = rawData[i];

    // Skip empty rows
    if (!row || !row[COLUMN_MAPPING.NISN]) continue;

    const nisn = String(row[COLUMN_MAPPING.NISN] || "").trim();
    const name = cleanName(String(row[COLUMN_MAPPING.NAMA] || ""));
    const jk = String(row[COLUMN_MAPPING.JK] || "").toUpperCase();
    const rawClass = String(row[COLUMN_MAPPING.ROMBEL] || "");

    // Validasi NISN (minimal 5 karakter)
    if (nisn.length < 5) {
      console.warn(`⚠️  Row ${i + 1}: Invalid NISN "${nisn}" - Skipping`);
      continue;
    }

    students.push({
      nisn: nisn,
      name: name,
      gender: jk === "L" ? "MALE" : "FEMALE",
      class: formatClassName(rawClass),
      year: extractYear(rawClass),
      birthDate: parseDate(row[COLUMN_MAPPING.TANGGAL_LAHIR]),
      birthPlace:
        String(row[COLUMN_MAPPING.TEMPAT_LAHIR] || "").trim() || undefined,
      address: String(row[COLUMN_MAPPING.ALAMAT] || "").trim() || undefined,
      phone: String(row[COLUMN_MAPPING.HP] || "").trim() || undefined,
      parentName:
        String(
          row[COLUMN_MAPPING.NAMA_AYAH] || row[COLUMN_MAPPING.NAMA_IBU] || ""
        ).trim() || undefined,
    });
  }

  console.log(`✅ Parsed ${students.length} students from Excel\n`);
  return students;
}

/**
 * Import students ke database
 */
async function importStudents(students: StudentData[]) {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as { nisn: string; name: string; error: string }[],
    credentials: [] as {
      nisn: string;
      name: string;
      class: string;
      password: string;
    }[],
  };

  console.log("🚀 Starting import to database...\n");

  for (const student of students) {
    try {
      // Cek apakah sudah ada
      const existingStudent = await prisma.siswa.findUnique({
        where: { nisn: student.nisn },
      });

      if (existingStudent) {
        console.log(
          `⏭️  Skip: ${student.nisn} (${student.name}) - Already exists`
        );
        results.skipped++;
        continue;
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: student.nisn },
      });

      if (existingUser) {
        console.log(`⏭️  Skip: ${student.nisn} - Username already taken`);
        results.skipped++;
        continue;
      }

      // Generate password dan hash
      const password = generateDefaultPassword(student.nisn, student.birthDate);
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create dalam transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: student.nisn,
            password: hashedPassword,
            role: "SISWA" as UserRole,
          },
        });

        await tx.siswa.create({
          data: {
            userId: user.id,
            nisn: student.nisn,
            name: student.name,
            gender: student.gender as GenderType,
            class: student.class,
            year: student.year,
            osisAccess: false,
            phone: student.phone,
            address: student.address,
            birthDate: student.birthDate,
            birthPlace: student.birthPlace,
            parentName: student.parentName,
          },
        });
      });

      console.log(
        `✅ Created: ${student.nisn} (${student.name}) - ${student.class}`
      );
      results.success++;
      results.credentials.push({
        nisn: student.nisn,
        name: student.name,
        class: student.class,
        password: password,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `❌ Failed: ${student.nisn} (${student.name}) - ${errorMessage}`
      );
      results.failed++;
      results.errors.push({
        nisn: student.nisn,
        name: student.name,
        error: errorMessage,
      });
    }
  }

  return results;
}

/**
 * Export credentials ke file
 */
function exportCredentials(
  credentials: {
    nisn: string;
    name: string;
    class: string;
    password: string;
  }[],
  outputPath: string
) {
  // Format untuk printing/sharing
  let content =
    "╔════════════════════════════════════════════════════════════════════════════╗\n";
  content +=
    "║                    KREDENSIAL LOGIN SISWA SMP IP YAKIN                     ║\n";
  content +=
    "║                        (RAHASIA - JANGAN DISEBARLUASKAN)                   ║\n";
  content +=
    "╠════════════════════════════════════════════════════════════════════════════╣\n";
  content +=
    "║ Tanggal Generate: " +
    new Date().toLocaleDateString("id-ID") +
    "                                               ║\n";
  content +=
    "╠════════════════════════════════════════════════════════════════════════════╣\n\n";

  // Group by class
  const byClass = credentials.reduce(
    (acc, cred) => {
      if (!acc[cred.class]) acc[cred.class] = [];
      acc[cred.class].push(cred);
      return acc;
    },
    {} as Record<string, typeof credentials>
  );

  for (const [className, students] of Object.entries(byClass).sort()) {
    content += `\n📚 ${className}\n`;
    content += "─".repeat(76) + "\n";
    content +=
      "No.  | NISN (Username)  | Nama                           | Password\n";
    content += "─".repeat(76) + "\n";

    students.forEach((s, i) => {
      const no = String(i + 1).padStart(3, " ");
      const nisn = s.nisn.padEnd(16, " ");
      const name = s.name.substring(0, 30).padEnd(30, " ");
      content += `${no}  | ${nisn} | ${name} | ${s.password}\n`;
    });

    content += "\n";
  }

  content += "\n" + "═".repeat(76) + "\n";
  content += "CATATAN PENTING:\n";
  content += "1. Username = NISN siswa\n";
  content +=
    "2. Password default = NISN@TahunLahir (contoh: 0123456789@2011)\n";
  content += "3. Siswa WAJIB mengganti password setelah login pertama\n";
  content += "4. Segera hapus file ini setelah credentials dibagikan\n";
  content += "═".repeat(76) + "\n";

  fs.writeFileSync(outputPath, content, "utf-8");
  console.log(`📝 Credentials exported to: ${outputPath}`);

  // Also export as CSV for easy reference
  const csvPath = outputPath.replace(".txt", ".csv");
  const csvContent =
    "NISN,Nama,Kelas,Password\n" +
    credentials
      .map((c) => `${c.nisn},"${c.name}",${c.class},${c.password}`)
      .join("\n");
  fs.writeFileSync(csvPath, csvContent, "utf-8");
  console.log(`📝 CSV exported to: ${csvPath}`);
}

/**
 * Main function
 */
async function main() {
  console.log(
    "╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║         IMPORT DATA SISWA DARI EXCEL (DAPODIK FORMAT)        ║"
  );
  console.log(
    "║                     SMP IP YAKIN                             ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝\n"
  );

  // Path ke file Excel
  const excelPath = path.join(__dirname, "..", "data-siswa-SMP-IP-YAKIN.xlsx");

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ File not found: ${excelPath}`);
    console.log("\n📝 Pastikan file Excel ada di root project:");
    console.log("   website-school-smpipyakin/data-siswa-SMP-IP-YAKIN.xlsx");
    return;
  }

  // Parse Excel
  const students = parseExcelFile(excelPath);

  if (students.length === 0) {
    console.log("❌ No valid students found in Excel file");
    return;
  }

  // Preview data
  console.log("📋 Preview (first 5 students):");
  console.log("─".repeat(80));
  students.slice(0, 5).forEach((s, i) => {
    console.log(
      `${i + 1}. ${s.nisn} | ${s.name} | ${s.class} | ${s.gender} | ${s.birthPlace || "-"}`
    );
  });
  console.log("─".repeat(80));
  console.log("");

  // Import ke database
  const results = await importStudents(students);

  // Print summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 IMPORT SUMMARY");
  console.log("═".repeat(60));
  console.log(`✅ Success : ${results.success} students`);
  console.log(`⏭️  Skipped : ${results.skipped} students (already exist)`);
  console.log(`❌ Failed  : ${results.failed} students`);
  console.log(`📊 Total   : ${students.length} students in Excel`);

  if (results.errors.length > 0) {
    console.log("\n❌ Error Details:");
    results.errors.forEach((e) => {
      console.log(`   - ${e.nisn} (${e.name}): ${e.error}`);
    });
  }

  // Export credentials
  if (results.credentials.length > 0) {
    const credentialsPath = path.join(
      __dirname,
      "data",
      "credentials-siswa.txt"
    );

    // Ensure directory exists
    const dir = path.dirname(credentialsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    exportCredentials(results.credentials, credentialsPath);

    console.log("\n⚠️  PENTING:");
    console.log("   1. File credentials berisi password dalam plain text");
    console.log("   2. Bagikan dengan aman (jangan via email/WhatsApp)");
    console.log("   3. Hapus file setelah credentials dibagikan ke siswa");
    console.log("   4. Minta siswa segera ganti password setelah login");
  }
}

// Run
main()
  .catch((error) => {
    console.error("❌ Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
