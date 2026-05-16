import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tracked.com' },
    update: { role: Role.ADMIN },
    create: {
      email: 'admin@tracked.com',
      password,
      name: 'Admin tracked',
      role: Role.ADMIN,
      events: {
        create: [
          {
            eventName: 'page_view',
            metadata: { page: 'dashboard', browser: 'Chrome' },
          },
          {
            eventName: 'button_click',
            metadata: { buttonId: 'start_trial', location: 'hero' },
          },
          {
            eventName: 'signup_completed',
            metadata: { plan: 'trial' },
          },
        ],
      },
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: 'demo@tracked.com' },
    update: {},
    create: {
      email: 'demo@tracked.com',
      password,
      name: 'Demo User',
      role: Role.USER,
      events: {
        create: [
          {
            eventName: 'page_view',
            metadata: { page: '/pricing' },
          },
          {
            eventName: 'cta_click',
            metadata: { target: 'contact_sales' },
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'inactive@tracked.com' },
    update: {},
    create: {
      email: 'inactive@tracked.com',
      password,
      name: 'No Events',
      role: Role.USER,
    },
  });

  console.log('Seed completed.');
  console.table([
    { email: admin.email, role: admin.role, demoPassword: 'password123' },
    { email: demo.email, role: demo.role, demoPassword: 'password123' },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
