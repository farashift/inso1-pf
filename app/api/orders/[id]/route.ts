import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { status, paymentMethod } = await request.json()

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(paymentMethod && { paymentMethod }),
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Error updating order" }, { status: 500 })
  }
}
