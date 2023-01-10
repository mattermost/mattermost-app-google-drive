import { AppForm } from '@mattermost/types/lib/apps';
import { Request, Response } from 'express';

import { AppCallResponseTypes } from '../constant';
import { ExpandAppCallResponse } from '../types';

export type FieldValidationErrors = {[name: string]: string};

export type CallResponseHandler = (
    req: Request,
    res: Response & {
        json: (
            callResponse: ExpandAppCallResponse
        ) => void,
    }
) => Promise<void>;

export function newOKCallResponse(): ExpandAppCallResponse {
    return {
        type: AppCallResponseTypes.OK,
    };
}

export function newOKCallResponseWithMarkdown(markdown: string): ExpandAppCallResponse {
    return {
        type: AppCallResponseTypes.OK,
        text: markdown,
    };
}

export function newOKCallResponseWithData(data: unknown): ExpandAppCallResponse {
    return {
        type: AppCallResponseTypes.OK,
        data,
    };
}

export function newFormCallResponse(form: AppForm): ExpandAppCallResponse {
    return {
        type: AppCallResponseTypes.FORM,
        form,
    };
}

export function newErrorCallResponseWithMessage(message: string): ExpandAppCallResponse {
    return {
        type: AppCallResponseTypes.ERROR,
        text: message,
    };
}

export function newErrorCallResponseWithFieldErrors(errors: FieldValidationErrors): ExpandAppCallResponse {
    return {
        type: AppCallResponseTypes.ERROR,
        data: {
            errors,
        },
    };
}
