import express, { Express } from 'express';
import { Server } from 'http';
import config from './config';
import logger from 'morgan';

const app: Express = express();
let server: Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

server = app.listen(config.PORT, () => {
    console.log(`Asset Service running on port ${config.PORT}`);
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
    console.error('Unexpected error:', error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
