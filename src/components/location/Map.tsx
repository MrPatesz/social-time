import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import { FunctionComponent, useRef } from 'react';
import { Center, Loader } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

export const Map: FunctionComponent<
    Omit<GoogleMapProps, 'onZoomChanged'> & { onZoom?: (newZoom: number) => void }
> = ({ onZoom, ...mapProps }) => {
    const { loading, error } = useGoogleMaps();
    const { t } = useTranslation('common');

    const ref = useRef<GoogleMap>(null);

    return (
        <Center h="100%">
            {error ?
                t('mapComponent.error')
            : loading ?
                <Loader />
            :   <GoogleMap
                    {...mapProps}
                    ref={ref}
                    onZoomChanged={() => {
                        if (onZoom) {
                            const zoom = ref.current?.state.map?.getZoom();
                            if (zoom) {
                                onZoom(zoom);
                            }
                        }
                    }}
                />
            }
        </Center>
    );
};
