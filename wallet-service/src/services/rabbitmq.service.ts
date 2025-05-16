import * as amqp from 'amqplib';
import config from '../config';
import { walletService } from './wallet.service';

class RabbitMQService {
    private connection: any;
    private channel: any;
    private requestQueue = 'WALLET_DETAILS_REQUEST';
    private responseQueue = 'WALLET_DETAILS_RESPONSE';

    constructor() {}

    async init(): Promise<void> {
        // @ts-ignore: using any to bypass type mismatch in amqplib
        this.connection = await amqp.connect(config.msgBrokerURL!);
        // @ts-ignore: using any to bypass type mismatch in amqplib
        this.channel = await this.connection.createChannel();

        // Asserting queues ensures they exist before consuming
        await this.channel.assertQueue(this.requestQueue, { durable: true });
        await this.channel.assertQueue(this.responseQueue, { durable: true });

        // Start listening for messages on the request queue
        this.channel.consume(this.requestQueue, async (msg: any) => {
            if (msg && msg.content) {
                console.log('RPC request received:', msg.content.toString());
                let response;
                try {
                    const { address } = JSON.parse(msg.content.toString());
                    const wallet = await walletService.findByAddress(address);
                    response = {
                        found: true,
                        wallet: {
                            id: wallet._id,
                            address: wallet.address,
                            network: wallet.network,
                        },
                    };
                } catch {
                    response = { found: false, wallet: null };
                }
                // Send the wallet details response
                console.log('Sending RPC response:', JSON.stringify(response));
                this.channel.sendToQueue(
                    this.responseQueue,
                    Buffer.from(JSON.stringify(response)),
                    { correlationId: msg.properties.correlationId }
                );
                // Acknowledge the processed message
                this.channel.ack(msg);
            }
        });
    }
}

export const rabbitMQService = new RabbitMQService();
