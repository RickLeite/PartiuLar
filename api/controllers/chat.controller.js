import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
    const userId = req.userId;

    try {
        const chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: {
                        id: userId,
                    },
                },
                isActive: true,
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                lastMessageAt: 'desc',
            },
        });

        // Process chats to add receiver information
        const processedChats = chats.map(chat => {
            const receiver = chat.participants.find(p => p.id !== userId);
            return {
                id: chat.id,
                createdAt: chat.createdAt,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                receiver: receiver || null,
                unreadCount: 0, // Will be updated below
            };
        });

        // Get unread message counts
        for (let chat of processedChats) {
            const unreadCount = await prisma.message.count({
                where: {
                    chatId: chat.id,
                    senderId: chat.receiver.id,
                    readAt: null,
                },
            });
            chat.unreadCount = unreadCount;
        }

        res.status(200).json(processedChats);
    } catch (err) {
        console.error("Error in getChats:", err);
        res.status(500).json({ message: "Failed to get chats" });
    }
};

export const getChat = async (req, res) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.id);

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: {
                        id: userId,
                    },
                },
                isActive: true,
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                nome: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                chatId,
                senderId: { not: userId },
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });

        // Process chat data
        const receiver = chat.participants.find(p => p.id !== userId);
        const processedChat = {
            ...chat,
            receiver,
        };

        res.status(200).json(processedChat);
    } catch (err) {
        console.error("Error in getChat:", err);
        res.status(500).json({ message: "Failed to get chat" });
    }
};

export const addChat = async (req, res) => {
    const userId = req.userId;
    const { receiverId } = req.body;

    try {
        // Check if chat already exists
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                    {
                        participants: {
                            some: {
                                id: receiverId,
                            },
                        },
                    },
                ],
                isActive: true,
            },
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // Create new chat
        const newChat = await prisma.chat.create({
            data: {
                participants: {
                    connect: [
                        { id: userId },
                        { id: receiverId },
                    ],
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true,
                    },
                },
            },
        });

        const receiver = newChat.participants.find(p => p.id !== userId);
        const processedChat = {
            ...newChat,
            receiver,
        };

        res.status(201).json(processedChat);
    } catch (err) {
        console.error("Error in addChat:", err);
        res.status(500).json({ message: "Failed to create chat" });
    }
};

export const readChat = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
            include: {
                participants: true,
            },
        });

        if (!chat.participants.some((user) => user.id === tokenUserId)) {
            return res.status(403).json({ message: "Access denied!" });
        }

        res.status(200).json(chat);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to read chat!" });
    }
};