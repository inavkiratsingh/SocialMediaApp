import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent } from './ui/dialog'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { toast } from 'sonner'

const Post = ({post}) => {
    const [text, setText] = useState("");
    const [open, setopen] = useState(false);
    const {user} = useSelector(store => store.auth);
    const {posts} = useSelector(store => store.post);
    const dispatch = useDispatch();
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`https://socialmediaapp-1f6a.onrender.com/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            console.log("comment");
            
            const res = await axios.post(`https://socialmediaapp-1f6a.onrender.com/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.res.data.message)
        }
    }

    const deletePostHandler = async () => {
        try {
            console.log(post?._id);
            
            const res = await axios.delete(`https://socialmediaapp-1f6a.onrender.com/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.res.data.messsage);
        }
    }

  return (
        <div className='my-8 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Avatar>
                        <AvatarImage src={post.author.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1>{post.author.username}</h1>
                       {/* {user?._id === post.author._id &&  <Badge variant="secondary">Author</Badge>} */}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer'/>
                        
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {/* { */}
                        // post?.author?._id !== user?._id && 
                        <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                        {/* // } */}
                        
                        <Button variant='ghost' className="cursor-pointer w-fit">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && 
                            <Button 
                            onClick={deletePostHandler} 
                            variant='ghost' 
                            className="cursor-pointer w-fit">
                                Delete
                            </Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img
                className='rounded-sm my-2 w-full aspect-square object-cover'
                src={post.image}
                alt="post_img"
            />

            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                    }
                    <MessageCircle  
                    onClick={() => {
                        dispatch(setSelectedPost(post));
                        setopen(true);
                    }} className='cursor-pointer hover:text-gray-600' />
                    <Send className='cursor-pointer hover:text-gray-600' />
                    
                </div>
                <Bookmark className='cursor-pointer hover:text-gray-600' />
            </div>
            <span className='font-medium block mb-2'>{postLike} likes</span>
            <p>
                <span className='font-medium mr-2'>{post.author.username}</span>
                {post.caption}
            </p>
            <span  
            onClick={() => {
                dispatch(setSelectedPost(post));
                setopen(true);
            }} 
            className='cursor-pointer text-sm text-gray-400'>View all {comment.length} comments</span>
            <CommentDialog open={open} setOpen={setopen} />

            <div className='flex items-center justify-between'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full'
                />
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                }
            </div>
        </div>
  )
}

export default Post