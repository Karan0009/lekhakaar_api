import express from 'express';
import { query } from 'express-validator';
import CategoryController from '../controllers/category_controller.js';

const categoryRouter = express.Router();
const categoryController = new CategoryController();

categoryRouter.get('/', categoryController.index);

categoryRouter.get(
  '/search',
  query('search_txt').isString().notEmpty().toLowerCase().escape(),
  categoryController.search,
);

export default categoryRouter;
