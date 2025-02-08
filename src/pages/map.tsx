import {
    Anchor,
    Box,
    Card,
    Checkbox,
    Flex,
    Group,
    Progress,
    Stack,
    Text,
    useMantineTheme,
} from '@mantine/core';
import { useDebouncedValue, useLocalStorage, useMediaQuery } from '@mantine/hooks';
import { CircleF, MarkerF } from '@react-google-maps/api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FunctionComponent, useMemo } from 'react';
import i18nConfig from '../../next-i18next.config.mjs';
import { CenteredLoader } from '../components/CenteredLoader';
import { Map } from '../components/location/Map';
import { useGeolocation } from '../hooks/useGeolocation';
import { useMyRouter } from '../hooks/useMyRouter';
import { usePusher } from '../hooks/usePusher';
import { CoordinatesType } from '../models/Location';
import { api } from '../utils/api';
import { InvalidateEvent } from '../utils/enums';
import { useShortDateFormatter } from '../utils/formatters';
import { formatDistance } from '../utils/utilFunctions';

const MapWithEvents: FunctionComponent<{
    center: CoordinatesType;
}> = ({ center }) => {
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const { locale, pushRoute } = useMyRouter();
    const shortDateFormatter = useShortDateFormatter();
    const { t } = useTranslation('common');

    const [includeArchive, setIncludeArchive] = useLocalStorage<boolean>({
        key: 'include-archive',
        defaultValue: true,
    });
    const [myGroupsOnly, setMyGroupsOnly] = useLocalStorage<boolean>({
        key: 'my-groups-only',
        defaultValue: false,
    });
    const [zoom, setZoom] = useLocalStorage({
        key: 'google-map-zoom',
        defaultValue: 12,
    });
    const maxDistance = useMemo(() => {
        const increment =
            md ? 0
            : xs ? 0.5
            : 1;
        return 40000 / Math.pow(2, zoom + increment);
    }, [zoom, xs, md]);
    const [debouncedMaxDistance] = useDebouncedValue(maxDistance, 500);

    const eventsQuery = api.event.getMap.useQuery({
        center,
        maxDistance: debouncedMaxDistance,
        includeArchive,
        myGroupsOnly,
    });
    usePusher({ event: InvalidateEvent.EventGetMap }, () => void eventsQuery.refetch());

    // TODO LocationPicker to override center?

    return (
        <Stack h="100%">
            <Flex
                justify={xs ? 'space-between' : 'center'}
                direction={xs ? 'row' : 'column'}
                gap="xs"
            >
                <Group
                    noWrap
                    position="center"
                    spacing={4}
                >
                    <Text>{t('feedPage.maxDistance')}</Text>
                    <Text
                        weight="bold"
                        color={theme.primaryColor}
                    >
                        {formatDistance(maxDistance)}
                    </Text>
                </Group>
                <Group
                    noWrap
                    position="center"
                >
                    <Checkbox
                        label={t('feedPage.includeArchive')}
                        checked={includeArchive}
                        onChange={(e) => setIncludeArchive(e.currentTarget.checked)}
                    />
                    <Checkbox
                        label={t('feedPage.myGroupsOnly')}
                        checked={myGroupsOnly}
                        onChange={(e) => setMyGroupsOnly(e.currentTarget.checked)}
                    />
                </Group>
            </Flex>
            <Box sx={{ position: 'relative', height: '100%' }}>
                {eventsQuery.isFetching && (
                    <Progress
                        animate
                        size="xs"
                        value={100}
                        sx={{ position: 'absolute', left: 0, right: 0, zIndex: 3 }}
                    />
                )}
                <Map
                    zoom={zoom}
                    onZoom={setZoom}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{
                        lat: center.latitude,
                        lng: center.longitude,
                    }}
                >
                    <CircleF
                        radius={maxDistance * 1000}
                        center={{ lat: center.latitude, lng: center.longitude }}
                        options={{
                            fillColor: theme.fn.themeColor(theme.primaryColor),
                            strokeColor: theme.fn.themeColor(theme.primaryColor),
                        }}
                    />
                    <CircleF
                        radius={maxDistance * 10}
                        center={{ lat: center.latitude, lng: center.longitude }}
                    />
                    {eventsQuery.data?.map((event) => (
                        <MarkerF
                            key={event.id}
                            title={`${event.name}\n${event.creator.name}\n${shortDateFormatter.format(event.start)}\n${event.description}`}
                            position={{
                                lat: event.location.latitude,
                                lng: event.location.longitude,
                            }}
                            onClick={() =>
                                void pushRoute(`/events/${event.id}`, undefined, { locale })
                            }
                        />
                    ))}
                </Map>
            </Box>
        </Stack>
    );
};

export default function MapPage() {
    const { locale } = useMyRouter();
    const { t } = useTranslation('common');

    const { loading, location } = useGeolocation();

    return (
        <>
            {loading ?
                <CenteredLoader />
            : location ?
                <MapWithEvents center={location} />
            :   <Card withBorder>
                    <Text>
                        {t('mapPage.absentPermission1')}&nbsp;
                        <Anchor // TODO permission on click!
                            component={Link}
                            href={`/profile`}
                            locale={locale}
                            passHref
                        >
                            {t('resource.profile')}
                        </Anchor>
                        {t('mapPage.absentPermission2')}
                    </Text>
                </Card>
            }
        </>
    );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
