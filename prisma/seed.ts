import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Initial users for collaborative annotation
// Passwords are securely hashed with bcrypt
async function main() {
  await prisma.user.upsert({
    where: { username: 'Manouk' },
    update: {},
    create: {
      username: 'Manouk',
      password: '$2b$10$aw.ER7CJ5Qtkh77YCnBdIuvMDsyXMU53Qf7GIkozEyH6ZqW1AJFP2', // pass: 1011
    },
  });
  await prisma.user.upsert({
    where: { username: 'Chuck' },
    update: {},
    create: {
      username: 'Chuck',
      password: '$2b$10$L6COPnooKZtKQGzY6sNZH.kNmhRrgCVTDIvJweBTRiHO8ybYyQmAe', // pass: 1234
    },
  });
  await prisma.user.upsert({
    where: { username: 'Eric' },
    update: {},
    create: {
      username: 'Eric',
      password: '$2b$10$VvhefE0xR5NeO7dqPrDkGO.g9sBXTcpSfwFIlS9G0pcci.kTsf442', // pass: 1234
    },
  });
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: '$2b$10$w8QwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQw', // pass: admin123
      isAdmin: true,
    },
  });
}

main()
  .then(() => {
    console.log('Seeded users successfully.');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 
