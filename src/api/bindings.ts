import { Request, Response } from 'express';

import { getAppBindings } from '../bindings';
import { ExpandAppCallResponse, ExtendedAppBinding } from '../types';
import { newOKCallResponseWithData } from '../utils/call-responses';

export const getBindings = async (request: Request, response: Response) => {
    const callRequest = request.body;
    const bindings: ExtendedAppBinding[] = await getAppBindings(callRequest);
    const callResponse: ExpandAppCallResponse = newOKCallResponseWithData(bindings);

    response.json(callResponse);
};

