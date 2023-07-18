import { Router } from "express";
import { httpCallbackGoogleURL, httpCallbackFacebookURL } from "../Controllers/auth.controller";


export const thirdPartyRouter = Router();

thirdPartyRouter.get("/google/callback", httpCallbackGoogleURL);
thirdPartyRouter.get("/facebook/callback", httpCallbackFacebookURL);
