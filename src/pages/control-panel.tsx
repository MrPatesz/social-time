import { Tabs } from '@mantine/core';
import { IconMessageCircle, IconShare, IconTicket } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../next-i18next.config.mjs';
import CommentTable from '../components/comment/CommentTable';
import EventTable from '../components/event/EventTable';
import GroupTable from '../components/group/GroupTable';
import { EventTableDisplayPlace, GroupTableDisplayPlace } from '../utils/enums';

export default function ControlPanelPage() {
    const { t } = useTranslation('common');

    // TODO EventTable: created / participated events (SegmentedControl) instead of archive button
    // TODO GroupTable: created / joined groups (SegmentedControl)
    // TODO MessageTable
    // TODO RatingTable

    return (
        <Tabs
            defaultValue="events"
            sx={{ height: '100%' }}
        >
            <Tabs.List grow>
                <Tabs.Tab
                    value="events"
                    icon={<IconTicket size={20} />}
                >
                    {t('resource.events')}
                </Tabs.Tab>
                <Tabs.Tab
                    value="groups"
                    icon={<IconShare size={20} />}
                >
                    {t('resource.groups')}
                </Tabs.Tab>
                <Tabs.Tab
                    value="comments"
                    icon={<IconMessageCircle size={20} />}
                >
                    {t('resource.comments')}
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel
                value="events"
                pt="md"
                sx={{ height: 'calc(100% - 42px)' }}
            >
                <EventTable eventTableDisplayPlace={EventTableDisplayPlace.CONTROL_PANEL} />
            </Tabs.Panel>

            <Tabs.Panel
                value="groups"
                pt="md"
                sx={{ height: 'calc(100% - 42px)' }}
            >
                <GroupTable groupTableDisplayPlace={GroupTableDisplayPlace.CONTROL_PANEL} />
            </Tabs.Panel>

            <Tabs.Panel
                value="comments"
                pt="md"
                sx={{ height: 'calc(100% - 42px)' }}
            >
                <CommentTable />
            </Tabs.Panel>
        </Tabs>
    );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
    props: { ...(await serverSideTranslations(locale, ['common'], i18nConfig)) },
});
