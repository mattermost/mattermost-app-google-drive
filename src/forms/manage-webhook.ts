import { drive_v3 } from 'googleapis';
import { head } from 'lodash';
import moment from 'moment';

import { getGoogleDriveActivityClient, getGoogleDriveClient } from '../clients/google-client';
import { ExceptionType } from '../constant';
import GeneralConstants from '../constant/general';
import { GoogleResourceState } from '../constant/google-kinds';
import { AppActingUser, Change, ChangeList, GA$DriveActivity, GA$QueryDriveActivityResponse, Schema$File, StartPageToken, WebhookRequest } from '../types';
import { tryPromise } from '../utils/utils';

import { manageCommentOnFile } from './webhook-notifications/comments';
import { permissionsChanged } from './webhook-notifications/permissions-change';

export async function manageWebhookCall(call: WebhookRequest): Promise<void> {
    if (call.values.headers['X-Goog-Resource-State'] !== GoogleResourceState.CHANGE) {
        return;
    }

    const paramsd = new URLSearchParams(call.values.rawQuery);
    const userId = paramsd.get('userId');

    const acting_user = {
        id: userId,
    } as AppActingUser;
    call.context = { ...call.context, acting_user };

    const drive: drive_v3.Drive = await getGoogleDriveClient(call);
    const pageToken = await tryPromise<StartPageToken>(drive.changes.getStartPageToken(), ExceptionType.TEXT_ERROR, 'Google failed: ', call);
    const params = {
        pageToken: (Number(pageToken?.startPageToken) - GeneralConstants.REMOVE_ONE).toString(),
        fields: '*',
    };

    const list = await tryPromise<ChangeList>(drive.changes.list(params), ExceptionType.TEXT_ERROR, 'Google failed: ', call);
    const lastChange = head(list.changes) as Change;
    const file = lastChange?.file as Schema$File;
    if (Boolean(file.lastModifyingUser?.me)) {
        return;
    }

    const modifiedTime = moment(file?.modifiedTime);
    const viewedByMeTime = moment(file?.viewedByMeTime);
    const sharedWithMeTime = moment(file?.sharedWithMeTime);

    if (modifiedTime.diff(sharedWithMeTime) >= GeneralConstants.HAS_VALUE) {
        if (Boolean(file?.viewedByMeTime) && modifiedTime.diff(viewedByMeTime) < GeneralConstants.HAS_VALUE) {
            return;
        }
    }

    const activityClient = await getGoogleDriveActivityClient(call);
    const paramsActivity = {
        pageSize: GeneralConstants.PAGE_ONE,
        itemName: `items/${file.id}`,
    };

    const activityRes = await tryPromise<GA$QueryDriveActivityResponse>(activityClient.activity.query({ requestBody: paramsActivity }), ExceptionType.TEXT_ERROR, 'Google failed: ', call);
    const activity = head(activityRes?.activities) as GA$DriveActivity;
    if (Boolean(activity.primaryActionDetail?.permissionChange)) {
        await permissionsChanged(call, file, activity);
        return;
    }

    if (Boolean(activity.primaryActionDetail?.comment)) {
        await manageCommentOnFile(call, file, activity);
    }
}

