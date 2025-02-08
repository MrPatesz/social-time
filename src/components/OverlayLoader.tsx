import { Box, LoadingOverlay } from '@mantine/core';
import { FunctionComponent, PropsWithChildren } from 'react';

export const OverlayLoader: FunctionComponent<
    PropsWithChildren<{
        loading: boolean;
        fillHeight?: boolean;
    }>
> = ({ children, loading, fillHeight }) => {
    return (
        <Box sx={fillHeight ? { position: 'relative', height: '100%' } : { position: 'relative' }}>
            <LoadingOverlay
                visible={Boolean(loading)}
                sx={(theme) => ({ borderRadius: theme.fn.radius(theme.defaultRadius) })}
            />
            {children}
        </Box>
    );
};
