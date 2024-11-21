import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
    const senderId = req.userId;
    const chatId = parseInt(req.params.chatId);
    const { text } = req.body;

    try {
        // Validate chat exists and user is participant
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: {
                        id: senderId,
                    },
                },
                isActive: true,
            },
        });

        if (!chat) {
            return res.status(403).json({ message: "Access denied or chat not found" });
        }

        // Create message and update chat in transaction
        const [newMessage, _] = await prisma.$transaction([
            // Create message
            prisma.message.create({
                data: {
                    text: text.trim(),
                    senderId,
                    chatId,
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
            }),
            // Update chat
            prisma.chat.update({
                where: { id: chatId },
                data: {
                    lastMessage: text.trim(),
                    lastMessageAt: new Date(),
                },
            }),
        ]);

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Error in addMessage:", err);
        res.status(500).json({ message: "Failed to send message" });
    }
};

export const getMessages = async (req, res) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId);

    try {
        // Validate chat exists and user is participant
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
        });

        if (!chat) {
            return res.status(403).json({ message: "Access denied or chat not found" });
        }

        const messages = await prisma.message.findMany({
            where: {
                chatId,
                isDeleted: false,
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
            orderBy: {
                createdAt: 'asc',
            },
        });

        res.status(200).json(messages);
    } catch (err) {
        console.error("Error in getMessages:", err);
        res.status(500).json({ message: "Failed to get messages" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId);

    try {
        // Validate chat exists and user is participant
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
        });

        if (!chat) {
            return res.status(403).json({ message: "Access denied or chat not found" });
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

        res.status(200).json({ message: "Messages marked as read" });
    } catch (err) {
        console.error("Error in markMessagesAsRead:", err);
        res.status(500).json({ message: "Failed to mark messages as read" });
    }
};