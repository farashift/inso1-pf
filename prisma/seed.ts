import 'dotenv/config'
import { prisma } from '../lib/db'
import { hashPassword } from '../lib/auth'

async function main() {
  const hashedPassword = await hashPassword('admin123')

  await prisma.admin.upsert({
    where: { email: 'adminX@gmail.com' },
    update: {},
    create: {
      email: 'adminX@gmail.com',
      password: hashedPassword,
      name: 'Administrador'
    }
  })
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
