const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jxeermfduuytnbyimaty.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3MDEwMywiZXhwIjoyMDg1MzQ2MTAzfQ.cTx_giszRjAjMUk6TqmkyEYaZNXJ9al8_pARp9IlooA'
);

async function run() {
    const { data: payments, error: ptErr } = await supabase.from('payments').select('*');
    console.log('Payments count:', payments?.length);
    if (payments?.length > 0) {
        console.log('Payments:', payments);
    } else {
        console.log('Err:', ptErr?.message);
    }
}

run().catch(console.error);
