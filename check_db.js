const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jxeermfduuytnbyimaty.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZWVybWZkdXV5dG5ieWltYXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3MDEwMywiZXhwIjoyMDg1MzQ2MTAzfQ.cTx_giszRjAjMUk6TqmkyEYaZNXJ9al8_pARp9IlooA'
);

async function run() {
    const { data: plans, error: pErr } = await supabase.from('plans').select('id, name');
    console.log('Plans err:', pErr?.message || 'None');
    console.log('Plans:', plans);

    if (plans && plans.length > 0) {
        const planIds = plans.map(p => p.id);
        const { data: planTests, error: ptErr } = await supabase.from('plan_tests').select('*').in('plan_id', planIds);
        console.log('Plan Tests err:', ptErr?.message);
        console.log('Plan Tests count:', planTests?.length);
    }

    // Check recent subscriptions
    const { data: subs, error: sErr } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(3);
    console.log('Recent Subs err:', sErr?.message);
    console.log('Recent Subs:', subs);

    if (subs && subs.length > 0) {
        const { data: sta } = await supabase.from('sub_test_access').select('*').eq('subscription_id', subs[0].id);
        console.log('Sub test access for most recent sub:', sta?.length);
    }
}

run().catch(console.error);
