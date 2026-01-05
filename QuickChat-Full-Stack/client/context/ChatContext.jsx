import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    // Keep a local list of hidden/unfriended users (persisted)
    const [hiddenFriends, setHiddenFriends] = useState(()=> {
        try { return JSON.parse(localStorage.getItem("hiddenFriends") || "[]") } catch { return [] }
    });

    // savedVisibleIds: null = no saved preference yet; [] = intentionally saved empty list
    const [savedVisibleIds, setSavedVisibleIds] = useState(() => {
        const raw = localStorage.getItem("savedVisibleUsers");
        return raw === null ? null : JSON.parse(raw);
    });

    // Persist hiddenFriends to localStorage
    useEffect(()=> {
        localStorage.setItem("hiddenFriends", JSON.stringify(hiddenFriends));
    }, [hiddenFriends]);

    // Persist savedVisibleIds (including explicit empty array)
    useEffect(()=> {
        if (savedVisibleIds === null) return; // do not write key if user never saved preferences
        localStorage.setItem("savedVisibleUsers", JSON.stringify(savedVisibleIds));
    }, [savedVisibleIds]);

    const {socket, axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async () =>{
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                // If user had an explicit saved visible list, use it (this preserves explicit empty list).
                let visibleUsers;
                if (savedVisibleIds !== null) {
                    visibleUsers = data.users.filter(u => savedVisibleIds.includes(u._id));
                } else {
                    // fallback to previous hiddenFriends behavior
                    visibleUsers = data.users.filter(u => !hiddenFriends.includes(u._id));
                }

                setUsers(visibleUsers);
                // also remove unseen entries for users not visible
                const visibleIds = new Set(visibleUsers.map(u => u._id));
                const filteredUnseen = Object.fromEntries(
                    Object.entries(data.unseenMessages || {}).filter(([k]) => visibleIds.has(k))
                );
                setUnseenMessages(filteredUnseen)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to get messages for selected user
    const getMessages = async (userId)=>{
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to send message to selected user
    const sendMessage = async (messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to subscribe to messages for selected user
    const subscribeToMessages = async () =>{
        if(!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=> [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    // function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    },[socket, selectedUser])

    // remove a friend locally (hide and persist)
    const removeFriend = (userId)=>{
        if(!userId) return;
        setHiddenFriends(prev => prev.includes(userId) ? prev : [...prev, userId]);
        // Update users list immediately and persist the visible IDs (this will write even when result is [])
        const newUsers = users.filter(u => u._id !== userId);
        setUsers(newUsers);
        setUnseenMessages(prev => {
            const copy = {...prev};
            delete copy[userId];
            return copy;
        });
        if (selectedUser?._id === userId) setSelectedUser(null);
        // Persist the current visible user ids; an empty array is intentionally saved
        setSavedVisibleIds(newUsers.map(u => u._id));
    }

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
        , removeFriend
    }

    return (
    <ChatContext.Provider value={value}>
            { children }
    </ChatContext.Provider>
    )
}