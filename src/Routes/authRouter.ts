import { Router } from "express";
import { Register, confrimEmail, resendConfrimEmail } from "../Controllers/authController";

export const authRouter = Router();


authRouter.post('/register', Register);
authRouter.get('/confrimEmail/:token', confrimEmail);
authRouter.get('/resendConfrimEmail/:userId', resendConfrimEmail);
