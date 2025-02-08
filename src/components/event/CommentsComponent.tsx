import { Card, ScrollArea, Stack } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { usePathId } from '../../hooks/usePathId';
import { api } from '../../utils/api';
import { EVENT_IMAGE_SIZE } from '../../utils/constants';
import { InvalidateEvent } from '../../utils/enums';
import { getBackgroundColor } from '../../utils/utilFunctions';
import { CenteredLoader } from '../CenteredLoader';
import { AddComment } from '../comment/AddComment';
import { CommentCard } from '../comment/CommentCard';
import { QueryComponent } from '../QueryComponent';

export const CommentsComponent = () => {
    const { id: eventId, isReady } = usePathId<number>();
    const { t } = useTranslation('common');

    const commentsQuery = api.comment.getAllByEventId.useQuery(eventId!, {
        enabled: isReady,
        refetchOnMount: false,
    });

    return !isReady ?
            <CenteredLoader />
        :   <QueryComponent
                resourceName={t('resource.comments')}
                query={commentsQuery}
                eventInfo={{ event: InvalidateEvent.CommentGetAllByEventId, id: eventId }}
            >
                <Card
                    withBorder
                    sx={(theme) => ({ backgroundColor: getBackgroundColor(theme) })}
                >
                    <Stack>
                        <AddComment eventId={eventId} />
                        {!!commentsQuery.data?.length && (
                            <ScrollArea>
                                <Stack sx={{ maxHeight: EVENT_IMAGE_SIZE - 86 }}>
                                    {commentsQuery.data.map((comment) => (
                                        <CommentCard
                                            key={comment.id}
                                            comment={comment}
                                        />
                                    ))}
                                </Stack>
                            </ScrollArea>
                        )}
                    </Stack>
                </Card>
            </QueryComponent>;
};
