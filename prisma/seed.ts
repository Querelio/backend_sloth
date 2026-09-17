import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const INTERVENANT_ROLE = 'Intervenant';
const RETIRED_ROLES = ['Administrateur', 'Intervenants', 'Spectateur'];

const pricingModes = [
  'Heure',
  'Demi-journee',
  'Journee',
  'Forfait',
  'Libre',
];

const statuses = [
  'Planifiée',
  'Réalisée',
  'Déclarée',
  'Facturée',
  'Réglée',
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function seedByName(
  model: { findFirst: Function; create: Function },
  names: string[],
) {
  for (const name of names) {
    try {
      const existing = await model.findFirst({ where: { name } });
      if (!existing) {
        await model.create({ data: { name } });
      }
    } catch (error) {
      throw new Error(`Failed to seed "${name}"`, { cause: error });
    }
  }
}

async function seedIntervenantRole() {
  try {
    let intervenant = await prisma.role.findFirst({
      where: { name: INTERVENANT_ROLE },
    });

    if (!intervenant) {
      intervenant = await prisma.role.create({
        data: { name: INTERVENANT_ROLE },
      });
    }

    await prisma.user.updateMany({
      data: { roleId: intervenant.id },
    });

    await prisma.role.deleteMany({
      where: { name: { in: RETIRED_ROLES } },
    });
  } catch (error) {
    throw new Error('Failed to seed Intervenant role', { cause: error });
  }
}

async function main() {
  await seedIntervenantRole();
  await seedByName(prisma.pricingMode, pricingModes);
  await seedByName(prisma.status, statuses);

  const [roleCount, pricingModeCount, statusCount] = await Promise.all([
    prisma.role.count(),
    prisma.pricingMode.count(),
    prisma.status.count(),
  ]);

  console.log('Seed completed:');
  console.log(`  Roles: ${roleCount}`);
  console.log(`  Pricing modes: ${pricingModeCount}`);
  console.log(`  Statuses: ${statusCount}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
