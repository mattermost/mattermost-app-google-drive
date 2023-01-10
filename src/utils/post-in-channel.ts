import { MattermostClient } from '../clients';
import { Channel, ExtendedAppCallRequest, MattermostOptions, PostCreate } from '../types';

export const postBotChannel = async (call: ExtendedAppCallRequest, message: string, props: any = {}) => {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const botUserId: string = call.context.bot_user_id!;
    const actingUserId: string = call.context.acting_user.id!;

    const mattermostOption: MattermostOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(mattermostOption);
    const channel: Channel = await mattermostClient.createDirectChannel([<string>botUserId, <string>actingUserId]);

    const post: PostCreate = {
        message,
        channel_id: channel.id,
        props,
    };
    await mattermostClient.createPost(post);
};
