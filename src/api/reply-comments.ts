import { Request, Response } from 'express';

import {
    manageReplyCommentSubmit,
    openFormReplyComment,
} from '../forms/comment-reply';
import { ExpandAppCallResponse } from '../types';
import { CallResponseHandler, newFormCallResponse, newOKCallResponseWithMarkdown } from '../utils/call-responses';
import { showMessageToMattermost } from '../utils/utils';

export const replyToCommentForm: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const form = await openFormReplyComment(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const replyToCommentSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: ExpandAppCallResponse;

    try {
        const message = await manageReplyCommentSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};
