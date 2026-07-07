import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, users, profiles } from "@/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const db = await getDb();
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const profile = await db.query.profiles.findFirst({
          where: eq(profiles.userId, user.id),
        });
        return {
          id: user.id,
          email: user.email,
          name: profile?.displayName ?? user.email,
          role: user.role,
          username: profile?.username ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
        token.username = (user as { username?: string | null }).username ?? null;
      }
      // refresh username/role after profile updates
      if (trigger === "update" && token.id) {
        const db = await getDb();
        const [u, p] = await Promise.all([
          db.query.users.findFirst({ where: eq(users.id, token.id as string) }),
          db.query.profiles.findFirst({ where: eq(profiles.userId, token.id as string) }),
        ]);
        if (u) token.role = u.role;
        if (p) {
          token.username = p.username;
          token.name = p.displayName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") ?? "user";
        session.user.username = (token.username as string | null) ?? null;
      }
      return session;
    },
  },
});
