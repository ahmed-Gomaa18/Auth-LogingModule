import express, {Request, Response, NextFunction} from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import {connect as connectToDB} from './DB/Connect';

import { authRouter } from './Routes/authRouter'

dotenv.config(); 

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
})

// Router
app.use('/api/v1/auth', authRouter);

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response)=>{
    console.log(req.route);
    console.log(req.route.path);
    console.log(req.route.stack[0].name);
    return res.status(200).send('Welcome To My API');
})

server.listen(PORT, ()=>{
    console.log("Server Running on http://localhost:"+PORT);
})