import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './lib/prisma'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, profile }) {
      const email = (profile as any)?.email || token.email
      if (email) {
        const e = String(email).trim().toLowerCase()
        try {
          const user = await prisma.user.upsert({ where: { email: e }, update: {}, create: { email: e } })
          ;(token as any).userId = user.id
          ;(token as any).isAdmin = user.isAdmin
          token.email = user.email
        } catch {
          // tolerate missing tables during first boot
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token as any).userId
        ;(session.user as any).isAdmin = (token as any).isAdmin
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper to create handlers for App Router
export const authHandler = NextAuth(authOptions)
