import { Box, Card, Group, Loader, Overlay, Stack, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { FunctionComponent } from 'react';
import { DetailedEventType } from '../../models/Event';
import { CoordinatesType } from '../../models/Location';
import { api } from '../../utils/api';
import { EVENT_IMAGE_SIZE } from '../../utils/constants';
import { InvalidateEvent } from '../../utils/enums';
import { UploadButton } from '../../utils/uploadthing';
import { getBackgroundColor } from '../../utils/utilFunctions';
import { QueryComponent } from '../QueryComponent';

const EventImageWithUpload: FunctionComponent<{
    index: 0 | 1 | 2;
    event: DetailedEventType;
}> = ({ index, event }) => {
    const theme = useMantineTheme();
    const { t } = useTranslation('common');

    const image = event.images.at(index);

    return (
        <Stack>
            {image ?
                <Image
                    alt={`Image ${index + 1}`}
                    width={EVENT_IMAGE_SIZE}
                    height={EVENT_IMAGE_SIZE}
                    src={image}
                    style={{ borderRadius: theme.fn.radius(theme.defaultRadius) }}
                />
            :   <Card
                    padding={0}
                    withBorder
                    sx={{ backgroundColor: getBackgroundColor(theme) }}
                >
                    <Box sx={{ width: EVENT_IMAGE_SIZE, height: EVENT_IMAGE_SIZE }} />
                </Card>
            }
            <Box sx={{ position: 'relative' }}>
                {index > event.images.length && (
                    <Overlay sx={{ borderRadius: theme.fn.radius(theme.defaultRadius) }} />
                )}
                <UploadButton // TODO separate component for styling
                    className="upload-thing"
                    endpoint="changeEventImage"
                    content={{
                        button: ({ isUploading }) =>
                            isUploading ? <Loader color="white" /> : t('profileForm.image.button'),
                        allowedContent: t('profileForm.image.allowedContent', { size: 2 }),
                    }}
                    appearance={{
                        button: ({ isUploading }) => ({
                            pointerEvents: isUploading ? 'none' : undefined,
                            backgroundColor: theme.fn.themeColor(
                                theme.primaryColor,
                                isUploading ? 6 : 8
                            ),
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            height: 36,
                            width: 130,
                        }),
                    }}
                    input={{ eventId: event.id, index }}
                    onClientUploadComplete={() =>
                        showNotification({
                            color: 'green',
                            title: t('notification.event.image.success.title'),
                            message: t('notification.event.image.success.message'),
                        })
                    }
                    onUploadError={() =>
                        showNotification({
                            color: 'red',
                            title: t('notification.event.image.error.title'),
                            message: t('notification.event.image.error.message'),
                        })
                    }
                />
            </Box>
        </Stack>
    );
};

export const ModifyImagesDialog: FunctionComponent<{
    eventId: number;
    location: CoordinatesType | null;
}> = ({ eventId, location }) => {
    const { t } = useTranslation('common');

    const eventQuery = api.event.getById.useQuery({
        eventId,
        location,
    });

    return (
        <QueryComponent
            resourceName={t('resource.eventDetails')}
            query={eventQuery}
            eventInfo={{ event: InvalidateEvent.EventGetById, id: eventId }}
        >
            {eventQuery.data && (
                <Group position="center">
                    <EventImageWithUpload
                        event={eventQuery.data}
                        index={0}
                    />
                    <EventImageWithUpload
                        event={eventQuery.data}
                        index={1}
                    />
                    <EventImageWithUpload
                        event={eventQuery.data}
                        index={2}
                    />
                </Group>
            )}
        </QueryComponent>
    );
};
