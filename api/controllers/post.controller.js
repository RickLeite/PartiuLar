import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "Ye2Xg+0h+k0kiUGoIu62jLTAoYYLTmJ5Zr0idiPSK2Y=";

export const getPosts = async (req, res) => {
    const query = req.query;
    try {
        const posts = await prisma.post.findMany({
            where: {
                AND: [
                    query.cidade ? { cidade: query.cidade } : {},
                    query.estado ? { estado: query.estado } : {},
                    query.titulo ? {
                        titulo: {
                            contains: query.titulo,
                            mode: 'insensitive'
                        }
                    } : {},
                    {
                        preco: {
                            gte: query.precoMin ? parseInt(query.precoMin) : undefined,
                            lte: query.precoMax ? parseInt(query.precoMax) : undefined,
                        }
                    },
                    query.propriedade ? { propriedade: query.propriedade } : {}
                ]
            },
            include: {
                usuario: {
                    select: {
                        nome: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        res.status(500).json({ message: "Erro ao buscar posts" });
    }
};

// Exemplo de URL com filtros
//GET / api / posts ? cidade = Campinas & precoMin=500 & precoMax=1000 & titulo=republica

export const getPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true,
                        telefone: true,
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        // Get user ID from token if present
        let userId = null;
        const token = req.cookies?.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.error("Erro ao verificar token:", err);
            }
        }

        // Adiciona informação se o post pertence ao usuário logado
        const response = {
            ...post,
            isOwner: userId === post.usuarioId
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Erro ao buscar post:", error);
        res.status(500).json({ message: "Erro ao buscar post" });
    }
};

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;

    try {
        // Validação básica
        if (!body.titulo || !body.preco || !body.descricao || !body.endereco || !body.cidade || !body.estado) {
            return res.status(400).json({
                message: "Campos obrigatórios faltando",
                required: ["titulo", "preco", "descricao", "endereco", "cidade", "estado"]
            });
        }

        // Validação de preço
        const price = parseFloat(body.preco);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Preço inválido" });
        }

        // Validação de latitude e longitude
        const latitude = parseFloat(body.latitude);
        const longitude = parseFloat(body.longitude);
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ message: "Latitude ou longitude inválida" });
        }

        const newPost = await prisma.post.create({
            data: {
                ...body,
                preco: price, // Use the parsed price
                latitude: latitude, // Use the parsed latitude
                longitude: longitude, // Use the parsed longitude
                usuarioId: tokenUserId,
                createdAt: new Date(),
            },
            include: {
                usuario: {
                    select: {
                        nome: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).json({ message: "Erro ao criar post" });
    }
};

export const updatePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const tokenUserId = req.userId;
        const body = req.body;

        // Validate if postId is a valid number
        if (isNaN(postId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        if (post.usuarioId !== tokenUserId) {
            return res.status(403).json({ message: "Você não tem permissão para atualizar este post" });
        }

        // Validate price if it's being updated
        if (body.preco !== undefined) {
            const price = parseFloat(body.preco);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({ message: "Preço inválido" });
            }
            body.preco = price;
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                ...body,
                usuarioId: undefined, // Prevent these fields from being updated
                createdAt: undefined,
            },
            include: {
                usuario: {
                    select: {
                        nome: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Erro ao atualizar post:", error);
        res.status(500).json({ message: "Erro ao atualizar post" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const tokenUserId = req.userId;

        // Validate if postId is a valid number
        if (isNaN(postId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        if (post.usuarioId !== tokenUserId) {
            return res.status(403).json({ message: "Você não tem permissão para deletar este post" });
        }

        await prisma.post.delete({
            where: { id: postId }
        });

        res.status(200).json({ message: "Post deletado com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar post:", error);
        res.status(500).json({ message: "Erro ao deletar post" });
    }
};