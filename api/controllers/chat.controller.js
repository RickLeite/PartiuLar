import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: {
                        id: tokenUserId
                    }
                }
            },
            include: {
                participants: {
                    where: {
                        id: {
                            not: tokenUserId
                        }
                    },
                    select: {
                        id: true,
                        nome: true,
                        avatar: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        const formattedChats = chats.map(chat => ({
            ...chat,
            receiver: chat.participants[0],
            lastMessage: chat.messages[0]?.text || null
        }));

        res.status(200).json(formattedChats);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get chats!" });
    }
};

export const getChat = async (req, res) => {
    const tokenUserId = req.userId;
    const chatId = parseInt(req.params.id);

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: {
                        id: tokenUserId
                    }
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    },
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nome: true,
                                avatar: true
                            }
                        }
                    }
                },
                participants: {
                    where: {
                        id: {
                            not: tokenUserId
                        }
                    },
                    select: {
                        id: true,
                        nome: true,
                        avatar: true
                    }
                }
            }
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found!" });
        }

        const formattedChat = {
            ...chat,
            receiver: chat.participants[0]
        };

        res.status(200).json(formattedChat);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get chat!" });
    }
};

export const addChat = async (req, res) => {
    const tokenUserId = req.userId;
    const receiverId = parseInt(req.body.receiverId);

    if (isNaN(receiverId)) {
        return res.status(400).json({ message: "Invalid receiverId. Must be a number." });
    }

    try {
        // Check if both users exist
        const users = await prisma.usuario.findMany({
            where: {
                id: {
                    in: [tokenUserId, receiverId]
                }
            }
        });

        if (users.length !== 2) {
            return res.status(404).json({ message: "One or both users not found." });
        }

        // Check if a chat already exists between these users
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: tokenUserId } } },
                    { participants: { some: { id: receiverId } } }
                ]
            }
        });

        if (existingChat) {
            return res.status(200).json({ message: "Chat already exists", chat: existingChat });
        }

        // Create new chat
        const newChat = await prisma.chat.create({
            data: {
                participants: {
                    connect: [
                        { id: tokenUserId },
                        { id: receiverId }
                    ]
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true
                    }
                }
            }
        });

        res.status(201).json({ message: "Chat created successfully", chat: newChat });
    } catch (err) {
        console.error("Error in addChat:", err);
        res.status(500).json({ message: "Failed to add chat!", error: err.message });
    }
};

export const addMessage = async (req, res) => {
    const tokenUserId = req.userId;
    const chatId = parseInt(req.params.id);
    const { text } = req.body;

    try {
        const newMessage = await prisma.message.create({
            data: {
                text,
                chat: { connect: { id: chatId } },
                usuario: { connect: { id: tokenUserId } }
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true
                    }
                }
            }
        });

        await prisma.chat.update({
            where: { id: chatId },
            data: { lastMessage: text }
        });

        res.status(200).json(newMessage);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to add message!" });
    }
};

export const readChat = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const chat = await prisma.chat.update({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
            data: {
                seenBy: {
                    set: [tokenUserId],
                },
            },
        });
        res.status(200).json(chat);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to read chat!" });
    }
};