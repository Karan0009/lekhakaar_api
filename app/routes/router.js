import express from 'express';
import config from '../config/config.js';
import bullUiController from '../bullmq/bullui_controller.js';
import apiRouter from './api_router.js';

const router = express.Router();

router.get('/', (_, res) => {
  return res.json({
    service: 'expense-manager',
    author: 'karan singh',
    contacts: { github: 'https://github.com/Karan0009' },
  });
});
router.use('/api', apiRouter);
router.use(
  config.BULL_UI_PATH,
  bullUiController.getBullBoardServerAdapter().getRouter(),
);

export default router;
