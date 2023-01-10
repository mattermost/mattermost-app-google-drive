import { ExtendedAppBinding, ExtendedAppCallRequest } from '../types';

import { getHeaderButtonBindings } from './header_commands';
import { getPostMenuBindings } from './post_menu';
import { getCommandBindings } from './slash_commands';

export async function getAppBindings(callRequest: ExtendedAppCallRequest): Promise<ExtendedAppBinding[]> {
    const bindings: ExtendedAppBinding[] = [];
    bindings.push(await getCommandBindings(callRequest));
    bindings.push(await getHeaderButtonBindings(callRequest));
    bindings.push(await getPostMenuBindings(callRequest));

    return bindings;
}
