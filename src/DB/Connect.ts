import mongoose from 'mongoose';

export const connect = ()=>{
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.DB_URL, {
    }).then(()=>{console.log("Database Connected....")})
    .catch((err: Error)=>{console.log(err)});
}
