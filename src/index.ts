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
import { googleRouter } from './Routes/google.router';
import { collectEndpoints } from './Utils/getEndpoints';
import defaultErrorHandler from './Utils/defaultErrorHandler';



const app = express();

// Connection to Database
connectToDB()

app.use(cors({
    credentials : true,
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

// Callback Google
app.use('/auth', googleRouter);

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



app.use(defaultErrorHandler);

server.listen(PORT, ()=>{
    console.log("Server Running on http://localhost:"+PORT);
})