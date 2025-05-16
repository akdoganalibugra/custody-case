import express, { Express } from 'express';
import { Server } from 'http';
import config from './config';
import { connectDB } from './database';
import assetRouter from './routes/asset.routes';
import rabbitmqService from './services/rabbitmq.service';
import { errorConverter, errorHandler } from './middleware/error.handler';
import logger from 'morgan';

const app: Express = express();
let server: Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

app.use('/api/v1/assets', assetRouter);

app.use(errorConverter);
app.use(errorHandler);

(async () => {
    await connectDB();
    await rabbitmqService.start();

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
})();
