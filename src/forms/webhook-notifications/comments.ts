import { head, last } from 'lodash';

import { getGoogleDriveClient } from '../../clients/google-client';
import { ActionsEvents, AppBindingLocations, AppExpandLevels, ExceptionType, Routes } from '../../constant';
import manifest from '../../manifest.json';
import { GA$CommentSubtype, GA$DriveActivity, GA$Target, PostBasicData, Schema$About, Schema$Comment, Schema$File, Schema$Reply, StateCommentPost, User, WebhookRequest } from '../../types';
import { bold, h5, hyperlink, inLineImage } from '../../utils/markdown';
import { postBotChannel } from '../../utils/post-in-channel';
import { configureI18n } from '../../utils/translations';
import { tryPromise } from '../../utils/utils';

import { getMattermostUserFromGoogleEmail } from './get-mm-username';
type CallbackFunction = (call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) => void;

export async function manageCommentOnFile(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity): Promise<void> {
    const subtype = activity.primaryActionDetail?.comment?.post?.subtype as GA$CommentSubtype;

    const action: CallbackFunction = COMMENT_ACTIONS[subtype];
    if (action) {
        await action(call, file, activity);
    }
}

const COMMENT_ACTIONS: { [key in GA$CommentSubtype]: CallbackFunction } = {
    SUBTYPE_UNSPECIFIED: funCommentSubtypeUnspecified,
    ADDED: funCommentAdded,
    DELETED: funCommentDeleted,
    REPLY_ADDED: funCommentReplyAdded,
    REPLY_DELETED: funCommentReplyDeleted,
    RESOLVED: funCommentResolved,
    REOPENED: funCommentReOpened,
};

async function funCommentSubtypeUnspecified(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);
}

async function funCommentAdded(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);

    const drive = await getGoogleDriveClient(call);
    const target = head(activity.targets) as GA$Target;
    const urlToComment = target.fileComment?.linkToDiscussion as string;
    const about: Schema$About = await tryPromise<Schema$About>(drive.about.get({ fields: 'user' }), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const commentParam = {
        fileId: <string>file.id,
        commentId: <string>target.fileComment?.legacyCommentId,
        fields: '*',
    };

    const comment = await tryPromise<Schema$Comment>(drive.comments.get(commentParam), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

    const author = comment.author;
    const actorEmail = <string>file.lastModifyingUser?.emailAddress;

    let userDisplay = `${author?.displayName} (${actorEmail})`;

    const mmUser = await getMattermostUserFromGoogleEmail(call, actorEmail);
    if (mmUser) {
        userDisplay = `@${mmUser?.username}`;
    }

    const mentions = comment.content?.includes(<string>about.user.emailAddress) ?
        'comments.add.text-mentioned' :
        'comments.add.text-comment';

    const message = h5(i18nObj.__(mentions,
        {
            userDisplay,
            image: inLineImage(i18nObj.__('comments.file-icon'), `${file?.iconLink} =15x15`),
            link: hyperlink(`${file?.name}`, <string>urlToComment),
        })
    );

    const description = `${comment.quotedFileContent?.value || ' '}\n ___ \n> ${comment.content}`;

    const postData: PostBasicData = {
        message,
        description,
    };
    const state: StateCommentPost = {
        comment: {
            id: <string>target.fileComment?.legacyCommentId,
        },
        file: {
            id: <string>file.id,
        },
    };
    await postNewCommentOnMattermost(call, postData, state);
}

async function funCommentReplyAdded(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);

    const drive = await getGoogleDriveClient(call);
    const target = head(activity.targets) as GA$Target;
    const urlToComment = target.fileComment?.linkToDiscussion as string;

    const commentParam = {
        fileId: <string>file.id,
        commentId: <string>target.fileComment?.legacyDiscussionId,
        fields: '*',
    };

    const comment = await tryPromise<Schema$Comment>(drive.comments.get(commentParam), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    const lastReply = last(comment.replies) as Schema$Reply;
    const oneBeforeLast = (comment.replies as Schema$Reply[]).at(-2) as Schema$Reply;
    const author = lastReply.author;
    const actorEmail = <string>file.lastModifyingUser?.emailAddress;

    let userDisplay = `${author?.displayName} (${actorEmail})`;

    const mmUser = await getMattermostUserFromGoogleEmail(call, actorEmail);
    if (mmUser) {
        userDisplay = `@${mmUser.username}`;
    }

    const message = h5(i18nObj.__('comments.reply.comment',
        {
            userDisplay,
            image: inLineImage(i18nObj.__('comments.file-icon'), `${file?.iconLink} =15x15`),
            link: hyperlink(`${file?.name}`, <string>urlToComment),
        }));

    const description = `${bold(i18nObj.__('comments.reply.previous'))}\n ${oneBeforeLast.content || ' '}\n ___ \n> ${lastReply.content}`;

    const postData: PostBasicData = {
        message,
        description,
    };
    const state: StateCommentPost = {
        comment: {
            id: <string>target.fileComment?.legacyDiscussionId,
        },
        file: {
            id: <string>file.id,
        },
    };
    await postNewCommentOnMattermost(call, postData, state);
}

async function funCommentResolved(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);

    const drive = await getGoogleDriveClient(call);
    const target = head(activity.targets) as GA$Target;
    const urlToComment = target.fileComment?.linkToDiscussion as string;

    const commentParam = {
        fileId: <string>file.id,
        commentId: <string>target.fileComment?.legacyDiscussionId,
        fields: '*',
    };

    const comment = await tryPromise<Schema$Comment>(drive.comments.get(commentParam), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    const author = comment.author;
    const actorEmail = <string>file.lastModifyingUser?.emailAddress;

    let userDisplay = `${author?.displayName} (${actorEmail})`;

    const mmUser = await getMattermostUserFromGoogleEmail(call, actorEmail);
    if (mmUser) {
        userDisplay = `@${mmUser.username}`;
    }

    const message = h5(i18nObj.__('comments.resolved.message',
        {
            userDisplay,
            image: inLineImage(i18nObj.__('comments.file-icon'), `${file?.iconLink} =15x15`),
            link: hyperlink(`${file?.name}`, <string>urlToComment),
        }
    ));

    await postBotChannel(call, message, {});
}

async function funCommentReOpened(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);

    const drive = await getGoogleDriveClient(call);
    const target = head(activity.targets) as GA$Target;
    const urlToComment = target.fileComment?.linkToDiscussion as string;

    const commentParam = {
        fileId: <string>file.id,
        commentId: <string>target.fileComment?.legacyDiscussionId,
        fields: '*',
    };

    const comment = await tryPromise<Schema$Comment>(drive.comments.get(commentParam), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);
    const lastReply = last(comment.replies) as Schema$Reply;
    const author = lastReply.author;
    const actorEmail = <string>file.lastModifyingUser?.emailAddress;

    let userDisplay = `${author?.displayName} (${actorEmail})`;

    const mmUser = await getMattermostUserFromGoogleEmail(call, actorEmail);
    if (mmUser) {
        userDisplay = `@${mmUser.username}`;
    }

    const message = h5(i18nObj.__('comments.reopened.message',
        {
            userDisplay,
            image: inLineImage(i18nObj.__('comments.file-icon'), `${file?.iconLink} =15x15`),
            link: hyperlink(`${file?.name}`, <string>urlToComment),
        }
    ));

    const description = `${bold(i18nObj.__('comments.reopened.comment'))}\n ${comment.content || ' '}\n ___ \n> ${lastReply.content}`;

    const postData: PostBasicData = {
        message,
        description,
    };
    const state: StateCommentPost = {
        comment: {
            id: <string>target.fileComment?.legacyDiscussionId,
        },
        file: {
            id: <string>file.id,
        },
    };
    await postNewCommentOnMattermost(call, postData, state);
}

