import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token, request }) => {
      const path = request.nextUrl.pathname;

      // Admin routes require admin role
      if (path.startsWith('/dashboard') || path.startsWith('/api/admin')) {
        return token.role === 'admin';
      }

      // Allow authenticated users to access everything else
      if (token.role) {
        return true;
      }

      // Public routes are allowed
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};