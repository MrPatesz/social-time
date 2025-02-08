import { createUploadthing, type FileRouter } from 'uploadthing/next-legacy';
import { UTApi } from 'uploadthing/server';
import { z } from 'zod';
import { IdSchema, ImageSchema } from '../models/Utils';
import { InvalidateEvent, PusherChannel } from '../utils/enums';
import { getServerAuthSession } from './auth';
import { prisma } from './db';
import { pusher } from './pusher';

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
    updateProfileImage: f({ image: { maxFileSize: '1MB', maxFileCount: 1 } })
        .input(
            z.object({
                previousImage: ImageSchema,
            })
        )
        .middleware(async ({ req, res, input }) => {
            // This code runs on your server before upload
            const session = await getServerAuthSession({ req, res });

            if (!session?.user) throw new Error('Unauthorized');

            return { userId: session.user.id, previousImage: input.previousImage };
        })
        .onUploadComplete(async ({ file, metadata: { userId, previousImage } }) => {
            // This code runs on your server after upload
            await prisma.user.update({
                where: { id: userId },
                data: {
                    image: file.url,
                },
            });

            await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, userId);
            await pusher.trigger(
                PusherChannel.INVALIDATE,
                InvalidateEvent.UserGetPaginatedUsers,
                null
            );

            if (previousImage) {
                const key = previousImage.split('/').at(-1);
                if (key) {
                    await utapi.deleteFiles(key);
                }
            }
        }),
    changeEventImage: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
        .input(
            z.object({
                eventId: IdSchema,
                index: z.union([z.literal(0), z.literal(1), z.literal(2)]),
            })
        )
        .middleware(async ({ req, res, input: { eventId, index } }) => {
            // This code runs on your server before upload
            const session = await getServerAuthSession({ req, res });

            if (!session?.user) throw new Error('Unauthorized');

            const event = await prisma.event.findUnique({
                where: { id: eventId, creatorId: session.user.id },
            });

            if (!event) throw new Error(`Event doesn't exist!`);

            if (index > event.images.length) throw new Error(`Wrong index!`);

            return { userId: session.user.id, previousImages: event.images, eventId, index };
        })
        .onUploadComplete(
            async ({ file, metadata: { userId, previousImages, eventId, index } }) => {
                // This code runs on your server after upload
                const oldImages: [string | null, string | null, string | null] = [
                    previousImages.at(0) ?? null,
                    previousImages.at(1) ?? null,
                    previousImages.at(2) ?? null,
                ];
                const newImages = oldImages
                    .toSpliced(index, 1, file.url)
                    .filter(Boolean) as string[]; // TODO ts-reset

                await prisma.event.update({
                    where: { id: eventId, creatorId: userId },
                    data: { images: newImages },
                });

                await pusher.trigger(
                    PusherChannel.INVALIDATE,
                    InvalidateEvent.EventGetById,
                    eventId
                );

                const previousImage = oldImages.at(index);
                if (previousImage) {
                    const key = previousImage.split('/').at(-1);
                    if (key) {
                        await utapi.deleteFiles(key);
                    }
                }
            }
        ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
