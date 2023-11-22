import {ActionIcon, Card, Collapse, Group, Text} from '@mantine/core';
import {IconChevronDown, IconChevronUp} from '@tabler/icons-react';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useState} from 'react';
import {getBackgroundColor} from '../utils/utilFunctions';

export const CollapsibleCard: FunctionComponent<{
  children: JSX.Element;
  label: string;
}> = ({children, label}) => {
  const {t} = useTranslation('common');

  const [opened, setOpened] = useState(false);

  return (
    <Card
      padding="xs"
      withBorder
      sx={theme => ({backgroundColor: getBackgroundColor(theme)})}
    >
      <Group
        position="apart"
        style={{cursor: 'pointer'}}
        onClick={() => setOpened(o => !o)}
      >
        <Text color="dimmed">{label}</Text>
        <ActionIcon
          title={t('application.collapse')}
          size="xs"
          variant="transparent"
        >
          {opened ? <IconChevronUp/> : <IconChevronDown/>}
        </ActionIcon>
      </Group>
      <Collapse in={opened}>
        {children}
      </Collapse>
    </Card>
  );
};
