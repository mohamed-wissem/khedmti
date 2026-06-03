import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CopyKey } from "@/components/order/copy-key";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-ember" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-wide text-moon">Order confirmed</h1>
        <p className="mt-2 text-smoke">
          Sent to <span className="text-moon">{order.email}</span> · Order{" "}
          <span className="font-mono text-moon">#{order.id.slice(-8).toUpperCase()}</span>
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="forged-surface rounded-bf border border-ash/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/product/${item.product.slug}`} className="font-medium text-moon hover:text-ember">
                  {item.product.title}
                </Link>
                <p className="text-xs uppercase tracking-wider text-smoke">
                  {item.product.platform} · Qty {item.quantity}
                </p>
              </div>
              <span className="font-mono text-moon">{formatCents(item.priceCents * item.quantity)}</span>
            </div>

            {item.deliveredKey && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs uppercase tracking-wider text-bronze">Your key</p>
                <CopyKey value={item.deliveredKey} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-bf border border-ash/60 bg-iron/40 px-5 py-4">
        <span className="text-moon">Total paid</span>
        <span className="font-mono text-xl font-bold text-moon">{formatCents(order.totalCents)}</span>
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/shop">
          <Button variant="secondary">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
