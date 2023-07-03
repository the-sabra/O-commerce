const fs = require('fs');
const path = require('path');
const PDFDoc = require('pdfkit');
const easyInvoice = require('easyinvoice');
const Product = require('../models/product');
const chokidar=require('chokidar');
const fileHelper = require('../util/files');
const Order = require('../models/order');
const session = require('express-session');
const stripe=require('stripe')('sk_test_51MbXs1KRs5JKDwbqcHIynogCYnfrgCtgeRebaGqgTOVuGDcK2SmIUWgrxhaNTW2yxWjBScNy60Od8kYCrtPnSgbq00b6rWf8rX');
const PROD_PER_PAG= 1;

const API = process.env.PAPI;
const integrationID = +process.env.integrationID;

exports.getProducts = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalItem;
  Product.find().countDocuments().then(numProducts=>{
    totalItem=numProducts;
    return Product.find()
      .skip((page - 1) * PROD_PER_PAG)
      .limit(PROD_PER_PAG);
  }).then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
        totalProducts:totalItem,
        currentPage:page,
        hasNextPage:PROD_PER_PAG * page < totalItem,
        hasPreviousPage:page>1, 
        nextPage:page+1,
        previousPage:page-1,
        lastPage:Math.ceil(totalItem/PROD_PER_PAG)
      });
    }).catch(err => {
      console.log(err);
    });
};

exports.getProductDetail = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalItem;
  Product.find().countDocuments().then(numProducts=>{
    totalItem=numProducts;
    return Product.find()
      .skip((page - 1) * PROD_PER_PAG)
      .limit(PROD_PER_PAG);
  }).then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        totalProducts:totalItem,
        currentPage:page,
        hasNextPage:PROD_PER_PAG * page <totalItem,
        hasPreviousPage:page>1,
        nextPage:page+1,
        previousPage:page-1,
        lastPage:Math.ceil(totalItem/PROD_PER_PAG)
      });
    })
    .catch(err => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  let theToken;
  req.user
    .populate("cart.items.productId")
    .then(async (user) => {
      products = user.cart.items;
      products.forEach((prod) => {
        total += prod.productId.price * prod.quantity;
      });

      // return stripe.checkout.sessions.create({
      //     payment_method_types:['card'],
      //     mode: "payment",
      //     line_items:products.map(p=>{
      //       return {
      //         quantity: p.quantity,
      //         price_data: {
      //           currency: "usd",
      //           unit_amount: p.productId.price * 100 ,
      //           product_data: {
      //             name: p.productId.title,
      //             description: p.productId.description,
      //           },
      //         },
      //       };
      //     }),
      //     customer_email:req.user.email,
      //     success_url:req.protocol+"://"+ req.get('host') + '/checkout/success',
      //     cancel_url : req.protocol+"://"+ req.get('host') + '/checkout/cancel',
      //       })
      ///Authentication Request
      const data = {
        api_key: API,
      };
      return fetch("https://accept.paymob.com/api/auth/tokens", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          return json.token;
        })
        .catch((err) => console.log(err));
    })
    .then((token) => {
      //Order Registration 
      theToken = token;
      // console.log(products)
      let data;
      data = {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: total * 100 + "",
        currency: "EGP",
        items: products.map((p) => {
          return {
            name: p.productId.title,
            amount_cents: p.productId.price * 100 + "",
            description: p.productId.description,
            quantity: p.quantity + "",
          };
        }),
      };
      return fetch("https://accept.paymob.com/api/ecommerce/orders", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          return json.id;
        })
        .catch((err) => console.log(err));
    })
    //Payment Key
    .then((id) => {
      let data = {
        auth_token: theToken,
        amount_cents: total * 100 + "",
        expiration: 3600,
        order_id: id,
        billing_data: {
          apartment: "NA",
          email: req.user.email,
          floor: "NA",
          first_name: "NA",
          street: "NA",
          building: "NA",
          phone_number: "+86(8)9135210487",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "NA",
          last_name: "NA",
          state: "NA",
        },
        currency: "EGP",
        integration_id: integrationID,
      };
      return fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          return json.token;
        })
        .catch((err) => console.log(err));
    })
    .then((finalToken) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        paymenToken: finalToken,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.session.user.email,
          userId: req.session.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteOrder = (req, res, next) => {
  const orderId = req.body.orderId;
  const invoiceName = 'invoice' + '-' + orderId + '.pdf';
  Order.findByIdAndRemove(orderId)
    .then(result => {
      if(fs.existsSync(path.join('data','invoices',invoiceName))){
        fileHelper.delecteFile(path.join('data','invoices',invoiceName));
        console.log("ORDER REMOVED");
        res.redirect('/orders');
      }else{
      console.log("ORDER REMOVED");
      res.redirect('/orders');
      }
    })
}
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice' + '-' + orderId + '.pdf';
  Order.findById(orderId).then(async order => {
    if (!order) {
      return next(new Error('No Order Found'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    }
    /// this code below will consume memory 
    const invoicePath = path.join('data', 'invoices', invoiceName);
    // fs.readFile(invoicePath,(err,data)=>{
    //   if(err){
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type','application/pdf');
    //   res.setHeader('Content-Disposition',"inline; filename='"+invoiceName+"'");
    //   res.send(data);
    // })
    //-------------------------------------------
    /// stream data code
    // const file =fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type','application/pdf');
    // res.setHeader('Content-Disposition',"inline; filename='"+invoiceName+"'");
    // file.pipe(res);
    //-------------------------------------------
    // // using a PDFkit
    const pdfile = new PDFDoc();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', "inline; filename='" + invoiceName + "'");
    pdfile.pipe(fs.createWriteStream(invoicePath));
    pdfile.pipe(res);
    pdfile.fontSize(20).text(`Invoice`,
      {
        underline: 1,
        align: 'center'
      }
    );
    pdfile.moveDown();
    pdfile.fontSize(18).text('Product', { align: 'left' });
    pdfile.moveUp();
    pdfile.fontSize(18).text('price', { align: 'center' });
    pdfile.moveUp();
    pdfile.fontSize(18).text('Quantity', { align: 'right' });
    let total = 0;
    order.products.forEach(prod => {
      total += prod.product.price * prod.quantity;
      pdfile.moveDown();
      pdfile.text(`${prod.product.title}`, { align: 'left' });
      pdfile.moveUp();
      pdfile.text(`${prod.product.price}`, { align: 'center' });
      pdfile.moveUp();
      pdfile.text(`${prod.quantity}`, { align: 'right' });
    });
    pdfile.moveDown();
    pdfile.text('Total', { align: 'center' })
    pdfile.text(`$ ${total}`, { align: 'center' })
    pdfile.end();
  }).catch(err => next(err));
}