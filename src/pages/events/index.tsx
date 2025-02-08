import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../../next-i18next.config.mjs';
import EventTable from '../../components/event/EventTable';
import { EventTableDisplayPlace } from '../../utils/enums';

export default function EventsPage() {
    return <EventTable eventTableDisplayPlace={EventTableDisplayPlace.EVENTS_PAGE} />;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
