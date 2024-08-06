import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req,res) => {
    try {
        const {username, email, password} = req.body;
        
        if(!username || !email || !password) {
            return Response.status(401).json({
                message: "Something is missing Please check!",
                success: false
            });
        }

        const user = await User.findOne({ email });

        if(user) {
            return Response.status(401).json({
                message: "Try different email",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.create({
            username,
            email,
            password: hashedPassword
        });


        return Response.status(201).json({
            message: "Account created successfully.",
            success: false
        });

    } catch (error) {
        console.log(error);        
    }
};


export const login = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return Response.status(401).json({
                message: "Something is missing Please check!",
                success: false
            });
        }

        let user = await User.findOne({ email })
        if(!user) {
            return Response.status(401).json({
                message: "Invalid email or password!",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch) {
            return Response.status(401).json({
                message: "Invalid email or password!",
                success: false
            });
        }

        
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        }
        
        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: '2d'});


        return res.cookie('token',token,{httpOnly: true, sameSite: 'strict', maxAge: 2*24*60*60*1000}).json({
            message: `Welcome ${user.username}`,
            success: true,
            user
        });

        
    } catch (error) {
        console.log(error);        
    }
};

export const logout = async(_,res) => {
    try {
        return res.cookit('token', '', {maxAge: 0}).json({
            message: 'Logged out successfully.',
            success: true,
        });
    } catch (error) {
        console.log(error);        
    }
};

export const getProfile = async(req,res) => {
    try {
        const userId = req.params.id;
        let user = await user.findById(userId);
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);        
    }
};

export const editProfile = async (req,res) => {
    try {
        const userId = req.id;
        let cloudResponse 
    } catch (error) {
        console.log(error);        
    }
}