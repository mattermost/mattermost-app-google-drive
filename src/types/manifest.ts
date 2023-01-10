export type Manifest = {
    app_id: string;
    version: string;
    homepage_url: string;
    display_name: string;
    description: string;
    icon: string;
    on_disable?: {
        path: string
    },
    on_enable?: {
        path: string
    },
    on_install?: {
        expand: {
            app: string
        },
        path: string
    },
    on_uninstall?: {
        expand: {
            app: string
        },
        path: string
    },
    bindings: {
        path: string,
        expand: {
            acting_user: string
        }
    },
    requested_permissions: string[];
    requested_locations: string[];
    http: {
        root_url: string;
    },
    aws_lambda?: {
        functions: {
            path: string;
            name: string;
            handler: string;
            runtime: string;
        }[];
    }
}
