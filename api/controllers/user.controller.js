import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                genero: true,
                avatar: true,
                // Excluindo senha por segurança
            }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
};

export const getUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await prisma.usuario.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                genero: true,
                avatar: true,
                posts: {
                    select: {
                        id: true,
                        titulo: true,
                        preco: true,
                        img: true,
                        cidade: true,
                        estado: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
};

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const { senha, avatar, ...inputs } = req.body;

    try {
        // Validações
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        if (tokenUserId !== Number(id)) {
            return res.status(403).json({ message: 'Você não tem permissão para atualizar este usuário' });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Dados de atualização não fornecidos' });
        }

        // Validar email se estiver sendo atualizado
        if (inputs.email) {
            const existingUser = await prisma.usuario.findFirst({
                where: {
                    AND: [
                        { email: inputs.email },
                        { id: { not: Number(id) } }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Email já está em uso' });
            }
        }

        let updateData = { ...inputs };

        // Atualizar senha se fornecida
        if (senha) {
            updateData.senha = await bcrypt.hash(senha, 10);
        }

        // Atualizar avatar se fornecido
        if (avatar) {
            updateData.avatar = avatar;
        }

        const updatedUser = await prisma.usuario.update({
            where: { id: Number(id) },
            data: updateData,
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                genero: true,
                avatar: true
                // Excluindo senha
            }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
};

export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;

    try {
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        if (tokenUserId !== Number(id)) {
            return res.status(403).json({ message: 'Você não tem permissão para deletar este usuário' });
        }

        // Deletar todos os posts do usuário primeiro
        await prisma.post.deleteMany({
            where: { usuarioId: Number(id) }
        });

        // Deletar todas as mensagens do usuário
        await prisma.message.deleteMany({
            where: { usuarioId: Number(id) }
        });

        // Deletar o usuário
        await prisma.usuario.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({ message: 'Usuário e seus dados relacionados foram deletados com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
};

export const profilePosts = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const userPosts = await prisma.post.findMany({
            where: { usuarioId: tokenUserId },
            include: {
                usuario: {
                    select: {
                        nome: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const stats = {
            totalPosts: userPosts.length,
            totalValue: userPosts.reduce((acc, post) => acc + post.preco, 0),
            postsAtivos: userPosts.length // Você pode adicionar um campo 'status' no futuro
        };

        res.status(200).json({
            posts: userPosts,
            stats: stats
        });
    } catch (error) {
        console.error('Erro ao buscar posts do perfil:', error);
        res.status(500).json({ message: 'Erro ao buscar posts do perfil' });
    }
};
