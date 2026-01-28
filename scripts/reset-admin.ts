
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Connecting to database...')
  
  try {
    const password = await bcrypt.hash('admin', 10)
    
    console.log('Upserting admin user...')
    const admin = await prisma.user.upsert({
      where: { email: 'admin@i9.com' },
      update: {
        password,
        role: 'ADMIN',
        name: 'Admin'
      },
      create: {
        email: 'admin@i9.com',
        name: 'Admin',
        password,
        role: 'ADMIN',
      },
    })

    console.log('Admin user updated/created successfully:', admin)
  } catch (error) {
    console.error('Error updating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
