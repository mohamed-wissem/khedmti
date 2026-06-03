import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated="June 2026"
      intro="These terms govern your use of BLACKFORGE and any purchase you make through it. By creating an account or placing an order, you agree to them."
      sections={[
        { heading: "Accounts", body: "You're responsible for activity under your account and for keeping your credentials secure. Don't share, sell, or transfer your account in violation of these terms." },
        { heading: "Orders & delivery", body: "Digital goods are delivered to your email and order page after payment clears. Region restrictions, where they apply, are shown on the product page before purchase." },
        { heading: "Pricing", body: "Prices are shown in USD and may change. The price charged is the price displayed at checkout, validated server-side at the time of purchase." },
        { heading: "Acceptable use", body: "Don't use the platform for fraud, chargеback abuse, automated scraping, or any unlawful activity. We may suspend accounts that do." },
        { heading: "Loyalty & rewards", body: "XP, ranks, Forge Credit, and referral bonuses have no cash value and may be adjusted to prevent abuse. We honor balances earned in good faith." },
        { heading: "Liability", body: "The service is provided as-is. To the extent permitted by law, our liability for any claim is limited to the amount you paid for the order in question." },
      ]}
    />
  );
}
