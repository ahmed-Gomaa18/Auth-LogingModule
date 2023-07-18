import {
    signUp, sendMailConfirmation, signIn,
    confrimEmailService, resendConfrimEmailService, signOut,
    generateResetPasswordLink, resetPassword, keycloakLoginService, keycloakSignupService, keycloakResetPasswordService
} from "../Services/auth.service";
import { NextFunction, Request, Response } from "express";

import Logger from '../Config/logger';

import passport from "../Config/passport";

import AppError from '../Utils/appErorr';
import { sendEmail } from "../Utils/sendEmailHelper";

export async function Register(req: Request, res: Response) {
    try {

        const { firstName, lastName, email, password } = req.body;

        // Call Service
        const result = await signUp(firstName, lastName, email, password);
        if (result.isSuccess) {
            // Send Mail
            sendMailConfirmation(result.user._id, result.user.email, req);

            // Logging
            Logger.info(`email: (${result.user.email}) Created Successfully.`, { req })

            return res.status(result.status).json({ message: result.message, "user": result.user });
        }
        else {
            
            return res.status(result.status).json({ message: result.message });

        }

    }
    catch (error) {
        if (error.keyValue?.email) {
            res.status(409).json({ message: "This Email Already Exist" });

        } else {

            res.status(500).json({ message: "catch error : " + error.message });
        }
    }

}

export async function Login(req: Request, res: Response) {
    const { email, password, rememberMe } = req.body;
    try {
        // call service
        const result = await signIn(email, password, rememberMe);
        if (result.isSuccess) {
            Logger.info(`UserId: (${result.user._id}) email: (${result.user.email}) LogIn Successfully.`, { req });

            return res.status(result.status).json({ message: result.message, user: result.user, token: result.Token });
        }
        else {

            Logger.error(`${result.message}`, {req})

            return res.status(result.status).json({message: result.message });

        }

    }
    catch (error) {

        Logger.error(`Error Occurred While This User Try to LogIn email:(${email}) Error: ${error.message}.`, { req })
        
        res.status(500).json({ message: "Catch Error" + error.message });
    }
}

export async function confrimEmail(req: Request, res: Response) {
    try {

        const { token } = req.params;
        const result = await confrimEmailService(token);
        if (result.isSuccess) {
            // Render Front Page

            //Log To Success
            Logger.info(`This User id: (${result.user._id}) Confirmed Email Successfully.`, { req });
            return res.status(result.status).json({message: result.message });
        }
        else {

            Logger.error(`This User id: (${result.user._id}) ${result.message}`, {req});
            return res.status(result.status).json({message: result.message });

        }
    }
    catch (error) {
        if (error.message == "jwt expired") {
            Logger.error(`Your Token is Expired`, {req});
            res.status(500).json({ message: "Your Token is Expired" })
        } else {
            Logger.error(`${error}`, {req});
            res.status(500).json({ message: "Catch Error", error })
        }
    }
}

export async function resendConfrimEmail(req: Request, res: Response) {
    try {

        const { userId } = req.params;
        const result = await resendConfrimEmailService(req, userId);
        if (result.isSuccess) {

            //Log To Success
            Logger.info(`This User id: (${userId}) Resend Confirmed Email Successfully.`, {req});
            return res.status(result.status).json({message: result.message });
        }
        else {

            Logger.error(`This User id: (${userId}) ${result.message}`, {req});
            return res.status(result.status).json({message: result.message });

        }
    }
    catch (error) {
        // log Error
        Logger.error(`Error Occurred While Resend Confirmed Email To This User (${req.params.userId}) : ${error.message}.`, {req})
        res.status(500).json({ message: "Catch Error" + error.message })
    }
}

export async function Logout(req: Request, res: Response) {
    const userId = req.user.userId;
    const tokent_id = req?.token_id || 'empty';
    try {
        // call service
        const result = await signOut(userId, tokent_id);
        if (result.isSuccess) {

            Logger.info(`-email: (${result.user.email}) Logout Successfully.`, {req});

            return res.status(result.status).json({message: result.message });
        }
        else {

            Logger.error(`${result.message}`, {req});

            return res.status(result.status).json({message: result.message });

        }

    }
    catch (error) {
        // log Error
        Logger.error(`Error Occurred While This User Try to LogIn id:(${userId}) Error: ${error.message}.`, {req})
        res.status(500).json({ message: "Catch Error" + error.message });
    }
}

