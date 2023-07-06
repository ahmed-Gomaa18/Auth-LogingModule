import {verify as jwtVrify} from 'jsonwebtoken';
import {UserModel as User} from '../Models/userModel';
import { NextFunction, Request, Response } from "express";

const roles = {
    User:"User" ,
    Admin:"Admin" 
}

export function authRoleMiddleware(accessRoles: string[]){
    return async(req: Request, res: Response, next: NextFunction)=>{
        let token = '';
        try {
            const headerToken = req.headers['authorization'];
            if (!headerToken ||headerToken == undefined || headerToken == null || !headerToken.startsWith(`${process.env.BEARER_SECRET} `)) {
                res.status(401).json({message:"In-valid Header Token"})
            } else {
                token = headerToken.split(" ")[1];
                if (!token || token == null || token == undefined || token.length < 1 ) {
                    res.status(401).json({message:"In-valid Token"})
                } else {
                    const decoded = jwtVrify(token , process.env.TOKEN_SIGNATURE);
                    if (!decoded && decoded.isLoggedIn == false) {
                        res.status(401).json({message:"In-valid Token Signature "})
                    } else {
                        const user = await User.findById(decoded.id).select('user_Name email role');
                        if (!user) {
                            res.status(404).json({message:"In-valid account id "});
                        } else {
                            if (accessRoles.includes(user.role)) {
                                //req.user.userId = user;
                                next();
                            } else {
                                res.status(401).json({message:"not auth account"})
                            }
                        }
                    }
                }
            }
        
        } catch (error) {
            //console.log(error);
            if (error?.message == "jwt expired") {
              const updateActive =  await User.findOneAndUpdate({_Token:token},{active:false ,_Token:null},{new:true})
              res.status(464).json({message:"Please Login again"})
            }else{
                res.status(500).json({message:"Catch Error Auth Middel" , error});
            }
        }
    }
}