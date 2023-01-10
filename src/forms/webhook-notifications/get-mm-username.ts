import { head } from 'lodash';

import {
    MattermostOptions,
    User,
    WebhookRequest,
} from '../../types';
import { KVGoogleData, KVGoogleUser } from '../../types/kv-store';
import { getKVGoogleData } from '../../utils/utils';
import { MattermostClient } from '../../clients';

export async function getMattermostUserFromGoogleEmail(call: WebhookRequest, authorEmail: string): Promise<User | null> {
    const kvGoogleData: KVGoogleData = await getKVGoogleData(call);
    const kvGUser: KVGoogleUser | undefined = kvGoogleData?.userData?.find((user) => head(Object.values(user))?.user_email === authorEmail);

    if (kvGUser) {
        const userId: string = head(Object.keys(<KVGoogleUser>kvGUser))!;
        const mattermostUrl: string = call.context.mattermost_site_url!;
        const botAccessToken: string = call.context.bot_access_token!;

        const mattermostOpts: MattermostOptions = {
            mattermostUrl,
            accessToken: botAccessToken,
        };
        const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

        const mmUser: User | undefined = await mmClient.getUser(userId);
        if (mmUser) {
            return mmUser;
        }
    }
    return null;
}
