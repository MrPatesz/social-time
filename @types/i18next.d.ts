import 'i18next';
import type common from '../public/locales/en/common.json';

// All namespaces added in /public/locales should be manually added here for IntelliSense support!
interface I18nNamespaces {
    common: typeof common;
}

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: I18nNamespaces;
    }
}
