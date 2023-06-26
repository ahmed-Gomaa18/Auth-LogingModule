import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import {connect as connectToDB} from './DB/Connect';

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

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
    console.log("Server Running on http://localhost:" + PORT + "/");
})