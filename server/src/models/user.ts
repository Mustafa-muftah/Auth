import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [isEmail, 'Invalid email format']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phoneNumber:{
        type:Number,
        required: true,

    }
});

export const User = mongoose.model('User', userSchema);