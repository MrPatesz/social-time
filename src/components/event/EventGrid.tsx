import { Box, SimpleGrid, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ForwardedRef, forwardRef } from 'react';
import { BasicEventType } from '../../models/Event';
import { CenteredLoader } from '../CenteredLoader';
import { EventCard } from './EventCard';

export const EventGrid = forwardRef(
    (
        {
            events,
        }: {
            events: BasicEventType[];
        },
        ref: ForwardedRef<HTMLDivElement | null>
    ) => {
        const theme = useMantineTheme();
        const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
        const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
        const xl = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);
        const xxl = useMediaQuery(`(min-width: ${theme.breakpoints.xs + theme.breakpoints.lg})`);
        const txl = useMediaQuery(`(min-width: ${theme.breakpoints.md + theme.breakpoints.lg})`);
        const qxl = useMediaQuery(`(min-width: ${theme.breakpoints.md + theme.breakpoints.xl})`);

        if (xs === undefined) {
            return <CenteredLoader />;
        }

        return (
            <SimpleGrid
                cols={
                    qxl ? 7
                    : txl ?
                        6
                    : xxl ?
                        5
                    : xl ?
                        4
                    : md ?
                        3
                    : xs ?
                        2
                    :   1
                }
            >
                {events.map((event, index) => (
                    <Box
                        key={event.id}
                        ref={index === events.length - 1 ? ref : undefined}
                    >
                        <EventCard event={event} />
                    </Box>
                ))}
            </SimpleGrid>
        );
    }
);
