import { AppError } from "@/utils/apiError";
import { generateOpaqueToken } from "@/utils/token";
import { prisma } from "@/prisma/client";
import * as repo from "@/modules/cart/cart.repository";
import type { CartWithItems } from "@/modules/cart/cart.repository";

export interface CartContext {
  userId?: string;
  guestId?: string;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId: string | null;
  slug: string;
  title: string;
  image: string | null;
  quantity: number;
  unitPriceCents: number;
  lineCents: number;
}

export interface CartView {
  id: string;
  guestId: string | null;
  items: CartLine[];
  itemCount: number;
  subtotalCents: number;
}

function mapCart(cart: CartWithItems): CartView {
  const items: CartLine[] = cart.items.map((i) => {
    const unit = i.variant?.priceCents ?? i.product.priceCents;
    return {
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      slug: i.product.slug,
      title: i.product.title,
      image: i.product.images[0]?.url ?? null,
      quantity: i.quantity,
      unitPriceCents: unit,
      lineCents: unit * i.quantity,
    };
  });
  return {
    id: cart.id,
    guestId: cart.guestId,
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotalCents: items.reduce((n, i) => n + i.lineCents, 0),
  };
}

/** Find (or create) the caller's cart — user-owned when logged in, else guest. */
async function resolveCart(ctx: CartContext): Promise<CartWithItems> {
  if (ctx.userId) {
    return (await repo.findByUserId(ctx.userId)) ?? (await repo.createForUser(ctx.userId));
  }
  if (ctx.guestId) {
    const existing = await repo.findByGuestId(ctx.guestId);
    if (existing) return existing;
  }
  return repo.createForGuest(generateOpaqueToken(12));
}

export async function getCart(ctx: CartContext): Promise<CartView> {
  return mapCart(await resolveCart(ctx));
}

export async function addItem(
  ctx: CartContext,
  input: { productId: string; variantId?: string | null; quantity: number }
): Promise<CartView> {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || !product.active) throw AppError.notFound("Product not found");

  const variantId = input.variantId ?? null;
  if (variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: product.id, active: true },
    });
    if (!variant) throw AppError.badRequest("Invalid product variant");
  }

  const cart = await resolveCart(ctx);
  const existing = await repo.findItem(cart.id, product.id, variantId);
  if (existing) {
    await repo.incrementItem(existing.id, input.quantity);
  } else {
    await repo.createItem({
      cartId: cart.id,
      productId: product.id,
      variantId,
      quantity: input.quantity,
    });
  }
  return mapCart((await repo.findById(cart.id))!);
}

export async function updateItem(
  ctx: CartContext,
  itemId: string,
  quantity: number
): Promise<CartView> {
  const cart = await resolveCart(ctx);
  const item = await repo.getItem(itemId, cart.id);
  if (!item) throw AppError.notFound("Cart item not found");
  if (quantity === 0) await repo.deleteItem(itemId);
  else await repo.setItemQuantity(itemId, quantity);
  return mapCart((await repo.findById(cart.id))!);
}

export async function removeItem(ctx: CartContext, itemId: string): Promise<CartView> {
  const cart = await resolveCart(ctx);
  const item = await repo.getItem(itemId, cart.id);
  if (!item) throw AppError.notFound("Cart item not found");
  await repo.deleteItem(itemId);
  return mapCart((await repo.findById(cart.id))!);
}

/** Merge a guest cart into the authenticated user's cart on login. */
export async function merge(userId: string, guestId: string): Promise<CartView> {
  const userCart = (await repo.findByUserId(userId)) ?? (await repo.createForUser(userId));
  const guestCart = await repo.findByGuestId(guestId);
  if (!guestCart || guestCart.id === userCart.id) return mapCart(userCart);

  for (const item of guestCart.items) {
    const existing = await repo.findItem(userCart.id, item.productId, item.variantId);
    if (existing) await repo.incrementItem(existing.id, item.quantity);
    else
      await repo.createItem({
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
  }
  await repo.deleteCart(guestCart.id);
  return mapCart((await repo.findById(userCart.id))!);
}
