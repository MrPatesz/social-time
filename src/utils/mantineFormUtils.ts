import { UseFormReturnType } from '@mantine/form';
import { CreateLocationType } from '../models/Location';

export const getFormStringValue = <T, Key extends keyof T>(form: UseFormReturnType<T>, path: Key) =>
    (form.getInputProps(path).value as string | undefined) ?? '';

export const getFormStringOnChange = <T, Key extends keyof T>(
    form: UseFormReturnType<T>,
    path: Key
) => form.getInputProps(path).onChange as (newValue: string) => void;

export const getFormError = <T, Key extends keyof T>(form: UseFormReturnType<T>, path: Key) =>
    form.getInputProps(path).error as string | undefined;

export const getFormLocationValue = <T extends { location: unknown }>(form: UseFormReturnType<T>) =>
    form.getInputProps('location').value as CreateLocationType | null;

export const getFormLocationOnChange = <T extends { location: unknown }>(
    form: UseFormReturnType<T>
) => form.getInputProps('location').onChange as (newValue: CreateLocationType | null) => void;
