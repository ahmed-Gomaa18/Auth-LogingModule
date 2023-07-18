import { Router } from "express";
import { Register, Login, confirmEmail, resendConfirmEmail, Logout, httpLoginByGoogle, httpLoginByFacebook, requestResetPassword, resetPasswordController, loginByKeycloak, signupByKeycloak, resetPasswordByKeycloak } from "../Controllers/auth.controller";
import { authRoleMiddleware } from "../Middlewares/auth.middleware";

export const authRouter = Router();



authRouter.post('/register', Register);
authRouter.get('/confirmEmail/:token', confirmEmail);
authRouter.get('/resendConfirmEmail/:userId', resendConfirmEmail);
authRouter.post('/login', Login);
authRouter.patch('/logout', authRoleMiddleware(['User', 'Admin']), Logout);

authRouter.post('/requestPasswordReset', requestResetPassword);
authRouter.post('/passwordReset', resetPasswordController);

authRouter.get("/google", httpLoginByGoogle);
authRouter.get("/facebook", httpLoginByFacebook);

authRouter.post("/login/keycloak", loginByKeycloak);
authRouter.post("/signup/keycloak", signupByKeycloak);
authRouter.post("/PasswordReset/keycloak", resetPasswordByKeycloak);