async function funCommentDeleted(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);

    const target = head(activity.targets) as GA$Target;
    const urlToComment = target.fileComment?.linkToDiscussion as string;

    const message = h5(i18nObj.__('comments.delete.messsage',
        {
            image: inLineImage(i18nObj.__('general.google-error'), `${file?.iconLink} =15x15`),
            link: hyperlink(`${file?.name}`, <string>urlToComment),
        }));
    await postBotChannel(call, message, {});
}

async function funCommentReplyDeleted(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity) {
    const i18nObj = configureI18n(call.context);

    const target = head(activity.targets) as GA$Target;
    const urlToComment = target.fileComment?.linkToDiscussion as string;

    const message = h5(i18nObj.__('comments.delete-reply.message',
        {
            image: inLineImage(i18nObj.__('general.google-error'), `${file?.iconLink} =15x15`),
            link: hyperlink(`${file?.name}`, <string>urlToComment),
        }));
    await postBotChannel(call, message, {});
}

export async function postNewCommentOnMattermost(call: WebhookRequest, postData: PostBasicData, state: StateCommentPost): Promise<void> {
    const i18nObj = configureI18n(call.context);

    const props = {
        app_bindings: [
            {
                location: AppBindingLocations.EMBEDDED,
                app_id: manifest.app_id,
                description: postData.description,
                bindings: [
                    {
                        location: ActionsEvents.REPLY_COMMENTS,
                        label: i18nObj.__('comments.new.label'),
                        submit: {
                            path: Routes.App.CallPathCommentReplayForm,
                            expand: {
                                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                                oauth2_user: AppExpandLevels.EXPAND_ALL,
                                oauth2_app: AppExpandLevels.EXPAND_ALL,
                                post: AppExpandLevels.EXPAND_SUMMARY,
                            },
                            state,
                        },
                    },
                ],
            },
        ],
    };
    await postBotChannel(call, postData.message, props);
}
