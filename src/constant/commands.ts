import manifest from '../manifest.json';
const homepageUrl: string = manifest.homepage_url;

export const Commands = {
    HELP: 'help',
    CREATE: 'create',
    CONFIGURE: 'configure',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NOTIFICATION: 'notification',
    START: 'start',
    STOP: 'stop',
    DOCUMENT: 'document',
    PRESENTATION: 'slide',
    SPREADSHEET: 'sheet',
};
