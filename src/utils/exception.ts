import { ExtendedAppCallRequest } from 'src/types';
import { ExceptionType } from '../constant';

import { logger } from './logger';

export class Exception extends Error {
    constructor(
        public readonly type: ExceptionType,
        public readonly message: string,
        public readonly call: ExtendedAppCallRequest
    ) {
        super(message);

        const siteUrl: string = call.context.mattermost_site_url;
        const requestPath: string = call.path;

        logger.error({ message, siteUrl, requestPath });
    }
}
