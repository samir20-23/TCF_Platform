'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const faqs = [
    {
        question: "Qu'est-ce que le TCF Canada ?",
        answer: "Le TCF Canada est un test de connaissance du français spécifiquement conçu pour les personnes qui souhaitent immigrer au Canada. Il évalue les compétences en compréhension orale, compréhension écrite, expression orale et expression écrite.",
    },
    {
        question: "Comment fonctionne la plateforme ?",
        answer: "Après votre inscription et le choix d'un plan, vous accédez immédiatement à des simulations chronométrées et des exercices. Chaque test est corrigé automatiquement pour les épreuves de compréhension, et manuellement par des professionnels pour les épreuves d'expression.",
    },
    {
        question: "Les corrections sont-elles faites par des professionnels ?",
        answer: "Oui, les épreuves d'expression écrite et orale sont corrigées par des correcteurs certifiés, avec des retours détaillés et des conseils personnalisés pour améliorer votre score.",
    },
    {
        question: "Puis-je accéder aux tests sur mobile ?",
        answer: "Absolument ! Notre plateforme est entièrement responsive et accessible sur smartphone, tablette et ordinateur. Révisez où et quand vous le souhaitez.",
    },
    {
        question: "Quelle est la durée d'accès après l'inscription ?",
        answer: "La durée dépend de votre plan : 1 mois (Bronze), 2 mois (Silver) ou 3 mois (Gold). Pendant cette période, vous avez un accès illimité aux tests de votre plan.",
    },
    {
        question: "Comment sont sécurisés mes paiements ?",
        answer: "Tous les paiements sont traités via Stripe, le leader mondial du paiement en ligne. Vos données bancaires ne sont jamais stockées sur nos serveurs.",
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="section-padding bg-background" id="faq">
            <div className="section-container">
                <div className="section-heading">
                    <h2>Questions fréquentes</h2>
                    <p>Tout ce que vous devez savoir avant de commencer</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                className={`rounded-xl border transition-colors duration-200 ${isOpen ? 'border-primary/30 bg-primary-50/30' : 'border-border bg-card hover:border-border/80'
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-base font-semibold text-foreground pr-4">{faq.question}</span>
                                    <Icon
                                        name="ChevronDownIcon"
                                        size={20}
                                        className={`flex-shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
