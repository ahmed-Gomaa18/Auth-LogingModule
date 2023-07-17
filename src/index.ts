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
// Routers
import { authRouter } from './Routes/auth.router';
import { thirdPartyRouter } from './Routes/thirdPartyCallback.route';
import { adminRouter } from './Routes/admin.router';


import defaultErrorHandler from './Utils/defaultErrorHandler';



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
   
})
// Handle UnhandledRejection Exception 
process.on("unhandledRejection", (exception)=>{
    console.log(exception)
    console.log("Promise Rejection");


});

// Callback Third Party
app.use('/auth', thirdPartyRouter);

// Dashboard Router
app.use('/api/v1/admin', adminRouter);

// Router
app.use('/api/v1/auth', authRouter);

//
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Handle non-existent endpoints
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'This Endpoint not found' });
});

app.use(defaultErrorHandler);

server.listen(PORT, ()=>{
    console.log("Server Running on http://localhost:"+PORT);
})