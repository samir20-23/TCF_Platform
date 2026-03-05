import { NextResponse } from 'next/server';
import { activateSubscription } from '@/lib/subscription-manager';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
        }

        const stripe = (await import('@/lib/payments/stripe')).default;
        if (!stripe) {
            throw new Error('Stripe is not configured.');
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({
                error: 'Payment not completed',
                status: session.payment_status
            }, { status: 402 });
        }

        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) {
            return NextResponse.json({ error: 'Missing metadata in session' }, { status: 400 });
        }

        const result = await activateSubscription({
            userId,
            planId,
            provider: 'stripe',
            providerPaymentId: session.payment_intent as string || session.id,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'MAD',
            metadata: { sessionId: session.id, source: 'verify-session' }
        });

        return NextResponse.json({
            success: true,
            subscriptionId: result.subscriptionId,
            alreadyProcessed: result.alreadyProcessed || false
        });
    } catch (error: any) {
        console.error('Verify session error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
