
import { prisma } from "./lib/db";
import * as fs from 'fs';

async function main() {
    const output = [];
    output.push("Checking database...");
    try {
        const totalOrders = await prisma.order.count();
        output.push(`Total orders: ${totalOrders}`);

        const orders = await prisma.order.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        for (const o of orders) {
            output.push(`Order #${o.orderNumber} (ID: ${o.id}) - Status: ${o.status}`);
            output.push(`  Table: ${o.tableNumber}, Created: ${o.createdAt}`);
            output.push(`  Items: ${o.items.length}`);
            o.items.forEach(i => {
                output.push(`    - ${i.productName} x${i.quantity}`);
            });
        }

    } catch (e) {
        output.push(`Error: ${e}`);
    } finally {
        await prisma.$disconnect();
    }

    fs.writeFileSync('db_summary.txt', output.join('\n'));
    console.log("Done. Wrote to db_summary.txt");
}

main();
