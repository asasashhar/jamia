import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || "jamia-secret-key-32-chars-minimum-here-secure",
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
  callbacks: {
    authorized({ auth, request }) {
      const customSessionCookie = request.cookies.get("jamia_session")?.value;
      let customUser: any = null;
      if (customSessionCookie) {
        try {
          customUser = JSON.parse(decodeURIComponent(customSessionCookie));
        } catch {
          // ignore
        }
      }

      const user = auth?.user || customUser;
      const isLoggedIn = !!user;
      const { pathname } = request.nextUrl;

      // Protected routes: Always allow request to reach App Router so iframe cookie-less requests don't get stuck in redirect loops
      const isProtected =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/teacher') ||
        pathname.startsWith('/student');

      if (isProtected) {
        return true;
      }

      // If already logged in and visiting login, send to dashboard
      if (isLoggedIn && (pathname === '/login')) {
        const role = user?.role;
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          return Response.redirect(new URL('/admin/dashboard', request.nextUrl));
        }
        if (role === 'TEACHER') {
          return Response.redirect(new URL('/teacher/dashboard', request.nextUrl));
        }
        return Response.redirect(new URL('/student/dashboard', request.nextUrl));
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
