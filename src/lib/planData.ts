export const PLAN_DATA = [
  {
    id: 'essential',
    name: 'Essentiel',
    price: 99.99,
    currency: 'USD',
    durationDays: 15,
    highlights: [
      'Compréhension écrite : 40 tests',
      'Compréhension orale : 40 tests',
      'Simulateur d’expression écrite : 3 essais corrigés automatiquement',
      'Accès : 15 jours',
      'Version 2026 conforme'
    ],
    ctaLabel: "S'abonner",
    popular: false
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 129.99,
    currency: 'USD',
    durationDays: 30,
    highlights: [
      'Compréhension écrite : 40 tests',
      'Compréhension orale : 40 tests',
      'Expression écrite : 5 essais corrigés',
      'Expression orale : 5 retours',
      'Accès : 30 jours'
    ],
    ctaLabel: "S'abonner",
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149.99,
    currency: 'USD',
    durationDays: 60,
    highlights: [
      'Compréhension écrite : 40 tests (+1000 textes)',
      'Compréhension orale : 40 tests (+1000 extraits sonores)',
      'Expression écrite : 8 essais corrigés par formateur',
      'Expression orale : 8 sujets et corrections',
      'Support prioritaire',
      'Accès : 60 jours'
    ],
    ctaLabel: "S'abonner",
    popular: true
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 199.99,
    currency: 'USD',
    durationDays: 90,
    highlights: [
      'Tout le contenu Premium',
      '15 essais écrits corrigés par formateur',
      '15 retours oraux personnalisés',
      'Coach stratégique individuel',
      'Support 24/7',
      'Accès : 90 jours'
    ],
    ctaLabel: "S'abonner",
    popular: false
  }
];

export default PLAN_DATA;
