const nodemailer = require("nodemailer");
const asyncHandler = require('express-async-handler')

const sendEmail = asyncHandler(async(data,req,res)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.PASSWORD ,
        },
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"karim 👻" <abc@gmail.com>', // sender address
      to: data.to , // list of receivers
      subject: data.subject, // Subject line
      text: data.text, // plain text body
      html: data.htm , // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
})







module.exports = sendEmail