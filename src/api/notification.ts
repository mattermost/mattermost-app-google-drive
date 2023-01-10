import { Request, Response } from 'express';

import { startNotificationsCall, stopNotificationsCall } from '../forms/google-notifications';
import { ExpandAppCallResponse } from '../types';
import { CallResponseHandler, newOKCallResponseWithMarkdown } from '../utils/call-responses';
import { showMessageToMattermost } from '../utils/utils';

export const startGoogleNotifications: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await startNotificationsCall(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const stopGoogleNotifications: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await stopNotificationsCall(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};
