import sharp from "sharp"
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getRecieverSocketId } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if(!image){
            return res.status(400).json({
                message: "Image required",
                success: false
            });
        }

        //! image upload
        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width:800, height:800, fit: 'inside'})
        .toFormat('jpeg', {quality: 80})
        .toBuffer();

        //? Buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        
        const cloudResponse =  await cloudinary.uploader.upload(fileUri);

        const post  = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        const user = await User.findById(authorId);
        if(user) {
            user.post.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select:'-password'});

        return res.status(200).json({
            success: true,
            message: 'New post added',
            post
        })

    } catch (error) {
        console.log(error);
    }
};

export const getAllPost = async(req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1})
        .populate({
            path: 'author', 
            select: 'username profilePicture'
        })
        .populate({
            path:'comments', 
            sort:{createdAt: -1},
            populate:{
                path: 'author',
                select: 'username profilePicture'
            }
        });

        return res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        console.log(error);        
    }
};

export const getUSerPost = async(req,res) => {
    try {
        const authorId = req.id;
        const post = await Post.find({
            author: authorId
        })
        .sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'username, profilePicture'
        })
        .populate({
            path: 'comments',
            sort: {createdAt: -1},
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });

        return res.send(200).json({
            success: true,
            post
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const likePost = async(req, res)=>{
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({success: false, message:'Post not found'});

        await post.updateOne({$addToSet: {likes:likeKrneWalaUserKiId}});

        await post.save();

        //TODO: socket io 
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            const notification = {
                type: 'like',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            }
            const postOwnerSocketId = getRecieverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({
            success:true,
            message: 'Post liked',
        });

    } catch (error) {
        console.log(error);
        
    }
}

export const disLikePost = async(req, res)=>{
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({success: false, message:'Post not found'});

        await post.updateOne({$pull: {likes:likeKrneWalaUserKiId}});

        await post.save();

        //TODO: socket io 
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            const notification = {
                type: 'dislike',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was disliked'
            }
            const postOwnerSocketId = getRecieverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({
            success:true,
            message: 'Post Disliked',
        });

    } catch (error) {
        console.log(error);
        
    }
}

export const addComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const CommentKarneWaleUserKiId = req.id;
        const {text} = req.body;

        const post = await Post.findById(postId);
        if(!text) return res.status(400).json({success: false, message: 'text is requires'});

        const comment = await Comment.create({
            text,
            author: CommentKarneWaleUserKiId,
            post: postId
        })
        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Comment added',
            comment
        });

        
    } catch (error) {
        console.log(error);
        
    }
}

export const getCommentOfPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const comments = await comment.find({post: postId}).populate('author', 'username');

        if(!comments) return res.status(404).json({message: 'No comments found for this post', success: false});

        return res.status(200).json({success:true, comments});

    } catch (error) {
        console.log(error);        
    }
}

export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({message: 'Post not found', success: false});

        // check if logged in user is owner of post
        if(post.author.toString() !== authorId) return res.status(403).json({message: 'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // reove the post id from user post
        let user = await User.findById(authorId);
        user.post = user.post.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await comment.deleteMany({post: postId});

        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        });

    } catch (error) {
        console.log(error);        
    }
}

export const bookmarkPost = async(req,res) => {
    try {
        const postId = req.params.id;
        const authorId= req.id;
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({ message: 'Post not found', success: false});

        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            await user.updateOne({$pull: {bookmarks: post._id}});
            await user.save();

            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success: true});
        } else {
            await user.updateOne({$addToSet: {bookmarks: post._id}});
            await user.save();

            return res.status(200).json({type:'saved', message:'Post removed from bookmark', success: true});
        }
    } catch (error) {
        console.log(error);
        
    }
}