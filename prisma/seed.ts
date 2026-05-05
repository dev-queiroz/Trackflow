import { PrismaClient } from '@prisma/client';
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

  const user = await prisma.user.upsert({
    where: { email: 'admin@trackflow.com' },
    update: {},
    create: {
      email: 'admin@trackflow.com',
      password,
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
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log({ userEmail: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
