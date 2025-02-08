import { ActionIcon, Text, useMantineColorScheme } from '@mantine/core';
import { FunctionComponent } from 'react';
import { useTranslation } from 'next-i18next';
import { useMyRouter } from '../../hooks/useMyRouter';
import { useMediaQuery } from '@mantine/hooks';

export const LanguageToggle: FunctionComponent = () => {
    const { colorScheme } = useMantineColorScheme();
    const isMobile = useMediaQuery('(max-width: 375px)');
    const { route, pushRoute, isDefaultLocale } = useMyRouter();
    const { t } = useTranslation('common');

    const dark = colorScheme === 'dark';

    return (
        <ActionIcon
            title={t('application.language')}
            size="lg"
            variant={dark ? 'outline' : 'default'}
            onClick={() =>
                void pushRoute(route, undefined, { locale: isDefaultLocale ? 'hu' : 'en' })
            }
        >
            <Text pb={isMobile ? undefined : 2}>{isDefaultLocale ? '🇭🇺' : '🇺🇸'}</Text>
        </ActionIcon>
    );
};
