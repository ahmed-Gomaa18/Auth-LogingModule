import passport from "passport";
import {
  BaseClient,
  Issuer,
  Strategy as keycloakStrategy,
  TokenSet,
  UserinfoResponse,
} from "openid-client";
import { Strategy } from "passport-google-oauth20";
import { UserModel as User } from "../Models/user.model";
import { generatePasswordFun } from "./genratePassword";
import { sign as jwtSign } from "jsonwebtoken";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { v4 as uuidv4 } from "uuid";
import { createUserSession } from "../Services/auth.service";

// Google
const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

passport.use(
  new Strategy(
    AUTH_OPTIONS,
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ email: profile._json.email });
      let token: string;

      try {
        if (!user) {
          let newUser = {
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            password: generatePasswordFun(),
            authByThirdParty: true,
            confirm_email: true,
            googleToken: accessToken,
          };

          // Create User
          user = await new User(newUser);
          user = await user.save();
        }
        // JWT Token
        //token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});

        // createUserSession Fun Create Session and Return Token
        const token_id = uuidv4();
        const expiresIn = "7d";
        const sessionToken = await createUserSession(token_id, user, expiresIn);
        token = sessionToken;
        return done(null, token, user);
      } catch (err) {
        console.log(err);
        // Log Error
        done(err);
      }
    }
  )
);

// Facebook
const Fbconfig = {
  FACEBOOK_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
};

const FACEBOOK_OPTIONS = {
  clientID: Fbconfig.FACEBOOK_ID,
  clientSecret: Fbconfig.FACEBOOK_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ["id", "displayName", "email"],
};

passport.use(
  new FacebookStrategy(
    FACEBOOK_OPTIONS,
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ email: profile._json.email });
      let token: string;

      const [firstName, lastName] = profile._json.name.split(" ");

      try {
        if (!user) {
          let newUser = {
            firstName: firstName,
            lastName: lastName,
            email: profile._json.email,
            password: generatePasswordFun(),
            authByThirdParty: true,
            confirm_email: true,
            facebookToken: accessToken,
          };

          // Create User
          user = await new User(newUser);
          user = await user.save();
        }
        // JWT Token
        //token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});

        // createUserSession Fun Create Session and Return Token
        const token_id = uuidv4();
        const expiresIn = "7d";
        const sessionToken = await createUserSession(token_id, user, expiresIn);
        token = sessionToken;

        return done(null, token, user);
      } catch (err) {
        console.log(err);
        // Log Error
        done(err);
      }
    }
  )
);
const KeycloakBearerStrategyObtions = {
  realm: "test",
  url: "http://localhost:8080/",
  clientID: process.env.KEYCLOAK_CLIENT_ID,
};

// Keycloak
// passport.use(
//   "keycloak",
//   new KeycloakStrategy(
//     {
      
//       realm: 'test',
//       clien
//       clientId: process.env.KEYCLOAK_CLIENT_ID,
//       clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
//       callbackURL: process.env.KEYCLOAK_REDIRECT_URL,
//     },
//     (accessToken, refreshToken, profile, done) => {
//       console.log("Gomaaaa");

//       console.log(profile);

//       return done(null, accessToken);
//     }
//   )
// );

const keycloakIssuer = new Promise((resolve, reject)=>{
  resolve(Issuer.discover(
    process.env.KEYCLOAK_REALM
  ))
});

const test: string = process.env.KEYCLOAK_REDIRECT_URL

keycloakIssuer.then((keycloakIssuer: Issuer<BaseClient>)=>{
  const keycloakClient = new keycloakIssuer.Client({
    issuer: process.env.KEYCLOAK_REALM,
    client_id: process.env.KEYCLOAK_CLIENT_ID,
    // client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    redirect_uris: [test],
    post_logout_redirect_uris: [process.env.KEYCLOAK_POST_LOGOUT_URL],
    response_types: ["code"],
  });
  passport.use(
    "keycloak",
    new keycloakStrategy(
      { client: keycloakClient },
      (tokenSet: TokenSet, userinfo: UserinfoResponse, done) => {
        console.log({tokenSet, userinfo}, 'hghhg')
        return done(null, {
          token: tokenSet,
          claims: tokenSet.claims(),
          userinfo,
        });
      }
    )
  );
});

export default passport;
