import { AppBindingLocations, CommandTrigger } from '../constant';
import manifest from '../manifest.json';
import { ExtendedAppBinding, ExtendedAppCallRequest, ExtendedAppContext } from '../types';

import { getHelpBinding } from './bindings';

const newHeaderButtonBindings = (bindings: ExtendedAppBinding[]): ExtendedAppBinding => {
    const m = manifest;
    return {
        app_id: m.app_id,
        label: CommandTrigger,
        location: AppBindingLocations.CHANNEL_HEADER_ICON,
        bindings,
    };
};

export const getHeaderButtonBindings = async (call: ExtendedAppCallRequest): Promise<ExtendedAppBinding> => {
    const bindings: ExtendedAppBinding[] = [];
    const context = call.context as ExtendedAppContext;

    bindings.push(getHelpBinding(context));

    return newHeaderButtonBindings(bindings);
};
