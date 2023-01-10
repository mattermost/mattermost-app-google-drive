import { AppCallValues, AppField, AppSelectOption } from '@mattermost/types/lib/apps';

import { KVStoreClient } from '../clients/kvstore';
import { AppExpandLevels, AppFieldSubTypes, AppFieldTypes, Commands, ConfigureClientForm, ExceptionType, GoogleDriveIcon, Routes, modeConfiguration, optConfigure } from '../constant';
import GeneralConstants from '../constant/general';
import manifest from '../manifest.json';
import { ExpandAppForm, ExtendedAppCallRequest, KVStoreOptions, KVStoreProps, Oauth2App, Oauth2Data } from '../types';
import { configureI18n } from '../utils/translations';

export async function googleClientConfigForm(call: ExtendedAppCallRequest): Promise<ExpandAppForm> {
    const i18nObj = configureI18n(call.context);
    const homepageUrl: string = manifest.homepage_url;
    const values: KVStoreProps = call.values as KVStoreProps;
    const oauth2App: Oauth2App = call.context.oauth2 as Oauth2App;

    const clientID = values?.google_drive_client_id || oauth2App?.client_id;
    const clientSecret = values?.google_drive_client_secret || oauth2App?.client_secret;
    const modeConfig = typeof values?.google_drive_mode == 'object' ?
        values?.google_drive_mode?.value :
        oauth2App?.data?.google_drive_mode;
    const apiKey = values?.google_drive_api_key || oauth2App?.data?.google_drive_api_key;
    const saJson = values?.google_drive_service_account || oauth2App?.data?.google_drive_service_account;

    const defValue: AppSelectOption = modeConfiguration(call.context).find((mode) => mode.value === modeConfig)!;

    const form: ExpandAppForm = {
        title: i18nObj.__('configure-binding.form.title'),
        header: i18nObj.__('configure-binding.form.header', { homepageUrl }),
        icon: GoogleDriveIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureClientForm.CLIENT_ID,
                modal_label: i18nObj.__('configure-binding.form.fields.clientID.title'),
                value: clientID,
                description: i18nObj.__('configure-binding.form.fields.clientID.description'),
                is_required: true,
            },
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.PASSWORD,
                name: ConfigureClientForm.CLIENT_SECRET,
                modal_label: i18nObj.__('configure-binding.form.fields.clientSecret.title'),
                value: clientSecret,
                description: i18nObj.__('configure-binding.form.fields.clientSecret.description'),
                is_required: true,
            },
            {
                type: AppFieldTypes.STATIC_SELECT,
                name: ConfigureClientForm.MODE,
                modal_label: i18nObj.__('configure-binding.form.fields.serviceAccount.title'),
                value: defValue,
                description: i18nObj.__('configure-binding.form.fields.serviceAccount.description'),
                is_required: true,
                refresh: true,
                options: modeConfiguration(call.context),
            },
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {
                locale: AppExpandLevels.EXPAND_SUMMARY,
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
            },
        },
        source: {
            path: Routes.App.CallPathUpdateConfigForm,
            expand: {
                locale: AppExpandLevels.EXPAND_SUMMARY,
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
            },
        },
    };

    let extraField: AppField | undefined;

    switch (modeConfig) {
    case optConfigure.fAPIKey:
        extraField = {
            type: AppFieldTypes.TEXT,
            subtype: AppFieldSubTypes.PASSWORD,
            name: ConfigureClientForm.API_KEY,
            modal_label: i18nObj.__('configure-binding.form.fields.apiKey.title'),
            value: apiKey,
            description: i18nObj.__('configure-binding.form.fields.apiKey.description'),
            is_required: true,
        };
        break;
    case optConfigure.fAccountJSON:
        extraField = {
            type: AppFieldTypes.TEXT,
            subtype: AppFieldSubTypes.TEXTAREA,
            max_length: GeneralConstants.TEXTAREA_MAX_LENGTH,
            name: ConfigureClientForm.SERVICE_ACCOUNT,
            modal_label: i18nObj.__('configure-binding.form.fields.serviceAccountJSON.title'),
            value: saJson,
            description: i18nObj.__('configure-binding.form.fields.serviceAccountJSON.description'),
            is_required: true,
        };
        break;

    default:
        break;
    }

    if (extraField && form.fields) {
        form.fields.push(extraField);
    }

    return form;
}

export async function googleClientConfigFormSubmit(call: ExtendedAppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);

    const mattermostUrl: string = call.context.mattermost_site_url!;
    const userAccessToken: string = call.context.acting_user_access_token!;
    const values: AppCallValues = <any>call.values;

    const gClientID: string = values[ConfigureClientForm.CLIENT_ID];
    const gClientSecret: string = values[ConfigureClientForm.CLIENT_SECRET];
    const gconfigMode: AppSelectOption = values[ConfigureClientForm.MODE]?.value;
    const gSAJson: string = values[ConfigureClientForm.SERVICE_ACCOUNT];
    const gApiKey: string = values[ConfigureClientForm.API_KEY];

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken: userAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: Oauth2Data = {
        [ConfigureClientForm.MODE]: gconfigMode,
        [ConfigureClientForm.API_KEY]: gApiKey,
        [ConfigureClientForm.SERVICE_ACCOUNT]: gSAJson,
    };
    const oauth2App: Oauth2App = {
        client_id: gClientID,
        client_secret: gClientSecret,
        data: config,
    };

    await kvStoreClient.storeOauth2App(oauth2App);
    return i18nObj.__('configure-binding.response.success');
}
