import * as amqp from 'amqplib';
import config from '../config';
import { walletService } from './wallet.service';

class RabbitMQService {
    private connection: any;
    private channel: any;
    private requestQueue = 'WALLET_DETAILS_REQUEST';
    private responseQueue = 'WALLET_DETAILS_RESPONSE';

    constructor() {
        this.init();
    }

    public async init(): Promise<void> {
        // @ts-ignore: using any to bypass type mismatch in amqplib
        this.connection = await amqp.connect(config.msgBrokerURL!);
        // @ts-ignore: using any to bypass type mismatch in amqplib
        this.channel = await this.connection.createChannel();

        // Asserting queues ensures they exist
        this.channel.assertQueue(this.requestQueue);
        this.channel.assertQueue(this.responseQueue);

        // Start listening for messages on the request queue
        this.channel.consume(this.requestQueue, async (msg: any) => {
            if (msg && msg.content) {
                let response;
                try {
                    const { walletId } = JSON.parse(msg.content.toString());
                    const wallet = await walletService.getById(walletId);
                    response = {
                        found: true,
                        wallet: {
                            address: wallet.address,
                            network: wallet.network,
                        },
                    };
                } catch {
                    response = { found: false, wallet: null };
                }

                // Send the wallet details response
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
