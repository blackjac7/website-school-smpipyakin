import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const facilityCount = await prisma.facility.count();
  const extracurricularCount = await prisma.extracurricular.count();

  console.log('Facility Count:', facilityCount);
  console.log('Extracurricular Count:', extracurricularCount);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
