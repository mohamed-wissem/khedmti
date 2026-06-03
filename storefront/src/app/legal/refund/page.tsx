import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <LegalDoc
      title="Refund Policy"
      updated="June 2026"
      intro="We want every order to be right. Because we sell digital goods, refunds work a little differently than physical retail — here's exactly how."
      sections={[
        { heading: "Undelivered or unused items", body: "If an item was never delivered, or a key is unused and you haven't redeemed it, you're entitled to a full refund." },
        { heading: "Revealed keys", body: "Once a key or account credential is revealed, it can't be 'un-seen,' so it's covered by our buyer-protection guarantee rather than a blanket refund. If it doesn't work, we replace it or refund you." },
        { heading: "Buyer protection", body: "Every order is covered. If an item is faulty, wrong, or not as described, contact support and we'll make it right." },
        { heading: "How to request", body: "Open the order in your dashboard and use the support link, or contact us with your order number. Most requests are resolved within 24 hours." },
        { heading: "Chargebacks", body: "Please contact us before filing a chargeback — it's almost always faster. Fraudulent chargebacks may result in account suspension." },
      ]}
    />
  );
}
