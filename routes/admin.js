const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const authCheck=require('../authCheck/check-auth');
const { check } = require('express-validator');
const router = express.Router();

//-> /admin/add-product => GET
router.get('/add-product', authCheck ,adminController.getAddProduct);

//-> /admin/products => GET
router.get('/products',  authCheck ,adminController.getProducts);

//-> /admin/add-product => POST
router.post('/add-product', [
    check('title').isLength({min:4}).withMessage('invalid title'),
    check('price').isFloat({min:5, max:100000}).trim().withMessage('price must be more than $5'),
    check('description').custom((value,{req})=>{
        const words=value.split(' ');
        if(words.length<4){
            throw new Error('description must be more 4 words please');
        }
        return true;
    })

],adminController.postAddProduct);

//-> /admin/edit-product/:producID => GET
router.get('/edit-product/:productId',  authCheck ,adminController.getEditProduct);

//-> /admin/edit-product => POST
router.post('/edit-product',[
    check('title').isLength({min:4}).withMessage('invalid title'),
    check('price').isFloat({min:5, max:100000}).trim().withMessage('price must be more than $5'),
    check('description').custom((value,{req})=>{
        const words=value.split(' ');
        if(words.length<4){
            throw new Error('description must be more 4 words please');
        }
        return true;
    })
] ,adminController.postEditProduct);

//-> /admin/delete-product=> POST
router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
