import { Request, Response } from 'express';

import {
    CallResponseHandler,
    newFormCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { ExpandAppCallResponse } from '../types';
import { googleClientConfigForm, googleClientConfigFormSubmit } from '../forms/configure-google-client';
import { showMessageToMattermost } from '../utils/utils';

export const configureGoogleClient: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const form = await googleClientConfigForm(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const configureGoogleClientSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await googleClientConfigFormSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};