import { query } from '../database.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    const { nome, email, telefone, senha, genero } = req.body;

    try {
        const userExists = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const newUser = await query(
            'INSERT INTO usuarios (nome, email, telefone, senha, genero) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, email, telefone, hashedPassword, genero]
        );

        res.status(201).json({ message: 'Usuário registrado com sucesso', user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};

export const login = (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    // VERIFICAR SE email e password ESTÃO CORRETOS
}

export const logout = (req, res) => {
    res.send('Logout');
}