import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { activateSubscription } from '@/lib/subscription-manager';

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
        }

        let event;
        try {
            event = await verifyStripeWebhook(body, signature);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const userId = session.metadata?.userId;
                const planId = session.metadata?.planId;

                if (!userId || !planId) {
                    console.error('Missing userId or planId in metadata', session.metadata);
                    break;
                }

                // Activate subscription using the streamlined manager
                await activateSubscription({
                    userId,
                    planId,
                    provider: 'stripe',
                    providerPaymentId: session.payment_intent || session.id,
                    amountCents: session.amount_total || 0,
                    currency: session.currency || 'MAD',
                    metadata: { sessionId: session.id }
                });

                console.log(`Subscription activated for user ${userId}, plan ${planId}`);
                break;
            }

            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Stripe Webhook error:', error);
        return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
