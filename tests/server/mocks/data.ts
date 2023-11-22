import {Comment, Event, Location, User} from '@prisma/client';
import {ThemeColor} from '../../../src/utils/enums';

export const user1: User = {
  id: '101',
  name: 'user1',
  email: 'user1@email.com',
  emailVerified: null,
  image: '',
  locationId: null,
  themeColor: ThemeColor.VIOLET,
  introduction: '',
};
export const user2: User = {
  ...user1,
  id: '102',
  name: 'user2',
  email: 'user2@email.com',
};
export const users: User[] = [user2, user1];

export const location1: Location = {
  id: 401,
  address: 'location1',
  longitude: 50,
  latitude: 42,
};
export const location2: Location = {
  ...location1,
  id: 402,
  address: 'location2',
};
export const locations: Location[] = [location1, location2];

export const event1: Event = {
  id: 201,
  name: 'event1',
  start: new Date(),
  end: new Date(),
  description: '',
  limit: null,
  price: null,
  groupId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  locationId: location1.id,
  creatorId: user1.id,
  images: [],
};
export const event2: Event = {
  ...event1,
  id: 202,
  name: 'event2',
  locationId: location2.id,
  creatorId: user2.id,
  createdAt: new Date('2011-10-10T14:48:00'),
  updatedAt: new Date('2011-10-10T14:48:00'),
};
export const events: Event[] = [event1, event2];

export const comment1: Comment = {
  id: 301,
  text: 'comment1_message',
  postedAt: new Date(),
  eventId: event1.id,
  userId: user1.id,
};
export const comment2: Comment = {
  id: 302,
  text: 'comment2_message',
  postedAt: new Date(),
  eventId: event1.id,
  userId: user2.id,
};
export const comment3: Comment = {
  id: 303,
  text: 'comment3_message',
  postedAt: new Date(),
  eventId: event2.id,
  userId: user2.id,
};
export const comments: Comment[] = [comment1, comment2, comment3];
