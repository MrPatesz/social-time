import { useMemo } from 'react';
import { useMyRouter } from '../hooks/useMyRouter';

export const usePriceFormatter = () => {
    const { locale } = useMyRouter();
    return useMemo(
        () =>
            new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
            }),
        [locale]
    );
};

export const useLongDateFormatter = () => {
    const { locale } = useMyRouter();
    return useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        [locale]
    );
};

export const useShortDateFormatter = () => {
    const { locale } = useMyRouter();
    return useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }),
        [locale]
    );
};

export const useSignedNumberFormatter = () => {
    const { locale } = useMyRouter();
    return useMemo(
        () =>
            new Intl.NumberFormat(locale, {
                signDisplay: 'exceptZero',
            }),
        [locale]
    );
};
