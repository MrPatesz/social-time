import { MutateCommentType } from '../models/Comment';
import { CreateEventType } from '../models/Event';
import { CreateGroupType } from '../models/Group';
import { CreateLocationType } from '../models/Location';
import dayjs from './dayjs';
import { ThemeColor } from './enums';

export const defaultCreateComment: MutateCommentType = {
    text: '',
};

export const defaultCreateGroup: CreateGroupType = {
    name: '',
    description: '',
    color1: ThemeColor.RED,
    color2: ThemeColor.YELLOW,
    isPrivate: false,
};

export const defaultCreateLocation: CreateLocationType = {
    address: '',
    latitude: 0,
    longitude: 0,
};

export const getDefaultCreateEvent = (initialInterval?: {
    start: Date;
    end: Date;
}): CreateEventType => ({
    name: '',
    start: initialInterval?.start ?? dayjs(new Date()).add(1, 'hours').toDate(),
    end: initialInterval?.end ?? dayjs(new Date()).add(2, 'hours').toDate(),
    description: '',
    limit: null,
    price: null,
    location: defaultCreateLocation,
    groupId: null,
});
