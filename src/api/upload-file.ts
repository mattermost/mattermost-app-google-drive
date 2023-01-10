import {
    Request,
    Response,
} from 'express';

import {
    uploadFileConfirmationCall,
    uploadFileConfirmationSubmit,
} from '../forms/upload-google';
import {
    ExpandAppCallResponse,
} from '../types';
import {
    CallResponseHandler,
    newFormCallResponse,
    newOKCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import {
    showMessageToMattermost,
} from '../utils/utils';

export const uploadFileToDriveCall: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const form = await uploadFileConfirmationCall(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const uploadFileToDriveSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await uploadFileConfirmationSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};
