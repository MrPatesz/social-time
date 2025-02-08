import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { FunctionComponent } from 'react';
import { useTranslation } from 'next-i18next';

export const ColorSchemeToggle: FunctionComponent = () => {
    const mantineColorScheme = useMantineColorScheme();
    const dark = mantineColorScheme.colorScheme === 'dark';
    const { t } = useTranslation('common');

    return (
        <ActionIcon
            title={t('application.colorScheme')}
            size="lg"
            variant={dark ? 'outline' : 'default'}
            onClick={() => mantineColorScheme.toggleColorScheme()}
        >
            {dark ?
                <IconSun />
            :   <IconMoonStars />}
        </ActionIcon>
    );
};
