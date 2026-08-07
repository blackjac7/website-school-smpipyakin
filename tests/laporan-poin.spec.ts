/**
 * Verifikasi Laporan: Poin di Layar vs Export Excel
 * ==================================================
 * Invarian utama: untuk siswa yang muncul di keduanya, "Total Poin" di
 * sheet Rekap Siswa harus identik dengan kolom Poin pada tabel poin di
 * layar. Tabel layar memuat semua siswa berpoin > 0 sepanjang masa
 * (tidak terpengaruh filter periode), sedangkan sheet Rekap hanya memuat
 * siswa yang punya catatan dalam periode terpilih — jadi yang dibandingkan
 * adalah irisan keduanya.
 */

import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "./pages";
import * as XLSX from "xlsx";
import * as fs from "node:fs";
import * as path from "node:path";

interface ScreenRow {
  name: string;
  nisn: string;
  points: number;
}

interface RecapRow {
  name: string;
  nisn: string;
  periodCount: number;
  periodPoints: number;
  totalCount: number;
  totalPoints: number;
}

/** Buka menu Laporan lalu tab yang diminta. Navigasi berbasis state, bukan URL. */
async function openReportTab(page: Page, tab: "Keterlambatan" | "Atribut") {
  await page.getByRole("button", { name: "Laporan" }).first().click();
  await page.getByRole("button", { name: tab, exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: /Export Excel/i }),
  ).toBeVisible({ timeout: 15000 });
}

/**
 * Baca tabel poin (lifetime). Kolom: Siswa (nama + NISN bertumpuk dalam
 * satu sel), Kelas, Total, Poin.
 */
async function readScreenPoints(
  page: Page,
  heading: string,
): Promise<ScreenRow[]> {
  const card = page
    .locator("div")
    .filter({ has: page.getByRole("heading", { name: heading }) })
    .last();

  const rows = card.locator("table tbody tr");
  const count = await rows.count();
  const out: ScreenRow[] = [];

  for (let i = 0; i < count; i++) {
    const cells = rows.nth(i).locator("td");
    if ((await cells.count()) < 4) continue;

    const spans = cells.nth(0).locator("span");
    const name = ((await spans.nth(0).textContent()) || "").trim();
    const nisn = ((await spans.nth(1).textContent()) || "").trim();
    const pointsText = ((await cells.nth(3).textContent()) || "").trim();
    const points = parseInt(pointsText.replace(/\D+/g, ""), 10);

    if (nisn) {
      out.push({ name, nisn, points: Number.isNaN(points) ? 0 : points });
    }
  }

  return out;
}

/** Klik Export Excel, simpan, baca ketiga sheet. */
async function exportWorkbook(page: Page, label: string) {
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.getByRole("button", { name: /Export Excel/i }).first().click();
  const download = await downloadPromise;

  const filename = download.suggestedFilename();
  const tmp = path.join(process.cwd(), "test-results", `verify-${label}.xlsx`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  await download.saveAs(tmp);

  const wb = XLSX.readFile(tmp);
  const sheetNames = wb.SheetNames;

  // Sheet Rekap: baris 0-3 judul/subjudul/tanggal/kosong, baris 4 header,
  // data mulai baris 5. Kolom: No | Nama | NISN | Kelas | Periode |
  // Poin Periode | Total | Total Poin | [Atribut Tersering]
  const recap: RecapRow[] = [];
  const recapSheet = wb.Sheets["Rekap Siswa"];
  if (recapSheet) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(recapSheet, { header: 1 });
    for (let i = 5; i < rows.length; i++) {
      const r = rows[i];
      if (!r || typeof r[0] !== "number") continue;
      recap.push({
        name: String(r[1] ?? "").trim(),
        nisn: String(r[2] ?? "").trim(),
        periodCount: Number(r[4]) || 0,
        periodPoints: Number(r[5]) || 0,
        totalCount: Number(r[6]) || 0,
        totalPoints: Number(r[7]) || 0,
      });
    }
  }

  // Sheet Detail & Ringkasan sebagai teks datar, untuk cek catatan kaki
  const flatten = (name: string): string => {
    const s = wb.Sheets[name];
    if (!s) return "";
    return XLSX.utils
      .sheet_to_json<unknown[]>(s, { header: 1 })
      .map((r) => (r || []).join(" "))
      .join("\n");
  };

  fs.unlinkSync(tmp);

  return {
    filename,
    sheetNames,
    recap,
    detailText: flatten("Detail"),
    summaryText: flatten("Ringkasan"),
  };
}

