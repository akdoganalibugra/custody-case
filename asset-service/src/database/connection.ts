import mongoose from 'mongoose';
import config from '../config';

export const connectDB = async (): Promise<void> => {
    try {
        console.info('Connecting to database...');
        await mongoose.connect(config.MONGO_URI!);
        console.info('Database connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
