import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json({ message: "Email o contraseña incorrectos" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Email o contraseña incorrectos" }, { status: 401 })
    }

    // Return success with token (in production, use JWT)
    return NextResponse.json({
      token: Buffer.from(`${email}:${Date.now()}`).toString("base64"),
      name: admin.name,
      email: admin.email,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
