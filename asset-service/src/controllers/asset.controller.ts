import { Request, Response, NextFunction } from 'express';
import assetService from '../services/asset.service';

const deposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletId, name, amount } = req.body;
        const asset = await assetService.deposit(walletId, name, amount);
        res.status(201).json({ status: 201, data: asset });
    } catch (err) {
        next(err);
    }
};

const withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletId, name, amount } = req.body;
        const asset = await assetService.withdraw(walletId, name, amount);
        res.status(201).json({ status: 201, data: asset });
    } catch (err) {
        next(err);
    }
};

const scheduleTransfer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fromWalletId, toWalletId, name, amount, executeInSeconds } =
            req.body;
        const asset = await assetService.scheduleTransfer(
            fromWalletId,
            toWalletId,
            name,
            amount,
            executeInSeconds
        );
        res.status(201).json({ status: 201, data: asset });
    } catch (err) {
        next(err);
    }
};

export { deposit, withdraw, scheduleTransfer };