export async function loginByKeycloak(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    try {
        const result = await keycloakLoginService(email, password);
        if(result.isSuccess){
            Logger.info(`This email(${email}) login Successfully`, {req});
            return res.status(result.status).json({message: result.message, user: result.user, token: result.token});
        }
        else{
            Logger.error(`This email(${email}) Tried To login with Error (${result.message})`, {req});
            return res.status(result.status).json({message: result.message});
        }
    } catch (error) {
        //Logger.error(`This email(${email}) Tried To login with In-vaild Email OR Password.\nError(${error.message})`, {req});
        //res.status(500).json({ message: "Catch Error" + ' In-vaild Email OR Password.' });
        return next(new AppError('In-vaild Email OR Password.', 500));

    }
}

export async function registerByKeycloak(req: Request, res: Response, next: NextFunction) {
    const { email, firstName, lastName, password } = req.body;
    try {
        
        const result = await keycloakSignupService({ email, firstName, lastName, password });
        
        if (result.isSuccess){

            Logger.info(`This email(${email}) Sign up Successfully`, {req});
            return res.status(result.status).json({message: result.message, user: result.user});
        
        } else {

            Logger.error(`Oops..This email(${email}) is already existing`, {req});
            return res.status(result.status).json({message: result.message});

        }

    } catch (error) {
        Logger.error(`This email(${email}) Tried To Sign up By Keycloak.\nError(${error.message})`, {req});
        res.status(500).json({ message: "Catch Error" + 'Oops.. Some Error Occurred While sign up' + error.message });
    }
}

export async function resetPasswordByKeycloak(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    try {

        const result = await keycloakResetPasswordService(email, password );
        if(result.isSuccess){
            Logger.info(`This email(${email}) reset password Successfully`, {req});
            return res.status(result.status).json({message: result.message});
        } else {
            Logger.error(`Oops..This email(${email}) is not existing`, {req});
            return res.status(result.status).json({message: result.message});
        }

    } catch (error) {
        Logger.error(`This email(${email}) Tried To Reset Password.\nError(${error.message})`, {req});
        res.status(500).json({ message: "Catch Error" + 'Oops.. Some Error Occurred While reset password' + error.message });
    }
}


// Auth By Google
export function httpLoginByGoogle(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", {
        scope: ["email", "profile"],
    })(req, res, next);
}

export function httpCallbackGoogleURL(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", { session: true }, (err, token, user) => {
        if (err) {
            Logger.error(`This UserId (${user._id}) is failed to Authenticated by Google`, {req});
            return next(err);
        }
        Logger.info(`This UserId (${user._id}) is Authenticated by Google`, {req});
        res.cookie('Token', token);
        
        res.redirect("http://localhost:3001");


    })(req, res, next);
}


// Auth By Facebook
export function httpLoginByFacebook(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("facebook", {
        scope: ["email"],
    })(req, res, next);
}

export function httpCallbackFacebookURL(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("facebook", { session: true }, (err, token, user) => {
        if (err) {
            Logger.error(`User with id (${user.id}) failed to be authenticated by Facebook`, {req});
            return next(err);
        }

        Logger.info(`User with id (${user.id}) is authenticated by facebook`, {req});

        res.cookie('Token', token);
        
        res.redirect("http://localhost:3001");

        

    })(req, res, next);
}


export async function requestResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;
        const result = await generateResetPasswordLink(email);

        if (result.isSuccess) {

            // Send Mail
            const message = `<h1>Welcome👋</h1>
            <a href =${result.link}>
            Please Follow This Link To Reset Your Password.
            </a> `;

            sendEmail(email, "Password Reset Request", message, result.user_id);

            // Loging
            Logger.info(`This User id: (${result.user_id}) email: (${email}) Want To Reset Password.`, {req})
            

            return res.status(result.status).json({message: result.message});

        } else {

            Logger.error(`This User email: (${email}) ${result.message}`, {req});
            return res.status(result.status).json({message: result.message});
        }

    }
    catch (error) {
        Logger.error(`Error Occurred While This User Try to genrate reset password link Error: ${error.message}.`, {req})
        return next(new AppError(error.message, 500))
    }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, token, password } = req.body;
        const result = await resetPassword(userId, token, password);
        if (result.isSuccess) {

            // Send Mail
            const message = `<h1>Welcome Back👋</h1>
            <h3>
            Your password has been changed successfully.
            </h3> `;
            sendEmail(result.user.email, "Password Reset Request", message, result.user._id);


            // Loging
            Logger.info(`This User id: (${result.user._id}) email: (${result.user.email}) Reset Password Successfully.`, {req})

            return res.status(result.status).json({ message: result.message });

        }
        else {
            // Loging Erorr
            Logger.error(`This User id: (${userId}) ${result.message}`, {req});
            
            return res.status(result.status).json({message: result.message});
            
        }

    } catch (error) {
       
        Logger.error(`Error Occurred While Try to Send Successful reset password mail: ${error.message}.`, {req})
      
        return next(new AppError(error.message, 500))
    }

}
