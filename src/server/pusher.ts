import PusherServer from 'pusher';
import { env } from '../env.mjs';

const globalForPusher = globalThis as unknown as { pusher: PusherServer };

export const pusher =
    globalForPusher.pusher ||
    new PusherServer({
        appId: env.PUSHER_APP_ID,
        key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
        secret: env.PUSHER_SECRET,
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
    });

if (env.NODE_ENV !== 'production') globalForPusher.pusher = pusher;
