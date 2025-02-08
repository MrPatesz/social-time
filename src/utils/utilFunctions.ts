import { MantineTheme } from '@mantine/core';
import { when } from 'typesafe-react';

export const getBackgroundColor = (theme: MantineTheme) => {
    return theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0];
};

export const getFirstDayOfWeek = (locale: string) => (locale === 'hu' ? 1 : 0);

export const getInitials = (username: string) => {
    const names: string[] = username.split(' ');

    return when(
        names.length,
        {
            0: () => '',
            1: () => (names.at(0) as string).slice(0, 2).toUpperCase(),
            2: () => names.map((s) => s.charAt(0).toUpperCase()).join(''),
        },
        () => [
            (names.at(0) as string).charAt(0).toUpperCase(),
            (names.at(-1) as string).charAt(0).toUpperCase(),
        ]
    );
};

export const formatDistance = (distance: number | undefined) => {
    if (distance === undefined) {
        return;
    }
    return `${distance.toFixed(0)} km`;
};
