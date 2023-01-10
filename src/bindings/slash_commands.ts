import {
    AppBindingLocations,
    CommandTrigger,
    Commands,
    GoogleDriveIcon,
} from '../constant';
import {
    AppActingUser,
    ExtendedAppBinding,
    ExtendedAppCallRequest,
    ExtendedAppContext,
    Oauth2App,
} from '../types';
import {
    existsOauth2AppConfig,
    isConnected,
    isUserSystemAdmin,
} from '../utils/utils';

import manifest from '../manifest.json';
import { configureI18n } from '../utils/translations';

import {
    getConfigureBinding,
    getConnectBinding,
    getCreateGoogleFilesBinding,
    getDisconnectBinding,
    getHelpBinding,
    getNotificationBinding,
} from './bindings';

const newCommandBindings = (context: ExtendedAppContext, bindings: ExtendedAppBinding[], commands: string[]): ExtendedAppBinding => {
    const m = manifest;
    const i18nObj = configureI18n(context);

    return {
        app_id: m.app_id,
        label: CommandTrigger,
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                app_id: m.app_id,
                icon: GoogleDriveIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: i18nObj.__('bindings-descriptions.bindings'),
                bindings,
            },
        ],
    };
};

export const getCommandBindings = async (call: ExtendedAppCallRequest): Promise<ExtendedAppBinding> => {
    const actingUser: AppActingUser = call.context.acting_user as AppActingUser;
    const oauth2App: Oauth2App = call.context.oauth2 as Oauth2App;
    const context = call.context as ExtendedAppContext;

    const bindings: ExtendedAppBinding[] = [getHelpBinding(context)];
    const commands: string[] = [Commands.HELP];

    if (isUserSystemAdmin(actingUser)) {
        bindings.push(getConfigureBinding(context));
        commands.push(Commands.CONFIGURE);
    }

    if (await existsOauth2AppConfig(oauth2App)) {
        if (isConnected(oauth2App)) {
            commands.push(Commands.NOTIFICATION);
            bindings.push(getNotificationBinding(context));
            commands.push(Commands.CREATE);
            bindings.push(getCreateGoogleFilesBinding(context));
            commands.push(Commands.DISCONNECT);
            bindings.push(getDisconnectBinding(context));
        } else {
            commands.push(Commands.CONNECT);
            bindings.push(getConnectBinding(context));
        }
    }

    return newCommandBindings(context, bindings, commands);
};
