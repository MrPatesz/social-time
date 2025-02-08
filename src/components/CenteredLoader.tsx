import { Center, Loader } from '@mantine/core';
import { FunctionComponent } from 'react';

export const CenteredLoader: FunctionComponent = () => {
    return (
        <Center sx={{ height: '100%', width: '100%' }}>
            <Loader h={10} />
        </Center>
    );
};
