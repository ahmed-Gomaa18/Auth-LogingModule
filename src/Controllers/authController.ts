import { SignUp, confrimEmailService, resendConfrimEmailService } from "../Services/authService";
import { Request, Response } from "express";

import Logger from '../Lib/logger';

export async function Register(req: Request, res: Response){
    try{

        console.log(req.route);
        console.log(req.route.path);
        console.log(req.route.stack[0].name);
        console.log(req.route.stack[0].method);

        // Call Service
        const result = await SignUp(req);
        if(result.isSuccess){

            Logger.info(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - This User id: (${result.user._id}) email: (${result.user.email}) Created Successfully.`)
            
            return res.status(result.status).json({"message": result.message, "user": result.user});
        }
        else{

            return res.status(result.status).json({"message": result.message});

        }

    }
    catch(error)
    {
        if (error.keyValue?.email) {
            res.status(409).json({message:"This Email Already Exist"});

        } else {
            
            res.status(500).json({message:"catch error : " + error.message }); 
        }
    }

}

export async function confrimEmail(req: Request, res: Response){
    try{

        const {token} = req.params;
        const result = await confrimEmailService(token);
        if(result.isSuccess){
            // Render Front Page

            //Log To Success
            Logger.info(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - This User id: (${result.user._id}) Confirmed Email Successfully.`)
            return res.status(result.status).json({"message": result.message});
        }
        else{

            Logger.error(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - This User id: (${result.user._id}) ${result.message}`);
            return res.status(result.status).json({"message": result.message});

        }
    }
    catch(error)
    {
        
        //console.log(error);
        if(error.message == "jwt expired"){
            Logger.error(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - Your Token is Expired`);
            res.status(500).json({message:"Your Token is Expired"})
        }else{
            Logger.error(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - ${error}`);
            res.status(500).json({message:"Catch Error" , error})
        }
    }
}

export async function resendConfrimEmail(req: Request, res: Response){
    try{

        const {userId} = req.params;
        const result = await resendConfrimEmailService(req, userId);
        if(result.isSuccess){

            //Log To Success
            Logger.info(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - This User id: (${userId}) Resend Confirmed Email Successfully.`)
            return res.status(result.status).json({"message": result.message});
        }
        else{

            Logger.error(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - This User id: (${userId}) ${result.message}`);
            return res.status(result.status).json({"message": result.message});

        }
    }
    catch(error)
    {
        if(error)
        {
            // log Error
            Logger.error(`@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunName:(${req.route.stack[0].name}) - Error Occurred While Resend Confirmed Email To This User (${req.params.userId}) : ${error.message}. `)
            res.status(500).json({message:"Catch Error" + error.message})
        }
    }
}