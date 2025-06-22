import express from 'express';
import { body } from 'express-validator';
import RawTransactionController from '../controllers/raw_transaction_controller.js';
import { RAW_TRANSACTION_TYPE } from '../models/raw_transaction.js';
import multer from 'multer';
import config from '../config/config.js';
import { join, extname } from 'node:path';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';

const rawTransactionController = new RawTransactionController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(config.MEDIA_UPLOAD_PATH, 'uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = extname(file.originalname);
    cb(null, `${Date.now()}_raw_transaction_${req.user.id}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = extname(file.originalname);
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
    return cb(new Error('Only images are allowed with png, jpg or jpeg'));
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { files: 1 },
});

const rawTransactionsRouter = express.Router();

rawTransactionsRouter.post(
  '/',
  upload.single('image'),
  body('type').notEmpty().isIn(Object.values(RAW_TRANSACTION_TYPE)),
  body('data').isString().trim().optional(),
  (req, _, next) => {
    if (
      req.body.type === RAW_TRANSACTION_TYPE.WA_TEXT &&
      (!req.body.data || req.body.data === '')
    ) {
      throw new Error(`invalid data for type ${req.body.type}`);
    }

    if (req.body.type === RAW_TRANSACTION_TYPE.WA_IMAGE && !req.file) {
      return next(
        createHttpError(HttpStatusCode.BadRequest, {
          errors: [`invalid data for type ${req.body.type}`],
        }),
      );
    }

    next();
  },
  rawTransactionController.create,
);

export default rawTransactionsRouter;
