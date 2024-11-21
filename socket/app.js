import { Server } from "socket.io";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SocketServer {
    constructor() {
        console.log("Initializing socket server...");

        this.io = new Server({
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            },
            pingTimeout: 60000,
            transports: ['websocket', 'polling']
        });

        // Map to track online users: userId -> SocketData
        this.onlineUsers = new Map();

        this.setupSocketServer();
    }

    setupSocketServer() {
        this.io.on("connection", (socket) => {
            console.log(`New socket connection: ${socket.id}`);

            socket.on("newUser", (userId) => {
                console.log(`User ${userId} connected with socket ${socket.id}`);
                this.onlineUsers.set(userId.toString(), {
                    socketId: socket.id,
                    userId: userId.toString()
                });
                this.io.emit("userOnline", { userId: userId.toString() });
            });

            socket.on("sendMessage", ({ receiverId, data }) => {
                console.log(`Sending message to ${receiverId}:`, data);
                const receiverSocket = this.onlineUsers.get(receiverId.toString());

                if (receiverSocket) {
                    this.io.to(receiverSocket.socketId).emit("getMessage", data);
                    socket.emit("messageStatus", {
                        messageId: data.id,
                        status: "delivered"
                    });
                } else {
                    socket.emit("messageStatus", {
                        messageId: data.id,
                        status: "sent"
                    });
                }
            });

            socket.on("disconnect", () => {
                console.log(`Socket disconnected: ${socket.id}`);
                for (const [userId, userData] of this.onlineUsers.entries()) {
                    if (userData.socketId === socket.id) {
                        this.onlineUsers.delete(userId);
                        this.io.emit("userOffline", { userId });
                        break;
                    }
                }
            });
        });
    }

    start(port = 4000) {
        this.io.listen(port);
        console.log(`Socket server running on port ${port}`);
    }
}

// Create and start server instance
const socketServer = new SocketServer();
socketServer.start(4000);

export default socketServer;