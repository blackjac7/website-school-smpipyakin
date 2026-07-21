"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";
import { isKesiswaanRole } from "@/lib/roles";
import { Prisma, GenderType } from "@prisma/client";
import { generateQRToken, generateQRPayload } from "@/lib/qr-token";

// Validation schemas
const GetStudentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  classFilter: z.string().optional(),
  genderFilter: z.enum(["all", "MALE", "FEMALE"]).optional(),
  angkatanFilter: z.coerce.number().optional(),
});

export type StudentData = {
  id: string;
  name: string;
  nisn: string;
  email: string | null;
  class: string | null;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  parentName: string | null;
  parentPhone: string | null;
  year: number | null;
  createdAt: string;
  achievementCount: number;
  workCount: number;
};

export type StudentsResult = {
  success: boolean;
  data: StudentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

// Helper to verify kesiswaan role
async function verifyKesiswaanRole() {
  const user = await getAuthenticatedUser();
  if (!user || !isKesiswaanRole(user.role)) {
    return {
      authorized: false,
      error: "Unauthorized: Kesiswaan access required",
    };
  }
  return { authorized: true, user };
}

/**
 * Get paginated students for kesiswaan dashboard
 */
export async function getStudentsForKesiswaan(
  params: z.infer<typeof GetStudentsSchema> = { page: 1, limit: 10 },
): Promise<StudentsResult> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        error: auth.error,
      };
    }

    const validation = GetStudentsSchema.safeParse(params);
    if (!validation.success) {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        error: validation.error.issues[0].message,
      };
    }

    const { page, limit, search, classFilter, genderFilter, angkatanFilter } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SiswaWhereInput = {};
    const conditions: Prisma.SiswaWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nisn: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (classFilter && classFilter !== "all") {
      conditions.push({ class: classFilter });
    }

    if (genderFilter && genderFilter !== "all") {
      conditions.push({ gender: genderFilter as GenderType });
    }

    if (angkatanFilter) {
      conditions.push({ year: angkatanFilter });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Get total count and students in parallel
    const [total, students] = await Promise.all([
      prisma.siswa.count({ where }),
      prisma.siswa.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ class: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              achievements: true,
              works: true,
            },
          },
        },
      }),
    ]);

    const formattedStudents: StudentData[] = students.map((student) => ({
      id: student.id,
      name: student.name || "",
      nisn: student.nisn || "",
      email: student.email,
      class: student.class,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate
        ? student.birthDate.toISOString().split("T")[0]
        : null,
      address: student.address,
      phone: student.phone,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      year: student.year,
      createdAt: student.createdAt.toISOString(),
      achievementCount: student._count.achievements,
      workCount: student._count.works,
    }));

    return {
      success: true,
      data: formattedStudents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getStudentsForKesiswaan error:", error);
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      error: "Failed to fetch students",
    };
  }
}

/**
 * Get all students for export (no pagination)
 */
export async function getAllStudentsForExport(params?: {
  search?: string;
  classFilter?: string;
  genderFilter?: string;
  angkatanFilter?: number;
}): Promise<{
  success: boolean;
  data: StudentData[];
  error?: string;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { success: false, data: [], error: auth.error };
    }

    const where: Prisma.SiswaWhereInput = {};
    const conditions: Prisma.SiswaWhereInput[] = [];

    if (params?.search) {
      conditions.push({
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { nisn: { contains: params.search } },
          { email: { contains: params.search, mode: "insensitive" } },
        ],
      });
    }

    if (params?.classFilter && params.classFilter !== "all") {
      conditions.push({ class: params.classFilter });
    }

    if (params?.genderFilter && params.genderFilter !== "all") {
      conditions.push({ gender: params.genderFilter as GenderType });
    }

    if (params?.angkatanFilter) {
      conditions.push({ year: params.angkatanFilter });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const students = await prisma.siswa.findMany({
      where,
      orderBy: [{ class: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            achievements: true,
            works: true,
          },
        },
      },
    });

    const formattedStudents: StudentData[] = students.map((student) => ({
      id: student.id,
      name: student.name || "",
      nisn: student.nisn || "",
      email: student.email,
      class: student.class,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate
        ? student.birthDate.toISOString().split("T")[0]
        : null,
      address: student.address,
      phone: student.phone,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      year: student.year,
      createdAt: student.createdAt.toISOString(),
      achievementCount: student._count.achievements,
      workCount: student._count.works,
    }));

    return { success: true, data: formattedStudents };
  } catch (error) {
    console.error("getAllStudentsForExport error:", error);
    return { success: false, data: [], error: "Failed to fetch students" };
  }
}

