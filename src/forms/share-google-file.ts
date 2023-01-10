import { MattermostClient } from '../clients';
import { getGoogleDriveClient } from '../clients/google-client';
import { ExceptionType, GooglePermissionRoleByOption, optFileShare } from '../constant';
import { ChannelMember, ExtendedAppCallRequest, MattermostOptions, Schema$File, User } from '../types';
import { CreateFileForm } from '../types/forms';
import { ShareFileFunction } from '../types/functions';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';

export const SHARE_FILE_ACTIONS: { [key: string]: ShareFileFunction } = {
    [optFileShare.sAView]: shareWithAnyone,
    [optFileShare.sAComment]: shareWithAnyone,
    [optFileShare.sAEdit]: shareWithAnyone,

    [optFileShare.sCView]: shareWithChannel,
    [optFileShare.sCComment]: shareWithChannel,
    [optFileShare.sCEdit]: shareWithChannel,
};

async function shareWithAnyone(call: ExtendedAppCallRequest, file: Schema$File, channelId: string,): Promise<void> {
    const i18nObj = configureI18n(call.context);

    const values = call.values as CreateFileForm;
    const role = GooglePermissionRoleByOption[values.google_file_access.value];
    const drive = await getGoogleDriveClient(call);

    const body = {
        fileId: <string>file.id,
        requestBody: {
            role,
            type: 'anyone',
        },
    };
    await tryPromise<any>(drive.permissions.create(body), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
}

async function shareWithChannel(call: ExtendedAppCallRequest, file: Schema$File, channelId: string,): Promise<void> {
    const i18nObj = configureI18n(call.context);

    const mattermostUrl: string = call.context.mattermost_site_url!;
    const userAccessToken: string = call.context.acting_user_access_token!;
    const values = call.values as CreateFileForm;
    const role = GooglePermissionRoleByOption[values.google_file_access.value];
    const drive = await getGoogleDriveClient(call);

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>userAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const membersOfChannel: ChannelMember[] = await mmClient.getChannelMembers(channelId);
    const userIDs = membersOfChannel.map((user) => user.user_id);
    const users: User[] = await mmClient.getUsersById(userIDs);
    const promises: Promise<any>[] = [];
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.is_bot) {
            return;
        }

        const body = {
            fileId: <string>file.id,
            requestBody: {
                role,
                type: 'user',
                emailAddress: user.email,
                sendNotificationEmail: true,
            },
        };
        promises.push(tryPromise(drive.permissions.create(body), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call));
    }
    await Promise.all(promises);
}

