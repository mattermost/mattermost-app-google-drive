import express, { Express } from 'express';
import bodyParser from 'body-parser';

import morgan from 'morgan';

import config from './config';
import apiRoutes from './api';
import { logger } from './utils/logger';

const serverless = require('serverless-http');

const app: Express = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(morgan('tiny'));
app.use('/', apiRoutes);
app.post('/ping', (req, res) => {
    res.json({});
});

// App released via HTTP and docker
if (config.APP.HOST) {
    const port: number = config.APP.PORT;
    app.listen(port);
    logger.info({ message: 'Listening on ' + port, siteUrl: '', requestPath: 'none', status: 200 });
} else {
    // App released via AWS Lambda
    module.exports.handler = serverless(app);
}
