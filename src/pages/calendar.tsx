import { useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../next-i18next.config.mjs';
import { api } from '../utils/api';
import { getFirstDayOfWeek } from '../utils/utilFunctions';
import { QueryComponent } from '../components/QueryComponent';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { openModal } from '@mantine/modals';
import { CreateEventForm } from '../components/event/CreateEventForm';
import { BasicEventType } from '../models/Event';
import { useMediaQuery } from '@mantine/hooks';
import { InvalidateEvent } from '../utils/enums';
import { ExportForm } from '../components/event/ExportForm';
import { useMyRouter } from '../hooks/useMyRouter';

export default function CalendarPage() {
    const theme = useMantineTheme();
    const { locale, pushRoute } = useMyRouter();
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const xl = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);

    const eventsQuery = api.event.getCalendar.useQuery();
    const updateEvent = api.event.update.useMutation({
        onSuccess: () =>
            showNotification({
                color: 'green',
                title: t('notification.event.update.title'),
                message: t('notification.event.update.message'),
            }),
        onError: () =>
            showNotification({
                color: 'red',
                title: t('notification.event.failedToUpdate.title'),
                message: t('notification.event.failedToUpdate.message'),
            }),
    });

    return (
        <QueryComponent
            resourceName={t('resource.calendar')}
            query={eventsQuery}
            eventInfo={{ event: InvalidateEvent.EventGetCalendar, id: session?.user.id }}
            loading={updateEvent.isLoading}
        >
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                customButtons={{
                    exportButton: {
                        text: t('calendarPage.export'),
                        click: () =>
                            openModal({
                                title: t('calendarPage.iCalExport'),
                                children: <ExportForm />,
                                styles: {
                                    content: { overflow: 'visible !important' },
                                    header: { borderRadius: '0.5rem' },
                                },
                            }),
                    },
                }}
                headerToolbar={{
                    left: 'prev,today,next',
                    center: 'title',
                    right: 'timeGridWeek,dayGridMonth exportButton',
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
                buttonText={{
                    today: t('calendarPage.today'),
                    month: t('calendarPage.month'),
                    week: t('calendarPage.week'),
                }}
                views={{
                    timeGridWeek: {
                        dayHeaderFormat: {
                            weekday: xl ? 'long' : 'narrow',
                            day: '2-digit',
                            omitCommas: true,
                        },
                    },
                    dayGridMonth: {
                        dayHeaderFormat: md ? { weekday: 'long' } : undefined,
                    },
                }}
                editable
                selectable
                selectMirror
                height="100%"
                allDaySlot={false}
                locale={locale}
                firstDay={getFirstDayOfWeek(locale)}
                eventColor={theme.fn.themeColor(theme.primaryColor)}
                eventClick={({ event }) =>
                    void pushRoute(`/events/${event.id}`, undefined, { locale })
                }
                select={({ start, end }) =>
                    openModal({
                        title: t('modal.event.create'),
                        children: <CreateEventForm initialInterval={{ start, end }} />,
                        fullScreen: !xs,
                        zIndex: 402,
                    })
                }
                eventChange={({ event: { start, end, extendedProps }, revert }) => {
                    if (!start || !end) {
                        revert();
                        return;
                    }
                    const eventEntity = extendedProps as BasicEventType;
                    updateEvent.mutate({
                        id: eventEntity.id,
                        event: { ...eventEntity, start, end },
                    });
                }}
                events={eventsQuery.data?.map((e) => ({
                    id: e.id.toString(),
                    title: e.name,
                    start: e.start,
                    end: e.end,
                    color: theme.fn.themeColor(e.creator.themeColor),
                    editable: session?.user.id === e.creatorId,
                    extendedProps: e,
                }))}
                // month view properties
                eventDisplay="block"
                displayEventEnd={true}
            />
        </QueryComponent>
    );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
