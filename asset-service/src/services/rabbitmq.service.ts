import amqp, { Channel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import AssetService from './asset.service';

class RabbitMQService {
    private channel!: Channel;
    private readonly requestQueue = 'WALLET_DETAILS_REQUEST';
    private readonly responseQueue = 'WALLET_DETAILS_RESPONSE';
    private correlationMap = new Map();
    private readonly delayedExchange = 'transfer.delayed';
    private readonly executeQueue = 'TRANSFER_EXECUTE';
    private readonly routingKey = 'transfer.execute';

    async start(): Promise<void> {
        await this.init();
        await this.initDelayedExchange();
        this.startConsumer();
        console.log('RabbitMQService fully started');
    }

    async init(): Promise<void> {
        const conn = await amqp.connect(config.msgBrokerURL!);
        this.channel = await conn.createChannel();

        // Assert RPC queues
        await this.channel.assertQueue(this.requestQueue);
        await this.channel.assertQueue(this.responseQueue);
        // Listen for responses
        this.channel.consume(
            this.responseQueue,
            (msg) => {
                if (msg) {
                    const correlationId = msg.properties.correlationId!;
                    const wallet = JSON.parse(msg.content.toString());

                    const callback = this.correlationMap.get(correlationId);
                    if (callback) {
                        callback(wallet);
                        this.correlationMap.delete(correlationId);
                    }
                }
            },
            { noAck: true }
        );
        console.log(
            `RabbitMQ RPC client ready: ${this.requestQueue} -> ${this.responseQueue}`
        );
    }

    // Request wallet details and invoke callback on response
    async requestWalletDetails(
        walletId: string,
        callback: Function
    ): Promise<void> {
        const correlationId = uuidv4();
        this.correlationMap.set(correlationId, callback);
        this.channel.sendToQueue(
            this.requestQueue,
            Buffer.from(JSON.stringify({ walletId })),
            { correlationId }
        );
        // Timeout handling
        setTimeout(() => {
            if (this.correlationMap.has(correlationId)) {
                this.correlationMap.delete(correlationId);
                callback({ found: false });
            }
        }, 5000);
    }

    // Delayed exchange setup
    async initDelayedExchange(): Promise<void> {
        await this.channel.assertExchange(
            this.delayedExchange,
            'x-delayed-message',
            {
                durable: true,
                arguments: { 'x-delayed-type': 'direct' },
            } as any
        );
        await this.channel.assertQueue(this.executeQueue);
        await this.channel.bindQueue(
            this.executeQueue,
            this.delayedExchange,
            this.routingKey
        );
        console.log(
            `Delayed exchange setup: ${this.delayedExchange} -> ${this.executeQueue}`
        );
    }

    // Start consuming delayed messages
    startConsumer(): void {
        this.channel.consume(this.executeQueue, async (msg: any) => {
            if (!msg) return;
            try {
                const payload = JSON.parse(msg.content.toString());
                await AssetService.completeScheduled(payload);
            } catch (err) {
                console.error('Error processing scheduled transfer:', err);
            } finally {
                this.channel.ack(msg);
            }
        });
        console.log(
            `Listening for scheduled executions on ${this.executeQueue}`
        );
    }

    // Publish delayed message via x-delayed-message exchange
    publishDelayed(payload: object, delayMs: number): void {
        this.channel.publish(
            this.delayedExchange,
            this.routingKey,
            Buffer.from(JSON.stringify(payload)),
            { headers: { 'x-delay': delayMs } }
        );
    }
}

export default new RabbitMQService();
