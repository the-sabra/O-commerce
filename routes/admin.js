const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const authCheck=require('../authCheck/check-auth');
const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', authCheck ,adminController.getAddProduct);

// /admin/products => GET
router.get('/products',  authCheck ,adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId',  authCheck ,adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
