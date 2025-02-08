import {
    ActionIcon,
    Avatar,
    Badge,
    Card,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { closeAllModals, openModal } from '@mantine/modals';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { BasicUserType } from '../../models/User';
import { useSignedNumberFormatter } from '../../utils/formatters';
import { getInitials } from '../../utils/utilFunctions';
import UserImage from './UserImage';

export const UsersComponent: FunctionComponent<{
    users: BasicUserType[];
    hideJoin: boolean;
    onJoin: (join: boolean) => void;
    eventLimit?: number | null;
    overrideJoined?: boolean;
    loading?: boolean;
}> = ({ users, hideJoin, onJoin, eventLimit, overrideJoined, loading }) => {
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const isMobile = useMediaQuery('(max-width: 375px)');
    const { locale } = useMyRouter();
    const { data: session } = useSession();
    const signedNumberFormatter = useSignedNumberFormatter();
    const { t } = useTranslation('common');

    const displayLimit = 5;
    const userColor = theme.fn.themeColor(theme.primaryColor);
    const isJoined = overrideJoined ?? Boolean(users.find((u) => u.id === session?.user.id));
    const disableJoin = Boolean(!isJoined && eventLimit && users.length >= eventLimit);

    // TODO move more logic into MembersComponent and ParticipantsComponent

    return (
        <SimpleGrid
            spacing="xs"
            cols={isMobile && eventLimit ? 2 : 1}
            sx={{ alignItems: 'center' }}
        >
            <Avatar.Group
                sx={{ cursor: 'pointer' }}
                onClick={() =>
                    openModal({
                        title: t(
                            eventLimit === undefined ? 'modal.users.members' : (
                                'modal.users.participants'
                            )
                        ),
                        children: (
                            <Stack spacing="xs">
                                {users.map((member) => (
                                    <Link
                                        key={member.id}
                                        href={`/users/${member.id}`}
                                        locale={locale}
                                        passHref
                                    >
                                        <Card
                                            withBorder
                                            padding={6}
                                            onClick={() => closeAllModals()}
                                        >
                                            <Group>
                                                <UserImage
                                                    user={member}
                                                    size={40}
                                                />
                                                <Text>{member.name}</Text>
                                            </Group>
                                        </Card>
                                    </Link>
                                ))}
                            </Stack>
                        ),
                        fullScreen: !xs && users.length >= displayLimit * 1.5,
                    })
                }
            >
                {users.slice(0, displayLimit).map((user) => (
                    <Tooltip
                        key={user.id}
                        label={user.name}
                        color={user.themeColor}
                        position="bottom"
                    >
                        <Avatar
                            variant="filled"
                            radius="xl"
                            size="lg"
                            src={user.image}
                            color={user.themeColor}
                        >
                            <Text
                                weight="normal"
                                size={25}
                            >
                                {getInitials(user.name)}
                            </Text>
                        </Avatar>
                    </Tooltip>
                ))}
                {users.length > displayLimit && (
                    <Avatar
                        variant="filled"
                        radius="xl"
                        size="lg"
                    >
                        {signedNumberFormatter.format(users.length - displayLimit)}
                    </Avatar>
                )}
                {!hideJoin && (
                    <Avatar
                        variant="filled"
                        radius="xl"
                        color={userColor}
                        title={disableJoin ? t('usersComponent.full') : undefined}
                    >
                        <ActionIcon
                            title={t(
                                eventLimit === undefined ?
                                    isJoined ? 'groupDetails.leave'
                                    :   'groupDetails.join'
                                : isJoined ? 'eventDetails.removeParticipation'
                                : 'eventDetails.participate'
                            )}
                            radius="xl"
                            variant="filled"
                            color={userColor}
                            onClick={(event) => {
                                event.stopPropagation();
                                onJoin(!isJoined);
                            }}
                            loading={loading}
                            disabled={disableJoin}
                        >
                            {isJoined ?
                                <IconMinus />
                            :   <IconPlus />}
                        </ActionIcon>
                    </Avatar>
                )}
            </Avatar.Group>
            {eventLimit && (
                <Badge
                    title={t('myEvents.limit')}
                    color="red"
                    size="lg"
                >
                    {users.length}/{eventLimit}
                </Badge>
            )}
        </SimpleGrid>
    );
};
