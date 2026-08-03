import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isProtected =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/teacher') ||
        pathname.startsWith('/student');

      if (isProtected) {
        if (isLoggedIn) return true;
        return false;
      }

      // Already logged in, redirect away from login
      if (isLoggedIn && pathname === '/login') {
        const role = auth.user.role;
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        if (role === 'TEACHER') {
          return Response.redirect(new URL('/teacher/dashboard', nextUrl));
        }
        return Response.redirect(new URL('/student/dashboard', nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as any;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
