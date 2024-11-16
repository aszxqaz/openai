import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'argon2';
const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.user.create({
      data: {
        username: 'user',
        role: UserRole.User,
        account: {
          create: {
            availableCredits: 5000,
          },
        },
        credentials: {
          create: {
            hash: await hash('password'), // Replace with a hashed password
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        username: 'admin',
        role: UserRole.Admin,
        account: {
          create: {
            availableCredits: 5000,
          },
        },
        credentials: {
          create: {
            hash: await hash('password'), // Replace with a hashed password
          },
        },
      },
    }),
    prisma.model.createMany({
      data: [
        {
          creditsPerToken: 25,
          name: 'gpt-4o',
        },
        {
          creditsPerToken: 50,
          name: 'gpt-3.5-turbo',
        },
      ],
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
