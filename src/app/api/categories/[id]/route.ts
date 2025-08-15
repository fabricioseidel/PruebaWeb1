import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/categories/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching category" }, { status: 500 });
  }
}

// PATCH /api/categories/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, isActive } = body;
    const normalizeSlug = (value: string) => value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(slug !== undefined ? { slug: normalizeSlug(String(slug)) } : {}),
        ...(description !== undefined ? { description: description ? String(description) : null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      image: updated.image,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      productsCount: updated._count.products,
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug or name already exists' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error updating category" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json({ error: "No se puede eliminar una categoría con productos asociados" }, { status: 400 });
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error deleting category" }, { status: 500 });
  }
}
