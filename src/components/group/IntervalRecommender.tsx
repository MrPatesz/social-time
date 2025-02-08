import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ActionIcon, Stack, useMantineTheme } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { IconWand } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useState } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { api } from '../../utils/api';
import dayjs from '../../utils/dayjs';
import { useLongDateFormatter } from '../../utils/formatters';
import { getFirstDayOfWeek } from '../../utils/utilFunctions';
import { CreateEventForm } from '../event/CreateEventForm';
import { QueryComponent } from '../QueryComponent';

const IntervalRecommenderContent: FunctionComponent<{
    groupId: number;
}> = ({ groupId }) => {
    const longDateFormatter = useLongDateFormatter();
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const xl = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);
    const { locale } = useMyRouter();
    const { t } = useTranslation('common');

    const [interval, setInterval] = useState<[Date | null, Date | null]>([
        dayjs().startOf('date').toDate(),
        dayjs().startOf('date').add(1, 'week').toDate(),
    ]);

    const freeIntervalsQuery = api.group.getFreeIntervals.useQuery(
        {
            groupId,
            from: interval.at(0) as Date,
            until: interval.at(1) as Date,
        },
        {
            enabled: Boolean(interval.at(0) && interval.at(1)),
        }
    );
    // TODO invalidation with Pusher?

    return (
        <Stack h="100%">
            <DatePickerInput
                type="range"
                label={t('intervalRecommender.searchInterval')}
                clearable={false}
                firstDayOfWeek={getFirstDayOfWeek(locale)}
                minDate={new Date()}
                maxDate={
                    interval.at(1) ? undefined : dayjs(interval.at(0)).add(2, 'weeks').toDate()
                }
                value={interval}
                onChange={setInterval}
            />
            <QueryComponent
                query={freeIntervalsQuery}
                resourceName={t('resource.freeIntervals')}
            >
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    // TODO customButtons: calendar pagination
                    headerToolbar={{
                        left: 'prev,today,next',
                        center: 'title',
                        right: '',
                    }}
                    titleFormat={
                        md ?
                            {
                                year: 'numeric',
                                month: 'long',
                            }
                        : xs ?
                            {
                                year: '2-digit',
                                month: 'short',
                            }
                        :   {
                                month: 'short',
                            }

                    }
                    dayHeaderFormat={{
                        weekday: xl ? 'long' : 'narrow',
                        day: '2-digit',
                        omitCommas: true,
                    }}
                    buttonText={{ today: t('calendarPage.today') }}
                    height="100%"
                    allDaySlot={false}
                    locale={locale}
                    firstDay={getFirstDayOfWeek(locale)}
                    eventColor={theme.fn.themeColor(theme.primaryColor)}
                    eventClick={({ event: { start, end } }) =>
                        openModal({
                            title: t('modal.event.create'),
                            children: start && end && (
                                <CreateEventForm
                                    initialInterval={{ start, end }}
                                    initialGroupId={groupId}
                                />
                            ),
                            fullScreen: !xs,
                            zIndex: 402,
                        })
                    }
                    events={freeIntervalsQuery.data?.map((event) => {
                        const range = longDateFormatter.formatRange(event.start, event.end);
                        return {
                            id: range,
                            title: range,
                            start: event.start,
                            end: event.end,
                            extendedProps: event,
                        };
                    })}
                />
            </QueryComponent>
        </Stack>
    );
};

export const IntervalRecommender: FunctionComponent<{
    groupId: number;
}> = ({ groupId }) => {
    const theme = useMantineTheme();
    const { t } = useTranslation('common');

    return (
        <ActionIcon
            title={t('intervalRecommender.label')}
            size="lg"
            variant="filled"
            color={theme.fn.themeColor(theme.primaryColor)}
            onClick={() =>
                openModal({
                    title: t('intervalRecommender.label'),
                    children: <IntervalRecommenderContent groupId={groupId} />,
                    fullScreen: true,
                })
            }
        >
            <IconWand />
        </ActionIcon>
    );
};
