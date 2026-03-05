import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // userId is now passed from the frontend after signUp
        const { planId, successUrl, cancelUrl, userId: requestUserId } = body;

        if (!planId) {
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        // Get authenticated user if available
        const { data: { user: authUser } } = await supabase.auth.getUser();

        // Use userId from request (preferred for new signups) or auth session
        const userId = requestUserId || authUser?.id;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized — userId is required' },
                { status: 401 }
            );
        }

        // Get plan details
        const adminClient = getAdminClient();
        if (!adminClient) throw new Error('Admin client not configured');

        const { data: plan, error: planError } = await adminClient
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Initialize Stripe
        const stripe = (await import('@/lib/payments/stripe')).default;
        if (!stripe) {
            throw new Error('Stripe is not configured.');
        }

        const { appConfig } = await import('@/lib/config');

        // Create metadata for the session
        const metadata: Record<string, string> = {
            userId: userId,
            planId: (plan as any).id,
            planName: (plan as any).name,
        };

        // Create the Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: ((plan as any).currency || 'MAD').toLowerCase(),
                        product_data: { name: (plan as any).name },
                        unit_amount: (plan as any).price_cents,
                    },
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${appConfig.siteUrl}/checkout/success?plan=${encodeURIComponent((plan as any).name)}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${appConfig.siteUrl}/pricing-plans`,
            metadata,
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            // Pre-fill email if we have it
            customer_email: authUser?.email || undefined,
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('Stripe session error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
