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
const multer=require('multer');
const csrfprotection=csrf();
const mongodbStore=require('connect-mongodb-session')(session);
const app = express();

const dateISOType=new Date().toISOString();

//sessions configration With DB
const store=new mongodbStore({
    uri:process.env.MONGODB_URL,
    collection:'sessions'
})


// multer configration
const fileStroge = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename:(req,file,cb)=>{
        let fileisoDate;
        if(process.platform==='win32'){
            fileisoDate=new Date().toISOString().replace(/:/g, '-');
        }else{
            fileisoDate=new Date().toISOString();
        }
        cb(null,fileisoDate+'-'+file.originalname);
    },
    
});

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

app.set('view engine', 'ejs');  
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User=require('./models/user');
const authRouter=require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:fileStroge,fileFilter:fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
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
    User.findById(req.session.user._id)
        .then(user=>{
            if(!user){
                next();
            }
            req.user=user;
            next();
        }).catch(err=>{
            throw new Error(err);
        });
});
app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken= req.csrfToken();

    next();
})

app.use(authRouter);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.get('/500',errorController.get500);

app.use(errorController.get404);

app.use((error,req,res,next)=>{
    //  To know  what is the error message for dev team
    console.log(error); 
    res.redirect('/500');
})

mongoose.connect(process.env.MONGODB_URL).then(
    function (res) {
        app.listen(3000);
    }
).catch(
    err=>console.log(err)
);


