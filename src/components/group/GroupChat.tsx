import { Box, Card, ScrollArea, Stack } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useEffect, useMemo, useRef } from 'react';
import { api } from '../../utils/api';
import { getBackgroundColor } from '../../utils/utilFunctions';
import { CommentCard } from '../comment/CommentCard';
import { AddMessage } from './AddMessage';
import { QueryComponent } from '../QueryComponent';
import { InvalidateEvent } from '../../utils/enums';
import { BasicMessageType } from '../../models/Message';

export const GroupChat: FunctionComponent<{
    groupId: number;
}> = ({ groupId }) => {
    const viewport = useRef<HTMLDivElement>(null);
    const { t } = useTranslation('common');
    const { ref, entry } = useIntersection({ threshold: 0.1 });

    const messagesQuery = api.groupChat.getMessages.useInfiniteQuery(
        { groupId },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            // onSuccess: () => scrollToBottom(true), // TODO on new message
        }
    );

    const scrollToBottom = (smooth = false) =>
        viewport.current?.scrollTo({
            top: viewport.current?.scrollHeight,
            behavior: smooth ? 'smooth' : undefined,
        });

    const messages: BasicMessageType[] = useMemo(() => {
        if (!messagesQuery.data) return [];

        return [...messagesQuery.data.pages].reverse().flatMap((page) => page.messages);
    }, [messagesQuery.data]);

    useEffect(() => {
        scrollToBottom();
    }, [viewport.current, messagesQuery.isLoading]);

    // TODO refactor this
    useEffect(() => {
        if (entry?.isIntersecting && messagesQuery.hasNextPage && !messagesQuery.isFetching) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            messagesQuery.fetchNextPage().then(() => {
                setTimeout(() => {
                    const numberOfPages = messagesQuery.data?.pages.length ?? 1;
                    const scrollRatio = 1 - numberOfPages / (numberOfPages + 1);
                    viewport.current?.scrollTo({
                        top: viewport.current?.scrollHeight * scrollRatio,
                    });
                }, 100);
            });
        }
    }, [entry]);

    return (
        <QueryComponent
            resourceName={t('resource.chat')}
            query={messagesQuery}
            eventInfo={{ event: InvalidateEvent.GroupChatGetMessages, id: groupId }}
        >
            <Card
                withBorder
                sx={(theme) => ({ backgroundColor: getBackgroundColor(theme) })}
            >
                <Stack>
                    {!!messages.length && (
                        <ScrollArea viewportRef={viewport}>
                            <Stack sx={{ maxHeight: 400 }}>
                                {messages.map((message, index) => (
                                    <Box
                                        ref={index === 0 ? ref : undefined}
                                        key={message.id}
                                    >
                                        <CommentCard comment={message} />
                                    </Box>
                                ))}
                            </Stack>
                        </ScrollArea>
                    )}
                    <AddMessage groupId={groupId} />
                </Stack>
            </Card>
        </QueryComponent>
    );
};
