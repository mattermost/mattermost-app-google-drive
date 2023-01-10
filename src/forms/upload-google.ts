import { AppSelectOption } from '@mattermost/types/lib/apps';
import { head } from 'lodash';
import moment from 'moment';

import { MattermostClient } from '../clients';
import { getGoogleDriveClient } from '../clients/google-client';
import { AppExpandLevels, AppFieldTypes, ExceptionType, FilesToUpload, GoogleDriveIcon, Routes } from '../constant';
import { ExpandAppField, ExpandAppForm, ExtendedAppCallRequest, MattermostOptions, PostCreate, PostResponse, Schema$File, Schema$User } from '../types';
import { SelectedUploadFilesForm } from '../types/forms';
import { configureI18n } from '../utils/translations';
import { throwException, tryPromise, tryPromiseMattermost } from '../utils/utils';

export async function uploadFileConfirmationCall(call: ExtendedAppCallRequest): Promise<ExpandAppForm> {
    const i18nObj = configureI18n(call.context);

    const mattermostUrl: string = call.context.mattermost_site_url!;
    const userAccessToken: string = call.context.acting_user_access_token!;
    const postId: string = call.context.post?.id as string;

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: userAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const Post: PostResponse = await tryPromiseMattermost<PostResponse>(mmClient.getPost(postId), ExceptionType.TEXT_ERROR, i18nObj.__('general.mattermost-error'), call);

    const fileIds = Post.file_ids;
    if (!fileIds || !fileIds.length) {
        throwException(ExceptionType.MARKDOWN, i18nObj.__('upload-google.confirmation-call.error-upload'), call);
    }
    const fileMetadata = Post.metadata.files;

    const options: AppSelectOption[] = fileMetadata.map((file) => {
        return {
            label: file.name,
            value: file.id,
        };
    });

    const fields: ExpandAppField[] = [
        {
            type: AppFieldTypes.STATIC_SELECT,
            name: FilesToUpload.FILES,
            modal_label: i18nObj.__('upload-google.confirmation-call.label-modal'),
            options,
            multiselect: true,
            is_required: true,
        },
    ];

    return {
        title: i18nObj.__('upload-google.confirmation-call.title'),
        icon: GoogleDriveIcon,
        fields,
        submit: {
            path: Routes.App.CallPathSaveFileSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                post: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    } as ExpandAppForm;
}

export async function uploadFileConfirmationSubmit(call: ExtendedAppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);

    const mattermostUrl: string = call.context.mattermost_site_url as string;
    const userAccessToken: string = call.context.acting_user_access_token as string;
    const postId: string = call.context.post?.id as string;
    const channelId: string = call.context.post?.channel_id as string;
    const values = call.values as SelectedUploadFilesForm;
    const saveFiles = values.upload_file_google_drive.map((val) => val.value);

    const mattermostOpts: MattermostOptions = {
        mattermostUrl,
        accessToken: userAccessToken,
    };
    const mmClient: MattermostClient = new MattermostClient(mattermostOpts);

    const post: PostResponse = await tryPromiseMattermost<PostResponse>(mmClient.getPost(postId), ExceptionType.TEXT_ERROR, i18nObj.__('general.mattermost-error'), call);

    const fileIds = post.file_ids;
    const filesMetadata = post.metadata?.files;
    const responseArray: Schema$File[] = [];

    const drive = await getGoogleDriveClient(call);
    for (let index = 0; index < fileIds.length; index++) {
        const metadata = filesMetadata[index];

        if (!saveFiles.includes(metadata.id)) {
            continue;
        }

        const file = await mmClient.getFileUploaded(metadata.id); // eslint-disable-line no-await-in-loop

        const requestBody = {
            name: metadata.name,
        };

        const media = {
            mimeType: metadata.mime_type,
            body: file,
        };

        const fileUploaded = await tryPromise<Schema$File>(drive.files.create({ // eslint-disable-line no-await-in-loop
            requestBody,
            media,
            fields: 'id,name,webViewLink,iconLink,owners,createdTime',
        }), ExceptionType.TEXT_ERROR, i18nObj.__('general.google-error'), call);

        responseArray.push(fileUploaded);
    }

    const attachments = responseArray.map((fileUp) => {
        const owner = head(fileUp.owners) as Schema$User;
        return {
            author_name: `${owner.displayName}`,
            author_icon: `${owner?.photoLink}`,
            title: `${fileUp.name}`,
            title_link: `${fileUp.webViewLink}`,
            footer: i18nObj.__('upload-google.confirmation-submit.footer', { date: moment(fileUp?.createdTime).format('MMM Do, YYYY') }),
            footer_icon: `${fileUp.iconLink}`,
        };
    });

    const message = attachments.length > 1 ?
        i18nObj.__('upload-google.confirmation-submit.multiple-files') :
        i18nObj.__('upload-google.confirmation-submit.single-file');

    const postCreate: PostCreate = {
        message,
        channel_id: channelId,
        props: {
            attachments,
        },
        root_id: postId,
    };

    await tryPromiseMattermost<PostResponse>(mmClient.createPost(postCreate), ExceptionType.TEXT_ERROR, i18nObj.__('general.mattermost-error'), call);

    return message;
}
