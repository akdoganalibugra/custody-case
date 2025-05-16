import express, { Express } from 'express';
import { Server } from 'http';
import config from './config';
import { connectDB } from './database';
import walletRouter from './routes/wallet.routes';
import { errorConverter, errorHandler } from './middleware/error.handler';
import { rabbitMQService } from './services/rabbitmq.service';
import logger from 'morgan';

const app: Express = express();
let server: Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

app.use('/api/v1/wallets', walletRouter);

app.use(errorConverter);
app.use(errorHandler);

(async () => {
    await connectDB();
    try {
        await rabbitMQService.init();
        console.log('Wallet Service RabbitMQ consumer initialized');
    } catch (err) {
        console.error('RabbitMQ init error:', err);
    }

    server = app.listen(config.PORT, () => {
        console.log(`Wallet Service running on port ${config.PORT}`);
    });
})();

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
