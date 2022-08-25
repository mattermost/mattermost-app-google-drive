import { ExceptionType, Routes } from "../constant";
import { AppCallRequest, GoogleToken, Oauth2App, Oauth2CurrentUser, StartPageToken } from "../types";
import { getOAuthGoogleClient } from "../utils/google-client";
import { tryPromise } from "../utils/utils";
import {
   drive_v3,
   Auth,     
} from 'googleapis';
import { GoogleKindsAPI } from "../constant/google-kinds";
import { v4 as uuidv4 } from 'uuid';

export async function stopNotificationsCall(call: AppCallRequest): Promise<string> {
   const oauth2Token = call.context.oauth2?.user as Oauth2CurrentUser;

   const oauth2Client = await getOAuthGoogleClient(call);
   oauth2Client.setCredentials(<Oauth2CurrentUser>oauth2Token);
   await tryPromise(oauth2Client.refreshAccessToken(), ExceptionType.MARKDOWN, 'Google failed: ');

   return 'Google notifications are disabled!';
}

export async function startNotificationsCall(call: AppCallRequest): Promise<string> {
   const mattermostUrl: string | undefined = call.context.mattermost_site_url;
   //const mattermostUrl = 'https://a2e2-189-203-193-1.ngrok.io'; // Change when in production
   const appPath: string | undefined = call.context.app_path;
   const whSecret: string | undefined = call.context.app?.webhook_secret;
   const actingUser: string | undefined = call.context.acting_user?.id;

   const oauth2Token = call.context.oauth2?.user as Oauth2CurrentUser;

   const oauth2Client = await getOAuthGoogleClient(call);
   oauth2Client.setCredentials(oauth2Token);
   await tryPromise(oauth2Client.refreshAccessToken(), ExceptionType.MARKDOWN, 'Google failed: ');
   
   const drive = new drive_v3.Drive({
      auth: oauth2Client
   });

   const pageToken = await tryPromise<StartPageToken>(drive.changes.getStartPageToken(), ExceptionType.TEXT_ERROR, 'Google failed: ');
   
   const urlWithParams = new URL(`${mattermostUrl}${appPath}${Routes.App.CallPathIncomingWebhookPath}`);
   urlWithParams.searchParams.append('secret', <string>whSecret);
   urlWithParams.searchParams.append('userId', <string>actingUser);

   const params = {
      pageToken: <string>pageToken.startPageToken,
      requestBody: {
         kind: GoogleKindsAPI.CHANNEL,
         id: uuidv4(),
         address: urlWithParams.href,
         type: "web_hook"
      }
   }
   
   await tryPromise(drive.changes.watch(params), ExceptionType.TEXT_ERROR, 'Google failed: ');
   return 'Google notifications are enabled!';
}