import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    const { nome, email, telefone, senha, genero } = req.body;

    console.log('req.body:', req.body);
    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const newUser = await prisma.usuario.create({
            data: { nome, email, telefone, senha: hashedPassword, genero },
        });
        res.status(201).json(newUser);

        console.log('newUser:', newUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};

export const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
    }

    try {
        const user = await prisma.usuario.findUnique({
            where: { email: email },
        });

        console.log('user:', user);

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        const age = 60 * 60 * 24 * 7; // 1 week de tempo de vida do cookie

        const token = jwt.sign({
            id: user.id
        }, "Ye2Xg+0h+k0kiUGoIu62jLTAoYYLTmJ5Zr0idiPSK2Y=", {
            expiresIn: age,
        });

        res.cookie("token", token, { httpOnly: true, maxAge: age })
            .status(200)
            .json({usuario: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

export const logout = async (req, res) => {
    res.clearCookie('token').json({ message: 'Logout bem-sucedido' });
}