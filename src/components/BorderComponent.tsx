import { Card } from '@mantine/core';
import { FunctionComponent } from 'react';
import { ThemeColor } from '../utils/enums';
import { getBackgroundColor } from '../utils/utilFunctions';

export const BorderComponent: FunctionComponent<{
    children: JSX.Element;
    borderColor?: ThemeColor;
}> = ({ children, borderColor }) => {
    return (
        <Card
            withBorder
            sx={(theme) => ({
                overflow: 'visible',
                backgroundColor: getBackgroundColor(theme),
                borderColor:
                    borderColor ? `${theme.fn.themeColor(borderColor)} !important` : undefined,
            })}
        >
            {children}
        </Card>
    );
};
