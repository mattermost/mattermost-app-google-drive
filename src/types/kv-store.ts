import { AppSelectOption } from '@mattermost/types/lib/apps';

import { ConfigureClientForm } from '../constant';

import { Oauth2CurrentUser } from './apps';

export interface KVStoreOptions {
    mattermostUrl: string;
    accessToken: string;
}

export interface KVStoreProps {
    [ConfigureClientForm.CLIENT_ID]: string;
    [ConfigureClientForm.CLIENT_SECRET]: string;
    [ConfigureClientForm.MODE]?: string | AppSelectOption;
    [ConfigureClientForm.SERVICE_ACCOUNT]?: string;
    [ConfigureClientForm.API_KEY]?: string;
}

export interface Oauth2Data {
    [ConfigureClientForm.MODE]: string | AppSelectOption;
    [ConfigureClientForm.SERVICE_ACCOUNT]: string;
    [ConfigureClientForm.API_KEY]: string;
}

export interface KVGoogleUser {
    [userId: string]: Oauth2CurrentUser
}

export interface KVGoogleData {
    userData: KVGoogleUser[]
}