/**
 * Student data with HMAC-signed QR payload for student cards
 */
export type StudentCardData = {
  id: string;
  name: string;
  nisn: string;
  class: string | null;
  year: number | null;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  qrData: string; // HMAC-signed QR payload
};

/**
 * Get all students with HMAC-signed QR codes for student card generation.
 * Auto-generates qrToken if a student doesn't have one yet.
 */
export async function getStudentsForCards(params?: {
  search?: string;
  classFilter?: string;
  angkatanFilter?: number;
}): Promise<{
  success: boolean;
  data: StudentCardData[];
  error?: string;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { success: false, data: [], error: auth.error };
    }

    const where: Prisma.SiswaWhereInput = {};
    const conditions: Prisma.SiswaWhereInput[] = [];

    if (params?.search) {
      conditions.push({
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { nisn: { contains: params.search } },
        ],
      });
    }

    if (params?.classFilter && params.classFilter !== "all") {
      conditions.push({ class: params.classFilter });
    }

    if (params?.angkatanFilter) {
      conditions.push({ year: params.angkatanFilter });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const students = await prisma.siswa.findMany({
      where,
      select: {
        id: true,
        name: true,
        nisn: true,
        class: true,
        year: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        qrToken: true,
      },
      orderBy: [{ class: "asc" }, { name: "asc" }],
    });

    // Batch update students without QR tokens (avoid connection pool exhaustion)
    const studentsNeedingTokens = students.filter((s) => !s.qrToken);

    if (studentsNeedingTokens.length > 0) {
      // Process in batches of 10 to avoid connection pool exhaustion
      const BATCH_SIZE = 10;
      for (let i = 0; i < studentsNeedingTokens.length; i += BATCH_SIZE) {
        const batch = studentsNeedingTokens.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map((student) => {
            const token = generateQRToken(student.id);
            return prisma.siswa.update({
              where: { id: student.id },
              data: { qrToken: token },
            });
          }),
        );
      }

      // Refetch students to get updated qrTokens
      const updatedStudents = await prisma.siswa.findMany({
        where,
        select: {
          id: true,
          name: true,
          nisn: true,
          class: true,
          year: true,
          gender: true,
          birthPlace: true,
          birthDate: true,
          qrToken: true,
        },
        orderBy: [{ class: "asc" }, { name: "asc" }],
      });

      // Build student card data with QR payloads
      const studentsWithQR: StudentCardData[] = updatedStudents.map(
        (student) => ({
          id: student.id,
          name: student.name || "",
          nisn: student.nisn || "",
          class: student.class,
          year: student.year,
          gender: student.gender,
          birthPlace: student.birthPlace,
          birthDate: student.birthDate
            ? student.birthDate.toISOString().split("T")[0]
            : null,
          qrData: generateQRPayload(student.id, student.qrToken!),
        }),
      );

      return { success: true, data: studentsWithQR };
    }

    // All students already have tokens, build payloads directly
    const studentsWithQR: StudentCardData[] = students.map((student) => ({
      id: student.id,
      name: student.name || "",
      nisn: student.nisn || "",
      class: student.class,
      year: student.year,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate
        ? student.birthDate.toISOString().split("T")[0]
        : null,
      qrData: generateQRPayload(student.id, student.qrToken!),
    }));

    return { success: true, data: studentsWithQR };
  } catch (error) {
    console.error("getStudentsForCards error:", error);
    return { success: false, data: [], error: "Failed to fetch students" };
  }
}

/**
 * Get available classes for filter dropdown
 */
export async function getAvailableClasses(): Promise<string[]> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return [];
    }

    const classes = await prisma.siswa.findMany({
      where: { class: { not: null } },
      select: { class: true },
      distinct: ["class"],
      orderBy: { class: "asc" },
    });

    return classes.map((c) => c.class).filter((c): c is string => c !== null);
  } catch (error) {
    console.error("getAvailableClasses error:", error);
    return [];
  }
}

