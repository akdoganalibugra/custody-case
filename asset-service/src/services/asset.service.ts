import Asset, { IAsset } from '../database/models/asset.model';
import { ApiError } from '../utils';
import rabbitmqService from './rabbitmq.service';

class AssetService {
    // RPC callback based request wrapping
    private getWalletDetails(walletId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            rabbitmqService.requestWalletDetails(walletId, (data: any) => {
                if (data.error) {
                    reject(new ApiError(400, data.error));
                } else {
                    resolve(data);
                }
            });
        });
    }

    async deposit(
        walletId: string,
        name: string,
        amount: number
    ): Promise<IAsset> {
        await this.getWalletDetails(walletId);

        const asset = await Asset.create({
            walletId,
            type: 'DEPOSIT',
            name,
            amount,
            status: 'COMPLETED',
        });
        return asset;
    }

    async withdraw(
        walletId: string,
        name: string,
        amount: number
    ): Promise<IAsset> {
        await this.getWalletDetails(walletId);

        const asset = await Asset.create({
            walletId,
            type: 'WITHDRAWAL',
            name,
            amount,
            status: 'COMPLETED',
        });
        return asset;
    }

    async scheduleTransfer(
        fromWalletId: string,
        toWalletId: string,
        name: string,
        amount: number,
        executeInSeconds: number
    ): Promise<IAsset> {
        await this.getWalletDetails(fromWalletId);
        await this.getWalletDetails(toWalletId);

        const delayMs = executeInSeconds * 1000;
        const executeAt = new Date(Date.now() + delayMs);
        const asset = await Asset.create({
            walletId: fromWalletId,
            toWalletId,
            type: 'TRANSFER_SCHEDULED',
            name,
            amount,
            status: 'PENDING',
            executeAt,
        });

        rabbitmqService.publishDelayed(
            { from: fromWalletId, to: toWalletId },
            delayMs
        );

        return asset;
    }

    async completeScheduled(payload: any): Promise<void> {
        await Asset.findOneAndUpdate(
            {
                walletId: payload.from,
                toWalletId: payload.to,
                type: 'TRANSFER_SCHEDULED',
                status: 'PENDING',
            },
            { status: 'COMPLETED' }
        );
    }
}

export default new AssetService();
