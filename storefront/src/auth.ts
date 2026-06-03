import NextAuth from "next-auth";

/**
 * Auth.js (NextAuth v5) skeleton.
 *
 * Phase 1 ships the wiring only. Real providers — Google, Discord, Steam, and
 * an email magic-link — plus the PrismaAdapter (`@auth/prisma-adapter` against
 * the bf_user/bf_account/bf_session tables) land in Phase 3. JWT sessions keep
 * the skeleton DB-free until then.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    // e.g. Google({ clientId, clientSecret }), Discord({ ... }), Steam, Resend magic-link
  ],
  pages: {
    signIn: "/login",
  },
});
