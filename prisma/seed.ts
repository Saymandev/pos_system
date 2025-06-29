import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@restaurant.com' },
    update: {},
    create: {
      email: 'staff@restaurant.com',
      name: 'Staff User',
      password: staffPassword,
      role: 'STAFF',
    },
  })

  // Create categories
  const categories = [
    { name: 'Appetizers', description: 'Start your meal right', color: '#ef4444' },
    { name: 'Main Course', description: 'Hearty main dishes', color: '#22c55e' },
    { name: 'Desserts', description: 'Sweet endings', color: '#f59e0b' },
    { name: 'Beverages', description: 'Refreshing drinks', color: '#3b82f6' },
    { name: 'Salads', description: 'Fresh and healthy', color: '#10b981' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  // Get created categories
  const appetizerCategory = await prisma.category.findUnique({ where: { name: 'Appetizers' } })
  const mainCourseCategory = await prisma.category.findUnique({ where: { name: 'Main Course' } })
  const dessertCategory = await prisma.category.findUnique({ where: { name: 'Desserts' } })
  const beverageCategory = await prisma.category.findUnique({ where: { name: 'Beverages' } })
  const saladCategory = await prisma.category.findUnique({ where: { name: 'Salads' } })

  // Create items
  const items = [
    // Appetizers
    { name: 'Chicken Wings', description: 'Crispy buffalo wings', price: 12.99, categoryId: appetizerCategory!.id },
    { name: 'Mozzarella Sticks', description: 'Golden fried cheese sticks', price: 9.99, categoryId: appetizerCategory!.id },
    { name: 'Nachos Supreme', description: 'Loaded with cheese and toppings', price: 14.99, categoryId: appetizerCategory!.id },
    
    // Main Course
    { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon', price: 24.99, categoryId: mainCourseCategory!.id },
    { name: 'Ribeye Steak', description: '12oz prime ribeye', price: 32.99, categoryId: mainCourseCategory!.id },
    { name: 'Chicken Parmesan', description: 'Breaded chicken with marinara', price: 19.99, categoryId: mainCourseCategory!.id },
    { name: 'Margherita Pizza', description: 'Fresh mozzarella and basil', price: 16.99, categoryId: mainCourseCategory!.id },
    
    // Desserts
    { name: 'Chocolate Cake', description: 'Rich chocolate layer cake', price: 7.99, categoryId: dessertCategory!.id },
    { name: 'Cheesecake', description: 'New York style cheesecake', price: 6.99, categoryId: dessertCategory!.id },
    { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', price: 5.99, categoryId: dessertCategory!.id },
    
    // Beverages
    { name: 'Coca Cola', description: 'Classic cola', price: 2.99, categoryId: beverageCategory!.id },
    { name: 'Fresh Orange Juice', description: 'Freshly squeezed', price: 4.99, categoryId: beverageCategory!.id },
    { name: 'Coffee', description: 'Premium roast coffee', price: 3.99, categoryId: beverageCategory!.id },
    { name: 'Iced Tea', description: 'Sweet or unsweetened', price: 2.99, categoryId: beverageCategory!.id },
    
    // Salads
    { name: 'Caesar Salad', description: 'Romaine lettuce with caesar dressing', price: 11.99, categoryId: saladCategory!.id },
    { name: 'Greek Salad', description: 'Mixed greens with feta cheese', price: 12.99, categoryId: saladCategory!.id },
    { name: 'Garden Salad', description: 'Fresh mixed vegetables', price: 9.99, categoryId: saladCategory!.id },
  ]

  for (const item of items) {
    const existingItem = await prisma.item.findFirst({
      where: { name: item.name }
    })
    
    if (!existingItem) {
      await prisma.item.create({
        data: item,
      })
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log('👤 Admin login: admin@restaurant.com / admin123')
  console.log('👤 Staff login: staff@restaurant.com / staff123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 