/**
 * Get available angkatan for filter dropdown
 */
export async function getAvailableAngkatan(): Promise<number[]> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return [];
    }

    // Mapping 'angkatan' concept to 'year' field in data
    const angkatanList = await prisma.siswa.findMany({
      where: { year: { not: null } },
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });

    return angkatanList
      .map((a) => a.year)
      .filter((a): a is number => a !== null);
  } catch (error) {
    console.error("getAvailableAngkatan error:", error);
    return [];
  }
}

/**
 * Get student statistics for kesiswaan
 */
export async function getStudentStats(): Promise<{
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  byClass: Array<{ class: string; count: number }>;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { totalStudents: 0, maleCount: 0, femaleCount: 0, byClass: [] };
    }

    const [totalStudents, maleCount, femaleCount, classCounts] =
      await Promise.all([
        prisma.siswa.count(),
        prisma.siswa.count({ where: { gender: "MALE" } }),
        prisma.siswa.count({ where: { gender: "FEMALE" } }),
        prisma.siswa.groupBy({
          by: ["class"],
          _count: { id: true },
          orderBy: { class: "asc" },
        }),
      ]);

    const byClass = classCounts
      .filter((c) => c.class !== null)
      .map((c) => ({
        class: c.class as string,
        count: c._count.id,
      }));

    return { totalStudents, maleCount, femaleCount, byClass };
  } catch (error) {
    console.error("getStudentStats error:", error);
    return { totalStudents: 0, maleCount: 0, femaleCount: 0, byClass: [] };
  }
}

// Input validation schemas
const CreateStudentSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  nisn: z.string().min(10, "NISN minimal 10 digit"),
  gender: z.enum(["MALE", "FEMALE"]),
  class: z.string().min(1, "Kelas wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"), // YYYY-MM-DD
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
  birthPlace: z.string().optional(),
  year: z.number().optional(), // Represents Angkatan / Entry Year
});

type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

/**
 * Create a single student
 * Creates both User (role: SISWA) and Siswa profile
 */
export async function createStudent(data: CreateStudentInput) {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const validation = CreateStudentSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const {
      name,
      nisn,
      gender,
      class: className,
      birthDate,
      email,
      phone,
      parentName,
      parentPhone,
      address,
      birthPlace,
      year,
    } = validation.data;

    // Check if NISN already exists
    const existingStudent = await prisma.siswa.findFirst({
      where: { nisn },
    });

    if (existingStudent) {
      return { success: false, error: "NISN sudah terdaftar" };
    }

    // Check if Username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: nisn },
    });

    if (existingUser) {
      return { success: false, error: "Username (NISN) sudah digunakan" };
    }

    // Generate Password: NISN@YearOfBirth (e.g., 0056972403@2010)
    const birthYear = new Date(birthDate).getFullYear();
    const rawPassword = `${nisn}@${birthYear}`;
    const hashedPassword = await import("bcryptjs").then((bcrypt) =>
      bcrypt.hash(rawPassword, 10),
    );

    await prisma.$transaction(async (tx) => {
      // 1. Create User
      const newUser = await tx.user.create({
        data: {
          username: nisn,
          email: email || null,
          password: hashedPassword,
          role: "SISWA",
        },
      });

      // 2. Create Siswa Profile
      await tx.siswa.create({
        data: {
          userId: newUser.id,
          name,
          nisn,
          class: className,
          gender: gender as GenderType,
          birthDate: new Date(birthDate),
          birthPlace,
          phone,
          address,
          parentName,
          parentPhone,
          email, // redundant but in schema
          year: year || new Date().getFullYear(), // Use provided year (angkatan) or current year
          osisAccess: false,
        },
      });
    });

    return { success: true, message: "Siswa berhasil ditambahkan" };
  } catch (error) {
    console.error("createStudent error:", error);
    return { success: false, error: "Gagal menambahkan siswa" };
  }
}

/**
 * Update existing student information
 */
