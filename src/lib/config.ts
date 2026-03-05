/**
 * Centralized configuration for TCF Canada
 * Validates environment variables and provides typed access
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

export const config = {
  // Supabase
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    // Non-public versions for server-side usage if needed
    url_private: getEnvVar('SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey_private: getEnvVar('SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },

  // Stripe (optional — app works without Stripe configured)
  stripe: {
    publishableKey: getOptionalEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || '',
    webhookSecret: getOptionalEnvVar('STRIPE_WEBHOOK_SECRET'),
  },

  // PayPal
  paypal: {
    clientId: getOptionalEnvVar('PAYPAL_CLIENT_ID'),
    clientSecret: getOptionalEnvVar('PAYPAL_CLIENT_SECRET'),
    // webhookId: getOptionalEnvVar('PAYPAL_WEBHOOK_ID'),
    mode: (process.env.PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live',
  },

  // Application
  app: {
    siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
} as const;

/** Alias used by src/lib/supabase/admin.ts */
export const supabaseConfig = config.supabase;

/** Alias used by src/app/api/stripe-webhook/route.ts */
export const stripeConfig = config.stripe;

/** Alias for app config */
export const appConfig = config.app;

// Type-safe environment check
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
