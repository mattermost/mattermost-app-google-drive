import { AppCallResponseType, AppExpandLevel, AppFieldType } from '@mattermost/types/lib/apps';

export const AppBindingLocations = {
    POST_MENU_ITEM: '/post_menu',
    CHANNEL_HEADER_ICON: '/channel_header',
    COMMAND: '/command',
    IN_POST: '/in_post',
    EMBEDDED: 'embedded',
};

export const AppBindingPresentations = {
    MODAL: 'modal',
};

export const AppCallResponseTypes: { [name: string]: AppCallResponseType } = {
    OK: 'ok',
    ERROR: 'error',
    FORM: 'form',
    CALL: 'call',
    NAVIGATE: 'navigate',
};

export const AppCallTypes: { [name: string]: string } = {
    SUBMIT: 'submit',
    LOOKUP: 'lookup',
    FORM: 'form',
    CANCEL: 'cancel',
};

export const AppExpandLevels: { [name: string]: AppExpandLevel } = {
    EXPAND_DEFAULT: '',
    EXPAND_NONE: 'none',
    EXPAND_ALL: 'all',
    EXPAND_SUMMARY: 'summary',
};

export const AppFieldTypes: { [name: string]: AppFieldType } = {
    TEXT: 'text',
    STATIC_SELECT: 'static_select',
    DYNAMIC_SELECT: 'dynamic_select',
    BOOL: 'bool',
    USER: 'user',
    CHANNEL: 'channel',
};

export const AppFieldSubTypes: { [name: string]: AppFieldType } = {
    TEXTAREA: 'textarea',
    PASSWORD: 'password',
};
