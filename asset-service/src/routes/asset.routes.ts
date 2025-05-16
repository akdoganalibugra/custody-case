import express, { Router } from 'express';
import {
    deposit,
    withdraw,
    scheduleTransfer,
} from '../controllers/asset.controller';

const assetRouter: Router = express.Router();

assetRouter.post('/deposit', deposit);
assetRouter.post('/withdraw', withdraw);
assetRouter.post('/transfer-schedule', scheduleTransfer);

export default assetRouter;
