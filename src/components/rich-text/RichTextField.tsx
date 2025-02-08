import { ActionIcon, Group, Modal, TextInput, useMantineTheme } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconPencilPlus, IconX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FunctionComponent, useState } from 'react';
import RichTextEditor from './RichTextEditor';

export const RichTextField: FunctionComponent<{
    label?: string;
    placeholder?: string;
    maxLength?: number;
    formInputProps: ReturnType<UseFormReturnType<unknown>['getInputProps']>;
}> = ({ label, placeholder, formInputProps, maxLength = 1024 }) => {
    const theme = useMantineTheme();
    const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
    const { t } = useTranslation('common');

    const [opened, setOpened] = useState(false);

    const value = formInputProps.value as string | undefined;
    const onChange = formInputProps.onChange as (newValue: string) => void;

    return (
        <>
            <TextInput
                label={label}
                placeholder={placeholder}
                sx={{ flexGrow: 1 }}
                {...formInputProps}
                readOnly={value?.includes('</')}
                maxLength={maxLength}
                rightSectionWidth={74}
                rightSection={
                    <Group spacing={4}>
                        <ActionIcon
                            title={t('button.reset')}
                            disabled={!value}
                            variant="transparent"
                            onClick={() => onChange('')}
                        >
                            <IconX />
                        </ActionIcon>
                        <ActionIcon
                            title={t('button.richText')}
                            variant="transparent"
                            onClick={() => setOpened(true)}
                        >
                            <IconPencilPlus />
                        </ActionIcon>
                    </Group>
                }
            />
            <Modal
                size="xl"
                centered={true}
                zIndex={401}
                fullScreen={!xs}
                opened={opened}
                onClose={() => setOpened(false)}
                title={label ? t('modal.edit', { propertyName: label }) : t('modal.comment.edit')}
            >
                <RichTextEditor
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </Modal>
        </>
    );
};
