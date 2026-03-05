import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: plans, error } = await supabase
            .from('plans')
            .select('id, name, description, price_cents, duration_days, currency, features, is_popular, active')
            .eq('active', true)
            .order('price_cents', { ascending: true });

        if (error) {
            console.error('Error fetching plans:', error);
            return NextResponse.json(
                { error: 'Failed to fetch plans' },
                { status: 500 }
            );
        }

        return NextResponse.json({ plans });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
