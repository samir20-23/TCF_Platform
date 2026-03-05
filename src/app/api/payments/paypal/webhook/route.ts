import { NextResponse } from 'next/server';
import { activateSubscription } from '@/lib/subscription-manager';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // PayPal Webhook Verification (Optional but recommended for production)
        // For now, we trust the event if it has the expected structure
        // In production, use PayPal SDK or call v1/notifications/verify-webhook-signature

        const eventType = body.event_type;

        if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const resource = body.resource;

            // Extract metadata from custom_id (formatted as "userId|planId")
            // PayPal custom_id can be in various places depending on the event
            const customId = resource.custom_id ||
                (resource.purchase_units && resource.purchase_units[0]?.custom_id);

            if (!customId) {
                console.warn('PayPal Webhook: Missing custom_id in resource, skipping activation');
                return NextResponse.json({ received: true, note: 'Missing metadata' });
            }

            const [userId, planId] = customId.split('|');

            if (!userId || !planId) {
                console.error('PayPal Webhook: Invalid custom_id format', customId);
                return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
            }

            const amountValue = resource.amount?.value ||
                (resource.purchase_units && resource.purchase_units[0]?.amount?.value) ||
                (resource.seller_receivable_breakdown?.gross_amount?.value);

            const currencyCode = resource.amount?.currency_code ||
                (resource.purchase_units && resource.purchase_units[0]?.amount?.currency_code) ||
                (resource.seller_receivable_breakdown?.gross_amount?.currency_code);

            await activateSubscription({
                userId,
                planId,
                provider: 'paypal',
                providerPaymentId: resource.id,
                amountCents: amountValue ? Math.round(parseFloat(amountValue) * 100) : 0,
                currency: currencyCode || 'MAD',
                metadata: { paypalEvent: eventType, paypalOrderId: resource.id }
            });

            console.log(`Subscription activated via PayPal for user ${userId}, plan ${planId}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('PayPal Webhook error:', error);
        return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
    }
}
