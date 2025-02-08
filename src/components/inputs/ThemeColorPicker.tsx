import { ColorSwatch, Group, Select, Text, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ComponentPropsWithoutRef, forwardRef, FunctionComponent } from 'react';
import { ThemeColor } from '../../utils/enums';

interface ItemProps extends ComponentPropsWithoutRef<'div'> {
    value: ThemeColor;
    label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ value, label, ...others }: ItemProps, ref) => {
        const theme = useMantineTheme();
        return (
            <div
                ref={ref}
                {...others}
            >
                <Group noWrap>
                    <ColorSwatch color={theme.fn.themeColor(value)} />
                    <Text>{label}</Text>
                </Group>
            </div>
        );
    }
);

export const ThemeColorPicker: FunctionComponent<{
    label?: string;
    value: ThemeColor;
    onChange: (newValue: ThemeColor) => void;
    error?: string | undefined;
}> = ({ label, value, onChange, error }) => {
    const theme = useMantineTheme();
    const { t } = useTranslation('common');

    return (
        <Select
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            rightSection={<ColorSwatch color={theme.fn.themeColor(value)} />}
            itemComponent={SelectItem}
            data={[
                { value: ThemeColor.RED, label: t('color.red') },
                { value: ThemeColor.PINK, label: t('color.pink') },
                { value: ThemeColor.GRAPE, label: t('color.grape') },
                { value: ThemeColor.VIOLET, label: t('color.violet') },
                { value: ThemeColor.INDIGO, label: t('color.indigo') },
                { value: ThemeColor.BLUE, label: t('color.blue') },
                { value: ThemeColor.CYAN, label: t('color.cyan') },
                { value: ThemeColor.TEAL, label: t('color.teal') },
                { value: ThemeColor.GREEN, label: t('color.green') },
                { value: ThemeColor.LIME, label: t('color.lime') },
                { value: ThemeColor.YELLOW, label: t('color.yellow') },
                { value: ThemeColor.ORANGE, label: t('color.orange') },
            ]}
        />
    );
};
