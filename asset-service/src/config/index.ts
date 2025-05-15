import { config } from 'dotenv';

const configFile = `./.env`;
config({ path: configFile });

const { MONGO_URI, PORT, MESSAGE_BROKER_URL, NODE_ENV } = process.env;

export default {
    MONGO_URI,
    PORT,
    msgBrokerURL: MESSAGE_BROKER_URL,
    env: NODE_ENV,
};
