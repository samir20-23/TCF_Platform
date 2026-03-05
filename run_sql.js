const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running migration...');
    const migrationSql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20260301_exam_engine.sql'), 'utf-8');

    // Supabase JS doesn't have a direct 'execute multiple sql statements' method via RPC unless a custom function 'exec_sql' is created.
    console.log('\n======================================================');
    console.log('⚠️ ACTIVATE YOUR EXAM ENGINE DATABASE CHANGES ⚠️');
    console.log('======================================================\n');
    console.log('Since Docker isn\'t running locally for `supabase db push`, you must run the SQL manually.\n');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql');
    console.log('2. Copy the contents of this file:');
    console.log(`   ${path.join(__dirname, 'supabase', 'migrations', '20260301_exam_engine.sql')}`);
    console.log('3. Paste it into the SQL Editor and click RUN.');
    console.log('4. Next, copy the contents of this file:');
    console.log(`   ${path.join(__dirname, 'supabase', 'seed_tests.sql')}`);
    console.log('5. Paste it into the SQL Editor and click RUN.\n');
    console.log('Once done, your tests will appear in the dashboard for anybody who bought a plan!\n');
}
run();
