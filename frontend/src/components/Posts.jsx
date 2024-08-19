import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
import useGetAllPost from '@/hooks/useGetAllPost'

export const Posts = () => {
  useGetAllPost();
  const {posts,selectedPost} = useSelector(store => store.post);
  console.log(posts);
  
  
  return (
    posts.map((post) => <Post key={post._id} post={post} />)
    // <div></div>
  )
}
