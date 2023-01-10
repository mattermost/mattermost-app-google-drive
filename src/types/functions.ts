import { ExtendedAppCallRequest } from './apps';
import { Schema$File } from './google';

export type ShareFileFunction = (call: ExtendedAppCallRequest, file: Schema$File, channelId: string) => void;