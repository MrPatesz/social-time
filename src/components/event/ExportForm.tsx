import { Button, Group, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { createEvents, DateArray } from 'ics';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { EventWithLocationType } from '../../models/Event';
import { api } from '../../utils/api';
import dayjs from '../../utils/dayjs';
import { getFirstDayOfWeek } from '../../utils/utilFunctions';

export const ExportForm: FunctionComponent = () => {
    const { t } = useTranslation('common');
    const { locale } = useMyRouter();

    const { values, onSubmit, getInputProps, isValid } = useForm<{
        interval: [Date | null, Date | null];
    }>({
        initialValues: {
            interval: [
                dayjs().startOf('date').toDate(),
                dayjs().startOf('date').add(1, 'week').toDate(),
            ],
        },
        validate: {
            interval: (value) =>
                value.length !== 2 || value.includes(null) ?
                    t('calendarPage.interval.error')
                :   null,
        },
    });
    const eventsQuery = api.event.getParticipatedInInterval.useQuery(
        {
            start: values.interval.at(0) as Date,
            end: values.interval.at(1) as Date,
        },
        {
            enabled: values.interval.length === 2 && !values.interval.includes(null),
        }
    );

    const iCalDownload = async (events: EventWithLocationType[] | undefined) => {
        if (!events) return;

        const iCalEvents = events.map((event) => {
            const startDayJs = dayjs(event.start);
            const endDayJs = dayjs(event.end);
            const start: DateArray = [
                startDayJs.year(),
                startDayJs.month() + 1,
                startDayJs.date(),
                startDayJs.hour(),
                startDayJs.minute(),
            ];
            const end: DateArray = [
                endDayJs.year(),
                endDayJs.month() + 1,
                endDayJs.date(),
                endDayJs.hour(),
                endDayJs.minute(),
            ];
            return {
                start,
                end,
                title: event.name,
                location: event.location.address,
                // TODO more properties
            };
        });

        const filename = 'SocialTimeEvents.ics';
        const file: File = await new Promise((resolve, reject) => {
            createEvents(iCalEvents, (error, value) => {
                if (error) {
                    reject(error);
                }

                resolve(new File([value], filename, { type: 'plain/text' }));
            });
        });
        const url = URL.createObjectURL(file);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(url);

        closeAllModals();
    };

    return (
        <form onSubmit={onSubmit(() => void iCalDownload(eventsQuery.data))}>
            <Stack>
                <DatePickerInput
                    type="range"
                    label={t('calendarPage.interval.label')}
                    clearable={false}
                    firstDayOfWeek={getFirstDayOfWeek(locale)}
                    {...getInputProps('interval')}
                />
                <Group position="apart">
                    <Text color="dimmed">
                        {eventsQuery.data &&
                            t('calendarPage.eventCount', { count: eventsQuery.data.length })}
                    </Text>
                    <Button
                        type="submit"
                        disabled={!isValid() || eventsQuery.data?.length === 0}
                        loading={eventsQuery.isFetching}
                    >
                        {t('calendarPage.export')}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
