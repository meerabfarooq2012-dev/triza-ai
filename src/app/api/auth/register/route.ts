import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendEmailAsync } from '@/lib/email';
import { getSafeErrorMessage } from '@/lib/error-handler';
import { welcomeEmail, emailVerificationEmail } from '@/lib/email-templates';
import { notifyWelcome } from '@/lib/notifications';
import { rateLimit, getFingerprintedRateLimitKey, registerRateLimit } from '@/lib/rate-limit';
import { signToken, signRefreshToken, setAuthCookies } from '@/lib/auth-middleware';
import { createSession } from '@/lib/session';
import { randomBytes, createHash } from 'crypto';
import { sanitizeString, normalizeEmail, isValidEmail, isStrongPassword } from '@/lib/sanitize';
import { validateInput, registerSchema } from '@/lib/validation';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// NOTE: withCsrf is intentionally NOT used on the register endpoint.
// Registration is an unauthenticated endpoint — CSRF protection is less critical here
// because the user has no authenticated session to protect yet.
export const POST = async (request: NextRequest) => {
  try {
    // Rate limiting — use fingerprinted key (IP + User-Agent) for stricter registration limiting
    const rateLimitKey = getFingerprintedRateLimitKey(request, 'register');
    const rateLimitResult = rateLimit({
      ...registerRateLimit,
      key: rateLimitKey,
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

    // Validate input with Zod schema
    const validation = validateInput(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { password, termsAccepted } = validation.data;
    const role = validation.data.role || 'buyer';

    // Normalize and sanitize inputs from validated data
    const email = normalizeEmail(validation.data.email);
    const name = sanitizeString(validation.data.name);

    // Additional domain-specific email validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: 'You must agree to the Terms of Service and Privacy Policy' },
        { status: 400 }
      );
    }

    if (!['buyer', 'seller', 'both'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be buyer, seller, or both' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: `Password requirements not met: ${passwordCheck.errors.join(', ')}` },
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
    const verifyToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(verifyToken).digest('hex');

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        emailVerified: false,
        emailVerifyToken: hashedToken,
        termsAcceptedAt: new Date(),
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

    // Generate JWT token and refresh token
    const authPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signToken(authPayload);
    const refreshToken = signRefreshToken(authPayload);

    // Create a session record in the database (token is hashed, never stored raw)
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',').map(s => s.trim()).slice(-1)[0] ||
      undefined;

    await createSession(user.id, token, userAgent, ipAddress).catch((err) => {
      // Log but don't block registration if session creation fails
      console.error('Failed to create session:', err);
    });

    // Send welcome email (non-blocking)
    sendEmailAsync({
      to: email,
      subject: 'Welcome to Thiora! 🎉',
      html: welcomeEmail({ name, role }),
    });

    // Send email verification (non-blocking)
    // Note: we send the raw token in the email link, but store the hashed version
    const verifyUrl = `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://marketo-alpha.vercel.app'}?verify=${verifyToken}`;
    sendEmailAsync({
      to: email,
      subject: 'Verify your email — Thiora',
      html: emailVerificationEmail(name, verifyUrl),
    });

    // Send welcome notification (non-blocking)
    notifyWelcome(user.id, name).catch(() => {});

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

    // Set httpOnly cookies for both tokens
    setAuthCookies(response, token, refreshToken);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to register user') },
      { status: 500 }
    );
  }
};
