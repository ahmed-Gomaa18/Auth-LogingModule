import {Request, Response} from 'express';
import {UserModel as User, UserInterface} from '../Models/user.model';
import { UserSessionModel as UserSession } from '../Models/userSession.model';

import {sign as jwtSign, verify as jwtVerify} from 'jsonwebtoken';

import { v4 as uuidv4 } from 'uuid';

import { sendEmail } from '../Utils/sendEmailHelper';

import bcrypt from 'bcryptjs';

import crypto from 'crypto';

import moment from 'moment';

import Token from '../Models/tokenResetPassword.model';
import { calculateExpirationDate } from '../Config/calculateExpirationDate';
import { promises } from 'dns';




export async function signUp (firstName: string, lastName: string, email: string, password: string){

        const hashPassword = await bcrypt.hash(password , parseInt(process.env.SALT_ROUND));

        const newUser = await new User({ firstName, lastName, email, password:hashPassword });
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

            return {
                isSuccess:true, 
                message:'User Sign Up Successfully.',
                status: 201,
                user: savedUser
            }   
            
        }
}

export function sendMailConfirmation(user_id: string,email: string, req: Request){

    const payload = {userId: user_id};
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
    sendEmail(email, "Confirm Your Account.", message, user_id);

}

export async function signIn(email: string, password: string, rememberMe: boolean){
    
    const user = await User.findOne({email});
    if(!user){
        return {
            isSuccess:false, 
            message:'In-vaild Email OR Password.',
            status: 404
        }
    }
    else
    {
        if(!user.confirm_email){
            return {
                isSuccess:false, 
                message:'Please confrim your Email first.',
                status: 400
            }
        }
        else
        {
            if(user.isBlocked){
                return {
                    isSuccess:false, 
                    message:'Your acccount has bloced by Admin.',
                    status: 400
                }
            }
            else
            {
                if(user.authByThirdParty){
                    return{
                        isSuccess:false, 
                        message:"You Can't Login From This Page. Please Reset Your Password. Thanks For Your Time.",
                        status: 400
                    }
                }
                else
                {
                    const match = await user.checkPasswordIsValid(password);
                    if(!match){
                        return {
                            isSuccess:false, 
                            message:'In-valid Email Or Password.',
                            status: 400
                        }

                    }
                    else
                    {
    
                        // Check rememberMe
                        let expiresIn = '24h';
                        if(rememberMe){
                            expiresIn = '7d';
                        }
                        // Function
                        // Login Logic
                        const token_id = uuidv4();
                        const ResUserSessionToken = await createUserSession(token_id, user, expiresIn);
    
                        if(ResUserSessionToken == "Faild"){
                            return {
                                isSuccess:false, 
                                message:'Oops, Occurred a problem While login. Please Try Login again.',
                                status: 401,
                            }
                        }
    
                        return {
                            isSuccess:true, 
                            message:'User Login Successfully.',
                            status: 200,
                            user: user,
                            Token: ResUserSessionToken
                        }
    
                        
                    }

                }

            }
        }
    }

}

export async function confrimEmailService(token: string){
    

    const decoded = jwtVerify(token , process.env.EMAIL_TOKEN);

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

            await sendEmail(user.email,"Confirm Your Account.", message, user._id);

            return{
                isSuccess:true, 
                message:'Check Your mail.',
                status: 200,
            }
        }
    }
}


export async function signOut(userId: string, tokent_id: string){

    let userLogOut = await User.findByIdAndUpdate(userId , {
        lastSeen :moment().format() ,
    }, {new: true} );

    if (!userLogOut) {

        return{
            isSuccess:false, 
            message:'Sorry, Please try to Logout Again.',
            status: 401,
        }
    }
    else 
    {
        // Close Session && Deactive Session
        const deactiveUserSession = await UserSession.findOneAndUpdate({token_id: tokent_id, user_id: userId},{
            active: false,
            end_date: moment().format()
        }, {new: true});

        if(!deactiveUserSession){

            return{
                isSuccess:false, 
                message:'Sorry, Please try to Logout agian.',
                status: 401,
            }
        }
        else
        {

            return{
                isSuccess:true, 
                message:'User Logout Successfully.',
                status: 200,
                user: userLogOut
            }
            
        }
    }
}

export async function generateResetPasswordLink(email: string){

    const user = await User.findOne({ email });
    

    if (!user)
    {
        return{
            isSuccess:false,
            message: "User does not exist",
            status: 404,
        }
    }

    const token = await Token.findOne({ userId: user._id });
    if (token)
        await token.deleteOne();

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(process.env.SALT_ROUND));
    await new Token({
        userId: user._id,
        token: hash,
    }).save();

    const link = `${process.env.CLIENT_URL}/resetPassword?token=${resetToken}&id=${user._id}`;

    return{
        isSuccess:true,
        message: "Check Your Mail For Reset Password.",
        status: 200,
        link: link,
        user_id: user._id
    };

}

//export const generateResetPasswordLink = async (email: string) => {

//     const user = await User.findOne({ email });
//     if (!user)
//         throw new Error("User does not exist");

//     const token = await Token.findOne({ userId: user._id });
//     if (token)
//         await token.deleteOne();

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hash = await bcrypt.hash(resetToken, Number(process.env.SALT_ROUND));
//     await new Token({
//         userId: user._id,
//         token: hash,
//     }).save();

//     const link = `${process.env.CLIENT_URL}/resetPassword?token=${resetToken}&id=${user._id}`;
//     return {link: link, user_id: user._id};

// }


export async function resetPassword(userId: string, token: string, password: string){

    let passwordResetToken = await Token.findOne({ userId });
    console.log(passwordResetToken);
    if(!passwordResetToken)
    {
        return{
            isSuccess:false,
            message: "Invalid or expired password reset token.",
            status: 404,

        }
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    console.log(isValid);
    if (!isValid) {
        return{
            isSuccess:false,
            message: "Invalid or expired password reset token.",
            status: 404,
        }
    }

    const hash = await bcrypt.hash(password , parseInt(process.env.SALT_ROUND));
    const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
    );
    console.log(user)
    await passwordResetToken.deleteOne();

    return{
        isSuccess:true,
        message: "User Reset Password Successfully Check Your Mail.",
        status: 200,
        user: user
    };

}

export async function createUserSession(token_id: string, user: UserInterface, expiresIn: string): Promise<string>{
    
    const token: string = await jwtSign({id:user._id , role:user.role, permission: user.permission, token_id: token_id} , process.env.TOKEN_SIGNATURE , {expiresIn});

    const expire_date = calculateExpirationDate(expiresIn);

    const newUserSession = await new UserSession({user_id: user._id, token_id: token_id, expire_date: expire_date});
    const savedUserSession = await newUserSession.save();
    if (!savedUserSession){
        return "Faild";
    }
    else
    {
        return token;
    }
}