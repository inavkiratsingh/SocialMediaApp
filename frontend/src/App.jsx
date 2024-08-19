import { useEffect } from 'react'
import './App.css'
import ChatPage from './components/ChatPage'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Signup from './components/Signup'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client"
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'

const browserRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/chat',
        element: <ChatPage />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  }
])

function App() {
  const {user} = useSelector(store => store.auth);
  const {socket} = useSelector(store => store.socketio);
  const dispatch = useDispatch();
  useEffect(() => {
    if(user) {
      const socketio = io('https://socialmediaapp-1f6a.onrender.com', {
        query: {
          userId: user?._id
        },
        transports:['websocket']
      });
      dispatch(setSocket(socketio))


      //listen all the events
      socketio.on('getOnlineUsers', (onlineUsers)=> {
        dispatch(setOnlineUsers(onlineUsers))
      });


      return () => {
        socketio.close();
        dispatch(setSocket(null));

      }
    } else if(socket){
      socket.close();
      dispatch(setSocket(null));
    }
  },[user, dispatch])
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
