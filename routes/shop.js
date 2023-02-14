const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const authCheck=require('../authCheck/check-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetail);

router.get('/cart',  authCheck ,shopController.getCart);

router.post('/cart',  authCheck ,shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.post('/create-order',  authCheck ,shopController.postOrder);
router.post('/delete-order',authCheck,shopController.postDeleteOrder);
router.get('/orders', authCheck , shopController.getOrders);

router.get('/orders/:orderId',authCheck,shopController.getInvoice);
module.exports = router;
