require('dotenv/config');
const User = require('../models/user');
const bcrypt=require('bcrypt');
const crypto = require("crypto");
const nodemailer=require('nodemailer');
const {validationResult}=require('express-validator')

// sending email with nodemailer
const sendgridTransport=require('nodemailer-sendgrid-transport');
const transporter=nodemailer.createTransport({
  service:'gmail',
  auth: {
      user: 'omarsabra509@gmail.com',
      pass: process.env.EMAIL_PASS
  }
})

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
    errorMessage:message,
    oldInput:{
      email:'',
      password:'',
    }
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
    errorMessage:message,
    oldInput:{
      email:"",
      password:"",
      ConfirmPassword:""
    }
  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const  password=req.body.password;
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage:errors.array()[0].msg,
      oldInput:{
        email:email,
        password:password,
      }
    })
  }
User.findOne({email: email})
    .then(user => {
        if(!user){
            return res.status(422).render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMessage:'Invalid Email or Password ',
              oldInput:{
                email:email,
                password:password,
              }
            })
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
                return res.status(422).render('auth/login', {
                  path: '/login',
                  pageTitle: 'Login',
                  errorMessage:'Invalid Email or Password ',
                  oldInput:{
                    email:email,
                    password:password,
                  }})
            }).catch(err=>console.log(err));
    }).catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;

  const errors=validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage:errors.array()[0].msg,
      oldInput:{
        email:email,
        password:password,
        ConfirmPassword: req.body.confirmPassword,
      }
    })
  }
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
          subject:'Welcome in The new website built by OMAR SABRA',
          html:'<h1>You successfully signed up </h1>'
        }).catch(err=> console.log(err))
  }).catch(err=>console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getRest=(req,res,next)=>{
  let message=req.flash('error');
  if(message.length>0){
      message=message[0];
  }else{
      message=null;
  }
  res.render('auth/reset-pass',{
    path:'/rest',
    pageTitle:'Rest Password',
    errorMessage:message
  })
}

exports.postRest=(req,res,next)=>{
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
      console.log(err)
      return res.redirect('/rest')
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user=>{
      if(!user){
          req.flash('error','No account with that email found. ');
          res.redirect('/reset');
      }
        user.resetToken=token;
        // the expration will take 60 min 
        user.resetTokenExpration=Date.now() + 3600000;
        return user.save();
    }).then(result=>{
      res.redirect('/');
      transporter.sendMail({
        to:req.body.email,
        from:'omarsabra509@gmail.com',
        subject:'Password Reset',
        html:`
        <p>You requested a password reset</p>
        <p>Click this <h1><a href="http://localhost:3000/reset/${token}">link</a></h1></p>
        `
      }).catch(err=>console.log(err))
    })
    .catch(err=>{
      console.log(err);
    })
  })
}
exports.getNewPassword=(req,res,next)=> {
  const token=req.params.token ;
  User.findOne({resetToken:token,resetTokenExpration:{$gt:Date.now()}})
      .then(user=>{
        let message=req.flash('error');
        console.log(message)
        if(message.length>0){
            message=message[0];
        }else{
            message=null;
        }
        res.render('auth/newPass',{
          path:'/new-Password',
          pageTitle:'New Password',
          errorMessage:message,
          userId:user._id.toString(),
          token:token
        })  
      }).catch(err=>console.log(err));
  
}

exports.postNewPassword=(req,res,next)=>{
  const userId=req.body.userId;
  const NewPass=req.body.NewPassword;
  const ConPass=req.body.ConfirmPassword;
  const token =req.body.token;
  
  User.findOne({_id:userId,resetToken:token,resetTokenExpration:{$gt:Date.now()}}).then(user=>{
      if(NewPass !== ConPass){
        req.flash('error','Don\'t Match Password');
        res.redirect(`/reset/${token}`)
      }
      return bcrypt.hash(NewPass,12)
      .then(hashPass=>{
          user.password=hashPass;
          user.resetToken=undefined;
          user.resetTokenExpration=undefined;
          user.save();
          res.redirect('/login');
      }).catch(err=>console.log(err));
  })
}

