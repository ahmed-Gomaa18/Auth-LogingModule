import { Router } from "express";
import { httpCallbackURL } from "../Controllers/auth.controller";


export const googleRouter = Router();

googleRouter.get("/google/callback", httpCallbackURL);