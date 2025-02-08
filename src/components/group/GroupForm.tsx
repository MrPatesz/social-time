import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { BasicGroupType, CreateGroupType } from '../../models/Group';
import { RichTextField } from '../rich-text/RichTextField';
import { OverlayLoader } from '../OverlayLoader';
import { ThemeColorPicker } from '../inputs/ThemeColorPicker';

export const GroupForm: FunctionComponent<{
    originalGroup: CreateGroupType | BasicGroupType;
    onSubmit: (event: CreateGroupType | BasicGroupType) => void;
    loading: boolean;
}> = ({ originalGroup, onSubmit, loading }) => {
    const form = useForm<CreateGroupType>({
        initialValues: originalGroup,
        validateInputOnChange: true,
        validate: {
            name: (value) => (value.trim() ? null : t('groupForm.name.error')),
            color1: (value, group) => (value === group.color2 ? t('groupForm.colors.error') : null),
            color2: (value, group) => (value === group.color1 ? t('groupForm.colors.error') : null),
        },
    });
    const { t } = useTranslation('common');

    return (
        <OverlayLoader loading={loading}>
            <form onSubmit={form.onSubmit((data) => onSubmit(data))}>
                <Stack>
                    <TextInput
                        withAsterisk
                        data-autofocus
                        label={t('common.name')}
                        placeholder={t('groupForm.name.placeholder')}
                        {...form.getInputProps('name')}
                    />
                    <Checkbox
                        label={t('groupForm.isPrivate.label')}
                        description={t('groupForm.isPrivate.description')}
                        {...form.getInputProps('isPrivate', { type: 'checkbox' })}
                    />
                    <Stack spacing={8}>
                        <ThemeColorPicker
                            label={t('groupTable.colors')}
                            {...form.getInputProps('color1')}
                        />
                        <ThemeColorPicker {...form.getInputProps('color2')} />
                    </Stack>
                    <RichTextField
                        label={t('groupForm.description.label')}
                        placeholder={t('groupForm.description.placeholder')}
                        formInputProps={form.getInputProps('description')}
                    />
                    <Group position="right">
                        <Button
                            variant="default"
                            onClick={() => form.reset()}
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
        </OverlayLoader>
    );
};
