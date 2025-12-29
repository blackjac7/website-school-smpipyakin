
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying Database State...");

  const userCount = await prisma.user.count();
  console.log(`Users count: ${userCount}`);

  const users = await prisma.user.findMany({
    select: { username: true, role: true, email: true }
  });
  console.log("Users:", users);

  const loginAttempts = await prisma.loginAttempt.count();
  console.log(`Login Attempts count: ${loginAttempts}`);

  const recentAttempts = await prisma.loginAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
  });
  console.log("Recent Login Attempts:", recentAttempts);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
