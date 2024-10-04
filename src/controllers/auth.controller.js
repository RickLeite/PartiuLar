import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    const { nome, email, telefone, senha, genero } = req.body;

    console.log('nome:', nome);
    console.log('email:', email);
    console.log('telefone:', telefone);
    console.log('senha:', senha);
    console.log('genero:', genero);


    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const newUser = await prisma.usuario.create({
            data: { nome, email, telefone, senha: hashedPassword, genero },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.usuario.findUnique({
            where: { email: email },
        });

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.senha);

        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};