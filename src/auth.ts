import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './lib/prisma';
import { cookies } from 'next/headers';

const nextAuthInstance = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || "jamia-secret-key-32-chars-minimum-here-secure",
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
          });
          
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name ?? user.email.split('@')[0],
              email: user.email,
              role: user.role as any,
            };
          }
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' }
});

export const { signIn, signOut, handlers } = nextAuthInstance;

export async function auth() {
  try {
    const session = await nextAuthInstance.auth();
    if (session?.user) {
      return session;
    }
  } catch {
    // NextAuth error, fallback to jamia_session cookie
  }

  // Fallback to jamia_session cookie
  try {
    const cookieStore = await cookies();
    const customCookie = cookieStore.get("jamia_session")?.value;
    if (customCookie) {
      const parsed = JSON.parse(decodeURIComponent(customCookie));
      if (parsed?.email && parsed?.role) {
        return {
          user: {
            id: parsed.id || parsed.email,
            name: parsed.name || parsed.email.split("@")[0],
            email: parsed.email,
            role: parsed.role,
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }

  // If no session exists, return null so unauthenticated users see login page first
  return null;
}
