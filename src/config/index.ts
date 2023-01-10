require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT) || 4005,
        HOST: process.env.HOST || '',
    },
    GOOGLE: {
        URL: 'https://www.googleapis.com',
        SCOPES: 'https://www.googleapis.com/auth',
    },
};
