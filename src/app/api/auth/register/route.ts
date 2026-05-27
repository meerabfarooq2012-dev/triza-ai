import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'buyer' } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (!['buyer', 'seller', 'both'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be buyer, seller, or both' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    if (role === 'seller' || role === 'both') {
      const baseSlug = slugify(name);
      let slug = baseSlug;
      let counter = 1;

      while (await db.shop.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      await db.shop.create({
        data: {
          userId: user.id,
          name: `${name}'s Shop`,
          slug,
          description: `Welcome to ${name}'s shop!`,
        },
      });
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: { shop: true },
    });

    const { password: _, ...userWithoutPassword } = fullUser!;

    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
