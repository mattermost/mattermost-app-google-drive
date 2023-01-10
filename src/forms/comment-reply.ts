import { MattermostClient } from '../clients';
import { getGoogleDriveClient } from '../clients/google-client';
import { AppExpandLevels, AppFieldSubTypes, AppFieldTypes, ExceptionType, GoogleDriveIcon, ReplyCommentForm, Routes } from '../constant';
import { ExpandAppForm, ExtendedAppCallRequest, MattermostOptions, Params$Resource$Replies$Create, PostCreate } from '../types';
import { CommentState, ReplyCommentFormType } from '../types/forms';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';

export async function openFormReplyComment(call: ExtendedAppCallRequest): Promise<ExpandAppForm> {
    const i18nObj = configureI18n(call.context);

    const state = call.state;
    return {
        title: i18nObj.__('comments.comment-reply.open-form-reply.title'),
        icon: GoogleDriveIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ReplyCommentForm.RESPONSE,
                subtype: AppFieldSubTypes.TEXTAREA,
                modal_label: i18nObj.__('comments.comment-reply.open-form-reply.label'),
                description: i18nObj.__('comments.comment-reply.open-form-reply.description'),
                is_required: true,
            },
        ],
        submit: {
            path: Routes.App.CallPathCommentReplaySubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                post: AppExpandLevels.EXPAND_SUMMARY,
            },
            state,
        },
    };
}

export async function manageReplyCommentSubmit(call: ExtendedAppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);

    const drive = await getGoogleDriveClient(call);
    const comment: CommentState = call.state as CommentState;
    const values = call.values as ReplyCommentFormType;

    const newReply: Params$Resource$Replies$Create = {
        commentId: comment.comment.id,
        fileId: comment.file.id,
        fields: '*',
        requestBody: {
            content: values.google_response_comment,
        },
    };

    await tryPromise<any>(drive.replies.create(newReply), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const postId: string = call.context.post?.id as string;
    const channelId: string = call.context.post?.channel_id as string;
    const botAccessToken: string = call.context.bot_access_token!;
    const mattermostUrl: string = call.context.mattermost_site_url;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const message = `${i18nObj.__('comments.manage-reply-comment.message')}: \n"${values.google_response_comment}"`;
    const post: PostCreate = {
        message,
        channel_id: <string>channelId,
        root_id: postId,
    };
    await mmClient.createPost(post);

    return message;
}
