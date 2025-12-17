
import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
    try {
        console.log("Connecting to DB...");
        const admins = await prisma.admin.findMany();
        console.log("Admins found:", admins);
    } catch (error) {
        console.error("Error connecting to DB:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
