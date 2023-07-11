import { Router } from "express";
import { Register, Login, confrimEmail, resendConfrimEmail, Logout, httpLoginByGoogle, httpLoginByFacebook, requestResetPassword, resetPasswordController } from "../Controllers/auth.controller";
import { authRoleMiddleware, authPermissionMiddleware } from "../Middlewares/auth.middleware";

export const authRouter = Router();



authRouter.post('/register', Register);
authRouter.get('/confrimEmail/:token', confrimEmail);
authRouter.get('/resendConfrimEmail/:userId', resendConfrimEmail);
authRouter.post('/login', Login);
authRouter.patch('/logout', authRoleMiddleware(['User', 'Admin']), Logout);

authRouter.post('/requestPasswordReset', requestResetPassword);
authRouter.post('/passwordReset', resetPasswordController);

authRouter.get("/google", httpLoginByGoogle);
authRouter.get("/facebook", httpLoginByFacebook);

// authRouter.get('/test', authPermissionMiddleware('goko'), (req: Request, res: Response)=>{
//     res.status(200).json({message: "Success Test"})
// })
