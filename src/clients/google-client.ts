import { Auth, docs_v1, drive_v3, driveactivity_v2, google, sheets_v4, slides_v1 } from 'googleapis';
import { head } from 'lodash';

import { ExceptionType, KVStoreGoogleData } from '../constant';
import { ExtendedAppCallRequest, KVGoogleData, KVGoogleUser, KVStoreOptions, Oauth2App, Oauth2CurrentUser } from '../types';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';

import { KVStoreClient } from './kvstore';

export const getOAuthGoogleClient = async (call: ExtendedAppCallRequest): Promise<Auth.OAuth2Client> => {
    const oauth2App: Oauth2App = call.context.oauth2 as Oauth2App;
    const oAuth2Client = new google.auth.OAuth2(
        oauth2App.client_id,
        oauth2App.client_secret,
        oauth2App.complete_url,
    );

    return oAuth2Client;
};

export const getGoogleOAuth = async (call: ExtendedAppCallRequest): Promise<Auth.OAuth2Client> => {
    const i18nObj = configureI18n(call.context);

    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const actingUserId: string = call.context.acting_user.id!;
    let oauth2Token = call.context.oauth2?.user as Oauth2CurrentUser;

    if (!oauth2Token?.refresh_token) {
        const kvOptions: KVStoreOptions = {
            mattermostUrl,
            accessToken: botAccessToken,
        };
        const kvStoreClient = new KVStoreClient(kvOptions);
        const googleData: KVGoogleData = await kvStoreClient.kvGet(KVStoreGoogleData.GOOGLE_DATA);
        const kvGUser: KVGoogleUser = googleData?.userData?.find((user) => head(Object.keys(user)) === actingUserId) as KVGoogleUser;
        if (Boolean(kvGUser)) {
            oauth2Token = head(Object.values(<KVGoogleUser>kvGUser)) as Oauth2CurrentUser;
        }
    }

    const oauth2Client = await getOAuthGoogleClient(call);
    oauth2Client.setCredentials(oauth2Token);
    await tryPromise(oauth2Client.refreshAccessToken(), ExceptionType.MARKDOWN, i18nObj.__('general.google-error'), call);
    return oauth2Client;
};

export const getGoogleDriveClient = async (call: ExtendedAppCallRequest): Promise<drive_v3.Drive> => {
    const auth = await getGoogleOAuth(call);

    return google.drive({
        version: 'v3',
        auth,
    });
};

export const getGoogleDriveActivityClient = async (call: ExtendedAppCallRequest): Promise<driveactivity_v2.Driveactivity> => {
    const auth = await getGoogleOAuth(call);

    return google.driveactivity({
        version: 'v2',
        auth,
    });
};

export const getGoogleDocsClient = async (call: ExtendedAppCallRequest): Promise<docs_v1.Docs> => {
    const auth = await getGoogleOAuth(call);

    return google.docs({
        version: 'v1',
        auth,
    });
};

export const getGoogleSlidesClient = async (call: ExtendedAppCallRequest): Promise<slides_v1.Slides> => {
    const auth = await getGoogleOAuth(call);

    return google.slides({
        version: 'v1',
        auth,
    });
};

export const getGoogleSheetsClient = async (call: ExtendedAppCallRequest): Promise<sheets_v4.Sheets> => {
    const auth = await getGoogleOAuth(call);

    return google.sheets({
        version: 'v4',
        auth,
    });
};
