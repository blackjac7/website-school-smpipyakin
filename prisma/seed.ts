import { PrismaClient } from "@prisma/client";
import { runAllSeeds } from "./seeds";

const prisma = new PrismaClient();

// Parse command line arguments for selective seeding
function parseArgs(): Record<string, boolean> {
  const args = process.argv.slice(2);
  const options: Record<string, boolean> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key.startsWith("no-")) {
        options[key.slice(3)] = false;
      } else {
        options[key] = true;
      }
    }
  }

  return options;
}

async function main() {
  const args = parseArgs();

  // Check for --dev flag to include notifications
  const isDev = args.dev || args.notifications;

  await runAllSeeds(prisma, {
    users: args["no-users"] !== undefined ? false : true,
    site: args["no-site"] !== undefined ? false : true,
    content: args["no-content"] !== undefined ? false : true,
    academic: args["no-academic"] !== undefined ? false : true,
    students: args["no-students"] !== undefined ? false : true,
    notifications: isDev,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
