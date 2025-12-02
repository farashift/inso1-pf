import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Email, contraseña y nombre son requeridos" }, { status: 400 })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    })

    if (existingAdmin) {
      return NextResponse.json({ message: "El email ya está registrado" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new admin
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Return success (without password)
    return NextResponse.json({
      message: "Administrador registrado exitosamente",
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
