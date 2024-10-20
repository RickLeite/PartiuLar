import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
    const tokenUserId = req.userId;
    const chatId = parseInt(req.params.chatId);
    const { text } = req.body;

    if (isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chatId. Must be a number." });
    }

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
                participants: true
            }
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found or you're not a participant!" });
        }


        const message = await prisma.message.create({
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

        res.status(201).json(message);
    } catch (err) {
        console.error("Error in addMessage:", err);
        res.status(500).json({ message: "Failed to add message!", error: err.message });
    }
};