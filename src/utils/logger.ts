import path from 'path';

import { createLogger, format, transports } from 'winston';

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
const customFormat = format.combine(
    format.timestamp(),
    format.printf((info) => {
        return JSON.stringify({
            level: info.level,
            message: info.message,
            request_path: info.requestPath,
            site_url: info.siteUrl,
            status: info.status,
            timestamp: info.timestamp,
        });
    })

    /*
    EXAMPLE OF LOG:
        {"level":"error","message":"Error: This command is only available for Mattermost System Admin","request_path":"/config/form","site_url":"https://d3b8-2806-2f0-9081-ffb7-b9b9-eae5-d19c-1b12.ngrok.io","status":200,"timestamp":"2023-01-06T22:25:04.626Z"}
     */
);

export const logger = createLogger({
    levels: logLevels,
    format: customFormat,
    transports: [new transports.Console()],
});