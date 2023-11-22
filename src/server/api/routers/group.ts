import {z} from 'zod';
import {BasicGroupSchema, DetailedGroupSchema, MutateGroupSchema} from '../../../models/Group';
import {PaginateGroupsSchema} from '../../../models/pagination/PaginateGroups';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '@prisma/client';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';
import {TRPCError} from '@trpc/server';

type Range = { start: number, end: number };
type DateRange = { start: Date, end: Date };

const calculateFreeIntervals = (events: Array<DateRange>, intervalStart: Date, intervalEnd: Date) => {
  const ranges: Array<Range> = [
    {start: intervalStart.getTime(), end: intervalStart.getTime()},
    ...events.map(e => ({start: e.start.getTime(), end: e.end.getTime()})),
    {start: intervalEnd.getTime(), end: intervalEnd.getTime()},
  ];
  let previousRange: Range;
  const gaps: Array<DateRange> = [];

  ranges.forEach(({start, end}) => {
    // gap must be at least 30 minutes long
    if (previousRange && (start - previousRange.end > 30 * 60 * 1000)) {
      gaps.push({
        start: new Date(previousRange.end),
        end: new Date(start),
      });
    }
    previousRange = {start, end};
  });

  return gaps;
};

export const groupRouter = createTRPCRouter({
  getPaginatedGroups: protectedProcedure
    .input(PaginateGroupsSchema)
    .output(z.object({groups: BasicGroupSchema.array(), size: z.number()}))
    .query(async ({
                    input: {page, pageSize, sortBy, createdOnly, searchQuery},
                    ctx: {session: {user: {id: callerId}}, prisma}
                  }) => {
      const orderBy: {
        name?: Prisma.SortOrder;
        createdAt?: Prisma.SortOrder;
        // memberCount?: Prisma.SortOrder;
      } = {};
      orderBy[sortBy.property] = Prisma.SortOrder[sortBy.direction];

      const where = {
        creatorId: createdOnly ? callerId : undefined,
        name: searchQuery ? ({
          mode: 'insensitive',
          contains: searchQuery,
        } as Prisma.StringFilter) : undefined,
      };

      const [groups, numberOfGroups] = await prisma.$transaction([
        prisma.group.findMany({
          where,
          include: {creator: true},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        prisma.group.count({
          where,
        }),
      ]);

      return {
        groups: BasicGroupSchema.array().parse(groups),
        size: numberOfGroups,
      };
    }),
  getById: protectedProcedure
    .input(IdSchema)
    .output(DetailedGroupSchema)
    .query(async ({input: id, ctx}) => {
      const group = await ctx.prisma.group.findUnique({
        where: {id},
        include: {creator: true, members: true},
      });

      return DetailedGroupSchema.parse(group);
    }),
  getFreeIntervals: protectedProcedure
    .input(z.object({
      groupId: IdSchema,
      from: z.date(),
      until: z.date(),
    }))
    .output(z.object({
        start: z.date(),
        end: z.date()
      }).array()
    )
    .query(async ({input: {groupId, from, until}, ctx: {prisma, session: {user: {id: callerId}}}}) => {
      const group = await prisma.group.findUnique({
        where: {id: groupId, members: {some: {id: callerId}}},
        include: {
          members: {
            include: {
              participatedEvents: {
                where: {start: {gte: from}, end: {lte: until}},
              }
            }
          }
        }
      });

      if (!group) {
        throw new TRPCError({code: 'BAD_REQUEST', message: `There is no group with this id: ${groupId}!`});
      }

      const allEvents = group.members
        .flatMap(member => member.participatedEvents);

      const events = [...new Map(allEvents.map(item => [item.id, item])).values()]
        .sort((e1, e2) => e1.start.getTime() - e2.start.getTime());

      return calculateFreeIntervals(events, from, until).map(({start, end}) =>
        ({start: new Date(start), end: new Date(end)})
      );
    }),
  getJoinedGroups: protectedProcedure
    .output(BasicGroupSchema.array())
    .query(async ({ctx: {prisma, session: {user: {id: callerId}}}}) => {
      const groups = await prisma.group.findMany({
        where: {members: {some: {id: callerId}}},
        include: {creator: true},
      });

      return BasicGroupSchema.array().parse(groups);
    }),
  create: protectedProcedure
    .input(MutateGroupSchema)
    .output(z.void())
    .mutation(async ({input: createGroup, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.create({
        data: {
          ...createGroup,
          creator: {connect: {id: callerId}},
          members: {connect: {id: callerId}},
        },
      });
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, callerId);
    }),
  update: protectedProcedure
    .input(z.object({group: MutateGroupSchema, id: IdSchema}))
    .output(z.void())
    .mutation(async ({input: {group, id: groupId}, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      if (group.isPrivate) {
        await prisma.group.update({
          where: {id: groupId, creatorId: callerId},
          data: {
            ...group,
            creator: {connect: {id: callerId}},
          },
        });
      } else {
        const joinRequests = await prisma.joinRequest.findMany({
          where: {groupId, group: {creatorId: callerId}},
        });

        await prisma.$transaction([
          prisma.group.update({
            where: {id: groupId, creatorId: callerId},
            data: {
              ...group,
              creator: {connect: {id: callerId}},
              members: {connect: joinRequests.map(({userId}) => ({id: userId}))},
            },
          }),
          prisma.joinRequest.deleteMany({
            where: {groupId, group: {creatorId: callerId}},
          }),
        ]);
      }

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, groupId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, null);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.delete({
        where: {
          id: input,
          creatorId: callerId,
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, input);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, null);
    }),
  join: protectedProcedure
    .input(z.object({id: IdSchema, join: z.boolean()}))
    .output(z.void())
    .mutation(async ({input: {id: groupId, join}, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.update({
        where: join ? {id: groupId, isPrivate: false} : {id: groupId},
        data: {
          members: join ? {
            connect: {id: callerId},
          } : {
            disconnect: {id: callerId},
          },
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, groupId);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, callerId);
    }),
  // TODO give ownership
});
