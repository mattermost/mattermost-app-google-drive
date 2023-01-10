import { ClientConfig } from '@mattermost/types/lib/config';
import { head } from 'lodash';
import moment from 'moment';

import { MattermostClient } from '../clients';
import { getGoogleDocsClient, getGoogleDriveClient, getGoogleSheetsClient, getGoogleSlidesClient } from '../clients/google-client';
import { AppExpandLevels, AppFieldSubTypes, AppFieldTypes, CreateGoogleDocument, ExceptionType, GoogleDriveIcon, Routes, notShareFileOnChannel, shareFileOnChannel } from '../constant';
import GeneralConstants from '../constant/general';
import {
    Channel,
    ExpandAppField,
    ExpandAppForm,
    ExtendedAppCallRequest,
    ExtendedAppContext,
    MattermostOptions,
    Params$Resource$Files$Get,
    PostCreate,
    Schema$Document,
    Schema$File,
    Schema$Presentation,
    Schema$Spreadsheet,
    Schema$User,
} from '../types';
import { CreateFileForm } from '../types/forms';
import { ShareFileFunction } from '../types/functions';
import { configureI18n } from '../utils/translations';
import { tryPromise, tryPromiseMattermost } from '../utils/utils';

import { SHARE_FILE_ACTIONS } from './share-google-file';

