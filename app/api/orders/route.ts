import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get("status")

    const where: any = {}
    if (statusParam) {
      const statuses = statusParam.split(",")
      where.status = { in: statuses }
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tableNumber, items, totalPrice, notes } = await request.json()

    const orderNumber = `#${Date.now()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableNumber,
        status: "pending",
        totalPrice,
        items: {
          create: items.map((item: any) => ({
            productName: item.productName,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error creating order" }, { status: 500 })
  }
}
