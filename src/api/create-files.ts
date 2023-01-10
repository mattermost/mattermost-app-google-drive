import {
    Request,
    Response,
} from 'express';

import {
    createGoogleDocForm,
    createGoogleDocSubmit,
    createGoogleSheetsForm,
    createGoogleSheetsSubmit,
    createGoogleSlidesForm,
    createGoogleSlidesSubmit,
} from '../forms/create-google-files';
import {
    ExpandAppCallResponse,
} from '../types';
import {
    CallResponseHandler,
    newFormCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import {
    showMessageToMattermost,
} from '../utils/utils';

export const openFormGoogleDocs: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const form = await createGoogleDocForm(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const executeFormGoogleDocs: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await createGoogleDocSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const openFormGoogleSlides: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const form = await createGoogleSlidesForm(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const executeFormGoogleSlides: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await createGoogleSlidesSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const openFormGoogleSheets: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const form = await createGoogleSheetsForm(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const executeFormGoogleSheets: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await createGoogleSheetsSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};
