import Stripe from "stripe";
import { config } from "@/config";
import { AppError } from "@/utils/apiError";

type StripeClient = InstanceType<typeof Stripe>;

let client: StripeClient | null = null;

/** Whether Stripe is configured. When false, checkout falls back to mock fulfillment. */
export function stripeEnabled(): boolean {
  return config.stripe.enabled;
}

export function getStripe(): StripeClient {
  if (!config.stripe.enabled) throw AppError.serviceUnavailable("Stripe is not configured");
  if (!client) client = new Stripe(config.stripe.secretKey!);
  return client;
}

export function createPaymentIntent(
  amountCents: number,
  currency: string,
  metadata: Record<string, string>
) {
  return getStripe().paymentIntents.create({
    amount: amountCents,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export function constructEvent(rawBody: Buffer, signature: string) {
  return getStripe().webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret!);
}

export function createRefund(paymentIntentId: string, amountCents?: number) {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  });
}
