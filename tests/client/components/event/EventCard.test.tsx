import { render, screen } from '@testing-library/react';
import { EventCard } from '../../../../src/components/event/EventCard';
import { BasicEventSchema, BasicEventType } from '../../../../src/models/Event';
import { api } from '../../../../src/utils/api';
import { event1, group1, location1, user1 } from '../../../mockData';

const renderEventCard = (overrideProps?: Partial<BasicEventType>) => {
    const Component = api.withTRPC(() => (
        <EventCard
            event={BasicEventSchema.parse({
                ...event1,
                location: location1,
                creator: user1,
                group: { ...group1, creator: user1 },
                ...overrideProps,
            })}
        />
    ));
    render(<Component />);
};

describe('EventCard', () => {
    it("displays event's name", () => {
        // Arrange
        renderEventCard();

        // Act
        const eventName = screen.getByText(event1.name);

        // Assert
        expect(eventName).toBeVisible();
    });
    it("displays creator's name", () => {
        // Arrange
        renderEventCard();

        // Act
        const userName = screen.getByText(user1.name);

        // Assert
        expect(userName).toBeVisible();
    });
    it("displays group's name", () => {
        // Arrange
        renderEventCard();

        // Act
        const groupName = screen.getByText(group1.name);

        // Assert
        expect(groupName).toBeVisible();
    });

    it('displays free badge when price is null', () => {
        // Arrange
        renderEventCard({ price: null });

        // Act
        const freeBadge = screen.getByText('common.free');

        // Assert
        expect(freeBadge).toBeVisible();
    });
    it('does not display free badge when price is not null', () => {
        // Arrange
        renderEventCard({ price: 5 });

        // Act
        const freeBadge = screen.queryByText('common.free');

        // Assert
        expect(freeBadge).toBeNull();
    });

    it('displays limit badge when limit is not null', () => {
        // Arrange
        renderEventCard({ limit: 5 });

        // Act
        const limitBadge = screen.getByText('filterEvents.limited');

        // Assert
        expect(limitBadge).toBeVisible();
    });
    it('does not display limit badge when limit is null', () => {
        // Arrange
        renderEventCard({ limit: null });

        // Act
        const limitBadge = screen.queryByText('filterEvents.limited');

        // Assert
        expect(limitBadge).toBeNull();
    });

    it('displays distance badge when distance is not undefined', () => {
        // Arrange
        const distance = 268;
        renderEventCard({ distance });

        // Act
        const distanceBadge = screen.getByText(`${distance} km`);

        // Assert
        expect(distanceBadge).toBeVisible();
    });
    it('does not display distance badge when distance is undefined', () => {
        // Arrange
        renderEventCard({ distance: undefined });

        // Act
        const distanceBadge = screen.queryByText(/\d+ km/);

        // Assert
        expect(distanceBadge).toBeNull();
    });
});
