require('dotenv');
const User = require('../models/user');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:process.env.SENDGRID_KEY
  }
}))

exports.getLogin = (req, res, next) => {
  const e = require("express");
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }else{
        message=null;
    }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage:message
  });
};

exports.getSignup = (req, res, next) => {
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }else{
        message=null;
    }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage:message
  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const  password=req.body.password;
User.findOne({email: email})
    .then(user => {
        if(!user){
            req.flash('error','Invalid Email or Password ');
            return res.redirect('/login');
        }
        bcrypt.compare(password,user.password)
            .then(match=>{
                if(match){
                    req.session.isLoggedIn=true;
                    req.session.user=user;
                    return req.session.save(error => {
                        console.log(error);
                        res.redirect('/');
                    })
                }
                req.flash('error','Invalid Email or Password ');
                res.redirect('/login');
            }).catch(err=>console.log(err));
    }).catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  const confirmPassword=req.body.confirmPassword;
  User.findOne({email:email})
      .then(userDoc=> {
          if (userDoc) {
              req.flash('error','E-Mail is already exists ,please pick another E-Mail');
              return res.redirect('/signup');
          }
          return bcrypt.hash(password, 12)
              .then(hashpass=>{
              const user = new User({
                  email : email,
                  password  :hashpass,
                  cart : {items : [] }
              });
              return user.save();
          });
      })
      .then(result=>{
        res.redirect('/login');
        return transporter.sendMail({
          to:email,
          from:'omarsabra509@gmail.com',
          subject:'Welcome in The new website builted by OMAR SABRA',
          html:'<h1>You successfully signed up </h1>'
        }).catch(err=>console.log(err))
  }).catch(err=>console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
