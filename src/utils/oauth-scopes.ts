import { GoogleScopes } from '../constant/google-scopes';
import config from '../config';

export const getGoogleOAuthScopes = () => {
    const routes = Object.values(GoogleScopes);
    const scopes: string[] = [];
    routes.forEach((access) => scopes.push(`${config.GOOGLE.SCOPES}${access}`));

    return scopes;
};
