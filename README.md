# Mattermost/Google Drive Integration

* [Feature summary](#feature-summary)
* [Set up](#set-up)
    * [Installation HTTP](#installation-http)
    * [Installation Mattermost Cloud](#installation-mattermost-cloud)
    * [Create a Google Cloud Project](#create-a-google-cloud-project)
    * [Configuration](#configuration)
* [Admin guide](#admin-guide)
    * [Slash commands](#slash-commands)
* [End user guide](#end-user-guide)
    * [Get started](#get-started)
    * [Use /drive commands](#use-drive-commands)
    * [Post menu bindings](#post-menu-bindings)
* [Development](#development-environment)
    * [Manual installation](#manual-installation)
    * [Install dependencies](#install-dependencies)
    * [Run the local development environment](#run-the-local-development-environment)
    * [Run the local development environment with Docker](#run-the-local-development-environment-with-docker)

# Feature summary

This application allows you to integrate Google Drive to your Mattermost instance, letting you:

- Create a Google Drive file
- Share a Google Drive file
- View and reply to comments
- Publish on Google Drive any file attached to a Mattermost post
- Enable or disable notifications for all files

# Set up

## Installation HTTP

To install, as a Mattermost system admin user, run the command ``/apps install http GOOGLE_API_URL`` in any channel. The ``/drive`` command should be available after the configuration has been successfully installed.

The ``GOOGLE_API_URL`` should be replaced with the URL where the Google Drive API instance is running. Example: ``/apps install http https://myapp.com/manifest.json``

## Installation Mattermost Cloud

To install, as a Mattermost system admin user, run the command ``/apps install listed drive`` in any channel. The ``/drive`` command should be available after the configuration has been successfully installed.

## Create a Google Cloud Project

1. Create a new Project. You would need to redirect to [Google Cloud Console](https://console.cloud.google.com/home/dashboard) and select the option to **New project**. Then, select the name and the organization (optional).
2. Select APIs. After creating a project, on the left side menu on **APIs & Services**, then, select the first option **Enabled APIs & Services** and wait, the page will redirect. 
3. From the left menu select **Library** and activate: 
    - Google Drive API
    - Google Docs API
    - Google Slides API
    - Google Sheets API
    - Google Drive Activity API
4. Go back to **APIs & Services** menu.
5. Create a new OAuth consent screen. Select the option **OAuth consent screen**  on the menu bar. If you would like to limit your application to organization-only users, select **Internal**, otherwise, select **External** option, then, fill the form with the data you would use for your project.
6. Go back to **APIs & Services** menu.
7. Create a new Client. Select the option **Credentials**, and on the menu bar, select **Create credentials**, a dropdown menu will be displayed, then, select **OAuth Client ID** option. 
8. Then, a select input will ask the type of Application type that will be used, select **Web application**, then, fill the form, and on **Authorized redirect URIs** introduce this URI:
    https://<your_mattermost_instance>/plugins/com.mattermost.apps/apps/google-drive/oauth2/remote/complete
9. After the Client has been configured, on the main page of **Credentials**, on the submenu **OAuth 2.0 Client IDs** will be displayed the new Client and the info can be accessible whenever you need it.

## Configuration

After [installing](#installation)) the app and [creating a project](#create-a-google-cloud-project)):
1. As a Mattermost system admin user, run the ``/drive configure`` command.
2. In the configuration modal, enter your Client ID, Client Secret and Service Account.
    - Client ID and Client Secret: Used to generate the link to let the user connect with their Google Drive account.
    - Service Account: Is the way the app will get the credentials to manage webhook notifications


# Admin guide

## Slash commands
- ``/drive configure:``: This command will enable the connect and disconnect commands which allow the user to link with their Google Drive account. You're prompted to provide a Client ID and Client Secret.


# End user guide

## Get started

## Use ``/drive`` commands

- ``/drive help``: This command will show all current commands available for this application.
- ``/drive connect``: This command will create a new link, and clicking on that link redirects the user to select the Google account that will be used to execute all the available actions.
- ``/drive create [docs | slide | sheets]``: This command will display a new modal where the data will be asked. 
    - Title: Name of the file to be created.
    - Message: Optional. Applicable only if a file is shared in the channel.
    - File Access: Choose to share with members in the channel, with anyone who has the link, or choose to keep it private.
- ``/drive notifications [start | stop]``: This command will start or stop notification. After a user runs the ``/drive connect`` command, notifications will be posted to the private channel with the user.


## Post menu bindings

- ``Save file on Drive:``: This option is available in any post to validate that the selected post has any files on it. If the post has any files, a new modal prompts the user select the files to upload. Following the upload, a new post will appear as part of the thread to notify you about the action.

# Development environment

## Manual installation

*  Download the latest repository release.

### Run the local development environment

* A minimum of node version 12 is required, and up to node version 18 is supported. You can download the latest LTS version of node for the required operating system here https://nodejs.org/es/download/

### Install dependencies
* Move to the project directory or execute ``cd`` command to the project directory and execute ``npm install`` with a terminal to download all dependency libraries.

```
$ npm install
```

*  Update the environment configuration file. The ``.env`` file must be modified or added to set the environment variables, it must be in the root of the repository.

```
file: .env

PROJECT=mattermost-app-google-drive
PORT=4005
HOST=http://localhost:4005
```

Variable definition

- PROJECT: Optional. When executing the project with Docker using the ``.build.sh`` file, this variable will be used for the name of the container.
- PORT: Port number on which the Google Drive API integration is listening.
- HOST: Optional. Google Drive API usage domain URL.

* Finally, the project must be executed.

```
$ npm run dev
```

Or, if you would like to use the Makefile command:

```
$ make watch
```

### Run the local development environment with Docker

* You need to have Docker installed. You can find the necessary steps to install Docker for the following operating systems:

[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Mac](https://docs.docker.com/desktop/mac/install/)
[Windows](https://docs.docker.com/desktop/windows/install/)

* Once you have Docker installed, the next step would be to run the ``make run-server`` command to create the API container and expose it locally or on the server, depending on the case required.

```
$ make run
```

When the container is created correctly, the API will be running at the url http://127.0.0.1:4005. If Mattermost is running on the same machine, run this slash command in Mattermost to install the app:

```
/apps install http http://127.0.0.1:4005
```

To stop the container, execute:

```
$ make stop
```