test.describe("Laporan Kesiswaan: poin & export", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAs("kesiswaan");
  });

  for (const {
    tab,
    heading,
    label,
    countLabel,
  } of [
    {
      tab: "Keterlambatan" as const,
      heading: "Poin Keterlambatan Siswa",
      label: "lateness",
      countLabel: "Terlambat",
    },
    {
      tab: "Atribut" as const,
      heading: "Poin Pelanggaran Atribut Siswa",
      label: "attribute",
      countLabel: "Pelanggaran",
    },
  ]) {
    test(`${tab}: Total Poin di Excel cocok dengan tabel di layar`, async ({
      page,
    }) => {
      await openReportTab(page, tab);
      const screen = await readScreenPoints(page, heading);
      console.log(`[${label}] tabel layar: ${screen.length} siswa berpoin`);

      // Tahun Ajaran: periode selebar mungkin agar beririsan dengan
      // tabel lifetime di layar.
      await page.getByRole("combobox").first().selectOption("academicYear");
      await page.waitForTimeout(2500);

      const wb = await exportWorkbook(page, label);
      console.log(`[${label}] berkas: ${wb.filename}`);
      console.log(`[${label}] sheet: ${wb.sheetNames.join(", ")}`);
      console.log(`[${label}] rekap Excel: ${wb.recap.length} siswa`);

      // --- Struktur workbook ---
      expect(wb.sheetNames).toEqual(
        expect.arrayContaining(["Detail", "Rekap Siswa", "Ringkasan"]),
      );

      // Nama berkas memuat periode, bukan "CUSTOM"
      expect(wb.filename).toMatch(/Tahun-Ajaran-\d{4}-\d{4}/);

      // --- Catatan kaki yang mencegah salah jumlah ---
      expect(wb.summaryText).toContain("tidak dapat dijumlahkan");
      expect(wb.detailText).toContain("tidak boleh dijumlahkan");

      // --- Invarian utama: poin lifetime harus sama ---
      const byNisn = new Map(wb.recap.map((r) => [r.nisn, r]));
      const mismatches: string[] = [];
      let compared = 0;

      for (const s of screen) {
        const e = byNisn.get(s.nisn);
        if (!e) continue; // tak punya catatan di periode ini — wajar
        compared++;
        if (s.points !== e.totalPoints) {
          mismatches.push(
            `${s.name} (${s.nisn}): layar=${s.points}, excel=${e.totalPoints}`,
          );
        }
      }

      console.log(`[${label}] dibandingkan: ${compared} siswa`);
      expect(mismatches, `Poin tidak cocok:\n${mismatches.join("\n")}`).toEqual(
        [],
      );

      // --- Konsistensi internal rekap ---
      for (const r of wb.recap) {
        expect(
          r.periodCount,
          `${r.name}: ${countLabel} periode (${r.periodCount}) melebihi total (${r.totalCount})`,
        ).toBeLessThanOrEqual(r.totalCount);
        expect(
          r.periodPoints,
          `${r.name}: poin periode (${r.periodPoints}) melebihi total (${r.totalPoints})`,
        ).toBeLessThanOrEqual(r.totalPoints);
      }

      // Urutan menurun berdasarkan Total Poin
      for (let i = 1; i < wb.recap.length; i++) {
        expect(
          wb.recap[i - 1].totalPoints,
          `baris ${i} tidak urut menurun`,
        ).toBeGreaterThanOrEqual(wb.recap[i].totalPoints);
      }
    });
  }

  test("Periode akademik baru tersedia & tombol export aktif saat periode kosong", async ({
    page,
  }) => {
    await openReportTab(page, "Keterlambatan");

    const periodSelect = page.getByRole("combobox").first();
    const options = await periodSelect.locator("option").allTextContents();

    expect(options).toEqual(
      expect.arrayContaining([
        "Bulan Tertentu",
        "Semester",
        "Tahun Ajaran",
      ]),
    );

    // Bulan yang hampir pasti kosong: Januari tahun jauh di belakang.
    await periodSelect.selectOption("specificMonth");
    const monthSelects = page.getByRole("combobox");
    await monthSelects.nth(1).selectOption("0"); // Januari
    await page.waitForTimeout(2000);

    // Tombol export harus TETAP aktif — wali kelas butuh bukti periode nihil.
    await expect(
      page.getByRole("button", { name: /Export Excel/i }),
    ).toBeEnabled();
  });
});
