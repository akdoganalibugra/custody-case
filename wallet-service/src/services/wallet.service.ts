import { Wallet, IWallet } from '../database';
import { ApiError, generateAddress } from '../utils';

class WalletService {
    async create(network: string): Promise<IWallet> {
        const address = generateAddress();
        try {
            const wallet = await Wallet.create({ address, network });
            return wallet;
        } catch (err: any) {
            if (err.code === 11000) {
                throw new ApiError(400, 'Wallet already exists');
            }
            throw new ApiError(500, err.message);
        }
    }

    async list(): Promise<IWallet[]> {
        return Wallet.find().exec();
    }

    async getById(id: string): Promise<IWallet> {
        const wallet = await Wallet.findById(id).exec();
        if (!wallet) throw new ApiError(404, 'Wallet not found');
        return wallet;
    }

    async findByAddress(address: string): Promise<IWallet> {
        const wallet = await Wallet.findOne({ address }).exec();
        if (!wallet) throw new ApiError(404, 'Wallet not found');
        return wallet;
    }

    async delete(id: string): Promise<void> {
        const result = await Wallet.findByIdAndDelete(id).exec();
        if (!result) throw new ApiError(404, 'Wallet not found');
    }
}

export const walletService = new WalletService();
