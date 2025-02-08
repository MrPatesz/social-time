import { Button, Card, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import i18nConfig from '../../next-i18next.config.mjs';
import { useMediaQuery } from '@mantine/hooks';
import { useAuthenticated } from '../hooks/useAuthenticated';
import { useMyRouter } from '../hooks/useMyRouter';
import { ThemeColor } from '../utils/enums';

export default function WelcomePage() {
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const { replaceRoute, locale, localePrefix } = useMyRouter();
    const { authenticated } = useAuthenticated();
    const { t } = useTranslation('common');

    useEffect(() => {
        if (authenticated) {
            void replaceRoute('/', undefined, { locale });
        }
    }, [authenticated, locale, replaceRoute]);

    const [[from, to, deg]] = useState<[ThemeColor, ThemeColor, number]>(() => {
        const colors = Object.values(ThemeColor);
        const getRandomIndex = () => Math.floor(Math.random() * colors.length);

        const randomIndex1 = getRandomIndex();
        let randomIndex2 = getRandomIndex();
        while (randomIndex1 === randomIndex2) {
            randomIndex2 = getRandomIndex();
        }

        return [
            colors.at(randomIndex1) as ThemeColor,
            colors.at(randomIndex2) as ThemeColor,
            Math.random() * 360,
        ];
    });

    return (
        !authenticated && (
            <Stack
                align="center"
                justify="center"
                sx={{
                    height: '100%',
                    borderRadius: theme.fn.radius(theme.defaultRadius),
                    background: `linear-gradient(${deg}deg, ${theme.fn.themeColor(from)} 0%, ${theme.fn.themeColor(to)} 100%)`,
                }}
            >
                <Card
                    withBorder
                    w={xs ? undefined : 245}
                >
                    <Stack>
                        <Title
                            order={1}
                            align="center"
                        >
                            {t('welcomePage.welcome')}
                        </Title>
                        <Text color="dimmed">{t('welcomePage.description')}</Text>
                        <Group position="center">
                            <Button
                                variant="gradient"
                                gradient={{ from, to, deg }}
                                onClick={() =>
                                    void signIn(undefined, { callbackUrl: `${localePrefix}/` })
                                }
                            >
                                {t('welcomePage.login')}
                            </Button>
                        </Group>
                    </Stack>
                </Card>
            </Stack>
        )
    );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
