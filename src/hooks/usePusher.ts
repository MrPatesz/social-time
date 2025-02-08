import { useEffect } from 'react';
import { InvalidateEvent, PusherChannel } from '../utils/enums';
import { pusherClient } from '../utils/pusher';
import { z } from 'zod';
import { IdSchema } from '../models/Utils';

export interface EventInfo {
    event: InvalidateEvent;
    id?: number | string;
}

export const useInitializePusher = () => {
    useEffect(() => {
        pusherClient.subscribe(PusherChannel.INVALIDATE);
        return () => {
            pusherClient.unsubscribe(PusherChannel.INVALIDATE);
        };
    }, []);
};

export const usePusher = (eventInfo: EventInfo | undefined, onEvent: () => void) => {
    useEffect(() => {
        if (!eventInfo) {
            return;
        }

        const handleEvent = (rawData: unknown) => {
            const data = z
                .union([IdSchema, z.string().min(1)])
                .optional()
                .parse(rawData);
            if (!data || data === eventInfo.id) {
                onEvent();
            }
        };

        pusherClient.bind(eventInfo.event, handleEvent);
        return () => {
            pusherClient.unbind(eventInfo.event, handleEvent);
        };
    }, [eventInfo, onEvent]);
};
