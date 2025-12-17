
import { prisma } from "./lib/db";

async function main() {
    console.log("Checking database for orders...");
    try {
        const totalOrders = await prisma.order.count();
        console.log(`Total orders in DB: ${totalOrders}`);

        const pendingOrders = await prisma.order.findMany({
            where: {
                status: { in: ['pending', 'in-progress'] }
            },
            include: { items: true }
        });

        console.log(`Pending/In-progress orders: ${pendingOrders.length}`);
        if (pendingOrders.length > 0) {
            console.log("Sample pending order:", JSON.stringify(pendingOrders[0], null, 2));
        } else {
            // Show last 5 orders of any status
            const lastOrders = await prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            });
            console.log("Last 5 orders (any status):", JSON.stringify(lastOrders, null, 2));
        }
    } catch (e) {
        console.error("Error querying DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
