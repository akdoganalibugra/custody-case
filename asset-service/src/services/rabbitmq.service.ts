import amqp, { Channel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import AssetService from './asset.service';

class RabbitMQService {
    private channel!: Channel;
    private requestQueue = 'WALLET_DETAILS_REQUEST';
    private responseQueue = 'WALLET_DETAILS_RESPONSE';
    private correlationMap = new Map();
    private delayedExchange = 'transfer.delayed';
    private executeQueue = 'TRANSFER_EXECUTE';
    private routingKey = 'transfer.execute';

    async start(): Promise<void> {
        await this.init();
        await this.initDelayedExchange();
        this.startConsumer();
        console.log('RabbitMQService fully started');
    }

    async init(): Promise<void> {
        const conn = await amqp.connect(config.msgBrokerURL!);
        this.channel = await conn.createChannel();

        // Assert RPC queues before consumption
        await this.channel.assertQueue(this.requestQueue, { durable: true });
        await this.channel.assertQueue(this.responseQueue, { durable: true });
        // Listen for responses
        this.channel.consume(
            this.responseQueue,
            (msg) => {
                if (msg) {
                    const correlationId = msg.properties.correlationId!;
                    const content = msg.content.toString();
                    console.log(
                        `RPC response received (correlationId=${correlationId}): ${content}`
                    );
                    const wallet = JSON.parse(content);

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
        address: string,
        callback: Function
    ): Promise<void> {
        const correlationId = uuidv4();
        this.correlationMap.set(correlationId, callback);
        const payload = { address };
        console.log(
            `Sending RPC request (correlationId=${correlationId}): ${JSON.stringify(
                payload
            )}`
        );
        this.channel.sendToQueue(
            this.requestQueue,
            Buffer.from(JSON.stringify(payload)),
            { correlationId }
        );
        // Timeout handling
        setTimeout(() => {
            if (this.correlationMap.has(correlationId)) {
                console.warn(
                    `RPC request timeout (correlationId=${correlationId})`
                );
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
            const payload = JSON.parse(msg.content.toString());
            console.log(
                `Scheduled transfer triggered at ${new Date().toISOString()}`,
                payload
            );
            try {
                await AssetService.completeScheduled(payload);
                console.log(
                    `Scheduled transfer completed successfully`,
                    payload
                );
            } catch (err) {
                console.error(
                    'Error processing scheduled transfer:',
                    err,
                    payload
                );
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
