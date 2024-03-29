import {MantineTheme} from '@mantine/core';

export const getBackgroundColor = (theme: MantineTheme) => {
  return theme.colorScheme === 'dark'
    ? theme.colors.dark[8]
    : theme.colors.gray[0];
};

export const getFirstDayOfWeek = (locale: string) => locale === 'hu' ? 1 : 0;

export const getInitials = (username: string) => {
  const names: string[] = username.split(' ');
  let initials: string[] | string = '';

  switch (names.length) {
    case 0:
      break;
    case 1:
      initials = (names.at(0) as string).slice(0, 2).toUpperCase();
      break;
    case 2:
      initials = names.map(s => s.charAt(0).toUpperCase());
      break;
    default:
      initials = [
        (names.at(0) as string).charAt(0).toUpperCase(),
        (names.at(-1) as string).charAt(0).toUpperCase(),
      ];
      break;
  }

  return initials;
};

export const formatDistance = (distance: number | undefined) => {
  if (distance === undefined) {
    return;
  }
  return `${distance.toFixed(0)} km`;
};
