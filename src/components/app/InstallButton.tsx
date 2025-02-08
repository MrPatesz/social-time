import { ActionIcon, useMantineTheme } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

const BEFORE_INSTALL_PROMPT = 'beforeinstallprompt' as const;
const APP_INSTALLED = 'appinstalled' as const;

export const InstallButton = () => {
    const theme = useMantineTheme();
    const { t } = useTranslation('common');

    const [onClick, setOnClick] = useState<(() => void) | undefined>(undefined);

    useEffect(() => {
        const beforeInstallPrompt = (event: Event & { prompt?: () => Promise<void> }) => {
            const newOnClick = () => void event.prompt?.();
            setOnClick(() => newOnClick);
        };
        const appInstalled = () => setOnClick(undefined);

        window.addEventListener(BEFORE_INSTALL_PROMPT, beforeInstallPrompt);
        window.addEventListener(APP_INSTALLED, appInstalled);
        return () => {
            window.removeEventListener(BEFORE_INSTALL_PROMPT, beforeInstallPrompt);
            window.removeEventListener(APP_INSTALLED, appInstalled);
        };
    }, []);

    return (
        <>
            {onClick && (
                <ActionIcon
                    title={t('application.install')}
                    size="lg"
                    variant={theme.colorScheme === 'dark' ? 'outline' : 'default'}
                    onClick={onClick}
                >
                    <IconDownload />
                </ActionIcon>
            )}
        </>
    );
};