export async function updateStudent(
  studentId: string,
  data: Partial<CreateStudentInput>,
) {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const existingStudent = await prisma.siswa.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!existingStudent) {
      return { success: false, error: "Siswa tidak ditemukan" };
    }

    const {
      name,
      nisn,
      gender,
      class: className,
      birthDate,
      email,
      phone,
      parentName,
      parentPhone,
      address,
      birthPlace,
      year,
    } = data;

    // Check NISN uniqueness if changed
    if (nisn && nisn !== existingStudent.nisn) {
      const nisnTaken = await prisma.siswa.findFirst({
        where: { nisn, NOT: { id: studentId } },
      });
      if (nisnTaken) {
        return { success: false, error: "NISN sudah digunakan siswa lain" };
      }
    }

    await prisma.$transaction(async (tx) => {
      // Update Siswa data
      const updateData: Prisma.SiswaUpdateInput = {};
      if (name) updateData.name = name;
      if (nisn) updateData.nisn = nisn;
      if (className) updateData.class = className;
      if (gender) updateData.gender = gender;
      if (birthDate) updateData.birthDate = new Date(birthDate);
      if (birthPlace !== undefined) updateData.birthPlace = birthPlace;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (parentName !== undefined) updateData.parentName = parentName;
      if (parentPhone !== undefined) updateData.parentPhone = parentPhone;
      if (email !== undefined) updateData.email = email;
      if (year) updateData.year = year;

      await tx.siswa.update({
        where: { id: studentId },
        data: updateData,
      });

      // Update User email and username if NISN changed
      if (existingStudent.userId) {
        const userUpdate: Prisma.UserUpdateInput = {};
        if (nisn && nisn !== existingStudent.nisn) {
          userUpdate.username = nisn;
        }
        if (email !== undefined) {
          userUpdate.email = email || null;
        }
        if (Object.keys(userUpdate).length > 0) {
          await tx.user.update({
            where: { id: existingStudent.userId },
            data: userUpdate,
          });
        }
      }
    });

    return { success: true, message: "Data siswa berhasil diperbarui" };
  } catch (error) {
    console.error("updateStudent error:", error);
    return { success: false, error: "Gagal memperbarui data siswa" };
  }
}

/**
 * Bulk create students from Excel data
 */
