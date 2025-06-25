import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = process.env.ALLOWED_EMAILS?.split(",")?.map(email => email.trim()) || [];
const failedLogins = new Map<string, number>(); // Use a Map for better performance

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
            }
        
            // ✅ Instead of setting `null`, clear user data safely
            if (!session.user?.email || !allowedEmails.includes(session.user.email)) {
                session.user = { name: null, email: null, image: null }; // ✅ Keeps type validity
            }
        
            return session;
        },           
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24, // 1-day expiration
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

// ✅ Prevent Brute Force: Track Failed Logins
function trackFailedLogins(email: string) {
    if (!email) return;

    const attempts = failedLogins.get(email) || 0;
    failedLogins.set(email, attempts + 1);

    if (failedLogins.get(email)! > 5) {
        console.warn(`⚠️ Too many failed login attempts for ${email}`);
        failedLogins.delete(email); // Reset counter after reaching the limit
        throw new Error("Too many failed login attempts. Please try again later.");
    }
}
