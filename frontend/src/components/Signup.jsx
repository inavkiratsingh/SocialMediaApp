import React, { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {

    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    const [loading, setloading] = useState(false)

    const changeEventHandler = (e) => {
        setInput({...input, [e.target.name]: e.target.value});
    }

    const SignupHandler = async (e) => {
        e.preventDefault();
        try {
            setloading(true)
            
            
            const response = await axios.post(
                'http://localhost:8000/api/v1/user/register', 
                input, 
                {
                    headers: {
                        'content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            console.log(response);
            

            if(response.data.success){
                navigate('/login')
                toast.success(response.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                })
            }
            
        } catch (error) {
            console.log(error);  
            toast.error(error.response.data.message);          
        } finally {
            setloading(false);
        }
    }
    
    return (
        <div className='flex items-center w-screen h-screen justify-center bg-zinc-900 text-zinc-100'>
            <form onSubmit={SignupHandler} className='border border-zinc-800 rounded-lg flex flex-col gap-5 p-8'>
                <div className='my-4'>
                    <h1 className='text-center font-bold text-xl'>Logo</h1>
                    <p className='text-sm text-center'>Signup to see photos & videos from your friends.</p>
                </div>
                <div>
                    <Label className="text-zinc-400">Username</Label>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="my-2 focus-visible:ring-offset-transparent bg-zinc-800 border-zinc-800"
                    />
                </div>
                <div>
                    <Label
                    className="text-zinc-400"
                    >Email</Label>
                    <Input
                        type="text"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="my-2 focus-visible:ring-offset-transparent bg-zinc-800 border-zinc-800"
                    />
                </div>
                <div>
                    <Label
                    className="text-zinc-400"
                    >Password</Label>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="my-2 focus-visible:ring-offset-transparent bg-zinc-800 border-zinc-800"
                    />
                </div>

                {
                    loading ? 
                    (
                        <Button>
                            <Loader2 className='animate-spin mr-2 h-4 w-4' />
                            Please wait
                        </Button>
                    ) :
                    (
                        <Button 
                        className='bg-zinc-100 text-zinc-900 hover:bg-zinc-100'
                        type='submit'
                        >
                            Signup
                        </Button>
                    )
                }

                <span className='text-center'>
                    Already have an account? <Link to="/login" className='text-blue-600'>login</Link>
                </span>
            </form>
        </div>
    )
}

export default Signup