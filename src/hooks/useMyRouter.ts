import { useRouter } from 'next/router';

export const useMyRouter = () => {
    const {
        asPath,
        push: pushRoute,
        replace: replaceRoute,
        locale = 'en',
        defaultLocale = 'en',
    } = useRouter();

    const isDefaultLocale = locale === defaultLocale;
    const localePrefix = isDefaultLocale ? '' : `/${locale}`;

    return {
        route: asPath,
        pushRoute,
        replaceRoute,
        locale,
        defaultLocale,
        isDefaultLocale,
        localePrefix,
    };
};
