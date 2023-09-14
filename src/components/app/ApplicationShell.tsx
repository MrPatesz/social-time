import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  Header,
  MantineNumberSize,
  MediaQuery,
  Navbar,
  NavLink,
  Title,
  useMantineTheme
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import {signOut, useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {FunctionComponent} from 'react';
import {Adjustments, CalendarEvent, IconProps, Logout, Map, Share, Ticket, UserCircle, Users} from 'tabler-icons-react';
import {getBackgroundColor} from '../../utils/utilFunctions';
import {ColorSchemeToggle} from './ColorSchemeToggle';
import {LanguageToggle} from './LanguageToggle';
import {CenteredLoader} from '../CenteredLoader';

const welcome = 'welcome';

const NavBarLink: FunctionComponent<{
  link: {
    icon: FunctionComponent<IconProps>;
    label: string | null | undefined;
    title: string;
    route: string;
    onClick: () => void;
    active: boolean;
  };
  locale: string;
}> = ({link, locale}) => (
  <Link
    href={link.route}
    locale={locale}
    passHref
    onClick={link.onClick}
  >
    <NavLink
      label={link.label}
      title={link.title}
      active={link.active}
      icon={<link.icon size={20}/>}
    />
  </Link>
);

export const ApplicationShell: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const [showNavbar, {close: closeNavbar, toggle: toggleNavbar}] = useDisclosure(false);

  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {route, locale = 'en', defaultLocale, push: pushRoute} = useRouter();
  const {data: session, status} = useSession({
    required: !route.includes(welcome),
    onUnauthenticated: () => void pushRoute(`/${welcome}`, undefined, {locale}),
  });
  const {t} = useTranslation('common');

  const sessionLoading = status === 'loading';
  const authenticated = status === 'authenticated';
  const unauthenticated = status === 'unauthenticated';

  const isDefaultLocale = locale === defaultLocale;
  const localePrefix = isDefaultLocale ? '' : `/${locale}`;
  const [
    calendarRoute,
    groupsRoute,
    profileRoute,
    welcomeRoute,
    eventsRoute,
    controlPanelRoute,
    usersRoute,
    mapRoute,
  ] = [
    `${localePrefix}/calendar`,
    `${localePrefix}/groups`,
    `${localePrefix}/profile`,
    `${localePrefix}/${welcome}`,
    `${localePrefix}/events`,
    `${localePrefix}/control-panel`,
    `${localePrefix}/users`,
    `${localePrefix}/map`,
  ];

  const isRouteActive = (givenRoute: string) => {
    if (route === '/') {
      return false;
    }
    const actualRoute = givenRoute.split('/').at(isDefaultLocale ? 1 : 2) as string;
    return route.includes(actualRoute);
  };

  const breakpoint: MantineNumberSize = 'sm';

  return (
    <AppShell
      header={
        !sessionLoading ? (
          <Header height={56} py="xs" px="md">
            <Group align="center" position="apart">
              <Group spacing="xs">
                {authenticated && (
                  <MediaQuery largerThan={breakpoint} styles={{display: 'none'}}>
                    <Burger
                      title={t('application.menu')}
                      opened={showNavbar}
                      onClick={toggleNavbar}
                      size="sm"
                      color={theme.colors.gray[6]}
                    />
                  </MediaQuery>
                )}
                <Link
                  href="/"
                  locale={locale}
                  passHref
                  onClick={closeNavbar}
                >
                  <Title order={2}>{t((unauthenticated || xs) ? 'application.name' : 'application.shortName')}</Title>
                </Link>
              </Group>
              <Group spacing="xs">
                <LanguageToggle/>
                <ColorSchemeToggle/>
                {authenticated && (
                  <ActionIcon
                    title={t('application.logout')}
                    size="lg"
                    variant={theme.colorScheme === 'dark' ? 'outline' : 'default'}
                    onClick={() => void signOut({callbackUrl: welcomeRoute})}
                  >
                    <Logout/>
                  </ActionIcon>
                )}
              </Group>
            </Group>
          </Header>
        ) : undefined
      }
      navbarOffsetBreakpoint={breakpoint}
      navbar={
        authenticated ? (
          <Navbar width={{base: 211}} p="xs" hiddenBreakpoint={breakpoint} hidden={!showNavbar} zIndex={401}>
            <Navbar.Section grow>
              {[
                {
                  label: t('navbar.calendar.label'),
                  title: t('navbar.calendar.title'),
                  route: calendarRoute,
                  icon: CalendarEvent
                },
                {label: t('navbar.map.label'), title: t('navbar.map.title'), route: mapRoute, icon: Map},
                {label: t('navbar.events.label'), title: t('navbar.events.title'), route: eventsRoute, icon: Ticket},
                {label: t('navbar.groups.label'), title: t('navbar.groups.title'), route: groupsRoute, icon: Share},
                {label: t('navbar.users.label'), title: t('navbar.users.title'), route: usersRoute, icon: Users},
              ].map((link) => (
                <NavBarLink
                  key={link.label}
                  locale={locale}
                  link={{
                    ...link,
                    active: isRouteActive(link.route),
                    onClick: closeNavbar,
                  }}
                />
              ))}
            </Navbar.Section>
            <Navbar.Section>
              <NavBarLink
                locale={locale}
                link={{
                  label: t('navbar.controlPanel.label'),
                  title: t('navbar.controlPanel.title'),
                  route: controlPanelRoute,
                  icon: Adjustments,
                  active: isRouteActive(controlPanelRoute),
                  onClick: closeNavbar,
                }}
              />
              <NavBarLink
                locale={locale}
                link={{
                  label: session?.user?.name,
                  title: t('navbar.profile.title'),
                  route: profileRoute,
                  icon: UserCircle,
                  active: isRouteActive(profileRoute),
                  onClick: closeNavbar,
                }}
              />
            </Navbar.Section>
          </Navbar>
        ) : undefined}
      styles={{
        main: {
          backgroundColor: getBackgroundColor(theme),
        }
      }}
    >
      {sessionLoading ? (<CenteredLoader/>) : children}
    </AppShell>
  );
};
