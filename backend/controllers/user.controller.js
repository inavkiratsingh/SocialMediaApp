import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import nodemon from "nodemon";

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
            return res.status(401).json({
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


        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);        
    }
};


export const login = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(401).json({
                message: "Something is missing Please check!",
                success: false
            });
        }

        let user = await User.findOne({ email })
        if(!user) {
            return res.status(401).json({
                message: "Invalid email or password!",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid email or password!",
                success: false
            });
        }

        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: '2d'});


        const populatedPosts = await Promise.all(
            user.post.map(async (postId) => {
                const post = await Post.findById(postId);
                
                if(post?.author.equals(user._id)){
                    
                    return post;
                } 
                return null;
            })
        )
        
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        

        return res.cookie('token',token,{httpOnly: true, sameSite: 'strict', maxAge: 2*24*60*60*1000}).json({
            message: `Welcome ${user.username}`,
            success: true,
            user
        });

        
    } catch (error) {
        console.log(error);        
    }
};

export const logout = async(req,res) => {
    console.log("log");
    
    try {
        return res.cookie('token', '', {maxAge: 0}).json({
            message: 'Logged out successfully.',
            success: true,
        });
    } catch (error) {
        console.log(error);        
    }
};

export const getProfile = async(req,res) => {
    try {
        console.log("hello getprofile");
        
        const userId = req.params.id;
        let user = await User.findById(userId).select('-password');
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
        const {bio, gender} = req.body;
        const profilePicture = req.file;
        
        let cloudResponse;
        if(profilePicture){
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password')
        if(!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if(bio) user.bio = bio;
        if(gender) user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;
        
        await user.save();
    
        return res.status(200).json({
            message: "Profile updated",
            success: true,
            user
        })

    } catch (error) {
        console.log(error);        
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUser = await User.find({ _id: {
            $ne: req.id
        } }).select("-password");
        if(!suggestedUser){
            return res.status(400).json({
                message: 'Currently do not have any users'
            })
        }

        return res.status(200).json({
            success: true,
            users: suggestedUser
        })
    } catch (error) {
        console.log(error);        
    }
};


export const followOrUnfollow = async(req, res) => {
    try {
        const followKrneWala = req.id;
        const jiskoFollowKarunga = req.params.id;
        if(followKrneWala === jiskoFollowKarunga) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow or unfollow each other"
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKarunga);

        if(!user || !targetUser) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const isFollowing = user.following.includes(jiskoFollowKarunga);
        if(isFollowing){
            await Promise.all([
                User.updateOne({ _id:followKrneWala },{ $pull: {following: jiskoFollowKarunga}}),
                User.updateOne({ _id: jiskoFollowKarunga }, {$pull : { followers: followKrneWala}})
            ]);

            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully"
            });
        }else {
            await Promise.all([
                User.updateOne({ _id:followKrneWala },{ $push: {following: jiskoFollowKarunga}}),
                User.updateOne({ _id: jiskoFollowKarunga }, {$push : { followers: followKrneWala}})
            ]);

            return res.status(200).json({
                success: true,
                message: "Followed successfully"
            });
        }
    } catch (error) {
        console.log(error);
    }
}