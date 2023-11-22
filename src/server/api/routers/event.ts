import {Prisma, PrismaClient} from '@prisma/client';
import {TRPCError} from '@trpc/server';
import {z} from 'zod';
import {
  BasicEventSchema,
  DetailedEventSchema,
  EventWithLocationSchema,
  IntervalSchema,
  MutateEventSchema,
} from '../../../models/Event';
import {CoordinatesSchema, CoordinatesType} from '../../../models/Location';
import {PaginateEventsSchema} from '../../../models/pagination/PaginateEvents';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';
import {createTRPCRouter, protectedProcedure} from '../trpc';

const getEventDistance = async (prisma: PrismaClient, eventId: number, location: CoordinatesType) => {
  const [{distanceInKilometers}] = await prisma.$queryRaw<[{
    distanceInKilometers: number
  }]>`
    SELECT ST_Distance(eventLocation.location, center.location, false)/1000 as "distanceInKilometers"
    FROM (
      (
        SELECT ST_MakePoint(longitude, latitude) as location
        FROM (
          SELECT "Event"."locationId"
          FROM "Event"
          WHERE "Event".id = ${eventId}
          LIMIT 1
        ) as e JOIN "Location" ON e."locationId" = "Location".id
      ) as eventLocation
      CROSS JOIN
      (SELECT * FROM ST_MakePoint(${location.longitude}, ${location.latitude}) as location) as center
    )
  `;

  return distanceInKilometers;
};

const filterDistantEvents = async <EventType extends {
  id: number
}>(
  prisma: PrismaClient,
  events: EventType[],
  maxDistance: number | null,
  center: CoordinatesType
) => {
  const eventsWithDistance = await Promise.all(events.map(async event => ({
    ...event,
    distance: await getEventDistance(prisma, event.id, center),
  })));

  return maxDistance ? eventsWithDistance.filter(event => event.distance < maxDistance) : eventsWithDistance;
};

