import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 108000,// this is the expiry time in seconds -- 30 minutes
    },
});

const Token = mongoose.model('token', tokenSchema);
export default Token;