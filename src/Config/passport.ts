
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { UserModel as User } from "../Models/user.model";
import {generatePasswordFun} from './genratePassword';
import {sign as jwtSign} from 'jsonwebtoken';

const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

async function verifyCallbackAauth(accessToken, refreshToken, profile, done) {

  let user = await User.findOne({ email: profile._json.email });
  let token;

  try {
    if (!user) {
      let newUser = {
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        email: profile._json.email,
        password: generatePasswordFun(),
        authByThirdParty: true,
        confirm_email: true,
        googleToken: accessToken
      };
      // Create User
      user = await new User(newUser);
      user = await user.save();
      
    }
    // JWT Token
    token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});
  
    return done(null, token, user);
  } catch (err) {
    console.log(err)
    // Log Error
    done(err);
  }
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallbackAauth));

export default passport;