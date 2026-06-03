import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="June 2026"
      intro="This policy explains what we collect, why, and the choices you have. We collect the minimum needed to deliver your orders and run the store."
      sections={[
        { heading: "What we collect", body: "Account details (name, email), order history, and basic usage data. Payment card data is handled by our payment processor and never stored on our servers." },
        { heading: "How we use it", body: "To fulfill orders, deliver digital goods, provide support, prevent fraud, and operate loyalty features like XP and referrals." },
        { heading: "Sharing", body: "We share data only with processors that help us run the store (payments, email, hosting) under contract — never sold to advertisers." },
        { heading: "Cookies", body: "We use essential cookies for sessions and cart state, and referral attribution cookies when you arrive via a referral link." },
        { heading: "Your rights", body: "You can access, correct, or delete your account data. Contact support to make a request; we respond within statutory timeframes." },
        { heading: "Retention", body: "We keep order records as required for tax and fraud-prevention purposes, and remove other personal data on account deletion." },
      ]}
    />
  );
}