export async function bulkCreateStudents(students: CreateStudentInput[]) {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!students.length) {
      return { success: false, error: "Data kosong" };
    }

    let successCount = 0;
    let failCount = 0;
    const processErrors: string[] = [];

    // 1. Sanitize input
    const sanitizedStudents = students.map((student, index) => {
      const rawNisn = String(student.nisn || "").trim();
      const paddedNisn = rawNisn ? rawNisn.padStart(10, "0") : "";

      const rawGender = String(student.gender || "").trim().toUpperCase();
      let finalGender = student.gender;
      if (rawGender.startsWith("P") || rawGender.startsWith("F")) {
        finalGender = "FEMALE";
      } else if (rawGender.startsWith("L") || rawGender.startsWith("M")) {
        finalGender = "MALE";
      }

      const rawEmail = String(student.email || "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmail = emailRegex.test(rawEmail) ? rawEmail : "";

      return {
        ...student,
        nisn: paddedNisn,
        gender: finalGender,
        email: validEmail,
        _originalIndex: index + 1,
      };
    });

    // 2. Schema Validation (collect errors, but proceed with valid ones)
    const validStudents: (CreateStudentInput & { _originalIndex: number })[] = [];

    sanitizedStudents.forEach((student) => {
      const { _originalIndex, ...cleanStudent } = student;
      const validation = CreateStudentSchema.safeParse(cleanStudent);
      if (!validation.success) {
        failCount++;
        processErrors.push(
          `Baris ${_originalIndex}: ${validation.error.issues[0].message}`,
        );
      } else {
        validStudents.push({
          ...validation.data,
          _originalIndex,
        });
      }
    });

    if (validStudents.length === 0) {
      return {
        success: false,
        error: "Semua baris gagal validasi",
        details: processErrors,
      };
    }

    // 3. Batch Check Uniqueness in Database (2 queries)
    const allNisns = validStudents.map((s) => s.nisn);
    const allEmails = validStudents
      .map((s) => s.email)
      .filter((e): e is string => !!e && e.trim() !== "");

    const [existingStudents, existingUsers] = await Promise.all([
      prisma.siswa.findMany({
        where: { nisn: { in: allNisns } },
        select: { nisn: true },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { username: { in: allNisns } },
            { email: { in: allEmails } },
          ],
        },
        select: { username: true, email: true },
      }),
    ]);

    const existingNisnsSet = new Set(existingStudents.map((s) => s.nisn));
    const existingUsernamesSet = new Set(existingUsers.map((u) => u.username));
    const existingEmailsSet = new Set(
      existingUsers
        .map((u) => u.email)
        .filter((e): e is string => !!e)
        .map((e) => e.toLowerCase()),
    );

    // 4. Filter and track emails to prevent duplicate emails in the current batch
    const usedEmailsInBatch = new Set<string>();
    const studentsToProcess: (CreateStudentInput & { _originalIndex: number })[] = [];

    for (const student of validStudents) {
      if (existingNisnsSet.has(student.nisn) || existingUsernamesSet.has(student.nisn)) {
        failCount++;
        processErrors.push(
          `Baris ${student._originalIndex}: NISN ${student.nisn} sudah terdaftar`,
        );
        continue;
      }

      let emailToUse =
        student.email && student.email.trim() !== "" ? student.email.trim().toLowerCase() : null;
      if (emailToUse) {
        if (existingEmailsSet.has(emailToUse) || usedEmailsInBatch.has(emailToUse)) {
          // Email is already used, set to null so the student can still be created
          emailToUse = null;
        } else {
          usedEmailsInBatch.add(emailToUse);
        }
      }

      studentsToProcess.push({
        ...student,
        email: emailToUse || undefined,
      });
    }

    if (studentsToProcess.length === 0) {
      return {
        success: true,
        message: `Proses selesai. Berhasil: ${successCount}, Gagal: ${failCount}`,
        details: processErrors,
      };
    }

    // 5. Hash passwords in parallel
    const bcrypt = await import("bcryptjs");
    const studentsWithHashedPasswords = await Promise.all(
      studentsToProcess.map(async (student) => {
        const birthYear = new Date(student.birthDate).getFullYear();
        const rawPassword = `${student.nisn}@${birthYear}`;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        return {
          ...student,
          hashedPassword,
        };
      }),
    );

    // 6. DB creation in Chunks of 10 using Promise.allSettled to avoid connection pool exhaustion
    const CHUNK_SIZE = 10;
    for (let i = 0; i < studentsWithHashedPasswords.length; i += CHUNK_SIZE) {
      const chunk = studentsWithHashedPasswords.slice(i, i + CHUNK_SIZE);

      const chunkResults = await Promise.allSettled(
        chunk.map(async (student) => {
          return prisma.$transaction(
            async (tx) => {
              const newUser = await tx.user.create({
                data: {
                  username: student.nisn,
                  email: student.email || null,
                  password: student.hashedPassword,
                  role: "SISWA",
                },
              });

              await tx.siswa.create({
                data: {
                  userId: newUser.id,
                  name: student.name,
                  nisn: student.nisn,
                  class: student.class,
                  gender: student.gender as GenderType,
                  birthDate: new Date(student.birthDate),
                  birthPlace: student.birthPlace,
                  phone: student.phone,
                  address: student.address,
                  parentName: student.parentName,
                  parentPhone: student.parentPhone,
                  email: student.email,
                  year: student.year || new Date().getFullYear(),
                },
              });
            },
            {
              maxWait: 20000, // 20 seconds maximum wait to acquire a connection from the pool
              timeout: 30000, // 30 seconds execution timeout for the transaction
            }
          );
        }),
      );

      chunkResults.forEach((result, idx) => {
        const student = chunk[idx];
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          failCount++;
          processErrors.push(
            `Baris ${student._originalIndex}: Gagal memproses ${student.name} (${student.nisn}): ${(result.reason as Error)?.message || "Kesalahan database"}`,
          );
        }
      });
    }

    revalidatePath("/dashboard-kesiswaan/students");
    revalidatePath("/dashboard-kesiswaan");

    return {
      success: true,
      message: `Proses selesai. Berhasil: ${successCount}, Gagal: ${failCount}`,
      details: processErrors,
    };
  } catch (error) {
    console.error("bulkCreateStudents error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan server saat proses import",
    };
  }
}
