import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
    console.log("getPosts");
    try {
        const posts = await prisma.post.findMany();
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar posts" });
    }
}

export const getPost = async (req, res) => {
    console.log("getPost");
    const id = req.params.id;
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                usuario: {
                    select: {
                        nome: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar post" });
    }
}

export const addPost = async (req, res) => {
    console.log("addPost");
    const body = req.body;
    const tokenUserId = req.userId;

    console.log("tokenUserId:", tokenUserId);

    try {
        const newPost = await prisma.post.create({
            data: {
                ...body,
                usuarioId: tokenUserId,
            },
        });
        res.status(200).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao adicionar post" });
    }
}

export const updatePost = async (req, res) => {
    console.log("updatePost");
    const id = req.params.id;
    const tokenUserId = req.userId;
    const body = req.body;
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
        });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        if (post.usuarioId !== tokenUserId) {
            return res.status(403).json({ message: "Você não tem permissão para atualizar este post" });
        }

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: body,
        });

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar post" });
    }
}

export const deletePost = async (req, res) => {
    console.log("deletePost");
    const id = req.params.id;
    const tokenUserId = req.userId;
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
        });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        if (post.usuarioId !== tokenUserId) {
            return res.status(403).json({ message: "Você não tem permissão para deletar este post" });
        }

        await prisma.post.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: "Post deletado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar post" });
    }
}