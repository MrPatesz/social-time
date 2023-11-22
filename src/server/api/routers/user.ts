import {z} from 'zod';
import {PaginateUsersSchema} from '../../../models/pagination/PaginateUsers';
import {
  BasicUserSchema,
  DetailedUserSchema,
  ProfileSchema,
  UpdateProfileSchema,
  UpdateProfileType
} from '../../../models/User';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '@prisma/client';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';

export const userRouter = createTRPCRouter({
  getPaginatedUsers: protectedProcedure
    .input(PaginateUsersSchema)
    .output(z.object({users: BasicUserSchema.array(), size: z.number()}))
    .query(async ({
                    input: {page, pageSize, sortBy, searchQuery},
                    ctx: {prisma},
                  }) => {
      const where = searchQuery ? {
        name: {
          mode: 'insensitive',
          contains: searchQuery,
        } as Prisma.StringFilter,
      } : undefined;

      const [users, numberOfUsers] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: {name: sortBy.direction},
        }),
        prisma.user.count({
          where,
        }),
      ]);

      return {
        users: BasicUserSchema.array().parse(users),
        size: numberOfUsers,
      };
    }),
  profile: protectedProcedure
    .output(ProfileSchema)
    .query(async ({ctx: {prisma, session: {user: {id: userId}}}}) => {
      const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {location: true},
      });

      return ProfileSchema.parse(user);
    }),
  deleteProfile: protectedProcedure
    .output(z.void())
    .mutation(async ({ctx: {prisma, session: {user: {id: userId}}, pusher}}) => {
      const deletedUser = await prisma.user.delete({
        where: {id: userId},
        include: {createdEvents: true, createdGroups: true},
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, userId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetPaginatedUsers, null);

      if (deletedUser.createdEvents.length) {
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetMap, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.CommentGetAllByEventId, null);
      }

      if (deletedUser.createdGroups.length) {
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
        await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupChatGetMessages, null);
      }
    }),
  getById: protectedProcedure
    .input(z.string())
    .output(DetailedUserSchema)
    .query(async ({input: id, ctx: {prisma, session: {user: {id: callerId}}}}) => {
      const user = await prisma.user.findFirst({
        where: {id},
        include: {
          createdEvents: {
            where: {
              OR: [
                {groupId: null},
                {group: {members: {some: {id: callerId}}}},
              ],
            },
            include: {location: true, creator: true, group: {include: {creator: true}}},
            orderBy: {start: Prisma.SortOrder.desc},
          },
          participatedEvents: {
            where: {
              creatorId: {not: id},
              OR: [
                {groupId: null},
                {group: {members: {some: {id: callerId}}}},
              ],
            },
            include: {location: true, creator: true, group: {include: {creator: true}}},
            orderBy: {start: Prisma.SortOrder.desc},
          },
        },
      });

      return DetailedUserSchema.parse(user);
    }),
  update: protectedProcedure
    .input(UpdateProfileSchema)
    .output(UpdateProfileSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      // cannot update profile image from this endpoint
      const newData = {...input} as Partial<UpdateProfileType>;
      delete newData.image;

      const updatedUser = await prisma.user.update({
        where: {id: callerId},
        data: {
          ...newData,
          location: input.location ? {
            connectOrCreate: {
              where: {
                address: input.location.address,
              },
              create: input.location,
            }
          } : {disconnect: true},
        },
        include: {location: true},
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetPaginatedUsers, null);

      return ProfileSchema.parse(updatedUser);
    }),
});
