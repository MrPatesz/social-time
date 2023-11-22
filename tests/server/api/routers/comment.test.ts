import {
  BasicCommentSchema,
  BasicCommentType,
  DetailedCommentSchema,
  MutateCommentType
} from '../../../../src/models/Comment';
import {SortCommentByProperty, SortDirection} from '../../../../src/utils/enums';
import {
  comment1,
  comment2,
  comment3,
  comments,
  event1,
  event2,
  events,
  location1,
  location2,
  locations,
  user1,
  user2,
  users
} from '../../mocks/data';
import {getTestCaller, testPrismaClient} from '../../mocks/utils';

describe('commentRouter', () => {
  let caller: ReturnType<typeof getTestCaller>;

  beforeEach(async () => {
    caller = getTestCaller(user2);

    await testPrismaClient.$connect();
    await testPrismaClient.user.createMany({data: users});
    await testPrismaClient.location.createMany({data: locations});
    await testPrismaClient.event.createMany({data: events});
    await testPrismaClient.comment.createMany({data: comments});
  });

  afterEach(async () => {
    await testPrismaClient.comment.deleteMany();
    await testPrismaClient.event.deleteMany();
    await testPrismaClient.location.deleteMany();
    await testPrismaClient.user.deleteMany();
    await testPrismaClient.$disconnect();
  });

  describe('getAllByEventId', () => {
    it('returns all comments for given event', async () => {
      // Arrange
      const expected = BasicCommentSchema.array().parse(
        [{...comment1, user: user1}, {...comment2, user: user2}]
      );

      // Act
      const result = await caller.comment.getAllByEventId(event1.id);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('getAllCreated', () => {
    it('returns all comments that were created by caller', async () => {
      // Arrange
      const expected = {
        comments: DetailedCommentSchema.array().parse([
          {...comment2, user: user2, event: {...event1, location: location1, creator: user1, group: null}},
          {...comment3, user: user2, event: {...event2, location: location2, creator: user2, group: null}},
        ]),
        size: 2,
      };

      // Act
      const result = await caller.comment.getAllCreated({
        page: 1,
        pageSize: 5,
        searchQuery: '',
        sortBy: {
          direction: SortDirection.ASC,
          property: SortCommentByProperty.TEXT,
        }
      });

      // Assert
      expect(result).toEqual(expected);
    });

    // TODO it("returns all comments that were created by caller that have search term in the message", () => {})
  });

  describe('create', () => {
    it('creates new comment for given event', async () => {
      // Arrange
      const newComment: MutateCommentType = {
        text: 'comment4_message',
      };
      const expectedNewComment: BasicCommentType = BasicCommentSchema.parse({
        text: newComment.text,
        id: 304,
        postedAt: new Date(),
        eventId: event2.id,
        userId: user2.id,
        user: user2,
      });


      // Act
      await caller.comment.create({
        createComment: newComment,
        eventId: event2.id,
      });
      const comments = await caller.comment.getAllByEventId(event2.id);

      const expectedComments = BasicCommentSchema.array().parse(
        [{...expectedNewComment, user: user2}, {...comment3, user: user2}]
      );

      // Assert
      const mapComments = (cs: BasicCommentType[]) => cs.map(c => ({...c, id: undefined, postedAt: undefined}));
      expect(mapComments(comments)).toEqual(mapComments(expectedComments));
    });
  });

  describe('update', () => {
    it('cannot update other user\'s comment', async () => {
      // Arrange
      const newComment = {
        comment: {text: 'updated_comment1_message'},
        commentId: comment1.id,
        eventId: event1.id
      };

      // Act
      const updateCall = async () => await caller.comment.update(newComment);

      // Assert
      await expect(updateCall()).rejects.toThrow();
    });
    // TODO it('updates the given comment record\'s data', async () => {});
  });

  describe('delete', () => {
    it('deletes the given comment', async () => {
      // Arrange
      const expectedComments = BasicCommentSchema.array().parse(
        [{...comment1, user: user1}]
      );

      // Act
      await caller.comment.delete(comment2.id);
      const comments = await caller.comment.getAllByEventId(event1.id);

      // Assert
      expect(comments).toEqual(expectedComments);
    });
    // TODO it('cannot delete other user\'s comment', async () => {});
  });
});
