import { Request, Response } from 'express';

import { Manifest } from '../types';
import manifest from '../manifest.json';
import { getHTTPPath } from '../utils/utils';

export function getManifest(request: Request, response: Response): void {
    const m: Manifest = manifest;

    m.http.root_url = getHTTPPath();

    response.json(m);
}
