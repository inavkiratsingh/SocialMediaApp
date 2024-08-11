import React, { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import axios from 'axios'

const Login = () => {

    const [input, setInput] = useState({
        email: "",
        password: ""
    })

    const [loading, setloading] = useState(false)

    const changeEventHandler = (e) => {
        setInput({...input, [e.target.name]: e.target.value});
    }

    const SignupHandler = async (e) => {
        e.preventDefault();
        try {
            setloading(true)
            
            
            const response = await axios.post(
                'http://localhost:8000/api/v1/user/login', 
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
                toast.success(response.data.message);
                setInput({
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
                    <p className='text-sm text-center'>Login to see photos & videos from your friends.</p>
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
                <Button 
                className='bg-zinc-100 text-zinc-900'
                type='submit'
                >
                    Login
                </Button>
                <span className='text-center'>
                    Don't have an account? <Link to="/signup" className='text-blue-600'>Signup</Link>
                </span>
            </form>
        </div>
    )
}

export default Login