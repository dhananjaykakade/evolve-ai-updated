import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
// Export Prisma Client for other modules to use instead of using the default client
export default prisma; // Export Prisma Client as default