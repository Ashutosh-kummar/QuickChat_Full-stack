import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from "socket.io-client"


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children })=>{

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

// Login function to handle user authentication and socket connection

const login = async (state, credentials)=>{
    try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        if (data.success){
            setAuthUser(data.userData);
            connectSocket(data.userData);
            axios.defaults.headers.common["token"] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token)
            toast.success(data.message)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

// Logout function to handle user logout and socket disconnection

    const logout = async () =>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully")
        if (socket) {
            // remove listeners and disconnect to avoid stale handlers
            socket.off("getOnlineUsers");
            socket.off("userConnected");
            socket.off("userDisconnected");
            socket.off("connect");
            socket.disconnect();
        }
        setSocket(null);
    }

    // Update profile function to handle user profile updates

    const updateProfile = async (body)=>{
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        // Create socket without auto-connecting so we can register listeners first
        const newSocket = io(backendUrl, {
            query: { userId: userData._id },
            autoConnect: false
        });

        // Register listeners before connecting to avoid missing the initial broadcast
        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUsers(userIds);
        });

        // Incremental presence updates so already-connected clients update immediately
        newSocket.on("userConnected", (userId)=>{
            setOnlineUsers(prev => {
                if (!userId) return prev;
                return prev.includes(userId) ? prev : [...prev, userId];
            });
        });

        newSocket.on("userDisconnected", (userId)=>{
            setOnlineUsers(prev => prev.filter(id => id !== userId));
        });

        // Establish connection after listeners are attached
        newSocket.connect();
        setSocket(newSocket);
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}