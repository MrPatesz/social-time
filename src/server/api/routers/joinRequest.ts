import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import {
    AcceptJoinRequestSchema,
    JoinRequestSchema,
    MutateJoinRequestSchema,
    QueryJoinRequestSchema,
} from '../../../models/JoinRequest';
import { InvalidateEvent, PusherChannel } from '../../../utils/enums';

export const joinRequestRouter = createTRPCRouter({
    getAllByGroupId: protectedProcedure
        .input(QueryJoinRequestSchema)
        .output(JoinRequestSchema.array())
        .query(
            async ({
                input: { groupId },
                ctx: {
                    session: {
                        user: { id: callerId },
                    },
                    prisma,
                },
            }) => {
                const joinRequests = await prisma.joinRequest.findMany({
                    where: { groupId, group: { creatorId: callerId } },
                    include: { user: true },
                });

                return JoinRequestSchema.array().parse(joinRequests);
            }
        ),
    hasJoinRequest: protectedProcedure
        .input(QueryJoinRequestSchema)
        .output(z.boolean())
        .query(
            async ({
                input: { groupId },
                ctx: {
                    session: {
                        user: { id: callerId },
                    },
                    prisma,
                },
            }) => {
                const joinRequest = await prisma.joinRequest.findUnique({
                    where: { groupId_userId: { groupId, userId: callerId } },
                });

                return Boolean(joinRequest);
            }
        ),
    accept: protectedProcedure
        .input(AcceptJoinRequestSchema)
        .output(z.void())
        .mutation(
            async ({
                input: { groupId, userId, accept },
                ctx: {
                    session: {
                        user: { id: callerId },
                    },
                    prisma,
                    pusher,
                },
            }) => {
                await prisma.$transaction([
                    prisma.group.update({
                        where: { id: groupId, creatorId: callerId },
                        data: {
                            members:
                                accept ?
                                    {
                                        connect: { id: userId },
                                    }
                                :   {
                                        disconnect: { id: userId },
                                    },
                        },
                    }),
                    prisma.joinRequest.delete({
                        where: {
                            groupId_userId: { groupId, userId },
                            group: { creatorId: callerId },
                        },
                    }),
                ]);

                if (accept) {
                    await pusher.trigger(
                        PusherChannel.INVALIDATE,
                        InvalidateEvent.GroupGetById,
                        groupId
                    );
                }
                await pusher.trigger(
                    PusherChannel.INVALIDATE,
                    InvalidateEvent.JoinRequestHasJoinRequest,
                    userId
                );
            }
        ),
    mutate: protectedProcedure
        .input(MutateJoinRequestSchema)
        .output(z.void())
        .mutation(
            async ({
                input: { groupId, join },
                ctx: {
                    session: {
                        user: { id: callerId },
                    },
                    prisma,
                    pusher,
                },
            }) => {
                if (join) {
                    await prisma.joinRequest.create({
                        data: {
                            userId: callerId,
                            groupId,
                        },
                    });
                } else {
                    await prisma.joinRequest.delete({
                        where: { groupId_userId: { groupId, userId: callerId } },
                    });
                }

                await pusher.trigger(
                    PusherChannel.INVALIDATE,
                    InvalidateEvent.JoinRequestGetAllByGroupId,
                    groupId
                );
                await pusher.trigger(
                    PusherChannel.INVALIDATE,
                    InvalidateEvent.JoinRequestHasJoinRequest,
                    callerId
                );
            }
        ),
});
