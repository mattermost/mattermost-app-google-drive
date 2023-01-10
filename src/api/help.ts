import { Request, Response } from 'express';

import { Commands } from '../constant';
import manifest from '../manifest.json';
import { AppActingUser, ExpandAppCallResponse, ExtendedAppContext, Oauth2App } from '../types';
import { newOKCallResponseWithMarkdown } from '../utils/call-responses';
import { addBulletSlashCommand, h5, joinLines } from '../utils/markdown';
import { configureI18n } from '../utils/translations';
import { existsOauth2AppConfig, isConnected, isUserSystemAdmin } from '../utils/utils';

export const getHelp = async (request: Request, response: Response) => {
    const context = request.body.context as ExtendedAppContext;

    const helpText: string = await getCommands(context);
    const callResponse: ExpandAppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(context: ExtendedAppContext): string {
    const i18nObj = configureI18n(context);
    return h5(i18nObj.__('help-binding.title'));
}

async function getCommands(context: ExtendedAppContext): Promise<string> {
    const i18nObj = configureI18n(context);
    const homepageUrl: string = manifest.homepage_url;
    const actingUser: AppActingUser = context.acting_user as AppActingUser;
    const oauth2App: Oauth2App = context.oauth2 as Oauth2App;
    const commands: string[] = [];

    commands.push(addBulletSlashCommand(Commands.HELP, i18nObj.__('help-binding.descriptions.help', { homepageUrl })));

    if (isUserSystemAdmin(actingUser)) {
        commands.push(addBulletSlashCommand(Commands.CONFIGURE, i18nObj.__('help-binding.descriptions.configure')));
    }

    if (await existsOauth2AppConfig(oauth2App)) {
        if (isConnected(oauth2App)) {
            commands.push(addBulletSlashCommand(`${Commands.NOTIFICATION} [${Commands.START} | ${Commands.STOP}]`, i18nObj.__('help-binding.descriptions.notification')));
            commands.push(addBulletSlashCommand(`${Commands.CREATE} [${Commands.DOCUMENT} | ${Commands.PRESENTATION} | ${Commands.SPREADSHEET}]`, i18nObj.__('help-binding.descriptions.create')));
            commands.push(addBulletSlashCommand(Commands.DISCONNECT, i18nObj.__('help-binding.descriptions.disconnect')));
        } else {
            commands.push(addBulletSlashCommand(Commands.CONNECT, i18nObj.__('help-binding.descriptions.connect')));
        }
    }

    return `${joinLines(...commands)}`;
}
