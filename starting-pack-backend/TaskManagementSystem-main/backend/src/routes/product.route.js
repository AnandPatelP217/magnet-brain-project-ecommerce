import express from 'express';
import {
    getAllProducts,
    getProductById,
    getCategories
} from '../controllers/product.controller.js';

const router = express.Router();
router.get('/', getAllProducts);
router.get('/categories', getCategories); router.get('/:productId', getProductById);

export default router;
