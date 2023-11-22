import {z} from 'zod';
import {BasicCommentSchema, DetailedCommentSchema, MutateCommentSchema} from '../../../models/Comment';
import {InvalidateEvent, PusherChannel, SortCommentByProperty, SortDirection} from '../../../utils/enums';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '@prisma/client';
import {IdSchema} from '../../../models/Utils';

export const commentRouter = createTRPCRouter({
  getAllByEventId: protectedProcedure
    .input(IdSchema)
    .output(BasicCommentSchema.array())
    .query(async ({input: eventId, ctx}) => {
      const event = await ctx.prisma.event.findUnique({
        where: {id: eventId},
        include: {
          comments: {
            include: {user: true},
            orderBy: {postedAt: Prisma.SortOrder.desc},
          }
        },
      });

      return BasicCommentSchema.array().parse(event?.comments);
    }),
  getAllCreated: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number().min(5).max(50),
      searchQuery: z.string(),
      sortBy: z.object({
        property: z.nativeEnum(SortCommentByProperty),
        direction: z.nativeEnum(SortDirection),
      }),
    }))
    .output(z.object({comments: DetailedCommentSchema.array(), size: z.number()}))
    .query(async ({input: {page, pageSize, sortBy, searchQuery}, ctx: {prisma, session: {user: {id: callerId}}}}) => {
      const orderBy: {
        text?: Prisma.SortOrder;
        postedAt?: Prisma.SortOrder;
        event?: { name: Prisma.SortOrder };
      } = {};
      if (sortBy.property === SortCommentByProperty.EVENT) {
        orderBy[sortBy.property] = {name: sortBy.direction};
      } else {
        orderBy[sortBy.property] = sortBy.direction;
      }

      const where = {
        userId: callerId,
        text: {
          mode: 'insensitive',
          contains: searchQuery,
        } as Prisma.StringFilter,
      };

      const [comments, numberOfComments] = await prisma.$transaction([
        prisma.comment.findMany({
          where,
          include: {event: true},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        prisma.comment.count({
          where,
        }),
      ]);

      return {
        comments: DetailedCommentSchema.array().parse(comments),
        size: numberOfComments,
      };
    }),
  create: protectedProcedure
    .input(z.object({createComment: MutateCommentSchema, eventId: IdSchema}))
    .output(z.void())
    .mutation(async ({input: {createComment, eventId}, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.comment.create({
        data: {
          ...createComment,
          event: {connect: {id: eventId}},
          user: {connect: {id: callerId}},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.CommentGetAllByEventId, eventId);
    }),
  update: protectedProcedure
    .input(z.object({comment: MutateCommentSchema, commentId: IdSchema, eventId: IdSchema}))
    .output(z.void())
    .mutation(async ({
                       input: {commentId, comment, eventId},
                       ctx: {session: {user: {id: callerId}}, prisma, pusher}
                     }) => {
      await prisma.comment.update({
        where: {id: commentId, userId: callerId},
        data: {
          ...comment,
          event: {connect: {id: eventId}},
          user: {connect: {id: callerId}},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.CommentGetAllByEventId, eventId);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      const deletedComment = await prisma.comment.delete({
        where: {
          id: input,
          userId: callerId,
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.CommentGetAllByEventId, deletedComment.eventId);
    }),
});
