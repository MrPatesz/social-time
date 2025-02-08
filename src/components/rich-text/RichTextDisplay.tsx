import { ScrollArea, Spoiler, TypographyStylesProvider } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { FunctionComponent } from 'react';
import { BorderComponent } from '../BorderComponent';

export const RichTextDisplay: FunctionComponent<{
    richText: string;
    maxHeight?: number;
    scroll?: boolean;
    bordered?: boolean;
}> = ({ richText, maxHeight, scroll = false, bordered = false }) => {
    const { t } = useTranslation('common');

    if (!richText) {
        return <></>;
    }

    const getRichTextContent = (mh?: number) => (
        <TypographyStylesProvider sx={{ maxHeight: mh }}>
            <div
                dangerouslySetInnerHTML={{ __html: richText }}
                style={{ overflowWrap: 'break-word' }}
            />
        </TypographyStylesProvider>
    );

    return (
        <ConditionalBorderComponent bordered={bordered}>
            {!maxHeight ?
                getRichTextContent()
            : scroll ?
                <ScrollArea>{getRichTextContent(maxHeight)}</ScrollArea>
            :   <Spoiler
                    maxHeight={maxHeight}
                    showLabel={t('richTextDisplay.showLabel')}
                    hideLabel={t('richTextDisplay.hideLabel')}
                >
                    {getRichTextContent()}
                </Spoiler>
            }
        </ConditionalBorderComponent>
    );
};

const ConditionalBorderComponent: FunctionComponent<{
    bordered: boolean;
    children: JSX.Element;
}> = ({ bordered, children }) => {
    if (!bordered) {
        return children;
    }

    return <BorderComponent>{children}</BorderComponent>;
};
