const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const adminEmails = [
    'admin@example.com'
  ]

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { isAdmin: true },
      create: { email, isAdmin: true }
    })
  }

  console.log('Seeded admin users')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
