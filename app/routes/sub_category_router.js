import express from 'express';
import SubCategoryController from '../controllers/sub_category_controller.js';

const subCategoryRouter = express.Router();
const subCategoryController = new SubCategoryController();

subCategoryRouter.get('/', subCategoryController.index);

export default subCategoryRouter;
