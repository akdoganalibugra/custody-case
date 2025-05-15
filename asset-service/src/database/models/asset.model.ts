import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
    walletId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_SCHEDULED';
    name: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED';
    createdAt: Date;
    executeAt?: Date;
    toWalletId?: string;
}

const AssetSchema: Schema = new Schema(
    {
        walletId: {
            type: String,
            required: true,
        },
        toWalletId: {
            type: String,
        },
        type: {
            type: String,
            required: true,
            enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_SCHEDULED'],
        },
        name: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['PENDING', 'COMPLETED'],
        },
        executeAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
export default Asset;
