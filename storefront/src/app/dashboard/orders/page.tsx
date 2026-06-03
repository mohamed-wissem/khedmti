import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { auth } from "@/auth";
import { getUserOrders } from "@/lib/orders";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Order history" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const orders = await getUserOrders(session.user.id);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-wide text-moon">Order history</h1>

      {orders.length === 0 ? (
        <div className="forged-surface rounded-bf border border-ash/60 p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-ash" />
          <p className="mt-3 text-moon">You haven&apos;t ordered anything yet.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm text-ember hover:underline">Browse the armory →</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="forged-surface rounded-bf border border-ash/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ash/40 pb-3">
                <div>
                  <p className="font-mono text-sm text-moon">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-smoke">{o.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-bf border border-ember/30 bg-ember/5 px-2 py-0.5 text-[11px] uppercase tracking-wider text-ember">
                    {o.status.toLowerCase()}
                  </span>
                  <span className="font-mono font-bold text-moon">{formatCents(o.totalCents)}</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {o.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <Link href={`/product/${item.product.slug}`} className="text-smoke hover:text-ember">
                      {item.product.title} <span className="text-smoke/70">× {item.quantity}</span>
                    </Link>
                    <span className="font-mono text-smoke">{formatCents(item.priceCents * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/order/${o.id}`} className="mt-3 inline-block text-sm text-ember hover:underline">
                View keys &amp; receipt →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
