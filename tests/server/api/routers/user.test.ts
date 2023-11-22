import {DetailedUserSchema, ProfileSchema, UpdateProfileSchema} from '../../../../src/models/User';
import {ThemeColor} from '../../../../src/utils/enums';
import {user1, user2, users} from '../../mocks/data';
import {getTestCaller, testPrismaClient} from '../../mocks/utils';

describe('userRouter', () => {
  let caller: ReturnType<typeof getTestCaller>;

  beforeEach(async () => {
    caller = getTestCaller(user1);

    await testPrismaClient.$connect();
    await testPrismaClient.user.createMany({data: users});
  });

  afterEach(async () => {
    await testPrismaClient.user.deleteMany();
    await testPrismaClient.$disconnect();
  });

  describe('profile', () => {
    it('returns caller\'s user record', async () => {
      // Arrange
      const expected = ProfileSchema.parse({...user1, location: null});

      // Act
      const result = await caller.user.profile();

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('getById', () => {
    it('returns a user record with given id', async () => {
      // Arrange
      const expected = DetailedUserSchema.parse({
        ...user2,
        createdEvents: [],
        participatedEvents: [],
      });

      // Act
      const result = await caller.user.getById(user2.id);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('updates the given user record\'s data', async () => {
      // Arrange
      const expected = UpdateProfileSchema.parse({
        ...user1,
        name: 'user1_update_test',
        introduction: 'user1_introduction',
        themeColor: ThemeColor.ORANGE,
        location: null,
      });

      // Act
      const result = await caller.user.update(expected);

      // Assert
      expect(result).toEqual(expected);
    });
    it('cannot update other user\'s profile', async () => {
      // Arrange
      const expected = UpdateProfileSchema.parse({
        ...user2,
        name: 'user2_update_test',
        location: null,
      });

      // Act
      const updateCall = async () => await caller.user.update(expected);

      // Assert
      await expect(updateCall()).rejects.toThrow();
    });
  });
});
