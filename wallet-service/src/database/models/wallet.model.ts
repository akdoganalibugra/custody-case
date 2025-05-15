import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
    address: string;
    network: string;
    createdAt: Date;
    updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
    {
        address: {
            type: String,
            required: true,
            unique: true,
        },
        network: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Compound unique index on address + network
WalletSchema.index({ address: 1, network: 1 }, { unique: true });

const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
export default Wallet;
