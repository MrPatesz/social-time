import {z} from 'zod';
import {AverageRatingSchema, BasicRatingSchema, MutateRatingSchema} from '../../../models/Rating';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';

export const ratingRouter = createTRPCRouter({
  getAverageRatingForEvent: protectedProcedure
    .input(IdSchema)
    .output(AverageRatingSchema)
    .query(async ({input: id, ctx: {prisma}}) => {
      const rating = await prisma.rating.aggregate({
        where: {eventId: id},
        _count: {stars: true},
        _avg: {stars: true},
      });

      return {
        count: rating._count.stars,
        averageStars: rating._avg.stars,
      };
    }),
  getAverageRatingForUser: protectedProcedure
    .input(z.string())
    .output(AverageRatingSchema)
    .query(async ({input: userId, ctx: {prisma}}) => {
      const usersEvents = await prisma.event.findMany({
        where: {creatorId: userId},
      });

      const eventIds = usersEvents.map(e => e.id);

      const rating = await prisma.rating.aggregate({
        where: {eventId: {in: eventIds}},
        _count: {stars: true},
        _avg: {stars: true},
      });

      return {
        count: rating._count.stars,
        averageStars: rating._avg.stars,
      };
    }),
  getAverageRatingForGroup: protectedProcedure
    .input(z.number())
    .output(AverageRatingSchema)
    .query(async ({input: groupId, ctx: {prisma}}) => {
      const groupsEvents = await prisma.event.findMany({
        where: {groupId},
      });

      const eventIds = groupsEvents.map(e => e.id);

      const rating = await prisma.rating.aggregate({
        where: {eventId: {in: eventIds}},
        _count: {stars: true},
        _avg: {stars: true},
      });

      return {
        count: rating._count.stars,
        averageStars: rating._avg.stars,
      };
    }),
  getCallerRating: protectedProcedure
    .input(IdSchema)
    .output(BasicRatingSchema.nullish())
    .query(async ({input: eventId, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const findRating = await prisma.rating.findFirst({
        where: {userId: callerId, eventId},
      });

      return BasicRatingSchema.nullish().parse(findRating);
    }),
  rate: protectedProcedure
    .input(z.object({
      createRating: MutateRatingSchema,
      eventId: IdSchema,
    }))
    .output(z.void())
    .mutation(async ({input: {createRating, eventId}, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      // TODO don’t let user rate event that is not participated by them
      const foundRating = await prisma.rating.findFirst({
        where: {userId: callerId, eventId},
        include: {event: true},
      });

      // TODO refactor with upsert
      if (foundRating) {
        await prisma.rating.update({
          where: {id: foundRating.id},
          data: {stars: createRating.stars},
        });
      } else {
        await prisma.rating.create({
          data: {
            ...createRating,
            event: {connect: {id: eventId}},
            user: {connect: {id: callerId}},
          },
        });
      }

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.RatingGetAverageRatingForEvent, eventId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.RatingGetAverageRatingForUser, callerId);
      if (foundRating?.event.groupId) {
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.RatingGetAverageRatingForGroup, foundRating.event.groupId);
      }
    }),
});
