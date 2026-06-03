import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Background } from "@/components/layout/background";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BLACKFORGE — Arm Yourself",
    template: "%s · BLACKFORGE",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "BLACKFORGE — Arm Yourself",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: "BLACKFORGE", description: SITE_DESCRIPTION },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={orgJsonLd} />
        <Background />
        <Topbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
