import { ExtendedAppContext } from './apps';
import { ChannelWatchHeaders } from './google';

export type UserNotifyProps = {
    channel: string;
    comments: string;
    desktop: string;
    desktop_sound: string;
    desktop_threads: string;
    email: string;
    email_thread: string;
    first_name: string;
    mention_keys: string;
    push: string;
    push_status: string;
    push_threads: string;
}

export type UserTimezone = {
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
};

export type UserProfile = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    auth_data: string;
    auth_service: string;
    email: string;
    nickname: string;
    first_name: string;
    last_name: string;
    position: string;
    roles: string;
    allow_marketing: boolean;
    notify_props: UserNotifyProps;
    last_password_update: number;
    locale: string;
    timezone?: UserTimezone;
}

export type BindingOptions = {
    isSystemAdmin: boolean,
    isConfigured: boolean,
    isConnected: boolean
    mattermostSiteUrl: string
}

export type User = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    auth_data: string;
    auth_service: string;
    email: string;
    nickname: string;
    first_name: string;
    last_name: string;
    position: string;
    roles: string;
    last_picture_update: number;
    locale: string;
    timezone: {
        automaticTimezone: string;
        manualTimezone: string;
        useAutomaticTimezone: string;
    };
    is_bot: boolean;
    bot_description: string;
    disable_welcome_email: false;
};

export type Channel = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    team_id: string;
    type: string,
    display_name: string;
    name: string;
    header: string;
    purpose: string;
    last_post_at: number;
    total_msg_count: number;
    extra_update_at: number;
    creator_id: string;
};

export type ChannelMember = {
    channel_id: string,
    user_id: string,
    roles: string,
    last_viewed_at: number,
    msg_count: number,
    mention_count: number,
    mention_count_root: number,
    msg_count_root: number,
    notify_props: {
        desktop: string,
        email: string
        ignore_channel_mentions: string
        mark_unread: string
        push: string
    },
    last_update_at: number,
    scheme_guest: boolean,
    scheme_user: boolean,
    scheme_admin: boolean,
    explicit_roles: string
}

export type AttachmentOption = {
    text: string;
    value: string;
};

export type AttachmentAction = {
    id: string;
    name: string;
    type: string;
    style?: string;
    data_source?: string;
    integration: {
        url: string;
        context: any;
    };
    options?: AttachmentOption[];
}

export type Metadata_File = {
    id: string,
    user_id: string,
    post_id: string,
    channel_id: string,
    create_at: number,
    update_at: number,
    delete_at: number,
    name: string,
    extension: string,
    size: number,
    mime_type: string,
    mini_preview: any,
    remote_id: string,
    archived: boolean
}

export type Attachment = {
    text?: string;
    title?: string;
    author_icon?: string;
    author_name?: string;
    title_link?: string;
    thumb_url?: string;
    footer?: string;
    footer_icon?: string;
    ts?: number;
    fields?: {
        short: boolean;
        title: string;
        value: string;
    }[];
    actions?: AttachmentAction[]
};

export type PostCreate = {
    channel_id: string;
    message: string;
    user_id?: string;
    root_id?: string;
    file_ids?: string[];
    props?: {
        attachments?: Attachment[];
        app_bindings?: any[];
    }
}

export type PostEphemeralCreate = {
    user_id: string;
    post: PostCreate;
}

export type PostResponse = {
    id: string,
    create_at: number,
    update_at: number,
    edit_at: 0,
    delete_at: 0,
    is_pinned: false,
    user_id: string,
    channel_id: string,
    root_id: string,
    original_id: string,
    message: string,
    props: { attachments: Attachment[]; },
    type: string,
    hashtags: string,
    file_ids: string[],
    pending_post_id: string,
    reply_count: number,
    last_reply_at: number,
    participants: any,
    metadata: {
        files: Metadata_File[]
    }
}

export type PostUpdate = {
    id: string;
    is_pinned?: boolean;
    message?: string;
    has_reactions?: boolean;
    props?: {
        attachments: Attachment[];
    }
}

export type MattermostOptions = {
    mattermostUrl: string;
    accessToken: string | null | undefined;
}

export type GoogleWebhook = {
    data: string,
    headers: ChannelWatchHeaders,
    httpMethod: 'POST' | 'GET',
    rawQuery: string,
}

export type WebhookRequest = {
    path: '/webhook',
    values: GoogleWebhook,
    context: ExtendedAppContext;
}

export type ObjectId = {
    id: string
}
export type PostBasicData = {
    message: string,
    description: string
}

export type StateCommentPost = {
    comment: ObjectId,
    file: ObjectId
}