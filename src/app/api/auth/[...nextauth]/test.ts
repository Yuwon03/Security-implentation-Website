// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails =
  process.env.ALLOWED_EMAILS?.split(",")?.map((e) => e.trim()) || [];
const failedLogins = new Map<string, number>();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ⬇️ Ask for Photos scope + offline access so Google returns a refresh token
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata",
            "https://www.googleapis.com/auth/photoslibrary.appendonly",       // if you’ll create albums/upload
            "https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata", // optional for batch add/remove
          ].join(" "),
          access_type: "offline",
          prompt: "consent", // keep until you've captured the refresh token once
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email || !allowedEmails.includes(user.email)) {
        trackFailedLogins(user.email ?? "unknown");
        return false;
      }
      return true;
    },

    async jwt({ token, account, user }) {
      // keep your existing email mapping
      if (user) token.email = user.email;

      // Save access/expiry if you ever want them (not required for public pages)
      if (account?.access_token) (token as any).access_token = account.access_token;
      if (account?.expires_at) (token as any).expires_at = (account.expires_at as number) * 1000;

      // ✅ Capture refresh token the FIRST time Google returns it.
      // Google will often omit it on subsequent logins; so keep the old one if none is sent.
      if (account?.refresh_token) {
        (token as any).refresh_token = account.refresh_token;
        // 🔒 SERVER LOG ONLY (watch your terminal where `next dev` runs)
        console.log(
          "\n=== GOOGLE PHOTOS REFRESH TOKEN (save as PHOTOS_REFRESH_TOKEN) ===\n",
          account.refresh_token,
          "\n=================================================================\n"
        );
      }

      return token;
    },

    async session({ session, token }) {
        if (session.user) session.user.email = (token.email as string) || null;

        if (!session.user?.email || !allowedEmails.includes(session.user.email)) {
            session.user = { name: null, email: null, image: null }; // ✅ Keeps type validity
        }

      // Do NOT put refresh/access tokens on the session (browser) — keep them server-only.
        return session;
    },
  },

  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: true, // <- uncomment if you want extra server logs while testing
});

export { handler as GET, handler as POST };

// Brute-force guard (unchanged)
function trackFailedLogins(email: string) {
  if (!email) return;
  const attempts = failedLogins.get(email) || 0;
  failedLogins.set(email, attempts + 1);
  if ((failedLogins.get(email) || 0) > 5) {
    console.warn(`⚠️ Too many failed login attempts for ${email}`);
    failedLogins.delete(email);
    throw new Error("Too many failed login attempts. Please try again later.");
  }
}


