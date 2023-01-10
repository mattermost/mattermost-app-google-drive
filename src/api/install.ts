import { Request, Response } from 'express';

import manifest from '../manifest.json';
import { ExpandAppCallResponse, ExtendedAppCallRequest, ExtendedAppContext } from '../types';
import { newOKCallResponseWithMarkdown } from '../utils/call-responses';
import { configureI18n } from '../utils/translations';

export const getInstall = async (request: Request, response: Response) => {
    const call: ExtendedAppCallRequest = request.body;

    const helpText: string = getCommands(call.context);
    const callResponse: ExpandAppCallResponse = newOKCallResponseWithMarkdown(helpText);

    response.json(callResponse);
};

function getCommands(context: ExtendedAppContext): string {
    const i18nObj = configureI18n(context);

    const homepageUrl: string = manifest.homepage_url;
    return i18nObj.__('install.message', { homepageUrl }) + '\n';
}
