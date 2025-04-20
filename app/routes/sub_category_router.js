import express from 'express';
import SubCategoryController from '../controllers/sub_category_controller.js';
import { body, query } from 'express-validator';

const subCategoryRouter = express.Router();
const subCategoryController = new SubCategoryController();

subCategoryRouter.get('/', subCategoryController.index);
subCategoryRouter.post(
  '/',
  body('name').isString().notEmpty().toLowerCase().escape(),
  body('description').isString().notEmpty().toLowerCase().escape(),
  body('icon').isString().optional().escape(),
  body('category_id').isNumeric().notEmpty().not().equals(0),
  subCategoryController.create,
);
subCategoryRouter.get(
  '/search',
  query('search_txt').isString().notEmpty().toLowerCase().escape(),
  subCategoryController.search,
);

export default subCategoryRouter;
