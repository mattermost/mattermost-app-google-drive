import axios, { AxiosResponse } from 'axios';

import { AppsPluginName, Routes } from '../constant';
import manifest from '../manifest.json';
import { KVStoreOptions, Manifest, Oauth2App, Oauth2CurrentUser } from '../types';

export class KVStoreClient {
    private readonly config: KVStoreOptions;

    constructor(
        config: KVStoreOptions
    ) {
        this.config = config;
    }

    public kvSet(key: string, value: any): Promise<any> {
        const url = `${this.config.mattermostUrl}/plugins/${AppsPluginName}${Routes.MM.ApiVersionV1}${Routes.MM.PathKV}/${key}`;
        return axios.post(url, value, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public kvGet(key: string): Promise<any> {
        const url = `${this.config.mattermostUrl}/plugins/${AppsPluginName}${Routes.MM.ApiVersionV1}${Routes.MM.PathKV}/${key}`;
        return axios.get(url, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public storeOauth2User(currentUser: Oauth2CurrentUser | object): Promise<any> {
        const url = `${this.config.mattermostUrl}/plugins/${AppsPluginName}${Routes.MM.ApiVersionV1}${Routes.MM.PathOAuth2User}`;
        return axios.post(url, currentUser, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public storeOauth2App(data: Oauth2App): Promise<any> {
        const m: Manifest = manifest;
        const url = `${this.config.mattermostUrl}/plugins/${AppsPluginName}${Routes.MM.ApiVersionV1}${Routes.MM.PathOAuth2App}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }
}
