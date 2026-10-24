"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Does SpaceSync list rental properties or charge brokerage fees?",
    answer:
      "No. SpaceSync is strictly about flatmate compatibility — matching compatible people to live with. Whether you already have an apartment lease and need someone to take the vacant room, or you want to team up and apartment-hunt together, SpaceSync connects people first. Zero brokerage fees and zero property agent listings.",
  },
  {
    question: "How is the Peace Score calculated? Is it an AI black box?",
    answer:
      "It is completely transparent and rules-based — zero black-box mystery. The score is calculated across three weighted pillars: Lifestyle & Daily Habits (40%), Living Preferences & Budget (40%), and Personality & Communication (20%). If you answer optional questions, they count toward the score; skipped questions are never guessed. Any flagged deal-breaker immediately caps the match at 49%.",
  },
  {
    question: "Will strangers be able to see my phone number or spam my DMs?",
    answer:
      "Never. Your profile starts in a private, unpublished draft state. Once published, your phone number and private contact details remain hidden. No one can message you unsolicited — a private conversation unlocks only after a mutual sync handshake where both of you review profiles and accept interest.",
  },
  {
    question: "What happens if there are no matching flatmates in my locality yet?",
    answer:
      "We believe in total honesty: we will never seed fake profiles, simulated chats, or dummy users. If your specific neighbourhood has no active matches yet, you will see an honest empty state, and you can share your compatibility link directly with flatmate applicants from Facebook, WhatsApp, or college cohorts.",
  },
];

export function HomeFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3.5 max-w-3xl mx-auto">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-forest/30 shadow-warm"
                : "bg-white/70 border-border/80 hover:border-forest/20 hover:bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-serif text-base sm:text-lg text-charcoal font-medium pr-4">
                {item.question}
              </span>
              <span
                className={`p-1 rounded-full bg-sand/60 text-forest shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 bg-forest text-ivory" : ""
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-sm text-muted leading-relaxed border-t border-border/40 mt-1">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
