require('dotenv/config');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
// const mongoConnect=require('./util/DB').mongoConnect;
const mongoose=require('mongoose');
const session=require('express-session');
const csrf=require('csurf');
const flash=require('connect-flash');
const csrfprotection=csrf();
const mongodbStore=require('connect-mongodb-session')(session);
const app = express();
const store=new mongodbStore({
    uri:process.env.MONGODB_URL,
    collection:'sessions'
})
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User=require('./models/user');
const authRouter=require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret:'my secret',
    resave:false,
    saveUninitialized:false,
    store:store
}))
app.use(csrfprotection);
app.use(flash());
app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    console.log(req.session.user._id);
    User.findById(req.session.user._id)
        .then(user=>{
            req.user=user;
            console.log(user);
            next();
        }).catch(err=>console.log(err));
});
app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken= req.csrfToken();

    next();
})

app.use(authRouter);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(process.env.MONGODB_URL).then(
    res=>{
        app.listen(3000);
    }
).catch(
    err=>console.log(err)
);


