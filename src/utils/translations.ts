import path from 'path';

import { I18n } from 'i18n';

import { LOCALES } from '../constant/locales';
import { ExtendedAppContext } from '../types';

let i18n = require('i18n');

export const configureI18n = (context?: ExtendedAppContext) => {
    const locale = context?.locale || LOCALES.ENGLISH;

    i18n = new I18n({
        locales: [
            LOCALES.ENGLISH,
            LOCALES.SPANISH,
        ],
        directory: path.join(__dirname, '../locales'),
        objectNotation: true,
        defaultLocale: locale,
    });

    return i18n;
};

// USAGE
/*
   const i18nObj = configureI18n(context);
   i18nObj.__('configure-binding.form.fields.serviceAccount.description'),
*/
