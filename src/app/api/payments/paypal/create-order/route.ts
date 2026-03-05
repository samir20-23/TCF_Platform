import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPayPalOrder } from '@/lib/payments/paypal';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, successUrl, cancelUrl } = body;

        if (!planId) {
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        // Get plan details
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const order = await createPayPalOrder({
            planId: plan.id,
            planName: plan.name,
            priceCents: plan.price_cents,
            userId: user.id,
            currency: plan.currency || 'USD',
            successUrl,
            cancelUrl,
        });

        return NextResponse.json({
            orderId: order.id,
            url: order.url,
        });
    } catch (error: any) {
        console.error('PayPal session error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create PayPal order' },
            { status: 500 }
        );
    }
}
