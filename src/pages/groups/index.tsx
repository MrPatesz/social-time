import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../../next-i18next.config.mjs';
import GroupTable from '../../components/group/GroupTable';
import { GroupTableDisplayPlace } from '../../utils/enums';

export default function GroupsPage() {
    return <GroupTable groupTableDisplayPlace={GroupTableDisplayPlace.GROUPS_PAGE} />;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
