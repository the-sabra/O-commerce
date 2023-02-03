const Product = require('../models/product');
const {compareSync} = require("bcrypt");
const {validationResult}=require('express-validator')
exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage:"",
    oldInput:{
      title:'',
      imageUrl:'',
      price:'',
      description:'',
    }
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors=validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()){
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      errorMessage:errors.array()[0].msg,
      oldInput:{
        title:title,
        imageUrl:imageUrl,
        price:price,
        description:description,
      }
    });
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user._id,
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage:'',
        oldInput:{
          title:'',
          imageUrl:'',
          price:'',
          description:'',
        }
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors=validationResult(req);
  
  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString()!==req.user._id.toString()){
        return res.redirect('/')
      }
      if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          errorMessage:errors.array()[0].msg,
          product:{
            title:updatedTitle,
            price:updatedPrice,
            imageUrl:updatedImageUrl,
            description:updatedDesc,
            _id:prodId
          }
        });
      }
        product.title=updatedTitle;
        product.price=updatedPrice;
        product.description=updatedDesc;
        product.imageUrl=updatedImageUrl;
        product.userId=req.session.user._id;
        return product.save().then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id:prodId,userId:req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
