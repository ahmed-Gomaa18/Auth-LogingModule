import {Request, Response} from 'express';
import {UserModel as User} from '../Models/userModel';

import {sign as jwtSign, verify as jwtVrify} from 'jsonwebtoken';

import { sendEmail } from '../Lib/sendEmailHelper';

import bcrypt from 'bcryptjs';

export async function SignUp (req: Request){

        const {name, email, password} = req.body;

        const hashPassword = await bcrypt.hash(password , parseInt(process.env.SALT_ROUND));

        const newUser = await new User({ name, email, password:hashPassword });
        const savedUser = await newUser.save();
    
        if (!savedUser){
            return {
                isSuccess:false, 
                message:'Sorry, Please try to signup agian',
                status: 405,
                user: savedUser
            }

        }
        else{
            const payload = {userId: savedUser._id};
            const secretKey = process.env.EMAIL_TOKEN;
            const token = jwtSign(payload, secretKey, {
                algorithm: 'HS256',
                expiresIn: '30d',
                //issuer: 'your-issuer',
                //audience: 'your-audience',
              });

            // send Email
            const message = `
            <h1>Welcome👋</h1>
            <h3>Thanks For your Time to Register with us.</h3>
            <a href =${req.protocol}://${req.headers.host}/api/v1/auth/confrimEmail/${token}>
            Please Follow This Link To Active your account.
            </a> 
            <br>
            <p>Best Regards From Our Team❤️</p>
            `;

            sendEmail(savedUser.email, message, savedUser._id);

            return {
                isSuccess:true, 
                message:'User Sign Up Successfully.',
                status: 201,
                user: savedUser
            }   
            
            
        }
}

export async function confrimEmailService(token: string){
    

    const decoded = jwtVrify(token , process.env.EMAIL_TOKEN);

    if (!decoded) {
        return{
            isSuccess:false, 
            message:'In-valid Token.',
            status: 403,
        }
    }
    else
    {
        const user = await User.findById(decoded.userId);

        if (!user) {
            return{
                isSuccess:false, 
                message:'In-valid User ID.',
                status: 403,
            }
        }
        else
        {
            if (user.confirm_email) {
                return{
                    isSuccess:false, 
                    message:'You already confrimed Please procced to login Pages.',
                    status: 403,
                }
            } 
            else 
            {
                user.confirm_email = true;
                await user.save();

                return{
                    isSuccess:true, 
                    message:'Done Please log In.',
                    status: 200,
                    user: user
                }
            }
        }
    }
}

export async function resendConfrimEmailService(req: Request ,userId: string){
    const user = await User.findById(userId);

    if (!user) {
        return{
            isSuccess:false, 
            message:'In-valid User ID Or This User is not exist.',
            status: 403,
        }
    }
    else
    {
        if (user.confirm_email) {
            return{
                isSuccess:false, 
                message:'You already confirmed Please proceed to login Page.',
                status: 403,
            }
        }
        else
        {

            const payload = {userId: user._id};
            const secretKey = process.env.EMAIL_TOKEN;
            const token = jwtSign(payload, secretKey, {
                algorithm: 'HS256',
                expiresIn: '30d',
                //issuer: 'your-issuer',
                //audience: 'your-audience',
            });

            // send Email
            const message = `
            <h1>Welcome👋</h1>
            <h3>Thanks For your Time to Register with us.</h3>
            <a href =${req.protocol}://${req.headers.host}/api/v1/auth/confrimEmail/${token}>
            Please Follow This Link To Active your account.
            </a> 
            <br>
            <p>Best Regards From Our Team❤️</p>
            `;

            await sendEmail(user.email, message, user._id);

            return{
                isSuccess:true, 
                message:'Check Your mail.',
                status: 200,
            }
        }
    }
}