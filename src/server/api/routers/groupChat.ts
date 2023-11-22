import {z} from 'zod';
import {BasicMessageSchema, CreateMessageSchema} from '../../../models/Message';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '@prisma/client';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';
import {TRPCError} from '@trpc/server';

export const groupChatRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(z.object({
      groupId: IdSchema,
      cursor: z.date().nullish(),
    }))
    .output(z.object({
      messages: BasicMessageSchema.array(),
      nextCursor: z.date().nullish(),
    }))
    .query(async ({input: {cursor, groupId}, ctx: {prisma, session: {user: {id: callerId}}}}) => {
      const limit = 10;

      // TODO get these in reverse, so FE doesn't have to reverse them?
      const messages = await prisma.message.findMany({
        where: {groupId, group: {members: {some: {id: callerId}}}},
        take: -(limit + 1),
        cursor: cursor ? {postedAt: cursor} : undefined,
        orderBy: {postedAt: Prisma.SortOrder.asc},
        include: {user: true},
      });

      let nextCursor: Date | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.shift();
        nextCursor = nextItem?.postedAt;
      }

      return {
        messages: BasicMessageSchema.array().parse(messages),
        nextCursor,
      };
    }),
  create: protectedProcedure
    .input(z.object({createMessage: CreateMessageSchema, groupId: IdSchema}))
    .output(z.void())
    .mutation(async (
      {
        input: {createMessage, groupId},
        ctx: {session: {user: {id: callerId}}, prisma, pusher}
      }
    ) => {
      const userInGroup = await prisma.group.findUnique({
        where: {
          id: groupId,
          members: {some: {id: callerId}},
        },
      });

      if (!userInGroup) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `User with id: ${callerId} is not in group with id: ${groupId}!`
        });
      }

      await prisma.message.create({
        data: {
          ...createMessage,
          group: {connect: {id: groupId}},
          user: {connect: {id: callerId}},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupChatGetMessages, groupId);
    }),
});
