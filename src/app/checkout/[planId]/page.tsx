import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/common/PublicHeader';
import CheckoutPageClient from './components/CheckoutPageClient';

interface Props {
  params: Promise<{ planId: string }>;
}

async function getPlan(planId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/plans`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const plans: any[] = data.plans || [];
    return plans.find((p) => p.id === planId) || null;
  } catch {
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
