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
    where: { email: 'admin@trackflow.com' },
    update: { role: Role.ADMIN },
    create: {
      email: 'admin@trackflow.com',
      password,
      name: 'Admin TrackFlow',
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
    where: { email: 'demo@trackflow.com' },
    update: {},
    create: {
      email: 'demo@trackflow.com',
      password,
      name: 'Usuário Demo',
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
    where: { email: 'inactive@trackflow.com' },
    update: {},
    create: {
      email: 'inactive@trackflow.com',
      password,
      name: 'Sem eventos',
      role: Role.USER,
    },
  });

  console.log('Seed concluído.');
  console.table([
    { email: admin.email, role: admin.role, senhaDemo: 'password123' },
    { email: demo.email, role: demo.role, senhaDemo: 'password123' },
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
