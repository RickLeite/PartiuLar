import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
    console.log('getUsers');
    try {
        const users = await prisma.usuario.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
}

export const getUser = async (req, res) => {
    console.log('getUser');
    const id = req.params.id;
    try {
        const user = await prisma.usuario.findUnique({
            where: { id: Number(id) },
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
}

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const { senha, ...inputs } = req.body;
    // adicionar propriedade de "avatar"/"picture" para atualização de imagem de perfil

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    if (tokenUserId !== Number(id)) {
        return res.status(403).json({ message: 'Você não tem permissão para atualizar este usuário' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Dados de atualização não fornecidos' });
    }

    let updateSenha = null;
    try {

        if (senha) {
            updateSenha = await bcrypt.hash(senha, 10);
        }

        const updatedUser = await prisma.usuario.update({
            where: { id: Number(id) },
            data: {
                ...inputs,
                ...(updateSenha && { senha: updateSenha }),
                // ...(avatar && { avatar: avatar }), // para atualização de imagem de perfil
            },
        });

        const { senha: senha, ...user } = updatedUser;
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao Atualizar usuário' });
    }
}

export const deleteUser = async (req, res) => {
    console.log('deleteUser');
    const id = req.params.id;
    const tokenUserId = req.userId;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    if (tokenUserId !== Number(id)) {
        return res.status(403).json({ message: 'Você não tem permissão para deletar este usuário' });
    }

    try {
        await prisma.usuario.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
}

export const profilePosts = async (req, res) => {
    console.log('profilePosts');
    const tokenUserId = req.userId;
    try {
        const userPosts = await prisma.post.findMany({
            where: { usuarioId: tokenUserId }
        });
        res.status(200).json(userPosts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar posts do perfil' });
    }
}