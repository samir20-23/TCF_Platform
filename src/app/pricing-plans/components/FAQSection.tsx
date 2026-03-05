'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection = ({ faqs }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-academic transition-academic"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="flex w-full items-center justify-between p-6 text-left transition-academic hover:bg-muted"
          >
            <span className="font-caption text-sm font-semibold text-foreground">
              {faq.question}
            </span>
            <Icon
              name={openIndex === index ? 'ChevronUpIcon' : 'ChevronDownIcon'}
              size={20}
              className="flex-shrink-0 text-muted-foreground transition-academic"
            />
          </button>
          {openIndex === index && (
            <div className="border-t border-border bg-muted/30 px-6 py-4">
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQSection;