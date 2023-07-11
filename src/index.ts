import express, {Request, Response, NextFunction, Router} from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); 
import passport from './Config/passport';
import {connect as connectToDB} from './DB/connect.db';

import { authRouter } from './Routes/auth.router';
import { thirdPartyRouter } from './Routes/thirdPartyCallback.route';
import { collectEndpoints } from './Utils/getEndpoints';
import defaultErrorHandler from './Utils/defaultErrorHandler';

//test Remove
import { calculateExpirationDate } from './Config/calculateExpirationDate';
import {verify as jwtVerify} from 'jsonwebtoken';


const app = express();

// Connection to Database
connectToDB()

app.use(cors({
    credentials : true,
    origin: [process.env.CLIENT_URL]
}));

app.use(compression());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());

// For Unexcepted Error
// Handel UncaughtException Exception 
process.on("uncaughtException", (exception)=>{
    console.log(exception)
    console.log("Error From uncaughtException");
    // process.exit(1);
})
// Handel UnhandledRejection Exception 
process.on("unhandledRejection", (exception)=>{
    console.log(exception)
    console.log("Promise Rejection");

    // process.exit(1);
});

// Callback Third Party
app.use('/auth', thirdPartyRouter);

// Router
app.use('/api/v1/auth', authRouter);

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;



//app.get('/', async(req: Request, res: Response)=>{
//     req.user = {userId: "asdadads", auth: true};
//     console.log(req.route);
//     console.log(req.route.path);
//     console.log(req.route.stack[0].name);
//     console.log(req.user.username);

//     console.log(collectEndpoints());
    
//     return res.status(200).send('Welcome To My API' + req.user );
// })


// app.get('/', async(req: Request, res: Response)=>{
    
//     const expireD = '24h';
//     console.log(calculateExpirationDate(expireD))
//     console.log(Date.now());
    
//     return res.status(200).send('Welcome To My API');
// })

// app.get('/', async(req: Request, res: Response)=>{
    
//     const decoded = await jwtVerify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YWMwZDYxYTkxNDk2ZmM1ZWVhZjQ2NyIsInJvbGUiOiJVc2VyIiwicGVybWlzc2lvbiI6W10sInRva2VuX2lkIjoiMWI4NGUzYTktZjBmZC00M2I1LTg0NjMtZjc2MTc3OGFiYTZhIiwiaWF0IjoxNjg4OTk3NzA1LCJleHAiOjE2ODk2MDI1MDV9.vDT4SuB_EQVSZRcbfHDB8xxsMqwKcr4IBfM0pQgfOsA" , process.env.TOKEN_SIGNATURE);
//     console.log(decoded);
    
//     return res.status(200).send('Welcome To My API');
// })


app.use(defaultErrorHandler);

server.listen(PORT, ()=>{
    console.log("Server Running on http://localhost:"+PORT);
})