export const eventRouter = createTRPCRouter({
  getPaginatedEvents: protectedProcedure
    .input(PaginateEventsSchema)
    .output(z.object({events: BasicEventSchema.array(), size: z.number()}))
    .query(async ({
                    input: {page, pageSize, sortBy, archive, createdOnly, searchQuery},
                    ctx: {session: {user: {id: callerId}}, prisma}
                  }) => {
      const orderBy: {
        name?: Prisma.SortOrder;
        start?: Prisma.SortOrder;
        price?: Prisma.SortOrder;
        limit?: Prisma.SortOrder;
      } = {};
      orderBy[sortBy.property] = sortBy.direction;

      const where = {
        creatorId: createdOnly ? callerId : undefined,
        OR: [
          {groupId: null},
          {group: {members: {some: {id: callerId}}}},
        ],
        start: archive ? {
          lt: new Date(),
        } : {
          gt: new Date(),
        },
        name: searchQuery ? ({
          mode: 'insensitive',
          contains: searchQuery,
        } as Prisma.StringFilter) : undefined,
      };

      const [events, numberOfEvents] = await prisma.$transaction([
        prisma.event.findMany({
          where,
          include: {location: true, creator: true, group: {include: {creator: true}}},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        prisma.event.count({
          where,
        }),
      ]);

      return {
        events: BasicEventSchema.array().parse(events),
        size: numberOfEvents,
      };
    }),
  getFeed: protectedProcedure
    .input(z.object({
      cursor: z.date().nullish(),
      groupId: IdSchema.nullish(),
      includeArchive: z.boolean().optional(),
      myGroupsOnly: z.boolean().optional(),
      distanceFilter: z.object({
        maxDistance: z.number().nonnegative().nullable(),
        location: CoordinatesSchema.nullable(),
      }).optional(),
    }))
    .output(z.object({
      events: BasicEventSchema.array(),
      nextCursor: z.date().nullish(),
    }))
    .query(async ({
                    input: {
                      cursor,
                      groupId,
                      distanceFilter,
                      includeArchive = true,
                      myGroupsOnly = false,
                    },
                    ctx: {session: {user: {id: callerId}}, prisma}
                  }) => {
      const limit = 10;

      const events = await prisma.event.findMany({
        where: groupId ? {groupId} : {
          creatorId: {not: callerId},
          ...(includeArchive ? undefined : ({
            start: {gt: new Date()},
          })),
          ...(myGroupsOnly ? ({
            group: {members: {some: {id: callerId}}},
          }) : ({
            OR: [
              {groupId: null},
              {group: {members: {some: {id: callerId}}}},
            ],
          })),
        },
        take: limit + 1,
        cursor: cursor ? {createdAt: cursor} : undefined,
        orderBy: {createdAt: Prisma.SortOrder.desc},
        include: {location: true, creator: true, group: {include: {creator: true}}},
      });

      let nextCursor: Date | undefined = undefined;
      if (events.length > limit) {
        const nextItem = events.pop();
        nextCursor = nextItem?.createdAt;
      }

      const basicEvents = BasicEventSchema.array().parse(events);

      if (!distanceFilter?.location) {
        return {
          events: basicEvents,
          nextCursor,
        };
      }

      const filteredEvents = await filterDistantEvents(
        prisma,
        basicEvents,
        distanceFilter.maxDistance,
        distanceFilter.location
      );

      return {
        events: filteredEvents,
        nextCursor,
      };
    }),
  getMap: protectedProcedure
    .input(z.object({
      center: CoordinatesSchema,
      maxDistance: z.number().positive(),
      includeArchive: z.boolean(),
      myGroupsOnly: z.boolean(),
    }))
    .output(BasicEventSchema.array())
    .query(async ({
                    input: {includeArchive, myGroupsOnly, center, maxDistance},
                    ctx: {session: {user: {id: callerId}}, prisma}
                  }) => {
      const events = await prisma.event.findMany({
        where: {
          creatorId: {not: callerId},
          ...(myGroupsOnly ? ({
            group: {members: {some: {id: callerId}}},
          }) : ({
            OR: [
              {groupId: null},
              {group: {members: {some: {id: callerId}}}},
            ],
          })),
          ...(includeArchive ? undefined : ({
            start: {gt: new Date()},
          })),
        },
        include: {location: true, creator: true, group: {include: {creator: true}}},
      });

      const filteredEvents = await filterDistantEvents(prisma, events, maxDistance, center);

      return BasicEventSchema.array().parse(filteredEvents);
    }),
  getCalendar: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {
          participatedEvents: {
            include: {location: true, creator: true, group: {include: {creator: true}}}
          },
        },
      });

      return BasicEventSchema.array().parse(caller?.participatedEvents);
    }),
  getParticipatedInInterval: protectedProcedure
    .input(IntervalSchema)
    .output(EventWithLocationSchema.array())
    .query(async ({input: {start, end}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {
          participatedEvents: {
            where: {start: {gte: start, lte: end}},
            include: {location: true},
          },
        },
      });

      return EventWithLocationSchema.array().parse(caller?.participatedEvents);
    }),
  getById: protectedProcedure
    .input(z.object({eventId: IdSchema, location: CoordinatesSchema.nullable()}))
    .output(DetailedEventSchema)
    .query(async ({input: {eventId: id, location}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const event = await prisma.event.findUnique({
        where: {
          id,
          OR: [
            {groupId: null},
            {group: {members: {some: {id: callerId}}}},
          ],
        },
        include: {
          creator: true,
          participants: true,
          location: true,
          group: {include: {creator: true}},
        },
      });

      if (location) {
        return DetailedEventSchema.parse({
          ...event,
          distance: await getEventDistance(prisma, id, location),
        });
      } else {
        return DetailedEventSchema.parse(event);
      }
    }),
  create: protectedProcedure
    .input(MutateEventSchema)
    .output(z.void())
    .mutation(async ({input: createEvent, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.event.create({
        data: {
          ...createEvent,
          groupId: undefined,
          group: createEvent.groupId ? {connect: {id: createEvent.groupId}} : undefined,
          creator: {connect: {id: callerId}},
          participants: {connect: {id: callerId}},
          location: {
            connectOrCreate: {
              where: {
                address: createEvent.location.address,
              },
              create: createEvent.location,
            },
          },
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, callerId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetMap, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
  participate: protectedProcedure
    .input(z.object({id: IdSchema, participate: z.boolean()}))
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      const event = await prisma.event.findUnique({
        where: {id: input.id},
        include: {participants: true},
      });

      if (input.participate && event?.limit && (event.participants.length >= event.limit)) {
        throw new TRPCError({code: 'BAD_REQUEST', message: 'Event is already full!'});
      }

      await prisma.event.update({
        where: {
          id: input.id,
          start: {gt: new Date()},
        },
        data: {
          participants: input.participate ? {
            connect: {id: callerId},
          } : {
            disconnect: {id: callerId},
          },
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, input.id);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
  update: protectedProcedure
    .input(z.object({event: MutateEventSchema, id: IdSchema}))
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      const participantsCount = await prisma.user.count({
        where: {participatedEvents: {some: {id: input.id}}},
      });

      if (input.event.limit && participantsCount > input.event.limit) {
        throw new TRPCError({code: 'BAD_REQUEST', message: 'Event has more participants than new limit!'});
      }

      await prisma.event.update({
        where: {
          id: input.id,
          creatorId: callerId,
          start: {gt: new Date()},
        },
        data: {
          ...input.event,
          groupId: undefined,
          group: input.event.groupId ? {connect: {id: input.event.groupId}} : undefined,
          creator: {connect: {id: callerId}},
          location: {
            connectOrCreate: {
              where: {
                address: input.event.location.address,
              },
              create: input.event.location,
            },
          },
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, input.id);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetMap, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.event.delete({
        where: {
          id: input,
          creatorId: callerId,
          start: {gt: new Date()},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, input);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetMap, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.CommentGetAllByEventId, input);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
});
