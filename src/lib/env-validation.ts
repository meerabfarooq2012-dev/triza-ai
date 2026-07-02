/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  validate?: (value: string) => boolean;
}

const ENV_CONFIG: EnvVarConfig[] = [
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
  { name: 'DIRECT_URL', required: false, description: 'Direct database connection for Prisma (falls back to DATABASE_URL)' },
  { name: 'JWT_SECRET', required: true, description: 'Secret key for JWT token signing', validate: (v) => v.length >= 32 },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key' },
  { name: 'ADMIN_SETUP_KEY', required: false, description: 'Secret key for admin setup endpoint' },
  { name: 'ADMIN_EMAIL', required: false, description: 'Admin email address' },
  { name: 'ADMIN_PASSWORD', required: false, description: 'Admin password (auto-generated if not set)' },
  { name: 'SMTP_HOST', required: false, description: 'SMTP server host' },
  { name: 'SMTP_USER', required: false, description: 'SMTP username' },
  { name: 'SMTP_PASS', required: false, description: 'SMTP password' },
];

let validationResults: { name: string; status: 'ok' | 'missing' | 'invalid'; message: string }[] = [];
let validated = false;

export function validateEnvironment(): void {
  if (validated) return;
  validated = true;

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const config of ENV_CONFIG) {
    const value = process.env[config.name];

    if (!value) {
      if (config.required) {
        missing.push(config.name);
        validationResults.push({ name: config.name, status: 'missing', message: `Missing required: ${config.description}` });
      }
      continue;
    }

    if (config.validate && !config.validate(value)) {
      invalid.push(config.name);
      validationResults.push({ name: config.name, status: 'invalid', message: `Invalid value: ${config.description}` });
      continue;
    }

    validationResults.push({ name: config.name, status: 'ok', message: 'Set' });
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(name => console.error(`   - ${name}`));
    console.error('\nPlease set these in your .env file or Vercel environment variables.\n');
  }

  if (invalid.length > 0) {
    console.error('\n⚠️ Invalid environment variables:');
    invalid.forEach(name => console.error(`   - ${name}`));
  }

  if (missing.length === 0 && invalid.length === 0) {
    console.log('✅ All required environment variables are set');
  }
}

export function getValidationResults() {
  return validationResults;
}
