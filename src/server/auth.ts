import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { GetServerSidePropsContext } from 'next';
import { type DefaultSession, getServerSession, type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '../env.mjs';
import { prisma } from './db';
import { ThemeColor } from '../utils/enums';

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module 'next-auth' {
    // this is available on useSession's data
    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string;
            themeColor: ThemeColor;
            // role: UserRole;
            // image: string;
            // email: string;
        };
    }

    // this is returned in authOptions' callback
    interface User {
        id: string;
        name: string;
        themeColor: ThemeColor;
        // role: UserRole;
        // image: string;
        // email: string;
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
    callbacks: {
        session: ({ session, user }) => {
            if (session.user) {
                session.user.id = user.id;
                session.user.name = user.name;
                session.user.themeColor = user.themeColor;
                // session.user.role = user.role;
                // session.user.image = user.image;
                // session.user.email = user.email;
            }
            return session;
        },
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        /**
         * ...add more providers here
         *
         * Most other providers require a bit more work than the Discord provider.
         * For example, the GitHub provider requires you to add the
         * `refresh_token_expires_in` field to the Account model. Refer to the
         * NextAuth.js docs for the provider you want to use. Example:
         * @see https://next-auth.js.org/providers/github
         **/
    ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext['req'];
    res: GetServerSidePropsContext['res'];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
