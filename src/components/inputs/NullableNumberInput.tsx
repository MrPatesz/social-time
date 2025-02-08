import { FunctionComponent } from 'react';
import { NumberInput, NumberInputProps } from '@mantine/core';

export const NullableNumberInput: FunctionComponent<
    Omit<NumberInputProps, 'value' | 'onChange'> & {
        value: number | null;
        onChange: (newValue: number | null) => void;
    }
> = ({ value, onChange, ...numberInputProps }) => {
    return (
        <NumberInput
            {...numberInputProps}
            value={value ?? ''}
            onChange={(newValue) => onChange(newValue === '' ? null : newValue)}
        />
    );
};
