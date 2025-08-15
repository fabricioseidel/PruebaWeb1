import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productsCount: c._count.products,
    })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const normalizeSlug = (value: string) => value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const { name, slug, description, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const finalSlug = normalizeSlug(slug);
    const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug: finalSlug }] } });
    if (exists) {
      return NextResponse.json({ error: "Category with same name or slug already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name: String(name).trim(),
        slug: finalSlug,
        description: description ? String(description) : null,
        isActive: isActive ?? true,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productsCount: category._count.products,
    }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error creating category" }, { status: 500 });
  }
}
