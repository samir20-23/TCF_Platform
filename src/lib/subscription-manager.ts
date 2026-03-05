import { getAdminClient } from './supabase/admin';

export interface SubscriptionActivationParams {
    userId: string;
    planId: string;
    provider: 'stripe' | 'paypal' | 'manual';
    providerPaymentId: string;
    amountCents: number;
    currency: string;
    metadata?: any;
}

export async function activateSubscription({
    userId,
    planId,
    provider,
    providerPaymentId,
    amountCents,
    currency,
    metadata = {}
}: SubscriptionActivationParams) {
    const supabase = getAdminClient();
    if (!supabase) {
        throw new Error('Supabase admin client not initialized');
    }

    // 1. Idempotency Check: Prevent duplicate processing for same payment ID
    const { data: existingPayment } = (await supabase
        .from('payments')
        .select('id, subscription_id')
        .eq('provider_payment_id', providerPaymentId)
        .maybeSingle()) as any;

    if (existingPayment) {
        console.log(`Payment ${providerPaymentId} already processed. Skipping activation.`);
        return {
            subscriptionId: existingPayment.subscription_id,
            status: 'active',
            alreadyProcessed: true
        };
    }

    // 2. Get plan details
    const { data: plan, error: planErr } = (await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()) as any;

    if (planErr || !plan) {
        throw new Error(`Plan not found: ${planId}`);
    }

    // 3. Calculate start/end dates
    const startAt = new Date();
    const endAt = new Date();
    const durationDays = (plan as any).duration_days || 30;
    endAt.setDate(endAt.getDate() + durationDays);

    // Create new subscription
    const { data: newSub, error: insertErr } = (await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            plan_id: planId,
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
            status: 'active',
        } as any)
        .select('id')
        .single()) as any;

    if (insertErr) throw insertErr;
    const subscriptionId = (newSub as any).id;

    // 5. Create payment record
    await supabase.from('payments').insert({
        user_id: userId,
        subscription_id: subscriptionId,
        provider,
        provider_payment_id: providerPaymentId,
        amount_cents: amountCents,
        currency: currency.toUpperCase() || 'MAD',
        status: 'paid',
    } as any);

    // 6. Copy plan_tests → sub_test_access
    const { data: planTests } = await supabase
        .from('plan_tests')
        .select('id, test_id, max_attempts, manual_correction')
        .eq('plan_id', planId) as any;

    if (planTests && (planTests as any[]).length > 0) {
        const accessRows = (planTests as any[]).map((pt: any) => ({
            subscription_id: subscriptionId,
            plan_test_id: pt.id,
            test_id: pt.test_id,
            remaining_attempts: pt.max_attempts || 0,
            max_attempts: pt.max_attempts || 0,
            manual_correction: pt.manual_correction || false
        }));

        await supabase.from('sub_test_access').insert(accessRows as any);
    }

    // 7. Log action
    await supabase.from('actions').insert({
        actor_type: 'system',
        actor_id: userId,
        action_type: 'subscription_activated',
        target_type: 'subscription',
        target_id: subscriptionId,
        details: JSON.stringify({
            planId,
            planName: (plan as any).name,
            provider,
            amountCents,
            currency,
            durationDays,
            ...metadata
        }),
    } as any);

    return { subscriptionId, status: 'active' };
}
