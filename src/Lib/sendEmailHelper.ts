import nodemailer from 'nodemailer';

import Logger from './logger';

export function sendEmail(to: string, message: string, id: string){

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        requireTLS:true,
        auth: {
          user: process.env.SENDER_EMAIL, // generated ethereal user
          pass: process.env.SENDER_PASSWORD//SENDER_PASSWORD, // generated ethereal password
        },
    });

    const mailOption = {

            from: `"Fred Foo 👻" <${process.env.SENDER_EMAIL}>`, 
            to: to, 
            subject: "Confirm Your Account.", 
            text: "Confirm Your Account",
            html:message  
    }


    transporter.sendMail(mailOption, (err, _)=>{

        if(err){          
            Logger.error(`This User id: (${id}) email: (${to}) an error occurred While a Sign up confirmation email was being sent.`);
        }
        else{
            Logger.info(`This User email: (${to}) was been sent Successfully.`);
        }
        
    });



}