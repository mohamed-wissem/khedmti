import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about delivery, payments, refunds, and account safety.",
};

const FAQS: { q: string; a: string }[] = [
  { q: "Is BLACKFORGE legit and safe?", a: "Yes. Every order is covered by buyer protection, payments are processed securely, and digital goods are delivered from a verified vault. If anything goes wrong, our support team makes it right." },
  { q: "How fast is delivery?", a: "Digital items (games, keys, currency, gift cards, subscriptions) are delivered the instant payment clears — usually under 60 seconds — to your email and order page. Physical gear ships separately." },
  { q: "Where do I find my key after buying?", a: "On the order confirmation page and in your dashboard under Orders. Keys can be copied with one tap." },
  { q: "What's your refund policy?", a: "Unused, undelivered items are fully refundable. Because digital keys can't be 'un-revealed', revealed keys are covered by our guarantee rather than blanket refunds. See your order's support link to start a request." },
  { q: "Which payment methods do you accept?", a: "Cards and major wallets via our secure processor, with more options rolling out. Your card details never touch our servers." },
  { q: "Are there region locks?", a: "Some titles and keys are region-specific. Region requirements are shown on the product page before you buy." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-ember">Support</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-moon">Frequently asked</h1>
      </header>

      <div className="divide-y divide-ash/40 border-y border-ash/40">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center gap-3 font-medium text-moon">
              {q}
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-smoke transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{a}</p>
          </details>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-smoke">
        Still stuck?{" "}
        <Link href="/contact" className="text-ember hover:underline">Contact support</Link>.
      </p>
    </div>
  );
}
