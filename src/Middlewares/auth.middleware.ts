import {verify as jwtVerify} from 'jsonwebtoken';
import {UserModel as User} from '../Models/user.model';
import {UserSessionModel as UserSession} from '../Models/userSession.model';
import { NextFunction, Request, Response } from "express";



export function authRoleMiddleware(accessRoles: string[]){

    return async(req: Request, res: Response, next: NextFunction)=>{
        let token = '';
        try {

            const headerToken = req.headers['authorization'];

            if (!headerToken ||headerToken == undefined || headerToken == null || !headerToken.startsWith(`${process.env.BEARER_SECRET} `)) {
                res.status(401).json({message:"In-valid Header Token"});

            } else {
                token = headerToken.split(" ")[1];

                if (!token || token == null || token == undefined || token.length < 1 ) {
                    res.status(401).json({message:"In-valid Token"});

                } else {
                    const decoded = await jwtVerify(token , process.env.TOKEN_SIGNATURE);

                    if (!decoded) {
                        res.status(401).json({message:"In-valid Token Signature "});

                    } else {
                        // Check This Token in UserSession.

                        const currentSession = await UserSession.findOne({token_id: decoded.token_id, user_id: decoded.id})

                        if(!currentSession || !currentSession.active){

                            // This Session was Closed OR Not Valid
                            res.status(401).json({message:"This Session is not Valid. Please Login again"});

                        } else {

                            if (accessRoles.includes(decoded.role)) {
                                // Add Info On Requset                            
                                req.user = {userId: decoded.id, user_role: decoded.role ,user_permission: decoded.permission, auth: true}
                                req.token_id = decoded.token_id;

                                next();

                            } else {
                                res.status(401).json({message:"Not auth account"});

                            }

                        }
                    }
                }
            }
        
        } catch (error) {
            //console.log(error);
            if (error?.message == "jwt expired") {
              //const updateActive =  await User.findOneAndUpdate({_Token:token},{active:false ,_Token:null},{new:true})
              res.status(464).json({message:"Please Login again"})
            }else{
                res.status(500).json({message:"Catch Error From Auth Middleware " , error});
            }
        }
    };
};

export function authPermissionMiddleware(EndPoint: string){
    return (req: Request, res: Response, next: NextFunction)=>{
        // req.user = {auth: true, user_permission: ['goko']}
        
        // Check User Authentication
        if(!req?.user?.auth){
            res.status(401).json({message:"User not auth"});
        }
        else
        {
            if(req.user.user_permission.includes(EndPoint)){
                next();
            }
            // else if(req.user.user_role.includes('Admin'))
            // {
            //     next();
            // }
            else
            {
                res.status(401).json({message:"Forbidden"});
            }
        }
    } 
}