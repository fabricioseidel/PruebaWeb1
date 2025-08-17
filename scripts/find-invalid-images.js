const { PrismaClient } = require('../src/generated/prisma');
const prismaClient = new PrismaClient();

async function run() {
  try {
    const categories = await prismaClient.category.findMany({ select: { id: true, name: true, image: true } });
  const products = await prismaClient.product.findMany({ select: { id: true, name: true, images: true } });

    const invalidCats = categories.filter(c => {
      const v = c.image;
      if (!v) return false;
      const s = String(v).trim();
      return !(s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:'));
    });

    const invalidProducts = products.filter(p => {
      const raw = p.images;
      if (!raw) return false;
      let arr = [];
      try {
        arr = JSON.parse(raw);
        if (!Array.isArray(arr)) arr = [String(arr)];
      } catch {
        // fallback: comma separated
        arr = String(raw).split(',').map(s => s.trim()).filter(Boolean);
      }
      const bad = arr.some(i => {
        if (!i) return false;
        const s = String(i).trim();
        return !(s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:'));
      });
      return bad;
    });

    console.log('Invalid categories count:', invalidCats.length);
    invalidCats.forEach(c => console.log(JSON.stringify(c)));

    console.log('\nInvalid products count:', invalidProducts.length);
    invalidProducts.forEach(p => console.log(JSON.stringify(p)));

    process.exit(0);
  } catch (err) {
    console.error('Error querying DB', err);
    process.exit(1);
  }
}

run();
