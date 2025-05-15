import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/wallet.service';

const createWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { network } = req.body;
        const wallet = await walletService.create(network);
        res.status(201).json({ status: 201, data: wallet });
    } catch (err) {
        next(err);
    }
};

const listWallets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wallets = await walletService.list();
        res.json({ status: 200, data: wallets });
    } catch (err) {
        next(err);
    }
};

const getWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const wallet = await walletService.getById(id);
        res.json({ status: 200, data: wallet });
    } catch (err) {
        next(err);
    }
};

const deleteWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await walletService.delete(id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export { createWallet, listWallets, getWallet, deleteWallet };
