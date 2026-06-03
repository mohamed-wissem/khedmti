/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blackforge.gg"
).replace(/\/$/, "");

export const SITE_NAME = "BLACKFORGE";
export const SITE_TAGLINE = "Arm yourself.";
export const SITE_DESCRIPTION =
  "The premium dark-fantasy gaming marketplace. Games, accounts, gift cards, currency, subscriptions and gear — delivered instantly.";
