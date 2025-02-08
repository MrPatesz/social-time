export enum ThemeColor {
    RED = 'red',
    PINK = 'pink',
    GRAPE = 'grape',
    VIOLET = 'violet',
    INDIGO = 'indigo',
    BLUE = 'blue',
    CYAN = 'cyan',
    TEAL = 'teal',
    GREEN = 'green',
    LIME = 'lime',
    YELLOW = 'yellow',
    ORANGE = 'orange',
}

/* TODO fix: joinRequestRouter.getAllByGroupId: JoinRequestSchema.array().parse()
export const ThemeColor = {
  RED: 'red',
  PINK: 'pink',
  GRAPE: 'grape',
  VIOLET: 'violet',
  INDIGO: 'indigo',
  BLUE: 'blue',
  CYAN: 'cyan',
  TEAL: 'teal',
  GREEN: 'green',
  LIME: 'lime',
  YELLOW: 'yellow',
  ORANGE: 'orange',
} as const;

type ObjectValues<T> = T[keyof T];
export type ThemeColorType = ObjectValues<typeof ThemeColor>;
*/

export enum EventStatus {
    PLANNED = 'PLANNED',
    ARCHIVE = 'ARCHIVE',
}

export enum OrderBy {
    NAME = 'name',
    DATE = 'date',
    LOCATION = 'location',
    PRICE = 'price',
}

export enum FilterBy {
    FREE = 'free',
    LIMITED = 'limited',
}

export enum SortGroupByProperty {
    NAME = 'name',
    CREATED_AT = 'createdAt',
    // MEMBER_COUNT = "memberCount",
    // AVERAGE_RATING = "averageRating",
}

export enum EventTableDisplayPlace {
    CONTROL_PANEL = 'CONTROL_PANEL',
    EVENTS_PAGE = 'EVENTS_PAGE',
}

export enum GroupTableDisplayPlace {
    CONTROL_PANEL = 'CONTROL_PANEL',
    GROUPS_PAGE = 'GROUPS_PAGE',
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export enum SortEventByProperty {
    NAME = 'name',
    START = 'start',
    PRICE = 'price',
    LIMIT = 'limit',
}

export enum SortCommentByProperty {
    TEXT = 'text',
    POSTED_AT = 'postedAt',
    EVENT = 'event',
}

export enum PusherChannel {
    INVALIDATE = 'invalidate',
}

export enum InvalidateEvent {
    CommentGetAllByEventId = 'comment.getAllByEventId',
    EventGetById = 'event.getById',
    EventGetCalendar = 'event.getCalendar',
    EventGetFeed = 'event.getFeed',
    EventGetMap = 'event.getMap',
    EventGetPaginatedEvents = 'event.getPaginatedEvents',
    GroupGetById = 'group.getById',
    GroupGetPaginatedGroups = 'group.getPaginatedGroups',
    GroupChatGetMessages = 'groupChat.getMessages',
    JoinRequestGetAllByGroupId = 'joinRequest.getAllByGroupId',
    JoinRequestHasJoinRequest = 'joinRequest.hasJoinRequest',
    RatingGetAverageRatingForEvent = 'rating.getAverageRatingForEvent',
    RatingGetAverageRatingForUser = 'rating.getAverageRatingForUser',
    RatingGetAverageRatingForGroup = 'rating.getAverageRatingForGroup',
    UserGetById = 'user.getById',
    UserGetPaginatedUsers = 'user.getPaginatedUsers',
    /*
  UserProfile = 'user.profile', // use UserGetById instead
  // these should be invalidated locally
  CommentGetAllCreated = 'comment.getAllCreated',
  RatingGetCallerRating = 'rating.getCallerRating',
  */
}
