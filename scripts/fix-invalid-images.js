const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

function isValidImageString(s) {
  if (!s) return false;
  const t = String(s).trim();
  return t.startsWith('/') || t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:');
}

async function run() {
  try {
    const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
    const toFix = [];
    for (const p of products) {
      const raw = p.images;
      if (!raw) continue;
      let arr = [];
      try {
        arr = JSON.parse(raw);
        if (!Array.isArray(arr)) arr = [String(arr)];
      } catch {
        arr = String(raw).split(',').map(s => s.trim()).filter(Boolean);
      }
      const bad = arr.some(i => !isValidImageString(i));
      if (bad) toFix.push(p);
    }

    console.log('Products to fix:', toFix.length);
    for (const p of toFix) {
      await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify(['/file.svg']) } });
      console.log('Fixed', p.id, p.name);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
}

run();
