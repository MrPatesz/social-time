import { Card, Progress } from '@mantine/core';
import { UseTRPCQueryResult } from '@trpc/react-query/shared';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { EventInfo, usePusher } from '../hooks/usePusher';
import { CenteredLoader } from './CenteredLoader';
import { OverlayLoader } from './OverlayLoader';
import { Show, When } from 'typesafe-react';

export const QueryComponent = <T,>({
    children,
    query: { status, data, refetch, isFetching },
    resourceName,
    eventInfo,
    loading,
}: {
    query: UseTRPCQueryResult<T, unknown>;
    resourceName: string;
    eventInfo?: EventInfo;
    loading?: boolean; // TODO rename to mutating
    children: ReactNode | ((data: T) => ReactNode); // TODO callback only
}) => {
    const { t } = useTranslation('common');

    usePusher(eventInfo, () => void refetch());

    return (
        <When
            expression={status}
            cases={{
                loading: () => <CenteredLoader />, // TODO skeleton instead of this
                error: () => <Card withBorder>{t('queryComponent.error', { resourceName })}</Card>,
                success: () => (
                    // TODO FetchingComponent
                    <OverlayLoader
                        loading={Boolean(loading)}
                        fillHeight
                    >
                        <Show when={isFetching}>
                            <Progress
                                animate
                                size="xs"
                                value={100}
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    zIndex: 3,
                                }}
                            />
                        </Show>
                        {children instanceof Function ? children(data as T) : children}
                    </OverlayLoader>
                ),
            }}
        />
    );
};
