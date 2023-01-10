import { AppSelectOption } from '@mattermost/types/lib/apps';

import { ExtendedAppContext } from '../types';
import { configureI18n } from '../utils/translations';

import { GooglePermissionRole } from './google-files';

export const ConfigureClientForm = Object.freeze({
    CLIENT_ID: 'google_drive_client_id',
    CLIENT_SECRET: 'google_drive_client_secret',
    MODE: 'google_drive_mode',
    SERVICE_ACCOUNT: 'google_drive_service_account',
    API_KEY: 'google_drive_api_key',
});

export const CreateGoogleDocument = Object.freeze({
    TITLE: 'google_file_title',
    MESSAGE: 'google_file_message',
    WILL_SHARE: 'google_file_will_share',
    FILE_ACCESS: 'google_file_access',
});

export const optConfigure = {
    fAccountJSON: 'account_json',
    fAPIKey: 'api_key',
    fNone: '',
};

export const FilesToUpload = Object.freeze({
    FILES: 'upload_file_google_drive',
});

export const modeConfiguration = (context: ExtendedAppContext): AppSelectOption[] => {
    const i18nObj = configureI18n(context);

    return [
        {
            label: i18nObj.__('configure-binding.form.fields.serviceAccount.values.doNotUse'),
            value: optConfigure.fNone,
        },
        {
            label: i18nObj.__('configure-binding.form.fields.serviceAccount.values.useServiceAccount'),
            value: optConfigure.fAccountJSON,
        },
        {
            label: i18nObj.__('configure-binding.form.fields.serviceAccount.values.useAPIKey'),
            value: optConfigure.fAPIKey,
        },
    ];
};

export const optFileShare = {
    notShare: 'not_share',
    sAView: 'anyone_view',
    sAComment: 'anyone_comment',
    sAEdit: 'anyone_edit',
    sCView: 'channel_view',
    sCComment: 'channel_comment',
    sCEdit: 'channel_edit',
};

export const doNotShare = (context: ExtendedAppContext): AppSelectOption => {
    const i18nObj = configureI18n(context);
    return {
        label: i18nObj.__('create-binding.form.fields.fileAccess.options.notShare'),
        value: optFileShare.notShare,
    };
};

export const fileShareAnyone = (context: ExtendedAppContext): AppSelectOption[] => {
    const i18nObj = configureI18n(context);
    return [
        {
            label: i18nObj.__('create-binding.form.fields.fileAccess.options.sAView'),
            value: optFileShare.sAView,
        },
        {
            label: i18nObj.__('create-binding.form.fields.fileAccess.options.sAComment'),
            value: optFileShare.sAComment,
        },
        {
            label: i18nObj.__('create-binding.form.fields.fileAccess.options.sAEdit'),
            value: optFileShare.sAEdit,
        },
    ];
};

export const fileShareChannel = (context: ExtendedAppContext): AppSelectOption[] => {
    const i18nObj = configureI18n(context);
    return [
        {
            label: i18nObj.__('create-binding.form.fields.fileAccess.options.sCView'),
            value: optFileShare.sCView,
        },
        {
            label: i18nObj.__('create-binding.form.fields.fileAccess.options.sCComment'),
            value: optFileShare.sCComment,
        },
        {
            label: i18nObj.__('create-binding.form.fields.fileAccess.options.sCEdit'),
            value: optFileShare.sCEdit,
        },
    ];
};

export const shareFileOnChannel = (context: ExtendedAppContext): AppSelectOption[] => {
    return [
        doNotShare(context),
        ...fileShareChannel(context),
        ...fileShareAnyone(context),
    ];
};

export const notShareFileOnChannel = (context: ExtendedAppContext): AppSelectOption[] => {
    return [
        doNotShare(context),
        ...fileShareAnyone(context),
    ];
};

export const ReplyCommentForm = Object.freeze({
    RESPONSE: 'google_response_comment',
});

export const GooglePermissionRoleByOption: { [x: string]: GooglePermissionRole } = {
    [optFileShare.sCView]: 'reader',
    [optFileShare.sCComment]: 'commenter',
    [optFileShare.sCEdit]: 'writer',
    [optFileShare.sAView]: 'reader',
    [optFileShare.sAComment]: 'commenter',
    [optFileShare.sAEdit]: 'writer',
};

export const KVStoreGoogleData = Object.freeze({
    GOOGLE_DATA: 'google_data',
    USER_ID: 'userId',
    SECRET: 'secret',
});
