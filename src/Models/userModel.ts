import mongoose, {Schema, Document} from "mongoose";
import bcrypt from 'bcryptjs';

// Define User Interface Schema
export interface User extends Document{
    name: string;
    email: string;
    role: string;
    permission: string[];
    active: boolean;
    confirm_email: boolean;
    password: string;
}

// Define Schema
const userSchema: Schema<User> = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: [true, 'email is required'], 
        match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address'], 
        unique: true
    },
    role: {
        type: String, 
        default: 'User', 
        required: true, 
        enum: ['Admin', 'User']
    },
    permission: [
        { 
            type: String 
        }
    ],
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    confirm_email: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {
        type: String, 
        required: true, 
        select: false}
},
{ 
    timestamps: true 
});

// Hash Password Pre Save
// userSchema.pre('save', async function (next) {
//     this.password = await bcrypt.hash(this.password , parseInt(process.env.SALT_ROUND));
//     next();
// });

// Create UserModel
export const UserModel = mongoose.model<User>("User", userSchema);
