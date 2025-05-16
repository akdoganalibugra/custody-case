import express from 'express';
import proxy from 'express-http-proxy';
import logger from 'morgan';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

const wallets = proxy('http://localhost:8081', {
    proxyReqPathResolver: (req) => `/api/v1/wallets${req.url}`,
});
const assets = proxy('http://localhost:8082', {
    proxyReqPathResolver: (req) => `/api/v1/assets${req.url}`,
});

app.use('/api/v1/wallets', wallets);
app.use('/api/v1/assets', assets);

const server = app.listen(8080, () => {
    console.log('Gateway is Listening to Port 8080');
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
