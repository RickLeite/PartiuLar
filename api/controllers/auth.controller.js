import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Chave fixa para demo
const JWT_SECRET = "Ye2Xg+0h+k0kiUGoIu62jLTAoYYLTmJ5Zr0idiPSK2Y=";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias em milliseconds

export const register = async (req, res) => {
    const { nome, email, telefone, senha, genero } = req.body;

    try {
        // Validação básica
        if (!nome || !email || !telefone || !senha || !genero) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Verifica se usuário já existe
        const existingUser = await prisma.usuario.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria novo usuário
        const newUser = await prisma.usuario.create({
            data: {
                nome,
                email,
                telefone,
                senha: hashedPassword,
                genero
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                genero: true,
                avatar: true
            }
        });

        return res.status(201).json({
            message: 'Usuário registrado com sucesso',
            usuario: newUser
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};

export const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        const user = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const isValidPassword = await bcrypt.compare(senha, user.senha);

        if (!isValidPassword) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove a senha do objeto do usuário
        const { senha: _, ...userWithoutPassword } = user;

        // Cookie simples mas seguro
        res.cookie('token', token, {
            maxAge: COOKIE_MAX_AGE,
            path: '/'
        });

        return res.status(200).json({
            usuario: userWithoutPassword,
            token: token // Incluindo o token na resposta
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro ao realizar login' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', { path: '/' });
        return res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Erro no logout:', error);
        return res.status(500).json({ message: 'Erro ao realizar logout' });
    }
};