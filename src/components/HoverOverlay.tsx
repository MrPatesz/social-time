import { Box, Flex, Overlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ReactNode } from 'react';
import { Show } from 'typesafe-react';

export const HoverOverlay = ({
    children,
    hoverChildren,
    hidden = false,
}: {
    children: ReactNode;
    hoverChildren: ReactNode;
    hidden?: boolean;
}) => {
    const [hovered, { open, close }] = useDisclosure(false);

    return (
        <Box
            sx={{ position: 'relative' }}
            onMouseEnter={open}
            onMouseLeave={close}
        >
            <Show when={hovered && !hidden}>
                <Overlay sx={(theme) => ({ borderRadius: theme.fn.radius(theme.defaultRadius) })}>
                    <Flex
                        h={'100%'}
                        align={'center'}
                        justify={'center'}
                    >
                        {hoverChildren}
                    </Flex>
                </Overlay>
            </Show>
            {children}
        </Box>
    );
};
