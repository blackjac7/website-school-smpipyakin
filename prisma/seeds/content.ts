import { PrismaClient, TeacherCategory } from "@prisma/client";
import { FACILITIES_DATA, EXTRACURRICULAR_DATA, TEACHERS_DATA } from "./data";

function mapTeacherCategory(category: string): TeacherCategory {
  switch (category) {
    case "Pimpinan":
      return TeacherCategory.PIMPINAN;
    case "Staff":
      return TeacherCategory.STAFF;
    default:
      return TeacherCategory.GURU_MAPEL;
  }
}

/**
 * Seeds school content: facilities, extracurriculars, teachers
 */
export async function seedContent(prisma: PrismaClient) {
  console.log("🏫 Seeding School Content...");

  // Facilities
  console.log("  📍 Facilities...");
  await prisma.facility.deleteMany();
  for (const item of FACILITIES_DATA) {
    await prisma.facility.create({
      data: {
        title: item.name,
        description: item.description,
        image: item.image,
      },
    });
  }

  // Extracurriculars
  console.log("  🎭 Extracurriculars...");
  await prisma.extracurricular.deleteMany();
  for (const item of EXTRACURRICULAR_DATA) {
    await prisma.extracurricular.create({
      data: {
        title: item.name,
        description: item.description,
        schedule: Array.isArray(item.schedule)
          ? item.schedule.join(", ")
          : item.schedule,
        image: item.image,
      },
    });
  }

  // Teachers
  console.log("  👨‍🏫 Teachers...");
  await prisma.teacher.deleteMany();
  for (const [index, item] of TEACHERS_DATA.entries()) {
    await prisma.teacher.create({
      data: {
        name: item.name,
        position: item.position,
        category: mapTeacherCategory(item.category),
        subject: item.subject,
        photo: item.photo,
        description: item.description,
        experience: item.experience,
        sortOrder: index,
      },
    });
  }

  console.log("✅ School content seeded");
}
