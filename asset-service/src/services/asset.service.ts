import Asset, { IAsset } from '../database/models/asset.model';
import { ApiError } from '../utils';
import rabbitmqService from './rabbitmq.service';

interface IWallet {
    found: boolean;
    wallet: {
        id: string;
        address: string;
        network: string;
    };
}

class AssetService {
    // RPC request wrapping: get wallet details by address
    private getWalletDetails(address: string): Promise<IWallet> {
        return new Promise((resolve, reject) => {
            rabbitmqService.requestWalletDetails(address, (data: any) => {
                if (!data.found) {
                    reject(new ApiError(404, 'Wallet not found'));
                } else {
                    resolve(data);
                }
            });
        });
    }

    async deposit(
        address: string,
        name: string,
        amount: number
    ): Promise<IAsset> {
        const { wallet } = await this.getWalletDetails(address);

        const asset = await Asset.create({
            walletId: wallet.id,
            type: 'DEPOSIT',
            name,
            amount,
            status: 'COMPLETED',
        });
        return asset;
    }

    async withdraw(
        address: string,
        name: string,
        amount: number
    ): Promise<IAsset> {
        const { wallet } = await this.getWalletDetails(address);

        const asset = await Asset.create({
            walletId: wallet.id,
            type: 'WITHDRAWAL',
            name,
            amount,
            status: 'COMPLETED',
        });
        return asset;
    }

    async scheduleTransfer(
        fromAddress: string,
        toAddress: string,
        name: string,
        amount: number,
        executeInSeconds: number
    ): Promise<IAsset> {
        const { wallet: sender } = await this.getWalletDetails(fromAddress);
        const { wallet: recipient } = await this.getWalletDetails(toAddress);

        const delayMs = executeInSeconds * 1000;
        const executeAt = new Date(Date.now() + delayMs);
        const asset = await Asset.create({
            walletId: sender.id,
            toWalletId: recipient.id,
            type: 'TRANSFER_SCHEDULED',
            name,
            amount,
            status: 'PENDING',
            executeAt,
        });

        rabbitmqService.publishDelayed(
            { from: sender.id, to: recipient.id },
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
