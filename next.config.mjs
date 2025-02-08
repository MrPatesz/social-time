// @ts-check
import createWithPWA from 'next-pwa';
import i18nConfig from './next-i18next.config.mjs';

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

const withPWA = createWithPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

const config = withPWA({
    reactStrictMode: true,
    output: 'standalone',

    /**
     * If you have the "experimental: { appDir: true }" setting enabled, then you
     * must comment the below `i18n` config out.
     *
     * @see https://github.com/vercel/next.js/issues/41980
     */
    i18n: i18nConfig.i18n,

    images: {
        remotePatterns: [
            // UploadThing
            {
                protocol: 'https',
                hostname: 'uploadthing.com',
                pathname: '/f/**',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '/f/**',
                port: '',
            },
            // Google
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/a/**',
                port: '',
            },
            // Discord
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
                pathname: '/avatars/**',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
                pathname: '/embed/avatars/**',
                port: '',
            },
            // add new login options' image urls
        ],
    },
});
export default config;
