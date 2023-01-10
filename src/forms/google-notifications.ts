import { v4 as uuidv4 } from 'uuid';

import { KVStoreClient } from '../clients';
import { getGoogleDriveClient } from '../clients/google-client';
import { ExceptionType, KVStoreGoogleData, Routes, StoreKeys } from '../constant';
import { GoogleKindsAPI } from '../constant/google-kinds';
import { ChannelNotification, ExtendedAppCallRequest, KVStoreOptions, Schema$Channel, StartPageToken } from '../types';
import { configureI18n } from '../utils/translations';
import { throwException, tryPromise } from '../utils/utils';

export async function stopNotificationsCall(call: ExtendedAppCallRequest): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const actingUserId: string = call.context.acting_user.id!;
    const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);
    const channelNotification: ChannelNotification = await kvStoreClient.kvGet(`drive_notifications-${actingUserId}`);

    if (!Object.keys(channelNotification).length) {
        throwException(ExceptionType.MARKDOWN, i18nObj.__('notifications-binding.already-disabled'), call);
    }

    const drive = await getGoogleDriveClient(call);
    const stopParams = {
        requestBody: {
            id: channelNotification.channelId,
            resourceId: channelNotification.resourceId,
        },
    };
    await tryPromise<Schema$Channel>(drive.channels.stop(stopParams), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    await kvStoreClient.kvSet(`drive_notifications-${actingUserId}`, {});

    return i18nObj.__('notifications-binding.response.disabled');
}

export async function startNotificationsCall(call: ExtendedAppCallRequest): Promise<string> {
    const mattermostUrl: string = process.env.LOCAL === 'TRUE' ?
        process.env.MATTERMOST_URL as string :
        call.context.mattermost_site_url!;

    const botAccessToken: string = call.context.bot_access_token!;
    const appPath: string = call.context.app_path!;
    const actingUserId: string = call.context.acting_user.id!;
    const i18nObj = configureI18n(call.context);
    const webhookSecret: string = call.context.app?.webhook_secret as string;

    const drive = await getGoogleDriveClient(call);

    const pageToken = await tryPromise<StartPageToken>(drive.changes.getStartPageToken(), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const urlWithParams = new URL(`${mattermostUrl}${appPath}${Routes.App.CallPathIncomingWebhookPath}`);
    urlWithParams.searchParams.append(KVStoreGoogleData.USER_ID, actingUserId);
    urlWithParams.searchParams.append(KVStoreGoogleData.SECRET, webhookSecret);

    const params = {
        pageToken: <string>pageToken.startPageToken,
        fields: '*',
        requestBody: {
            kind: GoogleKindsAPI.CHANNEL,
            id: uuidv4(),
            address: urlWithParams.href,
            type: 'web_hook',
            payload: true,
            params: {
                userId: actingUserId,
            },
        },
    };

    const watchChannel = await tryPromise<Schema$Channel>(drive.changes.watch(params), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const currentChannel: ChannelNotification = {
        channelId: <string>watchChannel.id,
        resourceId: <string>watchChannel.resourceId,
    };

    await kvStoreClient.kvSet(`drive_notifications-${actingUserId}`, currentChannel);
    return i18nObj.__('notifications-binding.response.enabled');
}
