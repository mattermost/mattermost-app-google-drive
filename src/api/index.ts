import express, { Router } from 'express';

import { Routes } from '../constant';

import { requireSystemAdmin, requireUserOAuthConnected } from '../restapi/middleware';

import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cHelp from './help';
import * as cConfigure from './configure';
import * as cConnect from './connect';
import * as cNotifications from './notification';
import * as cWebhook from './webhook';
import * as cReplyComments from './reply-comments';
import * as cGoogleFiles from './create-files';
import * as cUploadFile from './upload-file';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);
router.post(Routes.App.CallPathHelp, cHelp.getHelp);

// Configure Google Client
router.post(Routes.App.CallPathConfigForm, requireSystemAdmin, cConfigure.configureGoogleClient);
router.post(Routes.App.CallPathUpdateConfigForm, requireSystemAdmin, cConfigure.configureGoogleClient);
router.post(Routes.App.CallPathConfigSubmit, requireSystemAdmin, cConfigure.configureGoogleClientSubmit);

// Connect User's Google account
router.post(`${Routes.App.CallPathConnectSubmit}`, cConnect.getConnectGoogleURL);
router.post(`${Routes.App.OAuthConnectPath}`, cConnect.fOauth2Connect);
router.post(`${Routes.App.OAuthCompletePath}`, cConnect.fOauth2Complete);
router.post(`${Routes.App.CallPathDisconnectSubmit}`, requireUserOAuthConnected, cConnect.doDisconnectGoogle);

// Stop or start Google's notifications
router.post(`${Routes.App.CallPathStartNotifications}`, requireUserOAuthConnected, cNotifications.startGoogleNotifications);
router.post(`${Routes.App.CallPathStopNotifications}`, requireUserOAuthConnected, cNotifications.stopGoogleNotifications);

// Receive notifications
router.post(`${Routes.App.CallPathIncomingWebhookPath}`, cWebhook.filterWebhookNotification);

// Reply to comments
router.post(`${Routes.App.CallPathCommentReplayForm}`, cReplyComments.replyToCommentForm);
router.post(`${Routes.App.CallPathCommentReplaySubmit}`, requireUserOAuthConnected, cReplyComments.replyToCommentSubmit);

// Create new Google Files
router.post(`${Routes.App.CallPathCreateDocument}`, cGoogleFiles.openFormGoogleDocs);
router.post(`${Routes.App.CallPathUpdateDocumentForm}`, cGoogleFiles.openFormGoogleDocs);
router.post(`${Routes.App.CallPathCreateDocumentSubmit}`, requireUserOAuthConnected, cGoogleFiles.executeFormGoogleDocs);

router.post(`${Routes.App.CallPathCreateSpreadsheet}`, cGoogleFiles.openFormGoogleSheets);
router.post(`${Routes.App.CallPathUpdateSpreadsheetForm}`, cGoogleFiles.openFormGoogleSheets);
router.post(`${Routes.App.CallPathCreateSpreadsheetSubmit}`, requireUserOAuthConnected, cGoogleFiles.executeFormGoogleSheets);

router.post(`${Routes.App.CallPathCreatePresentation}`, cGoogleFiles.openFormGoogleSlides);
router.post(`${Routes.App.CallPathUpdatePresentationForm}`, cGoogleFiles.openFormGoogleSlides);
router.post(`${Routes.App.CallPathCreatePresentationSubmit}`, requireUserOAuthConnected, cGoogleFiles.executeFormGoogleSlides);

// Upload files to Drive
router.post(`${Routes.App.CallPathSaveFileCall}`, cUploadFile.uploadFileToDriveCall);
router.post(`${Routes.App.CallPathSaveFileSubmit}`, requireUserOAuthConnected, cUploadFile.uploadFileToDriveSubmit);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