export async function createGoogleDocForm(call: ExtendedAppCallRequest): Promise<ExpandAppForm> {
    const i18nObj = configureI18n(call.context);

    const botAccessToken: string = call.context.bot_access_token!;
    const mattermostUrl: string = call.context.mattermost_site_url;
    const context = call.context as ExtendedAppContext;
    const values = call.values as CreateFileForm;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const configClient: ClientConfig = await tryPromiseMattermost<ClientConfig>(mmClient.getConfigClient(), ExceptionType.TEXT_ERROR, i18nObj.__('general.mattermost-error'), call);
    const showEmailAddress: string | undefined = configClient?.ShowEmailAddress;

    const willShare = values?.google_file_will_share === undefined ?
        true :
        values?.google_file_will_share;

    const showWithMembers: boolean = (showEmailAddress === 'true' || showEmailAddress === undefined) && willShare;

    const fields: ExpandAppField[] = [
        {
            type: AppFieldTypes.TEXT,
            name: CreateGoogleDocument.TITLE,
            modal_label: i18nObj.__('create-binding.form.fields.title.title'),
            is_required: false,
            value: values?.google_file_title,
        },
    ];

    if (Boolean(willShare)) {
        fields.push(
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.TEXTAREA,
                max_length: GeneralConstants.TEXTAREA_MAX_LENGTH,
                name: CreateGoogleDocument.MESSAGE,
                modal_label: i18nObj.__('create-binding.form.fields.message.title'),
                placeholder: i18nObj.__('create-binding.form.fields.message.placeholder'),
                is_required: false,
            }
        );
    }

    fields.push(
        {
            type: AppFieldTypes.STATIC_SELECT,
            name: CreateGoogleDocument.FILE_ACCESS,
            modal_label: i18nObj.__('create-binding.form.fields.fileAccess.title'),
            description: i18nObj.__('create-binding.form.fields.fileAccess.description'),
            is_required: true,
            options: showWithMembers ? shareFileOnChannel(context) : notShareFileOnChannel(context),
        },
        {
            modal_label: i18nObj.__('create-binding.form.fields.share.title'),
            type: AppFieldTypes.BOOL,
            name: CreateGoogleDocument.WILL_SHARE,
            is_required: false,
            refresh: true,
            description: i18nObj.__('create-binding.form.fields.share.hint'),
            value: willShare,
        }
    );

    return {
        title: i18nObj.__('create-binding.docs.title'),
        icon: GoogleDriveIcon,
        fields,
        submit: {
            path: Routes.App.CallPathCreateDocumentSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                channel: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
        source: {
            path: Routes.App.CallPathUpdateDocumentForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    } as ExpandAppForm;
}

export async function createGoogleDocSubmit(call: ExtendedAppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const userAccessToken: string = call.context.acting_user_access_token!;
    const actingUserId: string = call.context.acting_user.id!;
    const botUserId: string = call.context.bot_user_id!;
    const values = call.values as CreateFileForm;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>userAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const docs = await getGoogleDocsClient(call);
    const params = {
        requestBody: {
            title: values.google_file_title,
        },
    };
    const newDoc = await tryPromise<Schema$Document>(docs.documents.create(params), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const drive = await getGoogleDriveClient(call);
    const paramExport: Params$Resource$Files$Get = {
        fileId: <string>newDoc.documentId,
        fields: 'webViewLink,id,owners,permissions,name,iconLink,thumbnailLink,createdTime',
    };

    const file = await tryPromise<Schema$File>(drive.files.get(paramExport), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    const owner = head(file.owners) as Schema$User;

    let channelId: string = call.context.channel?.id as string;
    if (!values.google_file_will_share) {
        const channel: Channel = await mmClient.createDirectChannel([<string>botUserId, <string>actingUserId]);
        channelId = channel.id;
    }

    const date = moment(file?.createdTime).format('MMM Do, YYYY');

    const post: PostCreate = {
        message: <string>values.google_file_message,
        channel_id: channelId,
        props: {
            attachments: [
                {
                    author_name: `${owner.displayName}`,
                    author_icon: `${owner?.photoLink}`,
                    title: `${file.name}`,
                    title_link: `${file.webViewLink}`,
                    footer: i18nObj.__('create-binding.response.footer', { date }),
                    footer_icon: `${file.iconLink}`,
                    fields: [],
                    actions: [],
                },
            ],
        },
    };
    await mmClient.createPost(post);

    const shareFile: ShareFileFunction = SHARE_FILE_ACTIONS[values.google_file_access.value];
    if (shareFile) {
        await shareFile(call, file, channelId);
    }

    return i18nObj.__('create-binding.docs.success', { file: `${file.name}` });
}

export async function createGoogleSlidesForm(call: ExtendedAppCallRequest): Promise<ExpandAppForm> {
    const i18nObj = configureI18n(call.context);

    const botAccessToken: string = call.context.bot_access_token!;
    const mattermostUrl: string = call.context.mattermost_site_url;
    const context = call.context as ExtendedAppContext;
    const values = call.values as CreateFileForm;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const configClient: ClientConfig = await tryPromiseMattermost<ClientConfig>(mmClient.getConfigClient(), ExceptionType.TEXT_ERROR, i18nObj.__('general.mattermost-error'), call);
    const showEmailAddress: string | undefined = configClient?.ShowEmailAddress;

    const willShare = values?.google_file_will_share === undefined ?
        true :
        values?.google_file_will_share;

    const showWithMembers: boolean = (showEmailAddress === 'true' || showEmailAddress === undefined) && willShare;

    const fields: ExpandAppField[] = [
        {
            type: AppFieldTypes.TEXT,
            name: CreateGoogleDocument.TITLE,
            modal_label: i18nObj.__('create-binding.form.fields.title.title'),
            is_required: false,
            value: values?.google_file_title,
        },
    ];

    if (Boolean(willShare)) {
        fields.push(
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.TEXTAREA,
                max_length: GeneralConstants.TEXTAREA_MAX_LENGTH,
                name: CreateGoogleDocument.MESSAGE,
                modal_label: i18nObj.__('create-binding.form.fields.message.title'),
                placeholder: i18nObj.__('create-binding.form.fields.message.placeholder'),
                is_required: false,
            }
        );
    }

    fields.push(
        {
            type: AppFieldTypes.STATIC_SELECT,
            name: CreateGoogleDocument.FILE_ACCESS,
            modal_label: i18nObj.__('create-binding.form.fields.fileAccess.title'),
            description: i18nObj.__('create-binding.form.fields.fileAccess.description'),
            is_required: true,
            options: showWithMembers ? shareFileOnChannel(context) : notShareFileOnChannel(context),
        },
        {
            modal_label: i18nObj.__('create-binding.form.fields.share.title'),
            type: AppFieldTypes.BOOL,
            name: CreateGoogleDocument.WILL_SHARE,
            is_required: false,
            refresh: true,
            description: i18nObj.__('create-binding.form.fields.share.hint'),
            value: willShare,
        }
    );

    return {
        title: i18nObj.__('create-binding.slides.title'),
        icon: GoogleDriveIcon,
        fields,
        submit: {
            path: Routes.App.CallPathCreatePresentationSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                channel: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
        source: {
            path: Routes.App.CallPathUpdatePresentationForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    } as ExpandAppForm;
}

export async function createGoogleSlidesSubmit(call: ExtendedAppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const userAccessToken: string = call.context.acting_user_access_token!;
    const actingUserId: string = call.context.acting_user.id!;
    const botUserId: string = call.context.bot_user_id!;
    const values: CreateFileForm = call.values as CreateFileForm;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>userAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const slides = await getGoogleSlidesClient(call);
    const params = {
        requestBody: {
            title: values.google_file_title,
        },
    };
    const newSlide = await tryPromise<Schema$Presentation>(slides.presentations.create(params), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const drive = await getGoogleDriveClient(call);
    const paramExport: Params$Resource$Files$Get = {
        fileId: <string>newSlide.presentationId,
        fields: 'webViewLink,id,owners,permissions,name,iconLink,thumbnailLink,createdTime',
    };

    const file = await tryPromise<Schema$File>(drive.files.get(paramExport), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    const owner = head(file.owners) as Schema$User;

    let channelId: string = call.context.channel?.id as string;
    if (!values.google_file_will_share) {
        const channel: Channel = await mmClient.createDirectChannel([<string>botUserId, <string>actingUserId]);
        channelId = channel.id;
    }
    const date = moment(file?.createdTime).format('MMM Do, YYYY');

    const post: PostCreate = {
        message: <string>values.google_file_message,
        channel_id: channelId,
        props: {
            attachments: [
                {
                    author_name: `${owner.displayName}`,
                    author_icon: `${owner?.photoLink}`,
                    title: `${file.name}`,
                    title_link: `${file.webViewLink}`,
                    footer: i18nObj.__('create-binding.response.footer', { date }),
                    footer_icon: `${file.iconLink}`,
                    fields: [],
                    actions: [],
                },
            ],
        },
    };
    await mmClient.createPost(post);
    const shareFile: ShareFileFunction = SHARE_FILE_ACTIONS[values.google_file_access.value];
    if (shareFile) {
        await shareFile(call, file, channelId);
    }

    return i18nObj.__('create-binding.slides.success', { file: `${file.name}` });
}

export async function createGoogleSheetsForm(call: ExtendedAppCallRequest): Promise<ExpandAppForm> {
    const i18nObj = configureI18n(call.context);

    const botAccessToken: string = call.context.bot_access_token!;
    const mattermostUrl: string = call.context.mattermost_site_url;
    const context = call.context as ExtendedAppContext;
    const values = call.values as CreateFileForm;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const configClient: ClientConfig = await tryPromiseMattermost<ClientConfig>(mmClient.getConfigClient(), ExceptionType.TEXT_ERROR, i18nObj.__('general.mattermost-error'), call);
    const showEmailAddress: string | undefined = configClient?.ShowEmailAddress;

    const willShare = values?.google_file_will_share === undefined ?
        true :
        values?.google_file_will_share;

    const showWithMembers: boolean = (showEmailAddress === 'true' || showEmailAddress === undefined) && willShare;

    const fields: ExpandAppField[] = [
        {
            type: AppFieldTypes.TEXT,
            name: CreateGoogleDocument.TITLE,
            modal_label: i18nObj.__('create-binding.form.fields.title.title'),
            is_required: false,
            value: values?.google_file_title,
        },
    ];

    if (Boolean(willShare)) {
        fields.push(
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.TEXTAREA,
                max_length: GeneralConstants.TEXTAREA_MAX_LENGTH,
                name: CreateGoogleDocument.MESSAGE,
                modal_label: i18nObj.__('create-binding.form.fields.message.title'),
                placeholder: i18nObj.__('create-binding.form.fields.message.placeholder'),
                is_required: false,
            }
        );
    }

    fields.push(
        {
            type: AppFieldTypes.STATIC_SELECT,
            name: CreateGoogleDocument.FILE_ACCESS,
            modal_label: i18nObj.__('create-binding.form.fields.fileAccess.title'),
            description: i18nObj.__('create-binding.form.fields.fileAccess.description'),
            is_required: true,
            options: showWithMembers ? shareFileOnChannel(context) : notShareFileOnChannel(context),
        },
        {
            modal_label: i18nObj.__('create-binding.form.fields.share.title'),
            type: AppFieldTypes.BOOL,
            name: CreateGoogleDocument.WILL_SHARE,
            is_required: false,
            refresh: true,
            description: i18nObj.__('create-binding.form.fields.share.hint'),
            value: willShare,
        }
    );

    return {
        title: i18nObj.__('create-binding.sheets.title'),
        icon: GoogleDriveIcon,
        fields,
        submit: {
            path: Routes.App.CallPathCreateSpreadsheetSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                channel: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
        source: {
            path: Routes.App.CallPathUpdateSpreadsheetForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    } as ExpandAppForm;
}

export async function createGoogleSheetsSubmit(call: ExtendedAppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const userAccessToken: string = call.context.acting_user_access_token!;
    const actingUserId: string = call.context.acting_user.id!;
    const botUserId: string = call.context.bot_user_id!;
    const values = call.values as CreateFileForm;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>userAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const sheets = await getGoogleSheetsClient(call);
    const params = {
        requestBody: {
            properties: {
                title: values.google_file_title,
            },
        },
    };
    const newSheets = await tryPromise<Schema$Spreadsheet>(sheets.spreadsheets.create(params), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const drive = await getGoogleDriveClient(call);
    const paramExport: Params$Resource$Files$Get = {
        fileId: <string>newSheets.spreadsheetId,
        fields: 'webViewLink,id,owners,permissions,name,iconLink,thumbnailLink,createdTime',
    };

    const file = await tryPromise<Schema$File>(drive.files.get(paramExport), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    const owner = head(file.owners) as Schema$User;

    let channelId: string = call.context.channel?.id as string;
    if (!values.google_file_will_share) {
        const channel: Channel = await mmClient.createDirectChannel([<string>botUserId, <string>actingUserId]);
        channelId = channel.id;
    }
    const date = moment(file?.createdTime).format('MMM Do, YYYY');

    const post: PostCreate = {
        message: <string>values.google_file_message,
        channel_id: channelId,
        props: {
            attachments: [
                {
                    author_name: `${owner.displayName}`,
                    author_icon: `${owner?.photoLink}`,
                    title: `${file.name}`,
                    title_link: `${file.webViewLink}`,
                    footer: i18nObj.__('create-binding.response.footer', { date }),
                    footer_icon: `${file.iconLink}`,
                    fields: [],
                    actions: [],
                },
            ],
        },
    };
    await mmClient.createPost(post);

    const shareFile: ShareFileFunction = SHARE_FILE_ACTIONS[values.google_file_access.value];
    if (shareFile) {
        await shareFile(call, file, channelId);
    }

    return i18nObj.__('create-binding.sheets.success', { file: `${file.name}` });
}
