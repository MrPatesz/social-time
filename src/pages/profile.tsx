import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../next-i18next.config.mjs';
import { QueryComponent } from '../components/QueryComponent';
import { ProfileForm } from '../components/user/ProfileForm';
import { api } from '../utils/api';
import { InvalidateEvent } from '../utils/enums';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
    const { data: session } = useSession();
    const { t } = useTranslation('common');

    const profileQuery = api.user.profile.useQuery();

    return (
        <QueryComponent
            resourceName={t('resource.profile')}
            query={profileQuery}
            eventInfo={{ event: InvalidateEvent.UserGetById, id: session?.user.id }}
        >
            {profileQuery.data && <ProfileForm profileQuery={profileQuery} />}
        </QueryComponent>
    );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
