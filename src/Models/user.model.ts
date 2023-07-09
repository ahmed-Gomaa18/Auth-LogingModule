import mongoose, {Schema, Document} from "mongoose";
import bcrypt, {compare} from 'bcryptjs';

// Define User Interface Schema
export interface User extends Document{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permission: string[];
    active: boolean;
    confirm_email: boolean;
    isBlocked: boolean;
    lastSeen: Date;
    singUsingGoogle: boolean,
    password: string;
    checkPasswordIsValid(password: string): boolean;
}

// Define Schema
const userSchema: Schema<User> = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true
    },
    lastName: {
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
    isBlocked: {
        type: Boolean,
        required: true,
        default: false
    },
    lastSeen: {
        type: Date
    },
    singUsingGoogle: {
        type: Boolean,
        default: false
    },
    password: {
        type: String, 
        required: true,
        //select: false}
    }
},
{ 
    timestamps: true 
});


// Add Method To Check Password Validate
userSchema.methods.checkPasswordIsValid = async function (password: string) : Promise<boolean> {
    const RES = await compare(password, this.password);

    return RES;
};


// Hash Password Pre Save
// userSchema.pre('save', async function (next) {
//     this.password = await bcrypt.hash(this.password , parseInt(process.env.SALT_ROUND));
//     next();
// });

// Create UserModel
export const UserModel = mongoose.model<User>("User", userSchema);
