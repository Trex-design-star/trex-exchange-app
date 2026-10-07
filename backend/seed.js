// Seed: demo customer + vendor with bond + 3 offers. Run: node seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const customer = await prisma.user.upsert({
    where: { email: 'customer@trex.demo' },
    update: {},
    create: { email: 'customer@trex.demo', emailVerified: true, name: 'Demo Customer' },
  });
  await prisma.profile.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id, countryCode: 'NG', localCurrency: 'NGN' },
  });
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@trex.demo' },
    update: {},
    create: { email: 'vendor@trex.demo', emailVerified: true, name: 'Demo Vendor' },
  });
  await prisma.profile.upsert({
    where: { userId: vendor.id },
    update: { vendorStatus: 'ACTIVE' },
    create: { userId: vendor.id, countryCode: 'NG', localCurrency: 'NGN', vendorStatus: 'ACTIVE' },
  });
  await prisma.bond.upsert({
    where: { vendorId: vendor.id },
    update: {},
    create: { vendorId: vendor.id, model: 'pertrade', base: 'USD', caps: { USD: 10000, NGN: 8000000, GBP: 4000, EUR: 6000 } },
  });
  await prisma.vendorOffer.deleteMany({ where: { vendorId: vendor.id } });
  const offers = [
    { provide: 'USD', want: 'NGN', rate: '1520', minMinor: 65 * 100, maxMinor: 330 * 100, capacityMinor: 4000 * 100, tier: 'Gold' },
    { provide: 'GBP', want: 'NGN', rate: '1940', minMinor: 103 * 100, maxMinor: 2060 * 100, capacityMinor: 3000 * 100, tier: 'Gold' },
    { provide: 'EUR', want: 'NGN', rate: '1650', minMinor: 60 * 100, maxMinor: 1500 * 100, capacityMinor: 2000 * 100, tier: 'Probation' },
  ];
  for (const o of offers) {
    await prisma.vendorOffer.create({
      data: { vendorId: vendor.id, ...o, minCcy: 'PROVIDE', methods: ['Bank transfer'], terms: 'Pay within 30 minutes.', capacityCcy: o.provide, live: true },
    });
  }
  console.log(JSON.stringify({ customerId: customer.id, vendorId: vendor.id }));
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
