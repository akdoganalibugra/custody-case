import { Request, Response, NextFunction } from 'express';
import assetService from '../services/asset.service';

const deposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { address, name, amount } = req.body;
        const asset = await assetService.deposit(address, name, amount);
        res.status(201).json({ status: 201, data: asset });
    } catch (err) {
        next(err);
    }
};

const withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { address, name, amount } = req.body;
        const asset = await assetService.withdraw(address, name, amount);
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
        const { fromAddress, toAddress, name, amount, executeInSeconds } =
            req.body;
        const asset = await assetService.scheduleTransfer(
            fromAddress,
            toAddress,
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
