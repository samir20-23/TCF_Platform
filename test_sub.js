const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jxeermfduuytnbyimaty.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZWVybWZkdXV5dG5ieWltYXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3MDEwMywiZXhwIjoyMDg1MzQ2MTAzfQ.cTx_giszRjAjMUk6TqmkyEYaZNXJ9al8_pARp9IlooA'
);

async function run() {
    // Get an admin user
    const { data: users, error: uErr } = await supabase.from('users').select('id').limit(1);
    if (uErr) { console.error('User fetch err:', uErr); return; }
    const userId = users[0].id;

    // Get a plan
    const { data: plans, error: pErr } = await supabase.from('plans').select('id, name').limit(1);
    if (pErr) { console.error('Plan fetch err:', pErr); return; }
    const planId = plans[0].id;

    console.log(`Testing with User: ${userId}, Plan: ${planId}`);

    try {
        const startAt = new Date();
        const endAt = new Date();
        endAt.setDate(endAt.getDate() + 30);

        console.log('Inserting subscription...');
        const { data: newSub, error: insertErr } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan_id: planId,
                start_at: startAt.toISOString(),
                end_at: endAt.toISOString(),
                status: 'active',
            })
            .select('id')
            .single();

        if (insertErr) {
            console.error('Subscription insert error:', insertErr);
        } else {
            console.log('Subscription inserted:', newSub);
            // Clean it up
            await supabase.from('subscriptions').delete().eq('id', newSub.id);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

run().catch(console.error);
