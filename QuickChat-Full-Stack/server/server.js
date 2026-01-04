import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;
    
    // Emit online users to all connected clients (full list)
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Also emit an incremental event so clients don't miss updates
    if (userId) io.emit("userConnected", userId);

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        // Emit updated list and an incremental disconnect event
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
        if (userId) io.emit("userDisconnected", userId);
    })
})

// Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors());


// Routes setup
app.use("/api/status", (req, res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)


// Connect to MongoDB
await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, ()=> console.log("Server is running on PORT: " + PORT));
}

// Export server for Vervel
export default server;
