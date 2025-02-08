import {
    ActionIcon,
    Button,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { UseTRPCQueryResult } from '@trpc/react-query/dist/shared';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { useMyRouter } from '../../hooks/useMyRouter';
import { ProfileType, UpdateProfileType } from '../../models/User';
import { ImageSchema } from '../../models/Utils';
import { api } from '../../utils/api';
import { ThemeColor } from '../../utils/enums';
import { getFormLocationOnChange, getFormLocationValue } from '../../utils/mantineFormUtils';
import { UploadButton } from '../../utils/uploadthing';
import { BorderComponent } from '../BorderComponent';
import { LocationPicker } from '../inputs/LocationPicker';
import { OverlayLoader } from '../OverlayLoader';
import { RichTextField } from '../rich-text/RichTextField';
import { ThemeColorPicker } from '../inputs/ThemeColorPicker';
import UserImage from './UserImage';
import { IconTrash } from '@tabler/icons-react';
import { HoverOverlay } from '../HoverOverlay';

const imageSize = 108;

export const ProfileForm: FunctionComponent<{
    profileQuery: UseTRPCQueryResult<ProfileType, unknown>;
}> = ({ profileQuery }) => {
    const theme = useMantineTheme();
    const { data: session, update } = useSession();
    const { t } = useTranslation('common');
    const { localePrefix } = useMyRouter();

    const deleteProfile = api.user.deleteProfile.useMutation({
        onSuccess: () => void signOut({ callbackUrl: `${localePrefix}/welcome` }),
    });
    const removeImage = api.user.removeImage.useMutation({
        onSuccess: () => {
            void profileQuery.refetch();
            showNotification({
                color: 'green',
                title: t('notification.profile.update.title'),
                message: t('notification.profile.update.message'),
            });
        },
    });
    const updateProfile = api.user.update.useMutation({
        onSuccess: (profile) => {
            if (session) {
                void update({
                    ...session,
                    user: {
                        id: profile.id,
                        name: profile.name,
                        themeColor: profile.themeColor,
                    },
                } satisfies Session);
            }

            form.resetDirty(); // TODO this sets dirty to false, but doesn't set initialValues -> Reset button resets to previous state
            showNotification({
                color: 'green',
                title: t('notification.profile.update.title'),
                message: t('notification.profile.update.message'),
            });
        },
    });

    const form = useForm<UpdateProfileType>({
        initialValues: profileQuery.data,
        validateInputOnChange: true,
        validate: {
            name: (value) => (value.trim() ? null : t('profileForm.displayName.error')),
            image: (value) =>
                !value || ImageSchema.safeParse(value).success ?
                    null
                :   t('profileForm.image.error'),
        },
    });

    const onDeleteClick = () =>
        openConfirmModal({
            title: t('profileForm.delete.title'),
            children: (
                <Stack spacing="xs">
                    <Text>{t('profileForm.delete.message')}</Text>
                    <Text
                        weight="bold"
                        color="red"
                    >
                        {t('profileForm.delete.warning')}
                    </Text>
                </Stack>
            ),
            labels: { confirm: t('button.confirm'), cancel: t('button.cancel') },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteProfile.mutate(),
        });

    return (
        <Stack>
            <OverlayLoader loading={updateProfile.isLoading || removeImage.isLoading}>
                <Stack>
                    <BorderComponent>
                        <form onSubmit={form.onSubmit((data) => updateProfile.mutate(data))}>
                            <Stack>
                                <TextInput
                                    withAsterisk
                                    data-autofocus
                                    label={t('profileForm.displayName.label')}
                                    placeholder={t('profileForm.displayName.placeholder')}
                                    {...form.getInputProps('name')}
                                />
                                <RichTextField
                                    label={t('profileForm.introduction')}
                                    placeholder={t('profileForm.introduction')}
                                    formInputProps={form.getInputProps('introduction')}
                                />
                                <ThemeColorPicker
                                    label={t('themeColorPicker.label')}
                                    value={form.getInputProps('themeColor').value as ThemeColor}
                                    onChange={
                                        form.getInputProps('themeColor').onChange as (
                                            newValue: ThemeColor
                                        ) => void
                                    }
                                />
                                <LocationPicker
                                    label={t('locationPicker.residence')}
                                    placeholder={t('profileForm.location.placeholder')}
                                    description={t('profileForm.location.description')}
                                    location={getFormLocationValue(form)}
                                    setLocation={getFormLocationOnChange(form)}
                                />
                                <Group position="apart">
                                    <Button
                                        onClick={form.reset}
                                        color="gray"
                                        disabled={!form.isDirty()}
                                    >
                                        {t('button.reset')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!form.isValid() || !form.isDirty()}
                                    >
                                        {t('button.submit')}
                                    </Button>
                                </Group>
                            </Stack>
                        </form>
                    </BorderComponent>
                    {profileQuery.data && (
                        <BorderComponent>
                            <Group
                                position="apart"
                                align="end"
                            >
                                <Stack spacing="xl">
                                    <Text weight="bold">{t('profileForm.image.label')}</Text>
                                    <UploadButton
                                        className="upload-thing"
                                        endpoint="updateProfileImage"
                                        content={{
                                            button: ({ isUploading }) =>
                                                isUploading ?
                                                    <Loader color="white" />
                                                :   t('profileForm.image.button'),
                                            allowedContent: t('profileForm.image.allowedContent', {
                                                size: 1,
                                            }),
                                        }}
                                        appearance={{
                                            button: ({ isUploading }) => ({
                                                pointerEvents: isUploading ? 'none' : undefined,
                                                backgroundColor: theme.fn.themeColor(
                                                    theme.primaryColor,
                                                    isUploading ? 6 : 8
                                                ),
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                height: 36,
                                                width: 130,
                                            }),
                                        }}
                                        input={{ previousImage: profileQuery.data.image }}
                                        onClientUploadComplete={() =>
                                            showNotification({
                                                color: 'green',
                                                title: t(
                                                    'notification.profile.image.success.title'
                                                ),
                                                message: t(
                                                    'notification.profile.image.success.message'
                                                ),
                                            })
                                        }
                                        onUploadError={() =>
                                            showNotification({
                                                color: 'red',
                                                title: t('notification.profile.image.error.title'),
                                                message: t(
                                                    'notification.profile.image.error.message'
                                                ),
                                            })
                                        }
                                    />
                                </Stack>
                                <HoverOverlay
                                    hidden={!profileQuery.data.image}
                                    hoverChildren={
                                        <ActionIcon
                                            title={t('profileForm.image.remove.title')}
                                            size={imageSize}
                                            variant="transparent"
                                            onClick={() =>
                                                openConfirmModal({
                                                    title: t('profileForm.image.remove.title'),
                                                    children: t('profileForm.image.remove.message'),
                                                    labels: {
                                                        confirm: t('button.confirm'),
                                                        cancel: t('button.cancel'),
                                                    },
                                                    onConfirm: () => removeImage.mutate(),
                                                })
                                            }
                                        >
                                            <IconTrash
                                                size={32}
                                                color="white"
                                            />
                                        </ActionIcon>
                                    }
                                >
                                    <UserImage
                                        user={profileQuery.data}
                                        size={imageSize}
                                    />
                                </HoverOverlay>
                            </Group>
                        </BorderComponent>
                    )}
                </Stack>
            </OverlayLoader>
            <BorderComponent borderColor={ThemeColor.RED}>
                <Stack spacing="xs">
                    <Text
                        weight="bold"
                        color="red"
                    >
                        {t('profileForm.delete.dangerZone')}
                    </Text>
                    <Group
                        noWrap
                        position="apart"
                        align="start"
                    >
                        <Stack spacing={0}>
                            <Text>{t('profileForm.delete.title')}</Text>
                            <Text
                                size="xs"
                                color="dimmed"
                            >
                                {t('profileForm.delete.warning')}
                            </Text>
                        </Stack>
                        <Button
                            color="red"
                            variant="outline"
                            onClick={onDeleteClick}
                        >
                            {t('profileForm.delete.title')}
                        </Button>
                    </Group>
                </Stack>
            </BorderComponent>
        </Stack>
    );
};
