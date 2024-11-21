import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { getCoordinatesFromCEP } from "../utils/geocoding.js";

const JWT_SECRET = "Ye2Xg+0h+k0kiUGoIu62jLTAoYYLTmJ5Zr0idiPSK2Y=";

export const getPosts = async (req, res) => {
    const query = req.query;
    try {
        // Limpar os filtros undefined ou vazios do AND
        const priceFilter = {};
        if (query.precoMin) priceFilter.gte = parseInt(query.precoMin);
        if (query.precoMax) priceFilter.lte = parseInt(query.precoMax);

        const posts = await prisma.post.findMany({
            where: {
                AND: [
                    query.cidade ? { cidade: query.cidade } : undefined,
                    query.estado ? { estado: query.estado } : undefined,
                    query.titulo ? {
                        titulo: {
                            contains: query.titulo,
                            mode: 'insensitive'
                        }
                    } : undefined,
                    Object.keys(priceFilter).length > 0 ? { preco: priceFilter } : undefined,
                    query.propriedade ? { propriedade: query.propriedade } : undefined
                ].filter(Boolean) // Remove undefined values
            },
            select: {
                id: true,
                titulo: true,
                preco: true,
                img: true,
                endereco: true,
                cidade: true,
                estado: true,
                latitude: true,
                longitude: true,
                tipo: true,
                propriedade: true,
                createdAt: true,
                usuarioId: true,
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Processando os posts para garantir consistência nos dados
        const processedPosts = posts.map(post => ({
            ...post,
            usuario: {
                ...post.usuario,
                id: post.usuarioId  // Garantindo que o ID do usuário está em ambos os lugares
            }
        }));

        res.status(200).json(processedPosts);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        res.status(500).json({ message: "Erro ao buscar posts" });
    }
};

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
        if (!body.titulo || !body.preco || !body.descricao || !body.endereco || !body.cidade || !body.estado || !body.cep) {
            return res.status(400).json({
                message: "Campos obrigatórios faltando",
                required: ["titulo", "preco", "descricao", "endereco", "cidade", "estado", "cep"]
            });
        }

        // Validação de preço
        const price = parseFloat(body.preco);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Preço inválido" });
        }

        // Obter coordenadas do CEP
        let coordinates = null;
        try {
            coordinates = await getCoordinatesFromCEP(body.cep);
        } catch (geoError) {
            console.warn('Erro ao obter coordenadas:', geoError);
            // Continua com a criação do post mesmo sem coordenadas
        }

        const newPost = await prisma.post.create({
            data: {
                ...body,
                preco: price,
                latitude: coordinates?.latitude || null,
                longitude: coordinates?.longitude || null,
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

        // Se não conseguiu obter coordenadas, adiciona um aviso na resposta
        const response = {
            ...newPost,
            warnings: coordinates ? undefined : ["Não foi possível obter as coordenadas exatas para o CEP informado"]
        };

        res.status(201).json(response);
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

        // Se o CEP foi atualizado, atualiza as coordenadas
        let coordinates = null;
        if (body.cep) {
            coordinates = await getCoordinatesFromCEP(body.cep);
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                ...body,
                latitude: coordinates?.latitude || undefined,
                longitude: coordinates?.longitude || undefined,
                usuarioId: undefined,
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