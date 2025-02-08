import { Card, Stack, Text } from '@mantine/core';
import { FunctionComponent } from 'react';
import { LocationType } from '../../models/Location';
import { formatDistance } from '../../utils/utilFunctions';
import { Map } from './Map';
import { MarkerF } from '@react-google-maps/api';

const MapComponent: FunctionComponent<{
    location: LocationType;
    distance: number | undefined;
    size: {
        width: number | string;
        height: number | string;
        minHeight?: number;
    };
}> = ({ distance, location, size }) => {
    return (
        <Card
            withBorder
            padding={0}
            sx={{ ...size, position: 'relative' }}
        >
            <Card
                withBorder
                padding={8}
                sx={{
                    position: 'absolute',
                    bottom: 9,
                    left: 9,
                    right: 59,
                    zIndex: 1,
                }}
            >
                <Stack spacing={0}>
                    <Text>{location.address}</Text>
                    {distance !== undefined && <Text>{formatDistance(distance)}</Text>}
                </Stack>
            </Card>
            <Map
                zoom={15}
                center={{
                    lat: location.latitude,
                    lng: location.longitude,
                }}
                mapContainerStyle={size}
            >
                <MarkerF
                    title={location.address}
                    position={{
                        lat: location.latitude,
                        lng: location.longitude,
                    }}
                />
            </Map>
        </Card>
    );
};

export default MapComponent;
