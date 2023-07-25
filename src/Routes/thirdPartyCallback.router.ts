import { Router } from "express";
import { httpCallbackGoogleURL, httpCallbackFacebookURL, httpCallbackKeycloakURL } from "../Controllers/auth.controller";


export const thirdPartyRouter = Router();

thirdPartyRouter.get("/google/callback", httpCallbackGoogleURL);
thirdPartyRouter.get("/facebook/callback", httpCallbackFacebookURL);
thirdPartyRouter.get("/keycloak/callback", httpCallbackKeycloakURL);
