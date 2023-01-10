import { AppExpandLevels, Commands, GoogleDriveIcon, Routes } from '../constant';
import { ExtendedAppBinding, ExtendedAppContext } from '../types';
import { configureI18n } from '../utils/translations';

export const getHelpBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.HELP,
        icon: GoogleDriveIcon,
        description: i18nObj.__('bindings-descriptions.help'),
        submit: {
            path: Routes.App.CallPathHelp,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getConfigureBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        icon: GoogleDriveIcon,
        label: Commands.CONFIGURE,
        description: i18nObj.__('bindings-descriptions.configure'),
        submit: {
            path: Routes.App.CallPathConfigForm,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getConnectBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        icon: GoogleDriveIcon,
        label: Commands.CONNECT,
        description: i18nObj.__('bindings-descriptions.connect'),
        submit: {
            path: Routes.App.CallPathConnectSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getDisconnectBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        icon: GoogleDriveIcon,
        label: Commands.DISCONNECT,
        description: i18nObj.__('bindings-descriptions.disconnect'),
        submit: {
            path: Routes.App.CallPathDisconnectSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getNotificationBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    const subCommands: string[] = [
        Commands.START,
        Commands.STOP,
    ];

    const bindings: ExtendedAppBinding[] = [];
    bindings.push(getNotificationStartBinding(context));
    bindings.push(getNotificationStopBinding(context));

    return {
        icon: GoogleDriveIcon,
        label: Commands.NOTIFICATION,
        description: i18nObj.__('bindings-descriptions.notification'),
        hint: `[${subCommands.join(' | ')}]`,
        bindings,
    };
};

export const getNotificationStartBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        icon: GoogleDriveIcon,
        label: Commands.START,
        description: i18nObj.__('bindings-descriptions.notification-start'),
        submit: {
            path: Routes.App.CallPathStartNotifications,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                app: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getNotificationStopBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        icon: GoogleDriveIcon,
        label: Commands.STOP,
        description: i18nObj.__('bindings-descriptions.notification-stop'),
        submit: {
            path: Routes.App.CallPathStopNotifications,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getCreateGoogleFilesBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    const commands: string[] = [
        Commands.DOCUMENT,
        Commands.PRESENTATION,
        Commands.SPREADSHEET,
    ];

    const bindings: ExtendedAppBinding[] = [];
    bindings.push(getCreateDocumentBinding(context));
    bindings.push(getCreatePresentationBinding(context));
    bindings.push(getCreateSpreadsheetBinding(context));

    return {
        icon: GoogleDriveIcon,
        label: Commands.CREATE,
        description: i18nObj.__('bindings-descriptions.create'),
        hint: `[${commands.join(' | ')}]`,
        bindings,
    };
};

export const getCreateDocumentBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.DOCUMENT,
        description: i18nObj.__('bindings-descriptions.create-document'),
        icon: GoogleDriveIcon,
        submit: {
            path: Routes.App.CallPathCreateDocument,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getCreatePresentationBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.PRESENTATION,
        description: i18nObj.__('bindings-descriptions.create-slide'),
        icon: GoogleDriveIcon,
        submit: {
            path: Routes.App.CallPathCreatePresentation,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const getCreateSpreadsheetBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.SPREADSHEET,
        description: i18nObj.__('bindings-descriptions.create-sheet'),
        icon: GoogleDriveIcon,
        submit: {
            path: Routes.App.CallPathCreateSpreadsheet,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                app: AppExpandLevels.EXPAND_SUMMARY,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};

export const saveFileOnDriveBinding = (context: ExtendedAppContext): ExtendedAppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: i18nObj.__('bindings-descriptions.save-file'),
        icon: GoogleDriveIcon,
        submit: {
            path: Routes.App.CallPathSaveFileCall,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                post: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
};
