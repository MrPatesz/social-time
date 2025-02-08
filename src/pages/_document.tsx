import { createStylesServer, ServerStyles } from '@mantine/next';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { emotionCache } from '../utils/emotionCache';

const stylesServer = createStylesServer(emotionCache);

export default class _Document extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        return {
            ...initialProps,
            styles: [
                initialProps.styles,
                <ServerStyles
                    html={initialProps.html}
                    server={stylesServer}
                    key="styles"
                />,
            ],
        };
    }

    render() {
        return (
            <Html>
                <Head>
                    <link
                        rel="manifest"
                        href="/manifest.json"
                    />
                    <meta
                        name="theme-color"
                        content="#1A1B1E"
                    />
                    <meta
                        name="description"
                        content="Social Time is a social media application in which users can form groups and organize events."
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
