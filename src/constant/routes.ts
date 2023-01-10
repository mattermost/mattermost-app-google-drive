const PathsVariable = {
    Identifier: ':IDENTIFIER',
    Account: ':ACCOUNT',
};

export const AppsPluginName = 'com.mattermost.apps';

const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',
    CallPathHelp: '/help',

    CallPathConfigForm: '/config/form',
    CallPathUpdateConfigForm: '/config/update/form',
    CallPathConfigSubmit: '/config/form/submit',

    CallPathConnectSubmit: '/connect/login/submit',
    OAuthConnectPath: '/oauth2/connect',
    OAuthCompletePath: '/oauth2/complete',
    CallPathDisconnectSubmit: '/connect/disconnect/submit',

    CallPathStartNotifications: '/notifications/start',
    CallPathStopNotifications: '/notifications/stop',

    CallPathIncomingWebhookPath: '/webhook',
    CallPathCommentReplayForm: '/comment/replay/form',
    CallPathCommentReplaySubmit: '/comment/replay/submit',

    CallPathCreateDocument: '/create/document',
    CallPathUpdateDocumentForm: '/create/document/update/form',
    CallPathCreateDocumentSubmit: '/create/document/submit',

    CallPathCreatePresentation: '/create/presentation',
    CallPathUpdatePresentationForm: '/create/presentation/update/form',
    CallPathCreatePresentationSubmit: '/create/presentation/submit',
    CallPathCreateSpreadsheet: '/create/spreadsheet',
    CallPathUpdateSpreadsheetForm: '/create/spreadsheet/update/form',
    CallPathCreateSpreadsheetSubmit: '/create/spreadsheet/submit',

    CallPathSaveFileCall: '/save/file/call',
    CallPathSaveFileSubmit: '/save/file/submit',
};

const MattermostPaths = {
    PathKV: '/kv',
    PathOAuth2App: '/oauth2/app',
    PathOAuth2User: '/oauth2/user',
    UsersUpdateRolePath: `/users/${PathsVariable.Identifier}/roles`,
    PluginsPath: '/plugins',
    CallPath: '/call',
    PostsPath: '/posts',
    PostsEphemeralPath: '/posts/ephemeral',
    PostPath: `/posts/${PathsVariable.Identifier}`,
    UserPath: `/users/${PathsVariable.Identifier}`,
    ChannelPath: `/channels/${PathsVariable.Identifier}`,
    ChannelDirectPath: '/channels/direct',
    MembersPath: '/members',
    ApiVersionV4: '/api/v4',
    ApiVersionV1: '/api/v1',
    UsersIdPath: '/users/ids',
    FilePath: `/files/${PathsVariable.Identifier}`,
    ConfigClientPath: '/config/client',
};

export const Routes = {
    PV: PathsVariable,
    App: AppPaths,
    MM: MattermostPaths,
};
