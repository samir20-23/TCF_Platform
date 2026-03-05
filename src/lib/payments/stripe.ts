import Stripe from 'stripe';
import { stripeConfig, appConfig } from '../config';

// Initialize Stripe
const stripe = stripeConfig.secretKey
    ? new Stripe(stripeConfig.secretKey, { apiVersion: '2024-12-18.acacia' as any })
    : null;

export interface CreateCheckoutSessionParams {
    planId: string;
    planName: string;
    priceCents: number;
    userId: string;
    successUrl?: string;
    cancelUrl?: string;
    currency?: string;
}

export async function createStripeCheckoutSession({
    planId,
    planName,
    priceCents,
    userId,
    successUrl,
    cancelUrl,
    currency = 'MAD'
}: CreateCheckoutSessionParams) {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment.');
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: planName,
                    },
                    unit_amount: priceCents,
                },
                quantity: 1,
            },
        ],
        success_url: successUrl || `${appConfig.siteUrl}/student-dashboard?checkout=success`,
        cancel_url: cancelUrl || `${appConfig.siteUrl}/pricing-plans?checkout=canceled`,
        metadata: {
            userId,
            planId,
            planName,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
    });

    return session;
}

export async function verifyStripeWebhook(body: string, signature: string) {
    if (!stripe || !stripeConfig.webhookSecret) {
        throw new Error('Stripe or Webhook secret not configured');
    }

    return stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
}

export default stripe;
