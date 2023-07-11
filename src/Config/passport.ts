
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { UserModel as User } from "../Models/user.model";
import {generatePasswordFun} from './genratePassword';
import {sign as jwtSign} from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { v4 as uuidv4 } from 'uuid';
import {createUserSession} from '../Services/auth.service';


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

passport.use(new Strategy(AUTH_OPTIONS, async (accessToken, refreshToken, profile, done)=>{
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
        googleToken: accessToken
      };
      
      // Create User
      user = await new User(newUser);
      user = await user.save();
      
    }
    // JWT Token
    //token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});
  
    // createUserSession Fun Create Session and Return Token
    const token_id = uuidv4();
    const expiresIn = '7d';
    const sessionToken = await createUserSession(token_id, user, expiresIn);
    token = sessionToken
    return done(null, token, user);

  } catch (err) {

    console.log(err)
    // Log Error
    done(err);
  }
}));


// Facebook
const Fbconfig = {
  FACEBOOK_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
};

const FACEBOOK_OPTIONS = 
  {
    clientID: Fbconfig.FACEBOOK_ID,
    clientSecret: Fbconfig.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
    
};

passport.use(new FacebookStrategy(FACEBOOK_OPTIONS, async (accessToken, refreshToken, profile, done)=>{
  let user = await User.findOne({ email: profile._json.email });
  let token: string;
  
  const [firstName, lastName] = profile._json.name.split(' ');
  
  try {
    if (!user) {
      let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: profile._json.email,
        password: generatePasswordFun(),
        authByThirdParty: true,
        confirm_email: true,
        facebookToken: accessToken
      };

      // Create User
      user = await new User(newUser);
      user = await user.save();
      
    }
    // JWT Token
    //token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});
  
    // createUserSession Fun Create Session and Return Token
    const token_id = uuidv4();
    const expiresIn = '7d';
    const sessionToken = await createUserSession(token_id, user, expiresIn);
    token = sessionToken

    return done(null, token, user);

  } catch (err) {

    console.log(err)
    // Log Error
    done(err);
  }
}));


export default passport;