import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { sendEmailAsync } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';
import { signToken, signRefreshToken, setAuthCookies } from '@/lib/auth-middleware';
import { createSession } from '@/lib/session';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub?: string;
  email_verified?: boolean;
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { accessToken, role = 'buyer' } = body;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Google access token is required' },
        { status: 400 }
      );
    }

    if (!['buyer', 'seller', 'both'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be buyer, seller, or both' },
        { status: 400 }
      );
    }

    // Verify the access token by calling Google's userinfo endpoint
    const googleResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!googleResponse.ok) {
      console.error('[Google Auth] Failed to verify token:', googleResponse.status);
      return NextResponse.json(
        { success: false, error: 'Failed to verify Google token' },
        { status: 401 }
      );
    }

    const googleUser: GoogleUserInfo = await googleResponse.json();

    if (!googleUser.email) {
      return NextResponse.json(
        { success: false, error: 'Google account does not have an email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: googleUser.email },
      include: { shop: true },
    });

    if (existingUser) {
      // User exists — check if active
      if (!existingUser.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated' },
          { status: 403 }
        );
      }

      // Update avatar if user doesn't have one and Google provides one
      if (!existingUser.avatar && googleUser.picture) {
        await db.user.update({
          where: { id: existingUser.id },
          data: { avatar: googleUser.picture },
        });
      }

      // Refetch user with updated avatar
      const updatedUser = await db.user.findUnique({
        where: { id: existingUser.id },
        include: { shop: true },
      });

      const { password: _, ...userWithoutPassword } = updatedUser!;

      // Generate tokens for existing user
      const authPayload = {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      };
      const token = signToken(authPayload);
      const refreshToken = signRefreshToken(authPayload);

      // Create session
      const userAgent = request.headers.get('user-agent') || undefined;
      const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
      await createSession(existingUser.id, token, userAgent, ipAddress).catch(() => {});

      const response = NextResponse.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
        },
      });

      // Set httpOnly cookies
      setAuthCookies(response, token, refreshToken);

      return response;
    }

    // New user — create account
    const hashedPassword = await bcrypt.hash(randomUUID(), 12);

    const user = await db.user.create({
      data: {
        email: googleUser.email,
        password: hashedPassword,
        name: googleUser.name || googleUser.email.split('@')[0],
        avatar: googleUser.picture || null,
        role,
      },
    });

    // Create shop if seller or both
    if (role === 'seller' || role === 'both') {
      const baseSlug = slugify(googleUser.name || googleUser.email.split('@')[0]);
      let slug = baseSlug;
      let counter = 1;

      while (await db.shop.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const shopName = googleUser.name
        ? `${googleUser.name}'s Shop`
        : `${googleUser.email.split('@')[0]}'s Shop`;

      await db.shop.create({
        data: {
          userId: user.id,
          name: shopName,
          slug,
          description: `Welcome to ${shopName}!`,
        },
      });
    }

    // Fetch full user with shop
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: { shop: true },
    });

    const { password: _, ...userWithoutPassword } = fullUser!;

    // Generate tokens for new user
    const authPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signToken(authPayload);
    const refreshToken = signRefreshToken(authPayload);

    // Create session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
    await createSession(user.id, token, userAgent, ipAddress).catch(() => {});

    // Send welcome email (non-blocking)
    sendEmailAsync({
      to: googleUser.email,
      subject: 'Welcome to Thiora! 🎉',
      html: welcomeEmail({ name: googleUser.name || googleUser.email.split('@')[0], role }),
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
        },
      },
      { status: 201 }
    );

    // Set httpOnly cookies
    setAuthCookies(response, token, refreshToken);

    return response;
  } catch (error) {
    console.error('[Google Auth] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
}
