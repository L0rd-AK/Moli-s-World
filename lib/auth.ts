import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { IUser } from '@/models/User';
import { clientPromise } from '@/lib/mongodb';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { ObjectId } from 'mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const client = await clientPromise;
        const db = client.db();
        const user = await db
          .collection<IUser>('users')
          .findOne({ email: credentials.email });

        if (!user) {
          return null;
        }

        if (!user.passwordHash) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.role) {
          token.role = user.role;
        } else {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection('users').findOne({ email: user.email });
          token.role = dbUser?.role || 'reader';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const client = await clientPromise;
      const db = client.db();
      await db.collection('users').updateOne(
        { _id: new ObjectId(user.id) },
        { $set: { role: 'reader', createdAt: new Date(), updatedAt: new Date() } }
      );
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};