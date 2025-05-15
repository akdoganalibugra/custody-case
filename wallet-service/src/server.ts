import express, { Express } from 'express';
import { Server } from 'http';
import config from './config';
import { connectDB } from './database';

const app: Express = express();
let server: Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

server = app.listen(config.PORT, () => {
    console.log(`Wallet Service running on port ${config.PORT}`);
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
