import {render, screen} from '@testing-library/react';
import {EventForm} from '../../../../src/components/event/EventForm';
import {api} from '../../../../src/utils/api';
import {getDefaultCreateEvent} from '../../../../src/utils/defaultObjects';

describe('EventForm', () => {
  it('has disabled submit button initially', () => {
    // Arrange
    const Component = api.withTRPC(() => (
      <EventForm
        originalEvent={getDefaultCreateEvent()}
        loading={false}
        onSubmit={() => undefined}
      />
    ));
    render(<Component/>);

    // Act
    const submitButton = screen.getByText('button.submit').closest('button');

    // Assert
    expect(submitButton).toBeDisabled();
  });
  // TODO more tests
});
