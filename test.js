require('dotenv/config');
let nodemailer=require('nodemailer');
let transporter=nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: 'omarsabra509@gmail.com',
        pass: process.env.EMAIL_PASS
    }
})

let mainOptions={
    from:'omarsabra509@gmail.com',
    to:'omarsabra509@gmail.com',
    subject:'test send Email with nodemailer',
    text:'Made with OMAR SABRA'

}

transporter.sendMail(mainOptions,(err,info)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Email Sent Successfully');
    }
})