import type { Metadata } from "next";
import Link from "next/link";
import { Package, CreditCard, Truck, UserRound, RotateCcw, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Support Center",
  description: "Get help with orders, delivery, payments, accounts, and refunds.",
};

const TOPICS = [
  { icon: Package, title: "Orders & keys", body: "Find a key, re-download, or check status." },
  { icon: Truck, title: "Delivery", body: "Timing for digital goods and shipped gear." },
  { icon: CreditCard, title: "Payments", body: "Accepted methods, receipts, failed charges." },
  { icon: UserRound, title: "Account", body: "Login, security, and profile help." },
  { icon: RotateCcw, title: "Refunds", body: "Eligibility and how to request one." },
  { icon: ShieldCheck, title: "Buyer protection", body: "How your purchase is covered." },
];

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-widest text-ember">We&apos;ve got your back</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-moon">Support Center</h1>
        <p className="mt-2 text-smoke">Find answers fast, or reach a human in minutes.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map(({ icon: Icon, title, body }) => (
          <Link
            key={title}
            href="/faq"
            className="forged-surface group rounded-bf border border-ash/60 p-5 transition-all hover:-translate-y-0.5 hover:border-ember/40"
          >
            <Icon className="h-6 w-6 text-ember" strokeWidth={1.5} />
            <h2 className="mt-3 font-display text-lg font-semibold tracking-wide text-moon">{title}</h2>
            <p className="mt-1 text-sm text-smoke">{body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-bf border border-ash/60 bg-iron/40 p-6 sm:flex-row">
        <div>
          <h2 className="font-display text-lg font-semibold text-moon">Still need help?</h2>
          <p className="text-sm text-smoke">Our team typically replies within an hour.</p>
        </div>
        <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-bf bg-gradient-to-b from-ember to-ember-deep px-5 py-2.5 text-sm font-medium text-void">
          Contact support <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
