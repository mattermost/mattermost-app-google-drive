import {
    AppBinding,
    AppCallRequest,
    AppCallResponse,
    AppContext,
    AppExpand,
    AppExpandLevel,
    AppField,
    AppForm,
    AppManifest,
    AppSelectOption,
} from '@mattermost/types/lib/apps';

import { Oauth2Data } from './kv-store';

export type ExtendedAppManifest = AppManifest & {
    root_url?: string;
    http?: any;
}

export declare type ExtendedAppExpand = AppExpand & {
    oauth2_app?: AppExpandLevel;
    oauth2_user?: AppExpandLevel;
    locale?: AppExpandLevel;
    acting_user_access_token?: AppExpandLevel;
};

export declare type ExtendedAppCall = {
    path: string;
    expand?: ExtendedAppExpand;
    state?: any;
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type ExtendedAppBinding = Omit<AppBinding, 'app_id' | 'bindings'> & {
    bindings?: ExtendedAppBinding[];
    submit?: ExtendedAppCall;
    app_id?: string;
}

export type Oauth2CurrentUser = {
    refresh_token: string,
    user_email?: string;
}

export type Oauth2App = {
    client_id: string;
    client_secret: string;
    connect_url?: string;
    complete_url?: string;
    user?: Oauth2CurrentUser;
    data?: Oauth2Data;
}

export type AppActingUser = {
    id: string,
    delete_at: number,
    username: string,
    auth_service: string,
    email: string,
    nickname: string,
    first_name: string,
    last_name: string,
    position: string,
    roles: string,
    locale: string,
    timezone: any,
    disable_welcome_email: boolean
}

export type ExtendedAppContext = AppContext & {
    locale: string;
    oauth2: Oauth2App;
    acting_user: AppActingUser;
    acting_user_access_token?: string;
    mattermost_site_url: string;
    bot_user_id: string,
    bot_access_token: string;
    post: any;
    channel: any;
    app_path: string;
    app: any;
}

export type ExtendedAppCallRequest = AppCallRequest & {
    context: ExtendedAppContext;
};

export type ExpandAppCallResponse<Res = unknown> = AppCallResponse<Res> & {
    call?: ExtendedAppCall;
};

export type ExpandAppForm = AppForm & {
    submit?: ExtendedAppCall;
    source?: ExtendedAppCall;
}

export type ExpandAppField = AppField & {
    placeholder?: string;
}

export type ChannelNotification = {
    channelId: string,
    resourceId: string,
}