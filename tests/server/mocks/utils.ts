import {PrismaClient} from '@prisma/client';
import {Session} from 'next-auth';
import PusherServer from 'pusher';
import {env} from '../../../src/env.mjs';
import {appRouter} from '../../../src/server/api/root';
import {ThemeColor} from '../../../src/utils/enums';
import {$Enums} from '.prisma/client';

const testPusherClient = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trigger: (_channel: unknown, _event: unknown, _data: unknown) => Promise.resolve(),
} as unknown as PusherServer;

export const testPrismaClient = new PrismaClient({
  datasources: {db: {url: env.TESTING_DATABASE_URL}},
});

export const getTestCaller = (user: (Omit<Session['user'], 'themeColor'> & { themeColor: $Enums.Color }) | null) => {
  const session = user ? ({
    expires: new Date().toISOString(),
    user: {...user, themeColor: user.themeColor as ThemeColor}
  } satisfies Session) : null;

  return appRouter.createCaller({
    session,
    prisma: testPrismaClient,
    pusher: testPusherClient,
  });
};
