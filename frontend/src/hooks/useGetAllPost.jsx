import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetAllPost = () => {
    
    const dispatch = useDispatch();
    useEffect(() => {
        console.log("post");
        
        const fetchAllPost = async () => {
            try {
                const res = await axios.get('https://socialmediaapp-1f6a.onrender.com//api/v1/post/all', { withCredentials: true });
                
                if (res.data.success) { 
                    console.log(res.data.posts);
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    }, []);
};
export default useGetAllPost;