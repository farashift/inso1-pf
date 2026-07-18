import 'dotenv/config'
import { prisma } from '../lib/db'
import { hashPassword } from '../lib/auth'

async function main() {
  const users = [
    {
      email: 'admin@fonzi.com',
      password: 'admin123',
      name: 'Administrador Fonzi',
      role: 'admin',
    },
    {
      email: 'mesero@fonzi.com',
      password: 'mesero123',
      name: 'Mesero Fonzi',
      role: 'waiter',
    },
    {
      email: 'cocina@fonzi.com',
      password: 'cocina123',
      name: 'Cocina Fonzi',
      role: 'kitchen',
    },
    {
      email: 'cajero@fonzi.com',
      password: 'cajero123',
      name: 'Cajero Fonzi',
      role: 'cashier',
    },
    {
      email: 'almacen@fonzi.com',
      password: 'almacen123',
      name: 'Almacen Fonzi',
      role: 'warehouse',
    },
  ]

  for (const user of users) {
    const hashedPassword = await hashPassword(user.password)

    await prisma.admin.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        name: user.name,
        role: user.role,
      },
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
      },
    })
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
