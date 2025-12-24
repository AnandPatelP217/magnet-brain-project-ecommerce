import { sendResponse } from '../utils/sendResponse.js';
import { StatusCodes } from '../constants/statusCodes.js';
import { mockProducts } from '../data/mockProducts.js';

/**
 * Get all products
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        
        let filteredProducts = [...mockProducts];
        
        // Filter by category if provided
        if (category) {
            filteredProducts = filteredProducts.filter(
                product => product.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        // Search by name or description if provided
        if (search) {
            const searchLower = search.toLowerCase();
            filteredProducts = filteredProducts.filter(
                product => 
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description.toLowerCase().includes(searchLower)
            );
        }
        
        sendResponse(res, StatusCodes.OK, 'Products retrieved successfully', {
            products: filteredProducts,
            count: filteredProducts.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res, next) => {
    try {
        const { productId } = req.params;
        
        const product = mockProducts.find(p => p.productId === productId);
        
        if (!product) {
            return sendResponse(res, StatusCodes.NOT_FOUND, 'Product not found', null);
        }
        
        sendResponse(res, StatusCodes.OK, 'Product retrieved successfully', { product });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all product categories
 */
export const getCategories = async (req, res, next) => {
    try {
        const categories = [...new Set(mockProducts.map(p => p.category))];
        
        sendResponse(res, StatusCodes.OK, 'Categories retrieved successfully', {
            categories,
            count: categories.length
        });
    } catch (error) {
        next(error);
    }
};
