import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../../next-i18next.config.mjs';
import UserTable from '../../components/user/UserTable';

export default function UsersPage() {
    return <UserTable />;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
