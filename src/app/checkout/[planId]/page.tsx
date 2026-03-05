import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/common/PublicHeader';
import CheckoutPageClient from './components/CheckoutPageClient';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ planId: string }>;
}

async function getPlan(planId: string) {
  try {
    const supabase = await createClient();
    const { data: plan, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('active', true)
      .single();

    if (error || !plan) return null;
    return plan;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { planId } = await params;
  const plan = await getPlan(planId);
  if (!plan) return { title: 'Checkout – TCF Canada' };
  return {
    title: `Acheter le plan ${plan.name} – TCF Canada`,
    description: `Créez votre compte et commencez votre préparation TCF Canada avec le plan ${plan.name}.`,
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { planId } = await params;
  const plan = await getPlan(planId);

  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <PublicHeader /> */}
      <main>
        <CheckoutPageClient plan={plan} />
      </main>
    </div>
  );
}
