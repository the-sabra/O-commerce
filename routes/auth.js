const express = require('express');
const User=require('../models/user')
const authController = require('../controllers/auth');
const { check, body }=require('express-validator');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset',authController.getRest)

router.post('/login',[
    check('email').isEmail().withMessage('Please Enter a valid Email'),
    body('password').isLength({min:4})
] 
,authController.postLogin);

router.post('/signup',[
    check('email').isEmail()
    .withMessage('Please enter a valid Email').normalizeEmail()
    .custom((value,{req})=>{
        if(value === 'test@test.com'){
            throw new Error('This Email is undifiend')
        }
        return true;
    }),
    body('password','the password is less than 4 or more than 10 or define space')
    .isLength({min:4,max:10})
    .isAlphanumeric(),
    body('confirmPassword').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Password have to match!');
        }
        return true;
    }).trim()
],authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset',authController.postRest);

// the token get from email 
router.get('/reset/:token',authController.getNewPassword)

router.post('/reset-password',authController.postNewPassword)

module.exports = router;