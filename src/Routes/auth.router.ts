import { Router } from "express";

import { Register, Login, confirmEmail, resendConfirmEmail, Logout, httpLoginByGoogle, httpLoginByFacebook, requestResetPassword, resetPasswordController, loginByKeycloak, registerByKeycloak, resetPasswordByKeycloak, httpLoginByKeycloak } from "../Controllers/auth.controller";

import { authRoleMiddleware } from "../Middlewares/auth.middleware";

export const authRouter = Router();


// determine Authentication with Keycloak OR user table By default use [user Table]
if(process.env.AUTH_WITH == 'keycloak'){

    authRouter.post("/login", loginByKeycloak);
    authRouter.post("/register", registerByKeycloak);

} else if (process.env.AUTH_WITH == 'userTable' || true) {

    authRouter.post('/login', Login);
    authRouter.post('/register', Register);
}




authRouter.get('/confrimEmail/:token', confirmEmail);
authRouter.get('/resendConfrimEmail/:userId', resendConfirmEmail);

authRouter.patch('/logout', authRoleMiddleware(['User', 'Admin']), Logout);

authRouter.post('/requestPasswordReset', requestResetPassword);
authRouter.post('/passwordReset', resetPasswordController);

authRouter.get("/google", httpLoginByGoogle);
authRouter.get("/facebook", httpLoginByFacebook);
authRouter.get("/keycloak", httpLoginByKeycloak);


//authRouter.post("/PasswordReset/keycloak", resetPasswordByKeycloak);


