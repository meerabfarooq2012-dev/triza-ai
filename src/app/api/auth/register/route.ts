import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendEmailAsync } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';
import { notifyWelcome } from '@/lib/notifications';
import { rateLimit, getRateLimitKey, authRateLimit } from '@/lib/rate-limit';
import { signToken } from '@/lib/auth-middleware';
import { randomBytes } from 'crypto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...authRateLimit,
      key: `register:${rateLimitKey}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

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
    const emailVerifyToken = randomBytes(32).toString('hex');

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        emailVerified: false,
        emailVerifyToken,
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

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Send welcome email (non-blocking)
    sendEmailAsync({
      to: email,
      subject: 'Welcome to Marketo! 🎉',
      html: welcomeEmail({ name, role }),
    });

    // Send welcome notification (non-blocking)
    notifyWelcome(user.id, name).catch(() => {});

    return NextResponse.json(
      { success: true, data: userWithoutPassword, token },
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
