"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  xpForOrder,
  creditForOrder,
  levelForXp,
  REFERRAL_BONUS_CENTS,
  REFERRAL_XP,
} from "@/lib/gamification";

export interface CheckoutLine {
  id: string;
  quantity: number;
}

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

function mockDeliveredKey(): string {
  // Placeholder digital-good code. Real fulfillment pulls from an encrypted
  // key vault after a verified Stripe/PayPal payment (see plan §8).
  const seg = () => randomBytes(2).toString("hex").toUpperCase();
  return `BF-${seg()}-${seg()}-${seg()}`;
}

/**
 * MOCK CHECKOUT. Creates a real order in Neon but does NOT charge a card.
 * Prices are re-read from the database so the client can never set its own.
 * Swap the "payment succeeded" assumption for a Stripe PaymentIntent webhook
 * to go live.
 */
export async function placeOrder(
  email: string,
  lines: CheckoutLine[]
): Promise<CheckoutResult> {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!lines.length) return { ok: false, error: "Your cart is empty." };

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.id) }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = lines
    .map((l) => {
      const p = byId.get(l.id);
      if (!p) return null;
      const quantity = Math.max(1, Math.min(l.quantity, 10));
      return { product: p, quantity };
    })
    .filter((x): x is { product: (typeof products)[number]; quantity: number } => x !== null);

  if (!items.length) return { ok: false, error: "These items are no longer available." };

  const totalCents = items.reduce((n, i) => n + i.product.priceCents * i.quantity, 0);

  // Attach to the signed-in user when there is one (guest checkout otherwise).
  const session = await auth();

  const userId = session?.user?.id ?? null;

  const order = await prisma.order.create({
    data: {
      userId,
      email: clean,
      status: "FULFILLED", // mock: assume payment cleared + instantly fulfilled
      totalCents,
      items: {
        create: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          priceCents: i.product.priceCents,
          deliveredKey: i.product.instant ? mockDeliveredKey() : null,
        })),
      },
    },
  });

  // Gamification: award XP + Forge Credit, and pay the referrer on first order.
  if (userId) {
    const priorOrders = await prisma.order.count({ where: { userId, id: { not: order.id } } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newXp = user.xp + xpForOrder(totalCents);
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: levelForXp(newXp),
          creditCents: { increment: creditForOrder(totalCents) },
        },
      });

      // First-ever order from a referred user rewards the referrer.
      if (priorOrders === 0 && user.referredById) {
        const ref = await prisma.user.findUnique({ where: { id: user.referredById } });
        if (ref) {
          await prisma.user.update({
            where: { id: ref.id },
            data: {
              creditCents: { increment: REFERRAL_BONUS_CENTS },
              xp: { increment: REFERRAL_XP },
              level: levelForXp(ref.xp + REFERRAL_XP),
            },
          });
        }
      }
    }
  }

  return { ok: true, orderId: order.id };
}
