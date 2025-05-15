import express from 'express';
import config from './config';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(config.PORT, () => {
    console.log(`Wallet Service running on port ${config.PORT}`);
});

// Graceful shutdown
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
