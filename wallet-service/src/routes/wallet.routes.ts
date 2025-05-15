import express, { Router } from 'express';
import {
    createWallet,
    listWallets,
    getWallet,
    deleteWallet,
} from '../controllers/wallet.controller';

const walletRouter: Router = express.Router();

walletRouter.post('/', createWallet);
walletRouter.get('/', listWallets);
walletRouter.get('/:id', getWallet);
walletRouter.delete('/:id', deleteWallet);

export default walletRouter;
